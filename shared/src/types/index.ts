export type PDFTool = 'merge' | 'split' | 'to-jpg' | 'jpg-to-pdf' | 'compress' | 'protect' | 'add-text' | 'delete-pages' | 'reorder' | 'rotate';

export interface FileUpload {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
}

export interface ProcessingStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
  resultUrl?: string;
}

export interface MergeRequest {
  files: FileUpload[];
  order: string[];
}

export interface SplitRequest {
  file: FileUpload;
  pages: number[];
  mode: 'extract' | 'separate';
}

export interface ToJpgRequest {
  file: FileUpload;
  quality?: number;
}

export interface JpgToPdfRequest {
  files: FileUpload[];
  order: string[];
}

export interface CompressRequest {
  file: FileUpload;
  quality?: 'low' | 'medium' | 'high';
}

export interface ProtectRequest {
  file: FileUpload;
  password: string;
  confirmPassword: string;
}

export interface AddTextRequest {
  file: FileUpload;
  pageNumber: number;
  text: string;
  x: number;
  y: number;
  fontSize?: number;
  color?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
