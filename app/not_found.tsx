import React from "react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-6xl font-bold text-blue-500 mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Страница не найдена</h2>
      <p className="text-gray-500 mb-6">
        Извините, но такой страницы не существует.
      </p>
      <a
        href="/"
        className="px-6 py-2 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 transition"
      >
        На главную
      </a>
    </div>
  );
}
