import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  X, 
  Layers, 
  Tag, 
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { AudioEngine } from '../core/audio.js';

export default function GlossaryModal({ isOpen, onClose, curriculum }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLabId, setSelectedLabId] = useState('all');

  // Extract all glossary terms with their lab metadata
  const allTerms = useMemo(() => {
    if (!curriculum?.labs) return [];
    const list = [];
    Object.entries(curriculum.labs).forEach(([labKey, lab]) => {
      if (Array.isArray(lab.glossary)) {
        lab.glossary.forEach((item, idx) => {
          list.push({
            id: `${labKey}_${idx}`,
            labId: labKey,
            labNumber: lab.number,
            labTitle: lab.title,
            term: item.term,
            definition: item.definition
          });
        });
      }
    });
    return list;
  }, [curriculum]);

  // Filter terms by search query and selected lab
  const filteredTerms = useMemo(() => {
    return allTerms.filter(item => {
      const matchesLab = selectedLabId === 'all' || item.labId === selectedLabId;
      const q = searchQuery.trim().toLowerCase();
      if (!q) return matchesLab;
      const matchesQuery = 
        item.term.toLowerCase().includes(q) || 
        item.definition.toLowerCase().includes(q) ||
        item.labTitle.toLowerCase().includes(q);
      return matchesLab && matchesQuery;
    });
  }, [allTerms, selectedLabId, searchQuery]);

  if (!isOpen) return null;

  const labFilters = [
    { id: 'all', label: 'כל המונחים' },
    { id: 'lab1', label: '1: פיקסלים' },
    { id: 'lab2', label: '2: רובוט' },
    { id: 'lab3', label: '3: עץ החלטות' },
    { id: 'lab4', label: '4: מסלול' },
    { id: 'lab5', label: '5: מסווג AI' },
    { id: 'lab6', label: '6: פילטרים' },
    { id: 'lab7', label: '7: נוירון חכם' },
    { id: 'lab8', label: '8: מודל שפה' }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 text-slate-100 max-h-[90vh] flex flex-col"
        dir="rtl"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">מילון מונחי מדעי המחשב והבינה המלאכותית</h2>
              <p className="text-xs text-slate-400">מושגי מפתח, הגדרות פשוטות ודוגמאות לתלמידי כיתה ה'</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            title="סגירה"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="relative shrink-0">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="חיפוש מונח או הסבר (למשל: ביט, אלגוריתם, נוירון, מילים)..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs"
            >
              ניקוי
            </button>
          )}
        </div>

        {/* Lab Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 pb-1">
          {labFilters.map(filter => (
            <button
              key={filter.id}
              type="button"
              onClick={() => {
                setSelectedLabId(filter.id);
                AudioEngine.playStep();
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors border ${
                selectedLabId === filter.id
                  ? 'bg-blue-600 text-white border-blue-500 font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border-slate-800'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Terms List (Scrollable) */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {filteredTerms.length > 0 ? (
            filteredTerms.map(item => (
              <div 
                key={item.id}
                className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 hover:border-slate-700/80 transition-colors space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    <span>{item.term}</span>
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 shrink-0">
                    מעבדה {item.labNumber}: {item.labTitle}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.definition}
                </p>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <HelpCircle className="w-8 h-8 mx-auto text-slate-600 opacity-60" />
              <p className="text-xs">לא נמצאו מונחים התואמים את החיפוש.</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="shrink-0 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>מוצגים <strong className="text-white">{filteredTerms.length}</strong> מונחים מתוך {allTerms.length}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
}
