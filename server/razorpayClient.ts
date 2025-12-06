import Razorpay = require("razorpay");

const key_id = process.env.RAZORPAY_KEY_ID!;
const key_secret = process.env.RAZORPAY_KEY_SECRET!;

if (!key_id || !key_secret) {
  throw new Error("Missing RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET");
}

export const razorpay = new Razorpay({ key_id, key_secret });

export async function createOrderINR(params: {
  amountInINR: number;
  receipt?: string;
  notes?: Record<string, string>;
}) {
  const { amountInINR, receipt, notes } = params;
  return await razorpay.orders.create({
    amount: Math.round(amountInINR * 100), 
    currency: "INR",
    receipt,
    notes,
  });
}
