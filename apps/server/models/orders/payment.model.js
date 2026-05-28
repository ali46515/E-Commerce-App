import mongoose from "mongoose";

const transactionEventSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      enum: [
        "PAYMENT_CREATED",
        "PAYMENT_CAPTURED",
        "PAYMENT_FAILED",
        "REFUND_INITIATED",
        "REFUND_COMPLETED",
        "CHARGEBACK",
        "ESCROW_HELD",
        "ESCROW_RELEASED",
      ],
    },

    amount: Number,

    metadata: mongoose.Schema.Types.Mixed,

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
      index: true,
    },

    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    stripePaymentIntentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    stripeChargeId: {
      type: String,
      index: true,
    },

    currency: {
      type: String,
      default: "USD",
    },

    amount: {
      type: Number,
      required: true,
    },

    platformCommission: {
      type: Number,
      default: 0,
    },

    paymentStatus: {
      type: String,
      enum: [
        "PENDING",
        "AUTHORIZED",
        "CAPTURED",
        "FAILED",
        "REFUNDED",
        "PARTIALLY_REFUNDED",
        "CHARGEBACK",
      ],
      default: "PENDING",
      index: true,
    },

    transactionHistory: [transactionEventSchema],

    refundedAmount: {
      type: Number,
      default: 0,
    },

    chargebackAmount: {
      type: Number,
      default: 0,
    },

    paidAt: Date,

    refundedAt: Date,

    failedAt: Date,
  },
  {
    timestamps: true,
  },
);

paymentSchema.index({
  paymentStatus: 1,
  createdAt: -1,
});

export default mongoose.model("Payment", paymentSchema);
