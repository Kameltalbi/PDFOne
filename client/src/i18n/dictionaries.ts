import type { Locale, Messages } from './types';
import { fr } from './locales/fr';
import { en } from './locales/en';
import { es } from './locales/es';
import { pt } from './locales/pt';
import { de } from './locales/de';
import { tr } from './locales/tr';
import { ar } from './locales/ar';
import { it } from './locales/it';

export const dictionaries: Record<Locale, Messages> = { fr, en, es, pt, de, tr, ar, it };
