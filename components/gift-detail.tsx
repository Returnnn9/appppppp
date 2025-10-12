"use client";

import React, { useEffect, useRef, useState } from "react";

// Список гифок для подарков
const giftGifMap: Record<string, string> = {
  "castle": "/images/castle.gif",
  "coconut": "/images/coconut.gif",
  "flamingo": "/images/flamingo.gif",
  "liberty": "/images/liberty.gif",
  "ninja": "/images/ninja.gif",
  "rocket": "/images/rocket.gif",
  "sunglasses": "/images/sunglasses.gif",
  "torch": "/images/torch.gif",
  "free spotty": "/images/free-spotty.gif", // Добавлен для примера, замените на реальный путь
};

interface Gift {
  id: number;
  name: string;
  image: string;
  price: number;
  availability: string; // Например: "157 of 200 left"
  status: string; // Например: "Non-Unique"
  discount?: number;
  premiumTime?: string;
}

interface GiftDetailProps {
  gift: Gift;
  onBack?: () => void;
  onClose?: () => void; // добавим onClose для корректного закрытия
}

// Функция для парсинга времени вида "01:23:45" или "23:59"
function parseTimeString(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(":").map(Number);
  if (parts.length === 3) {
    // ЧЧ:ММ:СС
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    // ММ:СС
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 1) {
    return parts[0];
  }
  return 0;
}

// Функция для форматирования секунд в строку времени
function formatTime(seconds: number): string {
  if (seconds < 0) seconds = 0;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  } else {
    return `${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  }
}

export function GiftDetail({ gift, onClose }: GiftDetailProps) {
  // Получаем изображение подарка
  function getGiftImage(gift: Gift): string {
    const key = gift.name?.toLowerCase().trim();
    if (key && giftGifMap[key]) return giftGifMap[key];
    if (gift.image && gift.image.endsWith(".gif")) return gift.image;
    return gift.image || "/placeholder.svg";
  }

  // Покупка через Telegram WebApp
  function handleBuy() {
    // @ts-ignore
    if (typeof window !== "undefined" && (window as any)?.Telegram?.WebApp?.openInvoice) {
      // Здесь нужен реальный invoiceSlug с бэка
      (window as any).Telegram.WebApp.openInvoice("demo-invoice-slug", (status: string) => {
        if (status === "paid") {
          alert("Оплата прошла успешно!");
        } else {
          alert(`Статус оплаты: ${status}`);
        }
      });
    } else {
      alert("Платежная система Telegram недоступна.");
    }
  }

  // Анимация появления снизу
  const [visible, setVisible] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Состояние для времени в прямом эфире
  const [liveTime, setLiveTime] = useState<number | null>(null);

  // Инициализация liveTime, если есть premiumTime
  useEffect(() => {
    if (gift.premiumTime) {
      setLiveTime(parseTimeString(gift.premiumTime));
    }
  }, [gift.premiumTime]);

  // Таймер для уменьшения времени каждую секунду
  useEffect(() => {
    if (liveTime === null) return;
    if (liveTime <= 0) return;
    const interval = setInterval(() => {
      setLiveTime((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [liveTime]);

  useEffect(() => {
    setTimeout(() => setVisible(true), 10);
    // Фокус для accessibility
    if (modalRef.current) {
      modalRef.current.focus();
    }
  }, []);

  return (
    <div
      ref={modalRef}
      tabIndex={-1}
      className={`
        fixed left-1/2 bottom-0 z-[3000] w-full max-w-[420px] -translate-x-1/2
        transition-transform duration-300 ease-out
        ${visible ? "translate-y-0" : "translate-y-full"}
        outline-none
      `}
      style={{
        // Для мобильных: чтобы не было скругления сверху, если на весь экран
        maxHeight: "95vh",
      }}
    >
      <div className="relative w-full bg-card rounded-t-[22px] shadow-2xl px-0 py-0 text-foreground font-sans font-medium text-[18px] text-center flex flex-col items-center border border-border">
        {/* Кнопка закрытия */}
        <button
          className="absolute top-2 right-2 bg-muted/80 rounded-full w-8 h-8 flex items-center justify-center text-[20px] text-muted-foreground cursor-pointer z-20 leading-none"
          aria-label="Закрыть"
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

        {/* Фон и картинка товара с SVG на заднем фоне */}
        <div className="relative w-full rounded-t-[22px] flex flex-col items-center justify-center pt-8 pb-4 min-h-[300px] bg-[linear-gradient(180deg,theme(colors.card)_0%,theme(colors.muted)_100%)] dark:bg-[linear-gradient(180deg,#0f172a_0%,#0b1220_100%)]">
          {/* SVG фон */}
          <img
            src="/images/telegram_icons/bkk.svg"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 pointer-events-none select-none w-[490px] h-[360px] z-0"
            style={{objectFit: "contain"}}
            aria-hidden="true"
          />
          {/* Картинка подарка */}
          <img
            src={getGiftImage(gift)}
            alt={`${gift.name} gift`}
            className="h-[140px] w-[140px] object-contain mx-auto relative z-10"
          />
        </div>

        {/* Название и описание */}
        <div className="w-full px-6 mt-2">
          <div className="font-bold text-[22px] leading-tight mb-1 break-words">
            #{gift.name}
          </div>
          <div className="text-muted-foreground text-[15px] mb-4 leading-snug">
            Этот подарок скоро будет доступен для улучшения, продажи<br />
            или выпуска в виде NFT.
            
            
          </div>
        </div>

        {/* Таблица с информацией */}
        <div className="w-full px-6 mb-2">
          <div className="w-full rounded-xl border border-border bg-muted/30 text-base shadow-sm overflow-hidden">
            <div className="grid grid-cols-2">
              <div className="flex flex-col items-start px-4 py-3 border-b border-r border-border/70">
                <span className="text-muted-foreground font-medium">Доступно</span>
              </div>
              <div className="flex flex-col items-start px-4 py-3 border-b border-border/70">
                <span className="font-medium text-foreground">{gift.availability}</span>
              </div>
              <div className="flex flex-col items-start px-4 py-3 border-b border-r border-border/70">
                <span className="text-muted-foreground font-medium">Ценность</span>
              </div>
              <div className="flex flex-col items-start px-4 py-3 border-b border-border/70">
                <span className="font-medium text-foreground flex items-center">
                  {gift.price.toLocaleString("ru-RU")}
                  <img
                    src="/images/telegram_icons/start.svg"
                    alt="star"
                    className="w-5 h-5 ml-2"
                    style={{ filter: "drop-shadow(0 0 2px #f2b800)" }}
                  />
                </span>
              </div>
              <div className="flex flex-col items-start px-4 py-3 border-r border-border/70">
                <span className="text-muted-foreground font-medium">Статус</span>
              </div>
              <div className="flex flex-col items-start px-4 py-3">
                <span className="font-medium text-foreground">{gift.status}</span>
              </div>
              {gift.premiumTime && (
                <>
                  <div className="flex flex-col items-start px-4 py-3 border-t border-r border-border/70">
                    <span className="text-muted-foreground font-medium">Время</span>
                  </div>
                  <div className="flex flex-col items-start px-4 py-3 border-t border-border/70">
                    <span className="font-medium text-blue-500">
                      {liveTime !== null ? formatTime(liveTime) : gift.premiumTime}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Кнопка покупки */}
        <div className="w-full px-6 pb-6">
          <button
            className="flex w-full items-center justify-center rounded-xl bg-blue-500 px-4 py-3 text-lg font-semibold text-white shadow-md transition-colors hover:bg-blue-600"
            onClick={handleBuy}
          >
            Купить за
            <img
              src="/images/telegram_icons/stars-buying.svg"
              alt="звезда"
              className="w-6 h-6 mx-2"
              style={{  }}
            />
            {gift.price.toLocaleString("ru-RU")}
          </button>
        </div>
          
        </div>
      </div>
  
  );
}