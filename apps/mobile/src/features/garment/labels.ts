import type { Season } from '@woven/core';

/** Spanish labels for garment enums (DB values stay in English). */
export const SEASONS: { value: Season; label: string }[] = [
  { value: 'spring', label: 'Primavera' },
  { value: 'summer', label: 'Verano' },
  { value: 'fall', label: 'Otoño' },
  { value: 'winter', label: 'Invierno' },
];

export const seasonLabel = (season: Season) =>
  SEASONS.find((option) => option.value === season)?.label ?? season;

export const STATUS_LABELS = {
  processing: 'Procesando',
  active: 'Activa',
  archived: 'Archivada',
} as const;
