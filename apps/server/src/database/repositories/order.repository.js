import { BaseRepository } from "./base.repository.js";
import Order from "../../modules/orders/order.model.js";

class OrderRepository extends BaseRepository {
  constructor() {
    super(Order);
  }

  async findBuyerOrders(buyerId, page, limit) {
    return this.paginate({
      filter: {
        buyer: buyerId,
      },

      page,
      limit,

      sort: {
        createdAt: -1,
      },
    });
  }

  async updateOrderStatus(orderId, status, session) {
    return this.model.findByIdAndUpdate(
      orderId,
      {
        orderStatus: status,
      },
      {
        new: true,
        session,
      },
    );
  }
}

export default new OrderRepository();
