import { BaseRepository } from "./base.repository.js";
import Product from "../../modules/products/product.model.js";

class ProductRepository extends BaseRepository {
  constructor() {
    super(Product);
  }

  async findActiveProducts({ page, limit, category, search }) {
    const filter = {
      status: "ACTIVE",
    };

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$text = {
        $search: search,
      };
    }

    return this.paginate({
      filter,
      page,
      limit,
      sort: {
        createdAt: -1,
      },
    });
  }

  async decreaseInventory(productId, quantity, session) {
    return this.model.findByIdAndUpdate(
      productId,
      {
        $inc: {
          inventoryCount: -quantity,
        },
      },
      {
        new: true,
        session,
      },
    );
  }
}

export default new ProductRepository();
