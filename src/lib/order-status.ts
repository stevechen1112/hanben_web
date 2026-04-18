import type { OrderStatus, PaymentStatus } from "@/generated/prisma/client";

const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: ["REFUNDED"],
  CANCELLED: [],
  REFUNDED: [],
};

const PAYMENT_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  UNPAID: ["PAID", "FAILED", "REFUNDED"],
  PAID: ["PARTIALLY_REFUNDED", "REFUNDED"],
  PARTIALLY_REFUNDED: ["REFUNDED"],
  REFUNDED: [],
  FAILED: ["UNPAID"],
};

export function getNextOrderStatuses(status: OrderStatus) {
  return ORDER_TRANSITIONS[status];
}

export function getNextPaymentStatuses(status: PaymentStatus) {
  return PAYMENT_TRANSITIONS[status];
}

export function canTransitionOrderStatus(current: OrderStatus, next: OrderStatus) {
  return current === next || ORDER_TRANSITIONS[current].includes(next);
}

export function canTransitionPaymentStatus(
  current: PaymentStatus,
  next: PaymentStatus,
) {
  return current === next || PAYMENT_TRANSITIONS[current].includes(next);
}