import slugify from "slugify";

export const slugPlugin = (schema, options) => {
  schema.pre("validate", function (next) {
    if (this[options.sourceField]) {
      this[options.targetField] = slugify(this[options.sourceField], {
        lower: true,
        strict: true,
        trim: true,
      });
    }

    next();
  });
};
