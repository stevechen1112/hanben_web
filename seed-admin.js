import { PrismaClient } from './src/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

async function main() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });
  const db = new PrismaClient({ adapter });
  const hash = await bcrypt.hash('admin123', 12);
  await db.adminUser.upsert({
    where: { email: 'admin@hanben.com' },
    update: {},
    create: {
      email: 'admin@hanben.com',
      name: '測試管理員',
      passwordHash: hash,
      role: 'SUPER_ADMIN',
    },
  });
  console.log('Admin user created: admin@hanben.com / admin123');
  await db.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
