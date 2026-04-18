"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useCartStore } from "@/lib/cart-store";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

const returnPolicySections = [
  {
    title: "鑑賞期說明",
    body: "從商品抵達您手上開始即擁有 7日鑑賞期（含例假日），以宅配單簽收日為憑。",
    items: ["鑑賞期並非試用期，僅供檢查外觀與功能，請勿實際使用。"],
  },
  {
    title: "退換貨須知",
    body: "商品必須為 全新狀態，並保持完整包裝，包含紙箱、商品主體、配件、說明書、贈品等。",
    items: [
      "請勿於商品原包裝上黏貼紙張或書寫文字。",
      "退／換貨僅接受整筆訂單申請，恕不提供部分商品退換。",
      "參與活動（如任選、免運）之訂單，退貨時亦需整筆退回。",
      "目前不提供換貨服務，如需更換商品，請先申請退貨後重新下單。",
      "申請退貨後，該筆訂單所獲得之 會員點數將全數扣除。",
    ],
  },
  {
    title: "不受理退貨之情況",
    body: null,
    items: [
      "超過七日鑑賞期。",
      "商品有明顯使用痕跡或非新品狀態。",
      "訂單中有任一項商品已拆封，在沒有任何瑕疵或損壞的情況下，即使其他商品為全新，也不接受退換貨服務。",
      "食品一經 拆封、食用、保存不當 導致變質者。",
      "商品或其附屬品（說明書、贈品、配件等）不完整。",
      "因人為因素造成損傷、刮痕、變質或包裝不完整。",
      "個人主觀口味或飲食習慣差異等非商品本身問題。",
      "未經客服確認，自行寄回商品者。",
      "銷售時已註明「不接受退換」者。",
    ],
  },
  {
    title: "退貨流程",
    body: null,
    items: [
      "請於收到商品後 7 日內 聯絡客服。",
      "提供：姓名、訂單編號、聯絡電話、退貨商品名稱、退貨原因與照片。",
      "客服確認後，安排物流回收。",
      "請妥善包裝商品並維持原狀，以利退貨審核。",
    ],
  },
  {
    title: "額外提醒事項",
    body: null,
    items: [
      "本站商品經嚴格品質控管，請於效期內食用完畢。",
      "為維護食品衛生安全，商品一經拆封，除非品質異常，恕不接受退貨。",
      "收到商品後請立即檢查是否正確與完整，若有問題請於 7 日內聯繫客服，逾期恕不受理。",
      "如商品於運送途中有破損、變形或短缺情況，請立即向宅配人員反映，並拍照存證聯繫客服。",
      "食品為私人消耗性產品，除商品本身有瑕疵可退貨外，ㄧ經拆封、食用或消費者造成之外盒變形、失溫或保存不良導致變質，將會影響退貨權限。",
    ],
  },
];

type ProductVariantOption = {
  id: string;
  title: string;
  price: number;
  compareAtPrice: number | null;
  inventory: number;
};

export function ProductPurchaseForm({
  productTitle,
  variants,
  panelId,
}: {
  productTitle: string;
  variants: ProductVariantOption[];
  panelId?: string;
}) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedVariant = variants.find((variant) => variant.id === selectedVariantId) ?? variants[0] ?? null;
  const isSoldOut = !selectedVariant || selectedVariant.inventory <= 0;

  function commitAdd() {
    if (!selectedVariant || isSoldOut) {
      setMessage("目前此規格已售完。");
      return;
    }

    setMessage(null);
    startTransition(async () => {
      try {
        await addItem(selectedVariant.id, quantity);
        setMessage(`已將 ${productTitle} 加入購物車。`);
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "加入購物車失敗，請稍後再試。");
      }
    });
  }

  return (
    <div id={panelId} className="scroll-mt-28 space-y-6">
      {variants.length > 1 ? (
        <div className="space-y-3">
          <p className="text-sm font-semibold tracking-[0.16em] text-stone-700">規格選擇</p>
          <div className="grid gap-3">
            {variants.map((variant) => {
              const active = selectedVariantId === variant.id;
              return (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => setSelectedVariantId(variant.id)}
                  className={[
                    "border px-4 py-4 text-left transition",
                    active
                      ? "border-[#232323] bg-[#faf8f4]"
                      : "border-[#e7ded0] bg-white hover:bg-[#faf8f4]",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-[#232323]">{variant.title}</p>
                      <p className="mt-1 text-sm text-stone-500">庫存 {variant.inventory}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#232323]">{formatCurrency(variant.price)}</p>
                      {variant.compareAtPrice ? <p className="text-xs text-stone-400 line-through">{formatCurrency(variant.compareAtPrice)}</p> : null}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="space-y-4 border-t border-[#ece7de] pt-5">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-[#232323]">購買數量</p>
          <div className="inline-flex items-center border border-[#ded8cc] bg-white p-1">
            <button
              type="button"
              onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              aria-label="減少數量"
              disabled={quantity <= 1}
              className="h-10 w-10 text-lg text-[#232323] transition hover:bg-[#f5f1ea]"
            >
              -
            </button>
            <span className="min-w-12 text-center text-base font-semibold text-[#232323]">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((current) => Math.min(Math.max(selectedVariant?.inventory ?? 1, 1), current + 1))}
              aria-label="增加數量"
              className="h-10 w-10 text-lg text-[#232323] transition hover:bg-[#f5f1ea]"
            >
              +
            </button>
          </div>
        </div>

        <div className="grid gap-3">
          <button
            type="button"
            disabled={isPending || isSoldOut}
            onClick={() => commitAdd()}
            className="storefront-button w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "加入中…" : "加入購物車"}
          </button>
        </div>
      </div>

      {selectedVariant ? (
        <div className="bg-[#faf8f4] px-4 py-3 text-sm text-stone-600">
          已選規格：<span className="font-semibold text-[#232323]">{selectedVariant.title}</span>
          <span className="ml-3 font-semibold text-[#232323]">{formatCurrency(selectedVariant.price)}</span>
        </div>
      ) : null}

      <div className="space-y-4 border-t border-[#ece7de] pt-6 text-[0.95rem] leading-7 text-stone-600">
        <p>親愛的顧客您好，為保障您的權益，請您在購買前詳閱以下退換貨規則：</p>
        {returnPolicySections.map((section) => (
          <div key={section.title} className="space-y-2">
            <p className="font-semibold text-[#232323]">{section.title}</p>
            {section.body ? <p>{section.body}</p> : null}
            <ul className="list-disc space-y-1 pl-5">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
        <p>如有其他退換貨問題，歡迎聯繫客服中心，我們將竭誠為您服務。</p>
      </div>

      {message ? <p className="text-sm font-medium text-[#8f1212]">{message}</p> : null}
    </div>
  );
}