import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    storeName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    storeSlug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    storeDescription: {
      type: String,
      maxlength: 2000,
    },

    verificationStatus: {
      type: String,
      enum: ["PENDING", "VERIFIED", "REJECTED", "SUSPENDED"],
      default: "PENDING",
      index: true,
    },

    stripeConnectAccountId: {
      type: String,
      index: true,
    },

    escrowBalance: {
      type: Number,
      default: 0,
    },

    availableBalance: {
      type: Number,
      default: 0,
    },

    ratingsAverage: {
      type: Number,
      default: 0,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    totalSales: {
      type: Number,
      default: 0,
    },

    disputeRate: {
      type: Number,
      default: 0,
    },

    returnRate: {
      type: Number,
      default: 0,
    },

    lateShipmentRate: {
      type: Number,
      default: 0,
    },

    trustScore: {
      type: Number,
      default: 100,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

sellerSchema.index({
  verificationStatus: 1,
  createdAt: -1,
});

export default mongoose.model("Seller", sellerSchema);
