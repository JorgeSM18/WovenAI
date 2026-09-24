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

// Reference data is stored in English (the AI classifier matches on those names);
// only the display is translated. Unknown names fall back to the stored value.
const CATEGORY_LABELS: Record<string, string> = {
  Tops: 'Parte de arriba',
  Bottoms: 'Parte de abajo',
  Outerwear: 'Abrigos',
  Dresses: 'Vestidos',
  Footwear: 'Calzado',
  Bags: 'Bolsos',
  Accessories: 'Accesorios',
};

const COLOR_LABELS: Record<string, string> = {
  Black: 'Negro',
  White: 'Blanco',
  Grey: 'Gris',
  Navy: 'Azul marino',
  Blue: 'Azul',
  'Light Blue': 'Azul claro',
  Red: 'Rojo',
  Pink: 'Rosa',
  Green: 'Verde',
  Olive: 'Verde oliva',
  Yellow: 'Amarillo',
  Orange: 'Naranja',
  Brown: 'Marrón',
  Beige: 'Beige',
  Purple: 'Morado',
};

export const categoryLabel = (name: string) => CATEGORY_LABELS[name] ?? name;
export const colorLabel = (name: string) => COLOR_LABELS[name] ?? name;

export const STATUS_LABELS = {
  processing: 'Procesando',
  active: 'Activa',
  archived: 'Archivada',
} as const;
