import { Router } from "express";
import crypto from "crypto";

export const razorpayWebhook = Router();

razorpayWebhook.post("/webhooks/razorpay", (req, res) => {
  const signature = req.headers["x-razorpay-signature"] as string;
  const body = JSON.stringify(req.body);

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");

  if (expected !== signature) {
    return res.status(400).json({ error: "Invalid signature" });
  }

  const event = req.body.event;
  console.log("Webhook Received:", event);

  res.json({ received: true });
});
