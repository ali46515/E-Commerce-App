import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    actorRole: {
      type: String,
      enum: ["ADMIN", "BUYER", "SELLER"],
    },

    action: {
      type: String,
      required: true,
      index: true,
    },

    entityType: {
      type: String,
      required: true,
      index: true,
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    before: mongoose.Schema.Types.Mixed,

    after: mongoose.Schema.Types.Mixed,

    ipAddress: String,

    userAgent: String,

    metadata: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
  },
);

auditLogSchema.index({
  entityType: 1,
  entityId: 1,
  createdAt: -1,
});

export default mongoose.model("AuditLog", auditLogSchema);
