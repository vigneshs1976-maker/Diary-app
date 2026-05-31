import { format } from 'date-fns';
import { Pencil, Trash2, Tag } from 'lucide-react';

const COLOR_MAP = {
  1: 'bg-[#F2F3E9]', 2: 'bg-[#E9FDDD]', 3: 'bg-[#F8DDFD]',
  4: 'bg-[#DFFFD6]', 5: 'bg-[#FFD5E9]', 6: 'bg-[#D6EFFF]',
  7: 'bg-[#FFF2CC]', 8: 'bg-[#D6FFFA]', 9: 'bg-[#DAF0FF]',
};

export default function EntryCard({ entry, onEdit, onDelete }) {
  const date = new Date(entry.date_time);

  return (
    <div className="group mb-4">
      <div className="flex items-baseline gap-3 mb-2">
        <span className="text-3xl font-bold text-gray-800">{format(date, 'dd/MM')}</span>
        <span className="text-gray-500 text-sm">{format(date, 'EEEE')}</span>
      </div>
      <div className={`${COLOR_MAP[entry.color] || 'bg-[#DAF0FF]'} rounded-xl p-4 shadow-sm transition-shadow hover:shadow-md`}>
        <div className="flex justify-between items-start mb-2">
          <div className="flex flex-wrap gap-1.5">
            {entry.tags?.map((tag) => (
              <span key={tag.id} className="flex items-center gap-1 bg-white/60 text-gray-600 text-xs px-2.5 py-0.5 rounded-full border border-white">
                <Tag className="w-2.5 h-2.5" />
                {tag.name}
              </span>
            ))}
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(entry)}
              className="p-1.5 bg-white/70 hover:bg-white rounded-lg text-gray-500 hover:text-blue-600 transition"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(entry.id)}
              className="p-1.5 bg-white/70 hover:bg-white rounded-lg text-gray-500 hover:text-red-500 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        {entry.title && <h3 className="font-semibold text-gray-700 mb-1">{entry.title}</h3>}
        <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap line-clamp-4">{entry.data}</p>
      </div>
    </div>
  );
}
