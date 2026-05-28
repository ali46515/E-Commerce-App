import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
      index: true,
    },

    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    title: {
      type: String,
      maxlength: 200,
    },

    comment: {
      type: String,
      maxlength: 5000,
    },

    images: [
      {
        publicId: String,
        url: String,
      },
    ],

    isVerifiedPurchase: {
      type: Boolean,
      default: true,
    },

    moderationStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "APPROVED",
    },

    helpfulVotes: {
      type: Number,
      default: 0,
    },

    reportedCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

reviewSchema.index(
  {
    product: 1,
    buyer: 1,
  },
  {
    unique: true,
  },
);

reviewSchema.index({
  seller: 1,
  rating: -1,
});

export default mongoose.model("Review", reviewSchema);
