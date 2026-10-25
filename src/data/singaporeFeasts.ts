import { LiturgicalClass } from '../types/bulletin';

export interface FeastDefinition {
  month: number; // 1-12
  day: number; // 1-31
  name: string;
  liturgicalClass: LiturgicalClass;
  isSingaporeSpecific?: boolean;
  notes?: string;
}

// Feasts specific to the Archdiocese of Singapore (Extraordinary Form)
export const SINGAPORE_SPECIFIC_FEASTS: FeastDefinition[] = [
  {
    month: 2,
    day: 14,
    name: 'Dedication of Cathedral of the Good Shepherd',
    liturgicalClass: 'I',
    isSingaporeSpecific: true,
    notes: 'Cathedral Dedication Feast, I class in Archdiocese',
  },
  {
    month: 2,
    day: 18,
    name: 'St. Étienne-Théodore Cuenot, Bishop, Jean-Pierre Néel and Companions, Martyrs',
    liturgicalClass: 'III',
    isSingaporeSpecific: true,
  },
  // Note: 2nd Sunday after Easter is movable -> Good Shepherd Sunday, Titular of Cathedral, I class
  {
    month: 5,
    day: 24,
    name: 'Our Lady, Help of Christians',
    liturgicalClass: 'III',
    isSingaporeSpecific: true,
  },
  {
    month: 5,
    day: 29,
    name: 'Our Lady, Mediatrix of All Graces',
    liturgicalClass: 'III',
    isSingaporeSpecific: true,
  },
  {
    month: 5,
    day: 30,
    name: 'St. Joan of Arc, Virgin',
    liturgicalClass: 'III',
    isSingaporeSpecific: true,
  },
  {
    month: 9,
    day: 26,
    name: 'St. Laurent Imbert, Bishop, Pierre Maubant, Jacques Chastan, Andrew Kim and Companions, Martyrs',
    liturgicalClass: 'III',
    isSingaporeSpecific: true,
  },
  {
    month: 10,
    day: 3,
    name: 'St. Thérèse of the Child Jesus, Virgin, Patroness of Missions',
    liturgicalClass: 'I',
    isSingaporeSpecific: true,
    notes: 'I class as Principal Patroness of the Missions',
  },
  {
    month: 11,
    day: 24,
    name: 'St. Jean-Gabriel Dufresse, Bishop, Pierre Dumoulin-Borie and Companions, Martyrs',
    liturgicalClass: 'III',
    isSingaporeSpecific: true,
  },
  {
    month: 12,
    day: 3,
    name: 'St. Francis Xavier, Confessor, Patron of the Archdiocese and of Missions',
    liturgicalClass: 'I',
    isSingaporeSpecific: true,
    notes: 'I class as Principal Patron of the Archdiocese of Singapore and of Missions',
  },
];
