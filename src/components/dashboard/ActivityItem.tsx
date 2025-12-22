import {
  Typography,
  Box,
  Avatar,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  IconButton,
} from "@mui/material";
import {
  Inventory,
  ShoppingCart,
  People,
  LocalShipping,
  VolunteerActivism,
  MoreVert,
  Info,
} from "@mui/icons-material";
import React from "react";

// Fonction pour obtenir l'icône par nom
const getIconByName = (iconName:string) => {
  const icons = {
    ShoppingCart,
    VolunteerActivism,
    LocalShipping,
    Inventory,
    People,
  };
  return icons[iconName] || Info;
};
interface Activity{
    icon:string
    color?:string
    description:string
    status:string
    statusColor:string
    time:string
    amount:number
}
interface ActivityItemProps{
    activity:Activity
}
export const ActivityItem = ({ activity }:ActivityItemProps) => {
  const IconComponent = getIconByName(activity.icon);

  return (
    <ListItem sx={{ px: 0 }}>
      <ListItemAvatar>
        <Avatar
          sx={{ bgcolor: `${activity.color}.main`, width: 40, height: 40 }}
        >
          <IconComponent />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {activity.description}
            </Typography>
            <Chip
              label={activity.status}
              size="small"
              color={activity.statusColor}
              variant="outlined"
            />
          </Box>
        }
        secondary={
          <React.Fragment>
            <Typography
              variant="body2"
              color="textSecondary"
              component="span"
              sx={{ display: "block" }}
            >
              {activity.time}
            </Typography>
            {activity.amount && (
              <Typography
                variant="body2"
                color="primary"
                sx={{ fontWeight: 500, display: "block" }}
                component="span"
              >
                {activity.amount}
              </Typography>
            )}
          </React.Fragment>
        }
      />
      <IconButton size="small">
        <MoreVert />
      </IconButton>
    </ListItem>
  );
};