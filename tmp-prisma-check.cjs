const { PrismaClient } = require('@prisma/client');
(async () => {
  try {
    const client = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
    console.log('constructed');
    await client.$disconnect();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
