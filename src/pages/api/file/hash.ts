import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import { prisma } from "@/db/prisma";
import * as crypto from "crypto";

const hash = async (req: NextApiRequest, res: NextApiResponse) => {
  const { fileId, path } = req.body;

  const file = await prisma.fileStorage.findUnique({
    where: { id: fileId },
  });
  if (!file) {
    throw new Error("File not found");
  }

  const buffer = fs.readFileSync(path);

  const hashSum = crypto.createHash("sha256");

  hashSum.update(buffer);

  const hex = hashSum.digest("hex");

  res.status(200).json({ hash: hex });
};

export default hash;
