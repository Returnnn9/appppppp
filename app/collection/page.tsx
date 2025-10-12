"use client";
import { useEffect, useState } from "react";
import { Navigation } from "@/components/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";

export default function MyCollection() {
  const [username, setUsername] = useState<string | null>(null);

  // gifts, isEmpty, theming
  const gifts: any[] = [];
  const isEmpty = gifts.length === 0;
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";

  // Стили текста и кнопки
  const primaryText = dark ? "text-gray-100" : "text-gray-900";
  const secondaryText = dark ? "text-gray-400" : "text-gray-500";
  const headlineText = dark ? "text-gray-100" : "text-gray-900";
  const buttonColor = dark
    ? "text-blue-300 hover:text-blue-200"
    : "text-blue-600 hover:text-blue-800";
  const bgColor = dark ? "bg-black" : "bg-[#f7f7fa]";

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      tg.ready();
      const user = tg.initDataUnsafe?.user;
      if (user?.username) {
        setUsername(user.username);
      } else if (user?.first_name) {
        setUsername(user.first_name);
      }
    }
  }, []);

  return (
    <div className={`min-h-screen flex flex-col justify-between ${bgColor}`}>
      <div className="flex flex-col items-center justify-center flex-1 mt-8">
        {/* Блок профиля */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 overflow-hidden mb-2 rounded-full border-2 border-[#b6acf3] shadow-md">
            <img
              src="/images/telegram_icons/avatars.png"
              alt={username || ""}
              className="w-full h-full object-cover"
              draggable={false}
            />
          </div>
          <div
            className={`text-xl font-bold mb-2 px-2 py-1 text-center ${primaryText}`}
          >
            {username ? `@${username}` : "Loading..."}
          </div>
          <div className="flex flex-row justify-center gap-12 w-full mb-2 py-2 ">
            <div className="flex flex-col items-center">
              <div className="flex items-center">
                <span className={`text-xl font-bold ${primaryText}`}>0</span>
                <img
                  src="/images/telegram_icons/1gifts.svg"
                  alt="bought"
                  className="w-4 h-6 ml-1"
                />
              </div>
              <span className={`text-base font-semibold mt-1 ${secondaryText}`}>
                bought
              </span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center">
                <span className={`text-xl font-bold ${primaryText}`}>0</span>
                <img
                  src="/images/telegram_icons/1gifts.svg"
                  alt="sold"
                  className="w-4 h-6 ml-1"
                />
              </div>
              <span className={`text-base font-semibold mt-1 ${secondaryText}`}>
                sold
              </span>
            </div>
          </div>
        </div>
        {/* Блок коллекции */}
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center">
            {/* Добавляем уточку */}
            <img
              src="/images/duck/duck_search.gif"
              alt="Уточка"
              className="w-32 h-32 mb-4"
              draggable={false}
              style={{}}
            />
            <div
              className={`text-3xl font-bold mb-2 text-center px-4 py-1 ${headlineText}`}
            >
              My Collection
            </div>
            <div className={`text-lg mb-4 text-center ${secondaryText}`}>
              You have no Limited Gifts yet
            </div>
            <Link
              href="/"
              className={`text-lg font-semibold transition px-2 py-1 ${buttonColor}`}
            >
              Buy &rarr;
            </Link>
          </div>
        ) : (
          <div>{/* ... */}</div>
        )}
      </div>
      <script src="https://telegram.org/js/telegram-web-app.js"></script>
      <Navigation />
    </div>
  );
}