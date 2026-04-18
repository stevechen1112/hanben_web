import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

export interface ShippingOption {
  id: string;
  name: string;
  shippingMethod: string;
  logisticsType: string;
  logisticsSubType: string;
  temperature: string | null;
  baseFee: number;
  freeShippingMin: number | null;
  codFee: number | null;
}

function toNumber(value: Prisma.Decimal | number | string | null | undefined) {
  if (value == null) {
    return null;
  }

  return Number(value);
}

function mapShippingRule(rule: {
  id: string;
  name: string;
  shippingMethod: string;
  logisticsType: string;
  logisticsSubType: string;
  temperature: string | null;
  baseFee: Prisma.Decimal;
  freeShippingMin: Prisma.Decimal | null;
  codFee: Prisma.Decimal | null;
}) {
  return {
    id: rule.id,
    name: rule.name,
    shippingMethod: rule.shippingMethod,
    logisticsType: rule.logisticsType,
    logisticsSubType: rule.logisticsSubType,
    temperature: rule.temperature,
    baseFee: Number(rule.baseFee),
    freeShippingMin: toNumber(rule.freeShippingMin),
    codFee: toNumber(rule.codFee),
  } satisfies ShippingOption;
}

export async function listActiveShippingOptions() {
  const rules = await db.shippingRule.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      name: true,
      shippingMethod: true,
      logisticsType: true,
      logisticsSubType: true,
      temperature: true,
      baseFee: true,
      freeShippingMin: true,
      codFee: true,
    },
  });

  return rules.map(mapShippingRule);
}

export async function getShippingOptionByMethod(shippingMethod: string) {
  const rule = await db.shippingRule.findFirst({
    where: {
      shippingMethod,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      shippingMethod: true,
      logisticsType: true,
      logisticsSubType: true,
      temperature: true,
      baseFee: true,
      freeShippingMin: true,
      codFee: true,
    },
  });

  return rule ? mapShippingRule(rule) : null;
}

export function calculateShippingFee(subtotal: number, shippingOption: ShippingOption) {
  if (
    shippingOption.freeShippingMin != null &&
    subtotal >= shippingOption.freeShippingMin
  ) {
    return 0;
  }

  return shippingOption.baseFee;
}