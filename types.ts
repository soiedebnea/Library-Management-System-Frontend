export interface Book {
  _id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  publisher?: string;
  totalCopies: number;
  availableCopies: number;
  createdAt: string;
}

export type MemberStatus = "active" | "inactive";

export interface Member {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  membershipDate: string;
  status: MemberStatus;
}

export type BorrowStatus = "borrowed" | "returned" | "overdue";

export interface BorrowRecord {
  _id: string;
  book: Book | string;
  member: Member | string;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  fineAmount: number;
  finePaid: boolean;
  status: BorrowStatus;
}

export interface DashboardStats {
  totalBooks: number;
  totalMembers: number;
  activeLoans: number;
  overdueCount: number;
  copiesOnLoan: number;
  totalOutstandingFines: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}