import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PhotoTheme {
  id: string;
  name: string;
  creator: string;
  images: string[];
}

const PHOTOSHOOT_THEMES: PhotoTheme[] = [
  // Seasonal & Holiday
  {
    id: 'winter-special',
    name: 'WINTER SPECIAL',
    creator: 'frostbyte',
    images: [
      'https://images.unsplash.com/photo-1517299321609-52687d1bc55a?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1477601263568-180e2c6d046e?w=400&h=500&fit=crop'
    ]
  },
  {
    id: 'christmas-magic',
    name: 'CHRISTMAS MAGIC',
    creator: 'hollydays',
    images: [
      'https://images.unsplash.com/photo-1512389142860-9c449e58a814?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1576919228236-a097c32a5cd4?w=400&h=500&fit=crop'
    ]
  },
  {
    id: 'fall-aesthetic',
    name: 'FALL AESTHETIC',
    creator: 'autumnleaf',
    images: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1476820865390-c52aeebb9891?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1509557965875-b88c97052f0e?w=400&h=500&fit=crop'
    ]
  },
  {
    id: 'spring-bloom',
    name: 'SPRING BLOOM',
    creator: 'cherryblsm',
    images: [
      'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1462275646964-a0e3571f4f7a?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&h=500&fit=crop'
    ]
  },
  {
    id: 'summer-vibes',
    name: 'SUMMER VIBES',
    creator: 'sunseeker',
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=400&h=500&fit=crop'
    ]
  },

  // Beauty & Style - Viral Worthy
  {
    id: 'aura-farming',
    name: 'AURA FARMING',
    creator: 'neonfluke',
    images: [
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=500&fit=crop'
    ]
  },
  {
    id: 'looksmaxing',
    name: 'LOOKSMAXING',
    creator: 'wispomatic',
    images: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop'
    ]
  },
  {
    id: '2000s-nostalgia',
    name: '2000S NOSTALGIA',
    creator: 'trunkel',
    images: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop'
    ]
  },
  {
    id: 'editorial-shots',
    name: 'EDITORIAL SHOTS',
    creator: 'lostsignal',
    images: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=500&fit=crop'
    ]
  },
  {
    id: 'old-money',
    name: 'OLD MONEY',
    creator: 'luxelife',
    images: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop'
    ]
  },
  {
    id: 'hair-goals',
    name: 'HAIR GOALS',
    creator: 'stylemaven',
    images: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1595959183082-7b570b7e1dfa?w=400&h=500&fit=crop'
    ]
  },
  {
    id: 'makeup-glam',
    name: 'MAKEUP GLAM',
    creator: 'beatface',
    images: [
      'https://images.unsplash.com/photo-1503236823255-94609f598e71?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1512389142860-9c449e58a814?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=500&fit=crop'
    ]
  },
  {
    id: 'fashion-editorial',
    name: 'FASHION EDITORIAL',
    creator: 'voguette',
    images: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=500&fit=crop'
    ]
  },
  {
    id: 'streetwear',
    name: 'STREETWEAR',
    creator: 'urbancore',
    images: [
      'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1544441893-675973e31985?w=400&h=500&fit=crop'
    ]
  },

  // Creative & Themed
  {
    id: 'cyberpunk',
    name: 'CYBERPUNK',
    creator: 'neonwave',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1563089145-599997674d42?w=400&h=500&fit=crop'
    ]
  },
  {
    id: 'anime-aesthetic',
    name: 'ANIME AESTHETIC',
    creator: 'kawaiipop',
    images: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=400&h=500&fit=crop'
    ]
  },
  {
    id: 'fairytale',
    name: 'FAIRYTALE',
    creator: 'enchanted',
    images: [
      'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=400&h=500&fit=crop'
    ]
  },
  {
    id: 'golden-hour',
    name: 'GOLDEN HOUR',
    creator: 'sunsetglow',
    images: [
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=500&fit=crop'
    ]
  },
  {
    id: 'dark-moody',
    name: 'DARK & MOODY',
    creator: 'shadowplay',
    images: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop'
    ]
  },
  {
    id: 'retro-film',
    name: 'RETRO FILM',
    creator: 'vintagevibe',
    images: [
      'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1516914943479-89db7d9ae7f2?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1514894780887-121968d00567?w=400&h=500&fit=crop'
    ]
  },
  {
    id: 'y2k-vibes',
    name: 'Y2K VIBES',
    creator: 'millennium',
    images: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=500&fit=crop'
    ]
  },
  {
    id: 'beach-tropical',
    name: 'BEACH TROPICAL',
    creator: 'islandlife',
    images: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=500&fit=crop'
    ]
  },

  // Professional
  {
    id: 'corporate-pro',
    name: 'CORPORATE PRO',
    creator: 'bizshots',
    images: [
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=500&fit=crop'
    ]
  },
  {
    id: 'linkedin-ready',
    name: 'LINKEDIN READY',
    creator: 'profiled',
    images: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop'
    ]
  },
  {
    id: 'entrepreneur',
    name: 'ENTREPRENEUR',
    creator: 'foundersclub',
    images: [
      'https://images.unsplash.com/photo-1553484771-371a605b060b?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=500&fit=crop'
    ]
  },
  {
    id: 'content-creator',
    name: 'CONTENT CREATOR',
    creator: 'influencer',
    images: [
      'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1590650153855-d9e808231d41?w=400&h=500&fit=crop'
    ]
  },
  {
    id: 'fitness-shoot',
    name: 'FITNESS SHOOT',
    creator: 'gymrat',
    images: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=500&fit=crop'
    ]
  },

  // Lifestyle & Milestones
  {
    id: 'birthday-bash',
    name: 'BIRTHDAY BASH',
    creator: 'partytime',
    images: [
      'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=400&h=500&fit=crop'
    ]
  },
  {
    id: 'maternity-glow',
    name: 'MATERNITY GLOW',
    creator: 'expecting',
    images: [
      'https://images.unsplash.com/photo-1544126592-807ade215a0b?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1509027572446-af8401acfdc3?w=400&h=500&fit=crop'
    ]
  },
  {
    id: 'engagement',
    name: 'ENGAGEMENT',
    creator: 'shesaidyes',
    images: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=500&fit=crop'
    ]
  },
  {
    id: 'graduation-day',
    name: 'GRADUATION DAY',
    creator: 'classof',
    images: [
      'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1627556704290-2b1f5853ff78?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1607013251379-e6eecfffe234?w=400&h=500&fit=crop'
    ]
  },
  {
    id: 'family-portrait',
    name: 'FAMILY PORTRAIT',
    creator: 'familyfirst',
    images: [
      'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1596697113069-b063fcf8e5ea?w=400&h=500&fit=crop'
    ]
  },
  {
    id: 'couples-shoot',
    name: 'COUPLES SHOOT',
    creator: 'lovebirds',
    images: [
      'https://images.unsplash.com/photo-1494774157365-9e04c6720e47?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&h=500&fit=crop'
    ]
  },
  {
    id: 'bff-photos',
    name: 'BFF PHOTOS',
    creator: 'squadgoals',
    images: [
      'https://images.unsplash.com/photo-1543807535-eceef0bc6599?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1516939884455-1445c8652f83?w=400&h=500&fit=crop'
    ]
  },

  // Kids & Family
  {
    id: 'baby-milestones',
    name: 'BABY MILESTONES',
    creator: 'tinytots',
    images: [
      'https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1504472478235-9bc48ba4d60f?w=400&h=500&fit=crop'
    ]
  },
  {
    id: 'mommy-and-me',
    name: 'MOMMY & ME',
    creator: 'mamalove',
    images: [
      'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1499557354967-2b2d8910bcca?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1494774157365-9e04c6720e47?w=400&h=500&fit=crop'
    ]
  },

  // Pets
  {
    id: 'pet-portraits',
    name: 'PET PORTRAITS',
    creator: 'furbaby',
    images: [
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=500&fit=crop'
    ]
  },
  {
    id: 'owner-and-pet',
    name: 'OWNER & PET',
    creator: 'petlife',
    images: [
      'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1544568100-847a948585b9?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=500&fit=crop'
    ]
  },

  // Holiday Specific
  {
    id: 'halloween-spooky',
    name: 'HALLOWEEN SPOOKY',
    creator: 'spookyszn',
    images: [
      'https://images.unsplash.com/photo-1509557965875-b88c97052f0e?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1508361001413-7a9dca21d08a?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1604006852748-903fccb72f95?w=400&h=500&fit=crop'
    ]
  },
  {
    id: 'valentines-love',
    name: 'VALENTINES LOVE',
    creator: 'heartseyes',
    images: [
      'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=400&h=500&fit=crop'
    ]
  },
  {
    id: 'new-years-glam',
    name: 'NEW YEARS GLAM',
    creator: 'countdown',
    images: [
      'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=500&fit=crop'
    ]
  },

  // Events
  {
    id: 'bachelorette',
    name: 'BACHELORETTE',
    creator: 'bridetribe',
    images: [
      'https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1529529159227-6e4c87e61a9e?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=500&fit=crop'
    ]
  },
  {
    id: 'girls-night',
    name: 'GIRLS NIGHT',
    creator: 'girlsquad',
    images: [
      'https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1516939884455-1445c8652f83?w=400&h=500&fit=crop'
    ]
  },

  // Travel
  {
    id: 'travel-postcard',
    name: 'TRAVEL POSTCARD',
    creator: 'wanderlust',
    images: [
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=400&h=500&fit=crop'
    ]
  },

  // Religious & Cultural
  {
    id: 'eid-celebration',
    name: 'EID CELEBRATION',
    creator: 'eidmubarak',
    images: [
      'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1596697113069-b063fcf8e5ea?w=400&h=500&fit=crop'
    ]
  },
  {
    id: 'diwali-lights',
    name: 'DIWALI LIGHTS',
    creator: 'festivaloflights',
    images: [
      'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=400&h=500&fit=crop'
    ]
  },
  {
    id: 'lunar-new-year',
    name: 'LUNAR NEW YEAR',
    creator: 'cnyvibes',
    images: [
      'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=500&fit=crop',
      'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=500&fit=crop'
    ]
  }
];

interface PhotoshootThemeSelectorProps {
  onSelect?: (theme: PhotoTheme) => void;
  selectedThemeId?: string;
}

const PhotoshootThemeSelector: React.FC<PhotoshootThemeSelectorProps> = ({ 
  onSelect,
  selectedThemeId 
}) => {
  const [selected, setSelected] = useState<string | null>(selectedThemeId || null);
  const [imageIndices, setImageIndices] = useState<Record<string, number>>({});

  const handleSelect = (theme: PhotoTheme) => {
    setSelected(theme.id);
    onSelect?.(theme);
  };

  const handlePrevImage = (e: React.MouseEvent, themeId: string) => {
    e.stopPropagation();
    setImageIndices(prev => ({
      ...prev,
      [themeId]: ((prev[themeId] || 0) - 1 + 3) % 3
    }));
  };

  const handleNextImage = (e: React.MouseEvent, themeId: string) => {
    e.stopPropagation();
    setImageIndices(prev => ({
      ...prev,
      [themeId]: ((prev[themeId] || 0) + 1) % 3
    }));
  };

  const getVisibleImages = (theme: PhotoTheme) => {
    const startIdx = imageIndices[theme.id] || 0;
    return [
      theme.images[startIdx % 3],
      theme.images[(startIdx + 1) % 3],
      theme.images[(startIdx + 2) % 3]
    ];
  };

  return (
    <div className="w-full bg-zinc-950 rounded-2xl p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PHOTOSHOOT_THEMES.map((theme) => {
          const isSelected = selected === theme.id;
          const visibleImages = getVisibleImages(theme);
          
          return (
            <button
              key={theme.id}
              onClick={() => handleSelect(theme)}
              className={`
                relative group rounded-xl overflow-hidden transition-all duration-300
                ${isSelected 
                  ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-zinc-950' 
                  : 'hover:ring-1 hover:ring-zinc-700'
                }
              `}
            >
              {/* Images Container */}
              <div className="flex h-[180px]">
                {visibleImages.map((img, idx) => (
                  <div key={idx} className="flex-1 relative overflow-hidden">
                    <img
                      src={img}
                      alt={`${theme.name} preview ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                ))}
              </div>

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

              {/* Navigation Arrows */}
              <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={(e) => handlePrevImage(e, theme.id)}
                  className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white hover:bg-black/80 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => handleNextImage(e, theme.id)}
                  className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white hover:bg-black/80 transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Theme Info */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-[11px] text-zinc-400 mb-0.5">{theme.creator}</p>
                <h3 className="text-lg font-bold text-white tracking-wide">{theme.name}</h3>
              </div>

              {/* Selected Indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PhotoshootThemeSelector;
