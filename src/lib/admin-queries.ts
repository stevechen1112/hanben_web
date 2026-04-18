import { db } from "./db";
import { startOfDay, startOfMonth, endOfDay } from "date-fns";

/** 今日營收（已付款訂單） */
export async function getTodayRevenue() {
  const today = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());

  const result = await db.order.aggregate({
    where: {
      paymentStatus: "PAID",
      paidAt: { gte: today, lte: todayEnd },
    },
    _sum: { total: true },
    _count: true,
  });

  return {
    amount: Number(result._sum.total ?? 0),
    count: result._count,
  };
}

/** 本月營收 */
export async function getMonthRevenue() {
  const monthStart = startOfMonth(new Date());

  const result = await db.order.aggregate({
    where: {
      paymentStatus: "PAID",
      paidAt: { gte: monthStart },
    },
    _sum: { total: true },
    _count: true,
  });

  return {
    amount: Number(result._sum.total ?? 0),
    count: result._count,
  };
}

/** 待處理訂單（已付款、未出貨） */
export async function getPendingOrdersCount() {
  return db.order.count({
    where: {
      paymentStatus: "PAID",
      shippingStatus: "UNFULFILLED",
    },
  });
}

/** 低庫存商品 (inventory ≤ 10) */
export async function getLowStockCount() {
  return db.variant.count({
    where: {
      inventory: { lte: 10 },
      trackInventory: true,
      isActive: true,
    },
  });
}

/** 本月新客戶數 */
export async function getNewCustomersCount() {
  const monthStart = startOfMonth(new Date());
  return db.customer.count({
    where: { createdAt: { gte: monthStart } },
  });
}

/** 未讀聯絡表單 */
export async function getUnreadContactCount() {
  return db.contactSubmission.count({ where: { isRead: false } });
}

/** 最近 10 筆訂單 */
export async function getRecentOrders() {
  return db.order.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
      email: true,
      status: true,
      paymentStatus: true,
      shippingStatus: true,
      total: true,
      createdAt: true,
      customer: { select: { firstName: true, lastName: true } },
    },
  });
}

/** 近 14 天每日營收（折線圖用） */
export async function getDailyRevenue() {
  const days = 14;
  const data: { date: string; amount: number }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const start = startOfDay(date);
    const end = endOfDay(date);

    const result = await db.order.aggregate({
      where: {
        paymentStatus: "PAID",
        paidAt: { gte: start, lte: end },
      },
      _sum: { total: true },
    });

    data.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      amount: Number(result._sum.total ?? 0),
    });
  }

  return data;
}
