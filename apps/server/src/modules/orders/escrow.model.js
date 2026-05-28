import mongoose from "mongoose";

const escrowEventSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      enum: ["HELD", "FROZEN", "RELEASED", "PARTIAL_REFUND", "FULL_REFUND"],
    },

    amount: Number,

    metadata: mongoose.Schema.Types.Mixed,

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const escrowSchema = new mongoose.Schema(
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

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },

    paymentIntentId: {
      type: String,
      required: true,
      index: true,
    },

    escrowStatus: {
      type: String,
      enum: [
        "HELD",
        "PENDING_RELEASE",
        "FROZEN",
        "PARTIALLY_REFUNDED",
        "REFUNDED",
        "RELEASED",
      ],
      default: "HELD",
      index: true,
    },

    heldAmount: {
      type: Number,
      required: true,
    },

    releasedAmount: {
      type: Number,
      default: 0,
    },

    refundedAmount: {
      type: Number,
      default: 0,
    },

    frozenAmount: {
      type: Number,
      default: 0,
    },

    releaseDate: Date,

    releasedAt: Date,

    refundProcessedAt: Date,

    events: [escrowEventSchema],
  },
  {
    timestamps: true,
  },
);

escrowSchema.index({
  escrowStatus: 1,
  releaseDate: 1,
});

export default mongoose.model("Escrow", escrowSchema);
