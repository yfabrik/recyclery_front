import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { noopSubmit } from "../../stories/fixtures";
import { CategorieForm } from "./CategorieForm";

const categoryIcons = [
  "Tv",
  "Watch",
  "Camera",
  "Headphones",
  "SportsEsports",
  "DirectionsBike",
  "DirectionsCar",
  "Home",
  "Bed",
];

const meta = {
  title: "Forms/CategorieForm",
  component: CategorieForm,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Category create/edit form with icon picker, default weight/price, and bundle pricing.",
      },
    },
  },
  args: {
    formId: "categorie-form",
    defaultValues: {},
    onSubmit: noopSubmit,
    icons: categoryIcons,
  },
} satisfies Meta<typeof CategorieForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SubmitNumericFields: Story = {
  args: {
    onSubmit: fn((data: unknown) => data).mockName("onSubmit"),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.clear(canvas.getByLabelText(/Nom de la catégorie/i));
    await userEvent.type(
      canvas.getByLabelText(/Nom de la catégorie/i),
      "Test Cat",
    );

    const price = canvas.getByLabelText(/prix par défaut/i);
    await userEvent.clear(price);
    await userEvent.type(price, "12.5");

    const weight = canvas.getByLabelText(/poids par défaut/i);
    await userEvent.clear(weight);
    await userEvent.type(weight, "2");

    await userEvent.click(canvas.getByRole("button", { name: /Submit/i }));

    await expect(args.onSubmit).toHaveBeenCalled();
    const payload = args.onSubmit.mock.calls[0]?.[0] as {
      defaultPrice: unknown;
      defaultWeight: unknown;
      name: string;
    };
    expect(typeof payload.defaultPrice).toBe("number");
    expect(payload.defaultPrice).toBe(12.5);
    expect(typeof payload.defaultWeight).toBe("number");
    expect(payload.defaultWeight).toBe(2);
    expect(payload.name).toBe("Test Cat");
  },
};
