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

      // Отправляем данные пользователя на бэкенд для апсерта (аватар/имя)
      const u = tg.initDataUnsafe?.user;
      if (u?.id) {
        fetch('/api/auth/telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: u.id, username: u.username || null, photo_url: u.photo_url || null })
        }).catch(() => {})
      }
    } catch {}
  }, [resolvedTheme]);

  return null;
}


