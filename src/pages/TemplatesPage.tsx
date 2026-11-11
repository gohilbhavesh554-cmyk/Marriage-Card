import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Heart,
  Smartphone,
  Monitor,
  X,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { TEMPLATE_LIBRARY, DEMO_WEDDING_EVENTS } from '../data/templatesAndDemo';
import { TemplateDefinition, WeddingProject } from '../types/vowora';
import { useVowora } from '../context/VoworaContext';
import { InvitationCanvas } from '../components/InvitationCanvas';

const CATEGORIES = [
  'All',
  'Indian Heritage',
  'International Editorial',
  'Botanical & Floral',
  'Destination',
] as const;

export const TemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { favoriteTemplates, toggleFavoriteTemplate, createBlankProject } = useVowora();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<TemplateDefinition | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  useEffect(() => {
    const previewId = searchParams.get('preview');
    if (previewId) {
      const match = TEMPLATE_LIBRARY.find((t) => t.id === previewId);
      if (match) setPreviewTemplate(match);
    }
  }, [searchParams]);

  const filteredTemplates = TEMPLATE_LIBRARY.filter((tpl) => {
    if (selectedCategory !== 'All' && tpl.category !== selectedCategory) return false;
    if (onlyFavorites && !favoriteTemplates.includes(tpl.id)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        tpl.name.toLowerCase().includes(q) ||
        tpl.style.toLowerCase().includes(q) ||
        tpl.paletteLabel.toLowerCase().includes(q) ||
        tpl.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleStartWithTemplate = (templateId: string) => {
    navigate(`/create?template=${templateId}`);
  };

  const buildPreviewProject = (tpl: TemplateDefinition): WeddingProject => {
    const { project } = createBlankProject(tpl.id);
    return project;
  };

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#292720] py-12 px-6 lg:px-12">
      <div className="max-w-[1440px] mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#EAE5DC] pb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#B99A6A] mb-2">
              VOWORA Stationery Library
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-normal text-[#292720]">
              Art-Directed Wedding Templates
            </h1>
            <p className="text-sm sm:text-base text-[#77746B] mt-2 max-w-2xl">
              Eight original wedding suites crafted with distinct architectural borders, cultural
              motifs, and editorial typography. Preview any design on mobile or desktop before
              customizing.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-[#77746B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search style, palette, mood..."
              aria-label="Search wedding templates"
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-[#EAE5DC] focus:outline-none focus:border-[#292720]"
            />
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#292720] text-white border-[#292720]'
                    : 'bg-white text-[#77746B] border-[#EAE5DC] hover:text-[#292720]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setOnlyFavorites((v) => !v)}
            className={`px-4 py-2 text-xs font-medium border inline-flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              onlyFavorites
                ? 'bg-[#B99A6A] text-white border-[#B99A6A]'
                : 'bg-white text-[#292720] border-[#EAE5DC]'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-white' : ''}`} />
            <span>Saved Favorites ({favoriteTemplates.length})</span>
          </button>
        </div>

        {/* Template Grid */}
        {filteredTemplates.length === 0 ? (
          <div className="bg-white border border-[#EAE5DC] p-12 text-center space-y-4">
            <Sparkles className="w-6 h-6 text-[#B99A6A] mx-auto" />
            <h3 className="font-display text-2xl">No matching templates found</h3>
            <p className="text-xs text-[#77746B]">
              Try clearing your search query or switching category filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
                setOnlyFavorites(false);
              }}
              className="px-5 py-2.5 bg-[#292720] text-white text-xs uppercase tracking-widest cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">
            {filteredTemplates.map((tpl) => {
              const isFav = favoriteTemplates.includes(tpl.id);
              return (
                <div
                  key={tpl.id}
                  className="bg-white border border-[#EAE5DC] hover:border-[#B99A6A] transition-colors flex flex-col justify-between"
                >
                  <div>
                    {/* Visual Art-Directed Card Miniature */}
                    <div
                      onClick={() => setPreviewTemplate(tpl)}
                      className="h-80 p-6 flex flex-col items-center justify-between text-center border-b border-[#EAE5DC] relative cursor-pointer group overflow-hidden"
                      style={{
                        backgroundColor: tpl.defaultTheme.bgColor,
                        color: tpl.defaultTheme.textColor,
                      }}
                    >
                      <div
                        className="inset-3 absolute border pointer-events-none"
                        style={{ borderColor: `${tpl.defaultTheme.accentColor}50` }}
                      />

                      <div className="w-full flex items-center justify-between relative z-10 text-[10px] uppercase tracking-[0.2em]">
                        <span style={{ color: tpl.defaultTheme.accentColor }}>{tpl.category}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavoriteTemplate(tpl.id);
                          }}
                          aria-label={`Favorite ${tpl.name}`}
                          className="p-1.5 bg-white/80 hover:bg-white rounded-full transition-colors cursor-pointer"
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${
                              isFav ? 'fill-[#B9765E] text-[#B9765E]' : 'text-[#292720]'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="relative z-10 my-auto space-y-2 px-2">
                        <div
                          className="w-10 h-10 mx-auto rounded-full border flex items-center justify-center text-xs"
                          style={{
                            borderColor: tpl.defaultTheme.accentColor,
                            color: tpl.defaultTheme.primaryColor,
                            fontFamily: `'${tpl.defaultTheme.fontHeading}', Georgia, serif`,
                          }}
                        >
                          {tpl.sampleCouple[0][0]}&amp;{tpl.sampleCouple[1][0]}
                        </div>
                        <div
                          className="text-3xl font-normal tracking-tight"
                          style={{
                            fontFamily: `'${tpl.defaultTheme.fontHeading}', Georgia, serif`,
                            color: tpl.defaultTheme.primaryColor,
                          }}
                        >
                          {tpl.sampleCouple[0]} &amp; {tpl.sampleCouple[1]}
                        </div>
                        <div className="text-[11px] uppercase tracking-widest opacity-75">
                          {tpl.sampleLocation}
                        </div>
                      </div>

                      <div className="relative z-10 flex items-center gap-2">
                        {[
                          tpl.defaultTheme.primaryColor,
                          tpl.defaultTheme.accentColor,
                          tpl.defaultTheme.bgColor,
                        ].map((hex, i) => (
                          <span
                            key={i}
                            className="w-3.5 h-3.5 rounded-full border border-black/20"
                            style={{ backgroundColor: hex }}
                          />
                        ))}
                        <span className="text-[11px] opacity-75 ml-1">{tpl.paletteLabel}</span>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex items-center justify-between text-xs text-[#77746B] mb-1">
                        <span>{tpl.style}</span>
                        <span>·</span>
                        <span className="uppercase tracking-wider text-[#292720] font-medium">
                          {tpl.tier}
                        </span>
                      </div>
                      <h2 className="font-display text-2xl font-semibold text-[#292720]">
                        {tpl.name}
                      </h2>
                      <p className="text-xs text-[#77746B] mt-2 leading-relaxed">
                        {tpl.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0 flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleStartWithTemplate(tpl.id)}
                      className="flex-1 py-2.5 px-4 bg-[#292720] hover:bg-[#34453A] text-white text-xs uppercase tracking-wider font-medium cursor-pointer whitespace-nowrap"
                    >
                      Start With Design
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewTemplate(tpl)}
                      className="py-2.5 px-3.5 border border-[#EAE5DC] hover:border-[#292720] text-xs uppercase tracking-wider text-[#292720] cursor-pointer whitespace-nowrap"
                    >
                      Preview
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Full Live Template Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F4] border border-[#EAE5DC] w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl">
            {/* Modal Top Bar */}
            <div className="px-6 py-4 bg-white border-b border-[#EAE5DC] flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-[#77746B]">
                  <span>{previewTemplate.category}</span>
                  <span>·</span>
                  <span>{previewTemplate.paletteLabel}</span>
                </div>
                <h3 className="font-display text-2xl font-semibold text-[#292720]">
                  {previewTemplate.name} — Live Preview
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center bg-[#FAF8F4] p-1 border border-[#EAE5DC]">
                  <button
                    type="button"
                    onClick={() => setPreviewMode('desktop')}
                    className={`px-3 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer ${
                      previewMode === 'desktop' ? 'bg-[#292720] text-white' : 'text-[#77746B]'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Desktop</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('mobile')}
                    className={`px-3 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer ${
                      previewMode === 'mobile' ? 'bg-[#292720] text-white' : 'text-[#77746B]'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Mobile</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleStartWithTemplate(previewTemplate.id)}
                  className="px-5 py-2.5 bg-[#292720] hover:bg-[#34453A] text-white text-xs uppercase tracking-wider font-medium inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <span>Start With This Design</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPreviewTemplate(null);
                    setSearchParams({});
                  }}
                  aria-label="Close preview"
                  className="p-2 text-[#77746B] hover:text-[#292720] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Canvas Viewport */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-[#ECE8DF]/50">
              <div
                className={`bg-white border border-[#EAE5DC] shadow-md overflow-y-auto transition-all ${
                  previewMode === 'mobile' ? 'w-full max-w-[412px]' : 'w-full max-w-4xl'
                }`}
              >
                <InvitationCanvas
                  project={buildPreviewProject(previewTemplate)}
                  events={DEMO_WEDDING_EVENTS}
                  isEditorPreview={true}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
