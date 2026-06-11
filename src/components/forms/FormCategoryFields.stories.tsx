import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box, Paper } from "@mui/material";
import { useForm } from "react-hook-form";
import { mockCategories } from "../../stories/fixtures";
import {
  FormCategorySelect,
  FormCategorySubcategoryFields,
  FormSubcategorySelect,
} from "./FormBase";

type FormValues = {
  category_id: number | "";
  subcategory_id: number | "" | null;
};

function CategorySelectDemo() {
  const form = useForm<FormValues>({
    defaultValues: { category_id: "", subcategory_id: "" },
  });
  return (
    <Paper sx={{ p: 2, maxWidth: 400 }}>
      <FormCategorySelect
        control={form.control}
        name="category_id"
        categories={mockCategories}
        label="Catégorie"
      />
    </Paper>
  );
}

function SubcategorySelectDemo() {
  const form = useForm<FormValues>({
    defaultValues: { category_id: 1, subcategory_id: "" },
  });
  return (
    <Paper sx={{ p: 2, maxWidth: 400 }}>
      <FormSubcategorySelect
        control={form.control}
        setValue={form.setValue}
        subcategoryFieldName="subcategory_id"
        categoryFieldName="category_id"
        categories={mockCategories}
        label="Sous-catégorie"
        hideWhenEmpty={false}
      />
    </Paper>
  );
}

function CompoundFieldsDemo() {
  const form = useForm<FormValues>({
    defaultValues: { category_id: "", subcategory_id: "" },
  });
  return (
    <Box sx={{ maxWidth: 720 }}>
      <FormCategorySubcategoryFields
        control={form.control}
        setValue={form.setValue}
        categories={mockCategories}
      />
    </Box>
  );
}

const meta = {
  title: "Forms/FormCategoryFields",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Isolated FormBase category/subcategory selects. Use FormCategorySubcategoryFields in full forms for the two-column layout.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const CategorySelect: Story = {
  render: () => <CategorySelectDemo />,
};

export const SubcategorySelect: Story = {
  render: () => <SubcategorySelectDemo />,
};

export const CategorySubcategoryFields: Story = {
  render: () => <CompoundFieldsDemo />,
};
