import Box from "@mui/material/Box";
import { BarChart } from "@mui/x-charts/BarChart";

interface ChartProps {
  uData: number[];
  pData: number[];
  label1: string;
  label2: string;
  xLabels: string[];
}

export default function SimpleBarChart({
  uData,
  pData,
  label1,
  label2,
  xLabels,
}: ChartProps) {
  return (
    <Box sx={{ width: "100%", height: 300 }}>
      <BarChart
        series={[
          {
            data: pData,
            label: label1,
            id: "pvId",
            barLabel: "value",
            barLabelPlacement: "outside",
          },
          {
            data: uData,
            label: label2,
            id: "uvId",
            barLabel: (item) =>
              new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: "EUR",
              }).format(item.value!),
          },
        ]}
        xAxis={[{ data: xLabels }]}
        yAxis={[{ width: 50 }]}
      />
    </Box>
  );
}
