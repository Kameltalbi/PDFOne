import type { BlockAlign, BlockKind, LayoutBlock, LayoutPage } from '../../utils/pdfText.js';

export type TranslateMode = 'layout' | 'text';
export type TranslateLang = 'fr' | 'en' | 'es' | 'pt' | 'de' | 'tr' | 'ar' | 'it';

export type AnalyzedDocument = {
  engine: 'digital' | 'ocr';
  pageCount: number;
  pages: LayoutPage[];
  blocks: LayoutBlock[];
  title?: string;
};

export type TranslationItem = {
  id: string;
  text: string;
  prev?: string;
  next?: string;
};

export type FittedBlock = LayoutBlock & {
  id: string;
  translation: string;
  skip: boolean;
  fittedSize: number;
  extraHeight: number;
  warning?: string;
};

export type TranslateReport = {
  engine: 'digital' | 'ocr';
  mode: TranslateMode;
  language: string;
  blockCount: number;
  translatedCount: number;
  warnings: string[];
  pageCountMatch: boolean;
  overflows: number;
  overlaps: number;
};

export type { BlockAlign, BlockKind, LayoutBlock, LayoutPage };
