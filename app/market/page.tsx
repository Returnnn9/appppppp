"use client"

import Image from "next/image";
import { Navigation } from "../../components/navigation";
import { useTheme } from "next-themes";

export default function MarketPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div className="flex flex-col items-center justify-center flex-1">
        <div className="p-4 mb-6">
          <Image
            src="/images/duck/duck_manages.gif"
            alt="Market Ducks"
            width={200}
            height={160}
            className="mx-auto"
            priority
          />
        </div>
        <div className="flex flex-col items-center px-8 py-4 text-center">
          <div
            className={`text-[40px] leading-[34px] font-normal mb-2 ${isDark ? "text-white" : "text-black"}`}
            style={{ lineHeight: "44px" }}
          >
            Market
          </div>
          <div
            className={`text-[20px] font-semibold mb-4 ${isDark ? "text-gray-200" : "text-gray-400"}`}
            style={{ lineHeight: "26px" }}
          >
            Marketplace is getting ready<br />
            Coming soon!
          </div>
        </div>
      </div>
      <Navigation />
    </div>
  );
}
