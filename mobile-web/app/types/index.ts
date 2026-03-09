// Enums / union types

export type SaleStatus = 'DRAFT' | 'ACTIVE' | 'ENDED' | 'CANCELLED';
export type ListingStatus = 'AVAILABLE' | 'CLAIMED' | 'SOLD' | 'REMOVED';
export type ListingCondition = 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR';
export type TransactionStatus =
  | 'CLAIMED'
  | 'PAYMENT_PENDING'
  | 'PAID'
  | 'PICKUP_CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUNDED';

// Domain models

export interface User {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  address: string | null;
  trustScore: number;
  reviewCount: number;
  avgRating: number;
  averageRating?: number; // alias used by some screens
  createdAt: string;
}

export interface Sale {
  id: string;
  sellerId: string;
  title: string;
  description?: string;
  address: string | null;
  latitude: number;
  longitude: number;
  startsAt: string;
  endsAt: string;
  status: SaleStatus;
  listingCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ListingImage {
  id: string;
  listingId?: string;
  imageUrl: string;
  sortOrder: number;
}

export interface Listing {
  id: string;
  saleId: string;
  title: string;
  description?: string;
  startingPrice: number;
  minimumPrice: number;
  currentPrice: number;
  category: string;
  condition?: ListingCondition;
  status: ListingStatus;
  images: ListingImage[];
  createdAt: string;
  updatedAt?: string;
}

export interface Transaction {
  id: string;
  listingId: string;
  listingTitle?: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  platformFee: number;
  status: TransactionStatus;
  pickupToken: string | null;
  claimedAt: string;
  paidAt: string | null;
  confirmedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface MessageThread {
  id: string;
  buyerId: string;
  sellerId: string;
  listingId: string;
  listingTitle?: string;
  otherUserName?: string;
  lastMessage: string | null;
  lastMessageAt?: string;
  unreadCount: number;
  createdAt: string;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  content: string;
  createdAt: string;
  readAt: string | null;
}

export interface ThreadDetail {
  thread: MessageThread;
  messages: Message[];
}

export interface Review {
  id: string;
  transactionId: string;
  reviewerId: string;
  sellerId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface SavedItem {
  id: string;
  userId?: string;
  listingId: string;
  listing?: Listing;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
}

// Request DTOs

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface CreateSaleRequest {
  title: string;
  description?: string;
  address: string;
  latitude: number;
  longitude: number;
  startsAt: string;
  endsAt: string;
}

export interface UpdateSaleRequest {
  title?: string;
  description?: string;
  address?: string;
  startsAt?: string;
  endsAt?: string;
}

export interface CreateListingRequest {
  title: string;
  description?: string;
  startingPrice: number;
  minimumPrice: number;
  category: string;
  condition?: ListingCondition;
  imageUrls?: string[];
}

export interface UpdateListingRequest {
  title?: string;
  description?: string;
  startingPrice?: number;
  minimumPrice?: number;
  category?: string;
  condition?: string;
}

export interface UpdateProfileRequest {
  displayName?: string;
  avatarUrl?: string;
  address?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ClaimListingRequest {
  listingId: string;
}

export interface ConfirmPickupRequest {
  token: string;
}

export interface CreateThreadRequest {
  listingId: string;
  message: string;
}

export interface SendMessageRequest {
  content: string;
}

export interface CreateReviewRequest {
  transactionId: string;
  sellerId: string;
  rating: number;
  comment?: string;
}

export interface CreateReportRequest {
  targetType: 'USER' | 'LISTING' | 'MESSAGE';
  targetId: string;
  reason: string;
}

export interface SearchParams {
  q?: string;
  category?: string;
  priceMin?: number;
  priceMax?: number;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  page?: number;
  size?: number;
}

// API response wrappers

export interface ApiResponse<T> {
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ApiError {
  error: string;
  message: string;
  status: number;
}

// Navigation param lists

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  SaleDetail: { saleId: string };
  ListingDetail: { listingId: string };
  Claim: { listingId: string; listing: Listing };
};

export type MapStackParamList = {
  Map: undefined;
  SaleDetail: { saleId: string };
  ListingDetail: { listingId: string };
};

export type CreateSaleStackParamList = {
  CreateSale: undefined;
  AddListings: { saleId: string };
  SaleDetail: { saleId: string };
};

export type SavedStackParamList = {
  Saved: undefined;
  ListingDetail: { listingId: string };
};

export type ProfileStackParamList = {
  Profile: undefined;
  MySales: undefined;
  MyTransactions: undefined;
  Inbox: undefined;
  Chat: { threadId: string; listingTitle?: string };
  EditProfile: undefined;
  ChangePassword: undefined;
  Settings: undefined;
  SaleDetail: { saleId: string };
  ListingDetail: { listingId: string };
};

// Constants

export const CATEGORIES = [
  'Electronics', 'Furniture', 'Clothing', 'Books', 'Sports',
  'Toys', 'Kitchen', 'Garden', 'Tools', 'Automotive',
  'Jewelry', 'Art', 'Collectibles', 'Baby', 'Other',
] as const;

export const CONDITIONS: ListingCondition[] = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR'];
