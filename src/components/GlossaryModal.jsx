import React, { useState, useMemo } from 'react';
import { BookOpen, Search, X, HelpCircle } from 'lucide-react';
import { AudioEngine } from '../core/audio.js';

export default function GlossaryModal({ isOpen, onClose, curriculum }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLabId, setSelectedLabId] = useState('all');

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-white border-2 border-[#E5E5E5] rounded-3xl max-w-2xl w-full p-5 sm:p-6 space-y-4 text-[#3C3C3C] max-h-[90vh] flex flex-col"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b-2 border-[#E5E5E5] pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#DDF4FF] border-2 border-[#84D8FF] flex items-center justify-center text-[#1899D6]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-[#3C3C3C]">
                מילון מושגים
              </h2>
              <p className="text-xs sm:text-sm text-[#777777] font-medium">
                מושגי מפתח והסברים פשוטים במדעי המחשב ו-AI
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white hover:bg-[#F7F7F7] text-[#777777] hover:text-[#3C3C3C] border-2 border-[#E5E5E5] flex items-center justify-center cursor-pointer"
            title="סגירה"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="relative shrink-0">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#AFAFAF]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="חיפוש מונח או הסבר (למשל: ביט, פיקסל, אלגוריתם)..."
            className="w-full bg-[#F7F7F5] border-2 border-[#E5E5E5] rounded-2xl pr-10 pl-14 py-2.5 text-sm text-[#3C3C3C] placeholder-[#AFAFAF] focus:outline-none focus:border-[#1CB0F6] transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1899D6] hover:underline text-xs font-bold cursor-pointer"
            >
              ניקוי
            </button>
          )}
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 pb-1">
          {labFilters.map(filter => (
            <button
              key={filter.id}
              type="button"
              onClick={() => {
                setSelectedLabId(filter.id);
                AudioEngine.playStep();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors border-2 cursor-pointer ${
                selectedLabId === filter.id
                  ? 'bg-[#DDF4FF] text-[#1899D6] border-[#84D8FF]'
                  : 'bg-white text-[#4B4B4B] hover:bg-[#F7F7F7] border-[#E5E5E5]'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Terms List */}
        <div className="flex-1 overflow-y-auto space-y-3 pl-1">
          {filteredTerms.length > 0 ? (
            filteredTerms.map(item => (
              <div
                key={item.id}
                className="bg-[#F7F7F5] p-4 rounded-2xl border-2 border-[#E5E5E5] space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h3 className="text-sm font-extrabold text-[#3C3C3C]">
                    {item.term}
                  </h3>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-white text-[#777777] border border-[#E5E5E5] shrink-0">
                    תחנה {item.labNumber}: {item.labTitle}
                  </span>
                </div>
                <p className="text-sm text-[#4B4B4B] leading-relaxed">
                  {item.definition}
                </p>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-[#777777] space-y-2">
              <HelpCircle className="w-8 h-8 mx-auto text-[#AFAFAF]" />
              <p className="text-sm font-bold">לא נמצאו מונחים התואמים את החיפוש.</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="shrink-0 pt-3 border-t-2 border-[#E5E5E5] flex items-center justify-between text-xs text-[#777777]">
          <span>מוצגים <strong className="text-[#3C3C3C]">{filteredTerms.length}</strong> מונחים מתוך {allTerms.length}</span>
          <button
            type="button"
            onClick={onClose}
            className="btn-duo-white px-4 py-2 text-xs"
          >
            סגירה
          </button>
        </div>
      </div>
    </div>
  );
}
