export type CheckoutDetails = {
  fullName: string;
  email: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
};

export function validateCheckout(value: unknown): CheckoutDetails {
  if (!value || typeof value !== "object") throw new Error("Please complete the checkout form.");
  const input = value as Record<string, unknown>;
  const read = (key: keyof CheckoutDetails, max: number) => {
    const text = input[key];
    if (typeof text !== "string" || text.trim().length > max) throw new Error("Please check your delivery details.");
    return text.trim();
  };
  const details: CheckoutDetails = {
    fullName: read("fullName", 120),
    email: read("email", 254).toLowerCase(),
    phone: read("phone", 30),
    streetAddress: read("streetAddress", 250),
    city: read("city", 100),
    state: read("state", 100),
  };
  if (details.fullName.length < 2) throw new Error("Enter your full name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email)) throw new Error("Enter a valid email address.");
  const digits = details.phone.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 15 || !/^[+\d()\s-]+$/.test(details.phone)) throw new Error("Enter a valid phone number.");
  if (details.streetAddress.length < 5 || details.city.length < 2 || details.state.length < 2) throw new Error("Enter your full delivery address.");
  return details;
}
