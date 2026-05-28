import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
  {
    sku: String,

    attributes: {
      color: String,
      size: String,
    },

    price: Number,

    inventoryCount: Number,
  },
  { _id: false },
);

const productSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
      index: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    description: {
      type: String,
      required: true,
    },

    shortDescription: {
      type: String,
      maxlength: 500,
    },

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    images: [
      {
        publicId: String,
        url: String,
      },
    ],

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    compareAtPrice: Number,

    inventoryCount: {
      type: Number,
      default: 0,
    },

    variants: [variantSchema],

    averageRating: {
      type: Number,
      default: 0,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    salesCount: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["DRAFT", "ACTIVE", "ARCHIVED", "OUT_OF_STOCK", "BANNED"],
      default: "DRAFT",
      index: true,
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

productSchema.index({
  title: "text",
  description: "text",
});

productSchema.index({
  category: 1,
  price: 1,
});

productSchema.index({
  seller: 1,
  createdAt: -1,
});

export default mongoose.model("Product", productSchema);
