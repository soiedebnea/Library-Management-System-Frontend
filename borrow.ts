import { api } from "./api.js";
import { showToast, confirmAction, formatDate, escapeHtml } from "./ui.js";
import { Book, Member, BorrowRecord } from "./types.js";

const issueForm = document.getElementById("issue-form") as HTMLFormElement;
const bookSelect = document.getElementById("book-select") as HTMLSelectElement;
const memberSelect = document.getElementById("member-select") as HTMLSelectElement;
const statusFilter = document.getElementById("status-filter") as HTMLSelectElement;
const tbody = document.getElementById("borrow-body")!;

async function populateSelects() {
  try {
    const [books, members] = await Promise.all([api.getBooks(), api.getMembers()]);

    bookSelect.innerHTML = books
      .map(
        (b: Book) =>
          `<option value="${b._id}" ${b.availableCopies < 1 ? "disabled" : ""}>${escapeHtml(
            b.title
          )} — ${b.availableCopies} left</option>`
      )
      .join("");

    memberSelect.innerHTML = members
      .map(
        (m: Member) =>
          `<option value="${m._id}" ${m.status !== "active" ? "disabled" : ""}>${escapeHtml(
            m.name
          )}${m.status !== "active" ? " (inactive)" : ""}</option>`
      )
      .join("");
  } catch (err) {
    showToast((err as Error).message, "error");
  }
}

function dueStampHtml(record: BorrowRecord): string {
  const due = new Date(record.dueDate);
  const label = record.status === "returned" ? "returned" : record.status === "overdue" ? "overdue since" : "due";
  const cls = record.status === "returned" ? "is-returned" : record.status === "overdue" ? "is-overdue" : "";
  const date = record.status === "returned" && record.returnDate ? record.returnDate : record.dueDate;
  return `
    <span class="due-stamp ${cls}">
      <span class="l">${label}</span>
      <span class="d">${formatDate(date)}</span>
    </span>`;
}

function statusBadgeHtml(status: string): string {
  const map: Record<string, string> = {
    borrowed: `<span class="badge badge-borrowed">Borrowed</span>`,
    overdue: `<span class="badge badge-overdue">Overdue</span>`,
    returned: `<span class="badge badge-returned">Returned</span>`,
  };
  return map[status] || status;
}

function renderRow(r: BorrowRecord): string {
  const book = r.book as Book;
  const member = r.member as Member;
  const fineClass = r.fineAmount > 0 ? "fine-amount" : "fine-amount zero";
  const actions: string[] = [];

  if (r.status !== "returned") {
    actions.push(`<button class="btn btn-brass btn-sm" data-action="return">Return</button>`);
  }
  if (r.fineAmount > 0 && !r.finePaid) {
    actions.push(`<button class="btn btn-ghost btn-sm" data-action="pay-fine">Mark Fine Paid</button>`);
  }
  if (r.fineAmount > 0 && r.finePaid) {
    actions.push(`<span class="badge badge-available">fine paid</span>`);
  }

  return `
    <tr data-id="${r._id}">
      <td>${escapeHtml(book?.title ?? "—")}</td>
      <td>${escapeHtml(member?.name ?? "—")}</td>
      <td class="mono">${formatDate(r.borrowDate)}</td>
      <td>${dueStampHtml(r)}</td>
      <td>${statusBadgeHtml(r.status)}</td>
      <td class="${fineClass}">${r.fineAmount > 0 ? r.fineAmount : "—"}</td>
      <td>${actions.join(" ")}</td>
    </tr>`;
}

async function loadRecords() {
  try {
    const status = statusFilter.value;
    const records = await api.getBorrowRecords(status ? { status } : {});
    if (records.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="glyph">Ω</div>No borrowing records here.</div></td></tr>`;
      return;
    }
    tbody.innerHTML = records.map(renderRow).join("");
  } catch (err) {
    showToast((err as Error).message, "error");
  }
}

issueForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const bookId = bookSelect.value;
  const memberId = memberSelect.value;
  if (!bookId || !memberId) {
    showToast("Choose a book and a member first", "error");
    return;
  }
  try {
    await api.borrowBook(bookId, memberId);
    showToast("Book issued successfully", "success");
    await populateSelects();
    await loadRecords();
  } catch (err) {
    showToast((err as Error).message, "error");
  }
});

tbody.addEventListener("click", async (e) => {
  const target = e.target as HTMLElement;
  const action = target.dataset.action;
  const row = target.closest("tr");
  const id = row?.dataset.id;
  if (!action || !id) return;

  if (action === "return") {
    const ok = await confirmAction("Confirm this book has been returned?");
    if (!ok) return;
    try {
      const updated = await api.returnBook(id);
      showToast(
        updated.fineAmount > 0 ? `Returned. Fine due: ${updated.fineAmount}` : "Returned on time — no fine",
        updated.fineAmount > 0 ? "error" : "success"
      );
      await populateSelects();
      await loadRecords();
    } catch (err) {
      showToast((err as Error).message, "error");
    }
  }

  if (action === "pay-fine") {
    try {
      await api.payFine(id);
      showToast("Fine marked as paid", "success");
      await loadRecords();
    } catch (err) {
      showToast((err as Error).message, "error");
    }
  }
});

statusFilter.addEventListener("change", loadRecords);

populateSelects();
loadRecords();