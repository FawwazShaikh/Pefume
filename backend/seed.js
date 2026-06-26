import { prisma } from './lib/prisma.js';
import dotenv from 'dotenv';

dotenv.config();


const collectionsData = [
  {
    id: 'baccarat-rouge-540',
    name: 'Baccarat Rouge 540 Extrait de Parfum',
    brand: 'Maison Francis Kurkdjian',
    description: 'Baccarat Rouge 540 Extrait de Parfum is a luxurious, intense, and instantly recognizable fragrance that blends saffron warmth, bitter almond, radiant florals, and rich amber woods. It opens with a glowing spicy sweetness, evolves into a smooth floral-woody heart, and settles into a deep musky-amber dry-down that lasts for hours.\n\nThis extrait version feels richer, denser, and more sensual than the original, delivering a bold yet elegant aura that leaves a memorable trail wherever you go.',
    price: 1500,
    category: 'decants',
    image: '/decant_images/baccarat_rouge_540_1.jpeg',
    images: ['/decant_images/baccarat_rouge_540_1.jpeg', '/decant_images/baccarat_rouge_540_2.jpeg', '/decant_images/baccarat_rouge_540_3.jpeg'],
    featured: true,
    sizes: [
      { size: '2ml Decant', price: 1500 },
      { size: '5ml Decant', price: 3200 },
      { size: '10ml Decant', price: 5800 },
      { size: '20ml Decant', price: 10500 },
      { size: '30ml Decant', price: 14800 }
    ]
  },
  {
    id: 'azzaro-the-most-wanted',
    name: 'The Most Wanted Eau de Parfum',
    brand: 'Azzaro',
    description: 'Azzaro The Most Wanted is an intense fragrance for men, designed to release your energy and inspire you to live life to the fullest. Combining notes of fresh cardamom, warm toffee, and mysterious amberwood, this scent leaves a powerful, seductive trail that is impossible to ignore.',
    price: 350,
    category: 'decants',
    image: '/decant_images/azzaro_the_most_wanted_1.jpeg',
    images: ['/decant_images/azzaro_the_most_wanted_1.jpeg', '/decant_images/azzaro_the_most_wanted_2.jpeg', '/decant_images/azzaro_the_most_wanted_3.jpeg', '/decant_images/azzaro_the_most_wanted_4.jpeg'],
    featured: true,
    sizes: [
      { size: '2ml Decant', price: 350 },
      { size: '5ml Decant', price: 790 },
      { size: '10ml Decant', price: 1450 },
      { size: '20ml Decant', price: 2700 },
      { size: '30ml Decant', price: 3900 }
    ]
  },
  {
    id: 'spicebomb-extreme',
    name: 'Spicebomb Extreme',
    brand: 'Viktor & Rolf',
    description: 'Spicebomb Extreme is a highly addictive and explosive fragrance. It opens with piquant notes of pimento and black pepper, before revealing a sweet, warm heart of cinnamon and cumin. The dry-down features rich tobacco and bourbon vanilla, leaving a warm, long-lasting presence on the skin.',
    price: 450,
    category: 'decants',
    image: '/decant_images/spicebomb_extreme_1.jpeg',
    images: ['/decant_images/spicebomb_extreme_1.jpeg', '/decant_images/spicebomb_extreme_2.jpeg', '/decant_images/spicebomb_extreme_3.jpeg'],
    featured: false,
    sizes: [
      { size: '2ml Decant', price: 450 },
      { size: '5ml Decant', price: 990 },
      { size: '10ml Decant', price: 1850 },
      { size: '20ml Decant', price: 3400 },
      { size: '30ml Decant', price: 4900 }
    ]
  },
  {
    id: 'lattafa-yara-for-women',
    name: 'Yara Eau de Parfum',
    brand: 'Lattafa',
    description: 'Yara by Lattafa Perfumes is an exceptionally creamy, sweet, and comforting fragrance for women. It blends tropical fruits, gourmand notes, and warm vanilla with soft orchid blooms. It feels like a luxurious sweet treat, projecting a soft yet highly addictive aura.',
    price: 249,
    category: 'decants',
    image: '/decant_images/YARA_720x.webp',
    images: [
      '/decant_images/YARA_720x.webp',
      '/decant_images/YARA_1_720x.webp'
    ],
    featured: true,
    sizes: [
      { size: '5ml Decant', price: 249 },
      { size: '10ml Decant', price: 499 },
      { size: '20ml Decant', price: 999 },
      { size: '30ml Decant', price: 1499 }
    ]
  },
  {
    id: 'lattafa-khamrah',
    name: 'Khamrah Eau de Parfum',
    brand: 'Lattafa',
    description: 'Lattafa Khamrah is a warm, oriental, and boozy masterpiece. It opens with spices and fresh bergamot, leading to a luscious heart of dates and praline. In this edition, a splash of coffee note is infused, giving the fragrance a rich, roasted complexity that lasts all day.',
    price: 249,
    category: 'decants',
    image: '/decant_images/Lattafa_Khamrah_Eau_de_Parfum_720x.webp',
    images: [
      '/decant_images/Lattafa_Khamrah_Eau_de_Parfum_720x.webp',
      '/decant_images/khamrah_shopify_720x.webp',
      '/decant_images/Generated_Image_October_02_2025_-_3_05PM_2026-01-12_08_44_04_920498_png_720x.webp'
    ],
    featured: false,
    sizes: [
      { size: '5ml Decant', price: 249 },
      { size: '10ml Decant', price: 499 },
      { size: '20ml Decant', price: 999 },
      { size: '30ml Decant', price: 1499 }
    ]
  },
  {
    id: 'valentino-born-in-roma',
    name: 'Born In Roma Uomo Intense',
    brand: 'Valentino',
    description: 'Valentino Born In Roma Uomo Intense is a tribute to the eternal city, showcasing a bold, studded presence. It features fresh ginger, aromatic sage, and lavender, dried down into a smoky, dark vetiver and sweet vanilla base.',
    price: 450,
    category: 'decants',
    image: '/decant_images/valentino_born_in_roma_1.jpeg',
    images: ['/decant_images/valentino_born_in_roma_1.jpeg', '/decant_images/valentino_born_in_roma_2.jpeg', '/decant_images/valentino_born_in_roma_3.jpeg'],
    featured: true,
    sizes: [
      { size: '2ml Decant', price: 450 },
      { size: '5ml Decant', price: 950 },
      { size: '10ml Decant', price: 1800 },
      { size: '20ml Decant', price: 3200 },
      { size: '30ml Decant', price: 4500 }
    ]
  },
  {
    id: 'valentino-born-in-roma-set',
    name: 'Born In Roma Trio Discovery Set',
    brand: 'Valentino',
    description: 'The Valentino Born In Roma Trio Discovery Set features three 5ml decants of the legendary line: Born in Roma (Classic/Woody), Coral Fantasy (Fresh/Fruity), and Yellow Dream (Sweet/Gingerbread). Explore the full spectrum of Italian high-fashion perfumery.',
    price: 2900,
    category: 'sets',
    image: '/decant_images/valentino_born_in_roma_set_1.jpeg',
    images: ['/decant_images/valentino_born_in_roma_set_1.jpeg', '/decant_images/valentino_born_in_roma_1.jpeg', '/decant_images/valentino_born_in_roma_2.jpeg', '/decant_images/valentino_born_in_roma_3.jpeg'],
    featured: true,
    sizes: [
      { size: '3x 5ml Discovery Set', price: 2900 }
    ]
  },
  {
    id: 'rasasi-hawas',
    name: 'Hawas for Him',
    brand: 'Rasasi',
    description: 'Rasasi Hawas blends fresh apple, bergamot, and sweet cinnamon with clean marine notes, melon, and rich ambergris. It represents strength, vigor, and energetic freshness, making it one of the absolute best summer fragrances.',
    price: 250,
    category: 'decants',
    image: '/decant_images/rasasi_hawas_1.jpeg',
    images: ['/decant_images/rasasi_hawas_1.jpeg', '/decant_images/rasasi_hawas_2.jpeg', '/decant_images/rasasi_hawas_3.jpeg', '/decant_images/rasasi_hawas_4.jpeg'],
    featured: false,
    sizes: [
      { size: '2ml Decant', price: 250 },
      { size: '5ml Decant', price: 550 },
      { size: '10ml Decant', price: 990 },
      { size: '20ml Decant', price: 1850 },
      { size: '30ml Decant', price: 2600 }
    ]
  },
  {
    id: 'afnan-9pm',
    name: '9PM Eau de Parfum',
    brand: 'Afnan',
    description: 'Afnan 9PM is one of the most popular party fragrances in the world, loved for its sweet vanilla, juicy apple, and warm cinnamon combination. It opens with a playful burst of fruity freshness before developing into a rich vanilla-tonka heart that feels youthful, energetic, and incredibly attractive.\n\nAs it dries down, amber and patchouli create a warm masculine trail with outstanding projection and longevity. Perfect for parties, date nights, clubbing, winter evenings, and anyone looking for a fragrance that gets noticed and earns compliments.',
    price: 249,
    category: 'decants',
    image: '/decant_images/9PM_1_720x.webp',
    images: [
      '/decant_images/9PM_1_720x.webp',
      '/decant_images/9pm.3_720x.webp',
      '/decant_images/Afnan_9PM_Eau_de_Parfum_720x.webp',
      '/decant_images/Generated_Image_February_03_2026_-_6_34PM_2026-02-03_13_06_32_437616_png_720x.webp'
    ],
    featured: false,
    sizes: [
      { size: '5ml Decant', price: 249 },
      { size: '10ml Decant', price: 549 },
      { size: '20ml Decant', price: 1098 },
      { size: '30ml Decant', price: 1649 }
    ]
  },
  {
    id: 'afnan-9am',
    name: '9 AM Eau de Parfum',
    brand: 'Afnan',
    description: '9 AM by Afnan is a fresh, bright morning fragrance that wakes you up. Juicy mandarin, lemon citron, and pink pepper blend with aromatic lavender and green apple, drying down into smooth cedarwood and warm musk. A perfect clean daily driver.',
    price: 180,
    category: 'decants',
    image: '/decant_images/afnan_9am_1.jpeg',
    images: ['/decant_images/afnan_9am_1.jpeg', '/decant_images/afnan_9am_2.jpeg', '/decant_images/afnan_9am_3.jpeg'],
    featured: false,
    sizes: [
      { size: '2ml Decant', price: 180 },
      { size: '5ml Decant', price: 390 },
      { size: '10ml Decant', price: 690 },
      { size: '20ml Decant', price: 1200 },
      { size: '30ml Decant', price: 1700 }
    ]
  },
  {
    id: 'afnan-supremacy',
    name: 'Supremacy Not Only Intense',
    brand: 'Afnan',
    description: 'Afnan Supremacy Not Only Intense is a rich, fruity-smoky formulation built for maximum projection. It features blackcurrant, pineapple-like apple freshness, aromatic lavender, oakmoss, and ambergris. A bold signature statement.',
    price: 3900,
    category: 'fullbottles',
    image: '/decant_images/afnan_supremacy_1.jpeg',
    images: ['/decant_images/afnan_supremacy_1.jpeg', '/decant_images/afnan_supremacy_2.jpeg'],
    featured: false,
    sizes: [
      { size: '100ml Retail Bottle', price: 3900 }
    ]
  },
  {
    id: 'afnan-supremacy-collectors-edition',
    name: 'Supremacy Collector’s Edition Eau de Parfum',
    brand: 'Afnan',
    description: 'Supremacy Collector’s Edition is a luxurious masculine fragrance that combines juicy pineapple, crisp bergamot, smoky birch, and rich ambergris into a scent that feels powerful, refined, and unforgettable. Inspired by modern luxury perfumery, it delivers an exceptional balance of freshness, depth, and sophistication.\n\nThe fragrance opens with vibrant pineapple, bergamot, apple, and white floral notes before transitioning into a smooth heart of orange blossom, birch, and amber. As it dries down, oakmoss, musk, and ambergris create an elegant and long-lasting trail that feels expensive and effortlessly confident. Perfect for office wear, special occasions, dates, and everyday luxury.',
    price: 349,
    category: 'decants',
    image: '/decant_images/afnan_supremacy_collectors_edition_1.jpeg',
    images: ['/decant_images/afnan_supremacy_collectors_edition_1.jpeg', '/decant_images/afnan_supremacy_collectors_edition_2.jpeg', '/decant_images/afnan_supremacy_collectors_edition_3.jpeg', '/decant_images/afnan_supremacy_collectors_edition_4.jpeg'],
    featured: true,
    sizes: [
      { size: '5ml Decant', price: 349 },
      { size: '10ml Decant', price: 699 },
{ size: '20ml Decant', price: 1399 },
      { size: '30ml Decant', price: 2099 }
    ]
  },
  {
    id: 'bleu-de-chanel-edp',
    name: 'Bleu de Chanel Eau de Parfum',
    brand: 'Chanel',
    description: 'Bleu de Chanel Eau de Parfum is an aromatic-woody fragrance that unites the invigorating freshness of citrus with the woody whisper of dry cedar. Sandalwood from New Caledonia lends it a warm, sensual, and highly sophisticated trail.',
    price: 729,
    category: 'decants',
    image: '/decant_images/bleu_de_chanel_main.jpg',
    images: [
      '/decant_images/bleu_de_chanel_main.jpg',
      '/decant_images/bleu_de_chanel_1.jpeg',
      '/decant_images/bleu_de_chanel_2.jpeg',
      '/decant_images/bleu_de_chanel_3.jpeg'
    ],
    featured: false,
    sizes: [
      { size: '5ml Decant', price: 729 },
      { size: '10ml Decant', price: 1449 },
      { size: '20ml Decant', price: 2899 },
      { size: '30ml Decant', price: 4299 }
    ]
  },
  {
    id: 'jpg-le-beau-paradise-garden',
    name: 'Le Beau Paradise Garden Eau de Parfum',
    brand: 'Jean Paul Gaultier',
    description: 'Le Beau Paradise Garden is a tropical escape bottled into a fragrance. Fresh coconut water, juicy fig, and salty aquatic accords create an irresistible vacation vibe that feels both refreshing and seductive.\n\nThe fragrance opens with vibrant green notes, mint, ginger, and watery accords before revealing a creamy coconut and fig heart. As it settles, smooth sandalwood and tonka bean create a warm, addictive trail that performs exceptionally well in hot weather.\n\nPerfect for summer days, beach vacations, date nights, and anyone who wants to smell unique, youthful, and effortlessly attractive.',
    price: 899,
    category: 'decants',
    image: '/decant_images/Jean_Paul_Gaultier_Le_Beau_Paradise_Garden_Eau_de_Parfum_for_Men_1_720x_2.webp',
    images: [
      '/decant_images/Jean_Paul_Gaultier_Le_Beau_Paradise_Garden_Eau_de_Parfum_for_Men_1_720x_2.webp',
      '/decant_images/Jean_Paul_Gaultier_Le_Beau_Paradise_Garden_Eau_de_Parfum_for_Men_2_720x_3.webp',
      '/decant_images/Jean_Paul_Gaultier_Le_Beau_Paradise_Garden_Eau_de_Parfum_for_Men_4.webp',
      '/decant_images/Jean_Paul_Gaultier_Le_Beau_Paradise_Garden_Eau_de_Parfum_for_Men_6_720x_1.png'
    ],
    featured: true,
    sizes: [
      { size: '5ml Decant', price: 899 },
      { size: '10ml Decant', price: 1599 },
      { size: '20ml Decant', price: 2899 },
      { size: '30ml Decant', price: 3999 }
    ]
  },
  {
    id: 'jpg-le-male-elixir',
    name: 'Le Male Elixir Parfum',
    brand: 'Jean Paul Gaultier',
    description: 'Le Male Elixir by Jean Paul Gaultier is an intensely addictive fragrance for men. Opening with a fresh burst of lavender and mint, it quickly melts into a rich, sweet heart of vanilla and benzoin. The deep, warm base features notes of honey, tobacco, and tonka bean, creating a powerful scent profile that projects beautifully and lasts all night long. A truly irresistible and seductive masterpiece.',
    price: 649,
    category: 'decants',
    image: '/decant_images/Jean_Paul_Gaultier_Le_Male_Elixir_for_Men_720x.webp',
    images: [
      '/decant_images/Jean_Paul_Gaultier_Le_Male_Elixir_for_Men_720x.webp',
      '/decant_images/Jean_Paul_Gaultier_Le_Male_Elixir_for_Men_2_720x.webp',
      '/decant_images/Jean_Paul_Gaultier_Le_Male_Elixir_for_Men_3_720x.webp',
      '/decant_images/Jean_Paul_Gaultier_Le_Male_Elixir_for_Men_4_720x.webp'
    ],
    featured: false,
    sizes: [
      { size: '5ml Decant', price: 649 },
      { size: '10ml Decant', price: 1299 },
      { size: '20ml Decant', price: 2449 },
      { size: '30ml Decant', price: 3599 }
    ]
  },
  {
    id: 'azzaro-the-most-wanted-edp-intense',
    name: 'The Most Wanted Eau de Parfum Intense',
    brand: 'Azzaro',
    description: 'Azzaro The Most Wanted Eau de Parfum Intense is an extremely addictive scent that captures the essence of a charming, daring man. It blends vibrant cardamom, sweet toffee, and masculine bourbon vanilla to create a powerful and irresistible aura. Perfect for evening wear and making a bold statement.',
    price: 599,
    category: 'decants',
    image: '/decant_images/MostWantedParfum_720x.webp',
    images: [
      '/decant_images/MostWantedParfum_720x.webp',
      '/decant_images/MostWantedParfum_1_720x.webp',
      '/decant_images/Snapinsta.app_281559856_399392868864875_963988315958089809_n_1024_720x.webp',
      '/decant_images/Snapinsta.app_284879885_412350280743323_1747758129351452572_n_1024_720x.webp'
    ],
    featured: false,
    sizes: [
      { size: '5ml Decant', price: 599 },
      { size: '10ml Decant', price: 1199 },
      { size: '20ml Decant', price: 1899 },
      { size: '30ml Decant', price: 2899 }
    ]
  },
  {
    id: 'rasasi-hawas-ice',
    name: 'Hawas Ice Eau de Parfum',
    brand: 'Rasasi',
    description: 'Hawas Ice is a modern fresh fragrance that combines juicy fruits, icy freshness, and smooth musky woods into an incredibly addictive scent. It opens with a vibrant burst of apple, bergamot, lemon, and star anise, creating an energetic and refreshing first impression.\n\nAs the fragrance develops, sweet plum, orange blossom, and cardamom add depth and character before settling into a powerful base of musk, amber, driftwood, and moss. Fresh, youthful, and versatile, Hawas Ice is perfect for daily wear, gym sessions, vacations, parties, and summer evenings. One of the biggest compliment-getters in its category, it delivers excellent performance while maintaining a clean and attractive profile.',
    price: 399,
    category: 'decants',
    image: '/decant_images/ice1_720x.webp',
    images: [
      '/decant_images/ice1_720x.webp',
      '/decant_images/Generated_Image_November_26_2025_-_2_59PM_1__2026-04-28_11_20_11.430471_720x.webp'
    ],
    featured: false,
    sizes: [
      { size: '5ml Decant', price: 399 },
      { size: '10ml Decant', price: 599 },
      { size: '20ml Decant', price: 1199 },
      { size: '30ml Decant', price: 1899 }
    ]
  },
  {
    id: 'afnan-9pm-night-out',
    name: '9PM Night Out Extrait de Parfum',
    brand: 'Afnan',
    description: '9PM Night Out is a bold and modern fragrance crafted for unforgettable evenings. Juicy dragon fruit, crisp apple, bergamot, and smooth cognac create an attention-grabbing opening that feels vibrant, luxurious, and unique.\n\nAs the fragrance develops, rich toffee, spicy cardamom, suede, and cedarwood add depth and sophistication before settling into a warm base of tonka bean, patchouli, ambrofix, and akigalawood. More refined and mature than the original 9PM, Night Out is perfect for parties, dates, special occasions, and nights when you want to stand out from the crowd.',
    price: 299,
    category: 'decants',
    image: '/decant_images/WhatsApp Image 2026-06-26 at 6.25.50 PM.jpeg',
    images: [
      '/decant_images/WhatsApp Image 2026-06-26 at 6.25.50 PM.jpeg',
      '/decant_images/WhatsApp Image 2026-06-26 at 6.25.51 PM.jpeg',
      '/decant_images/afnan_9pm_night_out_3.jpg'
    ],
    featured: false,
    sizes: [
      { size: '5ml Decant', price: 299 },
      { size: '10ml Decant', price: 599 },
      { size: '20ml Decant', price: 1199 },
      { size: '30ml Decant', price: 1799 }
    ]
  },
  {
    id: 'armani-stronger-with-you-intensely',
    name: 'Stronger With You Intensely Eau de Parfum',
    brand: 'Giorgio Armani',
    description: 'Stronger With You Intensely is an addictive oriental woody fragrance featuring notes of pink pepper, vanilla, and an ambery wood accord. It reveals a bolder, more intense personality with its warm toffee and cinnamon notes, creating an ultra-seductive and powerful trail perfect for the modern, confident man.',
    price: 599,
    category: 'decants',
    image: '/decant_images/stronger_with_you_intensely_1.jpeg',
    images: [
      '/decant_images/stronger_with_you_intensely_1.jpeg',
      '/decant_images/stronger_with_you_intensely_2.jpeg',
      '/decant_images/stronger_with_you_intensely_3.jpeg'
    ],
    featured: false,
    sizes: [
      { size: '5ml Decant', price: 599 },
      { size: '10ml Decant', price: 1199 },
      { size: '20ml Decant', price: 1899 },
      { size: '30ml Decant', price: 2899 }
    ]
  },
  {
    id: 'lattafa-khamrah-qahwa',
    name: 'Khamrah Qahwa Eau de Parfum',
    brand: 'Lattafa',
    description: 'Khamrah Qahwa is an intoxicating evolution of the original Khamrah, introducing a rich, roasted coffee accord that perfectly balances the sweetness of vanilla and praline. It opens with a spicy blend of ginger, cinnamon, and cardamom before settling into a deeply addictive and warming base of Arabica coffee and tonka bean. An exceptional gourmand experience.',
    price: 299,
    category: 'decants',
    image: '/decant_images/khmarah_waha_720x.webp',
    images: [
      '/decant_images/khmarah_waha_720x.webp',
      '/decant_images/httpsafnan.comcdnshopfiles9PM_ELIXIR-1.pngv_1753259405_width_2000-107_720x.webp'
    ],
    featured: false,
    sizes: [
      { size: '5ml Decant', price: 299 },
      { size: '10ml Decant', price: 599 },
      { size: '20ml Decant', price: 1199 },
      { size: '30ml Decant', price: 1799 }
    ]
  },
  {
    id: 'french-avenue-liquid-brun',
    name: 'Liquid Brun Eau de Parfum',
    brand: 'French Avenue',
    description: 'Liquid Brun is a rich and luxurious fragrance that blends warm spices, creamy bourbon vanilla, and sweet praline into an incredibly addictive scent. From the first spray, cinnamon, cardamom, and orange blossom create a sophisticated opening that feels both elegant and inviting.\n\nAs the fragrance develops, smooth bourbon vanilla and elemi resin add depth and warmth before settling into a delicious base of praline, ambroxan, guaiac wood, and musk. Sweet, comforting, and incredibly attractive, Liquid Brun is perfect for date nights, winter evenings, special occasions, and anyone who loves warm vanilla fragrances with premium niche-quality character.',
    price: 249,
    category: 'decants',
    image: '/decant_images/Liquid_brun_1.webp',
    images: [
      '/decant_images/Liquid_brun_1.webp',
      '/decant_images/Liquid_brun_2.webp',
      '/decant_images/Liquid_brun_3.webp',
      '/decant_images/Snapinst.app_474514409_122158234826304232_8695489195675231830_n_1080_720x.webp'
    ],
    featured: false,
    sizes: [
      { size: '5ml Decant', price: 249 },
      { size: '10ml Decant', price: 499 },
      { size: '20ml Decant', price: 999 },
      { size: '30ml Decant', price: 1599 }
    ]
  },
  {
    id: 'dior-sauvage-edp',
    name: 'Sauvage Eau de Parfum',
    brand: 'Dior',
    description: 'Dior Sauvage Eau de Parfum is an intensely fresh and powerful composition that has become a modern icon. It opens with the juicy, spicy freshness of Calabrian bergamot and Sichuan pepper, before revealing a sensual and mysterious heart. The exceptionally addictive trail of ambroxan and sweet Papua New Guinean vanilla creates a masterful balance of raw masculinity and refined elegance.',
    price: 749,
    category: 'decants',
    image: '/decant_images/SauvageEDP_720x.webp',
    images: [
      '/decant_images/SauvageEDP_720x.webp',
      '/decant_images/SauvageEDP_1_720x.webp',
      '/decant_images/Untitleddesign-17_720x.webp'
    ],
    featured: false,
    sizes: [
      { size: '5ml Decant', price: 749 },
      { size: '10ml Decant', price: 1499 },
      { size: '20ml Decant', price: 2999 },
      { size: '30ml Decant', price: 4499 }
    ]
  },
  {
    id: 'lattafa-eclaire',
    name: 'Éclaire Eau de Parfum',
    brand: 'Lattafa',
    description: 'Lattafa Éclaire is a deliciously sweet and creamy floral gourmand fragrance that perfectly captures the essence of a luxurious dessert. It opens with an incredibly rich and mouth-watering blend of caramel, milk, and sugar, instantly wrapping you in comfort. The heart reveals soft white flowers dipped in honey, before drying down into an addictive base of warm vanilla, praline, and musk. It is the ultimate sweet treat for anyone who loves delectable gourmand scents.',
    price: 249,
    category: 'decants',
    image: '/decant_images/perfume-31_720x.webp',
    images: [
      '/decant_images/perfume-31_720x.webp',
      '/decant_images/perfume-32_720x.webp'
    ],
    featured: false,
    sizes: [
      { size: '5ml Decant', price: 249 },
      { size: '10ml Decant', price: 499 },
      { size: '20ml Decant', price: 999 },
      { size: '30ml Decant', price: 1499 }
    ]
  },
  {
    id: 'club-de-nuit-intense-man-pure-parfum',
    name: 'Club De Nuit Intense Man Pure Parfum',
    brand: 'Armaf',
    description: 'Club De Nuit Intense Man Pure Parfum by Armaf is a legendary, bold, and smoky fragrance. It opens with an iconic burst of fresh lemon, pineapple, and black currant. As it develops, a sophisticated heart of birch, jasmine, and rose takes over, drying down into a powerful and long-lasting base of ambergris, musk, patchouli, and vanilla. It is a true masterpiece of modern perfumery.',
    price: 299,
    category: 'decants',
    image: '/decant_images/club_de_nuit_main_720x.webp',
    images: [
      '/decant_images/club_de_nuit_main_720x.webp',
      '/decant_images/CDNIM150_1_720x.webp'
    ],
    featured: false,
    sizes: [
      { size: '5ml Decant', price: 299 },
      { size: '10ml Decant', price: 599 },
      { size: '20ml Decant', price: 1199 },
      { size: '30ml Decant', price: 1799 }
    ]
  },
  {
    id: 'marj-ahmed-al-maghribi',
    name: 'Marj Eau de Parfum',
    brand: 'Ahmed Al Maghribi',
    description: 'Marj by Ahmed Al Maghribi is an opulent and luxurious fragrance that exudes elegance. It opens with a vibrant burst of red fruits and zesty citrus notes. As the scent unfolds, a rich and captivating heart of jasmine and elegant floral notes takes center stage. The fragrance finally settles into an incredibly long-lasting and sophisticated base of warm amber, smooth sandalwood, rich woods, and musk.',
    price: 449,
    category: 'decants',
    image: '/decant_images/perfume-171_720x.webp',
    images: [
      '/decant_images/perfume-171_720x.webp',
      '/decant_images/perfume-172_720x.webp',
      '/decant_images/Snapinsta.app_462270131_933880328768743_2963835360547879290_n_1080_720x.webp'
    ],
    featured: false,
    sizes: [
      { size: '5ml Decant', price: 449 },
      { size: '10ml Decant', price: 899 },
      { size: '20ml Decant', price: 1799 },
      { size: '30ml Decant', price: 2699 }
    ]
  },
  {
    id: 'kaaf-ahmed-al-maghribi',
    name: 'Kaaf Eau de Parfum',
    brand: 'Ahmed Al Maghribi',
    description: 'Kaaf by Ahmed Al Maghribi is an incredibly fresh, clean, and mass-appealing fragrance. It opens with an invigorating blast of bright citrus and cool aquatic notes. As it settles, a smooth heart of lavender and aromatic herbs gives it a classic, versatile feel. The dry down reveals a deeply satisfying and masculine base of musk, amber, and rich woods. Perfect for everyday wear, particularly in the summer, it offers fantastic longevity and a commanding sillage.',
    price: 449,
    category: 'decants',
    image: '/decant_images/kaaf_1_720x.webp',
    images: [
      '/decant_images/kaaf_1_720x.webp'
    ],
    featured: false,
    sizes: [
      { size: '5ml Decant', price: 449 },
      { size: '10ml Decant', price: 899 },
      { size: '20ml Decant', price: 1799 },
      { size: '30ml Decant', price: 2699 }
    ]
  },
  {
    id: 'rasasi-hawas-london',
    name: 'Hawas London Eau de Parfum',
    brand: 'Rasasi',
    description: 'Hawas London by Rasasi is an elegant, sophisticated, and unforgettable fragrance that perfectly balances warm woods with soft floral tones. The opening introduces a refined blend of pink pepper, sweet pear, and luxurious saffron. At its heart, a beautiful bouquet of rose and white flowers is wrapped in mystical frankincense. Finally, the scent settles into a gorgeous and long-lasting base of warm amber, musk, blonde woods, and smooth vanilla.',
    price: 299,
    category: 'decants',
    image: '/decant_images/httpsafnan.comcdnshopfiles9PM_ELIXIR-1.pngv_1753259405_width_2000-124_720x.webp',
    images: [
      '/decant_images/httpsafnan.comcdnshopfiles9PM_ELIXIR-1.pngv_1753259405_width_2000-124_720x.webp'
    ],
    featured: false,
    sizes: [
      { size: '5ml Decant', price: 299 },
      { size: '10ml Decant', price: 599 },
      { size: '20ml Decant', price: 1199 },
      { size: '30ml Decant', price: 1799 }
    ]
  },
  {
    id: 'naseem-asmira-for-women',
    name: 'Asmira Aqua Parfum',
    brand: 'Naseem',
    description: 'Asmira Aqua Parfum by Naseem is a soft, incredibly feminine, and heavenly beautiful gourmand floral fragrance. The scent opens with a juicy and inviting burst of cherry, bergamot, and a touch of saffron. In the heart, romantic tuberose and delicate white flowers blend seamlessly with warm ambery notes. The luxurious dry down leaves an unforgettable trail of creamy milk, cozy cashmere, vanilla, and musk.',
    price: 249,
    category: 'decants',
    image: '/decant_images/ASMIRA__story_1.webp',
    images: [
      '/decant_images/ASMIRA__story_1.webp',
      '/decant_images/ASMIRA_1_1.webp'
    ],
    featured: false,
    sizes: [
      { size: '5ml Decant', price: 249 },
      { size: '10ml Decant', price: 449 },
      { size: '20ml Decant', price: 899 },
      { size: '30ml Decant', price: 1399 }
    ]
  },
  {
    id: 'valentino-uomo-born-in-roma-coral-fantasy',
    name: 'Uomo Born In Roma Coral Fantasy EDT',
    brand: 'Valentino',
    description: 'Uomo Born In Roma Coral Fantasy EDT by Valentino is a modern, fruity, and extremely attractive fragrance inspired by the sunset of Rome. It opens with a bright and vibrant burst of red apple and Calabrian bergamot, enhanced by a touch of cardamom. The heart unfolds with aromatic clary sage, lavender, and geranium, while the base leaves a deeply masculine and magnetic trail of rich tobacco leaf, patchouli, and vetiver. Perfect for any occasion where you want to leave a lasting impression.',
    price: 649,
    category: 'decants',
    image: '/decant_images/coral_fantasy_1.jpeg',
    images: [
      '/decant_images/coral_fantasy_1.jpeg',
      '/decant_images/coral_fantasy_2.png',
      '/decant_images/coral_fantasy_3.png',
      '/decant_images/coral_fantasy_4.png'
    ],
    featured: false,
    sizes: [
      { size: '5ml Decant', price: 649 },
      { size: '10ml Decant', price: 1299 },
      { size: '20ml Decant', price: 2599 },
      { size: '30ml Decant', price: 3999 }
    ]
  },
  {
    id: 'tom-ford-ombre-leather-edp',
    name: 'Ombré Leather Eau de Parfum',
    brand: 'Tom Ford',
    description: 'Ombré Leather Eau de Parfum by Tom Ford is a dark, luxurious, and unapologetically bold fragrance. The scent opens with a warm, spicy hit of cardamom that instantly captivates the senses. The heart is an intensely tactile and rich blend of black leather wrapped tightly around sensual jasmine sambac. The powerful dry down of patchouli, white moss, and glowing amber leaves an exceptionally confident and sophisticated trail. Perfect for those who want a deeply alluring and long-lasting signature scent.',
    price: 699,
    category: 'decants',
    image: '/decant_images/ombre_leather_1.png',
    images: [
      '/decant_images/ombre_leather_1.png',
      '/decant_images/ombre_leather_2.png',
      '/decant_images/ombre_leather_3.png'
    ],
    featured: false,
    sizes: [
      { size: '5ml Decant', price: 699 },
      { size: '10ml Decant', price: 1399 },
      { size: '20ml Decant', price: 2799 },
      { size: '30ml Decant', price: 4199 }
    ]
  }
];

async function main() {
  console.log('Starting full database seed reset...');

  // 1. Clear existing database rows for clean alignment
  console.log('Cleaning existing product-related tables...');
  await prisma.cartItem.deleteMany();
  await prisma.inventoryLog.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.review.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  console.log('Tables cleared.');

  // 2. Ensure Categories exist
  console.log('Seeding categories...');
  const defaultCategories = [
    { name: 'Shop All', slug: 'shop-all' },
    { name: 'Decants', slug: 'decants' },
    { name: 'Full Bottles', slug: 'full-bottles' },
    { name: 'Sets', slug: 'sets' },
    { name: 'New Arrivals', slug: 'new-arrivals' },
    { name: 'Best Sellers', slug: 'best-sellers' },
    { name: 'Summer', slug: 'summer' },
    { name: 'Winter', slug: 'winter' },
    { name: 'For Him', slug: 'for-him' },
    { name: 'For Her', slug: 'for-her' },
    { name: 'Luxury', slug: 'luxury' }
  ];

  for (const cat of defaultCategories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: { name: cat.name, slug: cat.slug }
    });
  }
  console.log('Categories verified.');

  // Fetch categories to build a mapping dictionary
  const dbCategories = await prisma.category.findMany();
  const categoryMap = {};
  dbCategories.forEach(cat => {
    categoryMap[cat.slug] = cat.id;
  });

  // 3. Seed all 13 products with matching slugs, variants, and primary categories
  console.log(`Seeding ${collectionsData.length} products...`);
  for (const p of collectionsData) {
    // Determine category mapping based on collectionsData categories
    let targetCategorySlug = 'decants';
    if (p.category === 'fullbottles' || p.category === 'full-bottles') {
      targetCategorySlug = 'full-bottles';
    } else if (p.category === 'sets') {
      targetCategorySlug = 'sets';
    }

    const categoryId = categoryMap[targetCategorySlug];
    if (!categoryId) {
      throw new Error(`Category ID not found for slug: ${targetCategorySlug}`);
    }

    // Insert Product
    const createdProduct = await prisma.product.create({
      data: {
        id: p.id, // Keep the same id as in collectionsData
        name: p.name,
        slug: p.id, // Slug is identical to the id in collectionsData (e.g. 'baccarat-rouge-540')
        brand: p.brand,
        description: p.description,
        featured: p.featured,
        isActive: true,
        categoryId: categoryId,
        images: {
          create: p.images.map((imgUrl, index) => ({
            imageUrl: imgUrl,
            altText: `${p.name} Image ${index + 1}`,
            position: index
          }))
        },
        variants: {
          create: p.sizes.map(sz => ({
            size: sz.size,
            price: sz.price,
            stock: 100,
            sku: `${p.id.toUpperCase()}-${sz.size.replace(/\s+/g, '-').toUpperCase()}`,
            isActive: true
          }))
        }
      }
    });

    console.log(`Seeded product: [${createdProduct.slug}] ${createdProduct.name}`);
  }

  // 4. Ensure default Admin user exists
  const adminClerkId = 'user_3FIrMrbA3rY3bNCzZWTjiefI6xn';
  const adminUser = await prisma.user.upsert({
    where: { clerkId: adminClerkId },
    update: { role: 'ADMIN', name: 'Armash Ansari' },
    create: {
      clerkId: adminClerkId,
      email: 'admin@decantatelier.com',
      name: 'Armash Ansari',
      role: 'ADMIN'
    }
  });
  console.log('Admin user verified:', adminUser.email);

  // 5. Ensure default StoreSetting exists
  const settingsCount = await prisma.storeSetting.count();
  if (settingsCount === 0) {
    console.log('Seeding default store settings...');
    await prisma.storeSetting.create({
      data: {
        id: 'default',
        storeName: 'Decant Atelier',
        supportEmail: 'concierge@decantatelier.com',
        supportPhone: '+91 97681 88453',
        codEnabled: true,
        shippingCharges: 100,
        freeShippingThreshold: 1999,
        razorpayKey: process.env.RAZORPAY_KEY_ID ? process.env.RAZORPAY_KEY_ID.replace(/^["']|["']$/g, '').trim() : 'rzp_test_AtelierKey2026',
        razorpaySecret: process.env.RAZORPAY_KEY_SECRET ? process.env.RAZORPAY_KEY_SECRET.replace(/^["']|["']$/g, '').trim() : ''
      }
    });
    console.log('Default store settings seeded.');
  }

  console.log('Full database seed completed successfully!');
}

main()
  .catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
