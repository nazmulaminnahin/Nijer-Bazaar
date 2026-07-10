// Mock API bridges for Bangladeshi logistics. In production these would call
// real endpoints with credentials loaded from the settings table.

export interface CourierOrderPayload {
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  amount: number;
  itemDescription: string;
}

export type CourierProvider = "ecomdrive" | "steadfast" | "pathao";

export interface CourierResult {
  ok: boolean;
  trackingId?: string;
  message: string;
  provider: CourierProvider;
}

// Mocked dispatcher — wire to real endpoints by replacing the fetch URL + auth.
export async function sendToCourier(
  provider: CourierProvider,
  payload: CourierOrderPayload,
): Promise<CourierResult> {
  // Simulated network delay
  await new Promise((r) => setTimeout(r, 600));
  const trackingId = `${provider.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
  return {
    ok: true,
    trackingId,
    provider,
    message: `Mock: order ${payload.orderNumber} accepted by ${provider}`,
  };
}
