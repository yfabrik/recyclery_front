import type { Meta, StoryObj } from '@storybook/react-vite';

import { storeOpen } from './StoreOpen';

const meta = {
  component: storeOpen,
  args:{
    handleDeleteHours:()=>{},
    handleOpenHoursDialog:()=>{},
    store:{id:1,name:"aaaaa"},
    hours:[]
  }
} satisfies Meta<typeof storeOpen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};