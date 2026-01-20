import type { Meta, StoryObj } from "@storybook/react-vite";

import { usePrompt } from "./Prompt";
import { Button } from "@mui/material";

function MyComponent() {
  const { prompt, PromptDialog } = usePrompt();

  const handleClick = async () => {
    const value = await prompt("Enter your name");

    if (value !== null) {
      console.log("User entered:", value);
    }
  };

  return (
    <>
      <Button onClick={handleClick}>Open prompt</Button>
      {PromptDialog}
    </>
  );
}
const meta = {
  component: MyComponent,
} satisfies Meta<typeof MyComponent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
