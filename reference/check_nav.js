const { PrismaClient } = require('./src/generated/prisma');
const db = new PrismaClient();
db.navigationMenu.findMany({
  include: {
    items: {
      where: { parentId: null },
      orderBy: { sortOrder: 'asc' },
      include: { children: { orderBy: { sortOrder: 'asc' } } }
    }
  }
}).then(r => {
  console.log(JSON.stringify(r, null, 2));
}).catch(e => console.error(e)).finally(() => db.$disconnect());
