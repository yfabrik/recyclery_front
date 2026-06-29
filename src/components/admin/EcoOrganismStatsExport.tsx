import { useState } from "react";
import { toast } from "react-toastify";
import { ExportCsvButton, type ExportScope } from "../ExportCsvButton";
import { downloadCsv, rowsToCsv, type CsvColumn } from "../../utils/csv";
import type {
  EcoMetricSource,
  EcoOrganismStatsRow,
} from "./EcoOrganismStatsTable";

const getCsvColumns = (
  metricSource: EcoMetricSource,
): CsvColumn<EcoOrganismStatsRow>[] => {
  const columns: CsvColumn<EcoOrganismStatsRow>[] = [
    { header: "Eco-organisme", key: "ecoOrganism" },
    { header: "Trimestre", key: "quarter" },
  ];

  if (metricSource === "quarterIn") {
    columns.push({
      header: "Type de source",
      key: "sourceType",
      format: (value) => value ?? "",
    });
  }

  columns.push(
    { header: "Categorie", key: "category" },
    {
      header: "Sous-categorie",
      key: "subcategory",
      format: (value) => value ?? "",
    },
    {
      header: "Poids (kg)",
      key: "weightKg",
      format: (value) => (typeof value === "number" ? value : 0),
    },
  );

  if (metricSource === "quarterSell") {
    columns.push({
      header: "Quantite",
      key: "quantity",
      format: (value) => (typeof value === "number" ? value : 0),
    });
  }

  return columns;
};

type EcoOrganismStatsExportProps = {
  filteredRows: EcoOrganismStatsRow[];
  allRows: EcoOrganismStatsRow[];
  metricSource: EcoMetricSource;
  disabled?: boolean;
};

export const EcoOrganismStatsExport = ({
  filteredRows,
  allRows,
  metricSource,
  disabled = false,
}: EcoOrganismStatsExportProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCsv = async (scope: ExportScope) => {
    const exportRows = scope === "filtered" ? filteredRows : allRows;
    if (exportRows.length === 0) {
      toast.warning("Aucune donnee a exporter.");
      return;
    }

    setIsExporting(true);
    try {
      const csv = rowsToCsv(exportRows, getCsvColumns(metricSource));
      const stamp = new Date().toISOString().slice(0, 10);
      const fileName =
        scope === "filtered"
          ? `eco-organisme-stats-filtres-${stamp}.csv`
          : `eco-organisme-stats-tout-${stamp}.csv`;
      downloadCsv(fileName, csv);
      toast.success(`Export CSV pret (${exportRows.length} lignes).`);
    } catch {
      toast.error("Erreur lors de l'export CSV");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ExportCsvButton
      onExport={handleExportCsv}
      loading={isExporting}
      disabled={disabled || allRows.length === 0}
    />
  );
};

export default EcoOrganismStatsExport;
