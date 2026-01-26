import type { Meta, StoryObj } from "@storybook/react-vite";

import { usePrompt } from "./Prompt";
import { Button, Box, Typography } from "@mui/material";
import { useState } from "react";

interface PromptStoryProps {
  message: string;
  defaultValue: string;
  mode: "numeric" | "money";
  unit: string;
}

function PromptStoryComponent({
  message,
  defaultValue,
  mode,
  unit,
}: PromptStoryProps) {
  const { prompt, PromptDialog } = usePrompt();
  const [result, setResult] = useState<string | null>(null);

  const handleClick = async () => {
    const value = await prompt(message, defaultValue, {
      mode,
      unit,
    });

    if (value !== null) {
      setResult(value);
      console.log("User entered:", value);
    } else {
      setResult("Cancelled");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Button onClick={handleClick} variant="contained" sx={{ mb: 2 }}>
        Open prompt
      </Button>
      {result !== null && (
        <Typography variant="body1" sx={{ mt: 2 }}>
          Result: <strong>{result}</strong>
        </Typography>
      )}
      {PromptDialog}
    </Box>
  );
}

const meta = {
  component: PromptStoryComponent,
  title: "Components/Prompt",
  parameters: {
    layout: "centered",
  },
  argTypes: {
    message: {
      control: "text",
      description: "The message/title to display in the prompt dialog",
    },
    defaultValue: {
      control: "text",
      description: "The default value to show in the prompt",
    },
    mode: {
      control: "select",
      options: ["numeric", "money"],
      description: "The mode of the prompt: numeric keypad or money counter",
    },
    unit: {
      control: "text",
      description: "The unit to display (e.g., kg, €, m)",
    },
  },
  args: {
    message: "Enter a value",
    defaultValue: "0",
    mode: "numeric",
    unit: "kg",
  },
} satisfies Meta<typeof PromptStoryComponent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    message: "Enter a value",
    defaultValue: "0",
    mode: "numeric",
    unit: "kg",
  },
};

export const NumericWithUnit: Story = {
  args: {
    message: "Enter weight",
    defaultValue: "5.5",
    mode: "numeric",
    unit: "kg",
  },
};

export const MoneyCounter: Story = {
  args: {
    message: "Count money",
    defaultValue: "0",
    mode: "money",
    unit: "€",
  },
};

export const CustomUnit: Story = {
  args: {
    message: "Enter distance",
    defaultValue: "0",
    mode: "numeric",
    unit: "m",
  },
};
