import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";

const LisBaselineIntro = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isWhyOpen, setIsWhyOpen] = useState(false);
  const returnToParam = searchParams.get("returnTo") || "";
  const returnTo = returnToParam ? decodeURIComponent(returnToParam) : "";

  const assessmentPath = useMemo(() => {
    if (!returnTo) return "/guest-lis-assessment";
    return `/guest-lis-assessment?returnTo=${encodeURIComponent(returnTo)}`;
  }, [returnTo]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 max-w-xl">
        <Card className="p-6 space-y-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">Before we plan today, let’s get your baseline</h1>
            <p className="text-muted-foreground">
              This short assessment helps us understand how your body is ageing right now. It’s the foundation for every recommendation we make.
            </p>
            <p className="text-sm text-muted-foreground">Takes about 6–8 minutes • No right or wrong answers</p>
          </div>
          <div className="space-y-2">
            <Button onClick={() => navigate(assessmentPath)}>Start assessment</Button>
            <Collapsible open={isWhyOpen} onOpenChange={setIsWhyOpen}>
              <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <span>Why do you need this?</span>
                <ChevronRight className="h-4 w-4 transition-transform data-[state=open]:rotate-90" />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 text-sm text-muted-foreground">
                Your results help us personalise your protocols, plans, and progress over time — without guesswork.
              </CollapsibleContent>
            </Collapsible>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LisBaselineIntro;
