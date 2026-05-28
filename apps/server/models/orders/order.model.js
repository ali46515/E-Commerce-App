import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },

    productSnapshot: {
      title: String,
      slug: String,
      image: String,
      sku: String,
      price: Number,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    unitPrice: {
      type: Number,
      required: true,
    },

    totalPrice: {
      type: Number,
      required: true,
    },
  },
  { _id: false },
);

const addressSchema = new mongoose.Schema(
  {
    fullName: String,
    phoneNumber: String,

    addressLine1: String,
    addressLine2: String,

    city: String,
    state: String,
    postalCode: String,
    country: String,
  },
  { _id: false },
);

const trackingSchema = new mongoose.Schema(
  {
    carrier: String,
    trackingNumber: String,
    trackingUrl: String,

    shippedAt: Date,
    deliveredAt: Date,
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      index: true,
    },

    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
      index: true,
    },

    items: [orderItemSchema],

    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },

    escrow: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Escrow",
    },

    dispute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dispute",
    },

    shippingAddress: addressSchema,

    billingAddress: addressSchema,

    orderStatus: {
      type: String,
      enum: [
        "PENDING_PAYMENT",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "COMPLETED",
        "CANCELLED",
        "REFUNDED",
        "DISPUTED",
      ],
      default: "PENDING_PAYMENT",
      index: true,
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "REFUNDED", "PARTIALLY_REFUNDED"],
      default: "PENDING",
    },

    shipmentStatus: {
      type: String,
      enum: ["PENDING", "SHIPPED", "IN_TRANSIT", "DELIVERED", "RETURNED"],
      default: "PENDING",
    },

    tracking: trackingSchema,

    subtotal: Number,

    shippingFee: Number,

    taxAmount: Number,

    platformFee: Number,

    totalAmount: {
      type: Number,
      required: true,
    },

    estimatedDeliveryDate: Date,

    deliveredAt: Date,

    autoReleaseAt: Date,

    notes: String,

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

orderSchema.index({
  buyer: 1,
  createdAt: -1,
});

orderSchema.index({
  seller: 1,
  orderStatus: 1,
});

orderSchema.index({
  autoReleaseAt: 1,
});

export default mongoose.model("Order", orderSchema);
