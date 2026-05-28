export const paginationPlugin = (schema) => {
  schema.statics.paginate = async function ({
    filter = {},
    page = 1,
    limit = 10,
    sort = { createdAt: -1 },
    populate = [],
  }) {
    page = Math.max(page, 1);

    limit = Math.min(limit, 100);

    const skip = (page - 1) * limit;

    const query = this.find(filter).sort(sort).skip(skip).limit(limit);

    populate.forEach((item) => {
      query.populate(item);
    });

    const [data, total] = await Promise.all([
      query,
      this.countDocuments(filter),
    ]);

    return {
      data,

      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  };
};
