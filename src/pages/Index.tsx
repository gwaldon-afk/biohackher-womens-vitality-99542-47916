import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  console.log("Index component rendering...");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-6">
          <span className="text-foreground">Biohack</span>
          <span className="text-primary italic">her</span>
          <sup className="text-sm font-normal ml-1">®</sup>
        </h1>
        <p className="text-xl mb-8 text-muted-foreground">
          Live well longer. Empowering women to beat ageing through biohacking.
        </p>
        <div className="flex gap-4">
          <Button 
            size="lg" 
            onClick={() => navigate("/auth")}
          >
            Map my journey
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            onClick={() => navigate("/dashboard")}
          >
            View Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
