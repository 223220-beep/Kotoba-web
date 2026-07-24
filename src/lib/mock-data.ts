// ================================================
// KOTOBA — Mock Data (kept for reference, not used)
// ================================================

import type {
  Work, AuthorProfile, DashboardStats, ChapterSummary,
} from "./types";

export const mockUser = {
  id: "user-1",
  username: "ak.varela",
  email: "ak@kotoba.mx",
  avatarUrl: undefined as string | undefined,
  bio: "Escribo mundos donde la física es opcional...",
  createdAt: "2024-01-15T00:00:00Z",
};

export const mockWorks: Work[] = [];

export const mockAuthorProfile: AuthorProfile = {
  id: "user-1",
  username: "ak.varela",
  bio: "Escritor de ciencia ficción.",
  createdAt: "2024-01-15T00:00:00Z",
};

export const mockDashboard: DashboardStats = {
  activeReaders: 2847,
  totalReads: 48320,
  publishedWorks: 3,
  followers: 1204,
  engagementData: [{ date: "2024-06-01", value: 1200 }],
};

export const mockManuscripts: any[] = [];

export const mockChapters: ChapterSummary[] = [];

export const mockFeed = { trending: [], featured: null, forYou: [] };
