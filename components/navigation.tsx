"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navigation() {
  const pathname = usePathname();
  const isActive = (href: string) => (pathname === href);

  const activeFilter = "drop-shadow(0 0 10px rgba(59,130,246,0.45))";
  const inactiveFilter = "grayscale(1) opacity(0.7)";

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-card border-t border-border z-20`}>
      <div className="flex flex-row items-end justify-between px-2 py-3">
        <Link href="/" className="flex flex-col items-center flex-1">
          <img
            src="/images/telegram_icons/Gifts.svg"
            alt="Подарок"
            width={29}
            height={32}
            style={{ filter: isActive("/") ? activeFilter : inactiveFilter }}
          />
        </Link>
        <Link href="/collection" className="flex flex-col items-center flex-1">
          <img
            src="/images/telegram_icons/MyCollection.svg"
            alt="Моя коллекция"
            width={76}
            height={32}
            style={{ filter: isActive("/collection") ? activeFilter : inactiveFilter }}
          />
        </Link>
        <Link href="/market" className="flex flex-col items-center flex-1">
          <img
            src="/images/telegram_icons/Market.svg"
            alt="Маркет"
            width={40}
            height={32}
            style={{ filter: isActive("/market") ? activeFilter : inactiveFilter }}
          />
        </Link>
        <Link href="/dashboards" className="flex flex-col items-center flex-1">
          <img
            src="/images/telegram_icons/leaders.svg"
            alt="Лидеры"
            width={40}
            height={32}
            style={{ filter: isActive("/dashboards") ? activeFilter : inactiveFilter }}
          />
        </Link>
      </div>
    </div>
  )
}
