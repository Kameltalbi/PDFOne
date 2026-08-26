// PDF Tool Types
export type PDFTool = 'merge' | 'to-jpg' | 'compress' | 'protect' | 'add-text';

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
  order: string[]; // file IDs in desired order
}

export interface ToJpgRequest {
  file: FileUpload;
  quality?: number; // 1-100
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

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
