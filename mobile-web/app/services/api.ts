import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
  ApiResponse,
  PaginatedResponse,
  Sale,
  Listing,
  Transaction,
  MessageThread,
  Message,
  ThreadDetail,
  Review,
  SavedItem,
  UserProfile,
  AuthResponse,
  LoginStartResponse,
  VerificationMethod,
  TotpSetupResponse,
  CreateSaleRequest,
  UpdateSaleRequest,
  CreateListingRequest,
  UpdateListingRequest,
  UpdateProfileRequest,
  ClaimListingRequest,
  ConfirmPickupRequest,
  CreateThreadRequest,
  SendMessageRequest,
  CreateReviewRequest,
  CreateReportRequest,
  CreateOfferRequest,
  CounterOfferRequest,
  CreateOfferResponse,
  OfferResponse,
  SearchParams,
  RefreshRequest,
} from '../types';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080/api',
});

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

// --- Auth interceptors ---

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => {
    if (token) {
      p.resolve(token);
    } else {
      p.reject(error);
    }
  });
  failedQueue = [];
}

api.interceptors.request.use((config) => {
  const { useAuthStore } = require('../stores/useAuthStore');
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const { useAuthStore } = require('../stores/useAuthStore');
    const { refreshToken: storedRefreshToken, logout } = useAuthStore.getState();

    if (!storedRefreshToken) {
      useAuthStore.getState().setShowAuthPrompt(true);
      logout();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { accessToken: newToken, userId } = await refreshToken({ refreshToken: storedRefreshToken });
      useAuthStore.getState().setTokens(newToken, storedRefreshToken, userId);
      processQueue(null, newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      useAuthStore.getState().setShowAuthPrompt(true);
      logout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

// --- Auth ---

export async function loginStart(email: string): Promise<LoginStartResponse> {
  const { data } = await api.post<ApiResponse<LoginStartResponse>>('/auth/login/start', { email });
  return data.data;
}

export async function loginSendCode(challengeId: string, method: string): Promise<void> {
  await api.post('/auth/login/send-code', { challengeId, method });
}

export async function loginVerify(challengeId: string, method: string, code: string): Promise<AuthResponse> {
  const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/login/verify', { challengeId, method, code });
  return data.data;
}

export async function register(email: string, displayName: string): Promise<{ challengeId: string }> {
  const { data } = await api.post<ApiResponse<{ challengeId: string }>>('/auth/register', { email, displayName });
  return data.data;
}

export async function registerVerify(challengeId: string, code: string): Promise<AuthResponse> {
  const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/register/verify', { challengeId, code });
  return data.data;
}

export async function refreshToken(payload: RefreshRequest): Promise<AuthResponse> {
  const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/refresh', payload);
  return data.data;
}

export async function getVerificationMethods(): Promise<VerificationMethod[]> {
  const { data } = await api.get<ApiResponse<VerificationMethod[]>>('/auth/methods');
  return data.data;
}

export async function setupTotp(): Promise<TotpSetupResponse> {
  const { data } = await api.post<ApiResponse<TotpSetupResponse>>('/auth/methods/totp/setup');
  return data.data;
}

export async function confirmTotp(code: string): Promise<void> {
  await api.post('/auth/methods/totp/confirm', { code });
}

export async function setupSms(phoneNumber: string): Promise<{ challengeId: string }> {
  const { data } = await api.post<ApiResponse<{ challengeId: string }>>('/auth/methods/sms/setup', { phoneNumber });
  return data.data;
}

export async function confirmSms(challengeId: string, code: string): Promise<void> {
  await api.post('/auth/methods/sms/confirm', { challengeId, code });
}

export async function removeVerificationMethod(type: string): Promise<void> {
  await api.delete(`/auth/methods/${type}`);
}

// --- User ---

export async function getMe(): Promise<UserProfile> {
  const { data } = await api.get<ApiResponse<UserProfile>>('/users/me');
  return data.data;
}

export async function updateMe(payload: UpdateProfileRequest): Promise<UserProfile> {
  const { data } = await api.put<ApiResponse<UserProfile>>('/users/me', payload);
  return data.data;
}

// --- Sales ---

export async function getSales(): Promise<Sale[]> {
  const { data } = await api.get<ApiResponse<Sale[]>>('/sales');
  return data.data ?? [];
}

export async function getSale(id: string): Promise<Sale> {
  const { data } = await api.get<ApiResponse<Sale>>(`/sales/${id}`);
  return data.data;
}

export async function getNearbySales(lat: number, lng: number, radiusKm: number): Promise<Sale[]> {
  const { data } = await api.get<ApiResponse<Sale[]>>('/nearby_sales', {
    params: { lat, lng, radiusKm },
  });
  return data.data ?? [];
}

export async function createSale(payload: CreateSaleRequest): Promise<Sale> {
  const { data } = await api.post<ApiResponse<Sale>>('/sales', payload);
  return data.data;
}

export async function updateSale(id: string, payload: UpdateSaleRequest): Promise<Sale> {
  const { data } = await api.put<ApiResponse<Sale>>(`/sales/${id}`, payload);
  return data.data;
}

export async function deleteSale(id: string): Promise<void> {
  await api.delete(`/sales/${id}`);
}

export async function activateSale(id: string): Promise<Sale> {
  const { data } = await api.post<ApiResponse<Sale>>(`/sales/${id}/activate`);
  return data.data;
}

export async function endSale(id: string): Promise<Sale> {
  const { data } = await api.post<ApiResponse<Sale>>(`/sales/${id}/end`);
  return data.data;
}

// --- Listings ---

export async function getListings(saleId: string): Promise<Listing[]> {
  const { data } = await api.get<ApiResponse<Listing[]>>(`/sales/${saleId}/listings`);
  return data.data ?? [];
}

export async function getListing(id: string): Promise<Listing> {
  const { data } = await api.get<ApiResponse<Listing>>(`/listings/${id}`);
  return data.data;
}

export async function createListing(saleId: string, payload: CreateListingRequest): Promise<Listing> {
  const { data } = await api.post<ApiResponse<Listing>>(`/sales/${saleId}/listings`, payload);
  return data.data;
}

export async function updateListing(id: string, payload: UpdateListingRequest): Promise<Listing> {
  const { data } = await api.put<ApiResponse<Listing>>(`/listings/${id}`, payload);
  return data.data;
}

export async function deleteListing(id: string): Promise<void> {
  await api.delete(`/listings/${id}`);
}

export async function updateListingStatus(id: string, status: string): Promise<Listing> {
  const { data } = await api.put<ApiResponse<Listing>>(`/listings/${id}/status`, { status });
  return data.data;
}

// --- Search ---

export async function searchListings(params: SearchParams): Promise<PaginatedResponse<Listing>> {
  const { data } = await api.get<PaginatedResponse<Listing>>('/search', { params });
  return data;
}

// --- Map ---

export async function getMapSales(lat: number, lng: number, radiusKm: number): Promise<Sale[]> {
  const { data } = await api.get<ApiResponse<Sale[]>>('/map/sales', {
    params: { lat, lng, radiusKm },
  });
  return data.data;
}

export async function getMapListings(
  lat: number,
  lng: number,
  radiusKm: number,
  page?: number,
  size?: number,
): Promise<PaginatedResponse<Listing>> {
  const { data } = await api.get<PaginatedResponse<Listing>>('/map/listings', {
    params: { lat, lng, radiusKm, page, size },
  });
  return data;
}

// --- Transactions ---

export async function getTransactions(): Promise<Transaction[]> {
  const { data } = await api.get<ApiResponse<Transaction[]>>('/transactions');
  return data.data ?? [];
}

export async function getTransaction(id: string): Promise<Transaction> {
  const { data } = await api.get<ApiResponse<Transaction>>(`/transactions/${id}`);
  return data.data;
}

export async function claimListing(payload: ClaimListingRequest): Promise<Transaction> {
  const { data } = await api.post<ApiResponse<Transaction>>('/transactions/claim', payload);
  return data.data;
}

export async function confirmPayment(id: string): Promise<Transaction> {
  const { data } = await api.post<ApiResponse<Transaction>>(`/transactions/${id}/confirm-payment`);
  return data.data;
}

export async function confirmPickup(id: string, payload: ConfirmPickupRequest): Promise<Transaction> {
  const { data } = await api.post<ApiResponse<Transaction>>(`/transactions/${id}/confirm-pickup`, payload);
  return data.data;
}

export async function cancelTransaction(id: string): Promise<Transaction> {
  const { data } = await api.post<ApiResponse<Transaction>>(`/transactions/${id}/cancel`);
  return data.data;
}

// --- Messages ---

export async function getThreads(): Promise<MessageThread[]> {
  const { data } = await api.get<ApiResponse<MessageThread[]>>('/messages/threads');
  return data.data ?? [];
}

export async function getThread(id: string): Promise<ThreadDetail> {
  const { data } = await api.get<ApiResponse<ThreadDetail>>(`/messages/threads/${id}`);
  return data.data;
}

export async function createThread(payload: CreateThreadRequest): Promise<MessageThread> {
  const { data } = await api.post<ApiResponse<MessageThread>>('/messages/threads', payload);
  return data.data;
}

export async function sendMessage(threadId: string, payload: SendMessageRequest): Promise<Message> {
  const { data } = await api.post<ApiResponse<Message>>(`/messages/threads/${threadId}`, payload);
  return data.data;
}

// --- Images ---

export const IMAGE_MAX_FILE_SIZE = 12 * 1024 * 1024; // 12 MB
export const IMAGE_MIN_DIMENSION = 500; // px
export const IMAGE_MAX_DIMENSION = 9000; // px
export const IMAGE_ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/tiff', 'image/bmp', 'image/webp'];

export async function uploadImage(formData: FormData): Promise<string> {
  const { data } = await api.post<ApiResponse<string>>('/images/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
}

// --- Saved ---

export async function getSavedListings(): Promise<Listing[]> {
  const { data } = await api.get<ApiResponse<Listing[]>>('/saved');
  return data.data ?? [];
}

export async function saveListing(listingId: string): Promise<void> {
  await api.post(`/saved/${listingId}`);
}

export async function unsaveListing(listingId: string): Promise<void> {
  await api.delete(`/saved/${listingId}`);
}

// --- Reviews ---

export async function getSellerReviews(userId: string): Promise<Review[]> {
  const { data } = await api.get<ApiResponse<Review[]>>(`/users/${userId}/reviews`);
  return data.data;
}

export async function createReview(payload: CreateReviewRequest): Promise<Review> {
  const { data } = await api.post<ApiResponse<Review>>('/reviews', payload);
  return data.data;
}

// --- Reports ---

export async function createReport(payload: CreateReportRequest): Promise<void> {
  await api.post('/reports', payload);
}

// --- Offers ---

export async function createOffer(payload: CreateOfferRequest): Promise<CreateOfferResponse> {
  const { data } = await api.post<ApiResponse<CreateOfferResponse>>('/offers', payload);
  return data.data;
}

export async function acceptOffer(offerId: string): Promise<OfferResponse> {
  const { data } = await api.post<ApiResponse<OfferResponse>>(`/offers/${offerId}/accept`);
  return data.data;
}

export async function rejectOffer(offerId: string): Promise<OfferResponse> {
  const { data } = await api.post<ApiResponse<OfferResponse>>(`/offers/${offerId}/reject`);
  return data.data;
}

export async function counterOffer(offerId: string, payload: CounterOfferRequest): Promise<CreateOfferResponse> {
  const { data } = await api.post<ApiResponse<CreateOfferResponse>>(`/offers/${offerId}/counter`, payload);
  return data.data;
}

export default api;
