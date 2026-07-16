import {
  MoreVert
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Chip,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material";
import React from "react";
import type { MuiIconName } from "../SelectedIcon";
import type { ChipProps } from "@mui/material";
import type { Activity } from "../../services/api/dashboard";
import { SelectedIcon } from "../SelectedIcon";



interface ActivityItemProps {
  activity: Activity
}
export const ActivityItem = ({ activity }: ActivityItemProps) => {
  const iconName = activity.icon as MuiIconName;
  const statusColor = activity.statusColor as NonNullable<ChipProps["color"]>;
  const color = activity.color as NonNullable<ChipProps["color"]>;

  return (
    <ListItem sx={{ px: 0 }}>
      <ListItemAvatar>
        <Avatar
          sx={{ bgcolor: `${color}.main`, width: 40, height: 40 }}
        >
          <SelectedIcon iconName={iconName} />
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
              color={statusColor}
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