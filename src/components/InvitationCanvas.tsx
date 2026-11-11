import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import {
  MapPin,
  Calendar,
  Volume2,
  VolumeX,
  CheckCircle2,
  ExternalLink,
  Heart,
  Sparkles,
  Copy,
  Check,
  ChevronDown,
  ArrowUp,
  Navigation,
  Palette,
  X,
} from 'lucide-react';
import {
  WeddingProject,
  WeddingEventItem,
  RsvpRecord,
} from '../types/vowora';
import {
  CURATED_CARD_TEMPLATES,
  CuratedCardPreset,
  ASSETS,
} from '../data/templatesAndDemo';
import { useVowora } from '../context/VoworaContext';
import { FallingPetals } from './FallingPetals';
import { ScratchDateCards } from './ScratchDateCards';

interface InvitationCanvasProps {
  project: WeddingProject;
  events: WeddingEventItem[];
  isEditorPreview?: boolean;
  startWithCoverClosed?: boolean;
  canvasRef?: React.RefObject<HTMLDivElement | null>;
  onSelectSection?: (section: string) => void;
  showTemplateBar?: boolean;
}

export const InvitationCanvas: React.FC<InvitationCanvasProps> = ({
  project: initialProject,
  events: initialEvents,
  isEditorPreview = false,
  canvasRef,
  onSelectSection,
  showTemplateBar = true,
}) => {
  const { submitPublicRsvp } = useVowora();

  // Active template preset (defaults to matching project.templateId or Lake Como #1)
  const matchedPreset = useMemo(() => {
    return (
      CURATED_CARD_TEMPLATES.find((p) => p.id === initialProject.templateId) ||
      CURATED_CARD_TEMPLATES[0]
    );
  }, [initialProject.templateId]);

  const [activePresetId, setActivePresetId] = useState<string>(matchedPreset.id);

  // Editable live card state so user can switch between the 5 templates or customize any detail live
  const [cardState, setCardState] = useState(() => ({
    partnerOne: initialProject.partnerOne || matchedPreset.partnerOne,
    partnerTwo: initialProject.partnerTwo || matchedPreset.partnerTwo,
    dateRangeLabel: matchedPreset.dateRangeLabel,
    weddingDate: initialProject.weddingDate || matchedPreset.weddingDate,
    dayNumber: matchedPreset.dayNumber,
    monthShort: matchedPreset.monthShort,
    monthFull: matchedPreset.monthFull,
    yearNumber: matchedPreset.yearNumber,
    weekdayLabel: matchedPreset.weekdayLabel,
    ceremonySubtitle: matchedPreset.ceremonySubtitle,
    archPhotoUrl: initialProject.coverPhotoUrl || matchedPreset.archPhotoUrl,
    venuePhotoUrl: matchedPreset.venuePhotoUrl,
    couplePortraitUrl: initialProject.couplePhotoUrl || matchedPreset.couplePortraitUrl,
    venueKicker: matchedPreset.venueKicker,
    venueName: initialProject.venueSummary || matchedPreset.venueName,
    venueAddress: initialProject.cityCountry || matchedPreset.venueAddress,
    venueParkingNote: initialProject.dressCodeNote || matchedPreset.venueParkingNote,
    mapEmbedQuery: matchedPreset.mapEmbedQuery,
    primaryColor: initialProject.themeConfig?.primaryColor || matchedPreset.primaryColor,
    accentColor: initialProject.themeConfig?.accentColor || matchedPreset.accentColor,
    foilColorStart: matchedPreset.foilColorStart,
    foilColorEnd: matchedPreset.foilColorEnd,
    petalColor: matchedPreset.petalColor,
    bgColor: initialProject.themeConfig?.bgColor || matchedPreset.bgColor,
    events:
      initialEvents && initialEvents.length > 0
        ? initialEvents.map((e) => ({
            dateLabel: `${matchedPreset.dayNumber === '16' ? '15 December' : matchedPreset.events[0]?.dateLabel || '15 December'}`,
            timeLabel: e.startTime || '2:00 PM',
            title: e.name,
            description: e.description,
          }))
        : matchedPreset.events,
  }));

  // Sync when external editor updates initialProject
  useEffect(() => {
    if (isEditorPreview) {
      const preset =
        CURATED_CARD_TEMPLATES.find((p) => p.id === initialProject.templateId) ||
        CURATED_CARD_TEMPLATES[0];
      const parsedDate = new Date(`${initialProject.weddingDate}T12:00:00`);
      const isValidDate = !Number.isNaN(parsedDate.getTime());
      const dayNum = isValidDate ? String(parsedDate.getDate()).padStart(2, '0') : preset.dayNumber;
      const monthSh = isValidDate
        ? parsedDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
        : preset.monthShort;
      const monthFl = isValidDate
        ? parsedDate.toLocaleDateString('en-US', { month: 'long' })
        : preset.monthFull;
      const yearNum = isValidDate ? String(parsedDate.getFullYear()) : preset.yearNumber;
      const weekday = isValidDate
        ? parsedDate.toLocaleDateString('en-US', { weekday: 'long' })
        : preset.weekdayLabel;

      setCardState((prev) => ({
        ...prev,
        partnerOne: initialProject.partnerOne || preset.partnerOne,
        partnerTwo: initialProject.partnerTwo || preset.partnerTwo,
        weddingDate: initialProject.weddingDate || preset.weddingDate,
        dayNumber: dayNum,
        monthShort: monthSh,
        monthFull: monthFl,
        yearNumber: yearNum,
        weekdayLabel: weekday,
        archPhotoUrl: initialProject.coverPhotoUrl || preset.archPhotoUrl,
        couplePortraitUrl: initialProject.couplePhotoUrl || preset.couplePortraitUrl,
        venueName: initialProject.venueSummary || preset.venueName,
        venueAddress: initialProject.cityCountry || preset.venueAddress,
        venueParkingNote: initialProject.dressCodeNote || preset.venueParkingNote,
        primaryColor: initialProject.themeConfig?.primaryColor || preset.primaryColor,
        accentColor: initialProject.themeConfig?.accentColor || preset.accentColor,
        bgColor: initialProject.themeConfig?.bgColor || preset.bgColor,
        events:
          initialEvents.length > 0
            ? initialEvents.map((e) => ({
                dateLabel: `${dayNum} ${monthFl}`,
                timeLabel: e.startTime,
                title: e.name,
                description: e.description,
              }))
            : prev.events,
      }));
    }
  }, [initialProject, initialEvents, isEditorPreview]);

  // Apply one of the 5 curated templates while keeping the couple name the same
  const handleSelectTemplatePreset = (preset: CuratedCardPreset) => {
    setActivePresetId(preset.id);
    setCardState((prev) => ({
      ...prev,
      partnerOne: prev.partnerOne,
      partnerTwo: prev.partnerTwo,
      primaryColor: preset.primaryColor,
      accentColor: preset.accentColor,
      foilColorStart: preset.foilColorStart,
      foilColorEnd: preset.foilColorEnd,
      petalColor: preset.petalColor,
      bgColor: preset.bgColor,
    }));
    playSparkleChime();
  };

  // UI Modal State
  const [rsvpModalOpen, setRsvpModalOpen] = useState(false);
  const [showVenueMap, setShowVenueMap] = useState(true);
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Polyphonic Romantic Piano & Strings Web Audio Synthesizer
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const melodyTimerRef = useRef<number | null>(null);
  const stepIndexRef = useRef(0);

  // Live 4-Column Countdown State (DAYS | HOURS | MINS | SECS)
  const [countdown, setCountdown] = useState({
    days: 33,
    hours: 23,
    mins: 19,
    secs: 20,
  });

  // RSVP Form State
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpContact, setRsvpContact] = useState('');
  const [rsvpDecision, setRsvpDecision] = useState<'accepted' | 'declined' | 'maybe'>('accepted');
  const [rsvpCount, setRsvpCount] = useState(2);
  const [rsvpMeal, setRsvpMeal] = useState('Mediterranean Tasting Menu');
  const [rsvpMessage, setRsvpMessage] = useState('');
  const [rsvpSubmitting, setRsvpSubmitting] = useState(false);
  const [rsvpError, setRsvpError] = useState('');
  const [submittedRsvp, setSubmittedRsvp] = useState<RsvpRecord | null>(null);

  // Live 1-second ticking countdown calculation
  useEffect(() => {
    const updateTimer = () => {
      const targetTime = new Date(`${cardState.weddingDate}T16:00:00`).getTime();
      const now = Date.now();
      const diff = targetTime - now;

      if (Number.isNaN(targetTime) || diff <= 0) {
        // Fallback so countdown always ticks live like the reference screenshot
        const fallbackSec = 59 - (Math.floor(now / 1000) % 60);
        setCountdown({ days: 33, hours: 23, mins: 19, secs: fallbackSec });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);
      setCountdown({ days, hours, mins, secs });
    };

    updateTimer();
    const interval = window.setInterval(updateTimer, 1000);
    return () => window.clearInterval(interval);
  }, [cardState.weddingDate]);

  // Cleanup Web Audio on unmount
  useEffect(() => {
    return () => {
      if (melodyTimerRef.current) window.clearInterval(melodyTimerRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
    };
  }, []);

  const ensureAudioCtx = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Gentle sparkle chime when scratching the date card
  const playSparkleChime = () => {
    try {
      const ctx = ensureAudioCtx();
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.06);
        gain.gain.setValueAtTime(0.001, ctx.currentTime + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.018, ctx.currentTime + i * 0.06 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.06 + 0.55);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.06);
        osc.stop(ctx.currentTime + i * 0.06 + 0.6);
      });
    } catch {
      // ignore if browser blocks audio before interaction
    }
  };

  // Polyphonic romantic arpeggio progression (Canon / Lake Como piano serenade)
  const playRomanticBar = () => {
    try {
      const ctx = ensureAudioCtx();
      const progressions = [
        // C major warm voicing
        { bass: 130.81, notes: [261.63, 329.63, 392.0, 523.25] },
        // G major warm voicing
        { bass: 98.0, notes: [246.94, 293.66, 392.0, 493.88] },
        // A minor 7 warm voicing
        { bass: 110.0, notes: [220.0, 261.63, 329.63, 440.0] },
        // F major 7 warm voicing
        { bass: 87.31, notes: [220.0, 261.63, 349.23, 523.25] },
      ];

      const bar = progressions[stepIndexRef.current % progressions.length];
      stepIndexRef.current += 1;

      // Warm cello/pad bass note
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bassOsc.type = 'triangle';
      bassOsc.frequency.setValueAtTime(bar.bass, ctx.currentTime);
      bassGain.gain.setValueAtTime(0.001, ctx.currentTime);
      bassGain.gain.exponentialRampToValueAtTime(0.022, ctx.currentTime + 0.5);
      bassGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.4);
      bassOsc.connect(bassGain);
      bassGain.connect(ctx.destination);
      bassOsc.start(ctx.currentTime);
      bassOsc.stop(ctx.currentTime + 3.5);

      // Arpeggiated piano notes
      bar.notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        const start = ctx.currentTime + idx * 0.65;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.exponentialRampToValueAtTime(0.024, start + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 2.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 2.5);
      });
    } catch {
      // ignore audio restrictions
    }
  };

  const toggleMusic = () => {
    if (isPlayingMusic) {
      if (melodyTimerRef.current) {
        window.clearInterval(melodyTimerRef.current);
        melodyTimerRef.current = null;
      }
      setIsPlayingMusic(false);
    } else {
      playRomanticBar();
      melodyTimerRef.current = window.setInterval(playRomanticBar, 3200);
      setIsPlayingMusic(true);
    }
  };

  // Smooth scroll helper
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Google Calendar URL generator
  const getGoogleCalendarUrl = () => {
    const cleanDate = cardState.weddingDate.replace(/-/g, '') || '20261216';
    const title = encodeURIComponent(
      `${cardState.partnerOne} & ${cardState.partnerTwo} — Marriage Celebration`
    );
    const details = encodeURIComponent(
      `We cordially invite you to celebrate the marriage of ${cardState.partnerOne} & ${cardState.partnerTwo} at ${cardState.venueName}.`
    );
    const location = encodeURIComponent(`${cardState.venueName}, ${cardState.venueAddress}`);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${cleanDate}T140000Z/${cleanDate}T230000Z&details=${details}&location=${location}`;
  };

  // Copy Venue Address
  const handleCopyAddress = () => {
    navigator.clipboard.writeText(`${cardState.venueName}, ${cardState.venueAddress}`);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2400);
  };

  // RSVP Submit
  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRsvpError('');

    if (!rsvpName.trim()) {
      setRsvpError('Please enter your full name.');
      return;
    }
    if (!rsvpContact.trim()) {
      setRsvpError('Please enter your email or phone number.');
      return;
    }

    setRsvpSubmitting(true);
    try {
      const record = await submitPublicRsvp(
        {
          ...initialProject,
          partnerOne: cardState.partnerOne,
          partnerTwo: cardState.partnerTwo,
        },
        {
          guestName: rsvpName.trim(),
          contact: rsvpContact.trim(),
          response: rsvpDecision,
          attendingCount: rsvpDecision === 'declined' ? 0 : rsvpCount,
          selectedEvents: cardState.events.map((ev) => ev.title),
          mealPreference: rsvpMeal,
          dietaryNotes: '',
          message: rsvpMessage.trim(),
        }
      );
      setSubmittedRsvp(record);
      playSparkleChime();
    } catch (err) {
      setRsvpError(err instanceof Error ? err.message : 'Could not submit RSVP.');
    } finally {
      setRsvpSubmitting(false);
    }
  };

  const initials = `${cardState.partnerOne.slice(0, 1).toUpperCase()} & ${cardState.partnerTwo
    .slice(0, 1)
    .toUpperCase()}`;

  const mapsExternalUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${cardState.venueName}, ${cardState.venueAddress}`
  )}`;

  const mapsEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    `${cardState.venueName}, ${cardState.venueAddress}`
  )}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

  return (
    <div
      ref={canvasRef}
      id="wedding-card-top"
      className="relative min-h-screen w-full overflow-x-hidden selection:bg-[#16325B] selection:text-white transition-colors duration-500"
      style={{
        backgroundColor: cardState.bgColor,
        color: cardState.primaryColor,
        fontFamily: `'DM Sans', sans-serif`,
      }}
    >
      {/* Floating Rose/Blush Petals Background Animation (exact reference match) */}
      <FallingPetals color={cardState.petalColor} />

      {/* =====================================================================
          STICKY TOP HEADER (Matches Reference Screenshot 1 + Template Switcher)
         ===================================================================== */}
      <header className="sticky top-0 z-40 bg-[#FAF6F0]/90 backdrop-blur-md border-b border-[#E8E0D5] no-print">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-3">
          {/* Left: Couple Names in Playfair Serif */}
          <button
            type="button"
            onClick={() => scrollToSection('wedding-card-top')}
            className="text-xl sm:text-2xl font-bold tracking-tight text-left cursor-pointer shrink-0"
            style={{
              fontFamily: `'Playfair Display', Georgia, serif`,
              color: cardState.primaryColor,
            }}
          >
            {cardState.partnerOne} &amp; {cardState.partnerTwo}
          </button>

          {/* Center: Section Anchor Navigation (THE DATE | SCHEDULE | VENUE | RSVP) */}
          <nav className="hidden md:flex items-center gap-7 text-[11px] uppercase tracking-[0.2em] font-semibold text-[#5A554C]">
            <button
              type="button"
              onClick={() => scrollToSection('section-the-date')}
              className="hover:opacity-75 transition-opacity cursor-pointer"
            >
              THE DATE
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('section-schedule')}
              className="hover:opacity-75 transition-opacity cursor-pointer"
            >
              SCHEDULE
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('section-venue')}
              className="hover:opacity-75 transition-opacity cursor-pointer"
            >
              VENUE
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('section-rsvp')}
              className="hover:opacity-75 transition-opacity cursor-pointer"
              style={{ color: cardState.primaryColor }}
            >
              RSVP
            </button>
          </nav>

          {/* Right: Music Toggle + RSVP Pill Button */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Romantic Music Button */}
            <button
              type="button"
              onClick={toggleMusic}
              title={isPlayingMusic ? 'Pause Wedding Music' : 'Play Romantic Wedding Music'}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] uppercase tracking-[0.14em] font-medium border bg-white/90 shadow-2xs transition-transform active:scale-95 cursor-pointer"
              style={{
                borderColor: `${cardState.accentColor}55`,
                color: cardState.primaryColor,
              }}
            >
              {isPlayingMusic ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 animate-pulse" style={{ color: cardState.accentColor }} />
                  <span className="hidden sm:inline">Music On</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 opacity-70" />
                  <span className="hidden sm:inline">Play Music</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setRsvpModalOpen(true)}
              className="px-4 sm:px-5 py-2 rounded-full text-[11px] uppercase tracking-[0.2em] font-semibold text-white shadow-sm transition-transform hover:scale-[1.02] cursor-pointer"
              style={{ backgroundColor: cardState.primaryColor }}
            >
              RSVP
            </button>
          </div>
        </div>

        {/* 5 Curated Wedding Card Templates Bar (Allows switching between 5 USA/European Couple Templates in 1 click) */}
        {showTemplateBar && !isEditorPreview && (
          <div className="bg-white/75 border-t border-[#ECE5DA] px-4 py-2 overflow-x-auto no-scrollbar">
            <div className="max-w-5xl mx-auto flex items-center justify-start sm:justify-center gap-2 min-w-max">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#7A746B] font-semibold flex items-center gap-1 mr-1">
                <Palette className="w-3 h-3" /> 5 Card Templates:
              </span>
              {CURATED_CARD_TEMPLATES.map((preset) => {
                const isSelected = preset.id === activePresetId;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectTemplatePreset(preset)}
                    className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'text-white shadow-xs scale-[1.02]'
                        : 'bg-[#FAF6F0] text-[#4A463F] hover:bg-[#EFE9DF] border border-[#E2DACD]'
                    }`}
                    style={
                      isSelected
                        ? { backgroundColor: preset.primaryColor }
                        : undefined
                    }
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        backgroundColor: isSelected ? '#FFFFFF' : preset.accentColor,
                      }}
                    />
                    <span>{preset.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* =====================================================================
          SECTION 1: ROMAN ARCHWAY HERO WITH FROSTED CARD (Screenshot 1 & 2)
         ===================================================================== */}
      <section
        onClick={() => onSelectSection?.('couple')}
        className="relative z-10 pt-8 sm:pt-10 pb-14 px-4 flex flex-col items-center text-center"
      >
        {/* Top Monogram with fine horizontal lines: — J & C — */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex items-center gap-3 mb-5"
        >
          <span className="w-8 sm:w-10 h-px bg-[#C9C0B3]" />
          <span
            className="text-[11px] uppercase tracking-[0.34em] font-semibold"
            style={{ color: cardState.primaryColor }}
          >
            {initials}
          </span>
          <span className="w-8 sm:w-10 h-px bg-[#C9C0B3]" />
        </motion.div>

        {/* Tall Roman Archway Container (rounded-t-full) with bottom soft fade */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-[490px] sm:max-w-[530px] h-[540px] sm:h-[650px] rounded-t-full overflow-hidden shadow-[0_24px_60px_rgba(22,50,91,0.12)] border-[5px] border-white/90 bg-white"
        >
          <img
            src={cardState.archPhotoUrl}
            alt={`${cardState.partnerOne} and ${cardState.partnerTwo} wedding archway`}
            className="w-full h-full object-cover object-center scale-[1.01] transition-transform duration-1000"
          />

          {/* Soft bottom gradient fade into warm ivory cream (like Screenshot 1 & 2) */}
          <div
            className="absolute inset-x-0 bottom-0 h-36 pointer-events-none"
            style={{
              background: `linear-gradient(to top, ${cardState.bgColor} 6%, rgba(250,246,240,0.65) 52%, transparent 100%)`,
            }}
          />

          {/* Translucent Frosted Glass Floating Couple Card with Matching Half-Round Arch Top */}
          <div className="absolute inset-x-6 sm:inset-x-12 top-[11%] sm:top-[12%] flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.8 }}
              className="w-full max-w-[345px] sm:max-w-[365px] rounded-t-[190px] rounded-b-3xl bg-white/38 backdrop-blur-md px-6 pt-12 pb-8 sm:px-9 sm:pt-14 sm:pb-9 shadow-[0_12px_36px_rgba(22,50,91,0.12),inset_0_1px_1.5px_rgba(255,255,255,0.85)] border border-white/65 text-center"
            >
              <h1
                className="text-4xl sm:text-[46px] font-bold leading-[1.12] tracking-tight drop-shadow-[0_1px_8px_rgba(255,255,255,0.65)]"
                style={{
                  fontFamily: `'Playfair Display', Georgia, serif`,
                  color: '#1E1C18',
                }}
              >
                {cardState.partnerOne} &amp;
                <br />
                {cardState.partnerTwo}
              </h1>

              <p
                className="mt-3 text-base sm:text-lg italic text-[#3E3A34] font-medium"
                style={{ fontFamily: `'Cormorant Garamond', Georgia, serif` }}
              >
                are getting married!
              </p>

              {/* — ♡ — divider */}
              <div className="my-4 flex items-center justify-center gap-2.5">
                <span className="w-6 h-px bg-[#1E1C18]/30" />
                <Heart
                  className="w-3.5 h-3.5 fill-[#F3B6AF] text-[#C9736B]"
                  strokeWidth={1.8}
                />
                <span className="w-6 h-px bg-[#1E1C18]/30" />
              </div>

              <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.22em] font-bold text-[#2F2B26] leading-relaxed">
                {cardState.dateRangeLabel} · MARRIAGE
                <br />
                CELEBRATION
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* "Discover the Celebration Date ⌄" Scroll Prompt (Screenshot 2) */}
        <button
          type="button"
          onClick={() => scrollToSection('section-the-date')}
          className="mt-7 inline-flex flex-col items-center gap-1.5 text-xs tracking-wide text-[#5E584F] hover:text-[#16325B] transition-colors cursor-pointer group"
        >
          <span>Discover the Celebration Date</span>
          <ChevronDown className="w-4 h-4 opacity-70 group-hover:translate-y-1 transition-transform" />
        </button>
      </section>

      {/* =====================================================================
          SECTION 2: "THE DATE" — INTERACTIVE SCRATCH CARDS (Screenshots 2 & 3)
         ===================================================================== */}
      <section
        id="section-the-date"
        onClick={() => onSelectSection?.('settings')}
        className="relative z-10 py-12 sm:py-16 px-4 flex flex-col items-center text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.65 }}
          className="max-w-xl w-full flex flex-col items-center"
        >
          <h2
            className="text-4xl sm:text-5xl font-bold tracking-tight"
            style={{
              fontFamily: `'Playfair Display', Georgia, serif`,
              color: '#25231F',
            }}
          >
            The Date
          </h2>

          <div
            className="mt-2.5 flex items-center gap-2 text-base sm:text-lg font-medium"
            style={{ color: cardState.primaryColor }}
          >
            <span style={{ color: cardState.accentColor }}>✦</span>
            <span>
              {cardState.dayNumber} {cardState.monthFull}
            </span>
            <span style={{ color: cardState.accentColor }}>✦</span>
          </div>

          <p className="mt-1.5 mb-8 text-xs sm:text-sm text-[#6E6A63]">
            Scratch the cards below to reveal our marriage date
          </p>

          {/* 3 Interactive HTML5 Canvas Foil Scratch-Off Cards */}
          <ScratchDateCards
            dayNumber={cardState.dayNumber}
            monthShort={cardState.monthShort}
            monthFull={cardState.monthFull}
            yearNumber={cardState.yearNumber}
            primaryColor={cardState.primaryColor}
            accentColor={cardState.accentColor}
            foilStart={cardState.foilColorStart}
            foilEnd={cardState.foilColorEnd}
            onScratchChime={playSparkleChime}
          />
        </motion.div>

        {/* ===================================================================
            SECTION 3: LIVE COUNTDOWN & GOOGLE CALENDAR CARD (Screenshots 2 & 3)
           =================================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-12 w-full max-w-[480px] rounded-3xl bg-white/95 px-6 py-8 sm:px-10 sm:py-9 shadow-[0_12px_36px_rgba(22,50,91,0.06)] border border-[#EAE2D6] text-center"
        >
          {/* • XX DAYS TO GO Pill */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] uppercase tracking-[0.14em] font-bold"
            style={{
              backgroundColor: `${cardState.accentColor}18`,
              color: cardState.primaryColor,
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: cardState.accentColor }}
            />
            <span>{countdown.days} DAYS TO GO</span>
          </div>

          <p
            className="mt-4 text-[11px] sm:text-xs uppercase tracking-[0.22em] font-bold"
            style={{ color: cardState.accentColor }}
          >
            COUNTDOWN TO {cardState.dayNumber} {cardState.monthFull.toUpperCase()}
          </p>

          <p className="mt-1 text-xs text-[#6E6A63]">
            Until the Marriage Ceremony ({cardState.ceremonySubtitle})
          </p>

          {/* 4-Column Countdown Grid with Vertical Dividers */}
          <div className="mt-6 pt-2 pb-6 border-b border-[#EFEAE1] grid grid-cols-4 divide-x divide-[#E6DFD3]">
            {[
              { value: countdown.days, label: 'DAYS' },
              { value: countdown.hours, label: 'HOURS' },
              { value: countdown.mins, label: 'MINS' },
              { value: countdown.secs, label: 'SECS' },
            ].map((item) => (
              <div key={item.label} className="px-2 flex flex-col items-center">
                <span
                  className="text-2xl sm:text-3xl font-bold tabular-nums tracking-tight"
                  style={{ color: cardState.primaryColor }}
                >
                  {item.value}
                </span>
                <span className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[#78736A] font-medium">
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          {/* Add to Google Calendar Pill Button */}
          <div className="mt-5 flex justify-center">
            <a
              href={getGoogleCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-[#DDD5C7] bg-[#FAF8F4] hover:bg-white text-xs font-semibold text-[#2A2823] transition-all shadow-2xs"
            >
              <Calendar className="w-3.5 h-3.5" style={{ color: cardState.accentColor }} />
              <span>
                Add {cardState.dayNumber} {cardState.monthShort} to Google Calendar
              </span>
            </a>
          </div>
        </motion.div>
      </section>

      {/* =====================================================================
          SECTION 4: "SCHEDULE OF EVENTS" TIMELINE + MARRIAGE FINAL DATE CARD
          (Matches Reference Screenshots 3, 4 & 5)
         ===================================================================== */}
      <section
        id="section-schedule"
        onClick={() => onSelectSection?.('events')}
        className="relative z-10 py-14 sm:py-18 px-4 flex flex-col items-center"
      >
        {/* Heading */}
        <div className="text-center mb-12">
          <h2
            className="text-4xl sm:text-5xl font-bold tracking-tight"
            style={{
              fontFamily: `'Playfair Display', Georgia, serif`,
              color: '#25231F',
            }}
          >
            Schedule of Events
          </h2>
          <p className="mt-2.5 text-[11px] sm:text-xs uppercase tracking-[0.24em] text-[#6E6A63] font-medium">
            MARRIAGE FESTIVITIES &amp; CELEBRATIONS
          </p>
          <div className="mt-3 flex items-center justify-center gap-2.5">
            <span className="w-8 h-px bg-[#D5CBBF]" />
            <span className="text-xs" style={{ color: cardState.accentColor }}>
              ✦
            </span>
            <span className="w-8 h-px bg-[#D5CBBF]" />
          </div>
        </div>

        {/* Alternating Vertical Timeline with Center Line & Diamond Nodes */}
        <div className="relative w-full max-w-3xl mx-auto">
          {/* Center Vertical Line */}
          <div
            className="hidden sm:block absolute left-1/2 top-4 bottom-4 w-px -translate-x-1/2"
            style={{ backgroundColor: `${cardState.accentColor}66` }}
          />

          <div className="space-y-8 sm:space-y-10">
            {cardState.events.map((evt, index) => {
              const isLeft = index % 2 === 0;
              return (
                <motion.div
                  key={`${evt.title}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: index * 0.08 }}
                  className="relative grid grid-cols-1 sm:grid-cols-2 items-center gap-4 sm:gap-12"
                >
                  {/* Center Diamond Node on Desktop */}
                  <div className="hidden sm:flex absolute left-1/2 -translate-x-1/2 z-10 w-5 h-5 rounded-xs bg-white border items-center justify-center rotate-45 shadow-2xs"
                    style={{ borderColor: `${cardState.accentColor}88` }}
                  >
                    <div
                      className="w-2 h-2"
                      style={{
                        backgroundColor:
                          index % 2 === 1 ? cardState.primaryColor : cardState.accentColor,
                      }}
                    />
                  </div>

                  {/* Card Column */}
                  <div
                    className={`${
                      isLeft
                        ? 'sm:col-start-1 sm:text-right'
                        : 'sm:col-start-2 sm:text-left'
                    }`}
                  >
                    <div className="bg-white/95 rounded-2xl p-6 sm:p-7 border border-[#EAE2D6] shadow-[0_8px_28px_rgba(22,50,91,0.05)]">
                      {/* Pills Row */}
                      <div
                        className={`flex flex-wrap items-center gap-2 mb-3.5 ${
                          isLeft ? 'sm:justify-end' : 'sm:justify-start'
                        }`}
                      >
                        <span
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold text-white"
                          style={{ backgroundColor: cardState.primaryColor }}
                        >
                          <Calendar className="w-3 h-3 opacity-85" />
                          <span>{evt.dateLabel}</span>
                        </span>

                        <span
                          className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold"
                          style={{
                            backgroundColor: `${cardState.accentColor}1F`,
                            color: cardState.primaryColor,
                          }}
                        >
                          {evt.timeLabel}
                        </span>
                      </div>

                      <h3
                        className="text-lg sm:text-xl font-bold"
                        style={{ color: '#1F1D1A' }}
                      >
                        {evt.title}
                      </h3>

                      <p className="mt-2 text-xs sm:text-sm text-[#666159] leading-relaxed">
                        {evt.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ===================================================================
            ORNAMENTAL "MARRIAGE FINAL DATE" HIGHLIGHT CARD (Screenshot 4 & 5)
           =================================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="mt-14 w-full max-w-[580px] rounded-3xl bg-[#FDFBF7] px-6 py-9 sm:px-12 sm:py-11 border-2 border-[#DECFA8] shadow-[0_14px_40px_rgba(22,50,91,0.07)] text-center relative"
        >
          {/* Subtle Corner Ornaments */}
          <span className="absolute top-3.5 left-4 text-xs text-[#C7B27C] select-none">
            ✦ ❦
          </span>
          <span className="absolute top-3.5 right-4 text-xs text-[#C7B27C] select-none">
            ❦ ✦
          </span>

          {/* Top Navy Badge: ✨ MARRIAGE FINAL DATE ✨ */}
          <div
            className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-bold text-white shadow-xs"
            style={{ backgroundColor: cardState.primaryColor }}
          >
            <Sparkles className="w-3 h-3 text-[#8ECAE6]" />
            <span>MARRIAGE FINAL DATE</span>
            <Sparkles className="w-3 h-3 text-[#8ECAE6]" />
          </div>

          <h3
            className="mt-5 text-3xl sm:text-4xl font-bold tracking-tight"
            style={{
              fontFamily: `'Playfair Display', Georgia, serif`,
              color: cardState.primaryColor,
            }}
          >
            {cardState.dayNumber} {cardState.monthFull} {cardState.yearNumber}
          </h3>

          <p className="mt-2 text-xs sm:text-sm font-semibold text-[#946B2D]">
            {cardState.weekdayLabel} · {cardState.ceremonySubtitle}
          </p>

          <p className="mt-4 max-w-md mx-auto text-xs sm:text-sm text-[#57524A] leading-relaxed">
            We cordially invite you to join us on this most sacred day as{' '}
            <strong style={{ color: cardState.primaryColor }}>
              {cardState.partnerOne} &amp; {cardState.partnerTwo}
            </strong>{' '}
            exchange their vows and embark on their lifelong journey of love and togetherness.
          </p>

          <div className="mt-6 pt-4 border-t border-[#EAE0C8] flex items-center justify-center gap-1.5 text-xs text-[#6E685F]">
            <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: cardState.accentColor }} />
            <span>{cardState.venueName}</span>
          </div>
        </motion.div>
      </section>

      {/* =====================================================================
          SECTION 5: "MARRIAGE VENUE" PHOTO CARD + COLLAPSIBLE MAP + BUTTONS
          (Matches Reference Screenshots 5 & 6)
         ===================================================================== */}
      <section
        id="section-venue"
        onClick={() => onSelectSection?.('style')}
        className="relative z-10 py-12 sm:py-16 px-4 flex flex-col items-center"
      >
        <h2
          className="text-4xl sm:text-5xl font-bold tracking-tight text-center mb-8"
          style={{
            fontFamily: `'Playfair Display', Georgia, serif`,
            color: '#25231F',
          }}
        >
          Marriage Venue
        </h2>

        {/* Unified Venue Photo + Collapsible Map Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-[600px] rounded-3xl overflow-hidden bg-white shadow-[0_16px_44px_rgba(22,50,91,0.1)] border border-[#E6DED2]"
        >
          {/* Top Venue Photograph with Bottom Dark Scrim Overlay & HIDE/SHOW MAP Button */}
          <div className="relative h-[300px] sm:h-[360px] w-full overflow-hidden">
            <img
              src={cardState.venuePhotoUrl}
              alt={cardState.venueName}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

            <div className="absolute inset-x-6 bottom-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/85 font-semibold">
                  {cardState.venueKicker}
                </p>
                <h3 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">
                  {cardState.venueName}
                </h3>
                <p className="mt-1 text-[10px] sm:text-[11px] uppercase tracking-[0.16em] text-white/80">
                  {cardState.events.map((e) => e.title.split(' ')[0].toUpperCase()).join(' · ')} · MARRIAGE
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowVenueMap((v) => !v)}
                className="self-start sm:self-end inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] uppercase tracking-[0.14em] font-semibold bg-black/45 hover:bg-black/65 backdrop-blur-xs border border-white/35 text-white transition-colors cursor-pointer shrink-0"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{showVenueMap ? 'HIDE MAP' : 'SHOW MAP'}</span>
              </button>
            </div>
          </div>

          {/* Collapsible Embedded Google Map (Matches Screenshot 6) */}
          <AnimatePresence initial={false}>
            {showVenueMap && (
              <motion.div
                key="venue-map-iframe"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 270, opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="w-full overflow-hidden border-t border-[#E6DED2]"
              >
                <iframe
                  title={`Map of ${cardState.venueName}`}
                  src={mapsEmbedUrl}
                  className="w-full h-[270px] border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Action Buttons Underneath Map: [OPEN IN GOOGLE MAPS ↗] [COPY ADDRESS] */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3.5">
          <a
            href={mapsExternalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-[11px] uppercase tracking-[0.18em] font-semibold text-white shadow-sm transition-transform hover:scale-[1.02]"
            style={{ backgroundColor: cardState.primaryColor }}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>OPEN IN GOOGLE MAPS</span>
            <ExternalLink className="w-3 h-3 opacity-80" />
          </a>

          <button
            type="button"
            onClick={handleCopyAddress}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-[11px] uppercase tracking-[0.18em] font-semibold bg-white border border-[#DCD3C6] text-[#2A2823] hover:bg-[#FAF6F0] transition-colors cursor-pointer shadow-2xs"
          >
            {copiedAddress ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-700" />
                <span>ADDRESS COPIED</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 opacity-75" />
                <span>COPY ADDRESS</span>
              </>
            )}
          </button>
        </div>

        {/* Venue Address & Parking Note Box (Matches Screenshot 6) */}
        <div className="mt-5 w-full max-w-[460px] rounded-2xl bg-white/90 border border-[#EAE2D6] px-6 py-5 text-center shadow-2xs">
          <p className="text-xs font-bold text-[#25231F] leading-relaxed">
            📍 {cardState.venueName}, {cardState.venueAddress}
          </p>
          <p className="mt-2 text-xs text-[#6E6A63] leading-relaxed">
            {cardState.venueParkingNote}
          </p>
        </div>
      </section>

      {/* =====================================================================
          SECTION 6: "HONOURED GUEST INVITATION — WITH JOYFUL HEARTS WE INVITE YOU"
          (Matches Reference Screenshot 7 + Interactive RSVP)
         ===================================================================== */}
      <section
        id="section-rsvp"
        onClick={() => onSelectSection?.('guest')}
        className="relative z-10 py-12 sm:py-16 px-4 flex flex-col items-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-[650px] rounded-3xl bg-[#FDFBF7] px-6 py-10 sm:px-14 sm:py-14 border border-[#E2D9C8] shadow-[0_18px_48px_rgba(22,50,91,0.07)] text-center relative"
        >
          {/* Subtle Corner Ornaments */}
          <span className="absolute top-4 left-5 text-xs text-[#CBB889] select-none">✦ ❦</span>
          <span className="absolute top-4 right-5 text-xs text-[#CBB889] select-none">❦ ✦</span>
          <span className="absolute bottom-4 left-5 text-xs text-[#CBB889] select-none">✦ ❦</span>
          <span className="absolute bottom-4 right-5 text-xs text-[#CBB889] select-none">❦ ✦</span>

          {/* Circular Monogram Emblem */}
          <div
            className="w-14 h-14 mx-auto rounded-full bg-white border-2 flex items-center justify-center text-sm font-bold tracking-wider shadow-2xs"
            style={{
              borderColor: '#DECFA8',
              color: cardState.primaryColor,
              fontFamily: `'Playfair Display', Georgia, serif`,
            }}
          >
            {initials}
          </div>

          {/* — HONOURED GUEST INVITATION — */}
          <div className="mt-5 flex items-center justify-center gap-3">
            <span className="w-7 h-px bg-[#D5CBBF]" />
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.26em] text-[#7A7368] font-semibold">
              HONOURED GUEST INVITATION
            </span>
            <span className="w-7 h-px bg-[#D5CBBF]" />
          </div>

          <h2
            className="mt-4 text-3xl sm:text-5xl font-bold leading-[1.15] tracking-tight"
            style={{
              fontFamily: `'Playfair Display', Georgia, serif`,
              color: '#22201C',
            }}
          >
            With Joyful Hearts We
            <br />
            Invite You
          </h2>

          <p className="mt-5 max-w-lg mx-auto text-xs sm:text-sm text-[#57524A] leading-relaxed">
            With the divine blessings of God and our beloved elders, we,{' '}
            <strong style={{ color: cardState.primaryColor }}>
              {cardState.partnerOne} &amp; {cardState.partnerTwo}
            </strong>
            , warmly invite you and your family to join us as we celebrate our holy marriage union.
            Your gracious presence, love, and heartfelt blessings will make our special days on{' '}
            <strong style={{ color: cardState.primaryColor }}>
              {cardState.dateRangeLabel}
            </strong>{' '}
            truly complete and auspicious.
          </p>

          {/* Event Summary Pills Row (Matches Screenshot 7) */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
            {cardState.events.map((ev, i) => (
              <span
                key={i}
                className="px-3.5 py-1.5 rounded-full text-[11px] bg-white border border-[#E2D9C8] text-[#2A2823] font-medium"
              >
                <strong style={{ color: cardState.primaryColor }}>
                  {ev.dateLabel.slice(0, 6)} · {ev.timeLabel}
                </strong>{' '}
                {ev.title.split(' ')[0]}
              </span>
            ))}
          </div>

          {/* Main Marriage Ceremony Pill */}
          <div className="mt-3 flex justify-center">
            <span
              className="px-5 py-1.5 rounded-full text-[11px] font-bold text-white shadow-2xs"
              style={{ backgroundColor: cardState.primaryColor }}
            >
              {cardState.dayNumber} {cardState.monthShort} (Wedding) Marriage Ceremony
            </span>
          </div>

          <div className="my-7 border-t border-[#EAE2D3]" />

          {/* Primary Google Calendar CTA Bar + Interactive RSVP Trigger */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={getGoogleCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full text-xs font-semibold text-white shadow-sm transition-transform hover:scale-[1.01]"
              style={{ backgroundColor: cardState.primaryColor }}
            >
              <Calendar className="w-4 h-4 text-[#8ECAE6]" />
              <span>
                Add {cardState.dateRangeLabel} Celebrations to Google Calendar
              </span>
            </a>

            <button
              type="button"
              onClick={() => setRsvpModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-xs font-semibold border-2 bg-white hover:bg-[#FAF6F0] transition-colors cursor-pointer"
              style={{
                borderColor: cardState.primaryColor,
                color: cardState.primaryColor,
              }}
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: cardState.accentColor }} />
              <span>Confirm Your RSVP</span>
            </button>
          </div>

          <p
            className="mt-6 text-sm italic text-[#6E685F] flex items-center justify-center gap-1.5"
            style={{ fontFamily: `'Cormorant Garamond', Georgia, serif` }}
          >
            <Heart className="w-3.5 h-3.5 fill-[#E8998D] text-[#E8998D]" />
            <span>
              Cordially invited with warm love &amp; regards by {cardState.partnerOne} &amp;{' '}
              {cardState.partnerTwo}’s Family
            </span>
          </p>

          <p className="mt-1.5 text-[11px] text-[#7D776E] flex items-center justify-center gap-1">
            <MapPin className="w-3 h-3" style={{ color: cardState.accentColor }} />
            <span>
              {cardState.venueName}, {cardState.venueAddress}
            </span>
          </p>
        </motion.div>
      </section>

      {/* =====================================================================
          SECTION 7: "HOPE TO SEE YOU THERE!" FRAMED COUPLE PORTRAIT & FOOTER
          (Matches Reference Screenshots 8 & 9)
         ===================================================================== */}
      <section className="relative z-10 pt-8 pb-20 px-4 flex flex-col items-center text-center">
        <p
          className="text-3xl sm:text-4xl font-normal text-[#4A463F]"
          style={{ fontFamily: `'Cormorant Garamond', Georgia, serif` }}
        >
          Hope to see you there!
        </p>

        <h2
          className="mt-1.5 text-3xl sm:text-4xl font-bold tracking-tight"
          style={{
            fontFamily: `'Playfair Display', Georgia, serif`,
            color: '#22201C',
          }}
        >
          {cardState.partnerOne} &amp; {cardState.partnerTwo}
        </h2>

        <Heart
          className="w-5 h-5 mt-3 mb-7"
          style={{ color: cardState.accentColor }}
          strokeWidth={1.6}
        />

        {/* Framed Vertical Half-Round Arch Couple Portrait Card with Bottom Caption */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.75 }}
          className="relative w-full max-w-[360px] sm:max-w-[390px] h-[480px] sm:h-[520px] rounded-t-full rounded-b-3xl overflow-hidden bg-white p-2.5 shadow-[0_20px_50px_rgba(22,50,91,0.12)] border border-[#EAE2D6]"
        >
          <div className="relative w-full h-full rounded-t-full rounded-b-2xl overflow-hidden">
            <img
              src={cardState.couplePortraitUrl || ASSETS.COUPLE_EUROPEAN_VILLA}
              alt={`${cardState.partnerOne} & ${cardState.partnerTwo} Portrait`}
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

            <div className="absolute inset-x-4 bottom-5 text-center text-white">
              <p className="text-[11px] uppercase tracking-[0.24em] font-bold">
                {cardState.dateRangeLabel} {cardState.yearNumber}
              </p>
              <p
                className="mt-1 text-base italic text-white/90"
                style={{ fontFamily: `'Cormorant Garamond', Georgia, serif` }}
              >
                Forever Together · {cardState.partnerOne} &amp; {cardState.partnerTwo}
              </p>
            </div>
          </div>
        </motion.div>

        {/* ↑ BACK TO TOP Pill Button (Screenshot 9) */}
        <button
          type="button"
          onClick={() => scrollToSection('wedding-card-top')}
          className="mt-9 inline-flex items-center gap-2 px-7 py-3 rounded-full bg-white border border-[#DFD7CA] hover:bg-[#FAF6F0] text-xs uppercase tracking-[0.18em] font-semibold text-[#3A3731] shadow-2xs transition-transform hover:-translate-y-0.5 cursor-pointer"
        >
          <ArrowUp className="w-3.5 h-3.5" style={{ color: cardState.accentColor }} />
          <span>BACK TO TOP</span>
        </button>

        {/* Subtle Footer Line */}
        <p className="mt-8 text-xs text-[#8C857B]">
          {cardState.partnerOne} &amp; {cardState.partnerTwo} · {cardState.dateRangeLabel} · Marriage Celebration
        </p>
      </section>

      {/* =====================================================================
          INTERACTIVE RSVP & QR GUEST PASS MODAL
         ===================================================================== */}
      <AnimatePresence>
        {rsvpModalOpen && (
          <motion.div
            key="rsvp-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4 no-print"
          >
            <motion.div
              initial={{ scale: 0.96, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 16 }}
              className="w-full max-w-lg rounded-3xl bg-[#FDFBF7] border border-[#E2D9C8] p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-[#EAE2D4] pb-4">
                <div>
                  <p
                    className="text-[10px] uppercase tracking-[0.22em] font-bold"
                    style={{ color: cardState.accentColor }}
                  >
                    HONOURED GUEST RSVP
                  </p>
                  <h3
                    className="text-2xl font-bold"
                    style={{
                      fontFamily: `'Playfair Display', Georgia, serif`,
                      color: cardState.primaryColor,
                    }}
                  >
                    {cardState.partnerOne} &amp; {cardState.partnerTwo}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setRsvpModalOpen(false)}
                  className="p-2 rounded-full hover:bg-black/5 text-[#6E6A63] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {submittedRsvp ? (
                <div className="py-6 text-center space-y-5">
                  <CheckCircle2
                    className="w-11 h-11 mx-auto"
                    style={{ color: cardState.primaryColor }}
                  />
                  <div>
                    <h4
                      className="text-2xl font-bold"
                      style={{
                        fontFamily: `'Playfair Display', Georgia, serif`,
                        color: cardState.primaryColor,
                      }}
                    >
                      Thank You, {submittedRsvp.guestName}!
                    </h4>
                    <p className="text-xs text-[#666159] mt-1">
                      Your RSVP for {cardState.partnerOne} &amp; {cardState.partnerTwo}’s Marriage
                      Celebration has been recorded.
                    </p>
                  </div>

                  {submittedRsvp.response !== 'declined' && (
                    <div className="p-5 rounded-2xl bg-white border border-[#E6DED2] inline-block space-y-2">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[#7A7368] font-semibold">
                        Digital Guest Pass
                      </p>
                      <div className="p-2 bg-white inline-block">
                        <QRCodeSVG
                          value={`WEDDING:${cardState.partnerOne}-${cardState.partnerTwo}:${submittedRsvp.inviteCode}`}
                          size={140}
                        />
                      </div>
                      <p className="text-xs font-mono font-bold tracking-widest text-[#25231F]">
                        {submittedRsvp.inviteCode}
                      </p>
                    </div>
                  )}

                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        setSubmittedRsvp(null);
                        setRsvpModalOpen(false);
                      }}
                      className="px-6 py-2.5 rounded-full text-xs uppercase tracking-widest font-semibold text-white cursor-pointer"
                      style={{ backgroundColor: cardState.primaryColor }}
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleRsvpSubmit} className="mt-5 space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { id: 'accepted', label: 'Joyfully Accept' },
                        { id: 'maybe', label: 'Tentative' },
                        { id: 'declined', label: 'Regretfully Decline' },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setRsvpDecision(opt.id)}
                        className="py-2.5 px-2 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer"
                        style={{
                          backgroundColor:
                            rsvpDecision === opt.id ? cardState.primaryColor : '#FFFFFF',
                          color: rsvpDecision === opt.id ? '#FFFFFF' : cardState.primaryColor,
                          borderColor:
                            rsvpDecision === opt.id ? cardState.primaryColor : '#DFD7CA',
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#5E584F] mb-1">
                      Full Name (Couple or Family) *
                    </label>
                    <input
                      type="text"
                      required
                      value={rsvpName}
                      onChange={(e) => setRsvpName(e.target.value)}
                      placeholder="e.g. Oliver & Charlotte Kensington"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DCD3C6] text-sm focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#5E584F] mb-1">
                        Email or Phone *
                      </label>
                      <input
                        type="text"
                        required
                        value={rsvpContact}
                        onChange={(e) => setRsvpContact(e.target.value)}
                        placeholder="oliver@example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DCD3C6] text-sm focus:outline-none"
                      />
                    </div>

                    {rsvpDecision !== 'declined' && (
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#5E584F] mb-1">
                          Number of Guests
                        </label>
                        <select
                          value={rsvpCount}
                          onChange={(e) => setRsvpCount(Number(e.target.value))}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DCD3C6] text-sm focus:outline-none"
                        >
                          {[1, 2, 3, 4, 5, 6].map((n) => (
                            <option key={n} value={n}>
                              {n} {n === 1 ? 'Guest' : 'Guests'}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {rsvpDecision !== 'declined' && (
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#5E584F] mb-1">
                        Dining Preference
                      </label>
                      <select
                        value={rsvpMeal}
                        onChange={(e) => setRsvpMeal(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DCD3C6] text-sm focus:outline-none"
                      >
                        <option value="Mediterranean Tasting Menu">Mediterranean Tasting Menu</option>
                        <option value="Classic European Menu">Classic European Menu</option>
                        <option value="Vegetarian Gourmet">Vegetarian Gourmet</option>
                        <option value="Vegan / Plant-Based">Vegan / Plant-Based</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#5E584F] mb-1">
                      Warm Wishes for {cardState.partnerOne} &amp; {cardState.partnerTwo}
                    </label>
                    <textarea
                      rows={2}
                      value={rsvpMessage}
                      onChange={(e) => setRsvpMessage(e.target.value)}
                      placeholder="So excited to celebrate with you both..."
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#DCD3C6] text-sm focus:outline-none"
                    />
                  </div>

                  {rsvpError && <p className="text-xs text-red-700">{rsvpError}</p>}

                  <button
                    type="submit"
                    disabled={rsvpSubmitting}
                    className="w-full py-3.5 rounded-full text-xs uppercase tracking-[0.2em] font-bold text-white shadow-md cursor-pointer disabled:opacity-50"
                    style={{ backgroundColor: cardState.primaryColor }}
                  >
                    {rsvpSubmitting ? 'Confirming RSVP...' : 'Send RSVP & Get Guest Pass'}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
