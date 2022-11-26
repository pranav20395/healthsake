import { NextApiRequest, NextApiResponse } from "next";
import Razorpay from "razorpay";
import shortid from "shortid";

type details = {
  amount: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).send({ message: "Only POST requests are allowed" });
  }

  const body = req.body as details;
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_TEST_KEY,
      key_secret: process.env.RAZORPAY_TEST_SECRET,
    });

    const amount = body.amount;
    const receipt = shortid.generate();

    const response = await razorpay.orders.create({
      amount: amount,
      currency: "INR",
      receipt: receipt,
    });

    console.log(response);

    return res.status(200).json({
      id: response.id,
      currency: response.currency,
      amount: response.amount,
    });
  } catch (error) {
    return res.status(500).send({ message: error ?? "Something went wrong" });
  }
}
