import * as trpc from "@trpc/server";
import { router } from "@/server/trpc";
import { spendWallet, topUpWallet } from "@/utils/validation/wallet";
import { approvedUserProcedure } from "./user.router";

export const walletRouter = router({
  getWalletDetails: approvedUserProcedure.query(async (req) => {
    const { ctx } = req;
    const user = await ctx.prisma.user.findUnique({
      where: {
        id: ctx.user.id,
      },
      include: {
        wallet: true,
      },
    });
    if (!user) {
      throw new trpc.TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }
    return user.wallet;
  }),
  getWalletTransactions: approvedUserProcedure.query(async (req) => {
    const { ctx } = req;
    const user = await ctx.prisma.user.findUnique({
      where: {
        id: ctx.user.id,
      },
      include: {
        wallet: {},
      },
    });

    if (!user || !user.wallet) {
      throw new trpc.TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    const transactions = await ctx.prisma.transaction.findMany({
      where: {
        OR: [
          {
            recvWalletId: user.wallet.id,
          },
          {
            sendWalletId: user.wallet.id,
          },
        ],
      },
      orderBy: {
        timestamp: "desc",
      },
    });

    // get name details of two parties
    const recvwalletIds = transactions.map((t) => t.recvWalletId);
    const sendwalletIds = transactions.map((t) => t.sendWalletId);
    const walletIds = [...recvwalletIds, ...sendwalletIds];
    const userOfWallets = await ctx.prisma.user.findMany({
      where: {
        wallet: {
          id: {
            in: walletIds,
          },
        },
      },
      select: {
        name: true,
        wallet: {
          select: {
            id: true,
          },
        },
      },
    });

    const transactionsWithNames = transactions.map((t) => {
      const recvUser = userOfWallets.find(
        (u) => u.wallet!.id === t.recvWalletId
      );
      const sendUser = userOfWallets.find(
        (u) => u.wallet!.id === t.sendWalletId
      );
      return {
        id: t.id,
        amount: t.amount,
        timestamp: t.timestamp,
        recvName: recvUser?.name,
        sendName: sendUser?.name,
      };
    });

    return transactionsWithNames;
  }),
  spendWallet: approvedUserProcedure
    .input(spendWallet)
    .mutation(async (req) => {
      const { ctx, input } = req;
      const { amount, otp, userId } = await spendWallet.parseAsync(input);
      const user = await ctx.prisma.user.findUnique({
        where: {
          id: ctx.user.id,
        },
        include: {
          wallet: true,
        },
      });

      if (!user || !user.wallet) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      if (user.wallet.balance < amount) {
        throw new trpc.TRPCError({
          code: "BAD_REQUEST",
          message: "Insufficient funds",
        });
      }

      const recvUser = await ctx.prisma.user.findUnique({
        where: {
          id: userId,
        },
        include: {
          wallet: true,
        },
      });

      if (!recvUser || !recvUser.wallet) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const transaction = await ctx.prisma.transaction.create({
        data: {
          amount: amount,
          sendWalletId: user.wallet.id,
          recvWalletId: recvUser.id,
        },
      });

      await ctx.prisma.wallet.update({
        where: {
          id: user.wallet.id,
        },
        data: {
          balance: {
            decrement: amount,
          },
        },
      });

      await ctx.prisma.wallet.update({
        where: {
          id: recvUser.wallet.id,
        },
        data: {
          balance: {
            increment: amount,
          },
        },
      });

      return transaction;
    }),
  topUpWallet: approvedUserProcedure
    .input(topUpWallet)
    .mutation(async (req) => {
      const { ctx, input } = req;
      const { amount, receipt } = await topUpWallet.parseAsync(input);
      const user = await ctx.prisma.user.findUnique({
        where: {
          id: ctx.user.id,
        },
        include: {
          wallet: true,
        },
      });

      if (!user || !user.wallet) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const razorpayReceipt = await ctx.prisma.razorpayReceipts.findUnique({
        where: {
          receipt,
        },
      });

      if (!razorpayReceipt) {
        throw new trpc.TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid receipt",
        });
      }

      if (razorpayReceipt.amount !== amount) {
        throw new trpc.TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid receipt",
        });
      }

      if (razorpayReceipt.userId !== user.id) {
        throw new trpc.TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid receipt",
        });
      }

      const transaction = await ctx.prisma.transaction.create({
        data: {
          amount: amount,
          sendWalletId: user.wallet.id,
          recvWalletId: user.wallet.id,
        },
      });

      await ctx.prisma.wallet.update({
        where: {
          id: user.wallet.id,
        },
        data: {
          balance: {
            increment: amount,
          },
        },
      });

      return transaction;
    }),
});
