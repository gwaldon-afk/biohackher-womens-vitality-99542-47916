import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ExpertProfile, ExpertCredential } from "@/types/experts";
import { CheckCircle, XCircle, Eye, FileText, Clock, MapPin } from "lucide-react";
import { toast } from "sonner";

export default function ExpertVerification() {
  const { user } = useAuth();
  const [pendingExperts, setPendingExperts] = useState<ExpertProfile[]>([]);
  const [selectedExpert, setSelectedExpert] = useState<ExpertProfile | null>(null);
  const [credentials, setCredentials] = useState<ExpertCredential[]>([]);
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminRole();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      fetchPendingExperts();
    }
  }, [isAdmin]);

  const checkAdminRole = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();
    
    setIsAdmin(!!data);
  };

  const fetchPendingExperts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('expert_profiles')
        .select('*')
        .eq('verification_status', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setPendingExperts((data || []) as ExpertProfile[]);
    } catch (error) {
      console.error('Error fetching pending experts:', error);
      toast.error('Failed to load pending applications');
    } finally {
      setLoading(false);
    }
  };

  const fetchCredentials = async (expertId: string) => {
    try {
      const { data, error } = await supabase
        .from('expert_credentials')
        .select('*')
        .eq('expert_id', expertId);

      if (error) throw error;
      setCredentials(data || []);
    } catch (error) {
      console.error('Error fetching credentials:', error);
    }
  };

  const handleReview = async (expert: ExpertProfile) => {
    setSelectedExpert(expert);
    await fetchCredentials(expert.id);
  };

  const handleApprove = async () => {
    if (!selectedExpert || !user) return;

    try {
      // Update expert profile
      const { error: profileError } = await supabase
        .from('expert_profiles')
        .update({
          verification_status: 'approved',
          verified_at: new Date().toISOString(),
          verified_by: user.id,
          listing_status: 'active',
        })
        .eq('id', selectedExpert.id);

      if (profileError) throw profileError;

      // Log verification
      await supabase
        .from('expert_verification_log')
        .insert({
          expert_id: selectedExpert.id,
          action: 'approved',
          performed_by: user.id,
          previous_status: 'pending',
          new_status: 'approved',
        });

      toast.success('Expert approved successfully!');
      setSelectedExpert(null);
      fetchPendingExperts();
    } catch (error: any) {
      console.error('Error approving expert:', error);
      toast.error(error?.message || 'Failed to approve expert');
    }
  };

  const handleReject = async () => {
    if (!selectedExpert || !user || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      // Update expert profile
      const { error: profileError } = await supabase
        .from('expert_profiles')
        .update({
          verification_status: 'rejected',
          rejection_reason: rejectionReason,
        })
        .eq('id', selectedExpert.id);

      if (profileError) throw profileError;

      // Log verification
      await supabase
        .from('expert_verification_log')
        .insert({
          expert_id: selectedExpert.id,
          action: 'rejected',
          performed_by: user.id,
          reason: rejectionReason,
          previous_status: 'pending',
          new_status: 'rejected',
        });

      toast.success('Expert application rejected');
      setSelectedExpert(null);
      setRejectionReason("");
      fetchPendingExperts();
    } catch (error: any) {
      console.error('Error rejecting expert:', error);
      toast.error(error?.message || 'Failed to reject expert');
    }
  };

  if (!isAdmin) {
    return (
      <div className="container py-8 text-center">
        <p className="text-muted-foreground">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-8 text-center">
        <p className="text-muted-foreground">Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Expert Verification</h1>
        <p className="text-muted-foreground">Review and approve expert partner applications</p>
      </div>

      {pendingExperts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
            <p className="text-muted-foreground">No pending applications!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingExperts.map((expert) => (
            <Card key={expert.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle>{expert.practice_name || 'Unnamed Practice'}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <MapPin className="h-4 w-4" />
                      {expert.location || 'No location'}
                      <span className="ml-4">
                        <Clock className="h-4 w-4 inline mr-1" />
                        Applied {new Date(expert.created_at).toLocaleDateString()}
                      </span>
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">Pending</Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-1">Specialties:</p>
                  <div className="flex flex-wrap gap-2">
                    {expert.specialties.map((s) => (
                      <Badge key={s} variant="outline">{s}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">Bio:</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">{expert.bio}</p>
                </div>

                <div className="grid md:grid-cols-3 gap-4 pt-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Years of Practice</p>
                    <p className="font-medium">{expert.years_of_practice || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">License #</p>
                    <p className="font-medium text-sm">{expert.license_number || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Insurance #</p>
                    <p className="font-medium text-sm">{expert.insurance_number || 'N/A'}</p>
                  </div>
                </div>

                <Button onClick={() => handleReview(expert)} className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  Review Application
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={!!selectedExpert} onOpenChange={() => setSelectedExpert(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Expert Application</DialogTitle>
            <DialogDescription>
              {selectedExpert?.practice_name} - {selectedExpert?.expert_id}
            </DialogDescription>
          </DialogHeader>

          {selectedExpert && (
            <div className="space-y-6 py-4">
              {/* Full Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Professional Bio</h4>
                  <p className="text-sm text-muted-foreground">{selectedExpert.bio}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Contact Information</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedExpert.email}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Phone</p>
                      <p className="font-medium">{selectedExpert.phone || 'N/A'}</p>
                    </div>
                    {selectedExpert.website && (
                      <div className="md:col-span-2">
                        <p className="text-muted-foreground">Website</p>
                        <a href={selectedExpert.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {selectedExpert.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Credentials</h4>
                  {credentials.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No credentials uploaded yet</p>
                  ) : (
                    <div className="space-y-2">
                      {credentials.map((cred) => (
                        <div key={cred.id} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{cred.document_name}</p>
                              <p className="text-xs text-muted-foreground capitalize">{cred.document_type}</p>
                            </div>
                          </div>
                          {cred.file_url && (
                            <Button size="sm" variant="ghost" asChild>
                              <a href={cred.file_url} target="_blank" rel="noopener noreferrer">
                                View
                              </a>
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Rejection Reason Input */}
                <div>
                  <h4 className="font-semibold mb-2">Rejection Reason (if applicable)</h4>
                  <Textarea
                    placeholder="Provide a detailed reason if rejecting this application..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleReject}
                  disabled={!rejectionReason.trim()}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={handleApprove}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}