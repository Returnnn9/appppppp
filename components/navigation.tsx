"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export function Navigation() {
  const [hidden, setHidden] = useState(false);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY || window.pageYOffset;
      const isScrollingDown = currentY > lastScrollYRef.current + 4; // небольшой порог
      const isScrollingUp = currentY < lastScrollYRef.current - 4;

      if (isScrollingDown) setHidden(true);
      else if (isScrollingUp) setHidden(false);

      lastScrollYRef.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-card border-t border-border transition-transform duration-200 ${hidden ? "translate-y-full" : "translate-y-0"}`}>
      <div className="flex flex-row items-end justify-between px-2 py-4">
        <Link
          href="/"
          className="flex flex-col items-center flex-1 group"
        >
          <img
            src="/images/telegram_icons/Gifts.svg"
            alt="Подарок"
            width={29}
            height={32}
            className="transition-colors duration-200 group-hover:filter group-hover:brightness-0 group-hover:invert group-hover:sepia group-hover:hue-rotate-[180deg] group-hover:saturate-[5] group-hover:drop-shadow-[0_0_8px_rgba(59,168,248,0.3)]"
            style={{ filter: "none" }}
          />
        </Link>
        <Link
          href="/collection"
          className="flex flex-col items-center flex-1 group"
        >
          <img
            src="/images/telegram_icons/MyCollection.svg"
            alt="Моя коллекция"
            width={76}
            height={32}
            className="transition-colors duration-200 group-hover:filter group-hover:brightness-0 group-hover:invert group-hover:sepia group-hover:hue-rotate-[180deg] group-hover:saturate-[5] group-hover:drop-shadow-[0_0_8px_rgba(59,168,248,0.3)]"
            style={{ filter: "none" }}
          />
        </Link>
        <Link
          href="/market"
          className="flex flex-col items-center flex-1 group"
        >
          <img
            src="/images/telegram_icons/Market.svg"
            alt="Маркет"
            width={40}
            height={32}
            className="transition-colors duration-200 group-hover:filter group-hover:brightness-0 group-hover:invert group-hover:sepia group-hover:hue-rotate-[180deg] group-hover:saturate-[5] group-hover:drop-shadow-[0_0_8px_rgba(59,168,248,0.3)]"
            style={{ filter: "none" }}
          />
        </Link>
        <Link
          href="/dashboards"
          className="flex flex-col items-center flex-1 group"
        >
          <img
            src="/images/telegram_icons/leaders.svg"
            alt="Лидеры"
            width={40}
            height={32}
            className="transition-colors duration-200 group-hover:filter group-hover:brightness-0 group-hover:invert group-hover:sepia group-hover:hue-rotate-[180deg] group-hover:saturate-[5] group-hover:drop-shadow-[0_0_8px_rgba(59,168,248,0.3)]"
            style={{ filter: "none" }}
          />
        </Link>
      </div>
    </div>
  )
}
