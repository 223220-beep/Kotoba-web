// ================================================
// KOTOBA — Centralized API Module
// Connects to Kotoba-back, Content Service & Search
// ================================================

import type {
  LoginDto, RegisterDto,
  User, Work, WorkFilters, Chapter, ChapterSummary,
  Comment, VoteResponse, Bookmark,
  AuthorProfile, DashboardStats, Manuscript,
  SearchResult, UploadResponse, LocalCommentData,
} from "./types";

interface LoginResponse {
  user: User;
  session: {
    access_token: string;
    refresh_token?: string;
  };
}

const API_URL    = process.env.NEXT_PUBLIC_API_URL    || "https://kotoba-back-production.up.railway.app/api";
const CONTENT_URL = process.env.NEXT_PUBLIC_CONTENT_API_URL || API_URL;
const SEARCH_URL = process.env.NEXT_PUBLIC_SEARCH_API_URL || "https://search-service-production-dac3.up.railway.app";

// ---------- snake_case → camelCase transformer ----------

function camelize(str: string): string {
  return str.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
}

function transform<T>(obj: unknown): T {
  if (Array.isArray(obj)) return obj.map(transform) as T;
  if (obj !== null && typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      // Pass through __typename and similar GraphQL fields, and id
      if (key === "id" || key.startsWith("__")) {
        result[key] = value;
      } else {
        result[camelize(key)] = transform(value);
      }
    }
    return result as T;
  }
  return obj as T;
}

function transformWork(work: Record<string, unknown>): Work {
  const w = transform<Record<string, unknown>>(work);
  return {
    ...w as unknown as Work,
    rating: (w as any).rating ?? 0,
    ratingCount: (w as any).ratingCount ?? 0,
    chapterCount: (w as any).chapterCount ?? 0,
  };
}

// ---------- HTTP helpers ----------

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("kotoba_token");
}

async function request<T>(
  baseUrl: string,
  endpoint: string,
  options: RequestInit = {},
  transformResponse: boolean = true,
): Promise<T> {
  const url = `${baseUrl}${endpoint}`;
  const defaultHeaders: Record<string, string> = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) defaultHeaders["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url, {
    ...options,
    headers: { ...defaultHeaders, ...options.headers },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw { message: body.error || body.message || "Error de servidor", statusCode: res.status };
  }

  const data = await res.json();
  return transformResponse ? transform<T>(data) : data;
}

function apiGet<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
  let qs = "";
  if (params) {
    const filtered = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== ""),
    ) as Record<string, string>;
    const entries = Object.entries(filtered);
    if (entries.length > 0) qs = "?" + new URLSearchParams(filtered).toString();
  }
  return request<T>(API_URL, `${endpoint}${qs}`);
}

function apiPost<T>(endpoint: string, body?: unknown): Promise<T> {
  return request<T>(API_URL, endpoint, { method: "POST", body: body ? JSON.stringify(body) : undefined });
}

function apiPut<T>(endpoint: string, body?: unknown): Promise<T> {
  return request<T>(API_URL, endpoint, { method: "PUT", body: body ? JSON.stringify(body) : undefined });
}

function apiDel<T>(endpoint: string): Promise<T> {
  return request<T>(API_URL, endpoint, { method: "DELETE" });
}

function contentGet<T>(endpoint: string): Promise<T> {
  return request<T>(CONTENT_URL, endpoint);
}

function contentPost<T>(endpoint: string, body?: unknown): Promise<T> {
  return request<T>(CONTENT_URL, endpoint, { method: "POST", body: body ? JSON.stringify(body) : undefined });
}

function contentPut<T>(endpoint: string, body?: unknown): Promise<T> {
  return request<T>(CONTENT_URL, endpoint, { method: "PUT", body: body ? JSON.stringify(body) : undefined });
}

function contentDel<T>(endpoint: string): Promise<T> {
  return request<T>(CONTENT_URL, endpoint, { method: "DELETE" });
}

// ---------- Upload helper (multipart) ----------

async function uploadFile(endpoint: string, file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("image", file);
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${endpoint}`, { method: "PUT", headers, body: formData });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw { message: body.error || "Error al subir archivo", statusCode: res.status };
  }
  const data = await res.json();
  return transform<UploadResponse>(data);
}

// ---------- Local comment store (replies & likes) ----------

function getLocalData(): LocalCommentData {
  if (typeof window === "undefined") return { replies: {}, likes: {}, localComments: [] };
  try { return JSON.parse(localStorage.getItem("kotoba_comment_data") || "null") || { replies: {}, likes: {}, localComments: [] }; }
  catch { return { replies: {}, likes: {}, localComments: [] }; }
}

function saveLocalData(data: LocalCommentData) {
  localStorage.setItem("kotoba_comment_data", JSON.stringify(data));
}

function enrichWithLocal(comments: Comment[], workId: string): Comment[] {
  const local = getLocalData();
  const userId = getToken() ? JSON.parse(atob(getToken()!.split(".")[1])).sub || "" : "";

  const withReplies = comments.map(c => {
    const replies = local.replies[c.id] || [];
    return {
      ...c,
      likeCount: (local.likes[c.id]?.length || 0),
      likedByMe: userId ? (local.likes[c.id]?.includes(userId) || false) : false,
      replies: replies.map(r => ({
        ...r,
        likeCount: (local.likes[r.id]?.length || 0),
        likedByMe: userId ? (local.likes[r.id]?.includes(userId) || false) : false,
      })),
    };
  });

  const locals = (local.localComments || []).filter(c => c.workId === workId && !c.parentId);
  return [...withReplies, ...locals];
}

// ================================================
// API — All endpoints organized by domain
// ================================================

export const api = {
  // ---------- Auth ----------
  auth: {
    login:    (dto: LoginDto)    => apiPost<LoginResponse>("/auth/login", dto),
    register: (dto: RegisterDto) => apiPost<{ message: string }>("/auth/register", dto),
    me:       ()                 => apiGet<User>("/users/me"),
    discord:  ()                 => apiPost<{ message: string }>("/auth/discord", {}),
  },

  // ---------- Works (via Content Service) ----------
  works: {
    getAll: (filters?: WorkFilters) =>
      contentGet<Work[]>(`/works${filters?.authorId ? `?author_id=${filters.authorId}` : ""}${filters?.genre ? `${filters.authorId ? "&" : "?"}genre=${filters.genre}` : ""}`),

    getById: (id: string) =>
      contentGet<Work>(`/works/${id}`),

    getTrending: () =>
      contentGet<Work[]>("/works"),

    create: (data: Partial<Work>) =>
      contentPost<Work>("/works", data),

    update: (id: string, data: Partial<Work>) =>
      contentPut<Work>(`/works/${id}`, data),

    delete: (id: string) =>
      contentDel<{ message: string }>(`/works/${id}`),
  },

  // ---------- Chapters (via Content Service) ----------
  chapters: {
    getByWork: (workId: string) =>
      contentGet<ChapterSummary[]>(`/works/${workId}/chapters`),

    getById: (chapterId: string) =>
      contentGet<Chapter>(`/chapters/${chapterId}`),

    create: (data: { work_id: string; title: string; content?: string; order_number?: number; status?: string }) =>
      contentPost<Chapter>("/chapters", data),

    update: (chapterId: string, data: Partial<Chapter>) =>
      contentPut<Chapter>(`/chapters/${chapterId}`, data),

    delete: (chapterId: string) =>
      contentDel<{ message: string }>(`/chapters/${chapterId}`),
  },

  // ---------- Comments ----------
  comments: {
    getByWork: async (workId: string): Promise<Comment[]> => {
      try {
        const remote = await contentGet<Comment[]>(`/works/${workId}/comments`);
        return enrichWithLocal(remote, workId);
      } catch {
        return enrichWithLocal([], workId);
      }
    },

    create: async (workId: string, content: string) => {
      try {
        const created = await contentPost<Comment>(`/works/${workId}/comments`, { content });
        return { ...created, likeCount: 0, likedByMe: false, replies: [] };
      } catch {
        const local = getLocalData();
        const localComment: Comment = {
          id: `local_${Date.now()}`,
          workId,
          userId: "local",
          content,
          createdAt: new Date().toISOString(),
          username: "Tú",
          likeCount: 0,
          likedByMe: false,
          replies: [],
          isLocal: true,
        };
        local.localComments.push(localComment);
        saveLocalData(local);
        return localComment;
      }
    },

    delete: async (commentId: string) => {
      const local = getLocalData();
      if (commentId.startsWith("local_")) {
        local.localComments = local.localComments.filter(c => c.id !== commentId);
        saveLocalData(local);
        return { message: "Eliminado" };
      }
      return contentDel<{ message: string }>(`/comments/${commentId}`);
    },

    reply: async (parentId: string, workId: string, content: string): Promise<Comment> => {
      const local = getLocalData();
      const reply: Comment = {
        id: `reply_${Date.now()}`,
        workId,
        parentId,
        userId: "local",
        content,
        createdAt: new Date().toISOString(),
        username: "Tú",
        likeCount: 0,
        likedByMe: false,
        replies: [],
        isLocal: true,
      };
      if (!local.replies[parentId]) local.replies[parentId] = [];
      local.replies[parentId].push(reply);
      saveLocalData(local);
      return reply;
    },

    like: async (commentId: string): Promise<void> => {
      const token = getToken();
      if (!token) return;
      const payload = JSON.parse(atob(token.split(".")[1]));
      const userId = payload.sub || payload.id || "";
      if (!userId) return;
      const local = getLocalData();
      if (!local.likes[commentId]) local.likes[commentId] = [];
      if (!local.likes[commentId].includes(userId)) local.likes[commentId].push(userId);
      saveLocalData(local);
    },

    unlike: async (commentId: string): Promise<void> => {
      const token = getToken();
      if (!token) return;
      const payload = JSON.parse(atob(token.split(".")[1]));
      const userId = payload.sub || payload.id || "";
      if (!userId) return;
      const local = getLocalData();
      if (local.likes[commentId]) {
        local.likes[commentId] = local.likes[commentId].filter(id => id !== userId);
        saveLocalData(local);
      }
    },
  },

  // ---------- Votes ----------
  votes: {
    getMyVote: (workId: string) =>
      contentGet<VoteResponse>(`/works/${workId}/vote`),

    vote: (workId: string, vote: 1 | -1) =>
      contentPost<VoteResponse>(`/works/${workId}/vote`, { vote }),

    removeVote: (workId: string) =>
      contentDel<VoteResponse>(`/works/${workId}/vote`),
  },

  // ---------- Bookmarks ----------
  bookmarks: {
    getAll: () =>
      contentGet<Bookmark[]>(`/bookmarks/mine`),

    get: (workId: string) =>
      contentGet<{ bookmarked: boolean }>(`/bookmarks/${workId}`),

    add: (workId: string) =>
      contentPost<{ work_id: string }>(`/bookmarks/${workId}`),

    remove: (workId: string) =>
      contentDel<{ message: string }>(`/bookmarks/${workId}`),
  },

  // ---------- Users / Authors ----------
  users: {
    getProfile: (userId: string) =>
      apiGet<AuthorProfile>(`/users/${userId}/profile`),

    getMe: () =>
      apiGet<User>("/users/me"),

    updateMe: (data: Partial<User>) =>
      apiPut<User>("/users/me", data),

    uploadAvatar: (file: File) =>
      uploadFile("/users/me/avatar", file),

    uploadBanner: (file: File) =>
      uploadFile("/users/me/banner", file),

    follow: (userId: string) =>
      apiPost<{ message: string }>(`/users/${userId}/follow`),

    unfollow: (userId: string) =>
      apiDel<{ message: string }>(`/users/${userId}/follow`),

    getFollowingAuthors: () =>
      apiGet<{ user: User; works: Work[] }[]>("/users/me/following-authors"),

    getNewAuthors: () =>
      apiGet<User[]>("/users/new-authors"),
  },

  // ---------- Author Dashboard ----------
  dashboard: {
    getStats: (authorId: string) =>
      apiGet<DashboardStats>(`/users/${authorId}/stats`),

    getEngagement: (authorId: string, period: "7d" | "30d") =>
      apiGet<DashboardStats>(`/users/${authorId}/stats`),
  },

  // ---------- Search ----------
  search: {
    search: (query: string, genre?: string) =>
      contentGet<SearchResult[]>(`/search?q=${encodeURIComponent(query)}${genre ? `&genre=${encodeURIComponent(genre)}` : ""}`),
  },

  // ---------- Upload Cover ----------
  upload: {
    cover: (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      const token = getToken();
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      return fetch(`${API_URL}/upload/cover`, { method: "POST", headers, body: formData })
        .then(r => r.ok ? r.json() : Promise.reject({ message: "Error uploading cover" }))
        .then(d => transform<UploadResponse>(d));
    },
  },
};

export default api;
