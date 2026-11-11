import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import {
  auth,
  db,
  signInWithGoogle,
  signOutUser,
  handleFirestoreError,
  OperationType,
} from '../firebase';
import {
  UserProfile,
  WeddingProject,
  WeddingEventItem,
  GuestRecord,
  RsvpRecord,
  SubscriptionPlan,
} from '../types/vowora';
import {
  DEMO_WEDDING_PROJECT,
  DEMO_WEDDING_EVENTS,
  DEMO_GUESTS,
  DEMO_RSVPS,
  DEMO_WEDDING_ID,
  TEMPLATE_LIBRARY,
} from '../data/templatesAndDemo';

interface VoworaContextValue {
  user: User | null;
  userProfile: UserProfile | null;
  isAuthReady: boolean;
  authError: string | null;
  weddings: WeddingProject[];
  eventsByWedding: Record<string, WeddingEventItem[]>;
  guestsByWedding: Record<string, GuestRecord[]>;
  rsvpsByWedding: Record<string, RsvpRecord[]>;
  favoriteTemplates: string[];
  activeDraft: WeddingProject | null;
  activeDraftEvents: WeddingEventItem[];
  setActiveDraft: React.Dispatch<React.SetStateAction<WeddingProject | null>>;
  setActiveDraftEvents: React.Dispatch<React.SetStateAction<WeddingEventItem[]>>;
  signIn: () => Promise<void>;
  logOut: () => Promise<void>;
  toggleFavoriteTemplate: (templateId: string) => Promise<void>;
  updateSubscriptionPlan: (plan: SubscriptionPlan) => Promise<void>;
  createBlankProject: (templateId?: string) => { project: WeddingProject; events: WeddingEventItem[] };
  saveWeddingProject: (
    project: WeddingProject,
    events: WeddingEventItem[],
    publishNow?: boolean
  ) => Promise<WeddingProject>;
  duplicateWeddingProject: (weddingId: string) => Promise<WeddingProject | null>;
  deleteWeddingProject: (weddingId: string) => Promise<void>;
  loadWeddingDetails: (weddingId: string) => Promise<{
    project: WeddingProject | null;
    events: WeddingEventItem[];
    guests: GuestRecord[];
    rsvps: RsvpRecord[];
  }>;
  loadPublicWeddingBySlug: (slug: string) => Promise<{
    project: WeddingProject | null;
    events: WeddingEventItem[];
  }>;
  addOrUpdateGuest: (weddingId: string, guest: GuestRecord) => Promise<void>;
  removeGuest: (weddingId: string, guestId: string) => Promise<void>;
  toggleGuestCheckIn: (weddingId: string, guestId: string, checkedIn: boolean) => Promise<void>;
  submitPublicRsvp: (
    wedding: WeddingProject,
    input: {
      guestName: string;
      contact: string;
      response: 'accepted' | 'declined' | 'maybe';
      attendingCount: number;
      selectedEvents: string[];
      mealPreference: string;
      dietaryNotes: string;
      message: string;
    }
  ) => Promise<RsvpRecord>;
}

const VoworaContext = createContext<VoworaContextValue | undefined>(undefined);

const LOCAL_WEDDINGS_KEY = 'vowora_local_weddings_v1';
const LOCAL_EVENTS_KEY = 'vowora_local_events_v1';
const LOCAL_GUESTS_KEY = 'vowora_local_guests_v1';
const LOCAL_RSVPS_KEY = 'vowora_local_rsvps_v1';
const LOCAL_FAVORITES_KEY = 'vowora_local_favs_v1';

function sanitizeId(raw: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 120);
  return cleaned || `vow-${Date.now()}`;
}

function sanitizeSlug(raw: string): string {
  const cleaned = raw
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 96);
  return cleaned.length >= 2 ? cleaned : `wedding-${Date.now().toString().slice(-5)}`;
}

function clampStr(val: string | undefined, max: number, fallback = ''): string {
  const str = (val ?? fallback).trim();
  return str.slice(0, max);
}

export const VoworaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [cloudWeddings, setCloudWeddings] = useState<WeddingProject[]>([]);
  const [localWeddings, setLocalWeddings] = useState<WeddingProject[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_WEDDINGS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [eventsByWedding, setEventsByWedding] = useState<Record<string, WeddingEventItem[]>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_EVENTS_KEY);
      const parsed = saved ? JSON.parse(saved) : {};
      return { [DEMO_WEDDING_ID]: DEMO_WEDDING_EVENTS, ...parsed };
    } catch {
      return { [DEMO_WEDDING_ID]: DEMO_WEDDING_EVENTS };
    }
  });

  const [guestsByWedding, setGuestsByWedding] = useState<Record<string, GuestRecord[]>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_GUESTS_KEY);
      const parsed = saved ? JSON.parse(saved) : {};
      return { [DEMO_WEDDING_ID]: DEMO_GUESTS, ...parsed };
    } catch {
      return { [DEMO_WEDDING_ID]: DEMO_GUESTS };
    }
  });

  const [rsvpsByWedding, setRsvpsByWedding] = useState<Record<string, RsvpRecord[]>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_RSVPS_KEY);
      const parsed = saved ? JSON.parse(saved) : {};
      return { [DEMO_WEDDING_ID]: DEMO_RSVPS, ...parsed };
    } catch {
      return { [DEMO_WEDDING_ID]: DEMO_RSVPS };
    }
  });

  const [favoriteTemplates, setFavoriteTemplates] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_FAVORITES_KEY);
      return saved ? JSON.parse(saved) : ['modern-ivory', 'royal-indian'];
    } catch {
      return ['modern-ivory', 'royal-indian'];
    }
  });

  const [activeDraft, setActiveDraft] = useState<WeddingProject | null>(null);
  const [activeDraftEvents, setActiveDraftEvents] = useState<WeddingEventItem[]>([]);

  // Persist local state fallback
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_WEDDINGS_KEY, JSON.stringify(localWeddings));
    } catch {
      // ignore storage quota errors
    }
  }, [localWeddings]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(eventsByWedding));
    } catch {
      // ignore
    }
  }, [eventsByWedding]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_GUESTS_KEY, JSON.stringify(guestsByWedding));
    } catch {
      // ignore
    }
  }, [guestsByWedding]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_RSVPS_KEY, JSON.stringify(rsvpsByWedding));
    } catch {
      // ignore
    }
  }, [rsvpsByWedding]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthError(null);
      if (currentUser) {
        const userDocPath = `users/${currentUser.uid}`;
        const userRef = doc(db, 'users', currentUser.uid);
        try {
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            const data = snap.data() as UserProfile;
            setUserProfile(data);
            if (Array.isArray(data.favoriteTemplates)) {
              setFavoriteTemplates(data.favoriteTemplates);
            }
          } else {
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              displayName: clampStr(
                currentUser.displayName || currentUser.email?.split('@')[0] || 'Vowora Couple',
                120,
                'Vowora Couple'
              ),
              email: clampStr(currentUser.email || 'couple@example.com', 254, 'couple@example.com'),
              subscriptionPlan: 'free',
              favoriteTemplates: favoriteTemplates.slice(0, 20),
            };
            await setDoc(userRef, {
              ...newProfile,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            setUserProfile(newProfile);
          }
        } catch (error) {
          console.error('Error initializing user profile:', error);
          handleFirestoreError(error, OperationType.GET, userDocPath);
        }
      } else {
        setUserProfile(null);
        setCloudWeddings([]);
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to user's cloud weddings when authenticated
  useEffect(() => {
    if (!isAuthReady || !user) return;

    const weddingsQuery = query(collection(db, 'weddings'), where('ownerId', '==', user.uid));
    const unsubscribe = onSnapshot(
      weddingsQuery,
      (snapshot) => {
        const list: WeddingProject[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as WeddingProject);
        });
        setCloudWeddings(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'weddings');
      }
    );

    return () => unsubscribe();
  }, [isAuthReady, user]);

  const signIn = async () => {
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unable to sign in with Google.';
      setAuthError(msg);
      throw error;
    }
  };

  const logOut = async () => {
    await signOutUser();
  };

  const toggleFavoriteTemplate = async (templateId: string) => {
    const exists = favoriteTemplates.includes(templateId);
    const updated = exists
      ? favoriteTemplates.filter((id) => id !== templateId)
      : [...favoriteTemplates, templateId].slice(0, 20);
    setFavoriteTemplates(updated);
    localStorage.setItem(LOCAL_FAVORITES_KEY, JSON.stringify(updated));

    if (user && userProfile) {
      const userRef = doc(db, 'users', user.uid);
      try {
        await updateDoc(userRef, {
          displayName: clampStr(userProfile.displayName, 120, 'Vowora Couple'),
          favoriteTemplates: updated,
          updatedAt: serverTimestamp(),
        });
        setUserProfile({ ...userProfile, favoriteTemplates: updated });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      }
    }
  };

  const updateSubscriptionPlan = async (plan: SubscriptionPlan) => {
    if (user && userProfile) {
      const userRef = doc(db, 'users', user.uid);
      try {
        await updateDoc(userRef, {
          subscriptionPlan: plan,
          updatedAt: serverTimestamp(),
        });
        setUserProfile({ ...userProfile, subscriptionPlan: plan });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      }
    } else {
      setUserProfile((prev) =>
        prev
          ? { ...prev, subscriptionPlan: plan }
          : {
              uid: 'local-user',
              displayName: 'Guest Creator',
              email: 'guest@vowora.studio',
              subscriptionPlan: plan,
              favoriteTemplates,
            }
      );
    }
  };

  const createBlankProject = useCallback(
    (templateId = 'modern-ivory'): { project: WeddingProject; events: WeddingEventItem[] } => {
      const tpl = TEMPLATE_LIBRARY.find((t) => t.id === templateId) || TEMPLATE_LIBRARY[0];
      const weddingId = sanitizeId(`wed-${Date.now()}`);
      const ownerId = user?.uid || 'local-draft-owner';
      const defaultDate = '2027-04-18';

      const project: WeddingProject = {
        weddingId,
        ownerId,
        partnerOne: tpl.sampleCouple[0],
        partnerTwo: tpl.sampleCouple[1],
        familyOne: 'Together with our beloved parents & elders',
        familyTwo: 'We warmly invite you to share in our joy',
        weddingDate: defaultDate,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
        templateId: tpl.id,
        slug: sanitizeSlug(
          `${tpl.sampleCouple[0]}-and-${tpl.sampleCouple[1]}-${Date.now().toString().slice(-4)}`
        ),
        status: 'draft',
        isPrivate: false,
        accessPasscode: '',
        language: 'en',
        headline: 'Every Love Story Deserves a Beautiful Beginning',
        invitationWording:
          'With joyful hearts and the blessings of our families, we invite you to celebrate our wedding ceremonies and the beginning of our marriage.',
        story:
          'From a chance meeting to years of shared laughter, travel, and quiet devotion, our journey has brought us to this moment. We cannot wait to celebrate surrounded by everyone we love.',
        coverPhotoUrl: tpl.previewImage,
        couplePhotoUrl: DEMO_WEDDING_PROJECT.couplePhotoUrl,
        venueSummary: tpl.sampleLocation.split('·')[0].trim(),
        cityCountry: tpl.sampleLocation,
        mapLink: 'https://maps.google.com/?q=' + encodeURIComponent(tpl.sampleLocation),
        dressCodeNote: 'Formal Heritage or Black Tie Optional in warm ivory, champagne, and earth tones.',
        rsvpDeadline: '2027-03-25',
        registryNote: 'Your presence and blessings are our greatest gift.',
        registryUrl: '',
        contactInfo: 'Wedding Hospitality Concierge • rsvp@vowora.studio',
        themeConfig: { ...tpl.defaultTheme },
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
        viewsCount: 1,
      };

      const events: WeddingEventItem[] = [
        {
          eventId: sanitizeId(`evt-${Date.now()}-1`),
          weddingId,
          ownerId,
          isPublic: true,
          name: 'Welcome Dinner & Sangeet',
          description: 'An evening of music, cocktails, and warm introductions under the lanterns.',
          date: '2027-04-17',
          startTime: '19:00',
          endTime: '23:00',
          venue: 'The Courtyard Pavilion',
          address: tpl.sampleLocation,
          mapUrl: 'https://maps.google.com/?q=' + encodeURIComponent(tpl.sampleLocation),
          dressCode: 'Festive Couture or Cocktail Attire',
          sortOrder: 0,
        },
        {
          eventId: sanitizeId(`evt-${Date.now()}-2`),
          weddingId,
          ownerId,
          isPublic: true,
          name: 'The Wedding Ceremony',
          description: 'Sacred vows followed by sunsetaperitifs and family blessings.',
          date: defaultDate,
          startTime: '16:30',
          endTime: '20:00',
          venue: tpl.sampleLocation.split('·')[0].trim(),
          address: tpl.sampleLocation,
          mapUrl: 'https://maps.google.com/?q=' + encodeURIComponent(tpl.sampleLocation),
          dressCode: 'Traditional Heritage or Garden Formal',
          sortOrder: 1,
        },
        {
          eventId: sanitizeId(`evt-${Date.now()}-3`),
          weddingId,
          ownerId,
          isPublic: true,
          name: 'Candlelit Reception',
          description: 'Dinner, toasts, and dancing into the night.',
          date: defaultDate,
          startTime: '20:30',
          endTime: '23:55',
          venue: 'The Grand Conservatory',
          address: tpl.sampleLocation,
          mapUrl: 'https://maps.google.com/?q=' + encodeURIComponent(tpl.sampleLocation),
          dressCode: 'Black Tie Optional',
          sortOrder: 2,
        },
      ];

      return { project, events };
    },
    [user]
  );

  const saveWeddingProject = async (
    rawProject: WeddingProject,
    rawEvents: WeddingEventItem[],
    publishNow?: boolean
  ): Promise<WeddingProject> => {
    const weddingId = sanitizeId(rawProject.weddingId);
    const ownerId = user?.uid || rawProject.ownerId || 'local-draft-owner';
    const nextStatus = publishNow ? 'published' : rawProject.status;

    const sanitizedProject: WeddingProject = {
      weddingId,
      ownerId,
      partnerOne: clampStr(rawProject.partnerOne, 100, 'Partner One'),
      partnerTwo: clampStr(rawProject.partnerTwo, 100, 'Partner Two'),
      familyOne: clampStr(rawProject.familyOne, 250, ''),
      familyTwo: clampStr(rawProject.familyTwo, 250, ''),
      weddingDate: clampStr(rawProject.weddingDate, 40, '2027-04-18'),
      timezone: clampStr(rawProject.timezone, 80, 'Asia/Kolkata'),
      templateId: clampStr(rawProject.templateId, 64, 'modern-ivory'),
      slug: sanitizeSlug(rawProject.slug || `${rawProject.partnerOne}-${rawProject.partnerTwo}`),
      status: nextStatus === 'published' ? 'published' : 'draft',
      isPrivate: Boolean(rawProject.isPrivate),
      accessPasscode: clampStr(rawProject.accessPasscode, 64, ''),
      language:
        rawProject.language === 'hi' || rawProject.language === 'gu' ? rawProject.language : 'en',
      headline: clampStr(rawProject.headline, 300, ''),
      invitationWording: clampStr(rawProject.invitationWording, 1500, ''),
      story: clampStr(rawProject.story, 3000, ''),
      coverPhotoUrl: clampStr(rawProject.coverPhotoUrl, 2000, ''),
      couplePhotoUrl: clampStr(rawProject.couplePhotoUrl, 2000, ''),
      venueSummary: clampStr(rawProject.venueSummary, 300, ''),
      cityCountry: clampStr(rawProject.cityCountry, 160, ''),
      mapLink: clampStr(rawProject.mapLink, 1000, ''),
      dressCodeNote: clampStr(rawProject.dressCodeNote, 500, ''),
      rsvpDeadline: clampStr(rawProject.rsvpDeadline, 40, ''),
      registryNote: clampStr(rawProject.registryNote, 800, ''),
      registryUrl: clampStr(rawProject.registryUrl, 1000, ''),
      contactInfo: clampStr(rawProject.contactInfo, 300, ''),
      themeConfig: {
        fontHeading: clampStr(rawProject.themeConfig?.fontHeading, 80, 'Cormorant Garamond'),
        fontBody: clampStr(rawProject.themeConfig?.fontBody, 80, 'DM Sans'),
        primaryColor: clampStr(rawProject.themeConfig?.primaryColor, 30, '#292720'),
        accentColor: clampStr(rawProject.themeConfig?.accentColor, 30, '#B99A6A'),
        bgColor: clampStr(rawProject.themeConfig?.bgColor, 30, '#FAF8F4'),
        textColor: clampStr(rawProject.themeConfig?.textColor, 30, '#292720'),
        alignment: rawProject.themeConfig?.alignment === 'left' ? 'left' : 'center',
        spacing:
          rawProject.themeConfig?.spacing === 'compact' ||
          rawProject.themeConfig?.spacing === 'balanced'
            ? rawProject.themeConfig.spacing
            : 'airy',
        backgroundStyle: rawProject.themeConfig?.backgroundStyle || 'paper',
        musicStyle: rawProject.themeConfig?.musicStyle || 'piano-romance',
      },
      sectionSettings: {
        showStory: Boolean(rawProject.sectionSettings?.showStory),
        showCountdown: Boolean(rawProject.sectionSettings?.showCountdown),
        showEvents: Boolean(rawProject.sectionSettings?.showEvents),
        showVenue: Boolean(rawProject.sectionSettings?.showVenue),
        showGallery: Boolean(rawProject.sectionSettings?.showGallery),
        showDressCode: Boolean(rawProject.sectionSettings?.showDressCode),
        showRsvp: Boolean(rawProject.sectionSettings?.showRsvp),
        showRegistry: Boolean(rawProject.sectionSettings?.showRegistry),
        enablePlusOnes: Boolean(rawProject.sectionSettings?.enablePlusOnes),
        enableMealPreference: Boolean(rawProject.sectionSettings?.enableMealPreference),
      },
      viewsCount: Math.max(0, Number(rawProject.viewsCount) || 0),
    };

    const sanitizedEvents: WeddingEventItem[] = rawEvents.map((evt, idx) => ({
      eventId: sanitizeId(evt.eventId || `evt-${weddingId}-${idx}`),
      weddingId,
      ownerId,
      isPublic: sanitizedProject.status === 'published' && !sanitizedProject.isPrivate,
      name: clampStr(evt.name, 120, 'Wedding Celebration'),
      description: clampStr(evt.description, 1000, ''),
      date: clampStr(evt.date || sanitizedProject.weddingDate, 40, '2027-04-18'),
      startTime: clampStr(evt.startTime, 20, '18:00'),
      endTime: clampStr(evt.endTime, 20, '22:00'),
      venue: clampStr(evt.venue || sanitizedProject.venueSummary || 'Main Venue', 200, 'Main Venue'),
      address: clampStr(evt.address || sanitizedProject.cityCountry, 300, ''),
      mapUrl: clampStr(evt.mapUrl || sanitizedProject.mapLink, 1000, ''),
      dressCode: clampStr(evt.dressCode, 150, ''),
      sortOrder: idx,
    }));

    // Update local state immediately
    setEventsByWedding((prev) => ({ ...prev, [weddingId]: sanitizedEvents }));
    setLocalWeddings((prev) => {
      const filtered = prev.filter((w) => w.weddingId !== weddingId);
      return [sanitizedProject, ...filtered];
    });

    // Persist to Firestore if user is authenticated and not editing the read-only demo ID directly
    if (user && weddingId !== DEMO_WEDDING_ID) {
      const weddingRef = doc(db, 'weddings', weddingId);
      try {
        const existingSnap = await getDoc(weddingRef);
        if (existingSnap.exists()) {
          const existingData = existingSnap.data();
          await setDoc(weddingRef, {
            ...sanitizedProject,
            createdAt: existingData.createdAt || serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } else {
          await setDoc(weddingRef, {
            ...sanitizedProject,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }

        // Sync events subcollection
        for (const evt of sanitizedEvents) {
          const evtRef = doc(db, 'weddings', weddingId, 'events', evt.eventId);
          const evtSnap = await getDoc(evtRef);
          if (evtSnap.exists()) {
            await setDoc(evtRef, {
              ...evt,
              createdAt: evtSnap.data().createdAt || serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          } else {
            await setDoc(evtRef, {
              ...evt,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `weddings/${weddingId}`);
      }
    }

    return sanitizedProject;
  };

  const duplicateWeddingProject = async (weddingId: string): Promise<WeddingProject | null> => {
    const details = await loadWeddingDetails(weddingId);
    if (!details.project) return null;

    const newId = sanitizeId(`wed-${Date.now()}`);
    const ownerId = user?.uid || 'local-draft-owner';
    const clonedProject: WeddingProject = {
      ...details.project,
      weddingId: newId,
      ownerId,
      partnerOne: details.project.partnerOne,
      partnerTwo: details.project.partnerTwo,
      slug: sanitizeSlug(`${details.project.slug}-copy-${Date.now().toString().slice(-3)}`),
      status: 'draft',
      isDemo: false,
      viewsCount: 0,
    };

    const clonedEvents: WeddingEventItem[] = details.events.map((e, i) => ({
      ...e,
      eventId: sanitizeId(`evt-${Date.now()}-${i}`),
      weddingId: newId,
      ownerId,
    }));

    return saveWeddingProject(clonedProject, clonedEvents, false);
  };

  const deleteWeddingProject = async (weddingId: string) => {
    if (weddingId === DEMO_WEDDING_ID) return;

    setLocalWeddings((prev) => prev.filter((w) => w.weddingId !== weddingId));
    if (user) {
      try {
        // Delete subcollections first
        const evtsSnap = await getDocs(collection(db, 'weddings', weddingId, 'events'));
        for (const d of evtsSnap.docs) {
          await deleteDoc(d.ref);
        }
        const guestsSnap = await getDocs(collection(db, 'weddings', weddingId, 'guests'));
        for (const d of guestsSnap.docs) {
          await deleteDoc(d.ref);
        }
        await deleteDoc(doc(db, 'weddings', weddingId));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `weddings/${weddingId}`);
      }
    }
  };

  const allWeddings = React.useMemo(() => {
    const map = new Map<string, WeddingProject>();
    // Always include the clearly labeled Demo Project so the showcase works out of the box
    map.set(DEMO_WEDDING_ID, DEMO_WEDDING_PROJECT);
    for (const lw of localWeddings) {
      map.set(lw.weddingId, lw);
    }
    for (const cw of cloudWeddings) {
      map.set(cw.weddingId, cw);
    }
    return Array.from(map.values());
  }, [localWeddings, cloudWeddings]);

  const loadWeddingDetails = useCallback(
    async (weddingId: string) => {
      if (weddingId === DEMO_WEDDING_ID) {
        return {
          project: DEMO_WEDDING_PROJECT,
          events: eventsByWedding[DEMO_WEDDING_ID] || DEMO_WEDDING_EVENTS,
          guests: guestsByWedding[DEMO_WEDDING_ID] || DEMO_GUESTS,
          rsvps: rsvpsByWedding[DEMO_WEDDING_ID] || DEMO_RSVPS,
        };
      }

      let project = allWeddings.find((w) => w.weddingId === weddingId) || null;
      let events = eventsByWedding[weddingId] || [];
      let guests = guestsByWedding[weddingId] || [];
      let rsvps = rsvpsByWedding[weddingId] || [];

      if (user) {
        try {
          const wedSnap = await getDoc(doc(db, 'weddings', weddingId));
          if (wedSnap.exists()) {
            project = wedSnap.data() as WeddingProject;
          }
          if (project && project.ownerId === user.uid) {
            const evtsQ = query(
              collection(db, 'weddings', weddingId, 'events'),
              where('ownerId', '==', user.uid)
            );
            const evtsSnap = await getDocs(evtsQ);
            if (!evtsSnap.empty) {
              events = evtsSnap.docs
                .map((d) => d.data() as WeddingEventItem)
                .sort((a, b) => a.sortOrder - b.sortOrder);
              setEventsByWedding((prev) => ({ ...prev, [weddingId]: events }));
            }

            const guestsQ = query(
              collection(db, 'weddings', weddingId, 'guests'),
              where('ownerId', '==', user.uid)
            );
            const guestsSnap = await getDocs(guestsQ);
            if (!guestsSnap.empty) {
              guests = guestsSnap.docs.map((d) => d.data() as GuestRecord);
              setGuestsByWedding((prev) => ({ ...prev, [weddingId]: guests }));
            }

            const rsvpsQ = query(
              collection(db, 'weddings', weddingId, 'rsvps'),
              where('weddingOwnerId', '==', user.uid)
            );
            const rsvpsSnap = await getDocs(rsvpsQ);
            if (!rsvpsSnap.empty) {
              rsvps = rsvpsSnap.docs.map((d) => d.data() as RsvpRecord);
              setRsvpsByWedding((prev) => ({ ...prev, [weddingId]: rsvps }));
            }
          }
        } catch (error) {
          console.error('Error loading cloud wedding details:', error);
        }
      }

      return { project, events, guests, rsvps };
    },
    [allWeddings, eventsByWedding, guestsByWedding, rsvpsByWedding, user]
  );

  const loadPublicWeddingBySlug = useCallback(
    async (slug: string) => {
      const normalized = slug.trim().toLowerCase();
      if (
        normalized === 'julian-and-clara' ||
        normalized === 'aarav-and-meera' ||
        normalized === DEMO_WEDDING_ID
      ) {
        return {
          project: DEMO_WEDDING_PROJECT,
          events: eventsByWedding[DEMO_WEDDING_ID] || DEMO_WEDDING_EVENTS,
        };
      }

      const localMatch = allWeddings.find((w) => w.slug.toLowerCase() === normalized);
      if (localMatch) {
        return {
          project: localMatch,
          events: eventsByWedding[localMatch.weddingId] || [],
        };
      }

      try {
        const q = query(
          collection(db, 'weddings'),
          where('slug', '==', normalized),
          where('status', '==', 'published'),
          where('isPrivate', '==', false)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const found = snap.docs[0].data() as WeddingProject;
          const evtsQ = query(
            collection(db, 'weddings', found.weddingId, 'events'),
            where('isPublic', '==', true)
          );
          const evtsSnap = await getDocs(evtsQ);
          const evts = evtsSnap.docs
            .map((d) => d.data() as WeddingEventItem)
            .sort((a, b) => a.sortOrder - b.sortOrder);
          return { project: found, events: evts };
        }
      } catch (error) {
        console.error('Error querying public wedding by slug:', error);
      }

      return { project: null, events: [] };
    },
    [allWeddings, eventsByWedding]
  );

  const addOrUpdateGuest = async (weddingId: string, rawGuest: GuestRecord) => {
    const guestId = sanitizeId(rawGuest.guestId || `guest-${Date.now()}`);
    const ownerId = user?.uid || rawGuest.ownerId || 'local-draft-owner';
    const inviteCode = sanitizeId(
      rawGuest.inviteCode || `VOW-${Date.now().toString().slice(-5)}`
    ).toUpperCase();

    const sanitizedGuest: GuestRecord = {
      guestId,
      weddingId: sanitizeId(weddingId),
      ownerId,
      name: clampStr(rawGuest.name, 120, 'Honored Guest'),
      contact: clampStr(rawGuest.contact, 200, ''),
      inviteCode,
      rsvpStatus:
        rawGuest.rsvpStatus === 'accepted' ||
        rawGuest.rsvpStatus === 'declined' ||
        rawGuest.rsvpStatus === 'maybe'
          ? rawGuest.rsvpStatus
          : 'pending',
      attendingCount: Math.min(20, Math.max(0, Number(rawGuest.attendingCount) || 0)),
      mealPreference: clampStr(rawGuest.mealPreference, 100, 'Standard'),
      dietaryNotes: clampStr(rawGuest.dietaryNotes, 500, ''),
      selectedEvents: (rawGuest.selectedEvents || []).slice(0, 15).map((s) => clampStr(s, 120)),
      checkedIn: Boolean(rawGuest.checkedIn),
    };

    setGuestsByWedding((prev) => {
      const current = prev[weddingId] || [];
      const idx = current.findIndex((g) => g.guestId === guestId);
      const next =
        idx >= 0
          ? current.map((g, i) => (i === idx ? sanitizedGuest : g))
          : [sanitizedGuest, ...current];
      return { ...prev, [weddingId]: next };
    });

    if (user && weddingId !== DEMO_WEDDING_ID) {
      const guestRef = doc(db, 'weddings', weddingId, 'guests', guestId);
      try {
        const snap = await getDoc(guestRef);
        if (snap.exists()) {
          await setDoc(guestRef, {
            ...sanitizedGuest,
            createdAt: snap.data().createdAt || serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } else {
          await setDoc(guestRef, {
            ...sanitizedGuest,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      } catch (error) {
        handleFirestoreError(
          error,
          OperationType.WRITE,
          `weddings/${weddingId}/guests/${guestId}`
        );
      }
    }
  };

  const removeGuest = async (weddingId: string, guestId: string) => {
    setGuestsByWedding((prev) => ({
      ...prev,
      [weddingId]: (prev[weddingId] || []).filter((g) => g.guestId !== guestId),
    }));

    if (user && weddingId !== DEMO_WEDDING_ID) {
      try {
        await deleteDoc(doc(db, 'weddings', weddingId, 'guests', guestId));
      } catch (error) {
        handleFirestoreError(
          error,
          OperationType.DELETE,
          `weddings/${weddingId}/guests/${guestId}`
        );
      }
    }
  };

  const toggleGuestCheckIn = async (weddingId: string, guestId: string, checkedIn: boolean) => {
    const existingList = guestsByWedding[weddingId] || [];
    const target = existingList.find((g) => g.guestId === guestId);
    if (!target) return;

    const updated: GuestRecord = { ...target, checkedIn };
    setGuestsByWedding((prev) => ({
      ...prev,
      [weddingId]: (prev[weddingId] || []).map((g) => (g.guestId === guestId ? updated : g)),
    }));

    if (user && weddingId !== DEMO_WEDDING_ID && target.ownerId === user.uid) {
      try {
        await updateDoc(doc(db, 'weddings', weddingId, 'guests', guestId), {
          checkedIn,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(
          error,
          OperationType.UPDATE,
          `weddings/${weddingId}/guests/${guestId}`
        );
      }
    }
  };

  const submitPublicRsvp = async (
    wedding: WeddingProject,
    input: {
      guestName: string;
      contact: string;
      response: 'accepted' | 'declined' | 'maybe';
      attendingCount: number;
      selectedEvents: string[];
      mealPreference: string;
      dietaryNotes: string;
      message: string;
    }
  ): Promise<RsvpRecord> => {
    const rsvpId = sanitizeId(`rsvp-${Date.now()}`);
    const prefix = `${wedding.partnerOne.slice(0, 1)}${wedding.partnerTwo.slice(0, 1)}`.toUpperCase();
    const inviteCode = sanitizeId(
      `VOW-${prefix}-${Math.floor(1000 + Math.random() * 9000)}`
    ).toUpperCase();

    const record: RsvpRecord = {
      rsvpId,
      weddingId: wedding.weddingId,
      weddingOwnerId: wedding.ownerId,
      guestName: clampStr(input.guestName, 120, 'Guest'),
      contact: clampStr(input.contact, 200, 'guest@example.com'),
      response: input.response,
      attendingCount:
        input.response === 'declined'
          ? 0
          : Math.min(20, Math.max(1, Number(input.attendingCount) || 1)),
      selectedEvents: (input.selectedEvents || []).slice(0, 15).map((s) => clampStr(s, 120)),
      mealPreference: clampStr(input.mealPreference, 100, 'Standard'),
      dietaryNotes: clampStr(input.dietaryNotes, 500, ''),
      message: clampStr(input.message, 1000, ''),
      inviteCode,
    };

    // Always add to local RSVP & Guest state so owner / demo dashboard immediately reflects it
    setRsvpsByWedding((prev) => ({
      ...prev,
      [wedding.weddingId]: [record, ...(prev[wedding.weddingId] || [])],
    }));

    const newGuest: GuestRecord = {
      guestId: sanitizeId(`guest-${Date.now()}`),
      weddingId: wedding.weddingId,
      ownerId: wedding.ownerId,
      name: record.guestName,
      contact: record.contact,
      inviteCode: record.inviteCode,
      rsvpStatus: record.response,
      attendingCount: record.attendingCount,
      mealPreference: record.mealPreference,
      dietaryNotes: record.dietaryNotes,
      selectedEvents: record.selectedEvents,
      checkedIn: false,
    };

    setGuestsByWedding((prev) => ({
      ...prev,
      [wedding.weddingId]: [newGuest, ...(prev[wedding.weddingId] || [])],
    }));

    // Write to Firestore if this is a cloud-backed published wedding
    if (
      wedding.weddingId !== DEMO_WEDDING_ID &&
      wedding.ownerId !== 'local-draft-owner' &&
      wedding.status === 'published'
    ) {
      try {
        await setDoc(doc(db, 'weddings', wedding.weddingId, 'rsvps', rsvpId), {
          ...record,
          submittedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error('Cloud RSVP write notice:', error);
      }
    }

    return record;
  };

  return (
    <VoworaContext.Provider
      value={{
        user,
        userProfile,
        isAuthReady,
        authError,
        weddings: allWeddings,
        eventsByWedding,
        guestsByWedding,
        rsvpsByWedding,
        favoriteTemplates,
        activeDraft,
        activeDraftEvents,
        setActiveDraft,
        setActiveDraftEvents,
        signIn,
        logOut,
        toggleFavoriteTemplate,
        updateSubscriptionPlan,
        createBlankProject,
        saveWeddingProject,
        duplicateWeddingProject,
        deleteWeddingProject,
        loadWeddingDetails,
        loadPublicWeddingBySlug,
        addOrUpdateGuest,
        removeGuest,
        toggleGuestCheckIn,
        submitPublicRsvp,
      }}
    >
      {children}
    </VoworaContext.Provider>
  );
};

export function useVowora() {
  const ctx = useContext(VoworaContext);
  if (!ctx) {
    throw new Error('useVowora must be used within a VoworaProvider');
  }
  return ctx;
}
