import mongoose from "mongoose";

const evidenceSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["IMAGE", "VIDEO", "PDF"],
    },

    publicId: String,

    url: String,

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

const disputeEventSchema = new mongoose.Schema(
  {
    action: String,

    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    actorRole: {
      type: String,
      enum: ["BUYER", "SELLER", "ADMIN", "SYSTEM"],
    },

    message: String,

    metadata: mongoose.Schema.Types.Mixed,

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const disputeSchema = new mongoose.Schema(
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

    disputeReason: {
      type: String,
      enum: [
        "DAMAGED_ITEM",
        "WRONG_ITEM",
        "MISSING_ITEM",
        "COUNTERFEIT",
        "NOT_DELIVERED",
        "OTHER",
      ],
      required: true,
    },

    description: {
      type: String,
      required: true,
      maxlength: 5000,
    },

    status: {
      type: String,
      enum: [
        "OPEN",
        "SELLER_RESPONDED",
        "UNDER_REVIEW",
        "ESCALATED",
        "RESOLVED",
        "REJECTED",
      ],
      default: "OPEN",
      index: true,
    },

    resolutionType: {
      type: String,
      enum: ["FULL_REFUND", "PARTIAL_REFUND", "REDELIVERY", "REJECTED"],
    },

    refundAmount: {
      type: Number,
      default: 0,
    },

    evidenceFiles: [evidenceSchema],

    responseDeadline: {
      type: Date,
      required: true,
      index: true,
    },

    sellerRespondedAt: Date,

    escalatedAt: Date,

    resolvedAt: Date,

    adminNotes: String,

    timeline: [disputeEventSchema],
  },
  {
    timestamps: true,
  },
);

disputeSchema.index({
  status: 1,
  responseDeadline: 1,
});

export default mongoose.model("Dispute", disputeSchema);
