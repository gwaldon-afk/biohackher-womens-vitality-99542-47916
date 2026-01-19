import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type ProtocolItem = {
  name: string;
};

type ProtocolData = {
  immediate: ProtocolItem[];
  foundation: ProtocolItem[];
  optimization: ProtocolItem[];
};

type LockedProtocolPreviewProps = {
  title: string;
  subtitle?: string;
  protocolData: ProtocolData;
};

const renderList = (items: ProtocolItem[], limit: number) => {
  return items.slice(0, limit).map((item) => (
    <li key={item.name} className="text-sm text-muted-foreground">
      {item.name}
    </li>
  ));
};

export const LockedProtocolPreview = ({ title, subtitle, protocolData }: LockedProtocolPreviewProps) => {
  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <Badge variant="secondary">Locked preview</Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {protocolData.immediate.length > 0 && (
          <div>
            <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">Immediate</div>
            <ul className="space-y-1">{renderList(protocolData.immediate, 4)}</ul>
          </div>
        )}
        {protocolData.foundation.length > 0 && (
          <div>
            <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">Foundation</div>
            <ul className="space-y-1">{renderList(protocolData.foundation, 4)}</ul>
          </div>
        )}
        {protocolData.optimization.length > 0 && (
          <div>
            <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">Optimization</div>
            <ul className="space-y-1">{renderList(protocolData.optimization, 4)}</ul>
          </div>
        )}
      </div>
    </Card>
  );
};
