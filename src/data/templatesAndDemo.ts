import {
  TemplateDefinition,
  WeddingProject,
  WeddingEventItem,
  GuestRecord,
  RsvpRecord,
  LanguageCode,
} from '../types/vowora';

export const ASSETS = {
  ARCH_LAKE_COMO: '/src/assets/images/arch_lake_como_terrace_1794388510617.jpg',
  COUPLE_EUROPEAN_VILLA: '/src/assets/images/couple_european_villa_1794388510872.jpg',
  COUPLE_USA_NAPA: '/src/assets/images/couple_usa_napa_valley_1794388510084.jpg',
  VENUE_VILLA_LAWN: '/src/assets/images/venue_villa_balbianello_lawn_1794388513816.jpg',
  HERO_EDITORIAL: '/src/assets/images/hero_wedding_editorial_1794386500757.jpg',
  TABLE_SETTING: '/src/assets/images/editorial_table_setting_1794386560975.jpg',
  COUPLE_AARAV_MEERA: '/src/assets/images/couple_european_villa_1794388510872.jpg',
  VENUE_PALACE: '/src/assets/images/venue_villa_balbianello_lawn_1794388513816.jpg',
};

export interface CuratedCardPreset {
  id: string;
  name: string;
  badge: string;
  partnerOne: string;
  partnerTwo: string;
  dateRangeLabel: string;
  weddingDate: string;
  dayNumber: string;
  monthShort: string;
  monthFull: string;
  yearNumber: string;
  weekdayLabel: string;
  ceremonySubtitle: string;
  archPhotoUrl: string;
  venuePhotoUrl: string;
  couplePortraitUrl: string;
  venueKicker: string;
  venueName: string;
  venueAddress: string;
  venueParkingNote: string;
  mapEmbedQuery: string;
  primaryColor: string;
  accentColor: string;
  foilColorStart: string;
  foilColorEnd: string;
  petalColor: string;
  bgColor: string;
  events: {
    dateLabel: string;
    timeLabel: string;
    title: string;
    description: string;
  }[];
}

export const CURATED_CARD_TEMPLATES: CuratedCardPreset[] = [
  {
    id: 'lake-como-azure',
    name: '01 · Lake Como Villa',
    badge: 'Italian Lakefront · Regency Blue',
    partnerOne: 'Julian',
    partnerTwo: 'Clara',
    dateRangeLabel: '15 & 16 DECEMBER',
    weddingDate: '2026-12-16',
    dayNumber: '16',
    monthShort: 'DEC',
    monthFull: 'December',
    yearNumber: '2026',
    weekdayLabel: 'Wednesday',
    ceremonySubtitle: 'Holy Matrimony & Villa Reception',
    archPhotoUrl: ASSETS.ARCH_LAKE_COMO,
    venuePhotoUrl: ASSETS.VENUE_VILLA_LAWN,
    couplePortraitUrl: ASSETS.COUPLE_EUROPEAN_VILLA,
    venueKicker: 'GRAND CELEBRATION LAWN & TERRACE',
    venueName: 'Villa del Balbianello, Lake Como',
    venueAddress: 'Via Guido Monzino, 1, 22016 Tremezzina CO, Lake Como, Italy',
    venueParkingNote:
      'Private Riva wooden boat transfers and complimentary valet parking available for all guests at Villa del Balbianello.',
    mapEmbedQuery: 'Villa+del+Balbianello+Lake+Como+Italy',
    primaryColor: '#16325B',
    accentColor: '#4A8BDF',
    foilColorStart: '#A6D1F2',
    foilColorEnd: '#CFE8FC',
    petalColor: '#F2C1BA',
    bgColor: '#FAF6F0',
    events: [
      {
        dateLabel: '15 December',
        timeLabel: '2:00 PM',
        title: 'Garden Vows & Ring Ceremony',
        description:
          'Sacred marriage vows beneath the flower-draped stone loggia overlooking the tranquil waters of Lake Como.',
      },
      {
        dateLabel: '15 December',
        timeLabel: '6:00 PM',
        title: 'Candlelit Villa Dinner',
        description:
          'Sumptuous multi-course Italian celebratory feast with vintage wines and our beloved family and friends.',
      },
      {
        dateLabel: '15 December',
        timeLabel: '9:00 PM',
        title: 'Starlight Soirée & Dancing',
        description:
          'Joyous live string quartet, champagne tower toast, and vibrant dancing under the stars.',
      },
    ],
  },
  {
    id: 'napa-valley-rose',
    name: '02 · Napa Valley Vineyard',
    badge: 'California Estate · Blush & Rosewood',
    partnerOne: 'Julian',
    partnerTwo: 'Clara',
    dateRangeLabel: '18 & 19 SEPTEMBER',
    weddingDate: '2026-09-19',
    dayNumber: '19',
    monthShort: 'SEP',
    monthFull: 'September',
    yearNumber: '2026',
    weekdayLabel: 'Saturday',
    ceremonySubtitle: 'Vineyard Vows & Estate Evening',
    archPhotoUrl: ASSETS.ARCH_LAKE_COMO,
    venuePhotoUrl: ASSETS.TABLE_SETTING,
    couplePortraitUrl: ASSETS.COUPLE_USA_NAPA,
    venueKicker: 'PRIVATE VINEYARD LAWN & CELLAR',
    venueName: 'Meadowood Estate, Napa Valley',
    venueAddress: '900 Meadowood Ln, St. Helena, CA 94574, United States',
    venueParkingNote:
      'Spacious estate parking and private chauffeur shuttle service available for all guests across St. Helena.',
    mapEmbedQuery: 'Meadowood+Napa+Valley+St+Helena+CA',
    primaryColor: '#4A202A',
    accentColor: '#B86B77',
    foilColorStart: '#E8BFC3',
    foilColorEnd: '#F7DFE2',
    petalColor: '#EFAFB8',
    bgColor: '#FDF8F6',
    events: [
      {
        dateLabel: '18 September',
        timeLabel: '3:00 PM',
        title: 'Vineyard Ceremony & Vows',
        description:
          'Exchange of vows and rings surrounded by sun-drenched California grapevines and acoustic guitar.',
      },
      {
        dateLabel: '18 September',
        timeLabel: '6:30 PM',
        title: 'Harvest Table Dinner',
        description:
          'Farm-to-table Napa Valley tasting menu beneath ancient olive trees and beeswax tapers.',
      },
      {
        dateLabel: '18 September',
        timeLabel: '9:30 PM',
        title: 'Moonlight Jazz & Cocktails',
        description:
          'Celebratory first dance, artisanal cocktails, and late-night music in the estate courtyard.',
      },
    ],
  },
  {
    id: 'tuscan-cypress-gold',
    name: '03 · Tuscan Cypress Villa',
    badge: 'Siena, Italy · Olive & Champagne',
    partnerOne: 'Julian',
    partnerTwo: 'Clara',
    dateRangeLabel: '24 & 25 OCTOBER',
    weddingDate: '2026-10-25',
    dayNumber: '25',
    monthShort: 'OCT',
    monthFull: 'October',
    yearNumber: '2026',
    weekdayLabel: 'Sunday',
    ceremonySubtitle: 'Cathedral Blessing & Villa Banquet',
    archPhotoUrl: ASSETS.VENUE_VILLA_LAWN,
    venuePhotoUrl: ASSETS.TABLE_SETTING,
    couplePortraitUrl: ASSETS.COUPLE_EUROPEAN_VILLA,
    venueKicker: 'HISTORIC RENAISSANCE GARDENS',
    venueName: 'Villa Cetinale, Siena, Tuscany',
    venueAddress: 'Strada di Cetinale, 9, 53018 Sovicille SI, Tuscany, Italy',
    venueParkingNote:
      'Dedicated guest arrival courtyard and valet service available at the main cypress avenue entrance.',
    mapEmbedQuery: 'Villa+Cetinale+Siena+Tuscany+Italy',
    primaryColor: '#253929',
    accentColor: '#9C8253',
    foilColorStart: '#D5C29A',
    foilColorEnd: '#EFE4CA',
    petalColor: '#E8C5B0',
    bgColor: '#FAF8F3',
    events: [
      {
        dateLabel: '24 October',
        timeLabel: '2:30 PM',
        title: 'Cypress Avenue Vows',
        description:
          'Intimate outdoor marriage ceremony framed by centuries-old Tuscan cypress trees and floral arches.',
      },
      {
        dateLabel: '24 October',
        timeLabel: '6:00 PM',
        title: 'Al Fresco Courtyard Feast',
        description:
          'Traditional Tuscan banquet with handmade pasta, Brunello wines, and heartfelt family toasts.',
      },
      {
        dateLabel: '24 October',
        timeLabel: '9:00 PM',
        title: 'Fireworks & Terrace Dancing',
        description:
          'Sparklers, Italian millefoglie wedding cake cutting, and dancing beneath the Tuscan sky.',
      },
    ],
  },
  {
    id: 'parisian-chateau',
    name: '04 · Parisian Château',
    badge: 'Paris, France · Noir & Pearl',
    partnerOne: 'Julian',
    partnerTwo: 'Clara',
    dateRangeLabel: '14 & 15 NOVEMBER',
    weddingDate: '2026-11-15',
    dayNumber: '15',
    monthShort: 'NOV',
    monthFull: 'November',
    yearNumber: '2026',
    weekdayLabel: 'Sunday',
    ceremonySubtitle: 'Black-Tie Vows & Salon Reception',
    archPhotoUrl: ASSETS.ARCH_LAKE_COMO,
    venuePhotoUrl: ASSETS.HERO_EDITORIAL,
    couplePortraitUrl: ASSETS.COUPLE_USA_NAPA,
    venueKicker: 'GRAND BAROQUE SALON & PARTERRE',
    venueName: 'Château de Vaux-le-Vicomte, Paris',
    venueAddress: 'Allée Maincy, 77950 Maincy, Île-de-France, France',
    venueParkingNote:
      'Private carriage drive arrival and full valet hospitality provided at the Château Honour Courtyard.',
    mapEmbedQuery: 'Chateau+de+Vaux+le+Vicomte+France',
    primaryColor: '#1E1D1B',
    accentColor: '#7A756C',
    foilColorStart: '#C8CFD8',
    foilColorEnd: '#E5E9EF',
    petalColor: '#EBD1CC',
    bgColor: '#F9F7F3',
    events: [
      {
        dateLabel: '14 November',
        timeLabel: '3:00 PM',
        title: 'Chapel Vows & Symphony',
        description:
          'Solemn exchange of wedding vows accompanied by a classical Parisian harp and cello ensemble.',
      },
      {
        dateLabel: '14 November',
        timeLabel: '7:00 PM',
        title: 'Candlelit Grand Salon Dinner',
        description:
          'Black-tie French gastronomic dinner illuminated by crystal chandeliers and a thousand candles.',
      },
      {
        dateLabel: '14 November',
        timeLabel: '10:00 PM',
        title: 'Champagne & Midnight Waltz',
        description:
          'Vintage champagne coupe tower, live orchestra waltz, and garden fireworks display.',
      },
    ],
  },
  {
    id: 'amalfi-coast-sunset',
    name: '05 · Amalfi Cliffside',
    badge: 'Ravello, Italy · Azure & Terracotta',
    partnerOne: 'Julian',
    partnerTwo: 'Clara',
    dateRangeLabel: '21 & 22 AUGUST',
    weddingDate: '2026-08-22',
    dayNumber: '22',
    monthShort: 'AUG',
    monthFull: 'August',
    yearNumber: '2026',
    weekdayLabel: 'Saturday',
    ceremonySubtitle: 'Cliffside Vows & Mediterranean Gala',
    archPhotoUrl: ASSETS.ARCH_LAKE_COMO,
    venuePhotoUrl: ASSETS.VENUE_VILLA_LAWN,
    couplePortraitUrl: ASSETS.COUPLE_EUROPEAN_VILLA,
    venueKicker: 'INFINITY BELVEDERE & OLIVE GARDENS',
    venueName: 'Belmond Hotel Caruso, Ravello',
    venueAddress: 'Piazza San Giovanni del Toro, 2, 84010 Ravello SA, Italy',
    venueParkingNote:
      'Complimentary valet parking and coastal shuttle transfers from Amalfi harbour for all wedding guests.',
    mapEmbedQuery: 'Belmond+Hotel+Caruso+Ravello+Italy',
    primaryColor: '#1B3B5A',
    accentColor: '#C27458',
    foilColorStart: '#E6BCA8',
    foilColorEnd: '#F6DDD0',
    petalColor: '#F2B8B2',
    bgColor: '#FBF7F1',
    events: [
      {
        dateLabel: '21 August',
        timeLabel: '4:00 PM',
        title: 'Belvedere Cliffside Vows',
        description:
          'Sunset exchange of marriage vows high above the sparkling Tyrrhenian Sea in Ravello.',
      },
      {
        dateLabel: '21 August',
        timeLabel: '7:00 PM',
        title: 'Lemon Grove Gala Dinner',
        description:
          'Coastal Mediterranean feast under fragrant Amalfi lemon pergolas with live mandolin music.',
      },
      {
        dateLabel: '21 August',
        timeLabel: '9:30 PM',
        title: 'La Dolce Vita Poolside Party',
        description:
          'Gelato cart, limoncello toasts, and dancing by the cliffside infinity pool.',
      },
    ],
  },
];

export const TEMPLATE_LIBRARY: TemplateDefinition[] = CURATED_CARD_TEMPLATES.map((preset) => ({
  id: preset.id,
  name: preset.name.replace(/^\d+\s*·\s*/, ''),
  style: preset.badge,
  category: 'International Editorial',
  tier: 'free',
  paletteLabel: preset.badge,
  description: `${preset.partnerOne} & ${preset.partnerTwo} — ${preset.venueName}`,
  previewImage: preset.archPhotoUrl,
  motifType: 'arch-minimal',
  sampleCouple: [preset.partnerOne, preset.partnerTwo],
  sampleLocation: preset.venueName,
  defaultTheme: {
    fontHeading: 'Playfair Display',
    fontBody: 'DM Sans',
    primaryColor: preset.primaryColor,
    accentColor: preset.accentColor,
    bgColor: preset.bgColor,
    textColor: preset.primaryColor,
    alignment: 'center',
    spacing: 'airy',
    backgroundStyle: 'arch',
    musicStyle: 'piano-romance',
  },
}));

export const TRANSLATIONS: Record<
  LanguageCode,
  {
    auspiciousHeader: string;
    openInvitation: string;
    togetherWithFamilies: string;
    ourStory: string;
    countdownTitle: string;
    days: string;
    hours: string;
    minutes: string;
    eventsSchedule: string;
    venueAndDirections: string;
    openInMaps: string;
    dressCodeTitle: string;
    galleryTitle: string;
    rsvpTitle: string;
    rsvpSubtitle: string;
    acceptAction: string;
    declineAction: string;
    maybeAction: string;
    registryTitle: string;
    footerBlessing: string;
  }
> = {
  en: {
    auspiciousHeader: 'MARRIAGE CELEBRATION',
    openInvitation: 'Open Wedding Card',
    togetherWithFamilies: 'With the blessings of our beloved families',
    ourStory: 'Our Love Story',
    countdownTitle: 'Countdown to Our Wedding',
    days: 'DAYS',
    hours: 'HOURS',
    minutes: 'MINS',
    eventsSchedule: 'Schedule of Events',
    venueAndDirections: 'Marriage Venue',
    openInMaps: 'OPEN IN GOOGLE MAPS',
    dressCodeTitle: 'Attire & Palette',
    galleryTitle: 'Captured Moments',
    rsvpTitle: 'With Joyful Hearts We Invite You',
    rsvpSubtitle: 'Please share your attendance details so we may prepare a warm welcome.',
    acceptAction: 'Joyfully Accept',
    declineAction: 'Regretfully Decline',
    maybeAction: 'Tentatively Attending',
    registryTitle: 'Warm Wishes & Registry',
    footerBlessing: 'Forever Together',
  },
  hi: {
    auspiciousHeader: 'MARRIAGE CELEBRATION',
    openInvitation: 'Open Wedding Card',
    togetherWithFamilies: 'With the blessings of our beloved families',
    ourStory: 'Our Love Story',
    countdownTitle: 'Countdown to Our Wedding',
    days: 'DAYS',
    hours: 'HOURS',
    minutes: 'MINS',
    eventsSchedule: 'Schedule of Events',
    venueAndDirections: 'Marriage Venue',
    openInMaps: 'OPEN IN GOOGLE MAPS',
    dressCodeTitle: 'Attire & Palette',
    galleryTitle: 'Captured Moments',
    rsvpTitle: 'With Joyful Hearts We Invite You',
    rsvpSubtitle: 'Please share your attendance details so we may prepare a warm welcome.',
    acceptAction: 'Joyfully Accept',
    declineAction: 'Regretfully Decline',
    maybeAction: 'Tentatively Attending',
    registryTitle: 'Warm Wishes & Registry',
    footerBlessing: 'Forever Together',
  },
  gu: {
    auspiciousHeader: 'MARRIAGE CELEBRATION',
    openInvitation: 'Open Wedding Card',
    togetherWithFamilies: 'With the blessings of our beloved families',
    ourStory: 'Our Love Story',
    countdownTitle: 'Countdown to Our Wedding',
    days: 'DAYS',
    hours: 'HOURS',
    minutes: 'MINS',
    eventsSchedule: 'Schedule of Events',
    venueAndDirections: 'Marriage Venue',
    openInMaps: 'OPEN IN GOOGLE MAPS',
    dressCodeTitle: 'Attire & Palette',
    galleryTitle: 'Captured Moments',
    rsvpTitle: 'With Joyful Hearts We Invite You',
    rsvpSubtitle: 'Please share your attendance details so we may prepare a warm welcome.',
    acceptAction: 'Joyfully Accept',
    declineAction: 'Regretfully Decline',
    maybeAction: 'Tentatively Attending',
    registryTitle: 'Warm Wishes & Registry',
    footerBlessing: 'Forever Together',
  },
};

export const DEMO_WEDDING_ID = 'demo-julian-clara';

export const DEMO_WEDDING_PROJECT: WeddingProject = {
  weddingId: DEMO_WEDDING_ID,
  ownerId: 'demo-showcase-owner',
  partnerOne: 'Julian',
  partnerTwo: 'Clara',
  familyOne: 'Mr. & Mrs. Arthur Vance of London',
  familyTwo: 'Mr. & Mrs. Lorenzo Moretti of Milan',
  weddingDate: '2026-12-16',
  timezone: 'Europe/Rome',
  templateId: 'lake-como-azure',
  slug: 'julian-and-clara',
  status: 'published',
  isPrivate: false,
  accessPasscode: '',
  language: 'en',
  headline: 'are getting married!',
  invitationWording:
    'With the divine blessings of God and our beloved elders, we, Julian & Clara, warmly invite you and your family to join us as we celebrate our holy marriage union. Your gracious presence, love, and heartfelt blessings will make our special days on 15 & 16 December truly complete and auspicious.',
  story:
    'We cordially invite you to join us on this most sacred day as Julian & Clara exchange their vows and embark on their lifelong journey of love and togetherness.',
  coverPhotoUrl: ASSETS.ARCH_LAKE_COMO,
  couplePhotoUrl: ASSETS.COUPLE_EUROPEAN_VILLA,
  venueSummary: 'Villa del Balbianello, Lake Como',
  cityCountry: 'Via Guido Monzino, 1, 22016 Tremezzina CO, Lake Como, Italy',
  mapLink: 'https://maps.google.com/?q=Villa+del+Balbianello+Lake+Como+Italy',
  dressCodeNote:
    'Private Riva wooden boat transfers and complimentary valet parking available for all guests at Villa del Balbianello.',
  rsvpDeadline: '2026-11-25',
  registryNote:
    'Your presence across the miles is the greatest blessing we could ask for.',
  registryUrl: '',
  contactInfo: 'Cordially invited with warm love & regards by Julian & Clara’s Family',
  themeConfig: {
    fontHeading: 'Playfair Display',
    fontBody: 'DM Sans',
    primaryColor: '#16325B',
    accentColor: '#4A8BDF',
    bgColor: '#FAF6F0',
    textColor: '#16325B',
    alignment: 'center',
    spacing: 'airy',
    backgroundStyle: 'arch',
    musicStyle: 'piano-romance',
  },
  sectionSettings: {
    showStory: true,
    showCountdown: true,
    showEvents: true,
    showVenue: true,
    showGallery: true,
    showDressCode: true,
    showRsvp: true,
    showRegistry: false,
    enablePlusOnes: true,
    enableMealPreference: true,
  },
  viewsCount: 642,
  isDemo: true,
};

export const DEMO_WEDDING_EVENTS: WeddingEventItem[] = [
  {
    eventId: 'demo-evt-1',
    weddingId: DEMO_WEDDING_ID,
    ownerId: 'demo-showcase-owner',
    isPublic: true,
    name: 'Garden Vows & Ring Ceremony',
    description:
      'Sacred marriage rituals, exchange of vows, and auspicious blessings beneath the Lake Como stone loggia as we tie the knot.',
    date: '2026-12-15',
    startTime: '2:00 PM',
    endTime: '5:00 PM',
    venue: 'Villa del Balbianello Loggia',
    address: 'Via Guido Monzino, 1, 22016 Tremezzina CO, Lake Como, Italy',
    mapUrl: 'https://maps.google.com/?q=Villa+del+Balbianello+Lake+Como+Italy',
    dressCode: 'Garden Formal',
    sortOrder: 0,
  },
  {
    eventId: 'demo-evt-2',
    weddingId: DEMO_WEDDING_ID,
    ownerId: 'demo-showcase-owner',
    isPublic: true,
    name: 'Candlelit Villa Dinner',
    description:
      'Sumptuous multi-course celebratory feast with vintage Italian wines and our beloved family and friends.',
    date: '2026-12-15',
    startTime: '6:00 PM',
    endTime: '9:00 PM',
    venue: 'The Lakefront Terrace',
    address: 'Via Guido Monzino, 1, 22016 Tremezzina CO, Lake Como, Italy',
    mapUrl: 'https://maps.google.com/?q=Villa+del+Balbianello+Lake+Como+Italy',
    dressCode: 'Black Tie Optional',
    sortOrder: 1,
  },
  {
    eventId: 'demo-evt-3',
    weddingId: DEMO_WEDDING_ID,
    ownerId: 'demo-showcase-owner',
    isPublic: true,
    name: 'Starlight Soirée & Dancing',
    description:
      'Joyous live music, champagne tower toast, and vibrant celebration dancing under the stars.',
    date: '2026-12-15',
    startTime: '9:00 PM',
    endTime: '11:55 PM',
    venue: 'Villa Grand Pavilion',
    address: 'Via Guido Monzino, 1, 22016 Tremezzina CO, Lake Como, Italy',
    mapUrl: 'https://maps.google.com/?q=Villa+del+Balbianello+Lake+Como+Italy',
    dressCode: 'Evening Couture',
    sortOrder: 2,
  },
];

export const DEMO_GUESTS: GuestRecord[] = [
  {
    guestId: 'demo-guest-1',
    weddingId: DEMO_WEDDING_ID,
    ownerId: 'demo-showcase-owner',
    name: 'Elena & Marcus Sterling',
    contact: 'elena.sterling@example.co.uk',
    inviteCode: 'VOW-JC-101',
    rsvpStatus: 'accepted',
    attendingCount: 2,
    mealPreference: 'Mediterranean Tasting Menu',
    dietaryNotes: 'Gluten-free bread preferred',
    selectedEvents: [
      'Garden Vows & Ring Ceremony',
      'Candlelit Villa Dinner',
      'Starlight Soirée & Dancing',
    ],
    checkedIn: true,
  },
  {
    guestId: 'demo-guest-2',
    weddingId: DEMO_WEDDING_ID,
    ownerId: 'demo-showcase-owner',
    name: 'Harrison & Claire Beaumont',
    contact: 'harrison.b@example.com',
    inviteCode: 'VOW-JC-102',
    rsvpStatus: 'accepted',
    attendingCount: 2,
    mealPreference: 'Vegetarian Gourmet',
    dietaryNotes: '',
    selectedEvents: ['Candlelit Villa Dinner', 'Starlight Soirée & Dancing'],
    checkedIn: false,
  },
];

export const DEMO_RSVPS: RsvpRecord[] = [
  {
    rsvpId: 'demo-rsvp-1',
    weddingId: DEMO_WEDDING_ID,
    weddingOwnerId: 'demo-showcase-owner',
    guestName: 'Elena & Marcus Sterling',
    contact: 'elena.sterling@example.co.uk',
    response: 'accepted',
    attendingCount: 2,
    selectedEvents: [
      'Garden Vows & Ring Ceremony',
      'Candlelit Villa Dinner',
      'Starlight Soirée & Dancing',
    ],
    mealPreference: 'Mediterranean Tasting Menu',
    dietaryNotes: 'Gluten-free bread preferred',
    message: 'Counting down the days to Lake Como! So thrilled for both of you.',
    inviteCode: 'VOW-JC-101',
  },
];
