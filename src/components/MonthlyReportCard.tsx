import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Loader2, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MonthlyReportCardProps {
  isPremium?: boolean;
}

export const MonthlyReportCard = ({ isPremium = false }: MonthlyReportCardProps) => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const { toast } = useToast();

  const generateReport = async () => {
    if (!isPremium) {
      toast({
        title: "Premium Feature",
        description: "Monthly reports are available with Premium subscription.",
        variant: "default"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-monthly-report");

      if (error) throw error;

      setReport(data);
      
      toast({
        title: "Report Generated",
        description: "Your monthly wellness report is ready!"
      });
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate report. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Monthly Wellness Report
              {isPremium && <Badge variant="default">Premium</Badge>}
            </CardTitle>
            <CardDescription>
              Comprehensive analysis of your 30-day wellness journey
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isPremium ? (
          <div className="p-6 bg-muted/30 rounded-lg text-center">
            <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <h3 className="font-semibold mb-2">Unlock Monthly Reports</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get detailed monthly progress reports with insights, trends, and personalized recommendations.
            </p>
            <Button variant="default">Upgrade to Premium</Button>
          </div>
        ) : (
          <>
            <Button 
              onClick={generateReport} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Report...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Monthly Report
                </>
              )}
            </Button>

            {report && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                  <div>
                    <p className="font-semibold text-sm">Report Period</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(report.period.start).toLocaleDateString()} - {new Date(report.period.end).toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>

                {report.stats && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground">Adherence Rate</p>
                      <p className="text-2xl font-bold text-primary">{report.stats.adherenceRate}%</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground">Measurements</p>
                      <p className="text-2xl font-bold">{report.stats.measurementCount}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground">Assessments</p>
                      <p className="text-2xl font-bold">{report.stats.assessmentCount}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground">Weight Change</p>
                      <p className="text-2xl font-bold">{report.stats.weightChange || "N/A"}</p>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-background rounded-lg border max-h-96 overflow-y-auto">
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap text-sm">{report.report}</div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
