"use client"

import React from "react";
import Image from "next/image";
import { Navigation } from "../../components/navigation";
import { useTheme } from "next-themes"; // Добавляем для темной темы

// Тип для записи лидера
type Leader = { id: number; name: string; avatar: string | null; points: number; gifts: number; color?: string; initials?: string }
let users: Leader[] = []

// Значения по умолчанию для текущего пользователя
const defaultCurrentUser = {
  id: 6,
  name: "you",
  avatar: null as string | null,
  points: 0,
  gifts: 0,
  place: 0,
  isCurrent: true,
  color: "bg-teal-400",
  initials: "YO",
};

// Новый объединённый и увеличенный компонент табов
function TimeTabs({ active, setActive, dark }: { active: "week" | "all"; setActive: (v: "week" | "all") => void; dark: boolean }) {
  return (
    <div className="flex w-full justify-center mb-6 mt-4">
      <div className={`flex w-full max-w-xl rounded-full p-1 shadow-sm ${dark ? "bg-[#1c1d29]" : "bg-[#f5f6fa]"}`}>
        <button
          className={`flex-1 h-[56px] rounded-full text-lg transition-colors duration-150 ${
            active === "week"
              ? dark
                ? "bg-[#175cff] text-white shadow"
                : "bg-[#175cff] text-white shadow"
              : dark
                ? "bg-transparent text-gray-300"
                : "bg-transparent text-black-500"
          }`}
          onClick={() => setActive("week")}
          style={{ minWidth: 0 }}
        >
          In a week
        </button>
        <button
          className={`flex-1 h-[56px] rounded-full text-lg transition-colors duration-150 ${
            active === "all"
              ? dark
                ? "bg-black text-white shadow"
                : "bg-[#175cff] text-white shadow"
              : dark
                ? "bg-transparent text-gray-300"
                : "bg-transparent text-black-500"
          }`}
          onClick={() => setActive("all")}
          style={{ minWidth: 0 }}
        >
          For all the time
        </button>
      </div>
    </div>
  );
}

// Новый компонент таймера, стилизованный как на картинке
function TimerStyled({ timeLeft, dark }: {
  timeLeft: { days: number; hours: number; minutes: number; seconds: number },
  dark: boolean,
}) {
  // Массив для рендера блоков времени
  const timeBlocks = [
    { value: timeLeft.days, label: "days" },
    { value: timeLeft.hours, label: "hours" },
    { value: timeLeft.minutes, label: "minutes" },
    { value: timeLeft.seconds, label: "seconds" },
  ];

  return (
    <div className="w-full flex justify-center">
      <div className={`rounded-2xl w-full flex justify-between px-4 py-4 shadow-sm mb-4 ${dark ? "bg-[#222338]" : "bg-white"}`}>
        {timeBlocks.map((block, idx) => (
          <div key={block.label} className="flex flex-col items-center flex-1">
            <span className={`text-[22px] font-bold leading-none ${dark ? "text-white" : ""}`}>{block.value}</span>
            <span className={`text-xs leading-none mt-1 ${dark ? "text-gray-400" : "text-gray-400"}`}>{block.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function useTimerToEndOfWeek() {
  const [timeLeft, setTimeLeft] = React.useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  React.useEffect(() => {
    function getTimeToEndOfWeek() {
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0 (вс) - 6 (сб)
      const daysUntilSunday = 7 - dayOfWeek;
      const endOfWeek = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + daysUntilSunday,
        23, 59, 59, 999
      );
      const diff = endOfWeek.getTime() - now.getTime();

      if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      return { days, hours, minutes, seconds };
    }

    setTimeLeft(getTimeToEndOfWeek());

    const timer = setInterval(() => {
      setTimeLeft(getTimeToEndOfWeek());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return timeLeft;
}

// Градиент для "золотого" пользователя
const goldGradientStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, rgba(254,183,1,1) 0%, rgba(255,112,0,1) 100%)",
};

// Компонент для отображения строки пользователя
function UserRow({
  user,
  place,
  highlight,
  dark,
}: {
  user: typeof users[0];
  place: number;
  highlight?: boolean;
  dark: boolean;
}) {
  // Цвета строк для темной темы
  const bgMain = dark ? "bg-[#23243a]" : "bg-white";
  const bgHighlight = dark ? "bg-[#32345c] border-t border-[#3c3d60]" : "bg-white border-t border-gray-200";
  const boxShadow = dark ? { boxShadow: "0 0 0 2px #363770" } : { boxShadow: "0 0 0 2px #E0E0E0" };
  const textName = dark ? "text-gray-100" : "text-black";
  const textNumber = dark ? "text-gray-400" : "text-gray-400";
  const borderColor = dark ? "border-[#30317a]" : "border-gray-200";
  return (
    <div
      className={`flex items-center px-4 py-2 rounded-xl mb-2 ${highlight ? bgHighlight : bgMain}`}
      style={highlight ? boxShadow : {}}
    >
      <div className="w-12 h-12 flex items-center justify-center mr-3">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className={`w-12 h-12 rounded-full object-cover border ${borderColor}`}
          />
        ) : user.color === "gold-gradient" ? (
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
            style={goldGradientStyle}
          >
            {user.initials}
          </div>
        ) : (
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${user.color}`}
          >
            {user.initials}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`font-semibold text-base truncate ${textName}`}>{user.name}</div>
        <div className="flex items-center gap-2 mt-1">
          <span className="flex items-center text-xs text-[#F9A825] font-semibold">
            <img
              src="/images/telegram_icons/start.svg"
              alt="Стар"
              width={16}
              height={16}
              className="mr-0.5 inline-block align-middle"
              style={{ minWidth: 16, minHeight: 16 }}
              draggable={false}
            />
            <span className="ml-0.5">{user.points.toLocaleString("en-US")}</span>
          </span>
          <span className={`flex items-center text-xs font-semibold ml-2 ${dark ? "text-blue-300" : "text-blue-500"}`}>
            <img
              src="/images/telegram_icons/gift.svg"
              alt="Подарки"
              width={14}
              height={14}
              className="mr-0.5 inline-block align-middle"
              style={{ minWidth: 14, minHeight: 14 }}
              draggable={false}
            /> 
            <span className="ml-0.5">{user.gifts}</span>
          </span>
        </div>
      </div>
      <div className={`text-base font-semibold ml-2 flex-shrink-0 ${textNumber}`}>
        {highlight ? (
          <span className="font-normal">№{place || 0}</span>
        ) : (
          <span>#{place}</span>
        )}
      </div>
    </div>
  );
}

export default function DashboardsPage() {
  const [activeTab, setActiveTab] = React.useState<"week" | "all">("week");
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  const [me, setMe] = React.useState(defaultCurrentUser)
  const [leaders, setLeaders] = React.useState<Leader[]>([])

  React.useEffect(() => {
    const tg = (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) ? (window as any).Telegram.WebApp : null
    const u = tg?.initDataUnsafe?.user
    const name = u?.username || u?.first_name || defaultCurrentUser.name
    const avatar = u?.photo_url || null
    setMe((prev) => ({ ...prev, name, avatar }))
    // подгружаем лидерборд
    const tgId = u?.id ? `&tg_id=${u.id}` : ''
    fetch(`/api/leaderboard?period=week&limit=100${tgId}`)
      .then(r => r.json())
      .then((data) => {
        if (!data?.ok) return
        const list: Leader[] = (data.leaderboard || []).map((row: any) => ({
          id: row.user_id,
          name: row.username || '—',
          avatar: row.avatar_url || null,
          points: row.stars || 0,
          gifts: row.gifts || 0,
        }))
        setLeaders(list)
        if (data.me) {
          const displayName = data.me.username || u?.username || u?.first_name || 'you'
          setMe((prev) => ({ ...prev, name: displayName, avatar: data.me.avatar_url || prev.avatar, points: data.me.stars || 0, gifts: data.me.gifts || 0, place: data.me.place || prev.place }))
        }
      })
      .catch(()=>{})
  }, [])
  const bgPage = dark ? "bg-black" : "bg-gray-50";
  const bgLeaderboard = dark ? "bg-[#23243a] shadow-none" : "bg-white shadow-sm";
  const textLeaderboardHeader = dark ? "text-gray-200" : "text-black";

  const timeLeft = useTimerToEndOfWeek();

  return (
    <div className={`min-h-screen flex flex-col justify-between ${bgPage}`}>
      <div className="flex flex-col items-center flex-1 w-full max-w-md mx-auto pt-4 pb-24">
        <div className="w-full">
          <TimeTabs active={activeTab} setActive={setActiveTab} dark={dark} />
          {activeTab === "week" && <TimerStyled timeLeft={timeLeft} dark={dark} />}
          {/* Если нужно, можно добавить отображение другого таймера для "all" */}
          <div className={`rounded-2xl px-0 py-2 mb-2 ${bgLeaderboard}`}>
            <div className={`text-base font-bold text-center mb-2 mt-2 ${textLeaderboardHeader}`}>Top 100 leaders</div>
            {leaders.map((user, idx) => (
              <UserRow
                key={user.id}
                user={user}
                place={idx + 1}
                highlight={false}
                dark={dark}
              />
            ))}
          </div>
          <div className="mt-2">
            <UserRow user={{...me, name: me.name} as any} place={me.place || 0} highlight={true} dark={dark} />
          </div>
        </div>
      </div>
      <Navigation />
    </div>
  );
}
