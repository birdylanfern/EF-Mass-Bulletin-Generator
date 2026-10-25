export interface MissalEntry {
  key: string;
  name: string;
  page: number;
  category: 'Advent' | 'Christmas' | 'Epiphany' | 'Pre-Lent' | 'Lent' | 'Easter' | 'Pentecost' | 'Feasts';
}

export const CAMPION_MISSAL_PROPERS: Record<string, MissalEntry> = {
  // Advent
  'advent-1': { key: 'advent-1', name: 'First Sunday of Advent', page: 1, category: 'Advent' },
  'advent-2': { key: 'advent-2', name: 'Second Sunday of Advent', page: 5, category: 'Advent' },
  'advent-3': { key: 'advent-3', name: 'Third Sunday of Advent (Gaudete)', page: 9, category: 'Advent' },
  'advent-4': { key: 'advent-4', name: 'Fourth Sunday of Advent', page: 13, category: 'Advent' },

  // Christmas Season
  'octave-christmas': { key: 'octave-christmas', name: 'Sunday within the Octave of Christmas', page: 37, category: 'Christmas' },
  'holy-name': { key: 'holy-name', name: 'Most Holy Name of Jesus (Jan 2–5)', page: 45, category: 'Christmas' },
  'epiphany': { key: 'epiphany', name: 'Epiphany of the Lord', page: 51, category: 'Christmas' },
  'holy-family': { key: 'holy-family', name: 'Holy Family (1st Sunday after Epiphany)', page: 57, category: 'Christmas' },

  // Time after Epiphany
  'epiphany-2': { key: 'epiphany-2', name: '2nd Sunday after Epiphany', page: 61, category: 'Epiphany' },
  'epiphany-3': { key: 'epiphany-3', name: '3rd Sunday after Epiphany', page: 65, category: 'Epiphany' },
  'epiphany-4': { key: 'epiphany-4', name: '4th Sunday after Epiphany', page: 69, category: 'Epiphany' },
  'epiphany-5': { key: 'epiphany-5', name: '5th Sunday after Epiphany', page: 73, category: 'Epiphany' },
  'epiphany-6': { key: 'epiphany-6', name: '6th Sunday after Epiphany', page: 77, category: 'Epiphany' },

  // Pre-Lent (Septuagesima Season)
  'septuagesima': { key: 'septuagesima', name: 'Septuagesima Sunday', page: 80, category: 'Pre-Lent' },
  'sexagesima': { key: 'sexagesima', name: 'Sexagesima Sunday', page: 85, category: 'Pre-Lent' },
  'quinquagesima': { key: 'quinquagesima', name: 'Quinquagesima Sunday', page: 91, category: 'Pre-Lent' },

  // Lent
  'lent-1': { key: 'lent-1', name: 'First Sunday of Lent', page: 105, category: 'Lent' },
  'lent-2': { key: 'lent-2', name: 'Second Sunday of Lent', page: 111, category: 'Lent' },
  'lent-3': { key: 'lent-3', name: 'Third Sunday of Lent', page: 115, category: 'Lent' },
  'lent-4': { key: 'lent-4', name: 'Fourth Sunday of Lent (Laetare)', page: 120, category: 'Lent' },
  'passion': { key: 'passion', name: 'Passion Sunday', page: 125, category: 'Lent' },
  'palm': { key: 'palm', name: 'Palm Sunday', page: 131, category: 'Lent' },

  // Easter Season
  'easter': { key: 'easter', name: 'Easter Sunday', page: 263, category: 'Easter' },
  'low-sunday': { key: 'low-sunday', name: 'Low Sunday (1st after Octave of Easter)', page: 267, category: 'Easter' },
  'easter-2': { key: 'easter-2', name: '2nd Sunday after Easter (Good Shepherd)', page: 272, category: 'Easter' },
  'easter-3': { key: 'easter-3', name: '3rd Sunday after Easter', page: 275, category: 'Easter' },
  'easter-4': { key: 'easter-4', name: '4th Sunday after Easter', page: 279, category: 'Easter' },
  'easter-5': { key: 'easter-5', name: '5th Sunday after Easter', page: 283, category: 'Easter' },
  'ascension': { key: 'ascension', name: 'The Ascension of the Lord', page: 287, category: 'Easter' },
  'after-ascension': { key: 'after-ascension', name: 'Sunday after Ascension', page: 292, category: 'Easter' },
  'pentecost': { key: 'pentecost', name: 'Pentecost Sunday', page: 295, category: 'Easter' },
  'trinity': { key: 'trinity', name: 'Trinity Sunday', page: 303, category: 'Easter' },
  'corpus-christi': { key: 'corpus-christi', name: 'Corpus Christi', page: 307, category: 'Easter' },

  // Time after Pentecost
  'pentecost-2': { key: 'pentecost-2', name: '2nd Sunday after Pentecost', page: 315, category: 'Pentecost' },
  'pentecost-3': { key: 'pentecost-3', name: '3rd Sunday after Pentecost', page: 325, category: 'Pentecost' },
  'pentecost-4': { key: 'pentecost-4', name: '4th Sunday after Pentecost', page: 329, category: 'Pentecost' },
  'pentecost-5': { key: 'pentecost-5', name: '5th Sunday after Pentecost', page: 333, category: 'Pentecost' },
  'pentecost-6': { key: 'pentecost-6', name: '6th Sunday after Pentecost', page: 336, category: 'Pentecost' },
  'pentecost-7': { key: 'pentecost-7', name: '7th Sunday after Pentecost', page: 340, category: 'Pentecost' },
  'pentecost-8': { key: 'pentecost-8', name: '8th Sunday after Pentecost', page: 344, category: 'Pentecost' },
  'pentecost-9': { key: 'pentecost-9', name: '9th Sunday after Pentecost', page: 348, category: 'Pentecost' },
  'pentecost-10': { key: 'pentecost-10', name: '10th Sunday after Pentecost', page: 352, category: 'Pentecost' },
  'pentecost-11': { key: 'pentecost-11', name: '11th Sunday after Pentecost', page: 356, category: 'Pentecost' },
  'pentecost-12': { key: 'pentecost-12', name: '12th Sunday after Pentecost', page: 360, category: 'Pentecost' },
  'pentecost-13': { key: 'pentecost-13', name: '13th Sunday after Pentecost', page: 365, category: 'Pentecost' },
  'pentecost-14': { key: 'pentecost-14', name: '14th Sunday after Pentecost', page: 369, category: 'Pentecost' },
  'pentecost-15': { key: 'pentecost-15', name: '15th Sunday after Pentecost', page: 373, category: 'Pentecost' },
  'pentecost-16': { key: 'pentecost-16', name: '16th Sunday after Pentecost', page: 377, category: 'Pentecost' },
  'pentecost-17': { key: 'pentecost-17', name: '17th Sunday after Pentecost', page: 381, category: 'Pentecost' },
  'pentecost-18': { key: 'pentecost-18', name: '18th Sunday after Pentecost', page: 385, category: 'Pentecost' },
  'pentecost-19': { key: 'pentecost-19', name: '19th Sunday after Pentecost', page: 389, category: 'Pentecost' },
  'pentecost-20': { key: 'pentecost-20', name: '20th Sunday after Pentecost', page: 393, category: 'Pentecost' },
  'pentecost-21': { key: 'pentecost-21', name: '21st Sunday after Pentecost', page: 397, category: 'Pentecost' },
  'pentecost-22': { key: 'pentecost-22', name: '22nd Sunday after Pentecost', page: 402, category: 'Pentecost' },
  'pentecost-23': { key: 'pentecost-23', name: '23rd Sunday after Pentecost', page: 406, category: 'Pentecost' },
  'pentecost-last': { key: 'pentecost-last', name: 'Last Sunday after Pentecost', page: 410, category: 'Pentecost' },

  // Major Feasts
  'christ-the-king': { key: 'christ-the-king', name: 'The Kingship of Our Lord Jesus Christ', page: 505, category: 'Feasts' },
  'sacred-heart': { key: 'sacred-heart', name: 'The Most Sacred Heart of Jesus', page: 315, category: 'Feasts' },
  'all-saints': { key: 'all-saints', name: 'All Saints', page: 509, category: 'Feasts' },
  'all-souls': { key: 'all-souls', name: 'All Souls Day', page: 515, category: 'Feasts' },
  'immaculate-conception': { key: 'immaculate-conception', name: 'Immaculate Conception', page: 431, category: 'Feasts' },
  'candlemas': { key: 'candlemas', name: 'Purification / Candlemas', page: 437, category: 'Feasts' },
  'annunciation': { key: 'annunciation', name: 'Annunciation', page: 453, category: 'Feasts' },
  'assumption': { key: 'assumption', name: 'Assumption of the B.V.M.', page: 485, category: 'Feasts' },
  'our-lady-rosary': { key: 'our-lady-rosary', name: 'Our Lady of the Rosary', page: 499, category: 'Feasts' },
  'cathedral-dedication': { key: 'cathedral-dedication', name: 'Dedication of Cathedral of the Good Shepherd', page: 525, category: 'Feasts' },
};

export const COMMON_KYRIALES = [
  { name: 'Mass I (Lux et origo)', page: 700, season: 'Easter Season' },
  { name: 'Mass IV (Cunctipotens Genitor)', page: 710, season: 'Feasts' },
  { name: 'Mass VI (Rex Genitor)', page: 718, season: 'Sundays & Feasts' },
  { name: 'Mass VIII (De Angelis)', page: 726, season: 'General / Festive' },
  { name: 'Mass IX (Cum jubilo)', page: 732, season: 'Marian Feasts' },
  { name: 'Mass XI (Orbis factor)', page: 740, season: 'Sundays throughout the Year' },
  { name: 'Mass XVII', page: 760, season: 'Sundays of Advent & Lent' },
  { name: 'Mass XVIII', page: 764, season: 'Ferial Days' },
];

export const COMMON_CREDOS = [
  { name: 'Credo I', page: 769 },
  { name: 'Credo II', page: 772 },
  { name: 'Credo III', page: 776 },
  { name: 'Credo IV', page: 780 },
];
