/**
 * seed-tenants.js
 * ───────────────
 * Creates a Tenant record for every existing Shop in the database.
 * This is needed for the multi-tenant resolution layer to work.
 *
 * Usage:  node scripts/seed-tenants.js
 */
const mongoose = require('mongoose');

const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://buzzingbloggers_db_user:j2xE9xfa317KxC43@mena-app.4xzlewh.mongodb.net/?appName=mena-app';

async function main() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const shops = await db.collection('shops').find({}, { projection: { id: 1, slug: 1, name: 1 } }).toArray();
  console.log(`Found ${shops.length} shops`);

  const tenantsCol = db.collection('tenants');

  // Get current max tenant id
  const lastTenant = await tenantsCol.findOne({}, { sort: { id: -1 } });
  let nextId = (lastTenant?.id ?? 0) + 1;

  let created = 0;
  let skipped = 0;

  for (const shop of shops) {
    if (!shop.slug) {
      console.log(`  ⚠ Skipping shop id=${shop.id} (no slug)`);
      skipped++;
      continue;
    }

    // Check if tenant already exists for this shop
    const existing = await tenantsCol.findOne({
      $or: [{ shop_id: shop.id }, { slug: shop.slug }],
    });

    if (existing) {
      console.log(`  ⊘ Tenant already exists for shop "${shop.name}" (slug: ${shop.slug})`);
      skipped++;
      continue;
    }

    await tenantsCol.insertOne({
      id: nextId++,
      shop_id: shop.id,
      slug: shop.slug,
      is_active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log(`  ✅ Created tenant for "${shop.name}" → slug: ${shop.slug}, shop_id: ${shop.id}`);
    created++;
  }

  // Create indexes
  await tenantsCol.createIndex({ id: 1 }, { unique: true });
  await tenantsCol.createIndex({ slug: 1 }, { unique: true });
  await tenantsCol.createIndex({ shop_id: 1 });
  await tenantsCol.createIndex({ custom_domain: 1 }, { unique: true, sparse: true });

  console.log(`\n🎉 Done! Created: ${created}, Skipped: ${skipped}`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
