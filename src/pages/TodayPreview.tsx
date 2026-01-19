import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useGuestAssessmentGate } from "@/hooks/useGuestAssessmentGate";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type PreviewAction = {
  key: "breathwork" | "breakfast" | "strengthLocked" | "protocolLocked";
  locked?: boolean;
};

const DEFAULT_ACTIONS: PreviewAction[] = [
  { key: "breathwork" },
  { key: "breakfast" },
  { key: "strengthLocked", locked: true },
  { key: "protocolLocked", locked: true },
];

export default function TodayPreview() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getGuestCompletion } = useGuestAssessmentGate();
  const [lockedModalOpen, setLockedModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/today", { replace: true });
    }
  }, [user, navigate]);

  const hasGuestAssessment = useMemo(() => {
    const completion = getGuestCompletion();
    if (completion.completed) return true;

    const lisSession = localStorage.getItem("lis_guest_session_id");
    const nutritionSession = localStorage.getItem("nutrition_guest_session");
    const hormoneResult = localStorage.getItem("hormone_guest_result");

    return Boolean(lisSession || nutritionSession || hormoneResult);
  }, [getGuestCompletion]);

  if (user) {
    return null;
  }

  if (!hasGuestAssessment) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8 pb-24 md:pb-8 max-w-3xl">
          <Card className="p-6 space-y-4">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">{t("todayPreview.empty.title")}</h1>
              <p className="text-muted-foreground">{t("todayPreview.empty.body")}</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={() => navigate("/guest-lis-assessment")}>
                {t("todayPreview.empty.primary")}
              </Button>
              <Button variant="ghost" onClick={() => navigate("/plan-home")}>
                {t("todayPreview.empty.secondary")}
              </Button>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 pb-24 md:pb-8 max-w-4xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{t("todayPreview.title")}</h1>
          <p className="text-muted-foreground">{t("todayPreview.subtitle")}</p>
        </div>

        <Card className="p-6 space-y-4">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">{t("todayPreview.cta.title")}</h2>
            <p className="text-muted-foreground">{t("todayPreview.cta.body")}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={() => navigate("/auth?returnTo=%2Ftoday")}>
              {t("todayPreview.cta.primary")}
            </Button>
            <Button variant="ghost" onClick={() => navigate("/plan-home")}>
              {t("todayPreview.cta.secondary")}
            </Button>
          </div>
        </Card>

        <div className="grid gap-4">
          {DEFAULT_ACTIONS.map((action) => {
            const label = t(`todayPreview.action.${action.key}`);
            return (
              <Card
                key={action.key}
                className={`p-4 flex items-center justify-between ${action.locked ? "cursor-pointer" : ""}`}
                onClick={action.locked ? () => setLockedModalOpen(true) : undefined}
              >
                <div className="font-medium">{label}</div>
                {action.locked ? <Badge variant="secondary">{t("todayPreview.locked.badge")}</Badge> : null}
              </Card>
            );
          })}
        </div>
      </main>

      <Dialog open={lockedModalOpen} onOpenChange={setLockedModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("todayPreview.locked.modalTitle")}</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">{t("todayPreview.locked.modalBody")}</p>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button onClick={() => navigate("/auth?returnTo=%2Ftoday")}>
              {t("todayPreview.locked.modalPrimary")}
            </Button>
            <Button variant="ghost" onClick={() => setLockedModalOpen(false)}>
              {t("todayPreview.locked.modalSecondary")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
