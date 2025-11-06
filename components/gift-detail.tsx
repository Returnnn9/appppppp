"use client";

import React, { useEffect, useRef, useState } from "react";

// Gif list for gifts
const giftGifMap: Record<string, string> = {
  castle: "/images/castle.gif",
  coconut: "/images/coconut.gif",
  flamingo: "/images/flamingo.gif",
  liberty: "/images/liberty.gif",
  ninja: "/images/ninja.gif",
  rocket: "/images/rocket.gif",
  sunglasses: "/images/sunglasses.gif",
  torch: "/images/torch.gif",
  "free spotty": "/images/free-spotty.gif",
};

interface Gift {
  id: number;
  name: string;
  description?: string | null;
  image: string;
  price: number;
  availability: string;
  status: string;
  discount?: number;
  premiumTime?: string;
}

interface GiftDetailProps {
  gift: Gift;
  onBack?: () => void;
  onClose?: () => void;
}

/**
 * Получаем дефолтное описание из /api/gifts.
 * Начальное значение — читаемое дефолтное сообщение (чтобы при отсутствии ответа API было что показывать).
 */
function useDefaultDescription() {
  const [defaultDescription, setDefaultDescription] = useState<string>(
    "Этот подарок скоро будет доступен для улучшения, продажи или выпуска в виде NFT."
  );

  useEffect(() => {
    let cancelled = false;
    fetch("/api/gifts")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch gifts");
        const gifts = await res.json();
        for (const g of gifts) {
          if (
            g.description &&
            typeof g.description === "string" &&
            g.description.startsWith("Этот подарок скоро будет")
          ) {
            return g.description;
          }
        }
        return;
      })
      .then((desc) => {
        if (desc && !cancelled) setDefaultDescription(desc);
      })
      .catch(() => {
        // если fetch упал — остаётся локальный дефолт
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return defaultDescription;
}

/**
 * Нормализует строку: убирает невидимые пробелы, переводит null/undefined/"null"/"undefined" в null.
 */
function normalizeDescriptionInput(
  raw: string | null | undefined
): string | null {
  if (raw === null || typeof raw === "undefined") return null;
  // некоторые бекэнды могли записать строку "null" / "undefined" — считаем это отсутствием описания
  if (raw === "null" || raw === "undefined") return null;
  // убираем \u00A0 и другие невидимые пробелы
  const cleaned = raw.replace(/\u00A0/g, " ").trim();
  if (cleaned === "") return null;
  return cleaned;
}

/**
 * Возвращает текст, который нужно показать пользователю.
 * Правило: если описание отсутствует (null/undefined/пусто/"null"/"   ") — показываем defaultDescription.
 * Иначе — оригинальное (но нормализованное) описание.
 */
function getDisplayDescription(
  description: string | null | undefined,
  defaultDescription: string
) {
  const normalized = normalizeDescriptionInput(description);
  if (normalized === null) {
    return defaultDescription;
  }
  return normalized;
}

function parseTimeString(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0];
}

function formatTime(seconds: number): string {
  if (seconds < 0) seconds = 0;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return h > 0
    ? `${h.toString().padStart(2, "0")}:${m
        .toString()
        .padStart(2, "0")}:${s.toString().padStart(2, "0")}`
    : `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function GiftDetail({ gift, onClose }: GiftDetailProps) {
  function getGiftImage(gift: Gift): string {
    const key = gift.name?.toLowerCase().trim();
    if (key && giftGifMap[key]) return giftGifMap[key];
    if (gift.image && gift.image.endsWith(".gif")) return gift.image;
    return gift.image || "/placeholder.svg";
  }

  const [visible, setVisible] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const [liveTime, setLiveTime] = useState<number | null>(null);
  const defaultDescription = useDefaultDescription();

  useEffect(() => {
    if (gift.premiumTime) {
      setLiveTime(parseTimeString(gift.premiumTime));
    } else {
      setLiveTime(null);
    }
  }, [gift.premiumTime]);

  useEffect(() => {
    if (liveTime === null || liveTime <= 0) return;
    const interval = setInterval(() => {
      setLiveTime((prev) => (prev && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [liveTime]);

  useEffect(() => {
    setTimeout(() => setVisible(true), 10);
    if (modalRef.current) modalRef.current.focus();
  }, []);

  // Telegram back button support for modal
  useEffect(() => {
    const tg = (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) ? (window as any).Telegram.WebApp : null
    if (!tg?.BackButton) return
    try {
      tg.BackButton.show()
      const onBack = () => {
        onClose?.()
      }
      tg.onEvent?.('backButtonClicked', onBack)
      return () => {
        tg.BackButton.hide()
        tg.offEvent?.('backButtonClicked', onBack)
      }
    } catch {}
  }, [onClose])

  // вычисляем отображаемое описание
  const displayDescription = getDisplayDescription(
    gift.description,
    defaultDescription
  );

  // --- DEBUG: логирование и видимый блок для быстрого дебага на странице ---
  useEffect(() => {
    // лог в консоль
    console.group(`GiftDetail debug — gift id: ${gift.id}`);
    console.log("raw gift.description:", gift.description);
    console.log("normalized description (null => treat as empty):", normalizeDescriptionInput(gift.description));
    console.log("defaultDescription (from hook):", defaultDescription);
    console.log("displayDescription (final):", displayDescription);
    console.groupEnd();
  }, [gift.description, defaultDescription, displayDescription, gift.id]);

  // Отдельный флажок, если используется дефолтный текст
  const usingDefault = normalizeDescriptionInput(gift.description) === null;

  return (
    <div
      ref={modalRef}
      tabIndex={-1}
      className={`fixed left-1/2 bottom-0 z-[3000] w-full max-w-[420px] -translate-x-1/2
        transition-transform duration-300 ease-out
        ${visible ? "translate-y-0" : "translate-y-full"}
        outline-none`}
      style={{ maxHeight: "95vh" }}
    >
      <div className="relative w-full bg-card rounded-t-[22px] shadow-2xl px-0 py-0 text-foreground font-sans font-medium text-[18px] text-center flex flex-col items-center">
        {/* Close */}
        <button
          className="absolute top-2 right-2 bg-muted/80 rounded-full w-8 h-8 flex items-center justify-center text-[20px] text-muted-foreground cursor-pointer z-20 leading-none"
          aria-label="Close"
          tabIndex={0}
          onClick={
            onClose
              ? onClose
              : typeof window !== "undefined"
              ? () => window.history.back()
              : undefined
          }
        >
          ×
        </button>

        {/* Background and image */}
        <div className="relative w-full flex flex-col items-center justify-center pt-8 pb-4 min-h-[300px] bg-[linear-gradient(180deg,theme(colors.card)_0%,theme(colors.muted)_100%)] dark:bg-[linear-gradient(180deg,#0f172a_0%,#0b1220_100%)]">
          <img
            src="/images/telegram_icons/bkk.svg"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 pointer-events-none select-none w-[490px] h-[360px] z-0"
            style={{ objectFit: "contain" }}
            aria-hidden="true"
          />
          <img
            src={getGiftImage(gift)}
            alt={`${gift.name} gift`}
            className="h-[140px] w-[140px] object-contain mx-auto relative z-10"
          />
        </div>

        {/* Title and description */}
        <div className="w-full px-6 mt-2">
          <div className="font-bold text-[22px] leading-tight mb-1 break-words">
            {gift.name}
          </div>
          <div
            // Добавил min-height и явную контрастную рамку в debug режиме (временно),
            // чтобы точно видеть область и её цвет (можно потом убрать).
            className="text-muted-foreground text-[15px] mb-4 leading-snug whitespace-pre-line"
            style={{ minHeight: 36 }}
            aria-live="polite"
          >
            {displayDescription}
          </div>
        </div>

        {/* Info block */}
        <div className="w-full px-6 mb-2">
          <div className="w-full rounded-xl bg-muted/30 text-base shadow-sm overflow-hidden divide-y divide-border/10">
            <div className="grid grid-cols-2">
              <div className="flex flex-col items-start px-4 py-3">
                <span className="text-muted-foreground font-medium">Available</span>
              </div>
              <div className="flex flex-col items-start px-4 py-3">
                <span className="font-medium text-foreground">{gift.availability}</span>
              </div>

              <div className="flex flex-col items-start px-4 py-3">
                <span className="text-muted-foreground font-medium">Value</span>
              </div>
              <div className="flex flex-col items-start px-4 py-3">
                <span className="font-medium text-foreground flex items-center">
                  {gift.price.toLocaleString("en-US")}
                  <img
                    src="/images/telegram_icons/start.svg"
                    alt="star"
                    className="w-5 h-5 ml-2"
                    style={{ filter: "drop-shadow(0 0 2px #f2b800)" }}
                  />
                </span>
              </div>

              <div className="flex flex-col items-start px-4 py-3">
                <span className="text-muted-foreground font-medium">Status</span>
              </div>
              <div className="flex flex-col items-start px-4 py-3">
                <span className="font-medium text-foreground">{gift.status}</span>
              </div>

              {gift.premiumTime && (
                <>
                  <div className="flex flex-col items-start px-4 py-3">
                    <span className="text-muted-foreground font-medium">Time</span>
                  </div>
                  <div className="flex flex-col items-start px-4 py-3">
                    <span className="font-medium text-blue-500">
                      {liveTime !== null ? formatTime(liveTime) : gift.premiumTime}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Buy button */}
        <div className="w-full px-6 pb-6">
          <button
            className="flex w-full items-center justify-center rounded-xl bg-blue-500 px-4 py-3 text-lg font-semibold text-white shadow-md transition-colors hover:bg-blue-600"
            onClick={async () => {
              try {
                const res = await fetch('/api/payments/create-invoice', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ giftId: gift.id, title: gift.name, amount: gift.price, description: gift.description || undefined })
                })
                const data = await res.json()
                if (!res.ok || !data?.ok || !(data?.slug || data?.invoiceLink)) {
                  alert(data?.error || 'Не удалось создать инвойс');
                  return;
                }

                // Попытка открыть инвойс через Telegram WebApp
                // @ts-ignore
                const tg = (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) ? (window as any).Telegram.WebApp : null
                if (tg?.openInvoice) {
                  const slug = data.slug || ''
                  tg.openInvoice(slug, (status: string) => {
                    if (status === 'paid') {
                      alert('Оплата прошла успешно!')
                      onClose?.()
                    } else if (status) {
                      // pending / cancelled / failed
                      // Можно показать тост, логировать и т.д.
                    }
                  })
                } else if (data.invoiceLink) {
                  // Fallback: открыть ссылку в новом окне
                  window.open(data.invoiceLink, '_blank')
                } else {
                  alert('Платежная система Telegram недоступна.')
                }
              } catch (e) {
                alert('Ошибка при создании платежа')
              }
            }}
          >
            Купить за
            <img
              src="/images/telegram_icons/stars-buying.svg"
              alt="star"
              className="w-6 h-6 mx-2"
            />
            {gift.price.toLocaleString("en-US")}
          </button>
        </div>

        {/* --- ВСПЛЫВАЮЩИЙ DEBUG БЛОК (виден на странице) --- */}
        <div
          style={{
            position: "absolute",
            left: 12,
            top: 12,
            background: "rgba(0,0,0,0.6)",
            color: "#fff",
            padding: "8px 10px",
            borderRadius: 8,
            fontSize: 12,
            zIndex: 4000,
            maxWidth: 320,
          }}
        >
          <div style={{ marginBottom: 6 }}>
            <strong>Debug</strong> (виден только в этой сборке)
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>ID:</span>
            <span>{gift.id}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Raw desc:</span>
            <span style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {String(gift.description)}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Using default:</span>
            <span>{usingDefault ? "yes" : "no"}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Default len:</span>
            <span>{defaultDescription ? defaultDescription.length : 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
