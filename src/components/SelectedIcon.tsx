import {
    Category,
    LocalLaundryService,
    Chair,
    Computer,
    Checkroom,
    Book,
    Toys,
    Kitchen,
    Extension,
    Phone,
    Tv,
    Watch,
    Camera,
    Headphones,
    SportsEsports,
    DirectionsBike,
    DirectionsCar,
    Home,
    Bed,
    Weekend,
    TableRestaurant,
    LocalDining,
    Coffee,
    WineBar,
    Cake,
    LocalFlorist,
    Palette,
    Brush,
    ColorLens,
    Draw,
    Create,
    Edit,
    Build,
    Construction,
    Handyman,
    ElectricalServices,
    Plumbing,
    Carpenter,
    Flag,
    PriorityHigh,
    FlagOutlined,
    ShoppingCart,
    VolunteerActivism,
    LocalShipping,
    Inventory,
    People,
} from "@mui/icons-material";
import type { SvgIconComponent } from "@mui/icons-material";
import type { SvgIconProps } from "@mui/material";

/** Named map of icon name → component for lookup */
const MuiIcons = {
    //// icon category
    Category,
    LocalLaundryService,
    Chair,
    Computer,
    Checkroom,
    Book,
    Toys,
    Kitchen,
    Extension,
    Phone,
    Tv,
    Watch,
    Camera,
    Headphones,
    SportsEsports,
    DirectionsBike,
    DirectionsCar,
    Home,
    Bed,
    Weekend,
    TableRestaurant,
    LocalDining,
    Coffee,
    WineBar,
    Cake,
    LocalFlorist,
    Palette,
    Brush,
    ColorLens,
    Draw,
    Create,
    Edit,
    Build,
    Construction,
    Handyman,
    ElectricalServices,
    Plumbing,
    Carpenter,
    //////
    ////icon planning form
    Flag,
    PriorityHigh,
    FlagOutlined,
    ///////

    ////icon dashboard activity item
    ShoppingCart,
    VolunteerActivism,
    LocalShipping,
    Inventory,
    People,
    ///////
}as const satisfies Record<string, SvgIconComponent>;

export type MuiIconName = keyof typeof MuiIcons;

export const SelectedIcon = ({ iconName, props }: { iconName: MuiIconName | (string & {}), props?: SvgIconProps }) => {
    const IconComponent = MuiIcons[iconName as MuiIconName];
    if (!IconComponent) return null;
    return <IconComponent  {...props} />;
};
