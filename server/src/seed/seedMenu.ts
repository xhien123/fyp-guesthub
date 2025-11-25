import mongoose from "mongoose";
import dotenv from "dotenv";
import MenuCategory from "../models/MenuCategory";
import MenuItem from "../models/MenuItem";

dotenv.config({ path: __dirname + "/../../.env" });

const SAVORY_SIZZLE = "savory-sizzle";
const VIVE_OCEANE = "vive-oceane";

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);

  await MenuCategory.deleteMany({});
  await MenuItem.deleteMany({});

  const categories = await MenuCategory.insertMany([
    { name: "VO Starters", restaurant: "vive-oceane", mealType: "food_dining" },
    { name: "VO Entrées (Mid-Plates)", restaurant: "vive-oceane", mealType: "food_dining" },
    { name: "VO Main Courses", restaurant: "vive-oceane", mealType: "food_dining" },
    { name: "VO Grill / Surf & Turf", restaurant: "vive-oceane", mealType: "food_dining" },
    { name: "VO Cheese Course", restaurant: "vive-oceane", mealType: "food_dining" },
    { name: "VO Desserts", restaurant: "vive-oceane", mealType: "food_dining" },
    { name: "VO Beverages & Wines", restaurant: "vive-oceane", mealType: "beverages_wines" },

    { name: "SS Starters (Appetizers)", restaurant: "savory-sizzle", mealType: "lunch_dinner" },
    { name: "SS Entrées (Mid-Courses)", restaurant: "savory-sizzle", mealType: "lunch_dinner" },
    { name: "SS Main Courses", restaurant: "savory-sizzle", mealType: "lunch_dinner" },
    { name: "SS Desserts", restaurant: "savory-sizzle", mealType: "lunch_dinner" },
    { name: "SS Drinks", restaurant: "savory-sizzle", mealType: "lunch_dinner" }
  ]);

  const [
    voStarters,
    voEntrees,
    voMains,
    voGrill,
    voCheese,
    voDesserts,
    voBeverageCat,
    ssStarters,
    ssMidCourses,
    ssMains,
    ssDesserts,
    drinks
  ] = categories;

  await MenuItem.insertMany([
    { category: voStarters!._id, name: "Oyster Mignonette", description: "Freshly shucked oysters served with cucumber foam and yuzu pearls.", price: 32.0, isAvailable: true, restaurant: VIVE_OCEANE, mealType: "food_dining", photo: "/assets/viveonceane pics/menu vive/starter/vive Oyster Mignonette.jpg" },
    { category: voStarters!._id, name: "Ahi Tuna Tartare", description: "Sashimi-grade tuna, avocado, soy-lime, crispy wonton.", price: 28.0, isAvailable: true, restaurant: VIVE_OCEANE, mealType: "food_dining", photo: "/assets/viveonceane pics/menu vive/starter/vive Ahi Tuna Tartare.jpg" },
    { category: voStarters!._id, name: "Lobster Bisque", description: "Creamy bisque with Atlantic lobster and Cognac.", price: 25.0, isAvailable: true, restaurant: VIVE_OCEANE, mealType: "food_dining", photo: "/assets/viveonceane pics/menu vive/starter/Vive lobster bique.jpg" },
    { category: voStarters!._id, name: "Seafood Ceviche", description: "Local fish, shrimp, scallops in tiger's milk with sweet potato.", price: 26.0, isAvailable: true, restaurant: VIVE_OCEANE, mealType: "food_dining", photo: "/assets/viveonceane pics/menu vive/starter/vive seafood seviche.jpg" },
    { category: voStarters!._id, name: "Crab Louis Cocktail", description: "Jumbo lump crab, classic Louis dressing, butter lettuce.", price: 35.0, isAvailable: true, restaurant: VIVE_OCEANE, mealType: "food_dining", photo: "/assets/viveonceane pics/menu vive/starter/vive crab louis cocktail.jpg" },

    { category: voEntrees!._id, name: "Seared Hokkaido Scallops", description: "Saffron risotto, asparagus tips, black truffle vinaigrette.", price: 45.0, isAvailable: true, restaurant: VIVE_OCEANE, mealType: "food_dining", photo: "/assets/viveonceane pics/menu vive/entree/vive seaerd scallops.jpg" },
    { category: voEntrees!._id, name: "Foie Gras Terrine", description: "Fig jam, toasted brioche, port reduction.", price: 39.0, isAvailable: true, restaurant: VIVE_OCEANE, mealType: "food_dining", photo: "/assets/viveonceane pics/menu vive/entree/vive Foie Gras Terrine.jpg" },
    { category: voEntrees!._id, name: "King Prawn Tagliatelle", description: "Prawns, cherry tomatoes, garlic, chili, white wine.", price: 42.0, isAvailable: true, restaurant: VIVE_OCEANE, mealType: "food_dining", photo: "/assets/viveonceane pics/menu vive/entree/vive King Prawn Tagliatelle.jpg" },
    { category: voEntrees!._id, name: "Black Cod Gyoza", description: "Cod & vegetable gyoza, ponzu sauce.", price: 28.0, isAvailable: true, restaurant: VIVE_OCEANE, mealType: "food_dining", photo: "/assets/viveonceane pics/menu vive/entree/vive Black Cod Gyoza.jpg" },
    { category: voEntrees!._id, name: "Smoked Duck Breast", description: "Thinly sliced duck, spiced pear chutney.", price: 38.0, isAvailable: true, restaurant: VIVE_OCEANE, mealType: "food_dining", photo: "/assets/viveonceane pics/menu vive/entree/vive Smoked Duck Breast.jpg" },

    { category: voMains!._id, name: "Pan-Seared Chilean Sea Bass", description: "Roasted purple potatoes, broccolini, champagne beurre blanc.", price: 65.0, isAvailable: true, restaurant: VIVE_OCEANE, mealType: "food_dining", photo: "/assets/viveonceane pics/menu vive/maincourse/vive Pan-Seared Chilean Sea Bass.jpg" },
    { category: voMains!._id, name: "Wagyu Beef Filet Mignon", description: "A5 Wagyu, bordelaise, bone marrow croquette, gratin.", price: 150.0, isAvailable: true, restaurant: VIVE_OCEANE, mealType: "food_dining", photo: "/assets/viveonceane pics/menu vive/maincourse/vive Wagyu Beef Filet Mignon.jpg" },
    { category: voMains!._id, name: "Alaskan King Crab Thermidor", description: "Creamy mustard & Gruyère, served in shell.", price: 95.0, isAvailable: true, restaurant: VIVE_OCEANE, mealType: "food_dining", photo: "/assets/viveonceane pics/menu vive/maincourse/vive Alaskan King Crab Thermidor.jpg" },
    { category: voMains!._id, name: "Roast Duck à l'Orange", description: "Grand Marnier orange sauce, fingerling potatoes.", price: 58.0, isAvailable: true, restaurant: VIVE_OCEANE, mealType: "food_dining", photo: "/assets/viveonceane pics/menu vive/maincourse/vive Roast Duck à l'Orange.jpg" },

    { category: voGrill!._id, name: "Signature Seafood Platter Royale", description: "Oysters, langoustines, prawns, crab legs, ceviche.", price: 180.0, isAvailable: true, restaurant: VIVE_OCEANE, mealType: "food_dining", photo: "/assets/viveonceane pics/menu vive/Grill & Surf & Turf/vive Signature Seafood Platter Royale.jpg" },
    { category: voGrill!._id, name: "The 'Océane' Surf & Turf", description: "Lobster tail + prime ribeye, béarnaise, truffle fries.", price: 120.0, isAvailable: true, restaurant: VIVE_OCEANE, mealType: "food_dining", photo: "/assets/viveonceane pics/menu vive/Grill & Surf & Turf/vive The 'Océane' Surf & Turf.jpg" },
    { category: voGrill!._id, name: "Grilled Branzino 'Aqua Pazza'", description: "Whole branzino, tomato-olive-caper broth.", price: 55.0, isAvailable: true, restaurant: VIVE_OCEANE, mealType: "food_dining", photo: "/assets/viveonceane pics/menu vive/Grill & Surf & Turf/vive Grilled Branzino 'Aqua Pazza'.jpg" },
    { category: voGrill!._id, name: "Tomahawk Veal Chop", description: "Rosemary-garlic crust, mushroom ragout, glazed carrots.", price: 85.0, isAvailable: true, restaurant: VIVE_OCEANE, mealType: "food_dining", photo: "/assets/viveonceane pics/menu vive/Grill & Surf & Turf/vive Tomahawk Veal Chop.jpg" },

    { category: voCheese!._id, name: "Artisanal French Selection", description: "Roquefort, Comté 24m, Brie; walnuts, quince, fig-port jam.", price: 45.0, isAvailable: true, restaurant: VIVE_OCEANE, mealType: "food_dining", photo: "/assets/viveonceane pics/menu vive/desert/vive Exotic Fruit & Coconut Sphere.jpg" },
    { category: voCheese!._id, name: "The International Trio", description: "Tête de Moine, Cabra al Vino, Époisses; honey & sourdough.", price: 48.0, isAvailable: true, restaurant: VIVE_OCEANE, mealType: "food_dining", photo: "/assets/viveonceane pics/menu vive/desert/vive Exotic Fruit & Coconut Sphere.jpg" },

    { category: voDesserts!._id, name: "Dark Chocolate Lava Cake (Valrhona)", description: "Molten center, vanilla ice cream, raspberry coulis.", price: 18.0, isAvailable: true, restaurant: VIVE_OCEANE, mealType: "food_dining", photo: "/assets/viveonceane pics/menu vive/desert/vive Dark Chocolate Lava Cake (Valrhona).jpg" },
    { category: voDesserts!._id, name: "Crème brûlée Trio", description: "Pistachio, Espresso, Lavender.", price: 20.0, isAvailable: true, restaurant: VIVE_OCEANE, mealType: "food_dining", photo: "/assets/viveonceane pics/menu vive/desert/vive Crème brûlée Trio.jpg" },
    { category: voDesserts!._id, name: "Exotic Fruit & Coconut Sphere", description: "Passion fruit mousse, mango jelly, coconut dacquoise.", price: 22.0, isAvailable: true, restaurant: VIVE_OCEANE, mealType: "food_dining", photo: "/assets/viveonceane pics/menu vive/desert/vive Exotic Fruit & Coconut Sphere.jpg" },

    { category: ssStarters!._id, name: "Local Tuna Crudo", description: "Yellowfin tuna, green mango, sesame, Chili-Lime Nước Chấm.", price: 24.0, isAvailable: true, restaurant: SAVORY_SIZZLE, mealType: "lunch_dinner", photo: "/assets/Savory Sizzle pics/SS MENU/starter/ss Local Tuna Crudo.jpg" },
    { category: ssStarters!._id, name: "Burrata & Heirloom Tomatoes", description: "Burrata, heirloom tomatoes, Thai basil oil, Phu Quoc pepper.", price: 21.0, isAvailable: true, restaurant: SAVORY_SIZZLE, mealType: "lunch_dinner", photo: "/assets/Savory Sizzle pics/SS MENU/starter/ss Burrata and herloom.jpg" },
    { category: ssStarters!._id, name: "Vietnamese-Spiced Foie Gras Terrine", description: "Duck liver terrine, lychee gelée, toasted brioche.", price: 35.0, isAvailable: true, restaurant: SAVORY_SIZZLE, mealType: "lunch_dinner", photo: "/assets/Savory Sizzle pics/SS MENU/starter/ss Vietnamese-Spiced Foie Gras Terrine.jpg" },
    { category: ssStarters!._id, name: "Chilled Cucumber & Avocado Soup", description: "Shiso, crème fraîche, aromatic chili oil.", price: 18.0, isAvailable: true, restaurant: SAVORY_SIZZLE, mealType: "lunch_dinner", photo: "/assets/Savory Sizzle pics/SS MENU/starter/ss Chilled Cucumber & Avocado Soup.jpg" },
    { category: ssStarters!._id, name: "Crispy Prawn Tostada", description: "Grilled prawns on rice paper crisp, kaffir lime & ginger jam.", price: 22.0, isAvailable: true, restaurant: SAVORY_SIZZLE, mealType: "lunch_dinner", photo: "/assets/Savory Sizzle pics/SS MENU/starter/ss Crispy Prawn Tostada.jpg" },

    { category: ssMidCourses!._id, name: "Lemongrass Scallop Risotto", description: "Pan-seared scallops, lemongrass butter, Grana Padano.", price: 35.0, isAvailable: true, restaurant: SAVORY_SIZZLE, mealType: "lunch_dinner", photo: "/assets/Savory Sizzle pics/SS MENU/entree/ss Lemongrass Scallop Risotto.jpg" },
    { category: ssMidCourses!._id, name: "Duck Confit Salad", description: "Frisée, candied pecans, mandarin, ginger-passionfruit vinaigrette.", price: 32.0, isAvailable: true, restaurant: SAVORY_SIZZLE, mealType: "lunch_dinner", photo: "/assets/Savory Sizzle pics/SS MENU/entree/ss Duck Confit Salad.jpg" },
    { category: ssMidCourses!._id, name: "Ravioli di Magro", description: "Ricotta & spinach ravioli, brown butter & sage, bottarga.", price: 28.0, isAvailable: true, restaurant: SAVORY_SIZZLE, mealType: "lunch_dinner", photo: "/assets/Savory Sizzle pics/SS MENU/entree/ss Ravioli de magro.jpg" },
    { category: ssMidCourses!._id, name: "Grilled Local Seabass Fillet", description: "Daily catch, local greens, white wine-vermouth reduction.", price: 38.0, isAvailable: true, restaurant: SAVORY_SIZZLE, mealType: "lunch_dinner", photo: "/assets/Savory Sizzle pics/SS MENU/entree/ss Grilled Local Seabass Fillet.jpg" },
    { category: ssMidCourses!._id, name: "Truffle Croque Monsieur", description: "Sourdough, smoked ham, Gruyère, truffle béchamel.", price: 24.0, isAvailable: true, restaurant: SAVORY_SIZZLE, mealType: "lunch_dinner", photo: "/assets/Savory Sizzle pics/SS MENU/entree/ss Truffle Croque Monsieur.jpg" },

    { category: ssMains!._id, name: "Wagyu Resort Burger", description: "Wagyu patty, truffle aioli, onion jam, cheddar, brioche.", price: 26.0, isAvailable: true, restaurant: SAVORY_SIZZLE, mealType: "lunch_dinner", photo: "/assets/Savory Sizzle pics/SS MENU/maincourse/ss Wagyu Resort Burger.jpg" },
    { category: ssMains!._id, name: "Pan-Seared Salmon", description: "Asparagus, lemon-caper butter, crispy skin shard.", price: 34.0, isAvailable: true, restaurant: SAVORY_SIZZLE, mealType: "lunch_dinner", photo: "/assets/Savory Sizzle pics/SS MENU/maincourse/ss Pan-Seared Salmon.jpg" },
    { category: ssMains!._id, name: "Sautéed Chicken Suprême", description: "Mushroom duxelles, potato purée, Madeira reduction.", price: 30.0, isAvailable: true, restaurant: SAVORY_SIZZLE, mealType: "lunch_dinner", photo: "/assets/Savory Sizzle pics/SS MENU/maincourse/ss Sautéed Chicken Suprême.jpg" },
    { category: ssMains!._id, name: "Curried Vegetable Tarte Tatin", description: "Madras caramelized roots, flaky pastry, yogurt foam.", price: 25.0, isAvailable: true, restaurant: SAVORY_SIZZLE, mealType: "lunch_dinner", photo: "/assets/Savory Sizzle pics/SS MENU/maincourse/ss Curried Vegetable Tarte Tatin.jpg" },
    { category: ssMains!._id, name: "Local Seafood Bouillabaisse", description: "Provençal saffron broth, clams, mussels, snapper, squid.", price: 40.0, isAvailable: true, restaurant: SAVORY_SIZZLE, mealType: "lunch_dinner", photo: "/assets/Savory Sizzle pics/SS MENU/maincourse/ss Local Seafood Bouillabaisse.jpg" },

    { category: ssDesserts!._id, name: "Passion Fruit Tart", description: "Shortcrust, passion fruit curd, Italian meringue.", price: 12.0, isAvailable: true, restaurant: SAVORY_SIZZLE, mealType: "lunch_dinner", photo: "/assets/Savory Sizzle pics/SS MENU/dessert/ss Passion Fruit Tart.jpg" },
    { category: ssDesserts!._id, name: "Tropical Tiramisu", description: "Mascarpone, coconut essence, dark chocolate.", price: 14.0, isAvailable: true, restaurant: SAVORY_SIZZLE, mealType: "lunch_dinner", photo: "/assets/Savory Sizzle pics/SS MENU/dessert/ss Tropical Tiramisu.jpg" },
    { category: ssDesserts!._id, name: "House-Made Ice Creams & Sorbets", description: "Three signature scoops, seasonal fruit flavors.", price: 10.0, isAvailable: true, restaurant: SAVORY_SIZZLE, mealType: "lunch_dinner", photo: "/assets/Savory Sizzle pics/SS MENU/dessert/ss Assortment of House-Made Ice Creams & Sorbets.jpg" },

    { category: drinks!._id, name: "House Red Wine", description: "House selection (glass).", price: 7.0, isAvailable: true, restaurant: SAVORY_SIZZLE, mealType: "lunch_dinner", photo: "/assets/viveonceane pics/menu vive/desert/vive Exotic Fruit & Coconut Sphere.jpg" },
    { category: drinks!._id, name: "Sparkling Water", description: "Chilled mineral water.", price: 2.0, isAvailable: true, restaurant: SAVORY_SIZZLE, mealType: "lunch_dinner", photo: "/assets/viveonceane pics/menu vive/desert/vive Exotic Fruit & Coconut Sphere.jpg" },

    { category: voBeverageCat!._id, name: "The Tropical Blend", description: "Pineapple, orange, passionfruit.", price: 8, isAvailable: true, restaurant: VIVE_OCEANE, mealType: "beverage_wine", photo: "" },
    { category: voBeverageCat!._id, name: "The Greens", description: "Celery, apple, cucumber, ginger.", price: 7, isAvailable: true, restaurant: VIVE_OCEANE, mealType: "beverage_wine", photo: "" },
    { category: voBeverageCat!._id, name: "Watermelon & Mint Crush", description: "Watermelon purée, mint syrup, lime.", price: 7, isAvailable: true, restaurant: VIVE_OCEANE, mealType: "beverage_wine", photo: "" },
    { category: voBeverageCat!._id, name: "Ginger Basil Smash (Mocktail)", description: "Basil & ginger, lemon, sparkling water.", price: 8, isAvailable: true, restaurant: VIVE_OCEANE, mealType: "beverage_wine", photo: "" },
    { category: voBeverageCat!._id, name: "Virgin Piña Colada", description: "Coconut cream, pineapple, blended icy.", price: 9, isAvailable: true, restaurant: VIVE_OCEANE, mealType: "beverage_wine", photo: "" },

    { category: voBeverageCat!._id, name: "Mojito", description: "White rum, mint, lime, soda.", price: 12, isAvailable: true, restaurant: VIVE_OCEANE, mealType: "beverage_wine", photo: "" },
    { category: voBeverageCat!._id, name: "Margarita", description: "Tequila, triple sec, fresh lime.", price: 13, isAvailable: true, restaurant: VIVE_OCEANE, mealType: "beverage_wine", photo: "" },
    { category: voBeverageCat!._id, name: "Aperol Spritz", description: "Aperol, prosecco, soda.", price: 14, isAvailable: true, restaurant: VIVE_OCEANE, mealType: "beverage_wine", photo: "" },
    { category: voBeverageCat!._id, name: "Espresso Martini", description: "Vodka, coffee liqueur, espresso.", price: 14, isAvailable: true, restaurant: VIVE_OCEANE, mealType: "beverage_wine", photo: "" },
    { category: voBeverageCat!._id, name: "Old Fashioned", description: "Bourbon/Rye, sugar, bitters, orange peel.", price: 15, isAvailable: true, restaurant: VIVE_OCEANE, mealType: "beverage_wine", photo: "" },

    { category: voBeverageCat!._id, name: "Mango-Chili Cooler", description: "Vodka, mango, lime, hint of chili.", price: 14, isAvailable: true, restaurant: VIVE_OCEANE, mealType: "beverage_wine", photo: "" },
    { category: voBeverageCat!._id, name: "Sunset Daiquiri", description: "Dark & light rums, pineapple, passionfruit.", price: 14, isAvailable: true, restaurant: VIVE_OCEANE, mealType: "beverage_wine", photo: "" },
    { category: voBeverageCat!._id, name: "Spicy Paloma", description: "Tequila, grapefruit soda, lime, chili-salt rim.", price: 13, isAvailable: true, restaurant: VIVE_OCEANE, mealType: "beverage_wine", photo: "" },
    { category: voBeverageCat!._id, name: "Basil & Cucumber Gimlet", description: "Gin, cucumber, basil, lime.", price: 13, isAvailable: true, restaurant: VIVE_OCEANE, mealType: "beverage_wine", photo: "" },
    { category: voBeverageCat!._id, name: "Lychee Rosé Spritz", description: "Rosé, lychee liqueur, sparkling water.", price: 12, isAvailable: true, restaurant: VIVE_OCEANE, mealType: "beverage_wine", photo: "" },

    { category: voBeverageCat!._id, name: "Prosecco (Italy)", description: "Light, fruity, approachable.", price: 11, isAvailable: true, restaurant: VIVE_OCEANE, mealType: "beverage_wine", photo: "" },
    { category: voBeverageCat!._id, name: "Champagne (France)", description: "Premium traditional method.", price: 24, isAvailable: true, restaurant: VIVE_OCEANE, mealType: "beverage_wine", photo: "" },
    { category: voBeverageCat!._id, name: "Sauvignon Blanc (NZ)", description: "Zesty, high acidity; great with fish.", price: 12, isAvailable: true, restaurant: VIVE_OCEANE, mealType: "beverage_wine", photo: "" },
    { category: voBeverageCat!._id, name: "Pinot Grigio (Italy)", description: "Clean, mineral, popular.", price: 11, isAvailable: true, restaurant: VIVE_OCEANE, mealType: "beverage_wine", photo: "" },
    { category: voBeverageCat!._id, name: "Provence Rosé (France)", description: "Pale, dry, elegant.", price: 12, isAvailable: true, restaurant: VIVE_OCEANE, mealType: "beverage_wine", photo: "" },
    { category: voBeverageCat!._id, name: "Pinot Noir", description: "Light red, can be lightly chilled.", price: 13, isAvailable: true, restaurant: VIVE_OCEANE, mealType: "beverage_wine", photo: "" },
    { category: voBeverageCat!._id, name: "Malbec / Merlot", description: "Fuller red; earthy & bold.", price: 13, isAvailable: true, restaurant: VIVE_OCEANE, mealType: "beverage_wine", photo: "" },

    { category: voBeverageCat!._id, name: "Vodka — Premium / House", description: "Ask server for selection.", price: 9, isAvailable: true, restaurant: VIVE_OCEANE, mealType: "beverage_wine", photo: "" },
    { category: voBeverageCat!._id, name: "Gin — Premium / London Dry", description: "Ask server for selection.", price: 9, isAvailable: true, restaurant: VIVE_OCEANE, mealType: "beverage_wine", photo: "" },
    { category: voBeverageCat!._id, name: "Rum — White / Aged Dark", description: "Ask server for selection.", price: 9, isAvailable: true, restaurant: VIVE_OCEANE, mealType: "beverage_wine", photo: "" },
    { category: voBeverageCat!._id, name: "Tequila — Blanco / Reposado", description: "Ask server for selection.", price: 10, isAvailable: true, restaurant: VIVE_OCEANE, mealType: "beverage_wine", photo: "" },
    { category: voBeverageCat!._id, name: "Whiskey — Scotch / Bourbon / Irish", description: "Ask server for selection.", price: 11, isAvailable: true, restaurant: VIVE_OCEANE, mealType: "beverage_wine", photo: "" },
    { category: voBeverageCat!._id, name: "Draft / Bottled Beers", description: "Lager, Pilsner, Pale Ale.", price: 7, isAvailable: true, restaurant: VIVE_OCEANE, mealType: "beverage_wine", photo: "" },
    { category: voBeverageCat!._id, name: "Soft Drinks", description: "Cola, Diet, Lemon-Lime, Ginger Ale, Tonic, Soda.", price: 3, isAvailable: true, restaurant: VIVE_OCEANE, mealType: "beverage_wine", photo: "" }
  ]);

  console.log("✅ Seeded categories and items for VIVE OCEANE & SAVORY SIZZLE");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
  