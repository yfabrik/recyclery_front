import { Card, CardContent, Typography, Box, Avatar } from "@mui/material";
import { TrendingUp, TrendingDown } from "@mui/icons-material";

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  color: string;
  subtitle: string;
  trend: string;
  trendValue: number;
  onClick: React.MouseEventHandler<HTMLDivElement>
}
export const StatCard = ({
  title,
  value,
  icon,
  color,
  subtitle,
  trend,
  trendValue,
  onClick,
}: StatCardProps) => (
  <Card
    sx={{
      height: "100%",
      cursor: onClick ? "pointer" : "default",
      transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
      "&:hover": onClick
        ? {
            transform: "translateY(-4px)",
            boxShadow: 4,
          }
        : {},
    }}
    onClick={onClick}
  >
    <CardContent>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Box sx={{ flexGrow: 1 }}>
          <Typography
            color="textSecondary"
            gutterBottom
            variant="overline"
            sx={{ fontSize: "0.75rem" }}
          >
            {title}
          </Typography>
          <Typography
            variant="h4"
            component="div"
            color={color}
            sx={{ fontWeight: "bold" }}
          >
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Avatar sx={{ bgcolor: `${color}.main`, width: 56, height: 56 }}>
          {icon}
        </Avatar>
      </Box>
      {trend && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {trend === "up" ? (
            <TrendingUp color="success" fontSize="small" />
          ) : (
            <TrendingDown color="error" fontSize="small" />
          )}
          <Typography
            variant="body2"
            color={trend === "up" ? "success.main" : "error.main"}
          >
            {trendValue}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            vs mois dernier
          </Typography>
        </Box>
      )}
    </CardContent>
  </Card>
);
