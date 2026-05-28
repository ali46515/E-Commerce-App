export const toJSONPlugin = (schema) => {
  schema.set("toJSON", {
    virtuals: true,

    transform(doc, ret) {
      delete ret.__v;

      delete ret.passwordHash;

      return ret;
    },
  });
};
