export const softDeletePlugin = (schema) => {
  schema.add({
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  });

  schema.methods.softDelete = async function () {
    this.isDeleted = true;
    this.deletedAt = new Date();

    return this.save();
  };

  schema.methods.restore = async function () {
    this.isDeleted = false;
    this.deletedAt = null;

    return this.save();
  };

  schema.pre(/^find/, function (next) {
    if (!this.getQuery().includeDeleted) {
      this.where({
        isDeleted: false,
      });
    }

    next();
  });
};
