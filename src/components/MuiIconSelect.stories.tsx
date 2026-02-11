import type { Meta, StoryObj } from '@storybook/react-vite';

import { MuiIconSelect } from './MuiIconSelect';
import { useState } from 'react';

const meta = {
  component: MuiIconSelect,
} satisfies Meta<typeof MuiIconSelect>;

export default meta;

type Story = StoryObj<typeof meta>;
export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>(null);
     const icons=[
     "Category",
     "LocalLaundryService",
     "Chair",
     "Computer",
     "Checkroom",
     "Book",
     "Toys",
     "Kitchen",
     "Extension",
     "Phone",
     "Tv",
     "Watch",
     "Camera",
     "Headphones",
     "SportsEsports",
     "DirectionsBike",
     "DirectionsCar",
     "Home",
     "Bed",
     "Weekend",
     "TableRestaurant",
     "LocalDining",
     "Coffee",
     "WineBar",
     "Cake",
     "LocalFlorist",
     "Palette",
     "Brush",
     "ColorLens",
     "Draw",
     "Create",
     "Edit",
     "Build",
     "Construction",
     "Handyman",
     "ElectricalServices",
     "Plumbing",
     "Carpenter",]
    return <MuiIconSelect value={value} onChange={setValue} TextFieldProps={{}} iconNames={icons} />;
  },
};