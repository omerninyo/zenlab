import React, { useState } from 'react';
import { Award, Printer, X, Star } from 'lucide-react';
import { AudioEngine } from '../core/audio.js';

export default function CertificateModal({ isOpen, onClose, totalStars = 0 }) {
  const [studentName, setStudentName] = useState('');

  if (!isOpen) return null;

  const handlePrint = () => {
    AudioEngine.playStep();
    window.print();
  };

  const formattedDate = new Intl.DateTimeFormat('he-IL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date());

  const rank = totalStars === 24
    ? 'מאסטר בינה מלאכותית'
    : totalStars >= 18
    ? 'מהנדס/ת רשתות'
    : totalStars >= 12
    ? 'נווט/ת אלגוריתמים'
    : totalStars >= 6
    ? 'בלש/ית קוד'
    : 'חוקר/ת מתחיל/ה';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/45"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-white border-2 border-[#E5E5E5] rounded-3xl overflow-hidden print:m-0 print:border-none print:shadow-none"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Controls Header */}
        <div className="flex items-center justify-between p-4 bg-[#F7F7F5] border-b-2 border-[#E5E5E5] shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#FFC800]" />
            <h3 className="text-base font-extrabold text-[#3C3C3C]">תעודת הישגים והצטיינות</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="btn-duo-blue px-3.5 py-2 text-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">הדפסה / שמירה כ-PDF</span>
              <span className="sm:hidden">הדפסה</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white hover:bg-[#F7F7F7] text-[#777777] hover:text-[#3C3C3C] border-2 border-[#E5E5E5] flex items-center justify-center cursor-pointer"
              aria-label="סגירה"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Name Input Bar */}
        <div className="p-4 bg-white border-b-2 border-[#E5E5E5] shrink-0 print:hidden">
          <label className="block text-xs font-bold text-[#4B4B4B] mb-1.5">
            הקלידו את שמכם לתעודה (נשמר במכשיר בלבד ללא שום איסוף מידע):
          </label>
          <input
            type="text"
            placeholder="למשל: דניאל כהן"
            value={studentName}
            onChange={e => setStudentName(e.target.value)}
            className="w-full max-w-sm px-3.5 py-2 rounded-xl bg-[#F7F7F5] border-2 border-[#E5E5E5] text-[#3C3C3C] text-sm focus:outline-none focus:border-[#1CB0F6]"
          />
        </div>

        {/* Printable Certificate Canvas */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 text-center space-y-5 bg-white print:p-8">
          <div className="border-4 border-double border-[#FFC800] p-5 sm:p-8 rounded-2xl relative bg-[#FFFDF5] print:bg-white">
            <div className="flex justify-center mb-3">
              <div className="w-16 h-16 rounded-full bg-[#FFC800] border-2 border-[#E5A800] flex items-center justify-center text-white">
                <Award className="w-8 h-8" />
              </div>
            </div>

            <div className="text-xs font-extrabold text-[#58CC02] mb-1">
              ZenLab • מביטים בודדים ועד בינה מלאכותית
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3C3C3C] tracking-tight mb-2">
              תעודת הצטיינות
            </h1>

            <p className="text-sm text-[#777777] mb-5">
              מוענקת בזאת בהערכה ובהוקרה ל:
            </p>

            <div className="text-2xl sm:text-3xl font-extrabold text-[#3C3C3C] border-b-2 border-[#E5E5E5] print:border-black max-w-md mx-auto pb-2 mb-4 min-h-[44px]">
              {studentName.trim() || 'חוקר/ת מדעי המחשב'}
            </div>

            <p className="text-sm text-[#4B4B4B] max-w-lg mx-auto leading-relaxed mb-6">
              על השלמת מסלול הלמידה במעבדות <strong className="text-[#3C3C3C]">ZenLab</strong>,
              גילוי סקרנות מדעית, חשיבה אלגוריתמית מעמיקה והבנת עקרונות היסוד במדעי המחשב ובבינה מלאכותית.
            </p>

            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white border-2 border-[#E5E5E5] mb-6">
              <div className="flex items-center gap-1.5 text-[#3C3C3C] font-extrabold text-sm">
                <Star className="w-4 h-4 fill-[#FFC800] text-[#FFC800]" />
                <span>{totalStars} / 24 כוכבים</span>
              </div>
              <span className="text-[#E5E5E5]">|</span>
              <span className="text-xs font-extrabold text-[#58A700]">
                {rank}
              </span>
            </div>

            <div className="pt-5 border-t-2 border-[#E5E5E5] grid grid-cols-2 gap-4 text-xs text-[#777777]">
              <div className="text-right">
                <span className="block font-bold text-[#3C3C3C]">תאריך הנפקה:</span>
                <span>{formattedDate}</span>
              </div>
              <div className="text-left">
                <span className="block font-bold text-[#3C3C3C]">צוות פיתוח ופדגוגיה:</span>
                <span className="font-mono">Code &amp; AI Explorer Team</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
