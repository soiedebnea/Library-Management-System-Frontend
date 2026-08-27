import { ApiResponse, Book, Member, BorrowRecord, DashboardStats } from "./types.js";

// Change this if your backend runs on a different host/port
export const API_BASE = "http://localhost:5000/api";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const body: ApiResponse<T> = await res.json();

  if (!res.ok || !body.success) {
    throw new Error(body.message || `Request failed with status ${res.status}`);
  }
  return body.data;
}

export const api = {
  // ---- Books ----
  getBooks: (params: { search?: string; category?: string } = {}) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return request<Book[]>(`/books${qs ? `?${qs}` : ""}`);
  },
  createBook: (payload: Partial<Book>) =>
    request<Book>("/books", { method: "POST", body: JSON.stringify(payload) }),
  updateBook: (id: string, payload: Partial<Book>) =>
    request<Book>(`/books/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteBook: (id: string) => request<null>(`/books/${id}`, { method: "DELETE" }),

  // ---- Members ----
  getMembers: (params: { search?: string } = {}) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return request<Member[]>(`/members${qs ? `?${qs}` : ""}`);
  },
  createMember: (payload: Partial<Member>) =>
    request<Member>("/members", { method: "POST", body: JSON.stringify(payload) }),
  updateMember: (id: string, payload: Partial<Member>) =>
    request<Member>(`/members/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteMember: (id: string) => request<null>(`/members/${id}`, { method: "DELETE" }),
  getMemberHistory: (id: string) => request<BorrowRecord[]>(`/members/${id}/history`),

  // ---- Borrowing ----
  getBorrowRecords: (params: { status?: string; memberId?: string; bookId?: string } = {}) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return request<BorrowRecord[]>(`/borrow${qs ? `?${qs}` : ""}`);
  },
  borrowBook: (bookId: string, memberId: string) =>
    request<BorrowRecord>("/borrow", { method: "POST", body: JSON.stringify({ bookId, memberId }) }),
  returnBook: (recordId: string) =>
    request<BorrowRecord>(`/borrow/${recordId}/return`, { method: "PUT" }),
  payFine: (recordId: string) =>
    request<BorrowRecord>(`/borrow/${recordId}/pay-fine`, { method: "PUT" }),
  getStats: () => request<DashboardStats>("/borrow/stats"),
};