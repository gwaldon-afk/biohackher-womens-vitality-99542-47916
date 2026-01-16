import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Sparkles, AlertCircle, Layers, Rocket, Loader2, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { fetchExistingItemsMap, fetchExistingItemsSet, normalizeItemName } from '@/utils/protocolDuplicateCheck';
import { upsertProtocolItemSources } from '@/services/protocolItemSources';

export interface ProtocolItem {
  name: string;
  description: string;
  dosage?: string;
  category: 'immediate' | 'foundation' | 'optimization';
}

export interface ProtocolData {
  immediate: ProtocolItem[];
  foundation: ProtocolItem[];
  optimization: ProtocolItem[];
}

interface InlineProtocolPreviewProps {
  protocolData: ProtocolData;
  sourceType: 'lis' | 'nutrition' | 'hormone_compass' | 'symptom';
  sourceAssessmentId: string;
  onProtocolSaved?: () => void;
}

export const InlineProtocolPreview = ({
  protocolData,
  sourceType,
  sourceAssessmentId,
  onProtocolSaved
}: InlineProtocolPreviewProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [selectedItems, setSelectedItems] = useState<ProtocolItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [existingItems, setExistingItems] = useState<Set<string>>(new Set());

  // Map category to item_type for duplicate checking
  const itemTypeMap: Record<string, string> = {
    'immediate': 'habit',
    'foundation': 'supplement',
    'optimization': 'supplement'
  };

  // Get all items as a flat array
  const allItems = [
    ...protocolData.immediate,
    ...protocolData.foundation,
    ...protocolData.optimization
  ];

  // Pre-select immediate items and check for existing items
  useEffect(() => {
    if (!user) return;
    
    // Pre-select immediate items by default (excluding duplicates - will be filtered after existingItems loads)
    setSelectedItems(protocolData.immediate);

    // Fetch existing items using centralized utility (checks name + type)
    const loadExistingItems = async () => {
      const existingSet = await fetchExistingItemsSet(user.id);
      setExistingItems(existingSet);
      
      // Re-filter selected items to exclude duplicates
      const nonDuplicateImmediate = protocolData.immediate.filter(item => {
        const itemType = itemTypeMap[item.category] || 'supplement';
        const key = `${normalizeItemName(item.name)}|${itemType}`;
        return !existingSet.has(key);
      });
      setSelectedItems(nonDuplicateImmediate);
    };
    
    loadExistingItems();
  }, [user, protocolData.immediate]);

  const toggleItem = (item: ProtocolItem) => {
    setSelectedItems(prev => {
      const isSelected = prev.some(i => i.name === item.name);
      if (isSelected) {
        return prev.filter(i => i.name !== item.name);
      }
      return [...prev, item];
    });
  };

  const selectAll = () => {
    const nonDuplicates = allItems.filter(item => !isItemDuplicate(item));
    setSelectedItems(nonDuplicates);
  };

  const clearSelection = () => {
    setSelectedItems([]);
  };

  const isItemSelected = (item: ProtocolItem) => {
    return selectedItems.some(i => i.name === item.name);
  };

  const isItemDuplicate = (item: ProtocolItem) => {
    const itemType = itemTypeMap[item.category] || 'supplement';
    const key = `${normalizeItemName(item.name)}|${itemType}`;
    return existingItems.has(key);
  };

  const handleSaveToProtocol = async () => {
    if (!user || selectedItems.length === 0) return;

    setSaving(true);
    try {
      // Get or create active protocol
      let { data: existingProtocol } = await supabase
        .from('protocols')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1)
        .single();

      let protocolId = existingProtocol?.id;

      if (!protocolId) {
        const { data: newProtocol, error: protocolError } = await supabase
          .from('protocols')
          .insert({
            user_id: user.id,
            name: t('inlineProtocol.defaultProtocolName'),
            description: t('inlineProtocol.defaultProtocolDesc'),
            source_type: sourceType,
            is_active: true
          })
          .select()
          .single();

        if (protocolError) throw protocolError;
        protocolId = newProtocol.id;
      }

      // Map category to item_type
      const itemTypeMapForInsert: Record<string, 'habit' | 'supplement' | 'exercise' | 'diet' | 'therapy'> = {
        'immediate': 'habit',
        'foundation': 'supplement',
        'optimization': 'supplement'
      };

      const existingItemsMap = await fetchExistingItemsMap(user.id);
      // Filter out duplicates using the already-loaded existingItems set
      const newItems = selectedItems.filter(item => !isItemDuplicate(item));
      const duplicateItems = selectedItems.filter(item => isItemDuplicate(item));

      if (newItems.length === 0) {
        const duplicateIds = duplicateItems
          .map((item) => {
            const key = `${normalizeItemName(item.name)}|${itemTypeMapForInsert[item.category] || 'supplement'}`;
            return existingItemsMap.get(key);
          })
          .filter((id): id is string => !!id);

        if (duplicateIds.length > 0) {
          await upsertProtocolItemSources({
            userId: user.id,
            protocolItemIds: duplicateIds,
            source: {
              sourceType,
              sourceAssessmentId,
            },
          });
        }

        toast({
          title: t('protocol.allDuplicates'),
          description: t('protocol.allDuplicatesDesc'),
        });
        setSaving(false);
        return;
      }

      // Save to protocol_recommendations for "What To Do Next"
      const { data: recommendation, error: recommendationError } = await supabase
        .from('protocol_recommendations')
        .insert({
          user_id: user.id,
          source_assessment_id: sourceAssessmentId,
          source_type: sourceType,
          protocol_data: protocolData as any,
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (recommendationError) throw recommendationError;

      const protocolItems = newItems.map(item => ({
        protocol_id: protocolId,
        name: item.name,
        description: item.description,
        dosage: item.dosage || null,
        frequency: 'daily' as const,
        time_of_day: ['morning'],
        item_type: itemTypeMapForInsert[item.category] || 'supplement',
        category: item.category,
        display_order: 0
      }));

      const { data: insertedItems, error: itemsError } = await supabase
        .from('protocol_items')
        .insert(protocolItems)
        .select('id');

      if (itemsError) throw itemsError;

      const insertedIds = insertedItems?.map((item) => item.id) || [];
      await upsertProtocolItemSources({
        userId: user.id,
        protocolItemIds: insertedIds,
        source: {
          sourceType,
          sourceAssessmentId,
          sourceRecommendationId: recommendation.id,
        },
      });

      if (duplicateItems.length > 0) {
        const duplicateIds = duplicateItems
          .map((item) => {
            const key = `${normalizeItemName(item.name)}|${itemTypeMapForInsert[item.category] || 'supplement'}`;
            return existingItemsMap.get(key);
          })
          .filter((id): id is string => !!id);

        if (duplicateIds.length > 0) {
          await upsertProtocolItemSources({
            userId: user.id,
            protocolItemIds: duplicateIds,
            source: {
              sourceType,
              sourceAssessmentId,
              sourceRecommendationId: recommendation.id,
            },
          });
        }
      }

      const skippedCount = selectedItems.length - newItems.length;
      const toastDesc = skippedCount > 0 
        ? t('protocol.addedWithDuplicates', { added: newItems.length, skipped: skippedCount })
        : t('protocol.addedDesc', { count: newItems.length });

      setSaved(true);
      toast({
        title: t('protocol.added'),
        description: toastDesc,
      });

      onProtocolSaved?.();
    } catch (error: any) {
      console.error('Error saving protocol:', error);
      toast({
        title: t('protocol.saveFailed'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const renderProtocolSection = (
    items: ProtocolItem[],
    title: string,
    description: string,
    icon: React.ReactNode,
    badgeText: string,
    badgeColor: string
  ) => {
    if (items.length === 0) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {icon}
          <h4 className="font-semibold text-sm">{title}</h4>
          <Badge variant="outline" className={badgeColor}>{badgeText}</Badge>
        </div>
        <p className="text-xs text-muted-foreground -mt-1">{description}</p>
        <div className="space-y-2">
          {items.map((item, idx) => {
            const isDuplicate = isItemDuplicate(item);
            const isSelected = isItemSelected(item);
            
            return (
              <div 
                key={idx} 
                className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                  isDuplicate 
                    ? 'bg-muted/50 border-muted opacity-60' 
                    : isSelected 
                    ? 'bg-primary/5 border-primary/30' 
                    : 'bg-background border-border hover:border-primary/20'
                }`}
              >
                <Checkbox 
                  checked={isSelected}
                  disabled={isDuplicate}
                  onCheckedChange={() => toggleItem(item)}
                  className="mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{item.name}</p>
                    {isDuplicate && (
                      <Badge variant="secondary" className="text-xs">
                        {t('inlineProtocol.alreadyInPlan')}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                  {item.dosage && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      {item.dosage}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (!user) return null;

  const nonDuplicateCount = selectedItems.filter(item => !isItemDuplicate(item)).length;

  const allAreDuplicates = allItems.every(item => isItemDuplicate(item));

  if (saved) {
    return (
      <Card className="mb-6 bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/30">
        <CardContent className="pt-6 text-center">
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-lg mb-2">{t('inlineProtocol.savedTitle')}</h3>
          <p className="text-muted-foreground text-sm mb-4">{t('inlineProtocol.savedDesc')}</p>
          <Button
            onClick={() =>
              navigate(
                `/my-protocol?tab=active&assessment_type=${sourceType}&assessment_id=${encodeURIComponent(
                  sourceAssessmentId
                )}`
              )
            }
          >
            {t('inlineProtocol.viewProtocol')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          {t('inlineProtocol.title')}
        </CardTitle>
        <CardDescription>
          {t('inlineProtocol.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {allAreDuplicates ? (
          <div className="text-center p-6 bg-green-500/10 rounded-lg border border-green-500/20">
            <Check className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="font-medium text-green-700">{t('inlineProtocol.allInPlan')}</p>
          </div>
        ) : (
          <>
            {renderProtocolSection(
              protocolData.immediate,
              t('inlineProtocol.immediateActions'),
              t('inlineProtocol.immediateDesc'),
              <AlertCircle className="h-4 w-4 text-orange-500" />,
              t('inlineProtocol.doToday'),
              'bg-orange-500/10 text-orange-600 border-orange-500/20'
            )}

            {renderProtocolSection(
              protocolData.foundation,
              t('inlineProtocol.foundationActions'),
              t('inlineProtocol.foundationDesc'),
              <Layers className="h-4 w-4 text-blue-500" />,
              t('inlineProtocol.thisWeek'),
              'bg-blue-500/10 text-blue-600 border-blue-500/20'
            )}

            {renderProtocolSection(
              protocolData.optimization,
              t('inlineProtocol.optimisationActions'),
              t('inlineProtocol.optimisationDesc'),
              <Rocket className="h-4 w-4 text-purple-500" />,
              t('inlineProtocol.next30Days'),
              'bg-purple-500/10 text-purple-600 border-purple-500/20'
            )}

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  {t('inlineProtocol.selectAll')}
                </Button>
                <Button variant="ghost" size="sm" onClick={clearSelection}>
                  {t('inlineProtocol.clearSelection')}
                </Button>
              </div>

              <Button 
                onClick={handleSaveToProtocol}
                disabled={nonDuplicateCount === 0 || saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('common.saving')}
                  </>
                ) : (
                  t('inlineProtocol.addSelected', { count: nonDuplicateCount })
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
