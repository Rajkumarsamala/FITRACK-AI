import { Router } from "express";
import crypto from "crypto";
import { createOrderINR } from "./razorpayClient";

export const razorpayRoutes = Router();

razorpayRoutes.post("/payments/razorpay/order", async (req, res) => {
  try {
    const { amountInINR, plan } = req.body || {};
    if (!amountInINR || amountInINR <= 0) {
      return res.status(400).json({ error: "amountInINR required" });
    }

    const order = await createOrderINR({
      amountInINR,
      receipt: `ord_${Date.now()}`,
      notes: { plan: plan || "default" },
    });

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

razorpayRoutes.post("/payments/razorpay/verify", async (req, res) => {
  const {
    userId,
    plan,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body || {};

  if (!userId || !plan || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ ok: false, error: "Missing fields" });
  }

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expected !== razorpay_signature) {
    return res.status(400).json({ ok: false, error: "Invalid signature" });
  }

  // Mark user premium here in your DB
  console.log("Payment verified for user:", userId, "plan:", plan);

  return res.json({ ok: true });
});
