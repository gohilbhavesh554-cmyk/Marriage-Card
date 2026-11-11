import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useVowora } from '../context/VoworaContext';
import { WeddingProject, WeddingEventItem } from '../types/vowora';
import { InvitationCanvas } from '../components/InvitationCanvas';

export const PublicInvitationPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { loadPublicWeddingBySlug } = useVowora();

  const [project, setProject] = useState<WeddingProject | null>(null);
  const [events, setEvents] = useState<WeddingEventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchInvite = async () => {
      if (!slug) return;
      setLoading(true);
      const data = await loadPublicWeddingBySlug(slug);
      if (mounted) {
        setProject(data.project);
        setEvents(data.events);
        setLoading(false);
      }
    };
    fetchInvite();
    return () => {
      mounted = false;
    };
  }, [slug, loadPublicWeddingBySlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] text-[#16325B] flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <div className="font-display text-3xl font-bold tracking-tight">
            Julian &amp; Clara
          </div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#4A8BDF]">
            Opening Marriage Celebration Card...
          </p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] text-[#16325B] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#EAE2D6] p-10 text-center space-y-5 shadow-lg">
          <AlertCircle className="w-8 h-8 text-[#4A8BDF] mx-auto" />
          <h1 className="font-display text-3xl font-bold">
            Invitation Link Not Found
          </h1>
          <p className="text-xs sm:text-sm text-[#6E6A63] leading-relaxed">
            We could not find an invitation at <strong>/i/{slug}</strong>.
          </p>
          <div className="pt-2 flex justify-center">
            <Link
              to="/"
              className="px-6 py-2.5 rounded-full bg-[#16325B] text-white text-xs uppercase tracking-widest font-semibold"
            >
              Open Wedding Card
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <InvitationCanvas
      project={project}
      events={events}
      showTemplateBar={true}
    />
  );
};
