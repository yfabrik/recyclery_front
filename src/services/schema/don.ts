import { phoneSchema } from "@recyclerie/api/primitives/zod";
import z from "zod";
import { DONATION_STATUS_VALUES } from "../../constants/donationStatuses";
import {
  noEmptyStr,
  requiredNonNegativeNumber,
} from "../../interfaces/ZodTypes";

export const donFormSchema = z.object({
  donor_name: noEmptyStr("nom requis"),
  donor_email: z.union([z.literal(""), z.email()]),
  donor_phone: z.union([z.literal(""), phoneSchema()]),
  item_description: noEmptyStr("description requise"),
  estimated_value: requiredNonNegativeNumber("valeur estimée requise"),
  weight: requiredNonNegativeNumber("poids requis"),
  status: z.enum(DONATION_STATUS_VALUES),
});

export type DonFormOutput = z.infer<typeof donFormSchema>;
export type DonFormValues = z.input<typeof donFormSchema>;
