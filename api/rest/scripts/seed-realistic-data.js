const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const TOTAL_PRODUCTS = 150;

const CLOUDINARY_IMAGES = [
  'https://res.cloudinary.com/demo/image/upload/sample.jpg',
  'https://res.cloudinary.com/demo/image/upload/dog.jpg',
  'https://res.cloudinary.com/demo/image/upload/sheep.jpg',
  'https://res.cloudinary.com/demo/image/upload/kitten_fighting.jpg',
  'https://res.cloudinary.com/demo/image/upload/yellow_tulip.jpg',
];

const SHOP_NAMES = [
  'Green Basket Market',
  'Urban Tech Hub',
  'Luna Beauty Studio',
  'Homely Living Store',
  'FitFuel Essentials',
];

const TYPE_SEEDS = [
  { slug: 'grocery', name: 'Grocery', icon: 'FruitsVegetable' },
  { slug: 'electronics', name: 'Electronics', icon: 'Laptop' },
  { slug: 'beauty', name: 'Beauty', icon: 'Beauty' },
  { slug: 'home-kitchen', name: 'Home & Kitchen', icon: 'Furniture' },
  { slug: 'fitness', name: 'Fitness', icon: 'Medicine' },
];

const CATEGORY_SEEDS = [
  'Fresh Fruits', 'Organic Vegetables', 'Dairy & Eggs', 'Snacks',
  'Smartphones', 'Laptops', 'Audio Devices', 'Accessories',
  'Skincare', 'Haircare', 'Makeup', 'Fragrances',
  'Cookware', 'Home Decor', 'Storage', 'Cleaning Supplies',
  'Protein', 'Supplements', 'Yoga & Wellness', 'Sports Accessories'
];

const TAG_SEEDS = [
  'organic', 'premium', 'budget', 'new-arrival', 'top-rated',
  'best-seller', 'limited', 'eco-friendly', 'imported', 'daily-use',
  'family-pack', 'small-batch', 'vegan', 'gluten-free', 'wireless',
  'portable', 'fast-charging', 'hydrating', 'sensitive-skin', 'anti-aging'
];

function loadMongoUri() {
  const envPath = path.join(process.cwd(), '.env');
  const env = fs.readFileSync(envPath, 'utf8');
  const line = env.split(/\r?\n/).find((entry) => entry.startsWith('MONGODB_URI='));
  if (!line) throw new Error('MONGODB_URI missing in api/rest/.env');
  return line.replace('MONGODB_URI=', '').trim();
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function pick(arr, index) {
  return arr[index % arr.length];
}

async function nextNumericId(collection) {
  const last = await collection.find({ id: { $type: 'number' } }).sort({ id: -1 }).limit(1).toArray();
  return (last[0]?.id ?? 0) + 1;
}

function buildAttachment(seed, variant = 'main') {
  const image = pick(CLOUDINARY_IMAGES, seed);
  return {
    id: `img-${variant}-${seed}`,
    original: image,
    thumbnail: image,
  };
}

function buildDescription(typeName, categoryName) {
  return `A reliable ${typeName.toLowerCase()} product in ${categoryName.toLowerCase()}, curated for quality, value, and everyday convenience.`;
}

async function seed() {
  const mongoUri = loadMongoUri();
  await mongoose.connect(mongoUri);

  const db = mongoose.connection.db;
  const users = db.collection('users');
  const shops = db.collection('shops');
  const products = db.collection('products');
  const types = db.collection('types');
  const categories = db.collection('categories');
  const tags = db.collection('tags');
  const settings = db.collection('settings');

  const now = new Date();

  await settings.updateOne(
    { language: 'en' },
    {
      $set: {
        id: 1,
        language: 'en',
        options: {
          siteTitle: 'Ecart Marketplace',
          siteSubtitle: 'Fresh products from trusted local stores',
          currency: 'USD',
          paymentGateway: 'stripe',
          minimumOrderAmount: 10,
          walletToCurrencyRatio: 1,
          signupPoints: 20,
          maximumQuestionLimit: 5,
          logo: buildAttachment(1, 'logo'),
          contactDetails: {
            contact: '+1 415 555 0132',
            website: 'https://ecart.local',
            socials: [
              { icon: 'FacebookIcon', url: 'https://facebook.com/ecart' },
              { icon: 'InstagramIcon', url: 'https://instagram.com/ecart' },
            ],
            location: {
              lat: 37.7749,
              lng: -122.4194,
              city: 'San Francisco',
              state: 'CA',
              country: 'USA',
              formattedAddress: 'Market Street, San Francisco, CA',
            },
          },
        },
        created_at: now,
        updated_at: now,
      },
    },
    { upsert: true }
  );

  let typeId = await nextNumericId(types);
  const typeDocs = [];
  for (let i = 0; i < TYPE_SEEDS.length; i++) {
    const seedType = TYPE_SEEDS[i];
    const doc = {
      id: typeId++,
      slug: seedType.slug,
      name: seedType.name,
      icon: seedType.icon,
      image: buildAttachment(i, 'type'),
      banners: [buildAttachment(i + 1, 'type-banner')],
      language: 'en',
      translated_languages: ['en'],
      created_at: now,
      updated_at: now,
    };
    await types.updateOne({ slug: seedType.slug }, { $set: doc }, { upsert: true });
    typeDocs.push(doc);
  }

  let categoryId = await nextNumericId(categories);
  const categoryDocs = [];
  for (let i = 0; i < CATEGORY_SEEDS.length; i++) {
    const name = CATEGORY_SEEDS[i];
    const doc = {
      id: categoryId++,
      name,
      slug: slugify(name),
      details: `${name} category featuring curated items for modern shoppers.`,
      image: buildAttachment(i, 'category'),
      icon: 'Category',
      type: pick(typeDocs, i),
      language: 'en',
      translated_languages: ['en'],
      created_at: now,
      updated_at: now,
    };
    await categories.updateOne({ slug: doc.slug }, { $set: doc }, { upsert: true });
    categoryDocs.push(doc);
  }

  let tagId = await nextNumericId(tags);
  const tagDocs = [];
  for (let i = 0; i < TAG_SEEDS.length; i++) {
    const name = TAG_SEEDS[i];
    const doc = {
      id: tagId++,
      name,
      slug: slugify(name),
      details: `${name} related products`,
      image: buildAttachment(i, 'tag'),
      type: pick(typeDocs, i),
      language: 'en',
      translated_languages: ['en'],
      created_at: now,
      updated_at: now,
    };
    await tags.updateOne({ slug: doc.slug }, { $set: doc }, { upsert: true });
    tagDocs.push(doc);
  }

  let userNumericId = await nextNumericId(users);
  const shopDocs = [];

  for (let i = 0; i < SHOP_NAMES.length; i++) {
    const shopName = SHOP_NAMES[i];
    const shopSlug = slugify(shopName);
    const ownerEmail = `owner${i + 1}@ecart.local`;

    const ownerUser = {
      id: userNumericId++,
      name: `Owner ${i + 1}`,
      email: ownerEmail,
      password: '12345678',
      is_active: true,
      is_admin: i === 0,
      profile: {
        id: `profile-owner-${i + 1}`,
        avatar: buildAttachment(i, 'owner-avatar'),
        bio: `Store owner of ${shopName}`,
        contact: `+1 415 555 01${(30 + i).toString().padStart(2, '0')}`,
      },
      address: [
        {
          title: 'Home',
          type: 'home',
          default: true,
          country: 'USA',
          city: 'San Francisco',
          state: 'CA',
          zip: '94105',
          street_address: `${100 + i} Main Street`,
        },
      ],
      updated_at: now,
      created_at: now,
    };

    await users.updateOne({ email: ownerEmail }, { $set: ownerUser }, { upsert: true });

    const nextShopId = await nextNumericId(shops);
    const shopDoc = {
      id: nextShopId,
      owner_id: ownerUser.id,
      owner: {
        id: ownerUser.id,
        name: ownerUser.name,
        email: ownerUser.email,
        profile: ownerUser.profile,
      },
      is_active: true,
      orders_count: Math.floor(Math.random() * 200) + 50,
      products_count: 0,
      name: shopName,
      slug: shopSlug,
      description: `${shopName} offers trusted products, fast dispatch, and excellent customer support.`,
      cover_image: buildAttachment(i, 'shop-cover'),
      logo: buildAttachment(i + 2, 'shop-logo'),
      address: {
        country: 'USA',
        city: 'San Francisco',
        state: 'CA',
        zip: `9410${i}`,
        street_address: `${400 + i} Commerce Ave`,
      },
      balance: {
        id: nextShopId,
        admin_commission_rate: 10,
        total_earnings: 0,
        withdrawn_amount: 0,
        current_balance: 0,
        payment_info: {
          account: `****${1000 + i}`,
          name: ownerUser.name,
          email: ownerUser.email,
          bank: 'Bank of Commerce',
        },
      },
      settings: {
        contact: ownerUser.profile.contact,
        website: `https://${shopSlug}.ecart.local`,
        socials: [
          { icon: 'FacebookIcon', url: `https://facebook.com/${shopSlug}` },
          { icon: 'InstagramIcon', url: `https://instagram.com/${shopSlug}` },
        ],
        location: {
          lat: 37.77 + i * 0.01,
          lng: -122.41 + i * 0.01,
          city: 'San Francisco',
          state: 'CA',
          country: 'USA',
          formattedAddress: `${400 + i} Commerce Ave, San Francisco, CA`,
        },
      },
      createdAt: now,
      updatedAt: now,
      created_at: now,
      updated_at: now,
    };

    await shops.updateOne({ slug: shopSlug }, { $set: shopDoc }, { upsert: true });
    shopDocs.push(shopDoc);

    await users.updateOne(
      { email: ownerEmail },
      {
        $set: {
          managed_shop: shopDoc,
          shop_id: shopDoc.id,
          updated_at: now,
        },
        $addToSet: {
          shops: shopDoc,
        },
      }
    );
  }

  let productId = await nextNumericId(products);
  const productOperations = [];

  for (let i = 0; i < TOTAL_PRODUCTS; i++) {
    const shop = pick(shopDocs, i);
    const type = pick(typeDocs, i);
    const category = pick(categoryDocs, i);
    const secondCategory = pick(categoryDocs, i + 7);
    const tag1 = pick(tagDocs, i);
    const tag2 = pick(tagDocs, i + 5);

    const productName = `${type.name} ${category.name} Item ${i + 1}`;
    const slug = slugify(`${shop.slug}-${productName}-${i + 1}`);

    const basePrice = 8 + (i % 40) * 3 + Math.floor(Math.random() * 5);
    const salePrice = Math.max(5, basePrice - (i % 5));
    const quantity = 20 + (i % 80);

    const productDoc = {
      id: productId++,
      name: productName,
      slug,
      type,
      type_id: type.id,
      product_type: 'simple',
      categories: [category.id, secondCategory.id],
      tags: [tag1.id, tag2.id],
      shop: shop.id,
      shop_id: shop.id,
      description: buildDescription(type.name, category.name),
      in_stock: quantity > 0,
      is_taxable: true,
      sale_price: salePrice,
      max_price: basePrice,
      min_price: salePrice,
      sku: `SKU-${shop.id}-${String(i + 1).padStart(4, '0')}`,
      gallery: [
        buildAttachment(i, 'product-gallery-1'),
        buildAttachment(i + 2, 'product-gallery-2'),
      ],
      image: buildAttachment(i, 'product-main'),
      status: 'publish',
      height: `${10 + (i % 15)} cm`,
      length: `${12 + (i % 20)} cm`,
      width: `${6 + (i % 10)} cm`,
      price: basePrice,
      quantity,
      unit: 'pcs',
      ratings: Number((3.5 + (i % 15) * 0.1).toFixed(1)),
      in_wishlist: false,
      language: 'en',
      translated_languages: ['en'],
      created_at: now,
      updated_at: now,
    };

    productOperations.push({
      updateOne: {
        filter: { slug },
        update: { $set: productDoc },
        upsert: true,
      },
    });
  }

  if (productOperations.length > 0) {
    await products.bulkWrite(productOperations, { ordered: false });
  }

  for (const shop of shopDocs) {
    const count = await products.countDocuments({ shop_id: shop.id });
    await shops.updateOne({ id: shop.id }, { $set: { products_count: count, updated_at: now, updatedAt: now } });
  }

  const seededShopCount = await shops.countDocuments({ slug: { $in: SHOP_NAMES.map(slugify) } });
  const seededProductCount = await products.countDocuments({ language: 'en' });
  const typeCount = await types.countDocuments({ language: 'en' });
  const categoryCount = await categories.countDocuments({ language: 'en' });
  const tagCount = await tags.countDocuments({ language: 'en' });

  console.log('✅ Seed complete');
  console.log(`Shops (seeded set): ${seededShopCount}`);
  console.log(`Products (language=en): ${seededProductCount}`);
  console.log(`Types: ${typeCount}`);
  console.log(`Categories: ${categoryCount}`);
  console.log(`Tags: ${tagCount}`);

  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error('❌ Seed failed:', error);
  try {
    await mongoose.disconnect();
  } catch (disconnectError) {
    console.error('Disconnect error:', disconnectError);
  }
  process.exit(1);
});
