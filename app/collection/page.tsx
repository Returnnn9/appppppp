"use client";
import { useEffect, useState } from "react";
import { Navigation } from "@/components/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";

export default function MyCollection() {
  const [username, setUsername] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [bought, setBought] = useState<number>(0);
  const [sold, setSold] = useState<number>(0);
  const [stars, setStars] = useState<number>(0);
  const [tgId, setTgId] = useState<string | null>(null);

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
    if (typeof window === "undefined") return;
    const tg = (window as any).Telegram?.WebApp;
    if (!tg) return;
    tg.ready();
    const user = tg.initDataUnsafe?.user;
    if (user?.username) setUsername(user.username);
    else if (user?.first_name) setUsername(user.first_name);
    if (user?.photo_url) setAvatarUrl(user.photo_url);

    if (user?.id) {
      setTgId(String(user.id))
      fetch('/api/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id })
      })
      .then(r => r.json())
      .then((data) => {
        if (data?.user) {
          if (data.user.username) setUsername(data.user.username);
          if (data.user.avatar_url) setAvatarUrl(data.user.avatar_url);
          if (typeof data.user.bought_gifts === 'number') setBought(data.user.bought_gifts);
          if (typeof data.user.sold_gifts === 'number') setSold(data.user.sold_gifts);
        }
      })
      .catch(()=>{})
      // Загружаем баланс
      fetch(`/api/me?stars=true`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id })
      })
      .then(r => r.json())
      .then((data) => {
        if (data?.user?.stars !== undefined) setStars(data.user.stars);
      })
      .catch(()=>{})
    }
  }, []);

  return (
    <div className={`min-h-screen flex flex-col justify-between ${bgColor}`}>
      <div className="flex flex-col items-center justify-center flex-1 mt-8">
        {/* Блок профиля */}
        <div className="flex flex-col items-center mb-8 w-full px-4">
          <div className="w-[84px] h-[84px] overflow-hidden mb-2 rounded-xl border border-white/10 shadow-[0_4px_24px_rgba(59,130,246,0.25)]">
            <img
              src={avatarUrl || "/images/telegram_icons/avatars.png"}
              alt={username || ""}
              className="w-full h-full object-cover"
              draggable={false}
            />
          </div>
          <div className={`text-[22px] font-bold mb-3 px-3 py-1 text-center ${primaryText}`}>
            {username ? `@${username}` : "Loading..."}
          </div>
          <div className="grid grid-cols-2 gap-4 w-full max-w-xs mb-4">
            <div className="rounded-2xl px-4 py-3 bg-[rgba(59,130,246,0.12)] border border-[rgba(59,130,246,0.35)] text-center">
              <div className="flex items-center justify-center">
                <span className={`text-xl font-extrabold ${primaryText}`}>{bought}</span>
                <img src="/images/telegram_icons/1gifts.svg" alt="bought" className="w-4 h-6 ml-1" />
              </div>
              <span className={`text-sm font-semibold mt-1 block ${secondaryText}`}>bought</span>
            </div>
            <div className="rounded-2xl px-4 py-3 bg-[rgba(147,51,234,0.12)] border border-[rgba(147,51,234,0.35)] text-center">
              <div className="flex items-center justify-center">
                <span className={`text-xl font-extrabold ${primaryText}`}>{sold}</span>
                <img src="/images/telegram_icons/1gifts.svg" alt="sold" className="w-4 h-6 ml-1" />
              </div>
              <span className={`text-sm font-semibold mt-1 block ${secondaryText}`}>sold</span>
            </div>
          </div>
          {tgId && (
            <div className="w-full max-w-xs mb-4">
              <div className="rounded-2xl px-4 py-3 bg-[rgba(254,183,1,0.12)] border border-[rgba(254,183,1,0.35)] text-center mb-2">
                <div className="flex items-center justify-center">
                  <span className={`text-xl font-extrabold ${primaryText}`}>{stars.toLocaleString()}</span>
                  <img src="/images/telegram_icons/start.svg" alt="stars" className="w-5 h-5 ml-1" />
                </div>
                <span className={`text-sm font-semibold mt-1 block ${secondaryText}`}>balance</span>
              </div>
              <button
                onClick={async () => {
                  if (!tgId) return
                  const amount = 100 // можно сделать выбор суммы
                  try {
                    const res = await fetch('/api/payments/topup', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ tg_id: tgId, amount })
                    })
                    const data = await res.json()
                    if (!res.ok || !data?.ok || !(data?.slug || data?.invoiceLink)) {
                      alert(data?.error || 'Не удалось создать инвойс')
                      return
                    }
                    const tg = (window as any).Telegram?.WebApp
                    if (tg?.openInvoice) {
                      const slug = data.slug || ''
                      tg.openInvoice(slug, (status: string) => {
                        if (status === 'paid') {
                          alert('Баланс пополнен!')
                          // Обновляем баланс
                          fetch(`/api/me?stars=true`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: tgId })
                          })
                          .then(r => r.json())
                          .then((data) => {
                            if (data?.user?.stars !== undefined) setStars(data.user.stars)
                          })
                          .catch(()=>{})
                        }
                      })
                    } else if (data.invoiceLink) {
                      window.open(data.invoiceLink, '_blank')
                    } else {
                      alert('Платежная система Telegram недоступна.')
                    }
                  } catch (e) {
                    alert('Ошибка при создании платежа')
                  }
                }}
                className={`w-full rounded-xl px-4 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold shadow-lg transition-all hover:from-yellow-500 hover:to-orange-600`}
              >
                Пополнить баланс
              </button>
            </div>
          )}
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