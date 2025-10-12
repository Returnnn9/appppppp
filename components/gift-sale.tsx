import React, { useEffect, useState } from "react";

export default function GiftSale() {
  // Моковые данные подарка, как пример
  const gift = {
    name: "Digital Resistance",
    image: "/images/digital_resistance.gif",
    price: 2750,
    availability: "272 из 333",
    status: "В наличии",
    owner: "j_belfort69",
  };

  // Таймер до конца акции (пример: 1 час)
  const [timeLeft, setTimeLeft] = useState<string>("-- : -- : --");
  useEffect(() => {
    // Дата окончания через 1 час
    const countdownEnd = new Date(Date.now() + 60 * 60 * 1000);

    function updateTimer() {
      const now = new Date();
      const diff = countdownEnd.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("00 : 00 : 00");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${String(hours).padStart(2, "0")} : ${String(minutes).padStart(2, "0")} : ${String(seconds).padStart(2, "0")}`
      );
    }

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-[320px] min-h-[480px] bg-gradient-to-b from-slate-50 to-slate-100 rounded-2xl overflow-hidden shadow-lg mx-auto font-sans">
      {/* Верхний блок с картинкой и крестиком */}
      <header className="relative w-full">
        <div className="absolute inset-0 h-32 bg-gradient-to-b from-sky-100 via-sky-50 to-transparent">
          <div
            className="absolute bottom-0 left-0 h-24 w-full bg-bottom bg-cover bg-repeat-x opacity-90"
            style={{ backgroundImage: 'url("/images/telegram_icons/bkk.svg")' }}
            aria-hidden="true"
          />
        </div>
        <div className="relative z-10 mx-auto flex max-w-md flex-col items-center px-4 pt-4 text-center">
          <button
            aria-label="Закрыть"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white text-2xl text-gray-600 shadow-sm transition hover:bg-gray-100 hover:text-gray-800"
          >
            ×
          </button>
          <div className="mt-4 flex justify-center">
            <img
              src={gift.image}
              alt={gift.name}
              className="h-24 w-32 object-contain transition-transform duration-300 hover:scale-105 bg-white rounded-lg border border-gray-200"
              draggable={false}
            />
          </div>
          <h1 className="mt-2 text-lg font-bold text-gray-900">{gift.name}</h1>
        </div>
      </header>

      {/* Основной контент */}
      <main className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center px-4 font-sans">
        <p className="mb-6 mt-3 min-h-[36px] px-2 text-center text-sm font-medium text-gray-700 leading-relaxed tracking-wide">
          Этот подарок можно продать другому пользователю.
        </p>

        <div className="mb-4 w-full rounded-xl border border-gray-200 bg-gray-50 text-sm shadow-sm">
          {[
            ["Владелец", (
              <span className="flex items-center font-medium text-[#232323]">
                <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                  <img src="/images/telegram_icons/1gifts.svg" alt="avatar" className="w-4 h-4" />
                </span>
                {gift.owner}
              </span>
            )],
            ["Доступно", gift.availability],
            ["Статус", gift.status],
            ["Осталось времени", timeLeft],
          ].map(([label, value], idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between px-4 py-2 ${idx !== 3 ? "border-b border-gray-200" : ""}`}
            >
              <span className="text-gray-600">{label}</span>
              <span className="font-medium text-gray-900">{value}</span>
            </div>
          ))}
        </div>

        {/* Кнопка продажи */}
        <button
          className="mb-6 flex w-full items-center justify-center rounded-xl bg-green-500 px-4 py-3 text-lg font-semibold text-white shadow-md transition-colors hover:bg-green-600"
        >
          <span className="mr-2">Продать за</span>
          <span className="mr-1 text-xl text-yellow-300">⭐</span>
          <span>{gift.price.toLocaleString("ru-RU")}</span>
        </button>
      </main>
    </div>
  );
}