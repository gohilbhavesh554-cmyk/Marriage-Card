import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  Trash2,
  Smartphone,
  Monitor,
  Wand2,
  Upload,
  Globe,
  Save,
} from 'lucide-react';
import { useVowora } from '../context/VoworaContext';
import {
  TEMPLATE_LIBRARY,
  ASSETS,
} from '../data/templatesAndDemo';
import {
  WeddingProject,
  WeddingEventItem,
  LanguageCode,
} from '../types/vowora';
import { InvitationCanvas } from '../components/InvitationCanvas';
import { VoworaStudioModal } from '../components/VoworaStudioModal';

const STEPS = [
  { step: 1, name: 'Choose Your Style' },
  { step: 2, name: 'The Couple' },
  { step: 3, name: 'Wedding Events' },
  { step: 4, name: 'Make It Personal' },
  { step: 5, name: 'Guest Experience' },
  { step: 6, name: 'Preview & Publish' },
] as const;

const FUNCTION_PRESETS = [
  'Engagement',
  'Mehndi',
  'Haldi',
  'Sangeet',
  'Wedding Ceremony',
  'Reception',
  'After Party',
];

const PALETTE_PRESETS = [
  { name: 'Editorial Ivory & Champagne', primary: '#292720', accent: '#B99A6A', bg: '#FAF8F4', text: '#292720' },
  { name: 'Royal Palace Maroon & Gold', primary: '#4A181D', accent: '#C5A059', bg: '#FDFBF7', text: '#2C1517' },
  { name: 'Botanical Sage & Forest', primary: '#34453A', accent: '#87917A', bg: '#F7F8F4', text: '#243028' },
  { name: 'Blush Garden Rose', primary: '#6D4346', accent: '#C78E89', bg: '#FDF9F8', text: '#3A2829' },
  { name: 'Terracotta Mehndi Clay', primary: '#8F4730', accent: '#B9765E', bg: '#FCF8F2', text: '#33221C' },
  { name: 'Black Tie Monochrome', primary: '#181816', accent: '#8E8A80', bg: '#FAF9F6', text: '#181816' },
];

export const CreateWizardPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    activeDraft,
    activeDraftEvents,
    setActiveDraft,
    setActiveDraftEvents,
    createBlankProject,
    saveWeddingProject,
  } = useVowora();

  const [currentStep, setCurrentStep] = useState(1);
  const [validationError, setValidationError] = useState('');
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [studioOpen, setStudioOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState('');

  // Initialize draft on first visit or when ?template= query param is provided
  useEffect(() => {
    const tplParam = searchParams.get('template');
    if (!activeDraft || (tplParam && activeDraft.templateId !== tplParam)) {
      const { project, events } = createBlankProject(tplParam || 'modern-ivory');
      setActiveDraft(project);
      setActiveDraftEvents(events);
    }
  }, [searchParams]);

  if (!activeDraft) return null;

  const updateDraft = (patch: Partial<WeddingProject>) => {
    setValidationError('');
    setActiveDraft((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const updateTheme = (patch: Partial<WeddingProject['themeConfig']>) => {
    setActiveDraft((prev) =>
      prev
        ? {
            ...prev,
            themeConfig: { ...prev.themeConfig, ...patch },
          }
        : prev
    );
  };

  const updateSections = (patch: Partial<WeddingProject['sectionSettings']>) => {
    setActiveDraft((prev) =>
      prev
        ? {
            ...prev,
            sectionSettings: { ...prev.sectionSettings, ...patch },
          }
        : prev
    );
  };

  const handleSelectTemplate = (templateId: string) => {
    const tpl = TEMPLATE_LIBRARY.find((t) => t.id === templateId);
    if (!tpl) return;
    updateDraft({
      templateId: tpl.id,
      themeConfig: { ...tpl.defaultTheme },
    });
  };

  const handleImageFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'coverPhotoUrl' | 'couplePhotoUrl'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setValidationError('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }
    if (file.size > 3.5 * 1024 * 1024) {
      setValidationError('Image file must be under 3.5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateDraft({ [field]: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddEvent = (presetName = 'Celebration Function') => {
    const newEvt: WeddingEventItem = {
      eventId: `evt-${Date.now()}-${activeDraftEvents.length + 1}`,
      weddingId: activeDraft.weddingId,
      ownerId: activeDraft.ownerId,
      isPublic: true,
      name: presetName,
      description: 'Join us for music, hospitality, and joyous celebration.',
      date: activeDraft.weddingDate || '2027-04-18',
      startTime: '18:00',
      endTime: '22:00',
      venue: activeDraft.venueSummary || 'The Courtyard Venue',
      address: activeDraft.cityCountry || '',
      mapUrl: activeDraft.mapLink || '',
      dressCode: 'Festive & Formal Attire',
      sortOrder: activeDraftEvents.length,
    };
    setActiveDraftEvents((prev) => [...prev, newEvt]);
  };

  const handleUpdateEvent = (index: number, patch: Partial<WeddingEventItem>) => {
    setActiveDraftEvents((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, ...patch } : item))
    );
  };

  const handleRemoveEvent = (index: number) => {
    if (activeDraftEvents.length <= 1) {
      setValidationError('Please include at least one wedding event.');
      return;
    }
    setActiveDraftEvents((prev) => prev.filter((_, idx) => idx !== index));
  };

  const validateCurrentStep = (): boolean => {
    if (currentStep === 2) {
      if (!activeDraft.partnerOne.trim() || !activeDraft.partnerTwo.trim()) {
        setValidationError('Please enter both partner names before continuing.');
        return false;
      }
    }
    if (currentStep === 3) {
      if (activeDraftEvents.length === 0) {
        setValidationError('Please add at least one wedding ceremony or event.');
        return false;
      }
      for (const evt of activeDraftEvents) {
        if (!evt.name.trim() || !evt.date.trim() || !evt.venue.trim()) {
          setValidationError('Each wedding event requires a name, date, and venue.');
          return false;
        }
      }
    }
    if (currentStep === 6) {
      const slugClean = activeDraft.slug.trim().toLowerCase();
      if (slugClean.length < 2 || !/^[a-z0-9-]+$/.test(slugClean)) {
        setValidationError(
          'Custom URL slug may only contain lowercase letters, numbers, and hyphens.'
        );
        return false;
      }
    }
    setValidationError('');
    return true;
  };

  const handleNextStep = () => {
    if (!validateCurrentStep()) return;
    setCurrentStep((s) => Math.min(6, s + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevStep = () => {
    setValidationError('');
    setCurrentStep((s) => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const saved = await saveWeddingProject(activeDraft, activeDraftEvents, false);
      setActiveDraft(saved);
      setSavedNotice('Draft saved');
      setTimeout(() => setSavedNotice(''), 2500);
    } finally {
      setSaving(false);
    }
  };

  const handlePublishInvitation = async () => {
    if (!validateCurrentStep()) return;
    setSaving(true);
    try {
      const published = await saveWeddingProject(activeDraft, activeDraftEvents, true);
      setActiveDraft(published);
      navigate(`/editor/${published.weddingId}?published=true`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#292720] py-10 px-6 lg:px-12">
      <div className="max-w-[1440px] mx-auto space-y-8">
        {/* Top Progress Header */}
        <div className="bg-white border border-[#EAE5DC] p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#EAE5DC]">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[#B99A6A]">
                VOWORA Creation Studio · Step {currentStep} of 6
              </p>
              <h1 className="font-display text-3xl font-semibold text-[#292720]">
                {STEPS[currentStep - 1].name}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {savedNotice && (
                <span className="text-xs text-[#34453A] font-medium">{savedNotice}</span>
              )}
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={saving}
                className="px-4 py-2 text-xs uppercase tracking-wider border border-[#EAE5DC] hover:border-[#292720] inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save Draft'}</span>
              </button>
              <button
                type="button"
                onClick={ async () => {
                  const saved = await saveWeddingProject(activeDraft, activeDraftEvents, false);
                  navigate(`/editor/${saved.weddingId}`);
                }}
                className="px-4 py-2 text-xs uppercase tracking-wider bg-[#ECE8DF] hover:bg-[#dfdad0] text-[#292720] cursor-pointer whitespace-nowrap"
              >
                Open Full Editor
              </button>
            </div>
          </div>

          {/* 6-Step Progress Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-5">
            {STEPS.map((s) => {
              const isActive = s.step === currentStep;
              const isCompleted = s.step < currentStep;
              return (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => {
                    if (s.step < currentStep || validateCurrentStep()) {
                      setCurrentStep(s.step);
                    }
                  }}
                  className={`text-left p-3 border transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#292720] text-white border-[#292720]'
                      : isCompleted
                      ? 'bg-[#FAF8F4] text-[#292720] border-[#B99A6A]'
                      : 'bg-white text-[#77746B] border-[#EAE5DC]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-wider opacity-80">
                    <span>0{s.step}</span>
                    {isCompleted && <Check className="w-3.5 h-3.5 text-[#B99A6A]" />}
                  </div>
                  <div className="text-xs font-medium mt-1 truncate">{s.name}</div>
                </button>
              );
            })}
          </div>
        </div>

        {validationError && (
          <div className="p-4 bg-red-50 border border-red-300 text-xs text-red-900 font-medium">
            {validationError}
          </div>
        )}

        {/* Main Workspace Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form Column */}
          <div className="lg:col-span-7 bg-white border border-[#EAE5DC] p-6 sm:p-8 space-y-6">
            {/* STEP 1: CHOOSE YOUR STYLE */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-medium text-[#77746B] mb-3">
                    1. Select Your Wedding Template
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {TEMPLATE_LIBRARY.map((tpl) => {
                      const selected = activeDraft.templateId === tpl.id;
                      return (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={() => handleSelectTemplate(tpl.id)}
                          className={`text-left p-4 border transition-all cursor-pointer ${
                            selected
                              ? 'border-[#292720] bg-[#FAF8F4]'
                              : 'border-[#EAE5DC] hover:border-[#B99A6A]'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs text-[#77746B] mb-1">
                            <span>{tpl.category}</span>
                            {selected && (
                              <span className="text-[#292720] font-semibold">Selected</span>
                            )}
                          </div>
                          <div className="font-display text-2xl font-semibold text-[#292720]">
                            {tpl.name}
                          </div>
                          <div className="text-xs text-[#77746B] mt-1">{tpl.paletteLabel}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-medium text-[#77746B] mb-3">
                    2. Preferred Color Palette
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PALETTE_PRESETS.map((pal) => (
                      <button
                        key={pal.name}
                        type="button"
                        onClick={() =>
                          updateTheme({
                            primaryColor: pal.primary,
                            accentColor: pal.accent,
                            bgColor: pal.bg,
                            textColor: pal.text,
                          })
                        }
                        className="p-3.5 border border-[#EAE5DC] hover:border-[#292720] flex items-center gap-3 text-left cursor-pointer"
                      >
                        <div className="flex items-center -space-x-1.5 shrink-0">
                          <span
                            className="w-5 h-5 rounded-full border border-black/20"
                            style={{ backgroundColor: pal.primary }}
                          />
                          <span
                            className="w-5 h-5 rounded-full border border-black/20"
                            style={{ backgroundColor: pal.accent }}
                          />
                          <span
                            className="w-5 h-5 rounded-full border border-black/20"
                            style={{ backgroundColor: pal.bg }}
                          />
                        </div>
                        <span className="text-xs font-medium text-[#292720]">{pal.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: THE COUPLE */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="wizard-partner-one"
                      className="block text-xs uppercase tracking-wider text-[#77746B] mb-1.5"
                    >
                      Partner One Name *
                    </label>
                    <input
                      id="wizard-partner-one"
                      type="text"
                      value={activeDraft.partnerOne}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateDraft({
                          partnerOne: val,
                          slug: `${val}-and-${activeDraft.partnerTwo}`
                            .toLowerCase()
                            .replace(/[^a-z0-9-]+/g, '-'),
                        });
                      }}
                      className="w-full px-3.5 py-2.5 text-sm border border-[#EAE5DC] focus:outline-none focus:border-[#292720]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="wizard-partner-two"
                      className="block text-xs uppercase tracking-wider text-[#77746B] mb-1.5"
                    >
                      Partner Two Name *
                    </label>
                    <input
                      id="wizard-partner-two"
                      type="text"
                      value={activeDraft.partnerTwo}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateDraft({
                          partnerTwo: val,
                          slug: `${activeDraft.partnerOne}-and-${val}`
                            .toLowerCase()
                            .replace(/[^a-z0-9-]+/g, '-'),
                        });
                      }}
                      className="w-full px-3.5 py-2.5 text-sm border border-[#EAE5DC] focus:outline-none focus:border-[#292720]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="wizard-family-one"
                      className="block text-xs uppercase tracking-wider text-[#77746B] mb-1.5"
                    >
                      Partner One Family Hosts (Optional)
                    </label>
                    <input
                      id="wizard-family-one"
                      type="text"
                      value={activeDraft.familyOne}
                      onChange={(e) => updateDraft({ familyOne: e.target.value })}
                      placeholder="e.g. Smt. Kavita & Shri Rajeshwar Singhania"
                      className="w-full px-3.5 py-2.5 text-sm border border-[#EAE5DC] focus:outline-none focus:border-[#292720]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="wizard-family-two"
                      className="block text-xs uppercase tracking-wider text-[#77746B] mb-1.5"
                    >
                      Partner Two Family Hosts (Optional)
                    </label>
                    <input
                      id="wizard-family-two"
                      type="text"
                      value={activeDraft.familyTwo}
                      onChange={(e) => updateDraft({ familyTwo: e.target.value })}
                      placeholder="e.g. Smt. Nandini & Shri Vikramaditya Kapadia"
                      className="w-full px-3.5 py-2.5 text-sm border border-[#EAE5DC] focus:outline-none focus:border-[#292720]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="wizard-story"
                      className="block text-xs uppercase tracking-wider text-[#77746B]"
                    >
                      Short Love Story
                    </label>
                    <button
                      type="button"
                      onClick={() => setStudioOpen(true)}
                      className="text-xs text-[#B99A6A] hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>Compose with Vowora Studio</span>
                    </button>
                  </div>
                  <textarea
                    id="wizard-story"
                    rows={4}
                    value={activeDraft.story}
                    onChange={(e) => updateDraft({ story: e.target.value })}
                    className="w-full p-3.5 text-sm border border-[#EAE5DC] focus:outline-none focus:border-[#292720]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#77746B] mb-2">
                    Couple Portrait Photograph
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="px-4 py-2.5 bg-[#FAF8F4] border border-[#EAE5DC] hover:border-[#292720] text-xs uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Custom Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageFileUpload(e, 'coverPhotoUrl')}
                        className="hidden"
                      />
                    </label>
                    {[
                      { label: 'Palace Portrait', url: ASSETS.COUPLE_AARAV_MEERA },
                      { label: 'Courtyard Twilight', url: ASSETS.VENUE_PALACE },
                      { label: 'Olive Grove Table', url: ASSETS.TABLE_SETTING },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => updateDraft({ coverPhotoUrl: preset.url })}
                        className={`px-3 py-2 text-xs border cursor-pointer ${
                          activeDraft.coverPhotoUrl === preset.url
                            ? 'bg-[#292720] text-white border-[#292720]'
                            : 'bg-white text-[#77746B] border-[#EAE5DC]'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: WEDDING EVENTS */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-5 border-b border-[#EAE5DC]">
                  <div>
                    <label
                      htmlFor="wizard-primary-date"
                      className="block text-xs uppercase tracking-wider text-[#77746B] mb-1.5"
                    >
                      Primary Wedding Date *
                    </label>
                    <input
                      id="wizard-primary-date"
                      type="date"
                      value={activeDraft.weddingDate}
                      onChange={(e) => updateDraft({ weddingDate: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-[#EAE5DC]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="wizard-timezone"
                      className="block text-xs uppercase tracking-wider text-[#77746B] mb-1.5"
                    >
                      Timezone
                    </label>
                    <select
                      id="wizard-timezone"
                      value={activeDraft.timezone}
                      onChange={(e) => updateDraft({ timezone: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-[#EAE5DC] bg-white"
                    >
                      <option value="Asia/Kolkata">IST (Asia/Kolkata)</option>
                      <option value="America/New_York">EST (America/New_York)</option>
                      <option value="America/Los_Angeles">PST (America/Los_Angeles)</option>
                      <option value="Europe/London">GMT/BST (Europe/London)</option>
                      <option value="Europe/Rome">CET (Europe/Rome)</option>
                      <option value="Asia/Dubai">GST (Asia/Dubai)</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="wizard-city"
                      className="block text-xs uppercase tracking-wider text-[#77746B] mb-1.5"
                    >
                      City &amp; Destination
                    </label>
                    <input
                      id="wizard-city"
                      type="text"
                      value={activeDraft.cityCountry}
                      onChange={(e) => updateDraft({ cityCountry: e.target.value })}
                      placeholder="Udaipur, Rajasthan"
                      className="w-full px-3 py-2 text-sm border border-[#EAE5DC]"
                    />
                  </div>
                </div>

                {/* Quick Add Ceremony Buttons */}
                <div>
                  <span className="block text-xs uppercase tracking-wider text-[#77746B] mb-2">
                    Quick-Add Wedding Function:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {FUNCTION_PRESETS.map((fnName) => (
                      <button
                        key={fnName}
                        type="button"
                        onClick={() => handleAddEvent(fnName)}
                        className="px-3 py-1.5 text-xs bg-[#FAF8F4] border border-[#EAE5DC] hover:border-[#292720] inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3 h-3 text-[#B99A6A]" />
                        <span>{fnName}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Event Cards */}
                <div className="space-y-4">
                  {activeDraftEvents.map((evt, idx) => (
                    <div
                      key={evt.eventId || idx}
                      className="p-5 bg-[#FAF8F4] border border-[#EAE5DC] space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs uppercase tracking-widest text-[#B99A6A] font-medium">
                          Function 0{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveEvent(idx)}
                          className="text-xs text-red-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] uppercase tracking-wider text-[#77746B] mb-1">
                            Event Name *
                          </label>
                          <input
                            type="text"
                            value={evt.name}
                            onChange={(e) => handleUpdateEvent(idx, { name: e.target.value })}
                            className="w-full px-3 py-2 text-sm bg-white border border-[#EAE5DC]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] uppercase tracking-wider text-[#77746B] mb-1">
                            Event Date *
                          </label>
                          <input
                            type="date"
                            value={evt.date}
                            onChange={(e) => handleUpdateEvent(idx, { date: e.target.value })}
                            className="w-full px-3 py-2 text-sm bg-white border border-[#EAE5DC]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] uppercase tracking-wider text-[#77746B] mb-1">
                            Start Time
                          </label>
                          <input
                            type="time"
                            value={evt.startTime}
                            onChange={(e) => handleUpdateEvent(idx, { startTime: e.target.value })}
                            className="w-full px-3 py-2 text-sm bg-white border border-[#EAE5DC]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] uppercase tracking-wider text-[#77746B] mb-1">
                            End Time
                          </label>
                          <input
                            type="time"
                            value={evt.endTime}
                            onChange={(e) => handleUpdateEvent(idx, { endTime: e.target.value })}
                            className="w-full px-3 py-2 text-sm bg-white border border-[#EAE5DC]"
                          />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <label className="block text-[11px] uppercase tracking-wider text-[#77746B] mb-1">
                            Dress Code
                          </label>
                          <input
                            type="text"
                            value={evt.dressCode}
                            onChange={(e) => handleUpdateEvent(idx, { dressCode: e.target.value })}
                            placeholder="Black Tie / Heritage"
                            className="w-full px-3 py-2 text-sm bg-white border border-[#EAE5DC]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] uppercase tracking-wider text-[#77746B] mb-1">
                            Venue Name *
                          </label>
                          <input
                            type="text"
                            value={evt.venue}
                            onChange={(e) => handleUpdateEvent(idx, { venue: e.target.value })}
                            className="w-full px-3 py-2 text-sm bg-white border border-[#EAE5DC]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] uppercase tracking-wider text-[#77746B] mb-1">
                            Venue Address
                          </label>
                          <input
                            type="text"
                            value={evt.address}
                            onChange={(e) => handleUpdateEvent(idx, { address: e.target.value })}
                            className="w-full px-3 py-2 text-sm bg-white border border-[#EAE5DC]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#77746B] mb-1">
                          Event Description
                        </label>
                        <textarea
                          rows={2}
                          value={evt.description}
                          onChange={(e) => handleUpdateEvent(idx, { description: e.target.value })}
                          className="w-full p-2.5 text-sm bg-white border border-[#EAE5DC]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: MAKE IT PERSONAL */}
            {currentStep === 4 && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs uppercase tracking-wider text-[#77746B]">
                    Primary Invitation Language
                  </label>
                  <div className="flex items-center gap-2">
                    {(
                      [
                        { code: 'en', label: 'English' },
                        { code: 'hi', label: 'हिन्दी (Hindi)' },
                        { code: 'gu', label: 'ગુજરાતી (Gujarati)' },
                      ] as const
                    ).map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => updateDraft({ language: lang.code as LanguageCode })}
                        className={`px-3.5 py-1.5 text-xs border cursor-pointer ${
                          activeDraft.language === lang.code
                            ? 'bg-[#292720] text-white border-[#292720]'
                            : 'bg-white text-[#77746B] border-[#EAE5DC]'
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="wizard-headline"
                      className="block text-xs uppercase tracking-wider text-[#77746B]"
                    >
                      Romantic Headline
                    </label>
                    <button
                      type="button"
                      onClick={() => setStudioOpen(true)}
                      className="text-xs text-[#B99A6A] hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>Vowora Studio Suggestions</span>
                    </button>
                  </div>
                  <input
                    id="wizard-headline"
                    type="text"
                    value={activeDraft.headline}
                    onChange={(e) => updateDraft({ headline: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-[#EAE5DC]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="wizard-wording"
                    className="block text-xs uppercase tracking-wider text-[#77746B] mb-1.5"
                  >
                    Formal Invitation Wording
                  </label>
                  <textarea
                    id="wizard-wording"
                    rows={4}
                    value={activeDraft.invitationWording}
                    onChange={(e) => updateDraft({ invitationWording: e.target.value })}
                    className="w-full p-3.5 text-sm border border-[#EAE5DC]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#77746B] mb-1.5">
                      Display Serif Font
                    </label>
                    <select
                      value={activeDraft.themeConfig.fontHeading}
                      onChange={(e) => updateTheme({ fontHeading: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm border border-[#EAE5DC] bg-white"
                    >
                      <option value="Cormorant Garamond">Cormorant Garamond (Luxury Editorial)</option>
                      <option value="Playfair Display">Playfair Display (Classic High-Contrast)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#77746B] mb-1.5">
                      Ambient Musical Score
                    </label>
                    <select
                      value={activeDraft.themeConfig.musicStyle}
                      onChange={(e) => updateTheme({ musicStyle: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 text-sm border border-[#EAE5DC] bg-white"
                    >
                      <option value="piano-romance">Warm Piano Romance</option>
                      <option value="sitar-ambient">Classical Sitar &amp; Tanpura</option>
                      <option value="strings-serenade">String Quartet Serenade</option>
                      <option value="none">No Ambient Score</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: GUEST EXPERIENCE */}
            {currentStep === 5 && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="wizard-rsvp-deadline"
                      className="block text-xs uppercase tracking-wider text-[#77746B] mb-1.5"
                    >
                      RSVP Response Deadline
                    </label>
                    <input
                      id="wizard-rsvp-deadline"
                      type="date"
                      value={activeDraft.rsvpDeadline}
                      onChange={(e) => updateDraft({ rsvpDeadline: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm border border-[#EAE5DC]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#77746B] mb-1.5">
                      Guest Access Mode
                    </label>
                    <select
                      value={activeDraft.isPrivate ? 'private' : 'public'}
                      onChange={(e) => updateDraft({ isPrivate: e.target.value === 'private' })}
                      className="w-full px-3.5 py-2.5 text-sm border border-[#EAE5DC] bg-white"
                    >
                      <option value="public">Shareable Public Link (/i/{activeDraft.slug})</option>
                      <option value="private">Private Passcode Protected</option>
                    </select>
                  </div>
                </div>

                {activeDraft.isPrivate && (
                  <div>
                    <label
                      htmlFor="wizard-passcode"
                      className="block text-xs uppercase tracking-wider text-[#77746B] mb-1.5"
                    >
                      Guest Passcode
                    </label>
                    <input
                      id="wizard-passcode"
                      type="text"
                      value={activeDraft.accessPasscode}
                      onChange={(e) => updateDraft({ accessPasscode: e.target.value })}
                      placeholder="e.g. UDAIPUR2027"
                      className="w-full px-3.5 py-2.5 text-sm border border-[#EAE5DC]"
                    />
                  </div>
                )}

                <div className="space-y-3 pt-2">
                  <span className="block text-xs uppercase tracking-wider text-[#77746B]">
                    Enabled Website Sections &amp; RSVP Options
                  </span>
                  {(
                    [
                      { key: 'showRsvp', label: 'Collect Guest RSVPs & Generate QR Passes' },
                      { key: 'enablePlusOnes', label: 'Allow Guests to Specify Party Count (+1s)' },
                      { key: 'enableMealPreference', label: 'Collect Culinary & Dietary Preferences' },
                      { key: 'showStory', label: 'Display Couple’s Love Story Section' },
                      { key: 'showCountdown', label: 'Display Live Wedding Countdown' },
                      { key: 'showGallery', label: 'Display Portraits & Moments Gallery' },
                      { key: 'showDressCode', label: 'Display Attire & Palette Guide' },
                    ] as const
                  ).map((item) => (
                    <label
                      key={item.key}
                      className="flex items-center justify-between p-3.5 border border-[#EAE5DC] bg-[#FAF8F4] cursor-pointer"
                    >
                      <span className="text-xs font-medium text-[#292720]">{item.label}</span>
                      <input
                        type="checkbox"
                        checked={Boolean(activeDraft.sectionSettings[item.key])}
                        onChange={(e) => updateSections({ [item.key]: e.target.checked })}
                        className="w-4 h-4 accent-[#292720]"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 6: PREVIEW AND PUBLISH */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div className="p-5 bg-[#FAF8F4] border border-[#EAE5DC] space-y-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#B99A6A]">
                    <Globe className="w-4 h-4" />
                    <span>Personalized Wedding Website Link</span>
                  </div>

                  <div>
                    <label
                      htmlFor="wizard-slug"
                      className="block text-xs text-[#77746B] mb-1.5"
                    >
                      Customize your shareable wedding URL slug:
                    </label>
                    <div className="flex items-center border border-[#EAE5DC] bg-white">
                      <span className="px-3.5 py-2.5 text-xs text-[#77746B] bg-[#FAF8F4] border-r border-[#EAE5DC] select-none">
                        vowora.studio/i/
                      </span>
                      <input
                        id="wizard-slug"
                        type="text"
                        value={activeDraft.slug}
                        onChange={(e) =>
                          updateDraft({
                            slug: e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9-]+/g, '-'),
                          })
                        }
                        className="flex-1 px-3.5 py-2.5 text-sm focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={saving}
                    className="py-4 px-5 border border-[#292720] text-[#292720] text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#FAF8F4] cursor-pointer"
                  >
                    Save as Draft
                  </button>
                  <button
                    type="button"
                    onClick={handlePublishInvitation}
                    disabled={saving}
                    className="py-4 px-5 bg-[#292720] hover:bg-[#34453A] text-white text-xs uppercase tracking-[0.2em] font-medium cursor-pointer"
                  >
                    {saving ? 'Publishing...' : 'Publish Wedding Website'}
                  </button>
                </div>
              </div>
            )}

            {/* Wizard Bottom Navigation */}
            <div className="pt-6 border-t border-[#EAE5DC] flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={currentStep === 1}
                className="px-5 py-2.5 text-xs uppercase tracking-wider border border-[#EAE5DC] hover:border-[#292720] inline-flex items-center gap-2 disabled:opacity-40 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous Step</span>
              </button>

              {currentStep < 6 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-2.5 bg-[#292720] hover:bg-[#34453A] text-white text-xs uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : null}
            </div>
          </div>

          {/* Right Live Preview Column */}
          <div className="lg:col-span-5 sticky top-24 space-y-3">
            <div className="flex items-center justify-between bg-white border border-[#EAE5DC] px-4 py-2.5">
              <span className="text-xs uppercase tracking-widest text-[#77746B]">
                Real-Time Preview
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`px-2.5 py-1 text-xs flex items-center gap-1 cursor-pointer ${
                    previewDevice === 'mobile' ? 'bg-[#292720] text-white' : 'text-[#77746B]'
                  }`}
                >
                  <Smartphone className="w-3 h-3" />
                  <span>Mobile</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`px-2.5 py-1 text-xs flex items-center gap-1 cursor-pointer ${
                    previewDevice === 'desktop' ? 'bg-[#292720] text-white' : 'text-[#77746B]'
                  }`}
                >
                  <Monitor className="w-3 h-3" />
                  <span>Desktop</span>
                </button>
              </div>
            </div>

            <div className="bg-[#ECE8DF]/60 border border-[#EAE5DC] p-3 flex justify-center">
              <div
                className={`bg-white border border-[#EAE5DC] shadow-md max-h-[640px] overflow-y-auto transition-all ${
                  previewDevice === 'mobile' ? 'w-full max-w-[390px]' : 'w-full'
                }`}
              >
                <InvitationCanvas
                  project={activeDraft}
                  events={activeDraftEvents}
                  isEditorPreview={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <VoworaStudioModal
        isOpen={studioOpen}
        onClose={() => setStudioOpen(false)}
        project={activeDraft}
        onApplyText={(field, text) => updateDraft({ [field]: text })}
      />
    </div>
  );
};
