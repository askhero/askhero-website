import { z } from "zod";
import { isValidEmail, isValidPhone } from "@/lib/form-validation";
import { askHeroLaunchMarkets } from "@/lib/markets";

const email = z.string().trim().email().max(254);
const strictEmail = z.string().trim().max(254).refine(isValidEmail, "Please enter a valid email address.");
const shortText = z.string().trim().min(1).max(120);
const optionalText = z.string().trim().max(120).optional().or(z.literal(""));
const phone = z.string().trim().max(30).refine(isValidPhone, "Please enter a valid 10-digit phone number.");

export const waitlistSchema = z.object({
  first_name: shortText,
  last_name: shortText,
  email,
  city: optionalText,
  role: z.enum(["Buyer", "Seller", "Realtor", "Investor"]),
});

export const contactSchema = z.object({
  name: shortText,
  email,
  phone: optionalText,
  subject: optionalText,
  message: z.string().trim().min(5).max(2000),
  sourcePage: z.string().trim().max(240).optional().or(z.literal("")),
  company: z.string().optional(),
});

export const realtorSchema = z.object({
  name: shortText,
  email: strictEmail,
  phone,
  brokerage: shortText,
  market: z.enum(askHeroLaunchMarkets, { message: "Please select your market." }),
});

const numericText = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) return undefined;
  return Number(value);
}, z.number().finite().optional());

export const listingSchema = z.object({
  address_line_1: shortText,
  address_line_2: optionalText,
  city: shortText,
  state: z.string().trim().min(2).max(40),
  zip: z.string().trim().min(3).max(20),
  latitude: numericText,
  longitude: numericText,
  price: numericText,
  beds: numericText,
  baths: numericText,
  sqft: numericText,
  lot_size: numericText,
  year_built: numericText,
  property_type: optionalText,
  status: z.enum(["coming_soon", "active", "pending", "sold", "off_market"]).default("coming_soon"),
  description: z.string().trim().max(4000).optional().or(z.literal("")),
  listing_agent_name: optionalText,
  listing_agent_email: z.string().trim().email().optional().or(z.literal("")),
  listing_agent_phone: optionalText,
  brokerage_name: optionalText,
  company: z.string().optional(),
});

export const leadSchema = z.object({
  listing_id: z.string().uuid().optional(),
  first_name: shortText,
  last_name: shortText,
  email,
  phone: optionalText,
  message: z.string().trim().min(3).max(1200),
  company: z.string().optional(),
});

export function cleanOptional(value: string | undefined) {
  return value && value.length > 0 ? value : null;
}
