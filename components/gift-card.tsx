"use client"

import React from "react"

interface Gift {
  id: number
  name: string
  image: string
  price: number
  availability: string
  status: string
  discount?: number
}

interface GiftCardProps {
  gift: Gift
  onClick: () => void
}

export function GiftCard({ gift, onClick }: GiftCardProps) {
  // Парсим количество и лимит из строки "availability"
  let current = 0
  let total = 0
  const match = gift.availability.match(/(\d+)\s*of\s*(\d+)/i)
  if (match) {
    current = parseInt(match[1], 10)
    total = parseInt(match[2], 10)
  }

  return (
    <div
      className="relative bg-white rounded-2xl shadow flex flex-col items-center justify-end p-0 transition hover:shadow-lg cursor-pointer border border-gray-100
        w-full max-w-[220px] min-w-[140px] min-h-[180px] sm:min-h-[200px] md:min-h-[220px] aspect-[1/1] flex-shrink-0"
      style={{
        boxSizing: "border-box",
      }}
      onClick={onClick}
    >
      {/* Лента с количеством */}
      <div
        className="absolute top-0 right-0"
        style={{
          zIndex: 2,
        }}
      >
        <div
          className="bg-gradient-to-r from-blue-500 to-blue-400 text-white font-bold px-3 py-1 shadow"
          style={{
            borderTopRightRadius: 16,
            borderBottomLeftRadius: 14,
            fontSize: 15,
            minWidth: 64,
            textAlign: "center",
            boxShadow: "0 2px 8px rgba(59,168,248,0.10)",
            fontWeight: 700,
            letterSpacing: 0.5,
          }}
        >
          {current} of {total}
        </div>
      </div>

      {/* Картинка */}
      <div
        className="flex items-center justify-center w-full"
        style={{
          marginTop: 24,
          marginBottom: 14,
          minHeight: 80,
        }}
      >
        <img
          src={gift.image || "/placeholder.svg"}
          alt={gift.name}
          className="object-contain bg-white rounded-xl border border-gray-200 shadow"
          style={{
            width: "60%",
            height: "auto",
            maxWidth: 110,
            maxHeight: 110,
            background: "#fff",
            borderRadius: 18,
            border: "1px solid #E5E7EB",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        />
      </div>

      {/* Цена */}
      <div
        className="flex items-center justify-center w-full mb-6"
        style={{
          minHeight: 32,
        }}
      >
        <div
          className="flex items-center rounded-full px-3 py-2"
          style={{
            background: "#FFF7DD",
            boxShadow: "0 2px 8px rgba(59,168,248,0.04)",
            minWidth: 80,
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ marginRight: 6 }}
          >
            <g filter="url(#filter0_d_1_2)">
              <path
                d="M13.9999 4.66663L16.3499 10.0066L22.1666 10.8466L17.8333 15.0066L18.8499 20.8133L13.9999 17.8466L9.1499 20.8133L10.1666 15.0066L5.83325 10.8466L11.6499 10.0066L13.9999 4.66663Z"
                fill="url(#paint0_linear_1_2)"
              />
            </g>
            <defs>
              <filter
                id="filter0_d_1_2"
                x="0.833252"
                y="4.66663"
                width="26.3333"
                height="24.1467"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
                />
                <feOffset dy="2" />
                <feGaussianBlur stdDeviation="2" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 0.921569 0 0 0 0 0.670588 0 0 0 0 0.156863 0 0 0 0.12 0"
                />
                <feBlend
                  mode="normal"
                  in2="BackgroundImageFix"
                  result="effect1_dropShadow_1_2"
                />
                <feBlend
                  mode="normal"
                  in="SourceGraphic"
                  in2="effect1_dropShadow_1_2"
                  result="shape"
                />
              </filter>
              <linearGradient
                id="paint0_linear_1_2"
                x1="13.9999"
                y1="4.66663"
                x2="13.9999"
                y2="20.8133"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#FFB800" />
                <stop offset="1" stopColor="#FF8A00" />
              </linearGradient>
            </defs>
          </svg>
          <span
            className="text-[18px] font-bold"
            style={{
              background: "linear-gradient(90deg, #FFB800 0%, #FF8A00 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: 700,
              marginLeft: 2,
              letterSpacing: 1,
            }}
          >
            {gift.price.toLocaleString("ru-RU")}
          </span>
        </div>
      </div>
    </div>
  )
}
