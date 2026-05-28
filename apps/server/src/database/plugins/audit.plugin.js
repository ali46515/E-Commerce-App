export const auditPlugin = (schema) => {
  schema.add({
    createdBy: {
      type: String,
    },

    updatedBy: {
      type: String,
    },
  });

  schema.pre("save", function (next) {
    this.updatedAt = new Date();

    next();
  });
};
