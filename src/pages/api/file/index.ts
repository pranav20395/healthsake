// Serving files from the filesystem
import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import * as mime from "mime-types";
import { getUserFromCookie } from "@/server/context";
import { prisma } from "@/db/prisma";

type NextApiRequestWithUserID = NextApiRequest &
  Request & {
    userId: string | null;
  };

const fileServe = async (
  req: NextApiRequestWithUserID,
  res: NextApiResponse
) => {
  const userFromReq = await getUserFromCookie(req);
  if (userFromReq) {
    const user = await prisma.user.findUnique({
      where: {
        id: userFromReq.id,
      },
    });
    if (user) {
      req.userId = user.id;
      const { filename } = req.query;
      const filePath = path.resolve(".", `uploads/${filename}`);
      const fileBuffer = fs.readFileSync(filePath);
      const mimeString =
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        mime.lookup(filePath.split(".").at(-1)!) || "application/pdf";
      res.setHeader("Content-Type", mimeString);
      res.status(200).send(fileBuffer);
    } else {
      res.status(401).json({ error: `Not authenticated` });
    }
  } else {
    res.status(401).json({ error: `Not authenticated` });
  }
};

export default fileServe;
