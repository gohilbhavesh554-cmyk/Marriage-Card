import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Plus,
  LayoutGrid,
  Heart,
  Users,
  Settings,
  Edit3,
  ExternalLink,
  Copy,
  Trash2,
  LogOut,
  LogIn,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useVowora } from '../context/VoworaContext';
import { TEMPLATE_LIBRARY, DEMO_WEDDING_ID } from '../data/templatesAndDemo';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user,
    userProfile,
    signIn,
    logOut,
    weddings,
    guestsByWedding,
    rsvpsByWedding,
    favoriteTemplates,
    toggleFavoriteTemplate,
    duplicateWeddingProject,
    deleteWeddingProject,
    updateSubscriptionPlan,
  } = useVowora();

  const initialTab =
    location.pathname === '/my-invitations'
      ? 'invitations'
      : location.pathname === '/settings' || location.pathname === '/account'
      ? 'settings'
      : 'overview';

  const [activeTab, setActiveTab] = useState<'overview' | 'invitations' | 'favorites' | 'settings'>(
    initialTab
  );
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const userProjects = weddings.filter((w) => !w.isDemo && w.weddingId !== DEMO_WEDDING_ID);
  const demoProject = weddings.find((w) => w.weddingId === DEMO_WEDDING_ID);

  // Aggregate statistics across projects
  const totalViews = weddings.reduce((acc, w) => acc + (Number(w.viewsCount) || 0), 0);
  const allGuests = Object.values(guestsByWedding).flat();
  const totalRsvps = Object.values(rsvpsByWedding).flat().length;
  const confirmedGuests = allGuests
    .filter((g) => g.rsvpStatus === 'accepted')
    .reduce((sum, g) => sum + (Number(g.attendingCount) || 1), 0);
  const pendingGuests = allGuests.filter((g) => g.rsvpStatus === 'pending').length;

  const favTemplateObjs = TEMPLATE_LIBRARY.filter((t) => favoriteTemplates.includes(t.id));

  const handleDuplicate = async (weddingId: string) => {
    const copy = await duplicateWeddingProject(weddingId);
    if (copy) {
      navigate(`/editor/${copy.weddingId}`);
    }
  };

  const handleDelete = async (weddingId: string) => {
    await deleteWeddingProject(weddingId);
    setConfirmDeleteId(null);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#292720] flex flex-col lg:flex-row">
      {/* Desktop Sidebar Navigation */}
      <aside className="w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-[#EAE5DC] p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#B99A6A]">Couple Studio</p>
            <h2 className="font-display text-2xl font-semibold text-[#292720] mt-1">
              {userProfile?.displayName || user?.displayName || 'Wedding Workspace'}
            </h2>
            <p className="text-xs text-[#77746B] truncate mt-0.5">
              {user ? user.email : 'Local Studio Mode'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/create')}
            className="w-full py-3 px-4 bg-[#292720] hover:bg-[#34453A] text-white text-xs uppercase tracking-wider font-medium inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Invitation</span>
          </button>

          <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
            {(
              [
                { id: 'overview', label: 'Studio Overview', icon: LayoutGrid },
                { id: 'invitations', label: 'My Invitations', icon: Sparkles },
                { id: 'favorites', label: 'Template Favorites', icon: Heart },
                { id: 'settings', label: 'Account Settings', icon: Settings },
              ] as const
            ).map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3.5 py-2.5 text-xs font-medium flex items-center gap-3 transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-[#FAF8F4] text-[#292720] border border-[#EAE5DC]'
                      : 'text-[#77746B] hover:text-[#292720]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <Link
              to={`/guests/${userProjects[0]?.weddingId || DEMO_WEDDING_ID}`}
              className="px-3.5 py-2.5 text-xs font-medium text-[#77746B] hover:text-[#292720] flex items-center gap-3 whitespace-nowrap"
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>Guest Management</span>
            </Link>
          </nav>
        </div>

        <div className="hidden lg:block pt-6 border-t border-[#EAE5DC] space-y-3">
          {user ? (
            <button
              type="button"
              onClick={logOut}
              className="w-full py-2 px-3 text-xs text-[#77746B] hover:text-[#292720] flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={signIn}
              className="w-full py-2.5 px-3 bg-[#FAF8F4] border border-[#EAE5DC] hover:border-[#292720] text-xs font-medium text-[#292720] flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In with Google</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-10 lg:p-12 max-w-6xl space-y-10">
        {/* Cloud Sync / Local Mode Banner */}
        <div className="bg-white border border-[#EAE5DC] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#B99A6A]">
              {user ? 'Firebase Cloud Sync Active' : 'Local Studio Workspace'}
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-normal text-[#292720] mt-1">
              Your wedding story starts here.
            </h1>
          </div>

          {!user ? (
            <button
              type="button"
              onClick={signIn}
              className="px-5 py-2.5 bg-[#292720] text-white text-xs uppercase tracking-wider font-medium cursor-pointer whitespace-nowrap self-start sm:self-auto"
            >
              Connect Google Account for Cloud Sync
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs text-[#34453A]">
              <CheckCircle2 className="w-4 h-4" />
              <span>Synced to Firestore · {userProfile?.subscriptionPlan?.toUpperCase() || 'FREE'} Plan</span>
            </div>
          )}
        </div>

        {/* 4 Dashboard Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Invitation Views', value: totalViews },
            { label: 'Total RSVP Responses', value: totalRsvps },
            { label: 'Confirmed Guests', value: confirmedGuests },
            { label: 'Pending Guests', value: pendingGuests },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-[#EAE5DC] p-5">
              <div className="text-xs text-[#77746B]">{stat.label}</div>
              <div className="font-display text-3xl sm:text-4xl font-semibold text-[#292720] mt-2 tabular-nums">
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* TAB: OVERVIEW OR MY INVITATIONS */}
        {(activeTab === 'overview' || activeTab === 'invitations') && (
          <div className="space-y-10">
            {/* Authenticated / User Created Projects */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl font-semibold text-[#292720]">
                  My Wedding Invitations ({userProjects.length})
                </h2>
                <button
                  type="button"
                  onClick={() => navigate('/create')}
                  className="text-xs uppercase tracking-wider font-medium text-[#B99A6A] hover:underline cursor-pointer"
                >
                  + New Project
                </button>
              </div>

              {userProjects.length === 0 ? (
                <div className="bg-white border border-[#EAE5DC] p-10 text-center space-y-4">
                  <p className="font-display text-2xl text-[#292720]">
                    You haven’t created a custom project yet
                  </p>
                  <p className="text-xs text-[#77746B] max-w-md mx-auto leading-relaxed">
                    Start a new wedding invitation in our 6-step guided flow, or duplicate the
                    sample Udaipur wedding below to customize it as your own.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => navigate('/create')}
                      className="px-6 py-3 bg-[#292720] text-white text-xs uppercase tracking-widest cursor-pointer"
                    >
                      Start Guided Creation Flow
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplicate(DEMO_WEDDING_ID)}
                      className="px-6 py-3 border border-[#EAE5DC] hover:border-[#292720] text-xs uppercase tracking-widest cursor-pointer"
                    >
                      Duplicate Sample Project
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userProjects.map((proj) => (
                    <div
                      key={proj.weddingId}
                      className="bg-white border border-[#EAE5DC] flex flex-col justify-between"
                    >
                      <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between text-xs text-[#77746B]">
                          <span className="uppercase tracking-wider font-medium text-[#292720]">
                            {proj.status === 'published' ? 'Published' : 'Draft'}
                          </span>
                          <span className="tabular-nums">Wedding Date: {proj.weddingDate}</span>
                        </div>

                        <div>
                          <h3 className="font-display text-3xl text-[#292720]">
                            {proj.partnerOne} &amp; {proj.partnerTwo}
                          </h3>
                          <p className="text-xs text-[#77746B] mt-1">
                            /i/{proj.slug} · {proj.cityCountry || 'Celebration'}
                          </p>
                        </div>
                      </div>

                      <div className="px-6 py-4 bg-[#FAF8F4] border-t border-[#EAE5DC] flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-3">
                          <Link
                            to={`/editor/${proj.weddingId}`}
                            className="font-medium text-[#292720] hover:text-[#B99A6A] inline-flex items-center gap-1"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </Link>
                          <Link
                            to={`/i/${proj.slug}`}
                            className="text-[#77746B] hover:text-[#292720] inline-flex items-center gap-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Preview</span>
                          </Link>
                          <Link
                            to={`/guests/${proj.weddingId}`}
                            className="text-[#77746B] hover:text-[#292720] inline-flex items-center gap-1"
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span>Guests</span>
                          </Link>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleDuplicate(proj.weddingId)}
                            className="text-[#77746B] hover:text-[#292720] inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Duplicate</span>
                          </button>

                          {confirmDeleteId === proj.weddingId ? (
                            <button
                              type="button"
                              onClick={() => handleDelete(proj.weddingId)}
                              className="text-red-700 font-semibold cursor-pointer"
                            >
                              Confirm Delete
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(proj.weddingId)}
                              className="text-red-700/80 hover:text-red-700 inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Clearly Labeled Demo Project Card */}
            {demoProject && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-[#B99A6A]">
                      Interactive Sample Project (Clearly Labeled Demo Data)
                    </p>
                    <h2 className="font-display text-2xl font-semibold text-[#292720]">
                      Aarav &amp; Meera — Royal Heritage Showcase
                    </h2>
                  </div>
                </div>

                <div className="bg-white border border-[#EAE5DC] p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-4">
                    <img
                      src={demoProject.coverPhotoUrl}
                      alt="Aarav and Meera Demo Wedding"
                      referrerPolicy="no-referrer"
                      className="w-full h-48 object-cover border border-[#EAE5DC]"
                    />
                  </div>
                  <div className="md:col-span-8 space-y-4">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#77746B]">
                      <span className="text-[#B99A6A] font-medium uppercase tracking-wider">
                        Sample Showcase
                      </span>
                      <span>·</span>
                      <span>Published at /i/aarav-and-meera</span>
                      <span>·</span>
                      <span className="tabular-nums">Wedding Date: {demoProject.weddingDate}</span>
                    </div>
                    <h3 className="font-display text-3xl text-[#292720]">
                      {demoProject.partnerOne} &amp; {demoProject.partnerTwo}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#77746B] leading-relaxed">
                      Explore a complete multi-event wedding project with Mehndi, Wedding Ceremony,
                      and Reception schedules, sample guest RSVPs, and QR entry pass check-in.
                    </p>
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <Link
                        to="/i/aarav-and-meera"
                        className="px-4 py-2.5 bg-[#292720] text-white text-xs uppercase tracking-wider"
                      >
                        Open Public Wedding Page
                      </Link>
                      <Link
                        to={`/editor/${DEMO_WEDDING_ID}`}
                        className="px-4 py-2.5 border border-[#EAE5DC] hover:border-[#292720] text-xs uppercase tracking-wider"
                      >
                        Inspect in Editor
                      </Link>
                      <Link
                        to={`/guests/${DEMO_WEDDING_ID}`}
                        className="px-4 py-2.5 border border-[#EAE5DC] hover:border-[#292720] text-xs uppercase tracking-wider"
                      >
                        Manage Guests &amp; QR Check-In
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDuplicate(DEMO_WEDDING_ID)}
                        className="px-4 py-2.5 border border-[#EAE5DC] hover:border-[#292720] text-xs uppercase tracking-wider cursor-pointer"
                      >
                        Duplicate as My Own
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        )}

        {/* TAB: FAVORITES */}
        {activeTab === 'favorites' && (
          <section className="space-y-6">
            <h2 className="font-display text-3xl font-normal">
              Saved Template Favorites ({favTemplateObjs.length})
            </h2>
            {favTemplateObjs.length === 0 ? (
              <div className="bg-white border border-[#EAE5DC] p-10 text-center space-y-4">
                <p className="text-sm text-[#77746B]">
                  You haven’t bookmarked any templates yet.
                </p>
                <Link
                  to="/templates"
                  className="inline-block px-5 py-2.5 bg-[#292720] text-white text-xs uppercase tracking-widest"
                >
                  Explore Template Gallery
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favTemplateObjs.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="bg-white border border-[#EAE5DC] p-6 flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-[#77746B]">
                        <span>{tpl.category}</span>
                        <button
                          type="button"
                          onClick={() => toggleFavoriteTemplate(tpl.id)}
                          className="text-[#B9765E] hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                      <h3 className="font-display text-2xl font-semibold mt-1">{tpl.name}</h3>
                      <p className="text-xs text-[#77746B] mt-1">{tpl.paletteLabel}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate(`/create?template=${tpl.id}`)}
                      className="w-full py-2.5 bg-[#292720] text-white text-xs uppercase tracking-wider cursor-pointer"
                    >
                      Start With This Template
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* TAB: ACCOUNT SETTINGS */}
        {activeTab === 'settings' && (
          <section className="bg-white border border-[#EAE5DC] p-8 space-y-6 max-w-2xl">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#B99A6A]">
                Account &amp; Plan Entitlements
              </p>
              <h2 className="font-display text-3xl mt-1">Subscription &amp; Studio Preferences</h2>
            </div>

            <div className="space-y-3 text-sm border-y border-[#EAE5DC] py-5">
              <div className="flex justify-between">
                <span className="text-[#77746B]">Signed-In Account</span>
                <span className="font-medium">{user ? user.email : 'Local Studio Session'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#77746B]">Current Plan Tier</span>
                <span className="uppercase tracking-wider font-semibold text-[#292720]">
                  {userProfile?.subscriptionPlan || 'free'}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-[#77746B]">
                Switch your active studio entitlement tier to test Free vs. Premium features:
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => updateSubscriptionPlan('free')}
                  className={`px-5 py-2.5 text-xs uppercase tracking-wider border cursor-pointer ${
                    (userProfile?.subscriptionPlan || 'free') === 'free'
                      ? 'bg-[#292720] text-white border-[#292720]'
                      : 'bg-white text-[#292720] border-[#EAE5DC]'
                  }`}
                >
                  Free Tier
                </button>
                <button
                  type="button"
                  onClick={() => updateSubscriptionPlan('premium')}
                  className={`px-5 py-2.5 text-xs uppercase tracking-wider border cursor-pointer ${
                    userProfile?.subscriptionPlan === 'premium'
                      ? 'bg-[#B99A6A] text-white border-[#B99A6A]'
                      : 'bg-white text-[#292720] border-[#EAE5DC]'
                  }`}
                >
                  Premium Studio Tier
                </button>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};
