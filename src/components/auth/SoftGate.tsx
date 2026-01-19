import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type SoftGateProps = {
  title: string;
  body: string;
  bullets: string[];
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
};

export const SoftGate = ({
  title,
  body,
  bullets,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: SoftGateProps) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 max-w-xl">
        <Card className="p-6 space-y-5">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold">{title}</h1>
            <p className="text-muted-foreground">{body}</p>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
            {bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link to={primaryHref}>{primaryLabel}</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to={secondaryHref}>{secondaryLabel}</Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
