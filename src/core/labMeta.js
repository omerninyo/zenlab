import {
  Palette,
  Bot,
  Search,
  Navigation,
  Tags,
  Scan,
  Brain,
  MessageSquareText,
  Cpu
} from 'lucide-react';

/**
 * Centralized Pedagogical Lab Identity & Iconography
 * Unified, consistent visual metaphors across the entire ZenLab platform.
 */
export const LAB_METADATA = {
  lab1: {
    id: 'lab1',
    number: 1,
    title: 'ציור בפיקסלים וביטים',
    shortLabel: 'ציור בפיקסלים',
    track: 'algorithms',
    trackName: 'אלגוריתמיקה',
    icon: Palette,
    metaphor: 'פלטת פיקסלים',
    accentColor: '#ca8a04',
    bgWash: 'rgba(202, 138, 4, 0.12)'
  },
  lab2: {
    id: 'lab2',
    number: 2,
    title: 'לתכנת רובוט חכם',
    shortLabel: 'לתכנת רובוט',
    track: 'algorithms',
    trackName: 'אלגוריתמיקה',
    icon: Bot,
    metaphor: 'רובוט פקודות',
    accentColor: '#0284c7',
    bgWash: 'rgba(2, 132, 199, 0.12)'
  },
  lab3: {
    id: 'lab3',
    number: 3,
    title: 'עץ החלטות בלשי',
    shortLabel: 'עץ החלטות בלשי',
    track: 'algorithms',
    trackName: 'אלגוריתמיקה',
    icon: Search,
    metaphor: 'בלש החלטות',
    accentColor: '#059669',
    bgWash: 'rgba(5, 150, 105, 0.12)'
  },
  lab4: {
    id: 'lab4',
    number: 4,
    title: 'הווייז של הרובוט',
    shortLabel: 'הווייז של הרובוט',
    track: 'algorithms',
    trackName: 'אלגוריתמיקה',
    icon: Navigation,
    metaphor: 'ווייז ניווט',
    accentColor: '#d97706',
    bgWash: 'rgba(217, 119, 6, 0.12)'
  },
  lab5: {
    id: 'lab5',
    number: 5,
    title: 'איך מחשב לומד?',
    shortLabel: 'איך מחשב לומד?',
    track: 'ai',
    trackName: 'בינה מלאכותית',
    icon: Tags,
    metaphor: 'סיווג ותיוג',
    accentColor: '#7c3aed',
    bgWash: 'rgba(124, 58, 237, 0.12)'
  },
  lab6: {
    id: 'lab6',
    number: 6,
    title: 'העיניים של המחשב',
    shortLabel: 'העיניים של המחשב',
    track: 'ai',
    trackName: 'בינה מלאכותית',
    icon: Scan,
    metaphor: 'ראייה וסריקה',
    accentColor: '#0284c7',
    bgWash: 'rgba(2, 132, 199, 0.12)'
  },
  lab7: {
    id: 'lab7',
    number: 7,
    title: 'נוירון חכם',
    shortLabel: 'נוירון חכם',
    track: 'ai',
    trackName: 'בינה מלאכותית',
    icon: Brain,
    metaphor: 'מוח ונוירון',
    accentColor: '#e11d48',
    bgWash: 'rgba(225, 29, 72, 0.12)'
  },
  lab8: {
    id: 'lab8',
    number: 8,
    title: 'מודל שפה חכם',
    shortLabel: 'מודל שפה חכם',
    track: 'ai',
    trackName: 'בינה מלאכותית',
    icon: MessageSquareText,
    metaphor: 'שיחה חכמה',
    accentColor: '#ca8a04',
    bgWash: 'rgba(202, 138, 4, 0.12)'
  }
};

export const LAB_ICONS = {
  lab1: Palette,
  lab2: Bot,
  lab3: Search,
  lab4: Navigation,
  lab5: Tags,
  lab6: Scan,
  lab7: Brain,
  lab8: MessageSquareText
};

export function getLabMeta(labId) {
  return LAB_METADATA[labId] || {
    id: labId,
    title: 'מעבדה',
    shortLabel: 'מעבדה',
    icon: Cpu,
    metaphor: 'מעבדה',
    accentColor: '#ca8a04',
    bgWash: 'rgba(202, 138, 4, 0.12)'
  };
}
