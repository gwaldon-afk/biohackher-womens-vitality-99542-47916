import { useEffect, useMemo, useState } from "react";
import { PDFViewer } from "@react-pdf/renderer";
import { useAuth } from "@/hooks/useAuth";
import { useConsolidatedScores } from "@/hooks/useConsolidatedScores";
import { useProtocols } from "@/hooks/useProtocols";
import { buildBiologicalAgeProjection } from "@/lib/biologicalAge/projection";
import {
  buildClinicianSummaryModel,
  type ClinicianSummaryProtocolItem,
} from "@/lib/export/buildClinicianSummaryModel";
import { ClinicianSummaryPdf } from "@/components/export/ClinicianSummaryPdf";

const ClinicianSummaryExport = () => {
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

  return (
    <div className="min-h-screen bg-background">
      <PDFViewer className="h-screen w-full">
        <ClinicianSummaryPdf model={model} />
      </PDFViewer>
    </div>
  );
};

export default ClinicianSummaryExport;
