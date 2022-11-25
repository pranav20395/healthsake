import nextConnect from "next-connect";
import multer from "multer";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import { getUserFromCookie } from "@/server/context";
import { prisma } from "@/db/prisma";

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};

type NextApiRequestWithFormData = NextApiRequest &
  Request & {
    file: any;
    userId: string | null;
  };

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, "../../../../uploads"));
    },
    filename: (req, file, cb) =>
      cb(
        null,
        "healthsake_assets" +
          new Date().toISOString() +
          file.originalname.replaceAll(" ", "-")
      ),
  }),
});

const uploadFiles = nextConnect<NextApiRequestWithFormData, NextApiResponse>({
  onError(error, req, res) {
    res
      .status(501)
      .json({ error: `Sorry something Happened! ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

uploadFiles
  .use(async (req: NextApiRequestWithFormData, res, next) => {
    const userFromReq = await getUserFromCookie(req);
    if (userFromReq) {
      const user = await prisma.user.findUnique({
        where: {
          id: userFromReq.id,
        },
      });
      if (user) {
        req.userId = user.id;
        next();
      } else {
        res.status(401).json({ error: `Not authenticated` });
      }
    } else {
      res.status(401).json({ error: `Not authenticated` });
    }
  })
  .use(upload.single("file"))
  .post(async (req, res) => {
    const { file, userId } = req;
    const { filename, mimetype } = file;
    const url = `${process.env.BASE_URL}file/` + filename;

    if (userId) {
      res.status(200).json({
        url: url,
        type: mimetype,
        ownerId: userId,
        size: file.size,
        path: file.path,
      });
    } else {
      res.status(401).json({ error: `Not authenticated` });
    }
  });

export default uploadFiles;
