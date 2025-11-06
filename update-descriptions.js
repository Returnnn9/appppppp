const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const gifts = await prisma.gift.findMany();
  
  console.log(`Найдено ${gifts.length} подарков`);
  
  let updated = 0;
  
  for (const gift of gifts) {
    // Обновляем если описание на английском или пустое
    const needsUpdate = !gift.description || 
                        gift.description.trim() === '' || 
                        gift.description.includes('This gift will soon') ||
                        gift.description.includes('available for upgrade');
    
    if (needsUpdate) {
      await prisma.gift.update({
        where: { id: gift.id },
        data: {
          description: 'Этот подарок скоро будет доступен для улучшения, продажи или выпуска в виде NFT.'
        }
      });
      updated++;
      console.log(`✓ Обновлен подарок #${gift.id}: ${gift.name}`);
    } else {
      console.log(`- Пропущен подарок #${gift.id}: ${gift.name} (уже с русским описанием)`);
    }
  }
  
  console.log(`\n✅ Всего обновлено: ${updated} подарков`);
  console.log(`⏭️  Пропущено: ${gifts.length - updated} подарков`);
}

main()
  .catch((error) => {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());