import { withTransaction } from "../database/transaction/withTransaction.js";

import orderRepository from "../database/repositories/order.repository.js";

import paymentRepository from "../database/repositories/payment.repository.js";

import escrowRepository from "../database/repositories/escrow.repository.js";

import productRepository from "../database/repositories/product.repository.js";

export const checkoutService = async (checkoutData) => {
  return withTransaction(async (session) => {
    const order = await orderRepository.create(checkoutData.order, { session });

    const payment = await paymentRepository.create(checkoutData.payment, {
      session,
    });

    const escrow = await escrowRepository.create(checkoutData.escrow, {
      session,
    });

    for (const item of checkoutData.items) {
      await productRepository.decreaseInventory(
        item.productId,
        item.quantity,
        session,
      );
    }

    return {
      order,
      payment,
      escrow,
    };
  });
};
