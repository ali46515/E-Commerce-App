import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    variantId: String,

    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  { _id: false },
);

const cartSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    items: [cartItemSchema],

    expiresAt: {
      type: Date,
      default: () => {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        return date;
      },
    },
  },
  {
    timestamps: true,
  },
);

cartSchema.index(
  {
    expiresAt: 1,
  },
  {
    expireAfterSeconds: 0,
  },
);

export default mongoose.model("Cart", cartSchema);
