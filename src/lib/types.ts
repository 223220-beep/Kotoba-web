// ================================================
// KOTOBA — TypeScript Types & Interfaces
// Aligned with Kotoba-back / Content Service API
// ================================================

// ---------- Auth ----------

export interface User {
  id: string;
  email: string;
  username: string;
  age?: number;
  country?: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  paypalEmail?: string;
  fullName?: string;
  pronouns?: string;
  website?: string;
  birthDate?: string;
  createdAt: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  username?: string;
  age?: number;
  country?: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  expires_at?: number;
  token_type?: string;
  user: User;
}

// ---------- Works ----------

export type WorkStatus = "draft" | "published" | "ongoing" | "completed" | "hiatus";

export const VALID_GENRES = [
  "Ciencia Ficción", "Fantasía", "Ciberpunk", "Fantasía Oscura",
  "Thriller", "Misterio", "Romance", "Horror", "Drama", "Poesía",
] as const;

export type Genre = typeof VALID_GENRES[number];

export interface Work {
  id: string;
  title: string;
  synopsis?: string;
  genres: string[];
  coverUrl?: string;
  authorId: string;
  authorName?: string;
  status: WorkStatus;
  viewCount: number;
  chapterCount?: number;
  rating?: number;
  ratingCount?: number;
  language?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkFilters {
  query?: string;
  genre?: string;
  authorId?: string;
  page?: number;
  limit?: number;
  sortBy?: "popularity" | "newest" | "rating" | "most-read";
}

// ---------- Chapters ----------

export interface Chapter {
  id: string;
  workId: string;
  title: string;
  content: string;
  orderNumber: number;
  status: "draft" | "published";
  wordCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChapterSummary {
  id: string;
  workId: string;
  title: string;
  orderNumber: number;
  wordCount?: number;
  status?: "draft" | "published";
  publishedAt?: string;
}

// ---------- Comments ----------

export interface Comment {
  id: string;
  workId: string;
  chapterId?: string;
  userId: string;
  content: string;
  createdAt: string;
  username?: string;
  avatarUrl?: string;
  parentId?: string;
  replies?: Comment[];
  likeCount: number;
  likedByMe: boolean;
  isLocal?: boolean;
}

// ---------- Votes ----------

export interface VoteResponse {
  userVote: number;
  stats: {
    avgRating: number;
    totalVotes: number;
  };
}

// ---------- Bookmarks ----------

export interface Bookmark {
  workId: string;
  userId: string;
  createdAt: string;
  work?: Work;
}

// ---------- Users / Authors ----------

export interface AuthorProfile {
  id: string;
  username: string;
  email?: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  age?: number;
  country?: string;
  followersCount?: number;
  followingCount?: number;
  isFollowedByMe?: boolean;
  works?: Work[];
  publishedWorks?: number;
  totalReads?: number;
  createdAt: string;
}

// ---------- Dashboard ----------

export interface DashboardStats {
  activeReaders: number;
  totalReads: number;
  publishedWorks: number;
  followers: number;
  engagementData: EngagementPoint[];
  nextPublicationDeadline?: string;
}

export interface EngagementPoint {
  date: string;
  value: number;
}

// ---------- Manuscript / My Works ----------

export interface Manuscript {
  id: string;
  title: string;
  genres: string[];
  status: WorkStatus;
  chapterCount: number;
  draftCount: number;
  lastEditedAt: string;
  coverUrl?: string;
}

// ---------- Feed ----------

export interface FeedData {
  trending: Work[];
  forYou: Work[];
  newAuthors: AuthorProfile[];
  featured?: Work;
}

// ---------- API Responses ----------

export interface ApiResponse<T> {
  data?: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

// ---------- Search ----------

export interface SearchResult {
  id: string;
  title: string;
  authorId: string;
  authorName: string;
  coverUrl?: string;
  synopsis?: string;
  genres: string[];
  status: string;
  chapterCount: number;
  rating: number;
  viewCount: number;
  similarity?: number;
}

// ---------- Upload ----------

export interface UploadResponse {
  url: string;
}

// ---------- Activity ----------

export interface LocalCommentData {
  replies: Record<string, Comment[]>;
  likes: Record<string, string[]>; // commentId -> userId[]
  localComments: Comment[];
}

export interface ActivityItem {
  id: string;
  type: "chapter_published" | "recommended" | "milestone";
  description: string;
  workTitle?: string;
  workId?: string;
  timestamp: string;
}
