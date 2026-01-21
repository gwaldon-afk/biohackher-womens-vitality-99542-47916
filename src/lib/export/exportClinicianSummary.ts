import React from "react";
import { pdf } from "@react-pdf/renderer";
import { ClinicianSummaryPdf } from "@/components/export/ClinicianSummaryPdf";
import type { ClinicianSummaryModel } from "./buildClinicianSummaryModel";

export const exportClinicianSummary = async (
  model: ClinicianSummaryModel,
  filename = "biohackher-clinician-summary.pdf"
) => {
  if (typeof window === "undefined") return;
  const pdfDocument = React.createElement(ClinicianSummaryPdf, { model });
  const blob = await pdf(pdfDocument).toBlob();
  const url = URL.createObjectURL(blob);
  const link = window.document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
