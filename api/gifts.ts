// pages/api/gifts.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const gifts = await prisma.gift.findMany()
      res.status(200).json(gifts)
    } catch (error) {
      res.status(500).json({ error: 'Ошибка при получении подарков' })
    }
  } else {
    res.status(405).json({ error: 'Метод не разрешён' })
  }
}