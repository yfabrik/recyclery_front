import { SvgIconComponent } from "@mui/material";
import * as Icons from "@mui/icons-material";
import { Help } from "@mui/icons-material";

/**
 * Maps icon name strings to MUI icon components
 * Returns a default icon (Help) if the icon name is not found
 * 
 * @param iconName - The name of the icon (case-insensitive, supports formats like "Store", "store", "store-icon", "store_icon")
 * @returns The corresponding MUI icon component or Help as default
 * 
 * @example
 * const Icon = getIcon("Store");
 * return <Icon />;
 * 
 * @example
 * const Icon = getIcon("add-circle"); // Returns AddCircle icon
 * return <Icon />;
 */
export const getIcon = (iconName: string | null | undefined): SvgIconComponent => {
  if (!iconName) {
    return Help;
  }

  // Normalize the icon name: capitalize first letter of each word and remove spaces/underscores/hyphens
  const normalizedName = iconName
    .trim()
    .split(/[\s_-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");

  // Try to get the icon from MUI icons
  const IconComponent = (Icons as Record<string, SvgIconComponent>)[normalizedName];

  // Return the icon if found, otherwise return the default Help icon
  return IconComponent || Help;
};
