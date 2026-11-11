export type LanguageCode = 'en' | 'hi' | 'gu';

export type SubscriptionPlan = 'free' | 'premium';

export type WeddingStatus = 'draft' | 'published';

export type RsvpStatus = 'pending' | 'accepted' | 'declined' | 'maybe';

export interface ThemeConfig {
  fontHeading: string;
  fontBody: string;
  primaryColor: string;
  accentColor: string;
  bgColor: string;
  textColor: string;
  alignment: 'center' | 'left';
  spacing: 'compact' | 'balanced' | 'airy';
  backgroundStyle: 'paper' | 'arch' | 'botanical' | 'palace' | 'minimal' | 'editorial';
  musicStyle: 'none' | 'sitar-ambient' | 'piano-romance' | 'strings-serenade';
}

export interface SectionSettings {
  showStory: boolean;
  showCountdown: boolean;
  showEvents: boolean;
  showVenue: boolean;
  showGallery: boolean;
  showDressCode: boolean;
  showRsvp: boolean;
  showRegistry: boolean;
  enablePlusOnes: boolean;
  enableMealPreference: boolean;
}

export interface WeddingEventItem {
  eventId: string;
  weddingId: string;
  ownerId: string;
  isPublic: boolean;
  name: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  address: string;
  mapUrl: string;
  dressCode: string;
  sortOrder: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface GuestRecord {
  guestId: string;
  weddingId: string;
  ownerId: string;
  name: string;
  contact: string;
  inviteCode: string;
  rsvpStatus: RsvpStatus;
  attendingCount: number;
  mealPreference: string;
  dietaryNotes: string;
  selectedEvents: string[];
  checkedIn: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface RsvpRecord {
  rsvpId: string;
  weddingId: string;
  weddingOwnerId: string;
  guestName: string;
  contact: string;
  response: 'accepted' | 'declined' | 'maybe';
  attendingCount: number;
  selectedEvents: string[];
  mealPreference: string;
  dietaryNotes: string;
  message: string;
  inviteCode: string;
  submittedAt?: unknown;
}

export interface WeddingProject {
  weddingId: string;
  ownerId: string;
  partnerOne: string;
  partnerTwo: string;
  familyOne: string;
  familyTwo: string;
  weddingDate: string;
  timezone: string;
  templateId: string;
  slug: string;
  status: WeddingStatus;
  isPrivate: boolean;
  accessPasscode: string;
  language: LanguageCode;
  headline: string;
  invitationWording: string;
  story: string;
  coverPhotoUrl: string;
  couplePhotoUrl: string;
  venueSummary: string;
  cityCountry: string;
  mapLink: string;
  dressCodeNote: string;
  rsvpDeadline: string;
  registryNote: string;
  registryUrl: string;
  contactInfo: string;
  themeConfig: ThemeConfig;
  sectionSettings: SectionSettings;
  viewsCount: number;
  isDemo?: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  subscriptionPlan: SubscriptionPlan;
  favoriteTemplates: string[];
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  style: string;
  category: 'Indian Heritage' | 'International Editorial' | 'Botanical & Floral' | 'Destination';
  tier: 'free' | 'premium';
  paletteLabel: string;
  description: string;
  previewImage: string;
  motifType: 'arch-minimal' | 'palace-jharokha' | 'botanical-crest' | 'floral-frame' | 'monochrome-editorial' | 'coastal-horizon' | 'festive-mandala' | 'pastel-watercolor';
  defaultTheme: ThemeConfig;
  sampleCouple: [string, string];
  sampleLocation: string;
}
