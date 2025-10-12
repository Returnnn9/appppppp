import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET() {
  try {
    // Получаем только активные подарки, сортировка по id по возрастанию
    const gifts = await prisma.gift.findMany({
      where: { is_active: true },
      orderBy: { id: 'asc' },
    });
    return NextResponse.json(gifts);
  } catch (error: any) {
    // Обработка специфической ошибки Prisma по архитектуре
    if (
      error?.name === 'PrismaClientInitializationError' &&
      typeof error.message === 'string' &&
      error.message.includes('Prisma Client could not locate the Query Engine')
    ) {
      return NextResponse.json(
        {
          error: 'Ошибка инициализации PrismaClient: не найден Query Engine для вашей платформы.',
          details: error.message,
          suggestion: [
            'Похоже, Prisma Client был сгенерирован на другой платформе и не может найти движок запросов (Query Engine) для вашей ОС.',
            'Добавьте вашу платформу (например, "windows") в binaryTargets в файле schema.prisma:',
            '',
            'generator client {',
            '  provider      = "prisma-client-js"',
            '  binaryTargets = ["native", "windows"]',
            '}',
            '',
            'И выполните команду: npx prisma generate'
          ].join('\n')
        },
        { status: 500 }
      );
    }
    // Общий лог ошибок
    return NextResponse.json(
      {
        error: 'Ошибка при получении подарков',
        reason: error?.message || 'Неизвестная ошибка'
      },
      { status: 500 }
    );
  }
}
