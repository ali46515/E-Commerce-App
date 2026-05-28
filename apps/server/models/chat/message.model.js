import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["IMAGE", "VIDEO", "PDF"],
    },

    publicId: String,

    url: String,
  },
  { _id: false },
);

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    message: {
      type: String,
      maxlength: 5000,
    },

    attachments: [attachmentSchema],

    isRead: {
      type: Boolean,
      default: false,
    },

    readAt: Date,
  },
  {
    timestamps: true,
  },
);

messageSchema.index({
  conversation: 1,
  createdAt: -1,
});

export default mongoose.model("Message", messageSchema);
