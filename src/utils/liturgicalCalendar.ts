import { CalendarDay, LiturgicalClass, MassSettings, MeditationData, BulletinData, GeneralInfo } from '../types/bulletin';
import { SINGAPORE_SPECIFIC_FEASTS } from '../data/singaporeFeasts';
import { ROMAN_SANCTORAL_1962 } from '../data/romanSanctoral1962';
import { CAMPION_MISSAL_PROPERS, COMMON_KYRIALES, COMMON_CREDOS } from '../data/missalPropers';
import { MEDITATIONS } from '../data/meditationsData';

// Gauss / Butcher's Gregorian Computus algorithm
export function getEasterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31); // 3 = March, 4 = April
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date.getTime());
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

export function formatDateISO(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDatePretty(date: Date): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${months[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}

export function getDayOfWeekName(date: Date): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getUTCDay()];
}

/**
 * Returns standard English ordinal string: 1st, 2nd, 3rd, 4th, 5th, etc.
 * Avoids any mistakes such as "4nd" or "2th".
 */
export function getOrdinal(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) {
    return `${n}th`;
  }
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

// 1st Sunday of Advent is the Sunday closest to St. Andrew (Nov 30), between Nov 27 and Dec 3
export function getFirstSundayOfAdvent(year: number): Date {
  const nov30 = new Date(Date.UTC(year, 10, 30));
  const dayOfWeek = nov30.getUTCDay(); // 0 is Sunday
  if (dayOfWeek === 0) return nov30;
  if (dayOfWeek <= 3) {
    // Nov 30 is Mon(1), Tue(2), Wed(3) -> closest Sunday is before Nov 30
    return addDays(nov30, -dayOfWeek);
  } else {
    // Nov 30 is Thu(4), Fri(5), Sat(6) -> closest Sunday is after Nov 30
    return addDays(nov30, 7 - dayOfWeek);
  }
}

// Feast of Christ the King is always celebrated on the Last Sunday of October
export function getLastSundayOfOctober(year: number): Date {
  const oct31 = new Date(Date.UTC(year, 9, 31));
  const dayOfWeek = oct31.getUTCDay();
  return addDays(oct31, -dayOfWeek);
}

// Check if a given Sunday in October is the 3rd Sunday of October (World Mission Sunday / Propaganda Fide)
export function isThirdSundayOfOctober(date: Date): boolean {
  if (date.getUTCMonth() !== 9 || date.getUTCDay() !== 0) return false;
  const day = date.getUTCDate();
  return day >= 15 && day <= 21;
}

export interface DayLiturgicalInfo {
  title: string;
  liturgicalClass: LiturgicalClass;
  commemoration?: string;
  isSunday: boolean;
  isFeria?: boolean;
  isSingaporeFeast?: boolean;
  propersKey?: string;
  propersPage?: number;
}

// Resolves liturgical info for a specific date
export function getLiturgicalDayInfo(date: Date): DayLiturgicalInfo {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1; // 1-12
  const day = date.getUTCDate();
  const dayOfWeek = date.getUTCDay(); // 0 is Sunday

  const easter = getEasterSunday(year);
  const diffDaysFromEaster = Math.round((date.getTime() - easter.getTime()) / (1000 * 60 * 60 * 24));

  const advent1 = getFirstSundayOfAdvent(year);
  const diffDaysFromAdvent1 = Math.round((date.getTime() - advent1.getTime()) / (1000 * 60 * 60 * 24));

  const christTheKingDate = getLastSundayOfOctober(year);
  const isChristTheKingDay = dayOfWeek === 0 && date.getUTCMonth() === 9 && date.getUTCDate() === christTheKingDate.getUTCDate();

  // 1. Check Singapore specific feast
  const sgFeast = SINGAPORE_SPECIFIC_FEASTS.find(f => f.month === month && f.day === day);

  // 2. Check Roman Sanctoral
  const romanFeast = ROMAN_SANCTORAL_1962.find(f => f.month === month && f.day === day);

  // If it's a Sunday
  if (dayOfWeek === 0) {
    // Check Christ the King (Last Sunday of October) - takes precedence as I Class!
    if (isChristTheKingDay) {
      return {
        title: 'The Kingship of Our Lord Jesus Christ',
        liturgicalClass: 'I',
        commemoration: isThirdSundayOfOctober(date) ? 'Propaganda Fide' : undefined,
        isSunday: true,
        propersKey: 'christ-the-king',
        propersPage: 505,
      };
    }

    // Check Good Shepherd Sunday in Singapore (2nd Sunday after Easter = Easter + 14 days)
    if (diffDaysFromEaster === 14) {
      return {
        title: 'Good Shepherd Sunday, Titular of the Cathedral',
        liturgicalClass: 'I',
        isSunday: true,
        isSingaporeFeast: true,
        propersKey: 'easter-2',
        propersPage: 272,
      };
    }

    // Singapore I Class feasts on Sunday override II Class Sundays
    if (sgFeast && sgFeast.liturgicalClass === 'I') {
      return {
        title: sgFeast.name,
        liturgicalClass: 'I',
        isSunday: true,
        isSingaporeFeast: true,
        propersPage: sgFeast.month === 2 && sgFeast.day === 14 ? 525 : 509,
      };
    }

    // 4. Candlemas (Purification of the B.V.M. - Feb 2)
    // Feast of the Lord II Class: when occurring on Sunday, it takes precedence over the Sunday after Epiphany
    if (month === 2 && day === 2) {
      return {
        title: 'The Purification of the Blessed Virgin Mary (Candlemas)',
        liturgicalClass: 'II',
        isSunday: true,
        propersKey: 'candlemas',
        propersPage: 437,
      };
    }

    // 5. Moveable Temporal Cycle Sundays: Septuagesima to Trinity Sunday
    if (diffDaysFromEaster === -63) {
      return { title: 'Septuagesima Sunday', liturgicalClass: 'II', isSunday: true, propersKey: 'septuagesima', propersPage: 80 };
    }
    if (diffDaysFromEaster === -56) {
      return { title: 'Sexagesima Sunday', liturgicalClass: 'II', isSunday: true, propersKey: 'sexagesima', propersPage: 85 };
    }
    if (diffDaysFromEaster === -49) {
      return { title: 'Quinquagesima Sunday', liturgicalClass: 'II', isSunday: true, propersKey: 'quinquagesima', propersPage: 91 };
    }
    if (diffDaysFromEaster === -42) {
      return { title: '1st Sunday of Lent', liturgicalClass: 'I', isSunday: true, propersKey: 'lent-1', propersPage: 105 };
    }
    if (diffDaysFromEaster === -35) {
      return { title: '2nd Sunday of Lent', liturgicalClass: 'I', isSunday: true, propersKey: 'lent-2', propersPage: 111 };
    }
    if (diffDaysFromEaster === -28) {
      return { title: '3rd Sunday of Lent', liturgicalClass: 'I', isSunday: true, propersKey: 'lent-3', propersPage: 115 };
    }
    if (diffDaysFromEaster === -21) {
      return { title: '4th Sunday of Lent (Laetare)', liturgicalClass: 'I', isSunday: true, propersKey: 'lent-4', propersPage: 120 };
    }
    if (diffDaysFromEaster === -14) {
      return { title: 'Passion Sunday', liturgicalClass: 'I', isSunday: true, propersKey: 'passion', propersPage: 125 };
    }
    if (diffDaysFromEaster === -7) {
      return { title: 'Palm Sunday', liturgicalClass: 'I', isSunday: true, propersKey: 'palm', propersPage: 131 };
    }
    if (diffDaysFromEaster === 0) {
      return { title: 'Easter Sunday', liturgicalClass: 'I', isSunday: true, propersKey: 'easter', propersPage: 263 };
    }
    if (diffDaysFromEaster === 7) {
      return { title: 'Low Sunday', liturgicalClass: 'I', isSunday: true, propersKey: 'low-sunday', propersPage: 267 };
    }
    if (diffDaysFromEaster === 21) {
      return { title: '3rd Sunday after Easter', liturgicalClass: 'II', isSunday: true, propersKey: 'easter-3', propersPage: 275 };
    }
    if (diffDaysFromEaster === 28) {
      return { title: '4th Sunday after Easter', liturgicalClass: 'II', isSunday: true, propersKey: 'easter-4', propersPage: 279 };
    }
    if (diffDaysFromEaster === 35) {
      return { title: '5th Sunday after Easter', liturgicalClass: 'II', isSunday: true, propersKey: 'easter-5', propersPage: 283 };
    }
    if (diffDaysFromEaster === 42) {
      return { title: 'Sunday after Ascension', liturgicalClass: 'II', isSunday: true, propersKey: 'after-ascension', propersPage: 292 };
    }
    if (diffDaysFromEaster === 49) {
      return { title: 'Pentecost Sunday', liturgicalClass: 'I', isSunday: true, propersKey: 'pentecost', propersPage: 295 };
    }
    if (diffDaysFromEaster === 56) {
      return { title: 'The Most Holy Trinity', liturgicalClass: 'I', isSunday: true, propersKey: 'trinity', propersPage: 303 };
    }

    // 6. Sundays after Pentecost (Easter + 63 days until Advent 1)
    if (diffDaysFromEaster >= 63 && diffDaysFromAdvent1 < 0) {
      const weeksBeforeAdvent = Math.round((advent1.getTime() - date.getTime()) / (7 * 86400000));
      const sundayNum = Math.round((date.getTime() - (easter.getTime() + 49 * 86400000)) / (7 * 86400000));

      const commemorations: string[] = [];
      if (isThirdSundayOfOctober(date)) {
        commemorations.push('Propaganda Fide');
      }
      if (romanFeast && romanFeast.liturgicalClass !== 'IV') {
        commemorations.push(romanFeast.name);
      }

      // Check if it's the Sunday immediately before Advent 1 (always 24th and Last Sunday)
      if (weeksBeforeAdvent === 1) {
        return {
          title: 'Last Sunday after Pentecost',
          liturgicalClass: 'II',
          commemoration: commemorations.length > 0 ? commemorations.join(', ') : undefined,
          isSunday: true,
          propersKey: 'pentecost-last',
          propersPage: 410,
        };
      }

      // Up to 23rd Sunday after Pentecost
      if (sundayNum <= 23) {
        const numStr = getOrdinal(sundayNum);
        const key = `pentecost-${sundayNum}`;
        const propers = CAMPION_MISSAL_PROPERS[key] || CAMPION_MISSAL_PROPERS['pentecost-last'];
        return {
          title: `${numStr} Sunday after Pentecost`,
          liturgicalClass: 'II',
          commemoration: commemorations.length > 0 ? commemorations.join(', ') : undefined,
          isSunday: true,
          propersKey: key,
          propersPage: propers ? propers.page : 397,
        };
      }

      // 1962 Missal Rubric: Resumed Sundays after Epiphany
      // (6th, 5th, 4th, 3rd, 2nd counting backwards from Last Sunday)
      const resumedNum = Math.max(2, Math.min(6, 6 - (weeksBeforeAdvent - 2)));
      const numStr = getOrdinal(resumedNum);
      const key = `epiphany-${resumedNum}`;
      const propers = CAMPION_MISSAL_PROPERS[key] || CAMPION_MISSAL_PROPERS['epiphany-6'];
      return {
        title: `${numStr} Sunday after Epiphany (Resumed)`,
        liturgicalClass: 'II',
        commemoration: commemorations.length > 0 ? commemorations.join(', ') : undefined,
        isSunday: true,
        propersKey: key,
        propersPage: propers ? propers.page : 77,
      };
    }

    // 7. Advent Sundays
    if (diffDaysFromAdvent1 >= 0 && diffDaysFromAdvent1 <= 28) {
      const advWeek = Math.floor(diffDaysFromAdvent1 / 7) + 1;
      const advTitles: Record<number, { title: string; key: string; page: number }> = {
        1: { title: '1st Sunday of Advent', key: 'advent-1', page: 1 },
        2: { title: '2nd Sunday of Advent', key: 'advent-2', page: 5 },
        3: { title: '3rd Sunday of Advent (Gaudete)', key: 'advent-3', page: 9 },
        4: { title: '4th Sunday of Advent', key: 'advent-4', page: 13 },
      };
      const adv = advTitles[advWeek];
      if (adv) {
        return {
          title: adv.title,
          liturgicalClass: 'I',
          isSunday: true,
          propersKey: adv.key,
          propersPage: adv.page,
        };
      }
    }

    // 8. Christmastide & Epiphany Sundays
    if (month === 12 && day === 25) {
      return {
        title: 'The Nativity of Our Lord Jesus Christ (Christmas Day)',
        liturgicalClass: 'I',
        isSunday: true,
        propersKey: 'octave-christmas',
        propersPage: 37,
      };
    }
    if (month === 12 && day > 25) {
      return {
        title: 'Sunday in the Octave of Christmas',
        liturgicalClass: 'II',
        isSunday: true,
        propersKey: 'octave-christmas',
        propersPage: 37,
      };
    }
    if (month === 1 && day === 1) {
      return {
        title: 'The Octave Day of the Nativity of the Lord',
        liturgicalClass: 'I',
        isSunday: true,
        propersPage: 41,
      };
    }
    if (month === 1 && day >= 2 && day <= 5) {
      return {
        title: 'The Most Holy Name of Jesus',
        liturgicalClass: 'II',
        isSunday: true,
        propersKey: 'holy-name',
        propersPage: 45,
      };
    }

    // 9. Season of Epiphany (January 6 until Septuagesima)
    // Jan 6: Epiphany of the Lord
    if (month === 1 && day === 6) {
      return {
        title: 'The Epiphany of the Lord',
        liturgicalClass: 'I',
        isSunday: true,
        propersKey: 'epiphany',
        propersPage: 51,
      };
    }

    // Holy Family (First Sunday after Epiphany, between Jan 7 and Jan 13)
    if (month === 1 && day >= 7 && day <= 13) {
      return {
        title: 'The Holy Family of Jesus, Mary and Joseph',
        liturgicalClass: 'II',
        isSunday: true,
        propersKey: 'holy-family',
        propersPage: 57,
      };
    }

    // All Sundays after Holy Family and before Septuagesima (diffDaysFromEaster < -63)
    if (diffDaysFromEaster < -63) {
      // Find Holy Family Sunday for this year (unique Sunday between Jan 7 and 13)
      const holyFamilyDay = [7, 8, 9, 10, 11, 12, 13].find((d) => {
        return new Date(Date.UTC(year, 0, d)).getUTCDay() === 0;
      }) || 7;
      const holyFamilySunday = new Date(Date.UTC(year, 0, holyFamilyDay));
      const weeksAfterHolyFamily = Math.round((date.getTime() - holyFamilySunday.getTime()) / (7 * 86400000));
      const epiphWeek = weeksAfterHolyFamily + 1; // 2, 3, 4, 5, 6

      const numStr = getOrdinal(epiphWeek);
      const key = `epiphany-${epiphWeek}`;
      const prop = CAMPION_MISSAL_PROPERS[key];

      const commemorations: string[] = [];
      if (romanFeast && romanFeast.liturgicalClass !== 'IV') {
        commemorations.push(romanFeast.name);
      }

      return {
        title: `${numStr} Sunday after Epiphany`,
        liturgicalClass: 'II',
        commemoration: commemorations.length > 0 ? commemorations.join(', ') : undefined,
        isSunday: true,
        propersKey: key,
        propersPage: prop ? prop.page : 61,
      };
    }
  }

  // Weekdays (Monday - Saturday)
  // 1. Check Singapore specific feast
  if (sgFeast) {
    return {
      title: sgFeast.name,
      liturgicalClass: sgFeast.liturgicalClass,
      isSunday: false,
      isSingaporeFeast: true,
    };
  }

  // 2. Check Roman Sanctoral feast of I, II, or III class
  if (romanFeast && (!romanFeast.commemorationOnly || romanFeast.liturgicalClass !== 'IV')) {
    return {
      title: romanFeast.name,
      liturgicalClass: romanFeast.liturgicalClass,
      isSunday: false,
    };
  }

  // 3. If there is a IV class commemoration
  if (romanFeast && romanFeast.commemorationOnly) {
    return {
      title: romanFeast.name,
      liturgicalClass: 'IV',
      isSunday: false,
    };
  }

  // 4. Otherwise it's a Feria
  return {
    title: 'Feria',
    liturgicalClass: 'IV',
    isSunday: false,
    isFeria: true,
  };
}

// Find closest upcoming Sunday (or today if today is Sunday)
export function getUpcomingSunday(referenceDate: Date = new Date()): Date {
  const d = new Date(referenceDate);
  const day = d.getDay();
  const diff = day === 0 ? 0 : 7 - day;
  d.setDate(d.getDate() + diff);
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}

// Default Announcements according to user brief
export const DEFAULT_ANNOUNCEMENTS = [
  {
    id: 'announcement-1',
    title: 'Weekly Post-Mass fellowship (Around 4pm)',
    content: "A group of young adults regularly meet at Star Kitchen Coffeeshop, just across Queen Street. If you're new to Mass or seeking community, feel free to say hi or reach out on Telegram:\nZachary @zackteo, Alvin @alvintingalot, Timothy @timrichardtan, Petrina @dearpetrina or Angeline @AngelineMT",
    isCustom: false,
  },
  {
    id: 'announcement-2',
    title: 'First time at the Extraordinary Form Mass?',
    content: "If it's your first time to Mass and you would like to have a guide in the future or for a friend, feel free to contact us on Telegram:\nZachary @zackteo, Alvin @alvintingalot, Timothy @timrichardtan, Petrina @dearpetrina or Angeline @AngelineMT\nAlternatively, you may drop us an email at SingaporeEFministries@gmail.com",
    isCustom: false,
  },
  {
    id: 'announcement-3',
    title: 'Volunteering Opportunities - Welcome Desk, Rosary, Guides, Photography',
    content: "Interested parties may contact us on Telegram.\nRosary: Nathaniel @goodmorningnathaniel\nBefrienders (Guides) & Welcome Desk: Timothy @timrichardtan\nPhotography: Zachary @zackteo\nAlternatively, you may approach us at the welcome desk or drop us an email at SingaporeEFministries@gmail.com",
    isCustom: false,
  },
];

export const DEFAULT_GENERAL_INFO: GeneralInfo = {
  venueName: 'Church of St. Joseph',
  venueStreet: 'Victoria Street',
  massTiming: '2:00 pm',
  rosaryTiming: '1:30 pm',
  confessionsTiming: '1:30 pm',
  priests: 'Father Augustine Tay, Father Ferdinand Purnomo, O.C.D.',
  footerNotice: 'All are welcome to write their Mass intentions at the Welcome Desk.',
  linkTreeUrl: 'https://linktr.ee/efmasscommunitysingapore',
  email: 'SingaporeEFministries@gmail.com',
};

// Generates the complete bulletin data model for any selected Sunday
export function generateBulletinForSunday(sundayDate: Date): BulletinData {
  const sundayInfo = getLiturgicalDayInfo(sundayDate);
  const sundayDateStr = formatDateISO(sundayDate);

  const sunday: CalendarDay = {
    id: `day-${sundayDateStr}`,
    dateStr: sundayDateStr,
    dayOfWeek: 'Sunday',
    dateFormatted: formatDatePretty(sundayDate),
    title: sundayInfo.title,
    liturgicalClass: sundayInfo.liturgicalClass,
    commemoration: sundayInfo.commemoration,
    isSunday: true,
    isSingaporeFeast: sundayInfo.isSingaporeFeast,
    propersPage: sundayInfo.propersPage || 397,
  };

  // 6 Weekdays: Monday (+1) through Saturday (+6)
  const weekDays: CalendarDay[] = [];
  for (let i = 1; i <= 6; i++) {
    const curDate = addDays(sundayDate, i);
    const info = getLiturgicalDayInfo(curDate);
    const dateStr = formatDateISO(curDate);
    weekDays.push({
      id: `day-${dateStr}`,
      dateStr,
      dayOfWeek: getDayOfWeekName(curDate),
      dateFormatted: formatDatePretty(curDate),
      title: info.title,
      liturgicalClass: info.liturgicalClass,
      commemoration: info.commemoration,
      isSunday: false,
      isFeria: info.isFeria,
      isSingaporeFeast: info.isSingaporeFeast,
    });
  }

  // Next Sunday (+7)
  const nextSundayDate = addDays(sundayDate, 7);
  const nextInfo = getLiturgicalDayInfo(nextSundayDate);
  const nextDateStr = formatDateISO(nextSundayDate);
  const nextSunday: CalendarDay = {
    id: `day-${nextDateStr}`,
    dateStr: nextDateStr,
    dayOfWeek: 'Sunday',
    dateFormatted: formatDatePretty(nextSundayDate),
    title: nextInfo.title,
    liturgicalClass: nextInfo.liturgicalClass,
    commemoration: nextInfo.commemoration,
    isSunday: true,
    isSingaporeFeast: nextInfo.isSingaporeFeast,
    propersPage: nextInfo.propersPage,
  };

  // Mass settings
  const propersPage = sundayInfo.propersPage || 397;
  // Appropriate Kyriale selection based on season
  let defaultKyriale = COMMON_KYRIALES[2]; // Mass VI (Rex Genitor, p. 718)
  if (sundayInfo.title.includes('Advent') || sundayInfo.title.includes('Lent')) {
    defaultKyriale = COMMON_KYRIALES.find(k => k.name.includes('Mass XVII')) || defaultKyriale;
  } else if (sundayInfo.title.includes('Easter') || sundayInfo.title.includes('Pasch')) {
    defaultKyriale = COMMON_KYRIALES.find(k => k.name.includes('Mass I')) || defaultKyriale;
  }

  const massSettings: MassSettings = {
    orderOfMassPage: 570,
    kyrialeName: defaultKyriale.name,
    kyrialePage: defaultKyriale.page,
    credoName: 'Credo III',
    credoPage: 776,
    propersPage,
  };

  // Meditation
  const propKey = sundayInfo.propersKey || 'pentecost-21';
  const meditation = MEDITATIONS[propKey] || MEDITATIONS['pentecost-21'];

  return {
    generationDate: sundayDateStr,
    sunday,
    weekDays,
    nextSunday,
    massSettings,
    announcements: [...DEFAULT_ANNOUNCEMENTS],
    meditation: {
      sundayKey: meditation.sundayKey,
      title: meditation.title,
      part1: meditation.part1,
      part2: meditation.part2,
    },
    generalInfo: { ...DEFAULT_GENERAL_INFO },
  };
}
