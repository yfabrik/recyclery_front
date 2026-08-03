import type { FieldPath, FieldValues, PathValue, UseFormReturn } from "react-hook-form";
import type { PromptFn, PromptOptions } from "../components/Prompt";

type NumericFieldPath<T extends FieldValues> = {
    [K in FieldPath<T>]: PathValue<T, K> extends number|"" ? K : never;
  }[FieldPath<T>];

export const createPromptNumericValue=<T extends FieldValues,K>(form:UseFormReturn<T,unknown,K>,prompt:PromptFn)=>{
    return  async(name:NumericFieldPath<T>,unit:string|PromptOptions)=>{
      const promptOptions = typeof unit === "string" ? { unit } : unit;
        const value = Number(
          (await prompt("", form.getValues(name)?.toString() || "", promptOptions)) ?? 0,
        );
        form.setValue(name, value as PathValue<T, FieldPath<T>>, {
          shouldDirty: true,
          shouldTouch: true,
        });
      }
}