import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

wishlistSchema.index(
  {
    buyer: 1,
    product: 1,
  },
  {
    unique: true,
  },
);

export default mongoose.model("Wishlist", wishlistSchema);
