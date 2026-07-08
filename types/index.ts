// types/index.ts — DTOs for NoteVaultPro

export type Category =
  | 'GENERAL'
  | 'TECHNOLOGY'
  | 'SCIENCE'
  | 'LITERATURE'
  | 'PHILOSOPHY'
  | 'HISTORY'
  | 'ART'
  | 'BUSINESS'

export type Visibility = 'PRIVATE' | 'PUBLIC' | 'FOR_SALE'

export type NotificationType = 'INFO' | 'SUCCESS' | 'ERROR' | 'WARNING' | 'PURCHASE'
export type PurchaseStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type NoteReviewStatus = 'APPROVED' | 'PENDING' | 'REJECTED' | 'NEEDS_EDIT'

export interface PaymentInfo {
  bankName: string
  accountNumber: string
  accountHolder: string
}

export interface OrderItem {
  id: string
  noteTitle: string
  buyerUsername: string
  buyerFullName: string | null
  price: number
  status: PurchaseStatus
  createdAt: string
}

export interface UserDTO {
  id: string
  username: string
  email: string
  fullName: string | null
  bio: string | null
  avatarColor: string
  role: string
  createdAt: string
  paymentInfo?: PaymentInfo | null
}

export interface NoteDTO {
  id: string
  title: string
  content: string
  category: Category
  tags: string[]
  coverColor: string
  visibility: Visibility
  price: number | null
  downloads: number
  isPinned: boolean
  isPublic: boolean
  coverImage: string | null
  reviewStatus: NoteReviewStatus
  reviewNote: string | null
  canShare: boolean
  createdAt: string
  updatedAt: string
  author: Pick<UserDTO, 'id' | 'username' | 'fullName' | 'avatarColor'>
}

export interface NotificationDTO {
  id: string
  type: NotificationType
  message: string
  isRead: boolean
  createdAt: string
}

export interface PurchaseDTO {
  id: string
  noteId: string
  noteTitle: string
  price: number
  status: PurchaseStatus
  createdAt: string
  buyer?: { id: string; username: string; fullName: string | null }
}

// Input types for API requests
export interface RegisterInput {
  username: string
  email: string
  password: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface NoteInput {
  title: string
  content: string
  category: Category
  tags?: string[]
  coverColor?: string
  coverImage?: string | null
  visibility: Visibility
  price?: number | null
}

export interface ProfileInput {
  fullName?: string
  bio?: string
  avatarColor?: string
  paymentInfo?: PaymentInfo | null
}

// API response wrapper
export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string }

// Analytics types
export interface AnalyticsDTO {
  totalNotes: number
  publicNotes: number
  forSaleNotes: number
  totalDownloads: number
  byCategory: { category: string; count: number }[]
  byVisibility: { visibility: string; count: number }[]
  dailyActivity: { date: string; count: number }[]
  topDownloaded: { id: string; title: string; downloads: number }[]
}

// JWT payload
export interface JWTPayload {
  userId: string
  email: string
  username: string
  role: string
}
