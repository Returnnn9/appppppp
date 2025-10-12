"use client";

import React from "react";

// Пример интерфейса подарка для профиля
interface GiftProfile {
  id: number;
  name: string;
  image: string;
  owner: string;
  ownerAvatar?: string;
  price: number;
  availability: string;
  status: string;
}

interface GiftDetailProfileProps {
  gift: GiftProfile;
  onClose?: () => void;
}

export function GiftDetailProfile({ gift, onClose }: GiftDetailProfileProps) {
  // Получаем изображение подарка
  function getGiftImage(gift: GiftProfile): string {
    if (gift.image) return gift.image;
    return "/placeholder.svg";
  }

  return (
    <div
      className={`
        fixed left-1/2 bottom-0 z-[3000] w-full max-w-[420px] -translate-x-1/2
        outline-none
      `}
      style={{
        maxHeight: "95vh",
      }}
    >
      <div className="relative w-full bg-card rounded-t-[22px] shadow-2xl px-0 py-0 text-foreground font-sans font-medium text-[18px] text-center flex flex-col items-center border border-border">
        {/* Кнопка закрытия */}
        <button
          className="absolute top-3 right-3 bg-muted/80 rounded-full w-8 h-8 flex items-center justify-center text-[20px] text-muted-foreground cursor-pointer z-20 leading-none"
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

        {/* Картинка подарка */}
        <div className="relative w-full rounded-t-[22px] flex flex-col items-center justify-center pt-8 pb-4 min-h-[180px] bg-[linear-gradient(180deg,theme(colors.card)_0%,theme(colors.muted)_100%)] dark:bg-[linear-gradient(180deg,#0f172a_0%,#0b1220_100%)]">
          <img
            src={getGiftImage(gift)}
            alt={`${gift.name} gift`}
            className="h-[120px] w-[120px] object-contain mx-auto relative z-10"
          />
        </div>

        {/* Название и описание */}
        <div className="w-full px-6 mt-2">
          <div className="font-bold text-[22px] leading-tight mb-1 break-words">
            {gift.name}
          </div>
          <div className="text-muted-foreground text-[15px] mb-4 leading-snug">
            This gift will soon be available for update,<br />
            sale or mint as NFT
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="flex w-full px-6 gap-2 mb-3">
          <button className="flex-1 flex flex-col items-center justify-center rounded-xl bg-muted px-2 py-2 text-[15px] font-semibold text-muted-foreground shadow-sm cursor-not-allowed" disabled>
            <span className="material-icons text-[22px] mb-1">auto_awesome</span>
            Mint
          </button>
          <button className="flex-1 flex flex-col items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30 px-2 py-2 text-[15px] font-semibold text-blue-600 dark:text-blue-400 shadow-sm">
            <span className="material-icons text-[22px] mb-1">diamond</span>
            Wear
          </button>
          <button className="flex-1 flex flex-col items-center justify-center rounded-xl bg-muted px-2 py-2 text-[15px] font-semibold text-muted-foreground shadow-sm cursor-not-allowed" disabled>
            <span className="material-icons text-[22px] mb-1">sell</span>
            Sell
          </button>
        </div>

        {/* Таблица с информацией */}
        <div className="w-full px-6 mb-4">
          <div className="w-full rounded-xl border border-border bg-muted/30 text-base shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/70">
              <span className="text-muted-foreground">Owner</span>
              <span className="font-medium text-foreground flex items-center gap-2">
                {gift.ownerAvatar && (
                  <img
                    src={gift.ownerAvatar}
                    alt={gift.owner}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                )}
                {gift.owner}
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/70">
              <span className="text-muted-foreground">Availability</span>
              <span className="font-medium text-foreground">{gift.availability}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/70">
              <span className="text-muted-foreground">Value</span>
              <span className="font-medium text-foreground flex items-center">
                {gift.price.toLocaleString("ru-RU")} ★
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium text-foreground">{gift.status}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
