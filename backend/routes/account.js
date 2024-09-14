const express = require("express");
const zod = require("zod");
const mongoose = require("mongoose");
const authMiddleware = require("../middleware");
const { Account } = require("../db");

const router = express.Router();

router.get("/balance", authMiddleware, async function (req, res) {
  const account = await Account.findOne({
    userId: req.userId,
  });

  res.json({
    balance: account.balance,
  });
});

// const transferBody = zod.string({
//   to: zod.string(),
//   amount: zod.number(),
// });

router.post("/transfer", authMiddleware, async function (req, res) {
  //   const { success } = transferBody.safeParse(req.body);
  //   if (!success) {
  //     return res.status(411).json({
  //       message: "Invalid transfer",
  //     });
  //   }
  const session = await mongoose.startSession();
  session.startTransaction();
  const { to, amount } = req.body;

  const account = await Account.findOne({ userId: req.userId }).session(
    session
  );
  if (!account || account.balance < amount) {
    await session.abortTransaction();
    return res.status(400).json({
      message: "Insufficient balance",
    });
  }
  const toAccount = await Account.findOne({ userId: to }).session(session);
  if (!toAccount) {
    await session.abortTransaction();
    return res.status(400).json({
      message: "Insufficient account",
    });
  }

  // If account is there in senders balance is greater than amount then we wil perform the transfer..!

  await Account.updateOne(
    { userId: req.userId },
    {
      $inc: {
        balance: -amount,
      },
    }
  ).session(session);
  await Account.updateOne(
    { userId: to },
    {
      $inc: {
        balance: amount,
      },
    }
  ).session(session);

  // Now we will commit the transaction
  await session.commitTransaction();
  res.json({
    message: "Transfer Successful",
  });
});

module.exports = router;
