import { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { X, Plus, Save, ChevronLeft } from 'lucide-react';
import 'react-day-picker/dist/style.css';

const COLORS = [
  { id: 1, bg: '#F2F3E9', label: 'Cream' },
  { id: 2, bg: '#E9FDDD', label: 'Mint' },
  { id: 3, bg: '#F8DDFD', label: 'Lavender' },
  { id: 4, bg: '#DFFFD6', label: 'Light Green' },
  { id: 5, bg: '#FFD5E9', label: 'Pink' },
  { id: 6, bg: '#D6EFFF', label: 'Sky Blue' },
  { id: 7, bg: '#FFF2CC', label: 'Yellow' },
  { id: 8, bg: '#D6FFFA', label: 'Teal' },
  { id: 9, bg: '#DAF0FF', label: 'Light Blue' },
];

export default function EntryEditor({ entry, onSave, onCancel, loading }) {
  const [formData, setFormData] = useState({
    title: '', data: '', color: 1, tag_names: [], date_time: new Date().toISOString(),
  });
  const [tagInput, setTagInput] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    if (entry) {
      setFormData({
        title: entry.title || '',
        data: entry.data || '',
        color: entry.color || 1,
        tag_names: entry.tags?.map((t) => t.name) || [],
        date_time: entry.date_time,
      });
      setSelectedDate(new Date(entry.date_time));
    }
  }, [entry]);

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tag_names.includes(tag)) {
      setFormData((p) => ({ ...p, tag_names: [...p.tag_names, tag] }));
    }
    setTagInput('');
  };

  const handleRemoveTag = (tag) => {
    setFormData((p) => ({ ...p, tag_names: p.tag_names.filter((t) => t !== tag) }));
  };

  const handleDateSelect = (date) => {
    if (!date) return;
    setSelectedDate(date);
    setFormData((p) => ({ ...p, date_time: date.toISOString() }));
  };

  const handleSubmit = () => {
    if (!formData.data.trim()) return;
    onSave(formData);
  };

  const selectedColor = COLORS.find((c) => c.id === formData.color);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-xl transition">
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            </button>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                {entry ? 'Edit Entry' : 'New Entry'}
              </p>
              <p className="text-lg font-bold text-gray-800">{format(selectedDate, 'MMMM d, yyyy')}</p>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading || !formData.data.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl font-medium transition"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Main editor */}
          <div className="flex-1 flex flex-col p-6 overflow-y-auto">
            <input
              type="text"
              placeholder="Title (optional)"
              value={formData.title}
              onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
              className="text-xl font-semibold text-gray-800 border-none outline-none mb-4 placeholder-gray-300"
            />
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.tag_names.map((tag) => (
                <span key={tag} className="flex items-center gap-1 bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full">
                  {tag}
                  <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-500 ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="Add tag…"
                  className="text-sm text-gray-500 outline-none border-b border-dashed border-gray-300 focus:border-blue-400 w-20 bg-transparent"
                />
                {tagInput && (
                  <button onClick={handleAddTag} className="text-blue-500 hover:text-blue-700">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <textarea
              autoFocus
              value={formData.data}
              onChange={(e) => setFormData((p) => ({ ...p, data: e.target.value }))}
              placeholder="What's on your mind today?"
              className="flex-1 min-h-[300px] resize-none outline-none text-gray-700 leading-relaxed placeholder-gray-300 text-sm"
            />
          </div>

          {/* Sidebar */}
          <div className="w-64 border-l border-gray-100 p-4 flex flex-col gap-6 overflow-y-auto bg-gray-50">
            {/* Calendar */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Date</p>
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                className="!m-0 text-sm"
              />
            </div>

            {/* Color picker */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Card Color</p>
              <div className="grid grid-cols-3 gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c.id}
                    title={c.label}
                    onClick={() => setFormData((p) => ({ ...p, color: c.id }))}
                    className={`h-8 rounded-lg border-2 transition ${
                      formData.color === c.id ? 'border-blue-500 scale-110 shadow-md' : 'border-transparent hover:border-gray-300'
                    }`}
                    style={{ backgroundColor: c.bg }}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">{selectedColor?.label}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
