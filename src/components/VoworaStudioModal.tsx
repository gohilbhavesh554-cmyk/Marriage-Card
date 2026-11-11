import React, { useState } from 'react';
import { X, Wand2, Check, RefreshCw } from 'lucide-react';
import { LanguageCode, WeddingProject } from '../types/vowora';

interface VoworaStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: WeddingProject;
  initialTask?: 'wording' | 'headline' | 'story' | 'dress_code' | 'event';
  onApplyText: (field: 'invitationWording' | 'headline' | 'story' | 'dressCodeNote', text: string) => void;
}

const TONE_OPTIONS = ['Elegant', 'Traditional', 'Romantic', 'Modern', 'Minimal', 'Playful'] as const;

export const VoworaStudioModal: React.FC<VoworaStudioModalProps> = ({
  isOpen,
  onClose,
  project,
  initialTask = 'wording',
  onApplyText,
}) => {
  const [taskType, setTaskType] = useState<'wording' | 'headline' | 'story' | 'dress_code'>(
    initialTask === 'event' ? 'wording' : initialTask
  );
  const [tone, setTone] = useState<string>('Elegant');
  const [language, setLanguage] = useState<LanguageCode>(project.language || 'en');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<{ label: string; content: string }[]>([]);
  const [selectedContent, setSelectedContent] = useState('');
  const [appliedNotice, setAppliedNotice] = useState(false);

  if (!isOpen) return null;

  const generateCopy = async () => {
    setLoading(true);
    setAppliedNotice(false);
    try {
      const res = await fetch('/api/ai/studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType,
          tone,
          language,
          partnerOne: project.partnerOne,
          partnerTwo: project.partnerTwo,
          familyOne: project.familyOne,
          familyTwo: project.familyTwo,
          weddingDate: project.weddingDate,
          venue: project.venueSummary,
          currentText:
            taskType === 'headline'
              ? project.headline
              : taskType === 'story'
              ? project.story
              : taskType === 'dress_code'
              ? project.dressCodeNote
              : project.invitationWording,
        }),
      });
      const data = await res.json();
      const list = Array.isArray(data.suggestions) ? data.suggestions : [];
      setSuggestions(list);
      if (list.length > 0) {
        setSelectedContent(list[0].content);
      }
    } catch (error) {
      console.error('Failed to generate Vowora Studio suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!selectedContent.trim()) return;
    const targetField =
      taskType === 'headline'
        ? 'headline'
        : taskType === 'story'
        ? 'story'
        : taskType === 'dress_code'
        ? 'dressCodeNote'
        : 'invitationWording';
    onApplyText(targetField, selectedContent.trim());
    setAppliedNotice(true);
    setTimeout(() => {
      setAppliedNotice(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-[#FAF8F4] border border-[#EAE5DC] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#EAE5DC] bg-white">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#B99A6A]">Vowora Studio</p>
            <h2 className="font-display text-2xl font-semibold text-[#292720]">
              Editorial Wording & Translation Assistant
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Vowora Studio"
            className="p-2 text-[#77746B] hover:text-[#292720] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="text-xs text-[#77746B] bg-white p-3.5 border border-[#EAE5DC]">
            Personalizing for <strong className="text-[#292720]">{project.partnerOne} &amp; {project.partnerTwo}</strong>
            {project.venueSummary ? ` · ${project.venueSummary}` : ''}
            {project.weddingDate ? ` · ${project.weddingDate}` : ''}. Vowora Studio never invents names or dates and lets you review every word before applying.
          </div>

          {/* Task & Language Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-[#77746B] mb-2">
                Section to Compose
              </label>
              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#EAE5DC] text-[#292720] focus:outline-none focus:border-[#B99A6A]"
              >
                <option value="wording">Formal / Family Invitation Wording</option>
                <option value="headline">Romantic Invitation Headline</option>
                <option value="story">Couple Love Story Narrative</option>
                <option value="dress_code">Attire &amp; Dress Code Note</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-[#77746B] mb-2">
                Language / Translation
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#EAE5DC] text-[#292720] focus:outline-none focus:border-[#B99A6A]"
              >
                <option value="en">English</option>
                <option value="hi">Hindi (हिन्दी)</option>
                <option value="gu">Gujarati (ગુજરાતી)</option>
              </select>
            </div>
          </div>

          {/* Tone Selection */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[#77746B] mb-2">
              Editorial Tone
            </label>
            <div className="flex flex-wrap gap-2">
              {TONE_OPTIONS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTone(t)}
                  className={`px-3.5 py-1.5 text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                    tone === t
                      ? 'bg-[#292720] text-white border-[#292720]'
                      : 'bg-white text-[#77746B] border-[#EAE5DC] hover:border-[#292720]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={generateCopy}
            disabled={loading}
            className="w-full py-3 px-5 bg-[#292720] hover:bg-[#34453A] text-white text-xs font-medium uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Composing Editorial Options...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                Compose Wording Suggestions
              </>
            )}
          </button>

          {/* Suggestions List */}
          {suggestions.length > 0 && (
            <div className="space-y-4 pt-2 border-t border-[#EAE5DC]">
              <p className="text-xs font-medium uppercase tracking-wider text-[#77746B]">
                Select a suggestion to refine before applying:
              </p>
              <div className="grid grid-cols-1 gap-3">
                {suggestions.map((item, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedContent(item.content)}
                    className={`text-left p-4 border transition-colors cursor-pointer ${
                      selectedContent === item.content
                        ? 'bg-white border-[#B99A6A]'
                        : 'bg-white/60 border-[#EAE5DC] hover:bg-white'
                    }`}
                  >
                    <div className="text-xs font-medium text-[#B99A6A] mb-1">{item.label}</div>
                    <p className="text-sm text-[#292720] leading-relaxed">{item.content}</p>
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[#77746B] mb-2">
                  Review &amp; Edit Before Applying
                </label>
                <textarea
                  rows={4}
                  value={selectedContent}
                  onChange={(e) => setSelectedContent(e.target.value)}
                  className="w-full p-3.5 text-sm bg-white border border-[#EAE5DC] text-[#292720] focus:outline-none focus:border-[#B99A6A]"
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-[#77746B] hover:text-[#292720] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="px-6 py-2.5 bg-[#B99A6A] hover:bg-[#a38556] text-white text-xs font-medium uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  {appliedNotice ? 'Applied to Invitation' : 'Apply to Invitation'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
