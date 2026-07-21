import type { DonationDataInput } from "@recyclerie/api/schemas/donations";
import type { DonModel } from "../../interfaces/Models";
import type { DonFormOutput, DonFormValues } from "../schema/don";

export function donationToFormValues(donation: DonModel): Partial<DonFormValues> {
    return {
      donor_name: donation.donor_name ?? "",
      donor_email: donation.donor_email ?? "",
      donor_phone: donation.donor_phone ?? "",
      item_description: donation.item_description ?? "",
      estimated_value: donation.estimated_value ?? 0,
      weight: donation.weight ?? 0,
      status: donation.status,
    };
  }

  export const donationPayloadFromForm = (data: DonFormOutput): DonationDataInput => ({...data});
