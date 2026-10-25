export type LiturgicalClass = 'I' | 'II' | 'III' | 'IV';

export interface CalendarDay {
  id: string;
  dateStr: string; // YYYY-MM-DD
  dayOfWeek: string; // 'Sunday', 'Monday', etc.
  dateFormatted: string; // 'October 18, 2026'
  title: string; // '21st Sunday after Pentecost' or 'Saint Peter of Alcantara, confessor'
  liturgicalClass: LiturgicalClass;
  commemoration?: string; // 'Propaganda Fide, Saint Luke'
  isSunday: boolean;
  isFeria?: boolean;
  isSingaporeFeast?: boolean;
  propersPage?: number;
}

export interface MassSettings {
  orderOfMassPage: number;
  kyrialeName: string;
  kyrialePage: number;
  credoName: string;
  credoPage: number;
  propersPage: number;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  isCustom?: boolean;
}

export interface MeditationData {
  sundayKey: string;
  title: string;
  part1: string;
  part2: string;
  prayer1Title?: string;
  prayer1Text?: string;
  prayer2Title?: string;
  prayer2Text?: string;
}

export interface GeneralInfo {
  venueName: string;
  venueStreet: string;
  massTiming: string;
  rosaryTiming: string;
  confessionsTiming: string;
  priests: string;
  footerNotice: string;
  linkTreeUrl: string;
  email: string;
}

export interface BulletinData {
  generationDate: string; // YYYY-MM-DD
  sunday: CalendarDay;
  weekDays: CalendarDay[]; // 6 weekdays (Mon - Sat)
  nextSunday: CalendarDay;
  massSettings: MassSettings;
  announcements: AnnouncementItem[];
  meditation: MeditationData;
  generalInfo: GeneralInfo;
}
