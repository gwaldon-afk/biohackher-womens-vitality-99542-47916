import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { useTranslation } from "react-i18next";
import type { ClinicianSummaryModel } from "@/lib/export/buildClinicianSummaryModel";

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 11,
    fontFamily: "Helvetica",
    lineHeight: 1.4,
  },
  section: {
    marginBottom: 16,
  },
  header: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  title: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  label: {
    color: "#374151",
  },
  value: {
    color: "#111827",
  },
  listItem: {
    marginBottom: 2,
  },
  footnote: {
    fontSize: 9,
    color: "#6B7280",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 10,
  },
});

type ClinicianSummaryPdfProps = {
  model: ClinicianSummaryModel;
};

export const ClinicianSummaryPdf = ({ model }: ClinicianSummaryPdfProps) => {
  const { t } = useTranslation();

  const projectedAgeValue =
    model.projectedAge === null || model.projectedAge === undefined
      ? "—"
      : String(model.projectedAge);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.header}>{t("export.clinicianSummary.pdf.header")}</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>{model.date}</Text>
          </View>
          {model.name && (
            <View style={styles.row}>
              <Text style={styles.label}>Name</Text>
              <Text style={styles.value}>{model.name}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>{t("export.clinicianSummary.pdf.bioAgeSectionTitle")}</Text>
          <View style={styles.row}>
            <Text style={styles.label}>{t("lisResults.chronologicalAge")}</Text>
            <Text style={styles.value}>
              {model.chronologicalAge === null || model.chronologicalAge === undefined
                ? "—"
                : `${model.chronologicalAge}`}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{t("lisResults.biologicalAge")}</Text>
            <Text style={styles.value}>
              {model.biologicalAge === null || model.biologicalAge === undefined
                ? "—"
                : `${model.biologicalAge}`}
            </Text>
          </View>
          {model.ageDelta !== null && model.ageDelta !== undefined && (
            <View style={styles.row}>
              <Text style={styles.label}>{t("lisResults.ageDelta")}</Text>
              <Text style={styles.value}>{model.ageDelta} years</Text>
            </View>
          )}
          <Text style={styles.footnote}>{t("export.clinicianSummary.pdf.bioAgeFootnote")}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>{t("export.clinicianSummary.pdf.trajectoryTitle")}</Text>
          <Text style={styles.listItem}>
            {t("export.clinicianSummary.pdf.trajectoryInterpretation", { Y: projectedAgeValue })}
          </Text>
          <Text style={styles.footnote}>{t("export.clinicianSummary.pdf.qualifier")}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>{t("export.clinicianSummary.pdf.primaryFactorsTitle")}</Text>
          {model.primaryFactors.map((factor) => (
            <Text key={factor} style={styles.listItem}>
              • {factor}
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>{t("export.clinicianSummary.pdf.protocolsTitle")}</Text>
          {model.protocols.map((protocol, index) => (
            <View key={`${protocol.name}-${index}`} style={styles.row}>
              <Text style={styles.label}>
                {protocol.category} — {protocol.name}
              </Text>
              <Text style={styles.value}>{protocol.frequency}</Text>
            </View>
          ))}
          <Text style={styles.footnote}>{t("export.clinicianSummary.pdf.protocolsNote")}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>{t("export.clinicianSummary.pdf.inputsTitle")}</Text>
          {model.inputs.length === 0 ? (
            <Text style={styles.listItem}>—</Text>
          ) : (
            model.inputs.map((input) => (
              <Text key={input} style={styles.listItem}>
                • {input}
              </Text>
            ))
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.footnote}>{t("export.clinicianSummary.pdf.globalDisclaimer")}</Text>
          <Text style={styles.footnote}>{t("export.clinicianSummary.pdf.clinicalContext")}</Text>
        </View>
      </Page>
    </Document>
  );
};
