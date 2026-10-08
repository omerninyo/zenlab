import React, { useState } from 'react';
import { Award, Printer, X, Star, CheckCircle, Sparkles } from 'lucide-react';
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
    ? 'מאסטר בינה מלאכותית (דרגת על)'
    : totalStars >= 16 
    ? 'חוקר/ת בינה מלאכותית מתקדם/ת'
    : totalStars >= 8
    ? 'מפתח/ת אלגוריתמים צעיר/ה'
    : 'חוקר/ת מתחיל/ה';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-slate-900 border-2 border-slate-700 rounded-2xl shadow-2xl overflow-hidden print:m-0 print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Modal Controls Header (Hidden in Print) */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 bg-slate-950 border-b border-slate-800 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">תעודת הישגים והצטיינות</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">הדפסה / שמירה כ-PDF</span>
              <span className="xs:hidden">הדפסה</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Name Input Bar (Hidden in Print) */}
        <div className="p-3.5 sm:p-4 bg-slate-900/80 border-b border-slate-800/80 shrink-0 print:hidden">
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            הקלידו את שמכם לתעודה (נשמר במכשיר בלבד ללא שום איסוף מידע):
          </label>
          <input
            type="text"
            placeholder="למשל: דניאל כהן"
            value={studentName}
            onChange={e => setStudentName(e.target.value)}
            className="w-full max-w-sm px-3.5 py-1.5 sm:py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* The Certificate Canvas (Printed Page) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-12 text-center space-y-4 sm:space-y-6 print:p-8 bg-gradient-to-b from-slate-900 to-slate-950 print:from-white print:to-white">
          {/* Certificate Border Frame */}
          <div className="border-4 border-double border-amber-500/40 p-4 sm:p-6 md:p-8 rounded-xl relative">
            {/* Top Emblem */}
            <div className="flex justify-center mb-3">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border-2 border-amber-500/50 flex items-center justify-center text-amber-400 shadow-inner">
                <Award className="w-8 h-8" />
              </div>
            </div>

            <div className="uppercase tracking-widest text-[11px] font-mono text-amber-400 font-bold mb-1">
              ZenLab • From Zero to Neural
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white print:text-black tracking-tight mb-2">
              תעודת הצטיינות
            </h1>

            <p className="text-xs text-slate-400 print:text-slate-600 mb-6">
              מוענקת בזאת בהערכה ובהוקרה ל:
            </p>

            {/* Recipient Name */}
            <div className="text-2xl sm:text-3xl font-black text-amber-300 print:text-black border-b-2 border-slate-700 print:border-black max-w-md mx-auto pb-2 mb-4 min-h-[44px]">
              {studentName.trim() || 'חוקר/ת מדעי המחשב'}
            </div>

            <p className="text-xs sm:text-sm text-slate-300 print:text-slate-700 max-w-lg mx-auto leading-relaxed mb-6">
              על השלמת מסלול הלמידה במעבדות <strong className="text-white print:text-black">ZenLab</strong>, 
              גילוי סקרנות מדעית, חשיבה אלגוריתמית מעמיקה ושליטה בעקרונות ליבה במדעי המחשב ובלמידת מכונה.
            </p>

            {/* Stars & Rank Badge */}
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-950 print:bg-slate-100 border border-slate-800 print:border-slate-300 mb-6">
              <div className="flex items-center gap-1 text-amber-400 font-bold font-mono text-sm">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{totalStars} / 24 כוכבים</span>
              </div>
              <span className="text-slate-600 print:text-slate-400">|</span>
              <span className="text-xs font-semibold text-emerald-400 print:text-emerald-700">
                {rank}
              </span>
            </div>

            {/* Footer Signatures & Date */}
            <div className="pt-6 border-t border-slate-800/80 print:border-slate-300 grid grid-cols-2 gap-4 text-xs text-slate-400 print:text-slate-600">
              <div className="text-right">
                <span className="block font-bold text-slate-200 print:text-black">תאריך הנפקה:</span>
                <span>{formattedDate}</span>
              </div>
              <div className="text-left">
                <span className="block font-bold text-slate-200 print:text-black">צוות פיתוח ופדגוגיה:</span>
                <span className="font-mono">Code &amp; AI Explorer Team</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
