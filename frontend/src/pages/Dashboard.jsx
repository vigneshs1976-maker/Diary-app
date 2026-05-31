import { useState, useEffect, useMemo, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { BookOpen, LogOut, Plus, Search, Hash, Flame, FileText, User, X, Camera, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, isSameDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isToday } from 'date-fns';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import EntryCard from '../components/EntryCard';
import EntryEditor from '../components/EntryEditor';

/* ─── Custom Calendar ─────────────────────────────────────── */
function MiniCalendar({ selected, onSelect, entryDates }) {
  const [viewDate, setViewDate] = useState(new Date());

  const weeks = useMemo(() => {
    const start = startOfWeek(startOfMonth(viewDate), { weekStartsOn: 0 });
    const end   = endOfWeek(endOfMonth(viewDate),     { weekStartsOn: 0 });
    const days  = [];
    let cur = start;
    while (cur <= end) { days.push(cur); cur = addDays(cur, 1); }
    const rows = [];
    for (let i = 0; i < days.length; i += 7) rows.push(days.slice(i, i + 7));
    return rows;
  }, [viewDate]);

  const hasEntry = (day) => entryDates.some((d) => isSameDay(d, day));
  const isSelected = (day) => selected && isSameDay(day, selected);
  const isCurrentMonth = (day) => day.getMonth() === viewDate.getMonth();

  return (
    <div className="w-full select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <button onClick={() => setViewDate(subMonths(viewDate, 1))}
          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-bold text-blue-800">
          {format(viewDate, 'MMMM yyyy')}
        </span>
        <button onClick={() => setViewDate(addMonths(viewDate, 1))}
          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map((d) => (
          <div key={d} className="text-center text-[11px] font-bold text-gray-400 py-1">{d}</div>
        ))}
      </div>

      {/* Date grid */}
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 gap-y-0.5">
          {week.map((day, di) => {
            const inMonth  = isCurrentMonth(day);
            const sel      = isSelected(day);
            const todayDay = isToday(day);
            const hasEnt   = hasEntry(day);
            return (
              <button
                key={di}
                onClick={() => onSelect(sel ? null : day)}
                className={`
                  flex flex-col items-center justify-center rounded-lg h-9 w-full transition text-center
                  ${sel      ? 'bg-blue-600 text-white shadow'          : ''}
                  ${!sel && todayDay ? 'border-2 border-blue-500 text-blue-700 font-bold' : ''}
                  ${!sel && !todayDay && inMonth  ? 'hover:bg-blue-50 text-gray-700'     : ''}
                  ${!inMonth ? 'text-gray-300 hover:bg-gray-50'                          : ''}
                `}
              >
                <span className="text-[12px] font-semibold leading-none">
                  {format(day, 'd')}
                </span>
                <span className={`text-[9px] leading-none mt-0.5 font-medium
                  ${sel ? 'text-blue-100' : todayDay ? 'text-blue-500' : 'text-gray-400'}`}>
                  {format(day, 'EEE')}
                </span>
                {hasEnt && (
                  <span className={`w-1 h-1 rounded-full mt-0.5 ${sel ? 'bg-white' : 'bg-blue-500'}`} />
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* ─── Dashboard ───────────────────────────────────────────── */
export default function Dashboard() {
  const { user, logout, updateUser } = useAuth();
  const [entries, setEntries]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [editorOpen, setEditorOpen]     = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [saving, setSaving]             = useState(false);
  const [searchQuery, setSearchQuery]   = useState('');
  const [filterDate, setFilterDate]     = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef(null);

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/dashboard/');
      setEntries(data.entries || []);
    } catch { toast.error('Failed to load entries.'); }
    finally  { setLoading(false); }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/'))       { toast.error('Please select an image file.'); return; }
    if (file.size > 5 * 1024 * 1024)           { toast.error('Image must be under 5MB.');     return; }
    setUploadingAvatar(true);
    const form = new FormData();
    form.append('avatar', file);
    try {
      const { data } = await api.patch('/auth/profile/', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser({ avatar: data.avatar });
      toast.success('Profile picture updated!');
    } catch { toast.error('Failed to upload picture.'); }
    finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      if (editingEntry) {
        const { data } = await api.put(`/entries/${editingEntry.id}/`, formData);
        setEntries((prev) => prev.map((e) => e.id === editingEntry.id ? data : e));
        toast.success('Entry updated!');
      } else {
        const { data } = await api.post('/entries/', formData);
        setEntries((prev) => [data, ...prev].sort((a, b) => new Date(b.date_time) - new Date(a.date_time)));
        toast.success('Entry saved!');
      }
      setEditorOpen(false);
      setEditingEntry(null);
    } catch { toast.error('Failed to save entry.'); }
    finally   { setSaving(false); }
  };

  const handleEdit   = (entry) => { setEditingEntry(entry); setEditorOpen(true); };
  const handleDelete = async (id) => {
    try {
      await api.delete(`/entries/${id}/`);
      setEntries((prev) => prev.filter((e) => e.id !== id));
      toast.success('Entry deleted.');
    } catch { toast.error('Failed to delete entry.'); }
    finally   { setConfirmDelete(null); }
  };
  const handleLogout = async () => { await logout(); toast.success('Logged out.'); };

  const filtered = useMemo(() => {
    let list = entries;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((e) =>
        e.data?.toLowerCase().includes(q) ||
        e.title?.toLowerCase().includes(q) ||
        e.tags?.some((t) => t.name.toLowerCase().includes(q))
      );
    }
    if (filterDate) list = list.filter((e) => isSameDay(new Date(e.date_time), filterDate));
    return list;
  }, [entries, searchQuery, filterDate]);

  const stats = useMemo(() => {
    const words = entries.reduce((acc, e) => acc + (e.data?.split(/\s+/).filter(Boolean).length || 0), 0);
    const tags  = new Set(entries.flatMap((e) => e.tags?.map((t) => t.name) || []));
    const dates = [...new Set(entries.map((e) => format(new Date(e.date_time), 'yyyy-MM-dd')))].sort().reverse();
    let streak  = 0;
    const today = format(new Date(), 'yyyy-MM-dd');
    const yest  = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
    if (dates[0] === today || dates[0] === yest) {
      for (let i = 0; i < dates.length; i++) {
        if (dates[i] === format(new Date(Date.now() - i * 86400000), 'yyyy-MM-dd')) streak++;
        else break;
      }
    }
    return { words, entries: entries.length, streak, tags: tags.size };
  }, [entries]);

  const entryDates = entries.map((e) => new Date(e.date_time));

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-2">
      <div className="w-full max-w-[1400px] bg-gradient-to-b from-blue-600 to-cyan-400 rounded-[28px] p-1.5 shadow-2xl">
        <div className="bg-gradient-to-b from-blue-600 to-cyan-400 rounded-[26px] grid grid-cols-[240px_1fr] h-[92vh]">

          {/* ── Sidebar ── */}
          <div className="flex flex-col items-center py-8 px-4 gap-6 overflow-y-auto">

            {/* Avatar */}
            <div className="flex flex-col items-center gap-1">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-white/20 border-4 border-white/60 flex items-center justify-center shadow-xl overflow-hidden">
                  {user?.avatar ? (
                    <img
                      src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:8000${user.avatar}`}
                      alt="avatar" className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-white" />
                  )}
                </div>
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute inset-0 rounded-full bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  {uploadingAvatar
                    ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    : <><Camera className="w-5 h-5 text-white" /><span className="text-white text-[10px] mt-0.5 font-medium">Change</span></>
                  }
                </button>
                <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </div>
              <p className="text-white font-bold text-lg leading-tight mt-2">{user?.username}</p>
              <p className="text-blue-100 text-xs truncate max-w-[180px]">{user?.email}</p>
              <p className="text-blue-200/70 text-[10px]">Tap photo to change</p>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-2xl p-4 w-full shadow-md">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 text-center">Your Record</p>
              <ul className="space-y-2.5">
                <StatItem icon={<FileText className="w-3.5 h-3.5 text-blue-500"   />} label="Words"   value={stats.words.toLocaleString()} />
                <StatItem icon={<BookOpen className="w-3.5 h-3.5 text-green-500"  />} label="Entries" value={stats.entries} />
                <StatItem icon={<Flame    className="w-3.5 h-3.5 text-orange-500" />} label="Streak"  value={`${stats.streak} day${stats.streak !== 1 ? 's' : ''}`} />
                <StatItem icon={<Hash     className="w-3.5 h-3.5 text-purple-500" />} label="Tags"    value={stats.tags} />
              </ul>
            </div>

            <button onClick={handleLogout}
              className="mt-auto flex items-center gap-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-xl transition text-sm font-medium">
              <LogOut className="w-4 h-4" /> Log out
            </button>
          </div>

          {/* ── Main content ── */}
          <div className="bg-white rounded-[22px] my-2 mr-2 grid grid-cols-[1fr_300px] overflow-hidden">

            {/* Entries list */}
            <div className="bg-blue-50/50 overflow-y-auto custom-scrollbar p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  {filterDate ? format(filterDate, 'MMMM d, yyyy') : 'All Entries'}
                  {filterDate && (
                    <button onClick={() => setFilterDate(null)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </h2>
                <span className="text-sm text-gray-400">{filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}</span>
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">{searchQuery || filterDate ? 'No matching entries' : 'No entries yet'}</p>
                  <p className="text-sm mt-1">{!searchQuery && !filterDate && 'Click "New Entry" to start writing!'}</p>
                </div>
              ) : (
                filtered.map((entry) => (
                  <EntryCard key={entry.id} entry={entry} onEdit={handleEdit} onDelete={(id) => setConfirmDelete(id)} />
                ))
              )}
            </div>

            {/* ── Right panel ── */}
            <div className="border-l border-gray-100 flex flex-col overflow-hidden">

              {/* Search */}
              <div className="p-4 border-b border-gray-100 flex-shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text" value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search entries…"
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* ── Custom Calendar ── */}
              <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2">
                <MiniCalendar
                  selected={filterDate}
                  onSelect={setFilterDate}
                  entryDates={entryDates}
                />
                {filterDate && (
                  <button onClick={() => setFilterDate(null)}
                    className="w-full mt-3 py-1.5 text-xs text-gray-400 hover:text-gray-600 border border-dashed border-gray-300 rounded-lg">
                    Clear filter
                  </button>
                )}
              </div>

              {/* New Entry */}
              <div className="p-4 border-t border-gray-100 flex-shrink-0">
                <button
                  onClick={() => { setEditingEntry(null); setEditorOpen(true); }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition"
                >
                  <Plus className="w-5 h-5" /> New Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Modal */}
      {editorOpen && (
        <EntryEditor
          entry={editingEntry}
          onSave={handleSave}
          onCancel={() => { setEditorOpen(false); setEditingEntry(null); }}
          loading={saving}
        />
      )}

      {/* Delete Confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Entry?</h3>
            <p className="text-gray-500 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-medium text-sm">Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium text-sm">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatItem({ icon, label, value }) {
  return (
    <li className="flex items-center justify-between">
      <span className="flex items-center gap-1.5 text-gray-500 text-xs">{icon}{label}</span>
      <span className="font-semibold text-gray-800 text-sm">{value}</span>
    </li>
  );
}
