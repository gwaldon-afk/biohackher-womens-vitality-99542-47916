import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useConsolidatedScores } from "@/hooks/useConsolidatedScores";
import { useProtocols } from "@/hooks/useProtocols";
import { buildBiologicalAgeProjection } from "@/lib/biologicalAge/projection";
import {
  buildClinicianSummaryModel,
  type ClinicianSummaryProtocolItem,
} from "@/lib/export/buildClinicianSummaryModel";
import { exportClinicianSummary } from "@/lib/export/exportClinicianSummary";

type ClinicianSummaryDownloadButtonProps = {
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
};

export const ClinicianSummaryDownloadButton = ({
  className,
  variant = "outline",
  size = "sm",
}: ClinicianSummaryDownloadButtonProps) => {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const {
    overallBiologicalAge,
    chronologicalAge,
    lisScore,
    nutritionScore,
    hormoneStage,
  } = useConsolidatedScores();
  const { protocols, fetchProtocolItems } = useProtocols();
  const [protocolItems, setProtocolItems] = useState<ClinicianSummaryProtocolItem[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadProtocolItems = async () => {
      if (!user) {
        if (isMounted) setProtocolItems([]);
        return;
      }
      const activeProtocols = protocols.filter((protocol) => protocol.is_active);
      const items = await Promise.all(activeProtocols.map((protocol) => fetchProtocolItems(protocol.id)));
      if (isMounted) {
        setProtocolItems(items.flat());
      }
    };
    loadProtocolItems();
    return () => {
      isMounted = false;
    };
  }, [user, protocols, fetchProtocolItems]);

  const inputs = useMemo(() => {
    const list: string[] = [];
    if (lisScore !== null) list.push("Longevity Impact Score (LIS)");
    if (nutritionScore !== null) list.push("Nutrition assessment");
    if (hormoneStage !== null) list.push("Hormone Compass");
    return list;
  }, [lisScore, nutritionScore, hormoneStage]);

  const projection = useMemo(() => {
    if (overallBiologicalAge === null || overallBiologicalAge === undefined) return null;
    return buildBiologicalAgeProjection(overallBiologicalAge, chronologicalAge);
  }, [overallBiologicalAge, chronologicalAge]);

  const model = useMemo(() => {
    const name = profile?.preferred_name || user?.email || null;
    return buildClinicianSummaryModel({
      name,
      chronologicalAge,
      biologicalAge: overallBiologicalAge,
      projectedAge: projection?.projectedAge ?? null,
      protocolItems,
      protocols,
      inputs,
    });
  }, [profile?.preferred_name, user?.email, chronologicalAge, overallBiologicalAge, projection?.projectedAge, protocolItems, protocols, inputs]);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await exportClinicianSummary(model);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={handleDownload}
      disabled={isDownloading}
    >
      {t("export.clinicianSummary.downloadButton")}
    </Button>
  );
};
