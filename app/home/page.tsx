"use client"

export default function MyCollection() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      {/* Профиль пользователя */}
      <div className="flex flex-col items-center mt-16">
        
        <div
          className="w-24 h-24 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 mb-4"
          style={{
            boxShadow: "0 4px 16px rgba(59,168,248,0.10)",
          }}
        />
        {/* Имя пользователя */}
        <div className="text-lg font-bold text-gray-900 mb-2">
          j_belfort69
        </div>
        {/* Статистика */}
        <div className="flex items-center space-x-8">
          <div className="flex flex-col items-center">
            <span className="text-base font-bold text-gray-900 flex items-center">
              0
              <img
                className="ml-1"
                width={14}
                height={18}
                src="/images/telegram_icons/1gifts.svg"
                alt="Подарки"
              />
            </span>
            <span className="text-xs text-gray-500 mt-1">bought</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-base font-bold text-gray-900 flex items-center">
              0
              <img
                className="ml-1"
                width={14}
                height={18}
                src="/images/telegram_icons/1gifts.svg"
                alt="Подарки"
              />
            </span>
            <span className="text-xs text-gray-500 mt-1">sold</span>
          </div>
        </div>
      </div>

      {/* Коллекция пользователя */}
      <div className="flex-1 px-6 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Моя коллекция</h2>
        <div className="w-full flex flex-col items-center justify-center text-gray-400 py-16">
       
          <div className="mt-4 text-lg font-medium">У вас пока нет подарков</div>
          <div className="text-sm text-gray-500 mt-1">Покупайте подарки на маркете, чтобы они появились здесь</div>
        </div>
      </div>

      {/* Навигация снизу */}
      <nav className="w-full px-2 pb-2 pt-4 bg-transparent border-t border-gray-200">
        <div className="flex justify-between items-end">
          {/* Gifts */}
          <div className="flex flex-col items-center flex-1">
            <img src="/images/telegram_icons/Gifts.svg" alt="подарки" width={29} height={32} />
           
          </div>
          {/* My Collection */}
          <div className="flex flex-col items-center flex-1">
            <img src="/images/telegram_icons/MyCollection.svg" alt="моя коллекция" width={76} height={32} />
           
          </div>
          {/* Market */}
          <div className="flex flex-col items-center flex-1">
            <img src="/images/telegram_icons/Market.svg" alt="маркет" width={40} height={32} />
           
          </div>
          {/* Leaders */}
          <div className="flex flex-col items-center flex-1">
            <img src="/images/telegram_icons/leaders.svg" alt="лидеры" width={40} height={32} />
            
          </div>
        </div>
      </nav>
    </div>
  )
}
