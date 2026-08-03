import type { Meta, StoryObj } from "@storybook/react-vite";

import { usePrompt } from "./Prompt";
import { Button, Box, Typography } from "@mui/material";
import { useState } from "react";

/**
 * # Prompt (usePrompt)
 *
 * Hook that shows a modal prompt with either a **numeric keypad** or a **money counter**.
 * Use it when you need the user to enter a weight, amount, or count cash.
 *
 * ## Usage
 *
 * ```tsx
 * const { prompt, PromptDialog } = usePrompt();
 *
 * const handleClick = async () => {
 *   const value = await prompt("Enter weight (kg)", "0", { mode: "numeric", unit: "kg" });
 *   if (value !== null) {
 *     console.log("User entered:", value);
 *   }
 * };
 *
 * return (
 *   <>
 *     <button onClick={handleClick}>Open</button>
 *     {PromptDialog}
 *   </>
 * );
 * ```
 *
 * ## Modes
 *
 * - **numeric**: Keypad with digits, decimal, backspace. Optional unit (kg, m, etc.).
 * - **money**: Cash counter with +/- and denomination buttons (e.g. €).
 *
 * ## Testing
 *
 * - **In Storybook**: Use the "Open prompt" button and interact with the dialog.
 * - **Automated**: Run `npx vitest run` — the Storybook Vitest addon runs this story in a browser and executes the `play` function (opens dialog, checks title).
 * - **Unit tests**: See `Prompt.test.tsx` for testing `usePrompt()` and the returned promise.
 */

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
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Modal prompt powered by `usePrompt()`: numeric keypad or money counter. Resolves with the entered string or `null` if cancelled.",
      },
    },
  },
  argTypes: {
    message: {
      control: "text",
      description: "Title/message shown in the dialog.",
    },
    defaultValue: {
      control: "text",
      description: "Initial value in the prompt.",
    },
    mode: {
      control: "select",
      options: ["numeric", "money"],
      description: "Numeric keypad or money counter UI.",
    },
    unit: {
      control: "text",
      description: "Unit label (e.g. kg, €, m).",
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

/** Default numeric prompt with kg unit. */
export const Default: Story = {
  args: {
    message: "Enter a value",
    defaultValue: "0",
    mode: "numeric",
    unit: "kg",
  },
};

/** Numeric prompt for weight with a pre-filled value. */
export const NumericWithUnit: Story = {
  args: {
    message: "Enter weight",
    defaultValue: "5.5",
    mode: "numeric",
    unit: "kg",
  },
};

/** Money counter for counting cash (€). */
export const MoneyCounter: Story = {
  args: {
    message: "Count money",
    defaultValue: "0",
    mode: "money",
    unit: "€",
  },
};

/** Numeric prompt with a different unit (e.g. distance). */
export const CustomUnit: Story = {
  args: {
    message: "Enter distance",
    defaultValue: "0",
    mode: "numeric",
    unit: "m",
  },
};

/**
 * Story with a play function for the Storybook Vitest addon:
 * run `npx vitest run` to execute it in the browser (opens dialog, checks it's visible).
 */
export const WithPlayTest: Story = {
  args: {
    message: "Enter weight (kg)",
    defaultValue: "0",
    mode: "numeric",
    unit: "kg",
  },
  play: async ({ canvasElement, args }) => {
    const btn = canvasElement.querySelector("button");
    if (!btn) throw new Error("Button not found");
    (btn as HTMLButtonElement).click();
    await new Promise((r) => setTimeout(r, 300));
    const dialog = document.body.querySelector('[role="dialog"]');
    if (!dialog) throw new Error("Dialog did not open");
    if (!dialog.textContent?.includes(args.message)) {
      throw new Error(`Dialog should contain "${args.message}"`);
    }
  },
};
