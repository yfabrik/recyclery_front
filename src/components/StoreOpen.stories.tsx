import type { Meta, StoryObj } from '@storybook/react-vite';

import { StoreOpen } from './StoreOpen';

const meta = {
  component: StoreOpen,
  args:{
    handleDeleteHours:()=>{},
    handleOpenHoursDialog:()=>{},
    store:{id:1,name:"aaaaa"},
    hours:[]
  }
} satisfies Meta<typeof StoreOpen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};