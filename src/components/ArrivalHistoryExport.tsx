import { useState } from "react";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "../utils/apiToastMessage";
import type { ArrivalModel } from "../interfaces/Models";
import { getArrivals, type ArrivalQuery } from "../services/api/arrival";
import type { PaginationMeta } from "../services/api/pagination";
import { getArrivalSourceLabel } from "../constants/arrivalSourceTypes";
import { formatDate } from "../services/dateService";
import { ExportCsvButton, type ExportScope } from "./ExportCsvButton";
import { downloadCsv, rowsToCsv, type CsvColumn } from "../utils/csv";
import { fetchAllPages } from "../utils/fetchAllPages";

const EXPORT_PER_PAGE = 200;

/** Free text can start with a spreadsheet formula trigger: neutralize it. */
const toSafeText = (value: unknown): string => {
  const text = value == null ? "" : String(value);
  return /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
};

const arrivalCsvColumns: CsvColumn<ArrivalModel>[] = [
  { header: "N° Arrivage", key: "id" },
  {
    header: "Date",
    key: "arrival_date",
    format: (value) => (value ? formatDate(String(value)) : ""),
  },
  { header: "Heure", key: "arrival_time", format: (value) => value ?? "" },
  {
    header: "Catégorie",
    key: "categorie.name",
    format: (_value, row) => row.categorie?.name ?? "",
  },
  {
    header: "Sous-catégorie",
    key: "subcategorie.name",
    format: (_value, row) => row.subcategorie?.name ?? "",
  },
  { header: "Poids (kg)", key: "weight" },
  {
    header: "Provenance",
    key: "source_type",
    format: (value) => (value ? getArrivalSourceLabel(String(value)) : ""),
  },
  {
    header: "Point de collecte",
    key: "CollectionPoint.name",
    format: (_value, row) => row.CollectionPoint?.name ?? "",
  },
  { header: "Détails provenance", key: "source_details", format: toSafeText },
  { header: "Notes", key: "notes", format: toSafeText },
  {
    header: "Saisi par",
    key: "User.username",
    format: (_value, row) => row.User?.username ?? "",
  },
];

type ArrivalHistoryExportProps = {
  filters: ArrivalQuery;
};

export const ArrivalHistoryExport = ({
  filters,
}: ArrivalHistoryExportProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCsv = async (scope: ExportScope) => {
    setIsExporting(true);
    try {
      const arrivals = await fetchAllPages<
        ArrivalModel,
        { data: ArrivalModel[]; pagination: PaginationMeta }
      >({
        fetchPage: async (page) => {
          const response = await getArrivals({
            ...(scope === "filtered" ? filters : {}),
            page,
            perPage: EXPORT_PER_PAGE,
          });
          return response.data;
        },
        getItems: (data) => data.data,
        getPagination: (data) => data.pagination,
      });

      if (arrivals.length === 0) {
        toast.warning("Aucun arrivage à exporter.");
        return;
      }

      const csv = rowsToCsv(arrivals, arrivalCsvColumns);
      const stamp = new Date().toISOString().slice(0, 10);
      downloadCsv(
        scope === "filtered"
          ? `arrivages-filtres-${stamp}.csv`
          : `arrivages-tout-${stamp}.csv`,
        csv,
      );
      toast.success(`Export CSV prêt (${arrivals.length} lignes).`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Erreur lors de l'export CSV"));
    } finally {
      setIsExporting(false);
    }
  };

  return <ExportCsvButton onExport={handleExportCsv} loading={isExporting} />;
};

export default ArrivalHistoryExport;
