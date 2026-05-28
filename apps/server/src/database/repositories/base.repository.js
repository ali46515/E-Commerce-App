export class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data, options = {}) {
    const document = await this.model.create([data], options);

    return document[0];
  }

  async findById(id, options = {}) {
    return this.model.findById(id, null, options);
  }

  async findOne(filter, options = {}) {
    return this.model.findOne(filter, null, options);
  }

  async find(filter = {}, options = {}) {
    return this.model.find(filter, null, options);
  }

  async updateById(id, update, options = {}) {
    return this.model.findByIdAndUpdate(id, update, {
      new: true,
      ...options,
    });
  }

  async deleteById(id, options = {}) {
    return this.model.findByIdAndDelete(id, options);
  }

  async paginate(params) {
    return this.model.paginate(params);
  }

  async count(filter = {}) {
    return this.model.countDocuments(filter);
  }
}
