import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { toPng } from 'html-to-image';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowLeft,
  Undo2,
  Redo2,
  Smartphone,
  Monitor,
  Download,
  QrCode,
  Globe,
  Wand2,
  Printer,
  Check,
  Copy,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Upload,
  ExternalLink,
  Users,
  X,
} from 'lucide-react';
import { useVowora } from '../context/VoworaContext';
import { WeddingProject, WeddingEventItem, LanguageCode } from '../types/vowora';
import { TEMPLATE_LIBRARY, ASSETS } from '../data/templatesAndDemo';
import { InvitationCanvas } from '../components/InvitationCanvas';
import { VoworaStudioModal } from '../components/VoworaStudioModal';

interface HistoryEntry {
  project: WeddingProject;
  events: WeddingEventItem[];
}

export const EditorPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loadWeddingDetails, saveWeddingProject } = useVowora();

  const [project, setProject] = useState<WeddingProject | null>(null);
  const [events, setEvents] = useState<WeddingEventItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Undo / Redo history stack
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [activeLeftTab, setActiveLeftTab] = useState<'couple' | 'events' | 'wording' | 'sections'>(
    'couple'
  );
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [saveStatus, setSaveStatus] = useState<'Saved' | 'Saving...' | 'Unsaved edits'>('Saved');
  const [studioOpen, setStudioOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(searchParams.get('published') === 'true');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [exportingPng, setExportingPng] = useState(false);

  const canvasExportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      if (!projectId) return;
      setLoading(true);
      const data = await loadWeddingDetails(projectId);
      if (mounted && data.project) {
        setProject(data.project);
        setEvents(data.events);
        setHistory([{ project: data.project, events: data.events }]);
        setHistoryIndex(0);
      }
      if (mounted) setLoading(false);
    };
    init();
    return () => {
      mounted = false;
    };
  }, [projectId]);

  const recordChange = (nextProject: WeddingProject, nextEvents: WeddingEventItem[]) => {
    setProject(nextProject);
    setEvents(nextEvents);
    setSaveStatus('Unsaved edits');
    setHistory((prev) => {
      const sliced = prev.slice(0, historyIndex + 1);
      const updated = [...sliced, { project: nextProject, events: nextEvents }].slice(-25);
      setHistoryIndex(updated.length - 1);
      return updated;
    });
  };

  const updateProject = (patch: Partial<WeddingProject>) => {
    if (!project) return;
    recordChange({ ...project, ...patch }, events);
  };

  const updateTheme = (patch: Partial<WeddingProject['themeConfig']>) => {
    if (!project) return;
    recordChange(
      {
        ...project,
        themeConfig: { ...project.themeConfig, ...patch },
      },
      events
    );
  };

  const updateSections = (patch: Partial<WeddingProject['sectionSettings']>) => {
    if (!project) return;
    recordChange(
      {
        ...project,
        sectionSettings: { ...project.sectionSettings, ...patch },
      },
      events
    );
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevEntry = history[historyIndex - 1];
      setProject(prevEntry.project);
      setEvents(prevEntry.events);
      setHistoryIndex(historyIndex - 1);
      setSaveStatus('Unsaved edits');
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextEntry = history[historyIndex + 1];
      setProject(nextEntry.project);
      setEvents(nextEntry.events);
      setHistoryIndex(historyIndex + 1);
      setSaveStatus('Unsaved edits');
    }
  };

  const handleSave = async (publishNow = false) => {
    if (!project) return;
    setSaveStatus('Saving...');
    try {
      const saved = await saveWeddingProject(project, events, publishNow);
      setProject(saved);
      setSaveStatus('Saved');
      if (publishNow) {
        setShareModalOpen(true);
      }
    } catch {
      setSaveStatus('Unsaved edits');
    }
  };

  const handleExportPng = async () => {
    if (!canvasExportRef.current || !project) return;
    setExportingPng(true);
    try {
      const dataUrl = await toPng(canvasExportRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = `${project.slug || 'vowora-invitation'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('PNG export failed:', error);
    } finally {
      setExportingPng(false);
    }
  };

  const handlePhotoUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'coverPhotoUrl' | 'couplePhotoUrl'
  ) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/') || file.size > 3.5 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateProject({ [field]: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleMoveEvent = (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= events.length || !project) return;
    const copy = [...events];
    const [removed] = copy.splice(index, 1);
    copy.splice(targetIdx, 0, removed);
    const reindexed = copy.map((e, idx) => ({ ...e, sortOrder: idx }));
    recordChange(project, reindexed);
  };

  if (loading || !project) {
    return (
      <div className="min-h-screen bg-[#242720] text-[#FAF8F4] flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <div className="font-display text-3xl tracking-widest">VOWORA STUDIO</div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#B99A6A]">
            Loading Wedding Workspace...
          </p>
        </div>
      </div>
    );
  }

  const publicUrl = `${window.location.origin}/i/${project.slug}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="h-screen flex flex-col bg-[#242720] text-[#FAF8F4] overflow-hidden">
      {/* TOP EDITOR TOOLBAR */}
      <header className="h-16 px-4 lg:px-6 bg-[#1B1D18] border-b border-white/10 flex items-center justify-between gap-4 shrink-0 no-print">
        {/* Left: Back & Project Name */}
        <div className="flex items-center gap-4 min-w-0">
          <Link
            to="/dashboard"
            className="p-2 text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="truncate">
            <div className="flex items-center gap-2">
              <span className="font-display text-lg font-medium text-white truncate">
                {project.partnerOne} &amp; {project.partnerTwo}
              </span>
              <span className="text-[11px] uppercase tracking-widest text-[#B99A6A]">
                · {project.status === 'published' ? 'Published' : 'Draft'}
              </span>
            </div>
            <div className="text-[11px] text-white/50">{saveStatus}</div>
          </div>

          <div className="hidden sm:flex items-center gap-1 border-l border-white/10 pl-3">
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              aria-label="Undo"
              className="p-1.5 text-white/70 hover:text-white disabled:opacity-30 cursor-pointer"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              aria-label="Redo"
              className="p-1.5 text-white/70 hover:text-white disabled:opacity-30 cursor-pointer"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center: Viewport Switcher & Vowora Studio AI */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center bg-black/30 p-1 border border-white/10">
            <button
              type="button"
              onClick={() => setPreviewDevice('desktop')}
              className={`px-3 py-1 text-xs flex items-center gap-1.5 cursor-pointer ${
                previewDevice === 'desktop' ? 'bg-[#B99A6A] text-[#1B1D18] font-medium' : 'text-white/70'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice('mobile')}
              className={`px-3 py-1 text-xs flex items-center gap-1.5 cursor-pointer ${
                previewDevice === 'mobile' ? 'bg-[#B99A6A] text-[#1B1D18] font-medium' : 'text-white/70'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setStudioOpen(true)}
            className="px-3.5 py-1.5 text-xs bg-white/10 hover:bg-white/15 text-[#ECE8DF] border border-white/15 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Wand2 className="w-3.5 h-3.5 text-[#B99A6A]" />
            <span>Vowora Studio</span>
          </button>
        </div>

        {/* Right: Export, QR, Guests, Save & Publish */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to={`/guests/${project.weddingId}`}
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 text-xs text-white/80 hover:text-white border border-white/15"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Guests &amp; RSVPs</span>
          </Link>

          <button
            type="button"
            onClick={handleExportPng}
            disabled={exportingPng}
            title="Export Invitation as PNG"
            className="px-3 py-2 text-xs text-white/80 hover:text-white border border-white/15 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{exportingPng ? 'Exporting...' : 'PNG'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShareModalOpen(true)}
            title="QR Code & Shareable Link"
            className="px-3 py-2 text-xs text-white/80 hover:text-white border border-white/15 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">QR &amp; Link</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave(false)}
            className="px-3.5 py-2 text-xs text-white bg-white/10 hover:bg-white/20 cursor-pointer whitespace-nowrap"
          >
            Save
          </button>

          <button
            type="button"
            onClick={() => handleSave(true)}
            className="px-4 py-2 text-xs uppercase tracking-wider font-medium bg-[#B99A6A] hover:bg-[#cbb082] text-[#1B1D18] cursor-pointer whitespace-nowrap"
          >
            Publish
          </button>
        </div>
      </header>

      {/* 3-PANEL WORKSPACE */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT PANEL: Section Navigation & Content Controls */}
        <aside className="w-full lg:w-80 xl:w-96 bg-[#FAF8F4] text-[#292720] border-b lg:border-b-0 lg:border-r border-[#EAE5DC] flex flex-col overflow-hidden shrink-0 no-print max-h-[38vh] lg:max-h-none">
          {/* Section Tabs */}
          <div className="grid grid-cols-4 border-b border-[#EAE5DC] bg-white text-[11px] font-medium uppercase tracking-wider shrink-0">
            {(
              [
                { id: 'couple', label: 'Couple' },
                { id: 'events', label: 'Events' },
                { id: 'wording', label: 'Wording' },
                { id: 'sections', label: 'Settings' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveLeftTab(tab.id)}
                className={`py-3 text-center border-b-2 transition-colors cursor-pointer ${
                  activeLeftTab === tab.id
                    ? 'border-[#292720] text-[#292720] bg-[#FAF8F4]'
                    : 'border-transparent text-[#77746B] hover:text-[#292720]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {activeLeftTab === 'couple' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#77746B] mb-1">
                      Partner One
                    </label>
                    <input
                      type="text"
                      value={project.partnerOne}
                      onChange={(e) => updateProject({ partnerOne: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-[#EAE5DC]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#77746B] mb-1">
                      Partner Two
                    </label>
                    <input
                      type="text"
                      value={project.partnerTwo}
                      onChange={(e) => updateProject({ partnerTwo: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-[#EAE5DC]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#77746B] mb-1">
                    Wedding Date
                  </label>
                  <input
                    type="date"
                    value={project.weddingDate}
                    onChange={(e) => updateProject({ weddingDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#EAE5DC]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#77746B] mb-1">
                    Primary Venue Name
                  </label>
                  <input
                    type="text"
                    value={project.venueSummary}
                    onChange={(e) => updateProject({ venueSummary: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#EAE5DC]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#77746B] mb-1">
                    City &amp; Country
                  </label>
                  <input
                    type="text"
                    value={project.cityCountry}
                    onChange={(e) => updateProject({ cityCountry: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#EAE5DC]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#77746B] mb-1">
                    Partner One Family Line
                  </label>
                  <input
                    type="text"
                    value={project.familyOne}
                    onChange={(e) => updateProject({ familyOne: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#EAE5DC]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#77746B] mb-1">
                    Partner Two Family Line
                  </label>
                  <input
                    type="text"
                    value={project.familyTwo}
                    onChange={(e) => updateProject({ familyTwo: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#EAE5DC]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#77746B] mb-1.5">
                    Cover Photograph
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <label className="px-3 py-2 bg-white border border-[#EAE5DC] hover:border-[#292720] text-xs inline-flex items-center gap-1.5 cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePhotoUpload(e, 'coverPhotoUrl')}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => updateProject({ coverPhotoUrl: ASSETS.COUPLE_AARAV_MEERA })}
                      className="px-2.5 py-1.5 text-xs bg-white border border-[#EAE5DC] cursor-pointer"
                    >
                      Palace Couple
                    </button>
                    <button
                      type="button"
                      onClick={() => updateProject({ coverPhotoUrl: ASSETS.VENUE_PALACE })}
                      className="px-2.5 py-1.5 text-xs bg-white border border-[#EAE5DC] cursor-pointer"
                    >
                      Udaipur Courtyard
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeLeftTab === 'events' && (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => {
                    const nextEvt: WeddingEventItem = {
                      eventId: `evt-${Date.now()}`,
                      weddingId: project.weddingId,
                      ownerId: project.ownerId,
                      isPublic: true,
                      name: 'New Celebration Function',
                      description: 'Music, dinner, and family blessings.',
                      date: project.weddingDate,
                      startTime: '18:00',
                      endTime: '22:00',
                      venue: project.venueSummary || 'Main Venue',
                      address: project.cityCountry || '',
                      mapUrl: project.mapLink || '',
                      dressCode: 'Formal Heritage',
                      sortOrder: events.length,
                    };
                    recordChange(project, [...events, nextEvt]);
                  }}
                  className="w-full py-2.5 px-4 bg-[#292720] text-white text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Function / Ceremony</span>
                </button>

                {events.map((evt, idx) => (
                  <div
                    key={evt.eventId || idx}
                    className="p-3.5 bg-white border border-[#EAE5DC] space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] uppercase tracking-widest text-[#B99A6A] font-medium">
                        0{idx + 1} · {evt.name}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveEvent(idx, -1)}
                          disabled={idx === 0}
                          className="p-1 text-[#77746B] hover:text-[#292720] disabled:opacity-30 cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveEvent(idx, 1)}
                          disabled={idx === events.length - 1}
                          className="p-1 text-[#77746B] hover:text-[#292720] disabled:opacity-30 cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        {events.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              recordChange(
                                project,
                                events.filter((_, i) => i !== idx)
                              )
                            }
                            className="p-1 text-red-700 hover:bg-red-50 cursor-pointer"
                            title="Delete Event"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <input
                      type="text"
                      value={evt.name}
                      onChange={(e) => {
                        const next = events.map((item, i) =>
                          i === idx ? { ...item, name: e.target.value } : item
                        );
                        recordChange(project, next);
                      }}
                      placeholder="Function Name"
                      className="w-full px-2.5 py-1.5 text-xs border border-[#EAE5DC]"
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={evt.date}
                        onChange={(e) => {
                          const next = events.map((item, i) =>
                            i === idx ? { ...item, date: e.target.value } : item
                          );
                          recordChange(project, next);
                        }}
                        className="w-full px-2 py-1.5 text-xs border border-[#EAE5DC]"
                      />
                      <input
                        type="time"
                        value={evt.startTime}
                        onChange={(e) => {
                          const next = events.map((item, i) =>
                            i === idx ? { ...item, startTime: e.target.value } : item
                          );
                          recordChange(project, next);
                        }}
                        className="w-full px-2 py-1.5 text-xs border border-[#EAE5DC]"
                      />
                    </div>

                    <input
                      type="text"
                      value={evt.venue}
                      onChange={(e) => {
                        const next = events.map((item, i) =>
                          i === idx ? { ...item, venue: e.target.value } : item
                        );
                        recordChange(project, next);
                      }}
                      placeholder="Venue Name"
                      className="w-full px-2.5 py-1.5 text-xs border border-[#EAE5DC]"
                    />

                    <textarea
                      rows={2}
                      value={evt.description}
                      onChange={(e) => {
                        const next = events.map((item, i) =>
                          i === idx ? { ...item, description: e.target.value } : item
                        );
                        recordChange(project, next);
                      }}
                      placeholder="Description"
                      className="w-full p-2 text-xs border border-[#EAE5DC]"
                    />
                  </div>
                ))}
              </div>
            )}

            {activeLeftTab === 'wording' && (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setStudioOpen(true)}
                  className="w-full py-2.5 px-4 bg-[#B99A6A] text-white text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Open Vowora AI Copywriter</span>
                </button>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#77746B] mb-1">
                    Invitation Language
                  </label>
                  <select
                    value={project.language}
                    onChange={(e) => updateProject({ language: e.target.value as LanguageCode })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#EAE5DC]"
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi (हिन्दी)</option>
                    <option value="gu">Gujarati (ગુજરાતી)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#77746B] mb-1">
                    Romantic Headline
                  </label>
                  <input
                    type="text"
                    value={project.headline}
                    onChange={(e) => updateProject({ headline: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#EAE5DC]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#77746B] mb-1">
                    Invitation Wording
                  </label>
                  <textarea
                    rows={4}
                    value={project.invitationWording}
                    onChange={(e) => updateProject({ invitationWording: e.target.value })}
                    className="w-full p-2.5 text-xs bg-white border border-[#EAE5DC]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#77746B] mb-1">
                    Couple Love Story
                  </label>
                  <textarea
                    rows={5}
                    value={project.story}
                    onChange={(e) => updateProject({ story: e.target.value })}
                    className="w-full p-2.5 text-xs bg-white border border-[#EAE5DC]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#77746B] mb-1">
                    Dress Code Guidance
                  </label>
                  <textarea
                    rows={2}
                    value={project.dressCodeNote}
                    onChange={(e) => updateProject({ dressCodeNote: e.target.value })}
                    className="w-full p-2.5 text-xs bg-white border border-[#EAE5DC]"
                  />
                </div>
              </div>
            )}

            {activeLeftTab === 'sections' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#77746B] mb-1">
                    Custom URL Slug (/i/:slug)
                  </label>
                  <input
                    type="text"
                    value={project.slug}
                    onChange={(e) =>
                      updateProject({
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-'),
                      })
                    }
                    className="w-full px-3 py-2 text-xs bg-white border border-[#EAE5DC]"
                  />
                </div>

                <div className="space-y-2">
                  <span className="block text-[11px] uppercase tracking-wider text-[#77746B]">
                    Toggle Sections
                  </span>
                  {(
                    [
                      { key: 'showStory', label: 'Couple Love Story' },
                      { key: 'showCountdown', label: 'Live Wedding Countdown' },
                      { key: 'showEvents', label: 'Events & Functions Timeline' },
                      { key: 'showVenue', label: 'Venue & Directions Card' },
                      { key: 'showDressCode', label: 'Attire & Palette Card' },
                      { key: 'showGallery', label: 'Photo Gallery' },
                      { key: 'showRsvp', label: 'Guest RSVP & QR Pass Form' },
                      { key: 'showRegistry', label: 'Registry & Blessings Note' },
                    ] as const
                  ).map((item) => (
                    <label
                      key={item.key}
                      className="flex items-center justify-between p-2.5 bg-white border border-[#EAE5DC] text-xs cursor-pointer"
                    >
                      <span>{item.label}</span>
                      <input
                        type="checkbox"
                        checked={Boolean(project.sectionSettings[item.key])}
                        onChange={(e) => updateSections({ [item.key]: e.target.checked })}
                        className="accent-[#292720]"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* CENTER PANEL: Live Invitation Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-[#242720]">
          <div
            className={`bg-white shadow-2xl overflow-y-auto transition-all duration-300 ${
              previewDevice === 'mobile' ? 'w-full max-w-[412px]' : 'w-full max-w-4xl'
            }`}
          >
            <InvitationCanvas
              project={project}
              events={events}
              isEditorPreview={true}
              canvasRef={canvasExportRef}
              onSelectSection={(sec) => {
                if (sec === 'couple') setActiveLeftTab('couple');
                else if (sec === 'events') setActiveLeftTab('events');
                else if (sec === 'guest') setActiveLeftTab('sections');
              }}
            />
          </div>
        </main>

        {/* RIGHT PANEL: Typography, Colors, Spacing & Template Controls */}
        <aside className="w-full lg:w-72 xl:w-80 bg-[#FAF8F4] text-[#292720] border-t lg:border-t-0 lg:border-l border-[#EAE5DC] overflow-y-auto p-5 space-y-5 shrink-0 no-print max-h-[32vh] lg:max-h-none">
          <div className="border-b border-[#EAE5DC] pb-3">
            <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#292720]">
              Design &amp; Typography
            </h2>
          </div>

          {/* Switch Template */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#77746B] mb-1.5">
              Template Architecture
            </label>
            <select
              value={project.templateId}
              onChange={(e) => {
                const tpl = TEMPLATE_LIBRARY.find((t) => t.id === e.target.value);
                if (tpl) {
                  updateProject({
                    templateId: tpl.id,
                    themeConfig: { ...tpl.defaultTheme },
                  });
                }
              }}
              className="w-full px-3 py-2 text-xs bg-white border border-[#EAE5DC]"
            >
              {TEMPLATE_LIBRARY.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.category})
                </option>
              ))}
            </select>
          </div>

          {/* Heading Font */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#77746B] mb-1.5">
              Display Font Family
            </label>
            <select
              value={project.themeConfig.fontHeading}
              onChange={(e) => updateTheme({ fontHeading: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-white border border-[#EAE5DC]"
            >
              <option value="Cormorant Garamond">Cormorant Garamond</option>
              <option value="Playfair Display">Playfair Display</option>
            </select>
          </div>

          {/* Custom Colors */}
          <div className="space-y-3">
            <span className="block text-[11px] uppercase tracking-wider text-[#77746B]">
              Color System
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-[#77746B] mb-1">Primary Ink</label>
                <div className="flex items-center gap-2 bg-white p-1.5 border border-[#EAE5DC]">
                  <input
                    type="color"
                    value={project.themeConfig.primaryColor}
                    onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                    className="w-6 h-6 border-0 cursor-pointer"
                  />
                  <span className="text-[11px] font-mono-tabular">
                    {project.themeConfig.primaryColor}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-[#77746B] mb-1">Accent Foil</label>
                <div className="flex items-center gap-2 bg-white p-1.5 border border-[#EAE5DC]">
                  <input
                    type="color"
                    value={project.themeConfig.accentColor}
                    onChange={(e) => updateTheme({ accentColor: e.target.value })}
                    className="w-6 h-6 border-0 cursor-pointer"
                  />
                  <span className="text-[11px] font-mono-tabular">
                    {project.themeConfig.accentColor}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-[#77746B] mb-1">Paper Canvas</label>
                <div className="flex items-center gap-2 bg-white p-1.5 border border-[#EAE5DC]">
                  <input
                    type="color"
                    value={project.themeConfig.bgColor}
                    onChange={(e) => updateTheme({ bgColor: e.target.value })}
                    className="w-6 h-6 border-0 cursor-pointer"
                  />
                  <span className="text-[11px] font-mono-tabular">
                    {project.themeConfig.bgColor}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-[#77746B] mb-1">Body Text</label>
                <div className="flex items-center gap-2 bg-white p-1.5 border border-[#EAE5DC]">
                  <input
                    type="color"
                    value={project.themeConfig.textColor}
                    onChange={(e) => updateTheme({ textColor: e.target.value })}
                    className="w-6 h-6 border-0 cursor-pointer"
                  />
                  <span className="text-[11px] font-mono-tabular">
                    {project.themeConfig.textColor}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Alignment & Spacing */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#77746B] mb-1">
                Alignment
              </label>
              <select
                value={project.themeConfig.alignment}
                onChange={(e) => updateTheme({ alignment: e.target.value as 'center' | 'left' })}
                className="w-full px-2.5 py-2 text-xs bg-white border border-[#EAE5DC]"
              >
                <option value="center">Centered Classic</option>
                <option value="left">Left Editorial</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#77746B] mb-1">
                Section Spacing
              </label>
              <select
                value={project.themeConfig.spacing}
                onChange={(e) => updateTheme({ spacing: e.target.value as any })}
                className="w-full px-2.5 py-2 text-xs bg-white border border-[#EAE5DC]"
              >
                <option value="compact">Compact</option>
                <option value="balanced">Balanced</option>
                <option value="airy">Airy Editorial</option>
              </select>
            </div>
          </div>

          {/* Framing Style */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#77746B] mb-1">
              Portrait Frame Style
            </label>
            <select
              value={project.themeConfig.backgroundStyle}
              onChange={(e) => updateTheme({ backgroundStyle: e.target.value as any })}
              className="w-full px-3 py-2 text-xs bg-white border border-[#EAE5DC]"
            >
              <option value="paper">Square Cotton-Paper</option>
              <option value="arch">Roman / Palace Arch</option>
              <option value="palace">Heritage Jharokha Arch</option>
              <option value="botanical">Botanical Crest</option>
              <option value="editorial">Editorial Masthead</option>
            </select>
          </div>

          {/* Ambient Music */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#77746B] mb-1">
              Ambient Music Score
            </label>
            <select
              value={project.themeConfig.musicStyle}
              onChange={(e) => updateTheme({ musicStyle: e.target.value as any })}
              className="w-full px-3 py-2 text-xs bg-white border border-[#EAE5DC]"
            >
              <option value="piano-romance">Piano Romance</option>
              <option value="sitar-ambient">Classical Sitar &amp; Tanpura</option>
              <option value="strings-serenade">String Serenade</option>
              <option value="none">Muted / Off</option>
            </select>
          </div>

          <div className="pt-4 border-t border-[#EAE5DC] space-y-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="w-full py-2.5 px-4 bg-white border border-[#EAE5DC] hover:border-[#292720] text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print-Friendly View</span>
            </button>
          </div>
        </aside>
      </div>

      {/* Share & QR Code Modal */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 no-print">
          <div className="bg-[#FAF8F4] text-[#292720] border border-[#EAE5DC] max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EAE5DC] pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#B99A6A]">
                  Shareable Wedding Experience
                </p>
                <h3 className="font-display text-2xl font-semibold">
                  {project.partnerOne} &amp; {project.partnerTwo}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShareModalOpen(false)}
                className="p-1.5 text-[#77746B] hover:text-[#292720] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-white border border-[#EAE5DC] p-6 text-center space-y-4">
              <div className="inline-block p-3 bg-white border border-[#EAE5DC]">
                <QRCodeSVG value={publicUrl} size={168} level="M" />
              </div>
              <p className="text-xs text-[#77746B]">
                Scan to open the mobile wedding invitation or print on save-the-date stationery.
              </p>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#77746B] mb-1.5">
                Public Wedding Website URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={publicUrl}
                  className="flex-1 px-3.5 py-2.5 text-xs bg-white border border-[#EAE5DC] font-mono-tabular"
                />
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="px-4 py-2.5 bg-[#292720] text-white text-xs uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUrl ? 'Copied' : 'Copy Link'}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Link
                to={`/i/${project.slug}`}
                className="text-xs uppercase tracking-wider font-medium text-[#292720] hover:text-[#B99A6A] inline-flex items-center gap-1.5"
              >
                <span>Open Public Wedding Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setShareModalOpen(false)}
                className="px-5 py-2 text-xs uppercase tracking-wider border border-[#EAE5DC] hover:border-[#292720] cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <VoworaStudioModal
        isOpen={studioOpen}
        onClose={() => setStudioOpen(false)}
        project={project}
        onApplyText={(field, text) => updateProject({ [field]: text })}
      />
    </div>
  );
};
