import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function PlansPreview() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto w-full max-w-md px-4 py-10">
        <div className="space-y-4 text-center">
          <h1 className="text-2xl font-bold text-foreground">Your plan, personalised</h1>
          <p className="text-sm text-muted-foreground">
            Create a free account to save your plan and access Today.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          <Button
            className="w-full"
            onClick={() => navigate("/auth?returnTo=/today")}
          >
            Create free account
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/")}
          >
            Keep exploring
          </Button>
        </div>
      </main>
    </div>
  );
}
