export const getDeliveryError = (order) => {
  if (!order.isPaid) {
    return "Order must be paid before it can be marked as delivered";
  }

  return null;
};
