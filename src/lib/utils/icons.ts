/**
 * Utility to infer a Lucide icon name (slug) from a request title or category.
 */
export function inferIconName(title: string, category: string): string {
  const t = (title || "").toLowerCase();
  const c = (category || "").toLowerCase();

  // 1. Specific keyword matches from title
  if (t.includes("macbook") || t.includes("laptop") || t.includes("computer")) return 'laptop';
  if (t.includes("iphone") || t.includes("phone") || t.includes("smartphone") || t.includes("pixel")) return 'smartphone';
  if (t.includes("keyboard")) return 'keyboard';
  if (t.includes("airpods") || t.includes("headphone") || t.includes("audio") || t.includes("sony wh")) return 'headphones';
  if (t.includes("ps5") || t.includes("xbox") || t.includes("switch") || t.includes("game") || t.includes("gaming") || t.includes("console") || t.includes("gameboy")) return 'gamepad-2';
  if (t.includes("camera") || t.includes("canon") || t.includes("nikon") || t.includes("photography")) return 'camera';
  if (t.includes("tv") || t.includes("television") || t.includes("lg") || t.includes("samsung tv")) return 'tv';
  if (t.includes("apple watch") || t.includes("watch") || t.includes("rolex")) return 'watch';
  if (t.includes("sneakers") || t.includes("shoes") || t.includes("nike") || t.includes("adidas")) return 'footprints';
  if (t.includes("bag") || t.includes("handbag") || t.includes("backpack")) return 'shopping-bag';
  if (t.includes("jacket") || t.includes("shirt") || t.includes("clothes") || t.includes("clothing")) return 'shopping-bag';
  if (t.includes("car") || t.includes("tesla") || t.includes("auto")) return 'car';
  if (t.includes("food") || t.includes("grocery") || t.includes("snack") || t.includes("drink")) return 'apple';
  if (t.includes("makeup") || t.includes("beauty") || t.includes("skincare")) return 'sparkles';
  if (t.includes("repair") || t.includes("fix") || t.includes("service")) return 'wrench';
  if (t.includes("book") || t.includes("alchemy") || t.includes("medicine")) return 'book';
  if (t.includes("pottery") || t.includes("art") || t.includes("class") || t.includes("paint")) return 'brush';
  if (t.includes("code") || t.includes("script") || t.includes("python") || t.includes("scraping")) return 'code';
  if (t.includes("pokemon") || t.includes("card") || t.includes("collectible") || t.includes("rare")) return 'gem';
  if (t.includes("dog") || t.includes("cat") || t.includes("walker") || t.includes("pet")) return 'footprints';
  if (t.includes("tank") || t.includes("fermenter") || t.includes("brew")) return 'box';

  // 2. Fallback to category-based inference
  if (c.includes("tech") || c.includes("electronics")) return 'laptop';
  if (c.includes("grocery") || c.includes("food")) return 'apple';
  if (c.includes("fashion") || c.includes("accessory") || c.includes("beauty")) return 'shopping-bag';
  if (c.includes("family") || c.includes("kids") || c.includes("baby")) return 'baby';
  if (c.includes("home") || c.includes("living") || c.includes("garden")) return 'home';
  if (c.includes("gaming") || c.includes("console") || c.includes("entertainment")) return 'gamepad-2';
  if (c.includes("automotive") || c.includes("car")) return 'car';
  if (c.includes("health")) return 'heart-pulse';
  if (c.includes("travel") || c.includes("service")) return 'map-pin';

  return 'package';
}
