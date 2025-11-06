"use client";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { Navigation } from "@/components/navigation";
import { GiftDetail } from "@/components/gift-detail";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

// Тип из БД (API)
type ApiGift = {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  total_quantity: number;
  available_quantity: number;
  sticker_url?: string | null;
  status: string;
  frame_type: string;
  is_active: boolean;
  is_limited: boolean;
  limited_until?: string | null;
  ribbon_text?: string | null;
  ribbon_color?: string | null;
};

// Тип для модалки `GiftDetail`
type DetailGift = {
  id: number;
  name: string;
  image: string;
  price: number;
  availability: string;
  status: string;
  discount?: number;
  premiumTime?: string;
};

// Тип для карточки в сетке
type GridGift = {
  id: number;
  name: string;
  img: string;
  price: number;
  soldOut?: boolean;
  limited?: boolean;
  limitedLabel?: string;
  availability?: string;
  status?: string;
  
  _raw: ApiGift;
};

// Вспомогательная функция для преобразования строки времени в секунды
function timeStringToSeconds(time: string): number {
  const [h, m, s] = time.split(":").map(Number);
  return h * 3600 + m * 60 + s;
}

// Вспомогательная функция для преобразования секунд в строку времени
function secondsToTimeString(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((v) => v.toString().padStart(2, "0")).join(":");
}

// Компонент для отображения и анимации таймера
function AnimatedTimer({ initialTime }: { initialTime: string }) {
  const [seconds, setSeconds] = useState(() => timeStringToSeconds(initialTime));
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setSeconds(timeStringToSeconds(initialTime));
  }, [initialTime]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return <>{secondsToTimeString(seconds)}</>;
}

export default function LimitedGiftsPage() {
  const [gifts, setGifts] = useState<GridGift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGift, setSelectedGift] = useState<DetailGift | null>(null);
  const [showRoadmapBanner, setShowRoadmapBanner] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Загрузка подарков из API и маппинг к UI
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/gifts', { cache: 'no-store' });
        if (!res.ok) throw new Error('Не удалось загрузить подарки');
        const data: ApiGift[] = await res.json();
        const mapped: GridGift[] = data.map((g) => {
          const soldOut = g.available_quantity <= 0;
          const limited = g.is_limited || g.total_quantity > 0;
          const limitedLabel = `${g.available_quantity} of ${g.total_quantity}`;
          const img = g.sticker_url || '/placeholder.svg';
          return {
            id: g.id,
            name: g.name,
            img,
            price: g.price,
            soldOut,
            limited,
            limitedLabel: limited ? limitedLabel : undefined,
            availability: limited ? 'limited' : 'available',
            status: g.status,
            _raw: g,
          };
        });
        setGifts(mapped);
      } catch (e: any) {
        setError(e?.message || 'Ошибка');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Теперь getGiftLabel возвращает компонент AnimatedTimer для premiumTime
  const getGiftLabel = (gift: GridGift) => {
    if (gift.soldOut)
      return { color: "red", text: "sold out" };
    if (gift.limitedLabel)
      return { color: "blue", text: gift.limitedLabel };
    if (gift.limited)
      return { color: "blue", text: gift.limitedLabel || "limited" };
    // Лента из базы
    if (gift._raw.ribbon_text && gift._raw.ribbon_color) {
      return { color: gift._raw.ribbon_color, text: gift._raw.ribbon_text } as any;
    }
    return null;
  };

  return (
    <>
      <div className="min-h-screen font-sans pb-[120px] bg-background">
        {/* Верхний баннер */}
        <div className="bg-card rounded-xl shadow-sm px-4 py-2.5 mt-4 mb-2 mx-auto text-[15px] font-medium flex items-center gap-2 max-w-[420px] border border-border">
          <span className="font-bold">@ynbmafia</span>
          <span>purchased</span>
          <span className="text-[#2d9cdb] font-medium cursor-pointer">Key Charm</span>
          <button
            className="ml-auto flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
            type="button"
          >
            {isMounted ? (
              resolvedTheme === "dark" ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-muted-foreground" />
              )
            ) : (
              <span className="w-5 h-5 inline-block" />
            )}
          </button>
        </div>

        {/* Roadmap баннер */}
        <div
          className="relative overflow-hidden rounded-2xl cursor-pointer bg-gradient-to-r from-[#1e88e5] via-[#42a5f5] to-[#64b5f6] dark:from-[#1565c0] dark:via-[#1e88e5] dark:to-[#42a5f5] min-h-[110px] flex items-center justify-between px-8 max-w-[420px] mx-auto my-4 shadow-lg hover:shadow-xl transition-shadow"
          onClick={() => setShowRoadmapBanner(true)}
        >
          <div className="absolute inset-0 pointer-events-none">
            {/* Star 1 - large top right */}
            <svg
              className="absolute top-3 right-12 w-8 h-8 text-white/80 animate-pulse"
              style={{ animationDuration: "2s" }}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0l1.5 8.5L22 10l-8.5 1.5L12 20l-1.5-8.5L2 10l8.5-1.5z" />
            </svg>
            {/* Star 2 - medium center-right */}
            <svg
              className="absolute top-8 right-20 w-6 h-6 text-white/70 animate-pulse"
              style={{ animationDuration: "2.5s", animationDelay: "0.3s" }}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0l1.5 8.5L22 10l-8.5 1.5L12 20l-1.5-8.5L2 10l8.5-1.5z" />
            </svg>
            {/* Star 3 - small top far right */}
            <svg
              className="absolute top-5 right-6 w-5 h-5 text-white/60 animate-pulse"
              style={{ animationDuration: "3s", animationDelay: "0.6s" }}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0l1.5 8.5L22 10l-8.5 1.5L12 20l-1.5-8.5L2 10l8.5-1.5z" />
            </svg>
            {/* Star 4 - medium accent center */}
            <svg
              className="absolute top-2 right-32 w-5 h-5 text-white/50 animate-pulse"
              style={{ animationDuration: "2.2s", animationDelay: "0.9s" }}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0l1.5 8.5L22 10l-8.5 1.5L12 20l-1.5-8.5L2 10l8.5-1.5z" />
            </svg>
            {/* Star 5 - large bottom right */}
            <svg
              className="absolute bottom-6 right-16 w-7 h-7 text-white/75 animate-pulse"
              style={{ animationDuration: "2.8s", animationDelay: "0.4s" }}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0l1.5 8.5L22 10l-8.5 1.5L12 20l-1.5-8.5L2 10l8.5-1.5z" />
            </svg>
            {/* Star 6 - medium middle right */}
            <svg
              className="absolute top-1/2 right-8 w-6 h-6 text-white/55 animate-pulse"
              style={{ animationDuration: "3.5s", animationDelay: "1.2s" }}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0l1.5 8.5L22 10l-8.5 1.5L12 20l-1.5-8.5L2 10l8.5-1.5z" />
            </svg>
            {/* Star 7 - small bottom center-right */}
            <svg
              className="absolute bottom-4 right-28 w-4 h-4 text-white/45 animate-pulse"
              style={{ animationDuration: "2.6s", animationDelay: "0.7s" }}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0l1.5 8.5L22 10l-8.5 1.5L12 20l-1.5-8.5L2 10l8.5-1.5z" />
            </svg>
            {/* Star 8 - large accent top center */}
            <svg
              className="absolute top-4 right-40 w-6 h-6 text-white/40 animate-pulse"
              style={{ animationDuration: "3.2s", animationDelay: "1.5s" }}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0l1.5 8.5L22 10l-8.5 1.5L12 20l-1.5-8.5L2 10l8.5-1.5z" />
            </svg>
            {/* Star 9 - additional small star */}
            <svg
              className="absolute bottom-8 right-36 w-5 h-5 text-white/65 animate-pulse"
              style={{ animationDuration: "2.4s", animationDelay: "1s" }}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0l1.5 8.5L22 10l-8.5 1.5L12 20l-1.5-8.5L2 10l8.5-1.5z" />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col justify-center">
            <span className="font-extrabold text-white text-[32px] leading-[38px] drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)] flex items-center gap-2">
             Join our 
            </span>
            <span className="font-extrabold text-white text-[32px] leading-[38px] drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
              New Channel
            </span>
          </div>
          <div className="relative z-10 flex items-center justify-center">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
            >
              <path
                d="M9 18l6-6-6-6"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        {showRoadmapBanner && (
          <div
            className="fixed inset-0 w-screen h-screen bg-black/40 z-[1000] flex items-center justify-center"
            onClick={() => setShowRoadmapBanner(false)}
          >
            <div
              className="bg-card rounded-2xl px-10 py-8 shadow-2xl min-w-[320px] max-w-[420px] text-foreground font-bold text-[24px] text-center relative border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-[36px] mb-4 block">🚀</span>
              <div>Our Roadmap is coming soon!</div>
              <button
                className="mt-6 px-6 py-2.5 rounded-lg bg-blue-500 text-white font-semibold text-[16px] shadow-sm"
                type="button"
                onClick={() => setShowRoadmapBanner(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Заголовок */}
        <div className="font-extrabold text-[28px] mx-auto mb-3 max-w-[420px] text-foreground tracking-tight">
          Limited Gifts
        </div>

        {/* Состояния загрузки/ошибки */}
        <div className="max-w-[420px] mx-auto px-4 mb-3">
          {loading && (
            <div className="bg-card rounded-xl p-4 text-center text-muted-foreground border border-border">Загрузка подарков…</div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-center">{error}</div>
          )}
        </div>

        {/* Сетка подарков */}
        <div className="grid grid-cols-2 gap-4 max-w-[420px] mx-auto px-4">
          {gifts.map((gift) => {
            const ribbonLabel = getGiftLabel(gift);
            const isDisabled = !!gift.soldOut;
            const borderColor = isDisabled ? 'red-400' : (ribbonLabel ? `${ribbonLabel.color}-400` : 'gray-200');

            return (
              <div
                key={gift.id}
                onClick={() => {
                  if (isDisabled) return;
                  const d: DetailGift = {
                    id: gift.id,
                    name: gift.name,
                    image: gift.img,
                    price: gift.price,
                    availability: `${gift._raw.available_quantity} of ${gift._raw.total_quantity} left`,
                    status: gift.status || 'active',
                    premiumTime: gift._raw.limited_until ? (() => {
                      const ms = new Date(gift._raw.limited_until!).getTime() - Date.now();
                      const total = Math.max(0, Math.floor(ms / 1000));
                      const h = Math.floor(total / 3600);
                      const m = Math.floor((total % 3600) / 60);
                      const s = total % 60;
                      return [h, m, s].map(v => v.toString().padStart(2,'0')).join(':');
                    })() : undefined,
                  };
                  setSelectedGift(d);
                }}
                tabIndex={isDisabled ? -1 : 0}
                className={`relative flex flex-col items-center justify-end min-h-[200px] overflow-hidden cursor-pointer transition-all duration-200 border-2 rounded-[22px] py-3 pt-5 bg-white ${isDisabled ? "opacity-70 pointer-events-none" : ""} border-${borderColor}`}
              >
                {/* Лента всегда справа сверху */}
                {ribbonLabel && (
                  <div
                    className="absolute top-0 right-0 w-[90px] h-[90px] pointer-events-none z-10"
                    style={{ overflow: 'hidden' }}
                  >
                    <div
                      className={`
                        absolute
                        right-[-36px] top-[16px] rotate-45
                        w-[140px] h-[28px]
                        flex items-center justify-center
                        font-['Roboto',_Arial,_sans-serif]
                        font-medium text-[16px] leading-[1] text-white
                        select-none
                        ${ribbonLabel.text === 'sold out'
                          ? 'bg-gradient-to-br from-[#f83600] '
                          : `bg-${ribbonLabel.color}-500`}
                        shadow-md
                      `}
                      style={{
                        borderTopRightRadius: '10px',
                        borderBottomLeftRadius: '0',
                        background: ribbonLabel.text === 'sold out'
                          ? 'linear-gradient(135deg, #f83600 0%, #f9d423 100%)'
                          : undefined,
                      }}
                    >
                      {ribbonLabel.text}
                    </div>
                  </div>
                )}
                <div className="mb-[16px] mt-2 relative w-[100px] h-[100px] flex items-center justify-center">
                  <Image
                    src={gift.img}
                    alt={gift.name}
                    width={100}
                    height={100}
                    unoptimized={gift.img.endsWith(".gif")}
                    loading="lazy"
                  />
                </div>
                <div className="bg-[#fff6e0] rounded-[10px] px-[12px] flex items-center shadow-sm mb-0 min-w-[50px] h-7">
                  <img
                    src="/images/telegram_icons/start.svg"
                    alt="star"
                    className="w-4 h-6 mr-1 filter drop-shadow-[0_0_2px_#f2b800]"
                  />
                  <span className="font-['Roboto',_Arial,_sans-serif] font-medium text-[18px] bg-[linear-gradient(90deg,#feb701_0%,#ff7000_100%)] bg-clip-text text-transparent">
                    {gift.price.toLocaleString("ru-RU")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Модалка с деталями подарка */}
        {selectedGift && (
          <div
            className="fixed inset-0 w-screen h-screen bg-black/35 z-[2000] flex items-center justify-center"
            onClick={() => setSelectedGift(null)}
          >
            <div
              className=""
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedGift(null)}
                className="absolute top-3 right-3 text-[28px] text-gray-400"
                aria-label="Close"
              >
                ×
              </button>
              <GiftDetail gift={selectedGift} onClose={() => setSelectedGift(null)} />
            </div>
          </div>
        )}
      </div>
      <script src="https://telegram.org/js/telegram-web-app.js"></script>

      <Navigation />
    </>
  );
}