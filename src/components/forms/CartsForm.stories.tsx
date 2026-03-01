import type { Meta, StoryObj } from '@storybook/react-vite';
import { useFieldArray, useForm } from "react-hook-form"
import { CartsForm, type CartsSchema } from './CartsForm';


const CartF = () => {
  const form = useForm<CartsSchema>({
    defaultValues: {
      carts: [
        {
          cart: [{ barcode: "0001", category_id: 1, category_name: "aaa", description: "", name: "artcile", price: 50, quantity: 2, subcategory_id: 2, subcategory_name: "bbb", weight: 2.5 }]
        }, {
          cart: [{ barcode: "0002", category_id: 1, category_name: "aaa", description: "", name: "artcile", price: 50, quantity: 2, subcategory_id: 2, subcategory_name: "bbb", weight: 2.5 }]
        },    {
          cart: [{ barcode: "0003", category_id: 1, category_name: "aaa", description: "", name: "artcile", price: 50, quantity: 2, subcategory_id: 2, subcategory_name: "bbb", weight: 2.5 }]
        }
      ]
    }
  })
  return (
    <CartsForm form={form} />
  )
}

const meta = {
  component: CartF,

} satisfies Meta<typeof CartF>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};


