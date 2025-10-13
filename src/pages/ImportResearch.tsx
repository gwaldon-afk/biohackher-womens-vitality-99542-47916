import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { importResearchToDatabase } from "@/services/researchImportService";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import Navigation from "@/components/Navigation";

const ImportResearch = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message?: string;
    count?: number;
    skipped?: boolean;
    error?: string;
  } | null>(null);

  const handleImport = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const importResult = await importResearchToDatabase();
      setResult(importResult);
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Failed to import research"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Import Research Studies</CardTitle>
            <CardDescription>
              Import all research studies from the codebase into the database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {result && (
              <Alert variant={result.success ? "default" : "destructive"}>
                {result.success ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  {result.message}
                  {result.count && ` (${result.count} studies)`}
                </AlertDescription>
              </Alert>
            )}

            <Button 
              onClick={handleImport} 
              disabled={loading || (result?.success && result?.skipped)}
              className="w-full"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Importing..." : "Import Research Studies"}
            </Button>

            <div className="text-sm text-muted-foreground">
              <p>This will import all research studies from your codebase into the database.</p>
              <p className="mt-2">Studies include:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Brain health & cognitive function studies</li>
                <li>Body health & metabolic research</li>
                <li>Beauty & skin aging studies</li>
                <li>Balance & hormonal health research</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ImportResearch;
