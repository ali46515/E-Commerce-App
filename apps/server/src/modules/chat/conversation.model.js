import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      index: true,
    },

    dispute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dispute",
    },

    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },

    unreadCounts: {
      buyer: {
        type: Number,
        default: 0,
      },

      seller: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  },
);

conversationSchema.index({
  participants: 1,
});

export default mongoose.model("Conversation", conversationSchema);
