import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { History, FileText, Calendar, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SymptomChoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  symptomId: string;
  symptomName: string;
  symptomIcon: React.ComponentType<any>;
}

const SymptomChoiceDialog = ({ 
  open, 
  onOpenChange, 
  symptomId, 
  symptomName,
  symptomIcon: SymptomIcon 
}: SymptomChoiceDialogProps) => {
  const navigate = useNavigate();

  const handleNewAssessment = () => {
    onOpenChange(false);
    navigate(`/assessment/${symptomId}`);
  };

  const handleViewHistory = () => {
    onOpenChange(false);
    navigate(`/assessment-history?filter=${symptomId}&from=symptoms`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <SymptomIcon className="h-6 w-6 text-primary" />
            {symptomName}
          </DialogTitle>
          <DialogDescription>
            What would you like to do with this symptom assessment?
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <Card 
            className="p-4 cursor-pointer hover:bg-accent transition-colors border-2 hover:border-primary"
            onClick={handleNewAssessment}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Complete New Assessment</h3>
                  <p className="text-sm text-muted-foreground">Start a fresh symptom evaluation</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </Card>

          <Card 
            className="p-4 cursor-pointer hover:bg-accent transition-colors border-2 hover:border-primary"
            onClick={handleViewHistory}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <History className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">View Previous Assessments</h3>
                  <p className="text-sm text-muted-foreground">See your completed assessments and track progress</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SymptomChoiceDialog;