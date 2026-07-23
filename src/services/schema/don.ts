import z from "zod";
import { noEmptyStr, nullString } from "../../interfaces/ZodTypes";
import { phoneSchema } from "@recyclerie/api/primitives/zod";
import { DONATION_STATUS_VALUES } from "../../constants/donationStatuses";

export const donFormSchema = z.object({
    donor_name: noEmptyStr("nom requis"),
    donor_email: z.union([nullString(),z.email()]),
    donor_phone: z.union([nullString(),phoneSchema()]),
    // donor_contact: z.union([z.email(), phoneSchema(), z.literal("").transform(() => null)]),
    item_description: noEmptyStr("description requise"),
    estimated_value: z.coerce.number().min(0),
    weight: z.preprocess(
      (v) => (v === "" ? undefined : v),
      // z.union([
        // z.undefined().refine(() => false, { message: "Poids requis" }),
        z.coerce.number("poids requis").min(0),
      // ])
    ) as z.ZodType<number>,//TODO remake
    status: z.enum(DONATION_STATUS_VALUES),
  });

export type DonFormOutput = z.infer<typeof donFormSchema>;
export type DonFormValues = z.input<typeof donFormSchema>;
