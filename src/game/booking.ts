import { z } from "zod";

export const WHATSAPP_NUMBER = "919000000000";

export const bookingSchema = z.object({
  studentName: z
    .string()
    .trim()
    .min(1, "Enter the student's name.")
    .max(80, "Use 80 characters or fewer."),
  studentClass: z.enum(["9", "10", "11", "12"], { message: "Choose a class from 9 to 12." }),
  parentPhone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number."),
  preferredTime: z.enum(["After school · 4–6 pm", "Early evening · 6–8 pm", "Weekend · flexible"], {
    message: "Choose a preferred time.",
  }),
});

export type BookingDetails = z.infer<typeof bookingSchema>;

export function getBookingWhatsAppHref(details: BookingDetails) {
  const booking = bookingSchema.parse(details);
  const message = [
    "Hello BrightPath Classes, I would like to book a free demo class.",
    `Student: ${booking.studentName}`,
    `Class: ${booking.studentClass}`,
    `Parent phone: ${booking.parentPhone}`,
    `Preferred time: ${booking.preferredTime}`,
  ].join("\n");

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const GENERAL_WHATSAPP_HREF = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Hello BrightPath Classes, I would like to know more about your classes.",
)}`;
