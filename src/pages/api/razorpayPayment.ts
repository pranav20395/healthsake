import { getUserFromCookie } from "@/server/context";
import { NextApiRequest, NextApiResponse } from "next";
import Razorpay from "razorpay";
import shortid from "shortid";
import { prisma } from "@/db/prisma";

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

  const userFromReq = await getUserFromCookie(req);
  if (!userFromReq) {
    return res.status(401).send({ message: "Unauthorized" });
  }
  const user = await prisma.user.findUnique({
    where: {
      id: userFromReq.id,
    },
  });
  if (!user || !user.id) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const body = req.body as details;
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_TEST_KEY,
      key_secret: process.env.RAZORPAY_TEST_SECRET,
    });

    const amount = body.amount;
    const receipt = shortid.generate();

    const receiptUpload = await prisma.razorpayReceipts.create({
      data: {
        receipt: receipt,
        amount: Number(amount.slice(0, -2)),
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    if (!receiptUpload) {
      return res.status(500).send({ message: "Something went wrong" });
    }

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
      receipt: receipt,
    });
  } catch (error) {
    return res.status(500).send({ message: error ?? "Something went wrong" });
  }
}
