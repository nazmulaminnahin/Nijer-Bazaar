// Modular payment framework placeholder. Each gateway exposes the same
// interface so the checkout can swap providers without UI changes.

export type PaymentGateway = "cod" | "bkash" | "nagad" | "sslcommerz";

export interface PaymentInitInput {
  orderNumber: string;
  amount: number;
  customerName: string;
  phone: string;
}

export interface PaymentInitResult {
  ok: boolean;
  redirectUrl?: string;
  message: string;
}

export const paymentGateways: Record<PaymentGateway, { label: string; logo: string }> = {
  cod: { label: "ক্যাশ অন ডেলিভারি", logo: "💵" },
  bkash: { label: "bKash", logo: "🟣" },
  nagad: { label: "Nagad", logo: "🟠" },
  sslcommerz: { label: "SSLCommerz", logo: "💳" },
};

export async function initPayment(
  gateway: PaymentGateway,
  _input: PaymentInitInput,
): Promise<PaymentInitResult> {
  if (gateway === "cod") return { ok: true, message: "Cash on Delivery — no payment required upfront." };
  return { ok: true, message: `${gateway} gateway placeholder — configure credentials in Admin → Settings.` };
}
