"use client";
import { useEffect } from "react";
import { useTheme } from "next-themes";

export default function TelegramInit() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const tg = (window as any).Telegram?.WebApp;
    if (!tg) return;

    try {
      tg.ready();
      tg.expand();

      // Цвет заголовка под тему
      const isDark = resolvedTheme === "dark";
      if (tg.setHeaderColor) {
        tg.setHeaderColor(isDark ? "secondary_bg_color" : "bg_color");
      }

      // Отключаем автосвайпы сверху/снизу в веб-просмотре
      if (tg.disableVerticalSwipes) {
        tg.disableVerticalSwipes();
      }
    } catch {}
  }, [resolvedTheme]);

  return null;
}


