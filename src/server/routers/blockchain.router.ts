import { publicProcedure, router } from "@/server/trpc";
import { deployFile } from "@/utils/validation/file";
import axios from "axios";

const CONTRACT_ADDRESS = "0x51e2341d4B7E0bEC1435FD3518C6cE0b1a7b0E04";
const CONTRACT_ABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "issuer_email",
        type: "string",
      },
      {
        internalType: "string",
        name: "hash",
        type: "string",
      },
      {
        internalType: "string",
        name: "uri",
        type: "string",
      },
    ],
    name: "addPres",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "issuer_email",
        type: "string",
      },
      {
        internalType: "string",
        name: "hash",
        type: "string",
      },
    ],
    name: "remPres",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "issuer_email",
        type: "string",
      },
      {
        internalType: "string",
        name: "hash",
        type: "string",
      },
    ],
    name: "verifier",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export const authRouter = router({
  deployFile: publicProcedure.input(deployFile).mutation(async (req) => {
    const { fileId } = req.input;
    const file = await req.ctx.prisma.fileStorage.findUnique({
      where: { id: fileId },
    });
    if (!file) {
      throw new Error("File not found");
    }

    const { data } = await axios.post("/api/file/hash", { fileId });

    const hash = data.hex;
  }),

  verifyFile: publicProcedure.input(deployFile).mutation(async (req) => {
    const { fileId } = req.input;
    const file = await req.ctx.prisma.fileStorage.findUnique({
      where: { id: fileId },
    });
    if (!file) {
      throw new Error("File not found");
    }

    const { data } = await axios.post("/api/file/hash", { fileId });

    const hash = data.hex;

    return file;
  }),
});
