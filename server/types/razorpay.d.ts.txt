// server/types/razorpay.d.ts
declare module "razorpay" {
  interface RazorpayOptions {
    key_id: string;
    key_secret: string;
  }

  interface OrderCreateRequest {
    amount: number; // in paise
    currency: string; // e.g., "INR"
    receipt?: string;
    notes?: Record<string, string>;
  }

  interface Order {
    id: string;
    amount: number;
    currency: string;
    status: string;
    [k: string]: any;
  }

  class Razorpay {
    constructor(opts: RazorpayOptions);
    orders: {
      create(params: OrderCreateRequest): Promise<Order>;
    };
  }

  export = Razorpay;
}
