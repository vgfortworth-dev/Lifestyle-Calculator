import { Option } from '../types';

export type ClothingGameItem = {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  lifespan_months: number;
  image_url: string;
  sort_order?: number;
  is_active?: boolean;
};

export const CLOTHING_GAME_ITEMS: ClothingGameItem[] = [
  { id: 'top-tshirt', name: 'T-Shirt', category: 'tops', description: 'A simple everyday basic for school, errands, and layering.', price: 18, lifespan_months: 12, image_url: 'https://res.cloudinary.com/dyjfdwah7/image/upload/v1776438308/TShirt_s1wpef.jpg', sort_order: 1, is_active: true },
  { id: 'top-tank-top', name: 'Tank Top', category: 'tops', description: 'Lightweight option for hot weather or workouts.', price: 14, lifespan_months: 10, image_url: 'https://res.cloudinary.com/dyjfdwah7/image/upload/v1776438311/Tank_Top_jvt3me.jpg', sort_order: 2, is_active: true },
  { id: 'top-blouse', name: 'Blouse', category: 'tops', description: 'A dressier top that works for school events or going out.', price: 28, lifespan_months: 18, image_url: 'https://res.cloudinary.com/dyjfdwah7/image/upload/v1776438301/Blouse_l9jmzp.jpg', sort_order: 3, is_active: true },
  { id: 'top-button-up', name: 'Button-Up Shirt', category: 'tops', description: 'Clean and polished for presentations or nicer plans.', price: 32, lifespan_months: 24, image_url: 'https://res.cloudinary.com/dyjfdwah7/image/upload/v1776438301/Button_Down_Shirt_q1lbkb.jpg', sort_order: 4, is_active: true },
  { id: 'top-hoodie', name: 'Hoodie', category: 'tops', description: 'A casual layer for cooler classrooms and weekends.', price: 40, lifespan_months: 24, image_url: 'https://res.cloudinary.com/dyjfdwah7/image/upload/v1776438305/Hoodie_kxygws.jpg', sort_order: 5, is_active: true },
  { id: 'top-sweater', name: 'Sweater', category: 'tops', description: 'A cozy option that can feel casual or a little dressed up.', price: 42, lifespan_months: 24, image_url: 'https://res.cloudinary.com/dyjfdwah7/image/upload/v1776438307/Sweater_yvpzai.jpg', sort_order: 6, is_active: true },
  { id: 'top-polo', name: 'Polo', category: 'tops', description: 'A neat everyday top that feels slightly more polished.', price: 26, lifespan_months: 18, image_url: 'https://res.cloudinary.com/dyjfdwah7/image/upload/v1776438305/Polo_afc2dt.jpg', sort_order: 7, is_active: true },

  { id: 'bottom-jeans', name: 'Jeans', category: 'bottoms', description: 'A dependable daily staple that pairs with almost anything.', price: 45, lifespan_months: 24, image_url: 'https://res.cloudinary.com/dyjfdwah7/image/upload/v1776438274/Jeans_vwbfkh.jpg', sort_order: 11, is_active: true },
  { id: 'bottom-shorts', name: 'Shorts', category: 'bottoms', description: 'Warm-weather basics for comfort and casual days.', price: 24, lifespan_months: 18, image_url: 'https://res.cloudinary.com/dyjfdwah7/image/upload/v1776438276/Shorts_mgell6.jpg', sort_order: 12, is_active: true },
  { id: 'bottom-leggings', name: 'Leggings', category: 'bottoms', description: 'Flexible and comfortable for active or relaxed days.', price: 25, lifespan_months: 12, image_url: 'https://res.cloudinary.com/dyjfdwah7/image/upload/v1776440594/Screenshot_2026-04-17_104259_gat0x4.png', sort_order: 13, is_active: true },
  { id: 'bottom-joggers', name: 'Joggers', category: 'bottoms', description: 'A sporty option for everyday wear and lounging.', price: 32, lifespan_months: 18, image_url: 'https://res.cloudinary.com/dyjfdwah7/image/upload/v1776438275/Joggers_m68lde.jpg', sort_order: 14, is_active: true },
  { id: 'bottom-dress-pants', name: 'Dress Pants', category: 'bottoms', description: 'Useful for formal settings or polished looks.', price: 48, lifespan_months: 24, image_url: 'https://res.cloudinary.com/dyjfdwah7/image/upload/v1776438274/Dress_Pants_kgeomk.jpg', sort_order: 15, is_active: true },
  { id: 'bottom-skirt', name: 'Skirt', category: 'bottoms', description: 'A versatile option that can feel casual or dressed up.', price: 30, lifespan_months: 18, image_url: 'https://res.cloudinary.com/dyjfdwah7/image/upload/v1776438275/Skirts_cgvsyq.jpg', sort_order: 16, is_active: true },

  { id: 'dress-casual', name: 'Casual Dress', category: 'dresses', description: 'An easy one-piece outfit for warm days and everyday plans.', price: 38, lifespan_months: 18, image_url: 'https://res.cloudinary.com/dyjfdwah7/image/upload/v1776438304/Casual_Dress_d0hbxj.jpg', sort_order: 21, is_active: true },
  { id: 'dress-formal', name: 'Formal Dress', category: 'dresses', description: 'A special-occasion piece for dances, banquets, or events.', price: 95, lifespan_months: 36, image_url: 'https://res.cloudinary.com/dyjfdwah7/image/upload/v1776438304/Formal_Dress_i2sbbf.jpg', sort_order: 22, is_active: true },
  { id: 'dress-jumpsuit', name: 'Jumpsuit', category: 'dresses', description: 'A one-piece look that feels stylish and put together.', price: 58, lifespan_months: 24, image_url: 'https://res.cloudinary.com/dyjfdwah7/image/upload/v1776438304/Jumpsuit_bin0jr.jpg', sort_order: 23, is_active: true },
  { id: 'dress-romper', name: 'Romper', category: 'dresses', description: 'A playful all-in-one option for casual plans and warm weather.', price: 34, lifespan_months: 18, image_url: 'https://res.cloudinary.com/dyjfdwah7/image/upload/v1776438307/Romper_j4ar6w.jpg', sort_order: 24, is_active: true },

  { id: 'pro-blazer', name: 'Blazer', category: 'professional', description: 'A polished layer for interviews and professional events.', price: 68, lifespan_months: 36, image_url: 'https://res.cloudinary.com/dyjfdwah7/image/upload/v1776438298/Blazer_oocszi.jpg', sort_order: 31, is_active: true },
  { id: 'pro-work-blouse', name: 'Work Blouse', category: 'professional', description: 'A clean top that works well in formal settings.', price: 34, lifespan_months: 24, image_url: 'https://res.cloudinary.com/dyjfdwah7/image/upload/v1776438300/Work_Blouse_jvvowh.jpg', sort_order: 32, is_active: true },
  { id: 'pro-dress-shirt', name: 'Dress Shirt', category: 'professional', description: 'A classic professional basic for interviews and presentations.', price: 36, lifespan_months: 24, image_url: 'https://res.cloudinary.com/dyjfdwah7/image/upload/v1776438299/Dress_Shirt_zj7bgz.jpg', sort_order: 33, is_active: true },
  { id: 'pro-slacks', name: 'Slacks', category: 'professional', description: 'Professional bottoms that help an outfit feel work-ready.', price: 46, lifespan_months: 24, image_url: 'https://res.cloudinary.com/dyjfdwah7/image/upload/v1776438301/Slacks_trge3z.jpg', sort_order: 34, is_active: true },
  { id: 'pro-pencil-skirt', name: 'Pencil Skirt', category: 'professional', description: 'A polished option for business-casual or formal wardrobes.', price: 40, lifespan_months: 24, image_url: 'https://res.cloudinary.com/dyjfdwah7/image/upload/v1776438299/Pencil_Skirt_bghfby.jpg', sort_order: 35, is_active: true },
  { id: 'pro-shoes', name: 'Professional Shoes', category: 'professional', description: 'Footwear that looks polished for work or formal events.', price: 72, lifespan_months: 30, image_url: 'https://res.cloudinary.com/dyjfdwah7/image/upload/v1776438300/Professional_Shoes_uvtqin.jpg', sort_order: 36, is_active: true },

  { id: 'shoe-sneakers', name: 'Sneakers', category: 'shoes', description: 'Everyday shoes for school, errands, and daily wear.', price: 60, lifespan_months: 18, image_url: 'https://res.cloudinary.com/dyjfdwah7/image/upload/v1776438309/Sneakers_scgtrc.jpg', sort_order: 41, is_active: true },
  { id: 'shoe-running', name: 'Running Shoes', category: 'shoes', description: 'Built for exercise, sports, and lots of movement.', price: 85, lifespan_months: 12, image_url: 'https://res.cloudinary.com/dyjfdwah7/image/upload/v1776438307/Running_Shoes_slwuom.jpg', sort_order: 42, is_active: true },
  { id: 'shoe-sandals', name: 'Sandals', category: 'shoes', description: 'A lighter warm-weather option for casual wear.', price: 28, lifespan_months: 12, image_url: 'https://res.cloudinary.com/dyjfdwah7/image/upload/v1776438307/Sandals_dbwemu.jpg', sort_order: 43, is_active: true },
  { id: 'shoe-boots', name: 'Boots', category: 'shoes', description: 'Useful for cooler weather and certain personal styles.', price: 78, lifespan_months: 24, image_url: 'https://res.cloudinary.com/dyjfdwah7/image/upload/v1776438304/Boots_f5vg98.jpg', sort_order: 44, is_active: true },
  { id: 'shoe-heels', name: 'Heels', category: 'shoes', description: 'A dressier option for formal outfits and events.', price: 55, lifespan_months: 24, image_url: 'https://res.cloudinary.com/dyjfdwah7/image/upload/v1776438304/Heels_ofpth1.jpg', sort_order: 45, is_active: true },
  { id: 'shoe-flats', name: 'Flats', category: 'shoes', description: 'A simple polished shoe that is easier on your feet than heels.', price: 36, lifespan_months: 18, image_url: 'https://res.cloudinary.com/dyjfdwah7/image/upload/v1776438308/Flats_hxb2yi.jpg', sort_order: 46, is_active: true },
  { id: 'shoe-dress', name: 'Dress Shoes', category: 'shoes', description: 'A more formal shoe for professional or special occasions.', price: 70, lifespan_months: 30, image_url: 'https://res.cloudinary.com/dyjfdwah7/image/upload/v1776438303/Dress_Shoes_xpdeiu.jpg', sort_order: 47, is_active: true },

  { id: 'acc-backpack', name: 'Backpack', category: 'accessories', description: 'A practical everyday carry item for school or commuting.', price: 42, lifespan_months: 24, image_url: 'https://res.cloudinary.com/dyjfdwah7/image/upload/v1776438272/Backpack_lhdpd6.jpg', sort_order: 51, is_active: true },
  { id: 'acc-bag', name: 'Purse / Bag', category: 'accessories', description: 'An everyday accessory for carrying essentials.', price: 48, lifespan_months: 24, image_url: 'https://res.cloudinary.com/dyjfdwah7/image/upload/v1776438273/Purse_Bag_ddk4sc.jpg', sort_order: 52, is_active: true },
  { id: 'acc-belt', name: 'Belt', category: 'accessories', description: 'A small item that can be practical and finish an outfit.', price: 20, lifespan_months: 24, image_url: 'https://res.cloudinary.com/dyjfdwah7/image/upload/v1776438272/Belt_yy9z8p.jpg', sort_order: 53, is_active: true },
  { id: 'acc-hat', name: 'Hat', category: 'accessories', description: 'Useful for style, weather, and sun protection.', price: 22, lifespan_months: 18, image_url: 'https://res.cloudinary.com/dyjfdwah7/image/upload/v1776438273/Hat_qkfc0k.jpg', sort_order: 54, is_active: true },
  { id: 'acc-jewelry', name: 'Jewelry', category: 'accessories', description: 'Small accessories that make outfits feel more personal.', price: 30, lifespan_months: 36, image_url: 'https://res.cloudinary.com/dyjfdwah7/image/upload/v1776438275/Jewelry_uwcmjw.jpg', sort_order: 55, is_active: true },
  { id: 'acc-watch', name: 'Watch', category: 'accessories', description: 'An accessory that can be practical and stylish.', price: 65, lifespan_months: 36, image_url: 'https://res.cloudinary.com/dyjfdwah7/image/upload/v1776438274/Watch_cimvss.jpg', sort_order: 56, is_active: true },
  { id: 'acc-hair', name: 'Hair Accessories', category: 'accessories', description: 'Small extras like clips, ties, or headbands.', price: 12, lifespan_months: 12, image_url: 'https://res.cloudinary.com/dyjfdwah7/image/upload/v1776438272/Hair_Accessories_walmuy.jpg', sort_order: 57, is_active: true },
  { id: 'acc-sunglasses', name: 'Sunglasses', category: 'accessories', description: 'Useful for sunny days and a polished everyday look.', price: 26, lifespan_months: 18, image_url: 'https://res.cloudinary.com/dyjfdwah7/image/upload/v1776438273/Sunglasses_ybx5h7.jpg', sort_order: 58, is_active: true },
];

export const CLOTHING_OPTIONS: Option[] = CLOTHING_GAME_ITEMS.map((item) => ({
  id: item.id,
  name: item.name,
  category: item.category,
  description: item.description,
  monthlyCost: Number((item.price / item.lifespan_months).toFixed(2)),
  image: item.image_url,
}));
