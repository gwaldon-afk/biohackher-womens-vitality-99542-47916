import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type SoftGateProps = {
  title: string;
  body: string;
  primaryHref: string;
  secondaryHref: string;
  optionalTertiaryHref?: string;
};

export const SoftGate = ({
  title,
  body,
  primaryHref,
  secondaryHref,
  optionalTertiaryHref,
}: SoftGateProps) => {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-10 pb-24 md:pb-10 max-w-3xl">
        <Card className="p-6 space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-muted-foreground">{body}</p>
          </div>
          <div className="flex flex-col gap-2 items-center">
            <Button asChild size="lg">
              <Link to={primaryHref}>Create free account</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to={secondaryHref}>Keep exploring</Link>
            </Button>
            {optionalTertiaryHref ? (
              <Button asChild variant="link">
                <Link to={optionalTertiaryHref}>See Today plan preview</Link>
              </Button>
            ) : null}
          </div>
        </Card>
      </main>
    </div>
  );
};
