import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowLeft,
  Search,
  Download,
  UserPlus,
  QrCode,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useVowora } from '../context/VoworaContext';
import {
  WeddingProject,
  WeddingEventItem,
  GuestRecord,
  RsvpStatus,
} from '../types/vowora';
import { DEMO_WEDDING_ID } from '../data/templatesAndDemo';

export const GuestManagementPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const {
    loadWeddingDetails,
    guestsByWedding,
    addOrUpdateGuest,
    removeGuest,
    toggleGuestCheckIn,
  } = useVowora();

  const targetWeddingId = projectId || DEMO_WEDDING_ID;

  const [project, setProject] = useState<WeddingProject | null>(null);
  const [events, setEvents] = useState<WeddingEventItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | RsvpStatus>('all');

  // Add Guest Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestContact, setNewGuestContact] = useState('');
  const [newGuestStatus, setNewGuestStatus] = useState<RsvpStatus>('pending');
  const [newGuestCount, setNewGuestCount] = useState(2);
  const [newGuestMeal, setNewGuestMeal] = useState('Vegetarian Gourmet');
  const [newGuestDietary, setNewGuestDietary] = useState('');

  // Guest QR Pass Modal State
  const [selectedPassGuest, setSelectedPassGuest] = useState<GuestRecord | null>(null);

  // Organizer QR Check-In Verification State
  const [qrInputCode, setQrInputCode] = useState('');
  const [checkInFeedback, setCheckInFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
    guest?: GuestRecord;
  } | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      const res = await loadWeddingDetails(targetWeddingId);
      setProject(res.project);
      setEvents(res.events);
    };
    fetchDetails();
  }, [targetWeddingId, loadWeddingDetails]);

  const guests = guestsByWedding[targetWeddingId] || [];

  const filteredGuests = guests.filter((g) => {
    if (statusFilter !== 'all' && g.rsvpStatus !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        g.name.toLowerCase().includes(q) ||
        g.contact.toLowerCase().includes(q) ||
        g.inviteCode.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Statistics
  const totalInvitedRecords = guests.length;
  const confirmedHeadcount = guests
    .filter((g) => g.rsvpStatus === 'accepted')
    .reduce((acc, g) => acc + (Number(g.attendingCount) || 1), 0);
  const declinedCount = guests.filter((g) => g.rsvpStatus === 'declined').length;
  const pendingCount = guests.filter(
    (g) => g.rsvpStatus === 'pending' || g.rsvpStatus === 'maybe'
  ).length;

  // Event-wise Attendance Breakdown
  const eventAttendance = events.map((evt) => {
    const count = guests
      .filter((g) => g.rsvpStatus === 'accepted' && g.selectedEvents.includes(evt.name))
      .reduce((acc, g) => acc + (Number(g.attendingCount) || 1), 0);
    return { name: evt.name, date: evt.date, count };
  });

  // Dietary Preference Breakdown
  const dietaryCounts = guests
    .filter((g) => g.rsvpStatus === 'accepted')
    .reduce<Record<string, number>>((acc, g) => {
      const key = g.mealPreference || 'Standard';
      acc[key] = (acc[key] || 0) + (Number(g.attendingCount) || 1);
      return acc;
    }, {});

  const handleCreateGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName.trim()) return;

    const code = `VOW-${Math.floor(100 + Math.random() * 900)}`;
    await addOrUpdateGuest(targetWeddingId, {
      guestId: `guest-${Date.now()}`,
      weddingId: targetWeddingId,
      ownerId: project?.ownerId || 'local-draft-owner',
      name: newGuestName.trim(),
      contact: newGuestContact.trim(),
      inviteCode: code,
      rsvpStatus: newGuestStatus,
      attendingCount: newGuestStatus === 'declined' ? 0 : newGuestCount,
      mealPreference: newGuestMeal,
      dietaryNotes: newGuestDietary.trim(),
      selectedEvents: events.map((ev) => ev.name),
      checkedIn: false,
    });

    setNewGuestName('');
    setNewGuestContact('');
    setNewGuestDietary('');
    setAddModalOpen(false);
  };

  const handleExportCsv = () => {
    const headers = [
      'Guest Name',
      'Contact',
      'Invite Code',
      'RSVP Status',
      'Attending Headcount',
      'Meal Preference',
      'Dietary Notes',
      'Selected Events',
      'Checked In',
    ];
    const rows = guests.map((g) => [
      `"${g.name.replace(/"/g, '""')}"`,
      `"${g.contact.replace(/"/g, '""')}"`,
      `"${g.inviteCode}"`,
      g.rsvpStatus,
      g.attendingCount,
      `"${g.mealPreference}"`,
      `"${g.dietaryNotes.replace(/"/g, '""')}"`,
      `"${g.selectedEvents.join('; ')}"`,
      g.checkedIn ? 'Yes' : 'No',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project?.slug || 'wedding'}-guest-list.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleVerifyCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckInFeedback(null);
    if (!qrInputCode.trim()) return;

    try {
      const response = await fetch('/api/checkin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrPayload: qrInputCode.trim(),
          expectedWeddingId: targetWeddingId,
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.valid) {
        setCheckInFeedback({
          type: 'error',
          message: result.error || 'Invalid QR pass signature.',
        });
        return;
      }

      const matchedGuest = guests.find(
        (g) => g.inviteCode.toUpperCase() === String(result.inviteCode).toUpperCase()
      );

      if (!matchedGuest) {
        setCheckInFeedback({
          type: 'error',
          message: `No guest found with entry pass code "${result.inviteCode}" on this wedding project.`,
        });
        return;
      }

      if (matchedGuest.rsvpStatus === 'declined') {
        setCheckInFeedback({
          type: 'error',
          message: `${matchedGuest.name} previously declined the RSVP and is not on the active entry list.`,
        });
        return;
      }

      await toggleGuestCheckIn(targetWeddingId, matchedGuest.guestId, true);
      setCheckInFeedback({
        type: 'success',
        message: `Checked in ${matchedGuest.name} (${matchedGuest.attendingCount} attending) — Pass ${matchedGuest.inviteCode} verified.`,
        guest: { ...matchedGuest, checkedIn: true },
      });
      setQrInputCode('');
    } catch {
      setCheckInFeedback({
        type: 'error',
        message: 'Unable to verify pass right now.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#292720] py-10 px-6 lg:px-12">
      <div className="max-w-[1440px] mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EAE5DC] pb-6">
          <div>
            <Link
              to="/dashboard"
              className="text-xs uppercase tracking-wider text-[#77746B] hover:text-[#292720] inline-flex items-center gap-1.5 mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Studio Dashboard</span>
            </Link>
            <h1 className="font-display text-3xl sm:text-5xl font-normal text-[#292720]">
              {project ? `${project.partnerOne} & ${project.partnerTwo}` : 'Wedding'} — Guest &amp; RSVP Suite
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-4 py-2.5 bg-white border border-[#EAE5DC] hover:border-[#292720] text-xs uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Guest List CSV</span>
            </button>
            <button
              type="button"
              onClick={() => setAddModalOpen(true)}
              className="px-5 py-2.5 bg-[#292720] hover:bg-[#34453A] text-white text-xs uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Guest</span>
            </button>
          </div>
        </div>

        {/* 1. Primary RSVP Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-[#EAE5DC] p-6">
            <div className="text-xs text-[#77746B]">Total Invited Parties</div>
            <div className="font-display text-4xl font-semibold mt-2 tabular-nums">
              {totalInvitedRecords}
            </div>
          </div>
          <div className="bg-white border border-[#EAE5DC] p-6">
            <div className="text-xs text-[#77746B]">Confirmed Guests (Headcount)</div>
            <div className="font-display text-4xl font-semibold text-[#34453A] mt-2 tabular-nums">
              {confirmedHeadcount}
            </div>
          </div>
          <div className="bg-white border border-[#EAE5DC] p-6">
            <div className="text-xs text-[#77746B]">Pending / Tentative</div>
            <div className="font-display text-4xl font-semibold text-[#B99A6A] mt-2 tabular-nums">
              {pendingCount}
            </div>
          </div>
          <div className="bg-white border border-[#EAE5DC] p-6">
            <div className="text-xs text-[#77746B]">Declined Responses</div>
            <div className="font-display text-4xl font-semibold text-[#B9765E] mt-2 tabular-nums">
              {declinedCount}
            </div>
          </div>
        </div>

        {/* 2. Event-Wise Attendance & QR Check-In Console */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Event-Wise & Dietary Breakdown */}
          <div className="lg:col-span-7 bg-white border border-[#EAE5DC] p-6 sm:p-8 space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#B99A6A]">
                Hospitality Breakdown
              </p>
              <h2 className="font-display text-2xl font-semibold mt-1">
                Event-Wise Attendance &amp; Culinary Overview
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {eventAttendance.map((ev) => (
                <div key={ev.name} className="p-4 bg-[#FAF8F4] border border-[#EAE5DC]">
                  <div className="text-xs font-medium text-[#292720] truncate">{ev.name}</div>
                  <div className="text-[11px] text-[#77746B] tabular-nums">{ev.date}</div>
                  <div className="font-display text-3xl font-semibold text-[#292720] mt-2 tabular-nums">
                    {ev.count} <span className="text-xs font-body font-normal text-[#77746B]">guests</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[#EAE5DC]">
              <div className="text-xs uppercase tracking-wider text-[#77746B] mb-3">
                Confirmed Culinary Preferences
              </div>
              <div className="flex flex-wrap gap-4 text-xs">
                {Object.entries(dietaryCounts).map(([meal, count]) => (
                  <div
                    key={meal}
                    className="px-3.5 py-2 bg-[#FAF8F4] border border-[#EAE5DC] tabular-nums"
                  >
                    <span className="font-medium text-[#292720]">{meal}:</span>{' '}
                    <span className="text-[#B99A6A] font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Organizer QR Check-In Verification Console */}
          <div className="lg:col-span-5 bg-white border border-[#EAE5DC] p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-[#B99A6A]" />
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#B99A6A]">
                  Venue Door Check-In
                </p>
                <h2 className="font-display text-2xl font-semibold">
                  Verify Guest Entry Pass
                </h2>
              </div>
            </div>

            <p className="text-xs text-[#77746B] leading-relaxed">
              Enter or scan a guest’s entry code (for example <code className="font-mono-tabular text-[#292720]">VOW-AM-102</code> or <code className="font-mono-tabular text-[#292720]">VOWORA:{targetWeddingId}:VOW-AM-102</code>) to validate against the server and check them in.
            </p>

            <form onSubmit={handleVerifyCheckIn} className="flex items-center gap-2">
              <input
                type="text"
                value={qrInputCode}
                onChange={(e) => setQrInputCode(e.target.value)}
                placeholder="Enter pass code (e.g. VOW-AM-102)"
                aria-label="Guest QR entry code"
                className="flex-1 px-3.5 py-2.5 text-xs border border-[#EAE5DC] font-mono-tabular focus:outline-none focus:border-[#292720]"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#292720] hover:bg-[#34453A] text-white text-xs uppercase tracking-wider font-medium cursor-pointer whitespace-nowrap"
              >
                Verify &amp; Check In
              </button>
            </form>

            {checkInFeedback && (
              <div
                className={`p-3.5 border text-xs ${
                  checkInFeedback.type === 'success'
                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                    : 'bg-red-50 border-red-300 text-red-900'
                }`}
              >
                {checkInFeedback.message}
              </div>
            )}
          </div>
        </div>

        {/* 3. Guest List Table with Search & Status Filters */}
        <div className="bg-white border border-[#EAE5DC]">
          <div className="p-6 border-b border-[#EAE5DC] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: 'all', label: 'All Guests' },
                  { id: 'accepted', label: 'Confirmed' },
                  { id: 'pending', label: 'Pending' },
                  { id: 'maybe', label: 'Tentative' },
                  { id: 'declined', label: 'Declined' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3.5 py-1.5 text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                    statusFilter === tab.id
                      ? 'bg-[#292720] text-white border-[#292720]'
                      : 'bg-[#FAF8F4] text-[#77746B] border-[#EAE5DC] hover:text-[#292720]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#77746B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search guest name or code..."
                aria-label="Search guests"
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF8F4] border border-[#EAE5DC] focus:outline-none focus:border-[#292720]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#EAE5DC] text-[11px] uppercase tracking-wider text-[#77746B] bg-[#FAF8F4]">
                  <th className="py-3.5 px-5">Guest Name &amp; Contact</th>
                  <th className="py-3.5 px-4">RSVP Status</th>
                  <th className="py-3.5 px-4 text-right">Headcount</th>
                  <th className="py-3.5 px-4">Culinary &amp; Events</th>
                  <th className="py-3.5 px-4">Entry Pass</th>
                  <th className="py-3.5 px-4">Door Check-In</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE5DC] text-xs">
                {filteredGuests.map((guest) => (
                  <tr key={guest.guestId} className="hover:bg-[#FAF8F4]/60">
                    <td className="py-4 px-5">
                      <div className="font-medium text-[#292720]">{guest.name}</div>
                      <div className="text-[#77746B] mt-0.5">{guest.contact}</div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1.5 font-medium capitalize">
                        {guest.rsvpStatus === 'accepted' && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#34453A]" />
                        )}
                        {guest.rsvpStatus === 'declined' && (
                          <XCircle className="w-3.5 h-3.5 text-[#B9765E]" />
                        )}
                        {(guest.rsvpStatus === 'pending' || guest.rsvpStatus === 'maybe') && (
                          <Clock className="w-3.5 h-3.5 text-[#B99A6A]" />
                        )}
                        <span>{guest.rsvpStatus}</span>
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right font-mono-tabular font-medium">
                      {guest.attendingCount}
                    </td>

                    <td className="py-4 px-4 max-w-xs">
                      <div className="text-[#292720]">
                        {guest.mealPreference}
                        {guest.dietaryNotes ? ` (${guest.dietaryNotes})` : ''}
                      </div>
                      <div className="text-[11px] text-[#77746B] truncate mt-0.5">
                        {guest.selectedEvents.join(' · ') || 'No functions selected'}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <button
                        type="button"
                        onClick={() => setSelectedPassGuest(guest)}
                        className="font-mono-tabular text-xs text-[#292720] hover:text-[#B99A6A] underline underline-offset-4 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>{guest.inviteCode}</span>
                      </button>
                    </td>

                    <td className="py-4 px-4">
                      <button
                        type="button"
                        onClick={() =>
                          toggleGuestCheckIn(targetWeddingId, guest.guestId, !guest.checkedIn)
                        }
                        className={`px-3 py-1 text-[11px] uppercase tracking-wider border cursor-pointer ${
                          guest.checkedIn
                            ? 'bg-[#34453A] text-white border-[#34453A]'
                            : 'bg-white text-[#77746B] border-[#EAE5DC] hover:border-[#292720]'
                        }`}
                      >
                        {guest.checkedIn ? 'Checked In' : 'Mark Arrived'}
                      </button>
                    </td>

                    <td className="py-4 px-5 text-right">
                      <button
                        type="button"
                        onClick={() => removeGuest(targetWeddingId, guest.guestId)}
                        aria-label={`Remove ${guest.name}`}
                        className="p-1.5 text-[#77746B] hover:text-red-700 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Guest Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateGuest}
            className="bg-[#FAF8F4] border border-[#EAE5DC] max-w-md w-full p-6 sm:p-8 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#EAE5DC] pb-3">
              <h3 className="font-display text-2xl font-semibold">Add Guest to Invitation List</h3>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="p-1 text-[#77746B] hover:text-[#292720] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#77746B] mb-1">
                Guest or Family Name *
              </label>
              <input
                type="text"
                required
                value={newGuestName}
                onChange={(e) => setNewGuestName(e.target.value)}
                placeholder="e.g. Kabir & Zoya Mehta"
                className="w-full px-3 py-2 text-xs bg-white border border-[#EAE5DC]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#77746B] mb-1">
                Email or Phone
              </label>
              <input
                type="text"
                value={newGuestContact}
                onChange={(e) => setNewGuestContact(e.target.value)}
                placeholder="kabir@example.com"
                className="w-full px-3 py-2 text-xs bg-white border border-[#EAE5DC]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#77746B] mb-1">
                  RSVP Status
                </label>
                <select
                  value={newGuestStatus}
                  onChange={(e) => setNewGuestStatus(e.target.value as RsvpStatus)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#EAE5DC]"
                >
                  <option value="pending">Pending</option>
                  <option value="accepted">Confirmed</option>
                  <option value="maybe">Tentative</option>
                  <option value="declined">Declined</option>
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#77746B] mb-1">
                  Party Size
                </label>
                <input
                  type="number"
                  min={1}
                  max={15}
                  value={newGuestCount}
                  onChange={(e) => setNewGuestCount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#EAE5DC]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#77746B] mb-1">
                Meal Preference
              </label>
              <select
                value={newGuestMeal}
                onChange={(e) => setNewGuestMeal(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#EAE5DC]"
              >
                <option value="Vegetarian Gourmet">Vegetarian Gourmet</option>
                <option value="Jain Vegetarian">Jain Vegetarian</option>
                <option value="Standard Continental & Indian">Standard Continental &amp; Indian</option>
                <option value="Vegan">Plant-Based / Vegan</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="px-4 py-2 text-xs uppercase tracking-wider text-[#77746B] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#292720] text-white text-xs uppercase tracking-wider cursor-pointer"
              >
                Save Guest &amp; Generate Pass
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Individual Guest QR Pass Modal */}
      {selectedPassGuest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F4] border border-[#EAE5DC] max-w-sm w-full p-6 text-center space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAE5DC] pb-3">
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#B99A6A]">
                Guest Check-In QR Pass
              </span>
              <button
                type="button"
                onClick={() => setSelectedPassGuest(null)}
                className="p-1 text-[#77746B] hover:text-[#292720] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="font-display text-2xl font-semibold">{selectedPassGuest.name}</h3>
            <p className="text-xs text-[#77746B]">
              Party of {selectedPassGuest.attendingCount} · {selectedPassGuest.rsvpStatus.toUpperCase()}
            </p>

            <div className="p-4 bg-white border border-[#EAE5DC] inline-block">
              <QRCodeSVG
                value={`VOWORA:${targetWeddingId}:${selectedPassGuest.inviteCode}`}
                size={164}
                level="M"
              />
            </div>

            <div className="font-mono-tabular text-xs font-semibold tracking-widest">
              {selectedPassGuest.inviteCode}
            </div>
            <p className="text-[11px] text-[#77746B]">
              No private email or phone number is encoded in this QR payload.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
