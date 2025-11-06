const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Обновить ВСЕ подарки с английским описанием
  const result = await prisma.$executeRaw`
    UPDATE Gift 
    SET description = 'Этот подарок скоро будет доступен для улучшения, продажи или выпуска в виде NFT.'
    WHERE description LIKE '%This gift will soon%' 
       OR description LIKE '%available for upgrade%'
       OR description IS NULL 
       OR description = '';
  `;
  
  console.log(`✅ Обновлено записей: ${result}`);
  
  // Показать все подарки
  const gifts = await prisma.gift.findMany({
    select: { id: true, name: true, description: true }
  });
  
  console.log('\n📦 Все подарки:');
  gifts.forEach(g => {
    console.log(`ID ${g.id}: ${g.name}`);
    console.log(`   Описание: ${g.description?.substring(0, 50)}...`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());