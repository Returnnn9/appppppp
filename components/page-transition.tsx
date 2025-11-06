"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <div
      style={{
        transition: "opacity 160ms ease, transform 160ms ease",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0px)" : "translateY(4px)",
      }}
    >
      {children}
    </div>
  );
}


