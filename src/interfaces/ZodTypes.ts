import z from "zod";

export const phoneSchema = z
  .string()
  .regex(/^[0-9+\-()\s]+$/, "Invalid phone");