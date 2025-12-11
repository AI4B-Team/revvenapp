export interface GalleryItem {
  id: number | string;
  type: 'image' | 'video';
  thumbnail: string;
  title: string;
  creator: {
    name: string;
    avatar: string;
  };
  likes?: number;
  isEdited?: boolean;
  isUpscaled?: boolean;
  createdAt?: string;
  status?: 'pending' | 'processing' | 'completed' | 'error';
  url?: string;
  prompt?: string;
  aspectRatio?: string;
  model?: string;
  errorMessage?: string;
  referenceImage?: string;
  referenceImages?: string[];
}

export const creationsData: GalleryItem[] = [
  {
    id: 1,
    type: 'video',
    thumbnail: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&h=600&fit=crop',
    title: 'Northern Lights',
    creator: { name: 'Sarah Chen', avatar: 'SC' }
  },
  {
    id: 2,
    type: 'video',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    title: 'Mountain Vista',
    creator: { name: 'Alex Rivera', avatar: 'AR' }
  },
  {
    id: 3,
    type: 'image',
    thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
    title: 'Forest Path',
    creator: { name: 'Maya Patel', avatar: 'MP' }
  },
  {
    id: 4,
    type: 'video',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop',
    title: 'Sunset Drive',
    creator: { name: 'Jordan Lee', avatar: 'JL' }
  },
  {
    id: 5,
    type: 'image',
    thumbnail: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop',
    title: 'Mountain Range',
    creator: { name: 'Sam Taylor', avatar: 'ST' }
  },
  {
    id: 6,
    type: 'video',
    thumbnail: 'https://images.unsplash.com/photo-1502224562085-639556652f33?w=800&h=600&fit=crop',
    title: 'Ocean Sunset',
    creator: { name: 'Chris Anderson', avatar: 'CA' }
  },
  {
    id: 7,
    type: 'image',
    thumbnail: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=600&fit=crop',
    title: 'City Lights',
    creator: { name: 'Taylor Kim', avatar: 'TK' }
  },
  {
    id: 8,
    type: 'video',
    thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop',
    title: 'Night Drive',
    creator: { name: 'Morgan Davis', avatar: 'MD' }
  },
  {
    id: 9,
    type: 'image',
    thumbnail: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=600&fit=crop',
    title: 'Desert Road',
    creator: { name: 'Jamie Fox', avatar: 'JF' }
  },
  {
    id: 10,
    type: 'video',
    thumbnail: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&h=600&fit=crop',
    title: 'Lake Reflection',
    creator: { name: 'Riley Smith', avatar: 'RS' }
  },
  {
    id: 11,
    type: 'image',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    title: 'Alpine Peaks',
    creator: { name: 'Casey Brown', avatar: 'CB' }
  },
  {
    id: 12,
    type: 'video',
    thumbnail: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&h=600&fit=crop',
    title: 'Foggy Forest',
    creator: { name: 'Drew Martin', avatar: 'DM' }
  },
  {
    id: 13,
    type: 'image',
    thumbnail: 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=800&h=600&fit=crop',
    title: 'Tropical Paradise',
    creator: { name: 'Quinn Lee', avatar: 'QL' }
  },
  {
    id: 14,
    type: 'video',
    thumbnail: 'https://images.unsplash.com/photo-1468276311594-df7cb65d8df6?w=800&h=600&fit=crop',
    title: 'Starry Night',
    creator: { name: 'Parker Hill', avatar: 'PH' }
  },
  {
    id: 15,
    type: 'image',
    thumbnail: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&h=600&fit=crop',
    title: 'Golden Hour',
    creator: { name: 'Avery Jones', avatar: 'AJ' }
  },
  {
    id: 16,
    type: 'video',
    thumbnail: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800&h=600&fit=crop',
    title: 'River Valley',
    creator: { name: 'Morgan White', avatar: 'MW' }
  },
  {
    id: 17,
    type: 'image',
    thumbnail: 'https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?w=800&h=600&fit=crop',
    title: 'Cliff Edge',
    creator: { name: 'Reese Taylor', avatar: 'RT' }
  },
  {
    id: 18,
    type: 'video',
    thumbnail: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&h=600&fit=crop',
    title: 'Wildflower Field',
    creator: { name: 'Blake Davis', avatar: 'BD' }
  },
  {
    id: 19,
    type: 'image',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    title: 'Snow Peaks',
    creator: { name: 'Skylar Kim', avatar: 'SK' }
  },
  {
    id: 20,
    type: 'video',
    thumbnail: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=800&h=600&fit=crop',
    title: 'Canyon Sunset',
    creator: { name: 'Jordan Reed', avatar: 'JR' }
  }
];

export const communityData: GalleryItem[] = [
  {
    id: 21,
    type: 'image',
    thumbnail: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop',
    title: 'Desert Road',
    creator: { name: 'James Wilson', avatar: 'JW' }
  },
  {
    id: 22,
    type: 'video',
    thumbnail: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop',
    title: 'Lake Paradise',
    creator: { name: 'Emma Stone', avatar: 'ES' }
  },
  {
    id: 23,
    type: 'image',
    thumbnail: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=600&fit=crop',
    title: 'Misty Mountains',
    creator: { name: 'David Park', avatar: 'DP' }
  },
  {
    id: 24,
    type: 'video',
    thumbnail: 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=800&h=600&fit=crop',
    title: 'Tropical Beach',
    creator: { name: 'Lisa Ray', avatar: 'LR' }
  },
  {
    id: 25,
    type: 'image',
    thumbnail: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&h=600&fit=crop',
    title: 'Winter Woods',
    creator: { name: 'Mark Johnson', avatar: 'MJ' }
  },
  {
    id: 26,
    type: 'video',
    thumbnail: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&h=600&fit=crop',
    title: 'Alpine Valley',
    creator: { name: 'Sophie Chen', avatar: 'SC' }
  },
  {
    id: 27,
    type: 'image',
    thumbnail: 'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?w=800&h=600&fit=crop',
    title: 'Urban Sunset',
    creator: { name: 'Ryan Cooper', avatar: 'RC' }
  },
  {
    id: 28,
    type: 'video',
    thumbnail: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&h=600&fit=crop',
    title: 'Canyon Drive',
    creator: { name: 'Nina Patel', avatar: 'NP' }
  },
  {
    id: 29,
    type: 'image',
    thumbnail: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&h=600&fit=crop',
    title: 'Ocean Waves',
    creator: { name: 'Tyler Green', avatar: 'TG' }
  },
  {
    id: 30,
    type: 'video',
    thumbnail: 'https://images.unsplash.com/photo-1484402628941-0bb40fc029e7?w=800&h=600&fit=crop',
    title: 'Mountain Trail',
    creator: { name: 'Ashley Moore', avatar: 'AM' }
  },
  {
    id: 31,
    type: 'image',
    thumbnail: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&h=600&fit=crop',
    title: 'Desert Dunes',
    creator: { name: 'Chris Wood', avatar: 'CW' }
  },
  {
    id: 32,
    type: 'video',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    title: 'Peak View',
    creator: { name: 'Sam Rivers', avatar: 'SR' }
  },
  {
    id: 33,
    type: 'image',
    thumbnail: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop',
    title: 'Sunset Horizon',
    creator: { name: 'Dana Fox', avatar: 'DF' }
  },
  {
    id: 34,
    type: 'video',
    thumbnail: 'https://images.unsplash.com/photo-1485236715568-ddc5ee6ca227?w=800&h=600&fit=crop',
    title: 'Forest Stream',
    creator: { name: 'Pat Collins', avatar: 'PC' }
  },
  {
    id: 35,
    type: 'image',
    thumbnail: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&h=600&fit=crop',
    title: 'Rocky Coast',
    creator: { name: 'Jesse Hunt', avatar: 'JH' }
  },
  {
    id: 36,
    type: 'video',
    thumbnail: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&h=600&fit=crop',
    title: 'Meadow Path',
    creator: { name: 'Alex Brooks', avatar: 'AB' }
  },
  {
    id: 37,
    type: 'image',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop',
    title: 'Beach Sunrise',
    creator: { name: 'Charlie Rose', avatar: 'CR' }
  },
  {
    id: 38,
    type: 'video',
    thumbnail: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=800&h=600&fit=crop',
    title: 'Valley Vista',
    creator: { name: 'Frankie Bell', avatar: 'FB' }
  },
  {
    id: 39,
    type: 'image',
    thumbnail: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800&h=600&fit=crop',
    title: 'Coastal Cliffs',
    creator: { name: 'River Stone', avatar: 'RS' }
  },
  {
    id: 40,
    type: 'video',
    thumbnail: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop',
    title: 'Mountain Lake',
    creator: { name: 'Sage Miller', avatar: 'SM' }
  }
];
