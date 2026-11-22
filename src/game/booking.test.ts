import { describe, expect, it } from "vitest";

import { bookingSchema, getBookingWhatsAppHref, WHATSAPP_NUMBER } from "./booking";

describe("free demo enquiry", () => {
  it("accepts a 10-digit Indian parent mobile number", () => {
    expect(
      bookingSchema.safeParse({
        studentName: "Aarav",
        studentClass: "9",
        parentPhone: "9876543210",
        preferredTime: "After school · 4–6 pm",
      }).success,
    ).toBe(true);
  });

  it("does not create a WhatsApp link for a malformed parent phone", () => {
    expect(
      bookingSchema.safeParse({
        studentName: "Aarav",
        studentClass: "9",
        parentPhone: "12345",
        preferredTime: "After school · 4–6 pm",
      }).success,
    ).toBe(false);
  });

  it("encodes a validated enquiry for the requested placeholder number", () => {
    const href = getBookingWhatsAppHref({
      studentName: "A & B",
      studentClass: "12",
      parentPhone: "9876543210",
      preferredTime: "Weekend · flexible",
    });
    const url = new URL(href);

    expect(url.pathname).toBe(`/${WHATSAPP_NUMBER}`);
    expect(url.searchParams.get("text")).toContain("Student: A & B");
  });
});
