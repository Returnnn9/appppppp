import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const gifts = [
    {
      name: 'Castle',
      description: 'Legendary fortress gift',
      price: 500,
      total_quantity: 200,
      available_quantity: 200,
      sticker_url: '/images/castle.gif',
      status: 'non_unique',
      frame_type: 'default',
      ribbon_text: 'HOT',
      ribbon_color: '#FF5733',
      is_active: true,
      is_limited: true,
      limited_until: null as Date | null,
    },
    {
      name: 'Coconut',
      description: 'Tropical coconut vibes',
      price: 120,
      total_quantity: 500,
      available_quantity: 500,
      sticker_url: '/images/coconut.gif',
      status: 'non_unique',
      frame_type: 'default',
      ribbon_text: null,
      ribbon_color: null,
      is_active: true,
      is_limited: false,
      limited_until: null as Date | null,
    },
    {
      name: 'Rocket',
      description: 'To the moon!',
      price: 250,
      total_quantity: 300,
      available_quantity: 300,
      sticker_url: '/images/rocket.gif',
      status: 'non_unique',
      frame_type: 'default',
      ribbon_text: 'NEW',
      ribbon_color: '#175CFF',
      is_active: true,
      is_limited: false,
      limited_until: null as Date | null,
    },
  ]

  for (const data of gifts) {
    await prisma.gift.upsert({
      where: { name: data.name },
      update: {},
      create: data,
    })
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 