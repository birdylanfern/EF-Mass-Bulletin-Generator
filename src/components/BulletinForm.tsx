import React, { useState } from 'react';
import { BulletinData, LiturgicalClass, AnnouncementItem } from '../types/bulletin';
import { COMMON_KYRIALES, COMMON_CREDOS, CAMPION_MISSAL_PROPERS } from '../data/missalPropers';
import { addDays, formatDateISO, generateBulletinForSunday, getUpcomingSunday } from '../utils/liturgicalCalendar';
import { MEDITATIONS } from '../data/meditationsData';
import {
  Calendar,
  Music,
  Megaphone,
  BookOpen,
  Church,
  Plus,
  Trash2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Info,
} from 'lucide-react';

interface BulletinFormProps {
  bulletin: BulletinData;
  onChange: (updated: BulletinData) => void;
}

export const BulletinForm: React.FC<BulletinFormProps> = ({
  bulletin,
  onChange,
}) => {
  const [activeTab, setActiveTab] = useState<'liturgy' | 'mass' | 'announcements' | 'meditation' | 'info'>('liturgy');
  const [customAnnouncementsMode, setCustomAnnouncementsMode] = useState(false);

  // Handle changing the generation date (Sunday)
  const handleDateChange = (newDateStr: string) => {
    if (!newDateStr) return;
    const parts = newDateStr.split('-');
    const date = new Date(Date.UTC(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)));
    const freshBulletin = generateBulletinForSunday(date);
    onChange(freshBulletin);
  };

  // Step prev / next week
  const handleStepWeek = (days: number) => {
    const parts = bulletin.generationDate.split('-');
    const current = new Date(Date.UTC(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)));
    const newDate = addDays(current, days);
    handleDateChange(formatDateISO(newDate));
  };

  // Jump to quick presets
  const handleJumpToPreset = (dateIso: string) => {
    handleDateChange(dateIso);
  };

  // Mass settings handlers
  const handleKyrialeSelect = (name: string) => {
    const found = COMMON_KYRIALES.find((k) => k.name === name);
    onChange({
      ...bulletin,
      massSettings: {
        ...bulletin.massSettings,
        kyrialeName: name,
        kyrialePage: found ? found.page : bulletin.massSettings.kyrialePage,
      },
    });
  };

  const handleCredoSelect = (name: string) => {
    const found = COMMON_CREDOS.find((c) => c.name === name);
    onChange({
      ...bulletin,
      massSettings: {
        ...bulletin.massSettings,
        credoName: name,
        credoPage: found ? found.page : bulletin.massSettings.credoPage,
      },
    });
  };

  // Announcements handlers
  const handleAnnouncementUpdate = (index: number, field: 'title' | 'content', value: string) => {
    const updated = [...bulletin.announcements];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...bulletin, announcements: updated });
  };

  const handleAddAnnouncement = () => {
    const newItem: AnnouncementItem = {
      id: `announcement-${Date.now()}`,
      title: 'New Parish Notice',
      content: 'Enter details of the event or announcement here...',
      isCustom: true,
    };
    onChange({ ...bulletin, announcements: [...bulletin.announcements, newItem] });
  };

  const handleDeleteAnnouncement = (index: number) => {
    const updated = bulletin.announcements.filter((_, i) => i !== index);
    onChange({ ...bulletin, announcements: updated });
  };

  const handleResetAnnouncements = () => {
    const fresh = generateBulletinForSunday(new Date(bulletin.generationDate));
    onChange({ ...bulletin, announcements: fresh.announcements });
    setCustomAnnouncementsMode(false);
  };

  // Meditation reset handler
  const handleResetMeditation = () => {
    const fresh = generateBulletinForSunday(new Date(bulletin.generationDate));
    onChange({ ...bulletin, meditation: fresh.meditation });
  };

  // Select a different meditation if desired
  const handleMeditationSelect = (key: string) => {
    const med = MEDITATIONS[key];
    if (med) {
      onChange({
        ...bulletin,
        meditation: {
          sundayKey: med.sundayKey,
          title: med.title,
          part1: med.part1,
          part2: med.part2,
        },
      });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-stone-200 overflow-hidden">
      {/* Navigation Tabs */}
      <div className="flex border-b border-stone-200 bg-stone-50/80 p-1.5 overflow-x-auto text-sm font-medium">
        <button
          onClick={() => setActiveTab('liturgy')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
            activeTab === 'liturgy'
              ? 'bg-amber-800 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Date & Calendar</span>
        </button>

        <button
          onClick={() => setActiveTab('mass')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
            activeTab === 'mass'
              ? 'bg-amber-800 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
          }`}
        >
          <Music className="w-4 h-4" />
          <span>Mass Settings</span>
        </button>

        <button
          onClick={() => setActiveTab('announcements')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
            activeTab === 'announcements'
              ? 'bg-amber-800 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Announcements</span>
        </button>

        <button
          onClick={() => setActiveTab('meditation')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
            activeTab === 'meditation'
              ? 'bg-amber-800 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Meditations</span>
        </button>

        <button
          onClick={() => setActiveTab('info')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
            activeTab === 'info'
              ? 'bg-amber-800 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
          }`}
        >
          <Church className="w-4 h-4" />
          <span>General Info</span>
        </button>
      </div>

      <div className="p-5">
        {/* ================= TAB 1: DATE & CALENDAR ================= */}
        {activeTab === 'liturgy' && (
          <div className="space-y-6">
            {/* Date selection bar */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                Sunday Generation Date
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleStepWeek(-7)}
                  title="Previous Sunday"
                  className="p-2.5 rounded-lg border border-stone-300 hover:bg-stone-100 text-stone-700 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <input
                  type="date"
                  value={bulletin.generationDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/40 text-stone-800 font-medium"
                />

                <button
                  type="button"
                  onClick={() => handleStepWeek(7)}
                  title="Next Sunday"
                  className="p-2.5 rounded-lg border border-stone-300 hover:bg-stone-100 text-stone-700 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDateChange(formatDateISO(getUpcomingSunday()))}
                  className="px-3.5 py-2 rounded-lg border border-amber-800 text-amber-800 hover:bg-amber-50 text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  Upcoming Sunday
                </button>
              </div>
            </div>

            {/* Quick Presets for Singapore & Sample */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Liturgical Calendar Presets</span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleJumpToPreset('2026-10-18')}
                  className={`px-3 py-1.5 rounded-md border transition-all ${
                    bulletin.generationDate === '2026-10-18'
                      ? 'bg-amber-100 border-amber-500 text-amber-900 font-semibold'
                      : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  📄 Sample: 18 Oct 2026 (21st Sun p. Pent)
                </button>

                <button
                  type="button"
                  onClick={() => handleJumpToPreset('2026-10-25')}
                  className="px-3 py-1.5 rounded-md border border-stone-200 hover:bg-stone-50 text-stone-700"
                >
                  👑 Christ the King (25 Oct 2026)
                </button>

                <button
                  type="button"
                  onClick={() => handleJumpToPreset('2026-04-19')}
                  className="px-3 py-1.5 rounded-md border border-stone-200 hover:bg-stone-50 text-stone-700"
                >
                  🇸🇬 Good Shepherd Sunday (Cathedral Titular)
                </button>

                <button
                  type="button"
                  onClick={() => handleJumpToPreset('2026-11-29')}
                  className="px-3 py-1.5 rounded-md border border-stone-200 hover:bg-stone-50 text-stone-700"
                >
                  🕯️ 1st Sunday of Advent 2026
                </button>

                <button
                  type="button"
                  onClick={() => handleJumpToPreset('2026-04-05')}
                  className="px-3 py-1.5 rounded-md border border-stone-200 hover:bg-stone-50 text-stone-700"
                >
                  🕊️ Easter Sunday 2026
                </button>

                <button
                  type="button"
                  onClick={() => handleJumpToPreset('2030-01-27')}
                  className={`px-3 py-1.5 rounded-md border transition-all ${
                    bulletin.generationDate === '2030-01-27'
                      ? 'bg-amber-100 border-amber-500 text-amber-900 font-semibold'
                      : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  ⭐ 3rd Sun after Epiphany (27 Jan 2030)
                </button>
              </div>
            </div>

            {/* Sunday Liturgy Details */}
            <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-base text-stone-900">
                  Sunday Title & Precedence
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                  Class {bulletin.sunday.liturgicalClass}
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Sunday Feast Title
                </label>
                <input
                  type="text"
                  value={bulletin.sunday.title}
                  onChange={(e) =>
                    onChange({
                      ...bulletin,
                      sunday: { ...bulletin.sunday, title: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-white rounded-md border border-stone-300 text-sm font-medium text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">
                    Class
                  </label>
                  <select
                    value={bulletin.sunday.liturgicalClass}
                    onChange={(e) =>
                      onChange({
                        ...bulletin,
                        sunday: {
                          ...bulletin.sunday,
                          liturgicalClass: e.target.value as LiturgicalClass,
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-white rounded-md border border-stone-300 text-sm font-medium text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-800"
                  >
                    <option value="I">I Class (First Class)</option>
                    <option value="II">II Class (Second Class)</option>
                    <option value="III">III Class (Third Class)</option>
                    <option value="IV">IV Class (Feria / Commemoration)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">
                    Campion Propers Page
                  </label>
                  <input
                    type="number"
                    value={bulletin.sunday.propersPage || bulletin.massSettings.propersPage}
                    onChange={(e) => {
                      const p = parseInt(e.target.value, 10) || 0;
                      onChange({
                        ...bulletin,
                        sunday: { ...bulletin.sunday, propersPage: p },
                        massSettings: { ...bulletin.massSettings, propersPage: p },
                      });
                    }}
                    className="w-full px-3 py-2 bg-white rounded-md border border-stone-300 text-sm font-medium text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Commemorations (e.g. Propaganda Fide, Saint Luke)
                </label>
                <input
                  type="text"
                  value={bulletin.sunday.commemoration || ''}
                  placeholder="None"
                  onChange={(e) =>
                    onChange({
                      ...bulletin,
                      sunday: { ...bulletin.sunday, commemoration: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-white rounded-md border border-stone-300 text-sm font-medium text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-800"
                />
              </div>
            </div>

            {/* Calendar of the Week Overview */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Calendar of the Week (Mon - Next Sun)
                </span>
                <span className="text-xs text-stone-400">
                  Singapore Proper Feasts automatically factored
                </span>
              </div>
              <div className="border border-stone-200 rounded-lg divide-y divide-stone-100 overflow-hidden text-xs">
                {bulletin.weekDays.map((d, idx) => (
                  <div key={d.id} className="p-2.5 flex items-center justify-between hover:bg-stone-50">
                    <div className="flex-1 mr-2">
                      <span className="font-semibold text-stone-900">{d.dateFormatted}: </span>
                      <input
                        type="text"
                        value={d.title}
                        onChange={(e) => {
                          const updated = [...bulletin.weekDays];
                          updated[idx] = { ...updated[idx], title: e.target.value };
                          onChange({ ...bulletin, weekDays: updated });
                        }}
                        className="px-2 py-0.5 rounded border border-transparent hover:border-stone-300 focus:border-amber-800 bg-transparent text-stone-800 w-[70%]"
                      />
                    </div>
                    <select
                      value={d.liturgicalClass}
                      onChange={(e) => {
                        const updated = [...bulletin.weekDays];
                        updated[idx] = {
                          ...updated[idx],
                          liturgicalClass: e.target.value as LiturgicalClass,
                        };
                        onChange({ ...bulletin, weekDays: updated });
                      }}
                      className="px-2 py-1 rounded border border-stone-200 font-serif font-bold text-stone-700 bg-white"
                    >
                      <option value="I">I</option>
                      <option value="II">II</option>
                      <option value="III">III</option>
                      <option value="IV">IV</option>
                    </select>
                  </div>
                ))}

                {/* Next Sunday */}
                <div className="p-2.5 flex items-center justify-between bg-stone-100/70">
                  <div className="flex-1 mr-2">
                    <span className="font-bold text-amber-900">{bulletin.nextSunday.dateFormatted}: </span>
                    <input
                      type="text"
                      value={bulletin.nextSunday.title}
                      onChange={(e) =>
                        onChange({
                          ...bulletin,
                          nextSunday: { ...bulletin.nextSunday, title: e.target.value },
                        })
                      }
                      className="px-2 py-0.5 rounded border border-transparent hover:border-stone-300 focus:border-amber-800 bg-transparent font-medium text-stone-900 w-[70%]"
                    />
                  </div>
                  <select
                    value={bulletin.nextSunday.liturgicalClass}
                    onChange={(e) =>
                      onChange({
                        ...bulletin,
                        nextSunday: {
                          ...bulletin.nextSunday,
                          liturgicalClass: e.target.value as LiturgicalClass,
                        },
                      })
                    }
                    className="px-2 py-1 rounded border border-stone-300 font-serif font-bold text-amber-900 bg-white"
                  >
                    <option value="I">I</option>
                    <option value="II">II</option>
                    <option value="III">III</option>
                    <option value="IV">IV</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: MASS SETTINGS ================= */}
        {activeTab === 'mass' && (
          <div className="space-y-5">
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Campion Missal Page Coordination</p>
                <p className="text-amber-800 mt-0.5">
                  Propers are automatically looked up from the Campion Missal Table. Select your desired Mass ordinary setting (Kyriale) and Credo below.
                </p>
              </div>
            </div>

            {/* Propers and Order of Mass */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-stone-50 rounded-lg border border-stone-200">
                <label className="block text-xs font-semibold uppercase text-stone-600 mb-1">
                  Sunday Propers Page
                </label>
                <p className="text-xs text-stone-500 mb-2">
                  Matching: <span className="font-semibold text-stone-800">{bulletin.sunday.title}</span>
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-serif font-bold text-stone-700">p.</span>
                  <input
                    type="number"
                    value={bulletin.massSettings.propersPage}
                    onChange={(e) =>
                      onChange({
                        ...bulletin,
                        massSettings: {
                          ...bulletin.massSettings,
                          propersPage: parseInt(e.target.value, 10) || 0,
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-white rounded-md border border-stone-300 text-sm font-bold text-amber-900"
                  />
                </div>
              </div>

              <div className="p-4 bg-stone-50 rounded-lg border border-stone-200">
                <label className="block text-xs font-semibold uppercase text-stone-600 mb-1">
                  Order of Mass Page
                </label>
                <p className="text-xs text-stone-500 mb-2">Standard Ordinary of the Mass</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-serif font-bold text-stone-700">p.</span>
                  <input
                    type="number"
                    value={bulletin.massSettings.orderOfMassPage}
                    onChange={(e) =>
                      onChange({
                        ...bulletin,
                        massSettings: {
                          ...bulletin.massSettings,
                          orderOfMassPage: parseInt(e.target.value, 10) || 0,
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-white rounded-md border border-stone-300 text-sm font-bold text-stone-900"
                  />
                </div>
              </div>
            </div>

            {/* Kyriale Selection */}
            <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 space-y-3">
              <label className="block text-xs font-semibold uppercase text-stone-600">
                Kyriale (Mass Ordinary Setting)
              </label>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <select
                    value={bulletin.massSettings.kyrialeName}
                    onChange={(e) => handleKyrialeSelect(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-md border border-stone-300 text-sm font-medium text-stone-900"
                  >
                    {COMMON_KYRIALES.map((k) => (
                      <option key={k.name} value={k.name}>
                        {k.name} — p. {k.page} ({k.season})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-500">Page:</span>
                    <input
                      type="number"
                      value={bulletin.massSettings.kyrialePage}
                      onChange={(e) =>
                        onChange({
                          ...bulletin,
                          massSettings: {
                            ...bulletin.massSettings,
                            kyrialePage: parseInt(e.target.value, 10) || 0,
                          },
                        })
                      }
                      className="w-full px-2 py-1.5 bg-white rounded-md border border-stone-300 text-sm font-medium text-stone-900"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Credo Selection */}
            <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 space-y-3">
              <label className="block text-xs font-semibold uppercase text-stone-600">
                Credo (Nicene-Constantinopolitan Creed)
              </label>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <select
                    value={bulletin.massSettings.credoName}
                    onChange={(e) => handleCredoSelect(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-md border border-stone-300 text-sm font-medium text-stone-900"
                  >
                    {COMMON_CREDOS.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name} — p. {c.page}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-500">Page:</span>
                    <input
                      type="number"
                      value={bulletin.massSettings.credoPage}
                      onChange={(e) =>
                        onChange({
                          ...bulletin,
                          massSettings: {
                            ...bulletin.massSettings,
                            credoPage: parseInt(e.target.value, 10) || 0,
                          },
                        })
                      }
                      className="w-full px-2 py-1.5 bg-white rounded-md border border-stone-300 text-sm font-medium text-stone-900"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: ANNOUNCEMENTS ================= */}
        {activeTab === 'announcements' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-bold text-base text-stone-900">
                    Page 2 Announcements
                  </h3>
                  {bulletin.announcements.reduce((acc, a) => acc + a.title.length + a.content.length, 0) > 800 || bulletin.announcements.length > 4 ? (
                    <span className="text-[10.5px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 font-medium">
                      ⚠️ Long text • Check A5 fit
                    </span>
                  ) : (
                    <span className="text-[10.5px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-medium">
                      ✓ Fits A5 Page 2 ({bulletin.announcements.length} items)
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  You can edit the usual announcements or replace with custom notices.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetAnnouncements}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-100 text-xs text-stone-700 font-medium transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Standard</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddAnnouncement}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-800 hover:bg-amber-900 text-white text-xs font-medium transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Announcement</span>
                </button>
              </div>
            </div>

            {/* Announcement Items List */}
            <div className="space-y-4">
              {bulletin.announcements.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-4 bg-stone-50 rounded-lg border border-stone-200 relative group transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-amber-900 uppercase tracking-wide">
                      Announcement #{idx + 1}
                    </span>
                    {bulletin.announcements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteAnnouncement(idx)}
                        className="text-stone-400 hover:text-red-600 transition-colors p-1"
                        title="Delete announcement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-stone-600 mb-1">
                        Headline / Title
                      </label>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => handleAnnouncementUpdate(idx, 'title', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white rounded-md border border-stone-300 text-sm font-semibold text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-stone-600 mb-1">
                        Body Content (supports @telegram handles and email addresses)
                      </label>
                      <textarea
                        rows={4}
                        value={item.content}
                        onChange={(e) => handleAnnouncementUpdate(idx, 'content', e.target.value)}
                        className="w-full px-3 py-2 bg-white rounded-md border border-stone-300 text-xs leading-relaxed text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-800 resize-y"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 4: MEDITATIONS ================= */}
        {activeTab === 'meditation' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <h3 className="font-serif font-bold text-base text-stone-900">
                  Divine Intimacy Meditations (Pages 3 & 4)
                </h3>
                <p className="text-xs text-stone-500">
                  By Fr. Gabriel of St. Mary Magdalen, O.C.D. Automatically mapped to the Sunday cycle.
                </p>
              </div>

              <button
                type="button"
                onClick={handleResetMeditation}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-100 text-xs text-stone-700 font-medium transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Sunday Text</span>
              </button>
            </div>

            {/* Select another meditation title manually if needed */}
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">
                Selected Meditation Cycle
              </label>
              <select
                value={bulletin.meditation.sundayKey}
                onChange={(e) => handleMeditationSelect(e.target.value)}
                className="w-full px-3 py-2 bg-white rounded-md border border-stone-300 text-sm font-medium text-stone-900"
              >
                {Object.values(MEDITATIONS).map((m) => (
                  <option key={m.sundayKey} value={m.sundayKey}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Part 1 (Page 3) */}
            <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-sm text-stone-900">
                  Part 1 Meditation (Page 3)
                </span>
                <span className="text-xs text-stone-500">
                  {bulletin.meditation.part1.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <textarea
                rows={9}
                value={bulletin.meditation.part1}
                onChange={(e) =>
                  onChange({
                    ...bulletin,
                    meditation: { ...bulletin.meditation, part1: e.target.value },
                  })
                }
                className="w-full p-3 bg-white rounded-md border border-stone-300 text-xs leading-relaxed text-stone-800 font-serif focus:outline-none focus:ring-1 focus:ring-amber-800 resize-y"
              />
              <div className="flex items-center gap-1.5 text-[11px] text-stone-600 bg-stone-100 p-2 rounded">
                <span className="font-bold text-amber-800">🛡️ Overflow Failsafe Active:</span>
                <span>Font size automatically decreases if text length exceeds Page 3 boundary.</span>
              </div>
            </div>

            {/* Part 2 (Page 4) */}
            <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-sm text-stone-900">
                  Part 2 Meditation (Page 4)
                </span>
                <span className="text-xs text-stone-500">
                  {bulletin.meditation.part2.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <textarea
                rows={9}
                value={bulletin.meditation.part2}
                onChange={(e) =>
                  onChange({
                    ...bulletin,
                    meditation: { ...bulletin.meditation, part2: e.target.value },
                  })
                }
                className="w-full p-3 bg-white rounded-md border border-stone-300 text-xs leading-relaxed text-stone-800 font-serif focus:outline-none focus:ring-1 focus:ring-amber-800 resize-y"
              />
              <div className="flex items-center gap-1.5 text-[11px] text-stone-600 bg-stone-100 p-2 rounded">
                <span className="font-bold text-amber-800">🛡️ Overflow Failsafe Active:</span>
                <span>Font size automatically decreases if text length exceeds Page 4 boundary.</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: GENERAL INFO ================= */}
        {activeTab === 'info' && (
          <div className="space-y-4">
            <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
              <h3 className="font-serif font-bold text-sm text-stone-900 mb-1">
                Fixed Community Information
              </h3>
              <p className="text-xs text-stone-500 mb-3">
                Pre-configured details for Singapore Extraordinary Form Community at Church of St. Joseph.
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-stone-600 font-medium mb-1">Venue Name</label>
                  <input
                    type="text"
                    value={bulletin.generalInfo.venueName}
                    onChange={(e) =>
                      onChange({
                        ...bulletin,
                        generalInfo: { ...bulletin.generalInfo, venueName: e.target.value },
                      })
                    }
                    className="w-full px-2.5 py-1.5 bg-white rounded border border-stone-300 text-stone-800"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 font-medium mb-1">Street Address</label>
                  <input
                    type="text"
                    value={bulletin.generalInfo.venueStreet}
                    onChange={(e) =>
                      onChange({
                        ...bulletin,
                        generalInfo: { ...bulletin.generalInfo, venueStreet: e.target.value },
                      })
                    }
                    className="w-full px-2.5 py-1.5 bg-white rounded border border-stone-300 text-stone-800"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 font-medium mb-1">Mass Timing</label>
                  <input
                    type="text"
                    value={bulletin.generalInfo.massTiming}
                    onChange={(e) =>
                      onChange({
                        ...bulletin,
                        generalInfo: { ...bulletin.generalInfo, massTiming: e.target.value },
                      })
                    }
                    className="w-full px-2.5 py-1.5 bg-white rounded border border-stone-300 text-stone-800"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 font-medium mb-1">Rosary Timing</label>
                  <input
                    type="text"
                    value={bulletin.generalInfo.rosaryTiming}
                    onChange={(e) =>
                      onChange({
                        ...bulletin,
                        generalInfo: { ...bulletin.generalInfo, rosaryTiming: e.target.value },
                      })
                    }
                    className="w-full px-2.5 py-1.5 bg-white rounded border border-stone-300 text-stone-800"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 font-medium mb-1">Confessions Timing</label>
                  <input
                    type="text"
                    value={bulletin.generalInfo.confessionsTiming}
                    onChange={(e) =>
                      onChange({
                        ...bulletin,
                        generalInfo: { ...bulletin.generalInfo, confessionsTiming: e.target.value },
                      })
                    }
                    className="w-full px-2.5 py-1.5 bg-white rounded border border-stone-300 text-stone-800"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 font-medium mb-1">Priests</label>
                  <input
                    type="text"
                    value={bulletin.generalInfo.priests}
                    onChange={(e) =>
                      onChange({
                        ...bulletin,
                        generalInfo: { ...bulletin.generalInfo, priests: e.target.value },
                      })
                    }
                    className="w-full px-2.5 py-1.5 bg-white rounded border border-stone-300 text-stone-800"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-stone-600 font-medium mb-1">LinkTree URL (auto-updates QR Code & Links)</label>
                  <input
                    type="text"
                    value={bulletin.generalInfo.linkTreeUrl}
                    onChange={(e) =>
                      onChange({
                        ...bulletin,
                        generalInfo: { ...bulletin.generalInfo, linkTreeUrl: e.target.value },
                      })
                    }
                    className="w-full px-2.5 py-1.5 bg-white rounded border border-stone-300 text-stone-800 font-mono text-xs"
                    placeholder="https://linktr.ee/..."
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-stone-600 font-medium mb-1">Community Email</label>
                  <input
                    type="email"
                    value={bulletin.generalInfo.email}
                    onChange={(e) =>
                      onChange({
                        ...bulletin,
                        generalInfo: { ...bulletin.generalInfo, email: e.target.value },
                      })
                    }
                    className="w-full px-2.5 py-1.5 bg-white rounded border border-stone-300 text-stone-800"
                    placeholder="email@example.com"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
