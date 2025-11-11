import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Loader2 } from "lucide-react";

interface EmailShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  score: number;
  pillarScores: Record<string, number>;
  bioAge?: number;
  chronologicalAge?: number;
  isGuest: boolean;
  userEmail?: string;
  userId?: string;
}

export const EmailShareDialog = ({
  open,
  onOpenChange,
  score,
  pillarScores,
  bioAge,
  chronologicalAge,
  isGuest,
  userEmail,
  userId,
}: EmailShareDialogProps) => {
  const [email, setEmail] = useState(userEmail || "");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.functions.invoke("send-lis-report", {
        body: {
          recipientEmail: email,
          score,
          pillarScores,
          bioAge,
          chronologicalAge,
          isGuest,
          shareMessage: message || undefined,
          userId,
        },
      });

      if (error) throw error;

      toast({
        title: "Email Sent!",
        description: isGuest 
          ? "Check your inbox for your results. Create an account to unlock your full protocol!"
          : "Your LIS results have been sent successfully.",
      });

      onOpenChange(false);
      setEmail(userEmail || "");
      setMessage("");
    } catch (error: any) {
      console.error("Error sending email:", error);
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            {isGuest ? "Save Your Results via Email" : "Email Your Results"}
          </DialogTitle>
          <DialogDescription>
            {isGuest
              ? "Enter your email to receive your LIS results. We'll also save them so you can access anytime."
              : "Send your LIS report to yourself or share with someone else."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Personal Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder={isGuest ? "Add a note to yourself..." : "Add a message to share..."}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
              rows={3}
            />
          </div>

          {isGuest && (
            <p className="text-xs text-muted-foreground">
              💡 Your results will be saved and you can create a free account to access your personalized protocol
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={loading}
            className="flex-1 gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                Send Report
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
