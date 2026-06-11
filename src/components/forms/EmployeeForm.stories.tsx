import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Paper } from "@mui/material";
import { useState } from "react";
import { mockStores, noopSubmit } from "../../stories/fixtures";
import { EmployeeForm } from "./EmployeeForm";

const meta = {
  title: "Forms/EmployeeForm",
  component: EmployeeForm,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Employee profile form (name, phone, store assignment, active flag). Submit via external button using formId.",
      },
    },
  },
  args: {
    formId: "employee-form",
    stores: mockStores,
    onSubmit: noopSubmit,
  },
} satisfies Meta<typeof EmployeeForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSubmitButton: Story = {
  render: (args) => {
    const [result, setResult] = useState<unknown>(null);
    return (
      <Paper sx={{ p: 2 }}>
        <EmployeeForm
          {...args}
          onSubmit={(data) => {
            noopSubmit(data);
            setResult(data);
          }}
        />
        <Button type="submit" form={args.formId} variant="contained" sx={{ mt: 2 }}>
          Enregistrer
        </Button>
        {result !== null && (
          <pre style={{ marginTop: 16, fontSize: 12 }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </Paper>
    );
  },
};
