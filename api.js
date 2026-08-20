// Change this if your backend runs on a different host/port
export const API_BASE = "http://localhost:5000/api";
async function request(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...options,
    });
    const body = await res.json();
    if (!res.ok || !body.success) {
        throw new Error(body.message || `Request failed with status ${res.status}`);
    }
    return body.data;
}
export const api = {
    // ---- Books ----
    getBooks: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return request(`/books${qs ? `?${qs}` : ""}`);
    },
    createBook: (payload) => request("/books", { method: "POST", body: JSON.stringify(payload) }),
    updateBook: (id, payload) => request(`/books/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
    deleteBook: (id) => request(`/books/${id}`, { method: "DELETE" }),
    // ---- Members ----
    getMembers: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return request(`/members${qs ? `?${qs}` : ""}`);
    },
    createMember: (payload) => request("/members", { method: "POST", body: JSON.stringify(payload) }),
    updateMember: (id, payload) => request(`/members/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
    deleteMember: (id) => request(`/members/${id}`, { method: "DELETE" }),
    getMemberHistory: (id) => request(`/members/${id}/history`),
    // ---- Borrowing ----
    getBorrowRecords: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return request(`/borrow${qs ? `?${qs}` : ""}`);
    },
    borrowBook: (bookId, memberId) => request("/borrow", { method: "POST", body: JSON.stringify({ bookId, memberId }) }),
    returnBook: (recordId) => request(`/borrow/${recordId}/return`, { method: "PUT" }),
    payFine: (recordId) => request(`/borrow/${recordId}/pay-fine`, { method: "PUT" }),
    getStats: () => request("/borrow/stats"),
};
//# sourceMappingURL=api.js.map