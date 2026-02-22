/**
 * Seed script: "Start Quick" Grocery Shop
 *
 * Creates a grocery shop named "Start Quick" with:
 *  - A "Grocery" type (upserts existing or creates new)
 *  - Categories: Fruits, Vegetables, Dairy & Eggs, Snacks & Biscuits,
 *    Beverages, Breakfast, Cooking Essentials, Meat & Fish
 *  - 80 products with real images sourced from the Pickbazar S3 bucket
 *  - An owner user account
 *
 * Run:  cd api/rest && node scripts/seed-start-quick.js
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// ─── Helpers ────────────────────────────────────────────────────────────────

function loadMongoUri() {
  const envPath = path.join(__dirname, '..', '.env');
  const env = fs.readFileSync(envPath, 'utf8');
  const line = env.split(/\r?\n/).find((l) => l.startsWith('MONGODB_URI='));
  if (!line) throw new Error('MONGODB_URI missing in api/rest/.env');
  return line.replace('MONGODB_URI=', '').trim();
}

function slugify(v) {
  return String(v).toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function nextId(collection) {
  const last = await collection.find({ id: { $type: 'number' } }).sort({ id: -1 }).limit(1).toArray();
  return (last[0]?.id ?? 0) + 1;
}

const S3 = 'https://pickbazarlaravel.s3.ap-southeast-1.amazonaws.com';

function img(id, file, thumbFile) {
  return {
    id: String(id),
    original: `${S3}/${id}/${file}`,
    thumbnail: thumbFile
      ? `${S3}/${id}/conversions/${thumbFile}`
      : `${S3}/${id}/${file}`,
  };
}

const now = new Date();

// ─── Real product images from Pickbazar S3 ──────────────────────────────────
// Each product has: name, image id, filename, thumbnail filename, price, sale_price, unit, category index, description

const PRODUCTS = [
  // ── Fruits (category 0) ──────────────────────────────────────────────────
  { name: 'Apples', imgId: 1, file: 'Apples.jpg', thumb: 'Apples-thumbnail.jpg', price: 2.00, sale: 1.60, unit: '1lb', cat: 0, desc: 'Fresh, crisp apples — perfect for snacking, baking, or juicing. Rich in fiber and antioxidants.' },
  { name: 'Blueberries', imgId: 3, file: 'blueberries.jpg', thumb: 'blueberries-thumbnail.jpg', price: 3.00, sale: null, unit: '1lb', cat: 0, desc: 'Plump, sweet blueberries bursting with flavor. Packed with vitamins C & K.' },
  { name: 'Clementines', imgId: 6, file: 'Clementines.jpg', thumb: 'Clementines-thumbnail.jpg', price: 2.50, sale: 2.00, unit: '1lb', cat: 0, desc: 'Easy-to-peel clementines — juicy, seedless, and perfect for lunchboxes.' },
  { name: 'Mango', imgId: 13, file: 'mango.jpg', thumb: 'mango-thumbnail.jpg', price: 3.50, sale: 3.00, unit: '1pc', cat: 0, desc: 'Ripe, fragrant mango with golden flesh. A tropical treat rich in vitamin A.' },
  { name: 'Pears', imgId: 15, file: 'Pears.jpg', thumb: 'Pears-thumbnail.jpg', price: 2.20, sale: null, unit: '1lb', cat: 0, desc: 'Sweet and juicy pears, great for snacking or adding to salads.' },
  { name: 'Cherry', imgId: 17, file: 'cherry.jpg', thumb: 'cherry-thumbnail.jpg', price: 4.50, sale: 3.80, unit: '1lb', cat: 0, desc: 'Deep red cherries — sweet, tart, and loaded with antioxidants.' },
  { name: 'Strawberry', imgId: 18, file: 'Strawberry.jpg', thumb: 'Strawberry-thumbnail.jpg', price: 3.00, sale: 2.50, unit: '1lb', cat: 0, desc: 'Bright red strawberries picked at peak ripeness, perfect for desserts.' },
  { name: 'Lemon', imgId: 20, file: 'Lemon.jpg', thumb: 'Lemon-thumbnail.jpg', price: 1.00, sale: null, unit: '3pcs', cat: 0, desc: 'Fresh lemons — essential for cooking, beverages, and garnishing.' },
  { name: 'Lime', imgId: 12, file: 'Lime.jpg', thumb: 'Lime-thumbnail.jpg', price: 1.20, sale: null, unit: '3pcs', cat: 0, desc: 'Zesty limes, perfect for drinks, marinades, and fresh salsas.' },
  { name: 'Dates', imgId: 9, file: 'Dates.jpg', thumb: 'Dates-thumbnail.jpg', price: 5.00, sale: 4.50, unit: '1lb', cat: 0, desc: 'Naturally sweet dried dates — a power-packed energy snack.' },

  // ── Vegetables (category 1) ──────────────────────────────────────────────
  { name: 'Baby Spinach', imgId: 2, file: 'BabySpinach.jpg', thumb: 'BabySpinach-thumbnail.jpg', price: 1.80, sale: null, unit: '200g', cat: 1, desc: 'Tender baby spinach leaves, ideal for salads, smoothies, and stir-fries.' },
  { name: 'Brussels Sprout', imgId: 4, file: 'BrusselsSprout.jpg', thumb: 'BrusselsSprout-thumbnail.jpg', price: 2.00, sale: null, unit: '1lb', cat: 1, desc: 'Fresh Brussels sprouts — roast, sauté, or steam for a nutritious side.' },
  { name: 'Celery Stick', imgId: 5, file: 'CeleryStick.jpg', thumb: 'CeleryStick-thumbnail.jpg', price: 1.50, sale: null, unit: '1bunch', cat: 1, desc: 'Crispy celery sticks, great for snacking with dips or adding crunch to salads.' },
  { name: 'Sweet Corn', imgId: 7, file: 'SweetCorn.jpg', thumb: 'SweetCorn-thumbnail.jpg', price: 1.00, sale: null, unit: '2pcs', cat: 1, desc: 'Sweet golden corn on the cob — grill, boil, or roast for a delightful side.' },
  { name: 'Cucumber', imgId: 8, file: 'Cucumber.jpg', thumb: 'Cucumber-thumbnail.jpg', price: 0.80, sale: null, unit: '1pc', cat: 1, desc: 'Cool, crunchy cucumber — essential for salads, raita, and refreshing drinks.' },
  { name: 'French Green Beans', imgId: 10, file: 'FrenchGreenBeans.jpg', thumb: 'FrenchGreenBeans-thumbnail.jpg', price: 2.20, sale: null, unit: '1lb', cat: 1, desc: 'Tender French green beans, perfect for sautéing with garlic and olive oil.' },
  { name: 'Green Beans', imgId: 11, file: 'GreenBeans.jpg', thumb: 'GreenBeans-thumbnail.jpg', price: 1.80, sale: null, unit: '1lb', cat: 1, desc: 'Fresh green beans — steam, stir-fry, or add to casseroles.' },
  { name: 'Pepper', imgId: 14, file: 'Pepper.jpg', thumb: 'Pepper-thumbnail.jpg', price: 1.50, sale: null, unit: '2pcs', cat: 1, desc: 'Colorful bell peppers — crisp, sweet, and rich in vitamin C.' },
  { name: 'Peeled Baby Carrot', imgId: 16, file: 'PeeledBabyCarrot.jpg', thumb: 'PeeledBabyCarrot-thumbnail.jpg', price: 1.60, sale: null, unit: '1lb', cat: 1, desc: 'Ready-to-eat peeled baby carrots — a healthy snack rich in beta carotene.' },
  { name: 'Mix Vegetable Platter', imgId: 19, file: 'MixVegetablePlatter.jpg', thumb: 'MixVegetablePlatter-thumbnail.jpg', price: 4.00, sale: 3.50, unit: '1pack', cat: 1, desc: 'Assorted fresh-cut vegetables — perfect for parties, dipping, or quick stir-fry.' },

  // ── Dairy & Eggs (category 2) ────────────────────────────────────────────
  { name: 'Arla Low Fat Milk', imgId: 140, file: 'ArlaAllNaturalMilkGoodnessLowFat.jpg', thumb: 'ArlaAllNaturalMilkGoodnessLowFat-thumbnail.jpg', price: 3.50, sale: null, unit: '1L', cat: 2, desc: 'Arla all-natural low fat milk — smooth, fresh, and packed with calcium.' },
  { name: 'Magnolia Fresh Milk', imgId: 141, file: 'MagnoliaFreshMilk.jpg', thumb: 'MagnoliaFreshMilk-thumbnail.jpg', price: 3.00, sale: null, unit: '1L', cat: 2, desc: 'Magnolia full cream fresh milk — creamy and wholesome for the whole family.' },
  { name: 'Lactaid Milk', imgId: 143, file: 'Lactaid.jpg', thumb: 'Lactaid-thumbnail.jpg', price: 4.50, sale: null, unit: '1L', cat: 2, desc: 'Lactose-free milk — all the taste and nutrition without the discomfort.' },
  { name: 'Cavanagh Free Range Eggs', imgId: 133, file: 'CavanaghFreeRangeEggs.jpg', thumb: 'CavanaghFreeRangeEggs-thumbnail.jpg', price: 4.00, sale: null, unit: '6pcs', cat: 2, desc: 'Free range eggs from happy hens — rich yolks, naturally nutritious.' },
  { name: 'Happy Egg Organic', imgId: 137, file: 'HappyEggOrganic.jpg', thumb: 'HappyEggOrganic-thumbnail.jpg', price: 5.50, sale: 5.00, unit: '6pcs', cat: 2, desc: 'Certified organic free-range eggs with deep orange yolks.' },
  { name: 'Astro Original Yogurt', imgId: 146, file: 'AstroOriginal.jpg', thumb: 'AstroOriginal-thumbnail.jpg', price: 2.80, sale: null, unit: '500g', cat: 2, desc: 'Creamy original yogurt — smooth texture, rich probiotics.' },
  { name: 'Dannon Strawberry Yogurt', imgId: 148, file: 'DannonStrawberry.jpg', thumb: 'DannonStrawberry-thumbnail.jpg', price: 1.50, sale: null, unit: '150g', cat: 2, desc: 'Sweet strawberry yogurt — a delicious, protein-rich snack.' },
  { name: 'Dannon Vanilla Yogurt', imgId: 149, file: 'DannonVanilla.jpg', thumb: 'DannonVanilla-thumbnail.jpg', price: 1.50, sale: null, unit: '150g', cat: 2, desc: 'Smooth vanilla yogurt — pair with granola or enjoy on its own.' },
  { name: 'Barney Butter', imgId: 127, file: 'BarneyButter.jpg', thumb: 'BarneyButter-thumbnail.jpg', price: 6.00, sale: null, unit: '1jar', cat: 2, desc: 'Smooth almond butter — no palm oil, no artificial flavors.' },
  { name: 'Whole Earth Peanut Butter', imgId: 132, file: 'WholeEarthCrunchyPeanutButter.jpg', thumb: 'WholeEarthCrunchyPeanutButter-thumbnail.jpg', price: 4.00, sale: 3.50, unit: '1jar', cat: 2, desc: 'Crunchy peanut butter made from 100% roasted peanuts.' },

  // ── Snacks & Biscuits (category 3) ───────────────────────────────────────
  { name: 'Lotus Biscoff', imgId: 39, file: 'LotusBiscoff.jpg', thumb: 'LotusBiscoff-thumbnail.jpg', price: 3.50, sale: 3.00, unit: '1pack', cat: 3, desc: 'The original caramelised biscuit — crunchy, sweet, and irresistible.' },
  { name: 'Nestle KitKat', imgId: 49, file: 'NestleKitkat.jpg', thumb: 'NestleKitkat-thumbnail.jpg', price: 1.50, sale: null, unit: '4bars', cat: 3, desc: 'Have a break, have a KitKat — crispy wafer covered in smooth chocolate.' },
  { name: 'Dairy Milk Crispello', imgId: 41, file: 'DairyMilkCrispello.jpg', thumb: 'DairyMilkCrispello-thumbnail.jpg', price: 2.00, sale: null, unit: '1bar', cat: 3, desc: 'Light, crispy wafer shell filled with Cadbury chocolate cream.' },
  { name: 'M&M Funsize', imgId: 47, file: 'M&MFunsize.jpg', thumb: 'M&MFunsize-thumbnail.jpg', price: 4.00, sale: 3.50, unit: '10pack', cat: 3, desc: 'Colorful chocolate candies in fun-size packs — great for sharing.' },
  { name: 'Hersheys Kisses', imgId: 46, file: 'HersheysKisses.jpg', thumb: 'HersheysKisses-thumbnail.jpg', price: 5.00, sale: null, unit: '200g', cat: 3, desc: 'Iconic Hershey\'s chocolate kisses — smooth milk chocolate in foil wraps.' },
  { name: 'Doritos Tangy Cheese', imgId: 55, file: 'DoritosTangyCheese.jpg', thumb: 'DoritosTangyCheese-thumbnail.jpg', price: 2.50, sale: null, unit: '1bag', cat: 3, desc: 'Bold tangy cheese tortilla chips — perfect for dipping.' },
  { name: 'Lays Baked', imgId: 56, file: 'LaysBaked.jpg', thumb: 'LaysBaked-thumbnail.jpg', price: 2.00, sale: null, unit: '1bag', cat: 3, desc: 'Baked potato crisps with 65% less fat — all the crunch, less guilt.' },
  { name: 'Lays Sea Salted', imgId: 57, file: 'LaysSeaSalted.jpg', thumb: 'LaysSeaSalted-thumbnail.jpg', price: 2.00, sale: null, unit: '1bag', cat: 3, desc: 'Classic sea-salted potato chips — simple, crunchy perfection.' },
  { name: 'Snikers Slice', imgId: 50, file: 'SnikersSlice.jpg', thumb: 'SnikersSlice-thumbnail.jpg', price: 1.80, sale: null, unit: '1bar', cat: 3, desc: 'Snickers sliced — nougat, caramel, peanuts, and milk chocolate.' },
  { name: 'Nestle Butterfinger', imgId: 48, file: 'NestleButterfinger.jpg', thumb: 'NestleButterfinger-thumbnail.jpg', price: 1.50, sale: null, unit: '1bar', cat: 3, desc: 'Crispety, crunchety, peanut-buttery Butterfinger candy bar.' },

  // ── Beverages (category 4) ──────────────────────────────────────────────
  { name: 'Starbucks House Blend', imgId: 193, file: 'StarbucksHouseBlend.jpg', thumb: 'StarbucksHouseBlend-thumbnail.jpg', price: 8.00, sale: 7.00, unit: '250g', cat: 4, desc: 'Rich and balanced Starbucks House Blend ground coffee.' },
  { name: 'Red Bull Energy Drink', imgId: 200, file: 'RedBullEnergyDrink.jpg', thumb: 'RedBullEnergyDrink-thumbnail.jpg', price: 2.50, sale: null, unit: '250ml', cat: 4, desc: 'Red Bull gives you wings — energy drink with taurine and B-vitamins.' },
  { name: 'Tropicana Orange Juice', imgId: 204, file: 'TropicanaOrange.jpg', thumb: 'TropicanaOrange-thumbnail.jpg', price: 3.50, sale: 3.00, unit: '1L', cat: 4, desc: '100% pure squeezed Tropicana orange juice, not from concentrate.' },
  { name: 'Minute Maid Orange', imgId: 202, file: 'MinuteMaidOrange.jpg', thumb: 'MinuteMaidOrange-thumbnail.jpg', price: 3.00, sale: null, unit: '1L', cat: 4, desc: 'Refreshing Minute Maid orange juice — a classic family favorite.' },
  { name: 'Coca Cola Zero', imgId: 210, file: 'CocaColaZero.jpg', thumb: 'CocaColaZero-thumbnail.jpg', price: 1.50, sale: null, unit: '330ml', cat: 4, desc: 'Zero sugar, zero calories, full-on Coca-Cola taste.' },
  { name: 'Fanta', imgId: 208, file: 'Fanta.jpg', thumb: 'Fanta-thumbnail.jpg', price: 1.20, sale: null, unit: '330ml', cat: 4, desc: 'Bright, bubbly, and bold orange-flavored fizzy drink.' },
  { name: '7 Up Can', imgId: 206, file: '7UpCan.jpg', thumb: '7UpCan-thumbnail.jpg', price: 1.20, sale: null, unit: '330ml', cat: 4, desc: 'Crisp, clean lemon-lime refreshment — the uncola.' },
  { name: 'Tropicana Apple Juice', imgId: 205, file: 'TropicanaApple.jpg', thumb: 'TropicanaApple-thumbnail.jpg', price: 3.50, sale: null, unit: '1L', cat: 4, desc: '100% apple juice from Tropicana — no added sugars or preservatives.' },
  { name: 'Monster Energy', imgId: 198, file: 'MonsterEnergy.jpg', thumb: 'MonsterEnergy-thumbnail.jpg', price: 3.00, sale: null, unit: '500ml', cat: 4, desc: 'Unleash the beast — Monster Energy drink for maximum performance.' },
  { name: 'Boh Instant Tea Mix', imgId: 215, file: 'BohInstantTeaMix.jpg', thumb: 'BohInstantTeaMix-thumbnail.jpg', price: 4.00, sale: null, unit: '20bags', cat: 4, desc: 'Premium instant tea mix — smooth and aromatic Malaysian tea.' },

  // ── Breakfast (category 5) ──────────────────────────────────────────────
  { name: 'Everyday Essentials Wholemeal Bread', imgId: 177, file: 'EverydayEssentialsWholewheatBread.jpg', thumb: 'EverydayEssentialsWholewheatBread-thumbnail.jpg', price: 2.00, sale: null, unit: '1loaf', cat: 5, desc: 'Soft wholemeal bread — a healthier choice for everyday sandwiches.' },
  { name: 'Warburtons Wholemeal Bread', imgId: 183, file: 'WarbutronsWholewheatBread.jpg', thumb: 'WarbutronsWholewheatBread-thumbnail.jpg', price: 2.50, sale: null, unit: '1loaf', cat: 5, desc: 'Warburtons family-baked wholemeal bread — soft and delicious.' },
  { name: 'Nestle Corn Flakes', imgId: 186, file: 'NestleCornFlakes.jpg', thumb: 'NestleCornFlakes-thumbnail.jpg', price: 3.50, sale: 3.00, unit: '500g', cat: 5, desc: 'Golden corn flakes — crunchy, light, and a classic breakfast cereal.' },
  { name: 'Fibre 1 Crunchy Original', imgId: 184, file: 'Fibre1CrunchyOriginal.jpg', thumb: 'Fibre1CrunchyOriginal-thumbnail.jpg', price: 4.00, sale: null, unit: '500g', cat: 5, desc: 'High-fiber cereal with a satisfying crunch — fuel your morning right.' },
  { name: 'Chivers Mixed Fruit Jam', imgId: 188, file: 'ChiversMixedFruitJam.jpg', thumb: 'ChiversMixedFruitJam-thumbnail.jpg', price: 3.00, sale: null, unit: '1jar', cat: 5, desc: 'Chivers classic mixed fruit jam — fruity, sweet, perfect on toast.' },
  { name: 'Red Jacket Raspberry Jam', imgId: 189, file: 'RedJacketRaspberryJam.jpg', thumb: 'RedJacketRaspberryJam-thumbnail.jpg', price: 4.50, sale: 4.00, unit: '1jar', cat: 5, desc: 'Small-batch raspberry jam with real fruit pieces.' },
  { name: 'Roberts Seeded Bloomer', imgId: 179, file: 'RobertsSeededBloomer.jpg', thumb: 'RobertsSeededBloomer-thumbnail.jpg', price: 2.80, sale: null, unit: '1loaf', cat: 5, desc: 'Artisan seeded bloomer loaf — crusty outside, soft inside.' },
  { name: 'Post Honey Comb Cereal', imgId: 187, file: 'PostHoneyComb.jpg', thumb: 'PostHoneyComb-thumbnail.jpg', price: 3.50, sale: null, unit: '400g', cat: 5, desc: 'Honey-sweetened crunchy cereal — big taste in every bite.' },
  { name: 'Farmhouse Multigrain Bread', imgId: 178, file: 'FarmhouseMultigrainBatchLoaf.jpg', thumb: 'FarmhouseMultigrainBatchLoaf-thumbnail.jpg', price: 3.00, sale: null, unit: '1loaf', cat: 5, desc: 'Rustic multigrain batch loaf — loaded with seeds and wholegrains.' },
  { name: 'Starbucks Vanilla Latte', imgId: 194, file: 'StarbucksVanillaLatte.jpg', thumb: 'StarbucksVanillaLatte-thumbnail.jpg', price: 6.50, sale: null, unit: '200ml', cat: 5, desc: 'Ready-to-drink Starbucks vanilla latte — smooth, creamy, and aromatic.' },

  // ── Cooking Essentials (category 6) ─────────────────────────────────────
  { name: 'Goya Extra Virgin Olive Oil', imgId: 155, file: 'GoyaExtraVirginOliveOil.jpg', thumb: 'GoyaExtraVirginOliveOil-thumbnail.jpg', price: 7.00, sale: 6.00, unit: '500ml', cat: 6, desc: 'Goya extra virgin olive oil — cold-pressed, rich flavor for cooking and salads.' },
  { name: 'Naturel Sunflower Oil', imgId: 156, file: 'NaturelPremiumSunflowerOil.jpg', thumb: 'NaturelPremiumSunflowerOil-thumbnail.jpg', price: 4.00, sale: null, unit: '1L', cat: 6, desc: 'Light sunflower oil — high in vitamin E, ideal for everyday cooking.' },
  { name: 'India Gate Basmati Rice', imgId: 161, file: 'IndiaGateBasmatiRice.jpg', thumb: 'IndiaGateBasmatiRice-thumbnail.jpg', price: 8.00, sale: 7.50, unit: '5kg', cat: 6, desc: 'Premium aged basmati rice — long grain, aromatic, and fluffy when cooked.' },
  { name: 'Jasmine Long Grain Rice', imgId: 160, file: 'JasmineLongGrainFragrantRice.jpg', thumb: 'JasmineLongGrainFragrantRice-thumbnail.jpg', price: 6.00, sale: null, unit: '2kg', cat: 6, desc: 'Jasmine fragrant long-grain rice — delicate aroma, soft and sticky.' },
  { name: 'Tate & Lyle White Sugar', imgId: 172, file: 'TateLyleWhiteSugar.jpg', thumb: 'TateLyleWhiteSugar-thumbnail.jpg', price: 2.50, sale: null, unit: '1kg', cat: 6, desc: 'Fine white granulated sugar — essential for baking and beverages.' },
  { name: 'Wholesome Organic Cane Sugar', imgId: 175, file: 'WholesomeOrganicCaneSugar.jpg', thumb: 'WholesomeOrganicCaneSugar-thumbnail.jpg', price: 4.00, sale: null, unit: '1kg', cat: 6, desc: 'USDA organic cane sugar — minimally processed, fair trade certified.' },
  { name: 'Nomu Sea Salt', imgId: 170, file: 'NomuSeaSalt.jpg', thumb: 'NomuSeaSalt-thumbnail.jpg', price: 3.00, sale: null, unit: '500g', cat: 6, desc: 'Gourmet sea salt flakes — harvested from pristine ocean waters.' },
  { name: 'Heinz Chili Sauce', imgId: 87, file: 'HeinzChiliSauce.jpg', thumb: 'HeinzChiliSauce-thumbnail.jpg', price: 2.50, sale: null, unit: '1bottle', cat: 6, desc: 'Classic Heinz chili sauce — tangy and slightly spicy, great as a dip.' },
  { name: 'Allegro BBQ Sauce', imgId: 83, file: 'AllegroBbqSauce.jpg', thumb: 'AllegroBbqSauce-thumbnail.jpg', price: 3.50, sale: 3.00, unit: '1bottle', cat: 6, desc: 'Smoky, tangy Allegro BBQ sauce — perfect for grilling and marinades.' },
  { name: 'Seeds of Change Brown Rice', imgId: 162, file: 'SeedsOfChangeBrownBasmatiRice.jpg', thumb: 'SeedsOfChangeBrownBasmatiRice-thumbnail.jpg', price: 5.50, sale: null, unit: '1kg', cat: 6, desc: 'Organic brown basmati rice — nutty flavor, high in whole-grain goodness.' },

  // ── Meat & Fish (category 7) ────────────────────────────────────────────
  { name: 'Signature Salmon', imgId: 21, file: 'SignatureSalmon.jpg', thumb: 'SignatureSalmon-thumbnail.jpg', price: 12.00, sale: 10.00, unit: '1lb', cat: 7, desc: 'Premium signature salmon fillet — rich in omega-3, sustainably sourced.' },
  { name: 'Cod Fillet', imgId: 22, file: 'CodFillet.jpg', thumb: 'CodFillet-thumbnail.jpg', price: 10.00, sale: null, unit: '1lb', cat: 7, desc: 'Mild, flaky cod fillet — versatile for baking, grilling, or fish & chips.' },
  { name: 'Halibut Fillet', imgId: 24, file: 'HalibutFillet.jpg', thumb: 'HalibutFillet-thumbnail.jpg', price: 14.00, sale: 12.00, unit: '1lb', cat: 7, desc: 'Firm, buttery halibut fillet — a prized catch for gourmet meals.' },
  { name: 'Tilapia Fillet', imgId: 25, file: 'TilapiaFillet.jpg', thumb: 'TilapiaFillet-thumbnail.jpg', price: 8.00, sale: null, unit: '1lb', cat: 7, desc: 'Mild white tilapia fillet — affordable, lean, and easy to cook.' },
  { name: 'Fresh Beef', imgId: 26, file: 'FreshBeef.jpg', thumb: 'FreshBeef-thumbnail.jpg', price: 11.00, sale: null, unit: '1lb', cat: 7, desc: 'Fresh premium beef — perfect for steaks, roasting, or slow cooking.' },
  { name: 'Chicken Breast', imgId: 29, file: 'ChickenBreast.jpg', thumb: 'ChickenBreast-thumbnail.jpg', price: 7.00, sale: 6.50, unit: '1lb', cat: 7, desc: 'Boneless, skinless chicken breast — lean protein for healthy meals.' },
  { name: 'Chicken Thighs', imgId: 28, file: 'ChickenThighs.jpg', thumb: 'ChickenThighs-thumbnail.jpg', price: 5.50, sale: null, unit: '1lb', cat: 7, desc: 'Juicy chicken thighs — great for grilling, curries, and baking.' },
  { name: 'Beef Steak', imgId: 30, file: 'BeefSteak.jpg', thumb: 'BeefSteak-thumbnail.jpg', price: 15.00, sale: 13.00, unit: '1lb', cat: 7, desc: 'Premium cut beef steak — tender, marbled, and full of flavor.' },
  { name: 'Sliced Turkey Breast', imgId: 27, file: 'SlicedTurkeyBreast.jpg', thumb: 'SlicedTurkeyBreast-thumbnail.jpg', price: 6.00, sale: null, unit: '200g', cat: 7, desc: 'Lean sliced turkey breast — perfect for sandwiches and wraps.' },
  { name: 'Swordfish Fillet', imgId: 23, file: 'SwordfishFillet.jpg', thumb: 'SwordfishFillet-thumbnail.jpg', price: 16.00, sale: 14.00, unit: '1lb', cat: 7, desc: 'Meaty swordfish steak — firm texture, ideal for grilling.' },
];

// ─── Categories ─────────────────────────────────────────────────────────────

const CATEGORIES = [
  { name: 'Fruits', icon: 'FruitsVegetable', details: 'Fresh seasonal fruits — handpicked for quality, sweetness, and nutrition.' },
  { name: 'Vegetables', icon: 'FruitsVegetable', details: 'Farm-fresh vegetables delivered daily — crisp, green, and nutritious.' },
  { name: 'Dairy & Eggs', icon: 'DairyFarm', details: 'Fresh dairy products and farm eggs — milk, yogurt, cheese, butter, and more.' },
  { name: 'Snacks & Biscuits', icon: 'Snacks', details: 'Crisps, chocolates, biscuits, and treats — for every craving.' },
  { name: 'Beverages', icon: 'Beverage', details: 'Coffee, tea, juices, sodas, and energy drinks — refreshment for every mood.' },
  { name: 'Breakfast', icon: 'Breakfast', details: 'Bread, cereal, jam, and morning essentials to start your day right.' },
  { name: 'Cooking Essentials', icon: 'Cooking', details: 'Oil, rice, salt, sugar, sauces — everything you need in the kitchen.' },
  { name: 'Meat & Fish', icon: 'MeatFish', details: 'Fresh, quality meat and seafood — responsibly sourced.' },
];

// ─── Tags ───────────────────────────────────────────────────────────────────

const TAGS = [
  'fresh', 'organic', 'bestseller', 'healthy', 'value-pack',
  'imported', 'sugar-free', 'gluten-free', 'protein-rich', 'vegan',
];

// ─── Main seed function ─────────────────────────────────────────────────────

async function seed() {
  const uri = loadMongoUri();
  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri);

  const db = mongoose.connection.db;
  const usersCol    = db.collection('users');
  const shopsCol    = db.collection('shops');
  const typesCol    = db.collection('types');
  const categoriesCol = db.collection('categories');
  const tagsCol     = db.collection('tags');
  const productsCol = db.collection('products');

  // ─── 1. Upsert "Grocery" type ─────────────────────────────────────────
  let typeDoc = await typesCol.findOne({ slug: 'grocery' });
  if (!typeDoc) {
    const typeId = await nextId(typesCol);
    typeDoc = {
      id: typeId,
      slug: 'grocery',
      name: 'Grocery',
      icon: 'FruitsVegetable',
      image: img(904, 'grocery.png', 'grocery-thumbnail.jpg'),
      settings: { isHome: true, layoutType: 'classic', productCard: 'neon' },
      promotional_sliders: [
        img(902, 'offer-5.png', 'offer-5-thumbnail.jpg'),
        img(903, 'offer-4.png', 'offer-4-thumbnail.jpg'),
        img(904, 'offer-3.png', 'offer-3-thumbnail.jpg'),
        img(905, 'offer-2.png', 'offer-2-thumbnail.jpg'),
        img(906, 'offer-1.png', 'offer-1-thumbnail.jpg'),
      ],
      banners: [{
        id: 12,
        type_id: typeId,
        title: 'Groceries Delivered in 90 Minutes',
        description: 'Get your healthy foods & snacks delivered at your doorsteps all day everyday',
        image: img(904, 'grocery.png', 'grocery-thumbnail.jpg'),
      }],
      language: 'en',
      translated_languages: ['en'],
      created_at: now,
      updated_at: now,
    };
    await typesCol.insertOne(typeDoc);
    console.log('Created Grocery type (id:', typeDoc.id, ')');
  } else {
    console.log('Grocery type already exists (id:', typeDoc.id, ')');
  }

  // ─── 2. Create owner user ─────────────────────────────────────────────
  const ownerEmail = 'startquick@ecart.local';
  let ownerUser = await usersCol.findOne({ email: ownerEmail });
  if (!ownerUser) {
    const ownerId = await nextId(usersCol);
    ownerUser = {
      id: ownerId,
      name: 'Start Quick Owner',
      email: ownerEmail,
      password: '12345678',
      is_active: true,
      is_admin: false,
      profile: {
        id: `profile-startquick`,
        avatar: img(891, 'Group-36321.png', 'Group-36321-thumbnail.jpg'),
        bio: 'Owner of Start Quick — your neighborhood grocery store.',
        contact: '+91 98765 43210',
      },
      address: [{
        id: 'sq-addr-1',
        title: 'Store',
        type: 'shipping',
        default: true,
        country: 'India',
        city: 'Mumbai',
        state: 'Maharashtra',
        zip: '400001',
        street_address: 'Shop 12, Market Lane, Fort',
      }],
      created_at: now,
      updated_at: now,
    };
    await usersCol.insertOne(ownerUser);
    console.log('Created owner user (id:', ownerUser.id, ')');
  } else {
    console.log('Owner user already exists (id:', ownerUser.id, ')');
  }

  // ─── 3. Create "Start Quick" shop ─────────────────────────────────────
  const shopSlug = 'start-quick';
  let shopDoc = await shopsCol.findOne({ slug: shopSlug });
  if (!shopDoc) {
    const shopId = await nextId(shopsCol);
    shopDoc = {
      id: shopId,
      owner_id: ownerUser.id,
      owner: {
        id: ownerUser.id,
        name: ownerUser.name,
        email: ownerUser.email,
        profile: ownerUser.profile,
      },
      is_active: true,
      orders_count: 0,
      products_count: 0,
      name: 'Start Quick',
      slug: shopSlug,
      description: 'Start Quick is your trusted neighborhood grocery store. We deliver the freshest fruits, vegetables, dairy, meat, snacks, and everyday essentials right to your doorstep — fast, fresh, and affordable.',
      cover_image: img(892, 'Untitled-2.jpg', 'Untitled-2-thumbnail.jpg'),
      logo: img(891, 'Group-36321.png', 'Group-36321-thumbnail.jpg'),
      address: {
        country: 'India',
        city: 'Mumbai',
        state: 'Maharashtra',
        zip: '400001',
        street_address: 'Shop 12, Market Lane, Fort, Mumbai',
      },
      settings: {
        contact: '+91 98765 43210',
        website: 'https://start-quick.ecart.local',
        socials: [
          { icon: 'FacebookIcon', url: 'https://facebook.com/startquick' },
          { icon: 'InstagramIcon', url: 'https://instagram.com/startquick' },
        ],
        location: {
          lat: 18.9388,
          lng: 72.8354,
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
          formattedAddress: 'Shop 12, Market Lane, Fort, Mumbai 400001',
        },
      },
      created_at: now,
      updated_at: now,
    };
    await shopsCol.insertOne(shopDoc);
    console.log('Created Start Quick shop (id:', shopDoc.id, ')');

    // Link owner → shop
    await usersCol.updateOne(
      { email: ownerEmail },
      {
        $set: { managed_shop: shopDoc, shop_id: shopDoc.id, updated_at: now },
        $addToSet: { shops: shopDoc },
      }
    );
  } else {
    console.log('Start Quick shop already exists (id:', shopDoc.id, ')');
  }

  // ─── 4. Create categories ─────────────────────────────────────────────
  const categoryDocs = [];
  for (const cat of CATEGORIES) {
    const catSlug = slugify(cat.name);
    let existing = await categoriesCol.findOne({ slug: catSlug, 'type.slug': 'grocery' });
    if (!existing) {
      const catId = await nextId(categoriesCol);
      existing = {
        id: catId,
        name: cat.name,
        slug: catSlug,
        details: cat.details,
        icon: cat.icon,
        image: img(904, 'grocery.png', 'grocery-thumbnail.jpg'),
        type: typeDoc,
        parent: null,
        children: [],
        language: 'en',
        translated_languages: ['en'],
        created_at: now,
        updated_at: now,
      };
      await categoriesCol.insertOne(existing);
      console.log('  Created category:', cat.name, '(id:', catId, ')');
    } else {
      console.log('  Category exists:', cat.name, '(id:', existing.id, ')');
    }
    categoryDocs.push(existing);
  }

  // ─── 5. Create tags ──────────────────────────────────────────────────
  const tagDocs = [];
  for (const tagName of TAGS) {
    const tagSlug = slugify(tagName);
    let existing = await tagsCol.findOne({ slug: tagSlug });
    if (!existing) {
      const tagId = await nextId(tagsCol);
      existing = {
        id: tagId,
        name: tagName,
        slug: tagSlug,
        details: `${tagName} products`,
        image: img(904, 'grocery.png', 'grocery-thumbnail.jpg'),
        type: typeDoc,
        language: 'en',
        translated_languages: ['en'],
        created_at: now,
        updated_at: now,
      };
      await tagsCol.insertOne(existing);
    }
    tagDocs.push(existing);
  }
  console.log('  Tags ready:', tagDocs.length);

  // ─── 6. Create products ──────────────────────────────────────────────
  let created = 0;
  let skipped = 0;
  const productOps = [];

  for (let i = 0; i < PRODUCTS.length; i++) {
    const p = PRODUCTS[i];
    const slug = slugify(`start-quick-${p.name}`);

    const existing = await productsCol.findOne({ slug });
    if (existing) {
      skipped++;
      continue;
    }

    const productId = await nextId(productsCol);
    const category = categoryDocs[p.cat];
    const tag1 = tagDocs[i % tagDocs.length];
    const tag2 = tagDocs[(i + 3) % tagDocs.length];
    const productImage = img(p.imgId, p.file, p.thumb);

    const productDoc = {
      id: productId,
      name: p.name,
      slug,
      type: typeDoc,
      type_id: typeDoc.id,
      product_type: 'simple',
      categories: [category.id],
      tags: [tag1.id, tag2.id],
      shop: shopDoc.id,
      shop_id: shopDoc.id,
      description: p.desc,
      in_stock: true,
      is_taxable: true,
      price: p.price,
      sale_price: p.sale,
      max_price: p.price,
      min_price: p.sale || p.price,
      sku: `SQ-${String(productId).padStart(4, '0')}`,
      gallery: [
        productImage,
        img(p.imgId, p.file, p.thumb), // second gallery image same
      ],
      image: productImage,
      status: 'publish',
      height: null,
      length: null,
      width: null,
      quantity: 50 + Math.floor(Math.random() * 100),
      unit: p.unit,
      ratings: Number((3.8 + Math.random() * 1.2).toFixed(1)),
      in_wishlist: false,
      language: 'en',
      translated_languages: ['en'],
      created_at: now,
      updated_at: now,
    };

    productOps.push({
      updateOne: {
        filter: { slug },
        update: { $set: productDoc },
        upsert: true,
      },
    });
    created++;
  }

  if (productOps.length > 0) {
    await productsCol.bulkWrite(productOps, { ordered: false });
  }
  console.log(`  Products: ${created} created, ${skipped} already existed`);

  // ─── 7. Update product count on shop ──────────────────────────────────
  const totalProducts = await productsCol.countDocuments({ shop_id: shopDoc.id });
  await shopsCol.updateOne(
    { id: shopDoc.id },
    { $set: { products_count: totalProducts, updated_at: now } }
  );
  console.log('  Shop products_count:', totalProducts);

  // ─── Done ─────────────────────────────────────────────────────────────
  console.log('\n✅ Start Quick grocery shop seeded successfully!');
  console.log(`   Shop: "${shopDoc.name}" (slug: ${shopDoc.slug})`);
  console.log(`   Categories: ${categoryDocs.length}`);
  console.log(`   Products: ${totalProducts}`);
  console.log(`   Owner: ${ownerUser.email}`);

  await mongoose.disconnect();
}

seed().catch(async (err) => {
  console.error('❌ Seed failed:', err);
  try { await mongoose.disconnect(); } catch (_) {}
  process.exit(1);
});
