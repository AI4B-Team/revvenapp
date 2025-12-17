import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronDown, 
  X, 
  Search, 
  Sparkles, 
  Heart, 
  Briefcase, 
  Calendar, 
  Palette, 
  Wand2, 
  Baby, 
  PawPrint,
  Sun,
  Star,
  Camera,
  Crown,
  Music,
  Utensils,
  Plane,
  Church,
  PartyPopper,
  Check
} from 'lucide-react';

interface PhotoTheme {
  id: string;
  name: string;
  description: string;
  previews: string[];
  tags: string[];
  popular?: boolean;
  new?: boolean;
}

interface ThemeCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  emoji?: string;
  description: string;
  themes: PhotoTheme[];
  highlight?: string;
}

const THEME_CATEGORIES: ThemeCategory[] = [
  {
    id: 'lifestyle',
    name: 'Lifestyle & Milestones',
    icon: <Heart className="w-5 h-5" />,
    emoji: '💕',
    description: 'Capture life\'s precious moments',
    themes: [
      {
        id: 'birthday',
        name: 'Birthday Celebration',
        description: 'Balloons, cake, and pure joy',
        previews: [
          'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=400&h=500&fit=crop'
        ],
        tags: ['celebration', 'party', 'cake'],
        popular: true
      },
      {
        id: 'first-birthday',
        name: 'First Birthday / Smash Cake',
        description: 'Messy, adorable milestone moments',
        previews: [
          'https://images.unsplash.com/photo-1612540140122-97ee75ff76e3?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1504472478235-9bc48ba4d60f?w=400&h=500&fit=crop'
        ],
        tags: ['baby', 'milestone', 'cake smash']
      },
      {
        id: 'pregnancy',
        name: 'Pregnancy / Maternity',
        description: 'Glowing mother-to-be portraits',
        previews: [
          'https://images.unsplash.com/photo-1544126592-807ade215a0b?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1509027572446-af8401acfdc3?w=400&h=500&fit=crop'
        ],
        tags: ['maternity', 'expecting', 'baby bump'],
        popular: true
      },
      {
        id: 'engagement',
        name: 'Engagement',
        description: 'She said yes! Romantic couple shots',
        previews: [
          'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=500&fit=crop'
        ],
        tags: ['couple', 'ring', 'romantic']
      },
      {
        id: 'graduation',
        name: 'Graduation',
        description: 'Cap, gown, and glory',
        previews: [
          'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1627556704290-2b1f5853ff78?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1607013251379-e6eecfffe234?w=400&h=500&fit=crop'
        ],
        tags: ['graduate', 'achievement', 'diploma']
      },
      {
        id: 'anniversary',
        name: 'Anniversary',
        description: 'Celebrating years of love',
        previews: [
          'https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1460978812857-470ed1c77af0?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=500&fit=crop'
        ],
        tags: ['couple', 'love', 'milestone']
      },
      {
        id: 'family',
        name: 'Family Photos',
        description: 'Timeless family portraits',
        previews: [
          'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1596697113069-b063fcf8e5ea?w=400&h=500&fit=crop'
        ],
        tags: ['family', 'portrait', 'together'],
        popular: true
      },
      {
        id: 'couples',
        name: 'Couples Photos',
        description: 'Romantic duo portraits',
        previews: [
          'https://images.unsplash.com/photo-1494774157365-9e04c6720e47?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&h=500&fit=crop'
        ],
        tags: ['couple', 'romantic', 'love']
      },
      {
        id: 'best-friends',
        name: 'Best Friend Photos',
        description: 'Friendship goals captured',
        previews: [
          'https://images.unsplash.com/photo-1543807535-eceef0bc6599?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1516939884455-1445c8652f83?w=400&h=500&fit=crop'
        ],
        tags: ['friends', 'bff', 'fun']
      },
      {
        id: 'gender-reveal',
        name: 'Gender Reveal',
        description: 'Pink or blue? The big reveal!',
        previews: [
          'https://images.unsplash.com/photo-1606103836293-0a063ee20566?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1584839404042-8bc21d240de0?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&h=500&fit=crop'
        ],
        tags: ['baby', 'reveal', 'celebration'],
        new: true
      },
      {
        id: 'baby-shower',
        name: 'Baby Shower',
        description: 'Celebrating the mom-to-be',
        previews: [
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1606103920295-ca9fc1068d11?w=400&h=500&fit=crop'
        ],
        tags: ['baby', 'shower', 'party']
      },
      {
        id: 'quinceanera',
        name: 'Quinceañera / Sweet 16',
        description: 'Coming-of-age elegance',
        previews: [
          'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?w=400&h=500&fit=crop'
        ],
        tags: ['quinceañera', 'sweet 16', 'celebration']
      },
      {
        id: 'prom',
        name: 'Prom Night',
        description: 'Glamorous night to remember',
        previews: [
          'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1494774157365-9e04c6720e47?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&h=500&fit=crop'
        ],
        tags: ['prom', 'formal', 'night']
      }
    ]
  },
  {
    id: 'professional',
    name: 'Professional & Branding',
    icon: <Briefcase className="w-5 h-5" />,
    emoji: '💼',
    description: 'Level up your professional image',
    themes: [
      {
        id: 'corporate-headshots',
        name: 'Corporate Headshots',
        description: 'Clean, polished executive portraits',
        previews: [
          'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=500&fit=crop'
        ],
        tags: ['corporate', 'business', 'headshot'],
        popular: true
      },
      {
        id: 'linkedin',
        name: 'LinkedIn Professional',
        description: 'Stand out in the feed',
        previews: [
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop'
        ],
        tags: ['linkedin', 'professional', 'networking'],
        popular: true
      },
      {
        id: 'entrepreneur',
        name: 'Entrepreneur Brand Shoot',
        description: 'Bold visionary aesthetics',
        previews: [
          'https://images.unsplash.com/photo-1553484771-371a605b060b?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=500&fit=crop'
        ],
        tags: ['entrepreneur', 'startup', 'founder']
      },
      {
        id: 'real-estate',
        name: 'Real Estate Agent',
        description: 'Trustworthy, approachable agent shots',
        previews: [
          'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=400&h=500&fit=crop'
        ],
        tags: ['real estate', 'agent', 'professional']
      },
      {
        id: 'actor-comp',
        name: 'Actor/Model Comp Cards',
        description: 'Versatile looks for casting',
        previews: [
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=500&fit=crop'
        ],
        tags: ['actor', 'model', 'comp card']
      },
      {
        id: 'content-creator',
        name: 'Content Creator Lifestyle',
        description: 'Influencer-ready aesthetic',
        previews: [
          'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1590650153855-d9e808231d41?w=400&h=500&fit=crop'
        ],
        tags: ['influencer', 'creator', 'lifestyle'],
        popular: true
      },
      {
        id: 'fitness',
        name: 'Fitness / Gym Shoot',
        description: 'Show off that hard work',
        previews: [
          'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=500&fit=crop'
        ],
        tags: ['fitness', 'gym', 'athletic']
      },
      {
        id: 'author',
        name: 'Author Portraits',
        description: 'Thoughtful, intellectual aesthetic',
        previews: [
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&h=500&fit=crop'
        ],
        tags: ['author', 'writer', 'intellectual']
      },
      {
        id: 'speaker',
        name: 'Keynote Speaker',
        description: 'Confident, commanding presence',
        previews: [
          'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=500&fit=crop'
        ],
        tags: ['speaker', 'keynote', 'conference'],
        new: true
      },
      {
        id: 'musician',
        name: 'Musician / Artist Promo',
        description: 'Album cover ready shots',
        previews: [
          'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1598387993281-cecf8b71a8f8?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=500&fit=crop'
        ],
        tags: ['musician', 'artist', 'promo']
      },
      {
        id: 'chef',
        name: 'Chef / Culinary Creator',
        description: 'Kitchen confidence shots',
        previews: [
          'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1581299894007-aaa50297cf16?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=500&fit=crop'
        ],
        tags: ['chef', 'culinary', 'food']
      },
      {
        id: 'coach',
        name: 'Life Coach / Wellness Expert',
        description: 'Warm, inviting energy',
        previews: [
          'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&h=500&fit=crop'
        ],
        tags: ['coach', 'wellness', 'expert']
      }
    ]
  },
  {
    id: 'seasonal',
    name: 'Seasonal & Holiday',
    icon: <Calendar className="w-5 h-5" />,
    emoji: '🎄',
    description: 'Festive themed photo sets',
    themes: [
      {
        id: 'christmas',
        name: 'Christmas',
        description: 'Cozy holiday magic',
        previews: [
          'https://images.unsplash.com/photo-1512389142860-9c449e58a814?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1576919228236-a097c32a5cd4?w=400&h=500&fit=crop'
        ],
        tags: ['christmas', 'holiday', 'festive'],
        popular: true
      },
      {
        id: 'new-year',
        name: 'New Year',
        description: 'Glamorous celebration vibes',
        previews: [
          'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=500&fit=crop'
        ],
        tags: ['new year', 'celebration', 'party']
      },
      {
        id: 'valentines',
        name: 'Valentine\'s Day',
        description: 'Romantic red aesthetics',
        previews: [
          'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=400&h=500&fit=crop'
        ],
        tags: ['valentine', 'romantic', 'love']
      },
      {
        id: 'easter',
        name: 'Easter',
        description: 'Pastel spring celebration',
        previews: [
          'https://images.unsplash.com/photo-1521967906867-14ec9d64bee8?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1490723286627-4b66e6b2882a?w=400&h=500&fit=crop'
        ],
        tags: ['easter', 'spring', 'pastel']
      },
      {
        id: 'mothers-day',
        name: 'Mother\'s Day',
        description: 'Celebrating mom\'s love',
        previews: [
          'https://images.unsplash.com/photo-1494774157365-9e04c6720e47?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1499557354967-2b2d8910bcca?w=400&h=500&fit=crop'
        ],
        tags: ['mother', 'mom', 'family']
      },
      {
        id: 'fathers-day',
        name: 'Father\'s Day',
        description: 'Honoring dad\'s strength',
        previews: [
          'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1597524678053-5e6fef52d8a3?w=400&h=500&fit=crop'
        ],
        tags: ['father', 'dad', 'family']
      },
      {
        id: 'halloween',
        name: 'Halloween',
        description: 'Spooky season aesthetics',
        previews: [
          'https://images.unsplash.com/photo-1509557965875-b88c97052f0e?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1508361001413-7a9dca21d08a?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1604006852748-903fccb72f95?w=400&h=500&fit=crop'
        ],
        tags: ['halloween', 'spooky', 'costume'],
        popular: true
      },
      {
        id: 'thanksgiving',
        name: 'Thanksgiving',
        description: 'Grateful gathering vibes',
        previews: [
          'https://images.unsplash.com/photo-1574407676397-0e15c2f0c161?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1542384557-0824d90731ee?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1509564324749-471bd272e1ff?w=400&h=500&fit=crop'
        ],
        tags: ['thanksgiving', 'fall', 'family']
      },
      {
        id: 'fourth-july',
        name: '4th of July',
        description: 'Patriotic summer vibes',
        previews: [
          'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=400&h=500&fit=crop'
        ],
        tags: ['july', 'patriotic', 'summer']
      },
      {
        id: 'back-to-school',
        name: 'Back to School',
        description: 'Fresh start energy',
        previews: [
          'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&h=500&fit=crop'
        ],
        tags: ['school', 'education', 'student']
      }
    ]
  },
  {
    id: 'seasons',
    name: 'Seasons',
    icon: <Sun className="w-5 h-5" />,
    emoji: '🌸',
    description: 'Nature\'s beautiful backdrop',
    themes: [
      {
        id: 'spring',
        name: 'Spring',
        description: 'Cherry blossoms & fresh blooms',
        previews: [
          'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1462275646964-a0e3571f4f7a?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&h=500&fit=crop'
        ],
        tags: ['spring', 'flowers', 'bloom']
      },
      {
        id: 'summer',
        name: 'Summer',
        description: 'Golden hour & sun-kissed skin',
        previews: [
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=400&h=500&fit=crop'
        ],
        tags: ['summer', 'beach', 'sunny'],
        popular: true
      },
      {
        id: 'fall',
        name: 'Fall Aesthetic',
        description: 'Warm tones & falling leaves',
        previews: [
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1476820865390-c52aeebb9891?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1509557965875-b88c97052f0e?w=400&h=500&fit=crop'
        ],
        tags: ['fall', 'autumn', 'leaves'],
        popular: true
      },
      {
        id: 'winter',
        name: 'Winter Wonderland',
        description: 'Snow, cozy vibes & magic',
        previews: [
          'https://images.unsplash.com/photo-1517299321609-52687d1bc55a?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1477601263568-180e2c6d046e?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=400&h=500&fit=crop'
        ],
        tags: ['winter', 'snow', 'cozy']
      }
    ]
  },
  {
    id: 'beauty',
    name: 'Beauty & Style',
    icon: <Sparkles className="w-5 h-5" />,
    emoji: '✨',
    description: 'Glamour that stops the scroll',
    highlight: '🔥 VIRAL WORTHY',
    themes: [
      {
        id: 'hair-photography',
        name: 'Hair Photography',
        description: 'Showcase stunning hairstyles',
        previews: [
          'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1595959183082-7b570b7e1dfa?w=400&h=500&fit=crop'
        ],
        tags: ['hair', 'style', 'beauty'],
        popular: true
      },
      {
        id: 'makeup-glam',
        name: 'Makeup Glam',
        description: 'Beat face editorial looks',
        previews: [
          'https://images.unsplash.com/photo-1503236823255-94609f598e71?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=500&fit=crop'
        ],
        tags: ['makeup', 'glam', 'beauty']
      },
      {
        id: 'fashion-editorial',
        name: 'Fashion Editorial',
        description: 'High fashion magazine ready',
        previews: [
          'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=500&fit=crop'
        ],
        tags: ['fashion', 'editorial', 'high fashion'],
        popular: true
      },
      {
        id: 'streetwear',
        name: 'Streetwear',
        description: 'Urban fashion vibes',
        previews: [
          'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1544441893-675973e31985?w=400&h=500&fit=crop'
        ],
        tags: ['streetwear', 'urban', 'fashion']
      },
      {
        id: 'old-money',
        name: 'Old Money Aesthetic',
        description: 'Quiet luxury & inherited wealth',
        previews: [
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop'
        ],
        tags: ['old money', 'luxury', 'elegant'],
        popular: true
      },
      {
        id: 'luxury-magazine',
        name: 'Luxury Magazine Portraits',
        description: 'Vanity Fair worthy shots',
        previews: [
          'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=500&fit=crop'
        ],
        tags: ['luxury', 'magazine', 'editorial']
      },
      {
        id: 'boudoir',
        name: 'Boudoir / Intimate',
        description: 'Elegant, tasteful intimacy',
        previews: [
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop'
        ],
        tags: ['boudoir', 'intimate', 'elegant'],
        new: true
      },
      {
        id: 'nails-jewelry',
        name: 'Nails & Jewelry',
        description: 'Detail shots that sparkle',
        previews: [
          'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=500&fit=crop'
        ],
        tags: ['nails', 'jewelry', 'accessories']
      }
    ]
  },
  {
    id: 'creative',
    name: 'Themed / Creative',
    icon: <Wand2 className="w-5 h-5" />,
    emoji: '🎭',
    description: 'Fantasy worlds & unique concepts',
    highlight: '🔥 VIRAL WORTHY',
    themes: [
      {
        id: 'fairytale',
        name: 'Fairytale / Fantasy',
        description: 'Once upon a time magic',
        previews: [
          'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=400&h=500&fit=crop'
        ],
        tags: ['fairytale', 'fantasy', 'magical'],
        popular: true
      },
      {
        id: 'cyberpunk',
        name: 'Cyberpunk',
        description: 'Neon-lit futuristic vibes',
        previews: [
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1563089145-599997674d42?w=400&h=500&fit=crop'
        ],
        tags: ['cyberpunk', 'neon', 'futuristic'],
        popular: true
      },
      {
        id: 'anime-kpop',
        name: 'Anime / K-Pop Inspired',
        description: 'Asian pop culture aesthetics',
        previews: [
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=400&h=500&fit=crop'
        ],
        tags: ['anime', 'kpop', 'asian'],
        popular: true
      },
      {
        id: 'travel-postcard',
        name: 'Travel Postcard Scenes',
        description: 'Wanderlust destinations',
        previews: [
          'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=400&h=500&fit=crop'
        ],
        tags: ['travel', 'wanderlust', 'destination']
      },
      {
        id: 'beach-tropical',
        name: 'Beach / Tropical',
        description: 'Paradise found',
        previews: [
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=500&fit=crop'
        ],
        tags: ['beach', 'tropical', 'paradise']
      },
      {
        id: 'studio-vogue',
        name: 'Studio Vogue Set',
        description: 'High fashion studio lighting',
        previews: [
          'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=500&fit=crop'
        ],
        tags: ['studio', 'vogue', 'fashion']
      },
      {
        id: 'retro-vintage',
        name: 'Retro / Vintage Film',
        description: '70s, 80s, 90s nostalgia',
        previews: [
          'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1516914943479-89db7d9ae7f2?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1514894780887-121968d00567?w=400&h=500&fit=crop'
        ],
        tags: ['retro', 'vintage', 'film']
      },
      {
        id: 'dark-moody',
        name: 'Dark & Moody',
        description: 'Dramatic shadows & mystery',
        previews: [
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop'
        ],
        tags: ['dark', 'moody', 'dramatic'],
        new: true
      },
      {
        id: 'golden-hour',
        name: 'Golden Hour Magic',
        description: 'That perfect sunset glow',
        previews: [
          'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=500&fit=crop'
        ],
        tags: ['golden hour', 'sunset', 'warm']
      },
      {
        id: 'art-gallery',
        name: 'Art Gallery / Museum',
        description: 'Cultured, sophisticated shots',
        previews: [
          'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1541367777708-7905fe3296c0?w=400&h=500&fit=crop'
        ],
        tags: ['art', 'gallery', 'museum']
      },
      {
        id: 'y2k',
        name: 'Y2K Aesthetic',
        description: 'Early 2000s nostalgia',
        previews: [
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=500&fit=crop'
        ],
        tags: ['y2k', '2000s', 'nostalgia'],
        new: true
      }
    ]
  },
  {
    id: 'kids',
    name: 'Kids & Family',
    icon: <Baby className="w-5 h-5" />,
    emoji: '👶',
    description: 'Parents will pay for this instantly',
    highlight: '💰 HIGH DEMAND',
    themes: [
      {
        id: 'baby-milestones',
        name: 'Baby Milestones',
        description: 'First steps, first words, first everything',
        previews: [
          'https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1504472478235-9bc48ba4d60f?w=400&h=500&fit=crop'
        ],
        tags: ['baby', 'milestone', 'first'],
        popular: true
      },
      {
        id: 'toddler-portraits',
        name: 'Toddler Portraits',
        description: 'Terrible twos, adorable photos',
        previews: [
          'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&h=500&fit=crop'
        ],
        tags: ['toddler', 'portrait', 'cute']
      },
      {
        id: 'mommy-me',
        name: 'Mommy & Me',
        description: 'Mother-child bonding moments',
        previews: [
          'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1499557354967-2b2d8910bcca?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1494774157365-9e04c6720e47?w=400&h=500&fit=crop'
        ],
        tags: ['mommy', 'mother', 'child'],
        popular: true
      },
      {
        id: 'daddy-me',
        name: 'Daddy & Me',
        description: 'Father-child precious moments',
        previews: [
          'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1597524678053-5e6fef52d8a3?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop'
        ],
        tags: ['daddy', 'father', 'child']
      },
      {
        id: 'family-holiday-cards',
        name: 'Family Holiday Cards',
        description: 'Card-perfect family shots',
        previews: [
          'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=400&h=500&fit=crop'
        ],
        tags: ['family', 'holiday', 'card'],
        popular: true
      },
      {
        id: 'siblings',
        name: 'Siblings',
        description: 'Brother & sister bonds',
        previews: [
          'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&h=500&fit=crop'
        ],
        tags: ['siblings', 'brother', 'sister']
      },
      {
        id: 'grandparents',
        name: 'Grandparents & Kids',
        description: 'Generational love',
        previews: [
          'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1596697113069-b063fcf8e5ea?w=400&h=500&fit=crop'
        ],
        tags: ['grandparents', 'generations', 'family'],
        new: true
      }
    ]
  },
  {
    id: 'pets',
    name: 'Pets',
    icon: <PawPrint className="w-5 h-5" />,
    emoji: '🐾',
    description: 'Trust me, they\'ll buy this',
    highlight: '💰 HIGH DEMAND',
    themes: [
      {
        id: 'pet-portraits',
        name: 'Pet Portraits',
        description: 'Fur babies deserve fame too',
        previews: [
          'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=500&fit=crop'
        ],
        tags: ['pet', 'portrait', 'animal'],
        popular: true
      },
      {
        id: 'owner-pet',
        name: 'Owner + Pet Shoots',
        description: 'Best friends forever shots',
        previews: [
          'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1544568100-847a948585b9?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=500&fit=crop'
        ],
        tags: ['owner', 'pet', 'together'],
        popular: true
      },
      {
        id: 'holiday-pet-cards',
        name: 'Holiday Pet Cards',
        description: 'Festive fur baby photos',
        previews: [
          'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=400&h=500&fit=crop'
        ],
        tags: ['holiday', 'pet', 'card']
      },
      {
        id: 'puppy-kitten',
        name: 'Puppy / Kitten',
        description: 'Cuteness overload',
        previews: [
          'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=500&fit=crop'
        ],
        tags: ['puppy', 'kitten', 'baby'],
        new: true
      }
    ]
  },
  {
    id: 'religious',
    name: 'Religious & Cultural',
    icon: <Church className="w-5 h-5" />,
    emoji: '🙏',
    description: 'Sacred moments preserved',
    themes: [
      {
        id: 'baptism',
        name: 'Baptism / Christening',
        description: 'Holy first sacrament',
        previews: [
          'https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1504472478235-9bc48ba4d60f?w=400&h=500&fit=crop'
        ],
        tags: ['baptism', 'christening', 'religious']
      },
      {
        id: 'communion',
        name: 'First Communion',
        description: 'Sacred milestone',
        previews: [
          'https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&h=500&fit=crop'
        ],
        tags: ['communion', 'religious', 'milestone']
      },
      {
        id: 'bar-bat-mitzvah',
        name: 'Bar/Bat Mitzvah',
        description: 'Coming of age celebration',
        previews: [
          'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=500&fit=crop'
        ],
        tags: ['bar mitzvah', 'bat mitzvah', 'jewish']
      },
      {
        id: 'eid',
        name: 'Eid Celebration',
        description: 'Festive Islamic celebration',
        previews: [
          'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1596697113069-b063fcf8e5ea?w=400&h=500&fit=crop'
        ],
        tags: ['eid', 'islamic', 'celebration'],
        new: true
      },
      {
        id: 'diwali',
        name: 'Diwali',
        description: 'Festival of lights',
        previews: [
          'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=400&h=500&fit=crop'
        ],
        tags: ['diwali', 'hindu', 'festival'],
        new: true
      },
      {
        id: 'lunar-new-year',
        name: 'Lunar New Year',
        description: 'Asian new year celebration',
        previews: [
          'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=500&fit=crop'
        ],
        tags: ['lunar', 'chinese', 'new year']
      }
    ]
  },
  {
    id: 'events',
    name: 'Events & Celebrations',
    icon: <PartyPopper className="w-5 h-5" />,
    emoji: '🎉',
    description: 'Party-ready photo sets',
    themes: [
      {
        id: 'bachelorette',
        name: 'Bachelorette Party',
        description: 'Last fling before the ring',
        previews: [
          'https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1529529159227-6e4c87e61a9e?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=500&fit=crop'
        ],
        tags: ['bachelorette', 'party', 'bride'],
        popular: true
      },
      {
        id: 'bachelor',
        name: 'Bachelor Party',
        description: 'Groom\'s last hurrah',
        previews: [
          'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=500&fit=crop'
        ],
        tags: ['bachelor', 'party', 'groom']
      },
      {
        id: 'girls-night',
        name: 'Girls Night Out',
        description: 'Squad goals aesthetic',
        previews: [
          'https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1516939884455-1445c8652f83?w=400&h=500&fit=crop'
        ],
        tags: ['girls night', 'squad', 'party']
      },
      {
        id: 'date-night',
        name: 'Date Night',
        description: 'Romantic evening vibes',
        previews: [
          'https://images.unsplash.com/photo-1494774157365-9e04c6720e47?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=500&fit=crop'
        ],
        tags: ['date night', 'romantic', 'couple']
      },
      {
        id: 'reunion',
        name: 'Reunion',
        description: 'Together again',
        previews: [
          'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=400&h=500&fit=crop'
        ],
        tags: ['reunion', 'family', 'friends']
      },
      {
        id: 'retirement',
        name: 'Retirement',
        description: 'New chapter begins',
        previews: [
          'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=400&h=500&fit=crop',
          'https://images.unsplash.com/photo-1596697113069-b063fcf8e5ea?w=400&h=500&fit=crop'
        ],
        tags: ['retirement', 'celebration', 'milestone'],
        new: true
      }
    ]
  }
];

const PhotoshootThemeSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<PhotoTheme | null>(null);
  const [hoveredTheme, setHoveredTheme] = useState<string | null>(null);
  const [activePreview, setActivePreview] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cycle through previews on hover
  useEffect(() => {
    if (hoveredTheme) {
      const interval = setInterval(() => {
        setActivePreview(prev => (prev + 1) % 3);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setActivePreview(0);
    }
  }, [hoveredTheme]);

  const filteredCategories = THEME_CATEGORIES.map(category => ({
    ...category,
    themes: category.themes.filter(theme =>
      theme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      theme.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      theme.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.themes.length > 0);

  const allPopularThemes = THEME_CATEGORIES.flatMap(cat => 
    cat.themes.filter(t => t.popular)
  ).slice(0, 8);

  const handleSelectTheme = (theme: PhotoTheme) => {
    setSelectedTheme(theme);
  };

  const handleGenerate = () => {
    if (selectedTheme) {
      console.log('Generating photoshoot set for:', selectedTheme.name);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full max-w-md" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-zinc-900/80 border border-zinc-800 rounded-xl hover:border-emerald-500/50 transition-all duration-300 group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-zinc-100">
              {selectedTheme ? selectedTheme.name : 'Select Photoshoot Theme'}
            </p>
            <p className="text-xs text-zinc-500">
              {selectedTheme ? selectedTheme.description : 'Choose a style for your photo set'}
            </p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-zinc-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header & Search */}
          <div className="p-4 border-b border-zinc-800/50 bg-gradient-to-b from-zinc-900/50 to-transparent">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search themes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
              />
            </div>
          </div>

          {/* Content */}
          <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
            {/* Popular Section - Show when no search */}
            {!searchQuery && !selectedCategory && (
              <div className="p-4 border-b border-zinc-800/30">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Most Popular</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {allPopularThemes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => handleSelectTheme(theme)}
                      onMouseEnter={() => setHoveredTheme(theme.id)}
                      onMouseLeave={() => setHoveredTheme(null)}
                      className={`relative aspect-[3/4] rounded-lg overflow-hidden group transition-all duration-300 ${
                        selectedTheme?.id === theme.id ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-zinc-950' : ''
                      }`}
                    >
                      <img
                        src={theme.previews[hoveredTheme === theme.id ? activePreview : 0]}
                        alt={theme.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <p className="text-[10px] font-medium text-white leading-tight truncate">{theme.name}</p>
                      </div>
                      {selectedTheme?.id === theme.id && (
                        <div className="absolute top-1 right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Categories */}
            {filteredCategories.map((category) => (
              <div key={category.id} className="border-b border-zinc-800/30 last:border-0">
                {/* Category Header */}
                <button
                  onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-zinc-900/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-zinc-800/50 flex items-center justify-center text-emerald-400">
                      {category.icon}
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-zinc-100">{category.name}</span>
                        {category.highlight && (
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                            {category.highlight}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500">{category.themes.length} themes</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${
                    selectedCategory === category.id ? 'rotate-180' : ''
                  }`} />
                </button>

                {/* Category Themes */}
                {(selectedCategory === category.id || searchQuery) && (
                  <div className="px-4 pb-4">
                    <div className="grid grid-cols-3 gap-3">
                      {category.themes.map((theme) => (
                        <button
                          key={theme.id}
                          onClick={() => handleSelectTheme(theme)}
                          onMouseEnter={() => setHoveredTheme(theme.id)}
                          onMouseLeave={() => setHoveredTheme(null)}
                          className={`relative rounded-xl overflow-hidden group transition-all duration-300 ${
                            selectedTheme?.id === theme.id 
                              ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-zinc-950 scale-[0.98]' 
                              : 'hover:ring-1 hover:ring-zinc-700'
                          }`}
                        >
                          {/* Preview Images */}
                          <div className="aspect-[3/4] relative">
                            {theme.previews.map((preview, idx) => (
                              <img
                                key={idx}
                                src={preview}
                                alt={`${theme.name} preview ${idx + 1}`}
                                className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
                                  hoveredTheme === theme.id && activePreview === idx
                                    ? 'opacity-100 scale-105'
                                    : hoveredTheme === theme.id
                                    ? 'opacity-0'
                                    : idx === 0
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                }`}
                              />
                            ))}
                            
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                            
                            {/* Badges */}
                            <div className="absolute top-2 left-2 flex gap-1">
                              {theme.popular && (
                                <span className="text-[9px] font-bold text-amber-300 bg-amber-500/20 backdrop-blur-sm px-1.5 py-0.5 rounded-full border border-amber-500/30">
                                  🔥 HOT
                                </span>
                              )}
                              {theme.new && (
                                <span className="text-[9px] font-bold text-emerald-300 bg-emerald-500/20 backdrop-blur-sm px-1.5 py-0.5 rounded-full border border-emerald-500/30">
                                  ✨ NEW
                                </span>
                              )}
                            </div>

                            {/* Selected Check */}
                            {selectedTheme?.id === theme.id && (
                              <div className="absolute top-2 right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/50">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}

                            {/* Preview Dots */}
                            {hoveredTheme === theme.id && (
                              <div className="absolute top-2 right-2 flex gap-1">
                                {[0, 1, 2].map(idx => (
                                  <div
                                    key={idx}
                                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                                      activePreview === idx
                                        ? 'bg-white scale-125'
                                        : 'bg-white/40'
                                    }`}
                                  />
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Theme Info */}
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <p className="text-sm font-semibold text-white mb-0.5 group-hover:text-emerald-300 transition-colors">
                              {theme.name}
                            </p>
                            <p className="text-[10px] text-zinc-400 line-clamp-1">
                              {theme.description}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer with Generate Button */}
          {selectedTheme && (
            <div className="p-4 border-t border-zinc-800 bg-gradient-to-t from-zinc-900 to-transparent">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-xs text-zinc-500">Selected theme</p>
                  <p className="text-sm font-medium text-zinc-100">{selectedTheme.name}</p>
                </div>
                <button
                  onClick={handleGenerate}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate Set
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #3f3f46;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #52525b;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-in-from-top-2 {
          from { transform: translateY(-8px); }
          to { transform: translateY(0); }
        }
        .animate-in {
          animation: fade-in 0.2s ease-out, slide-in-from-top-2 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PhotoshootThemeSelector;
