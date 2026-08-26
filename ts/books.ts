import { api } from "./api.js";
import { showToast, confirmAction, escapeHtml } from "./ui.js";
import { Book } from "./types.js";

const form = document.getElementById("book-form") as HTMLFormElement;
const searchInput = document.getElementById("search-input") as HTMLInputElement;
const tbody = document.getElementById("books-body")!;
const formTitle = document.getElementById("form-title")!;
const submitBtn = document.getElementById("submit-btn") as HTMLButtonElement;
const cancelEditBtn = document.getElementById("cancel-edit-btn") as HTMLButtonElement;

let editingId: string | null = null;

function availabilityBadge(book: Book): string {
  return book.availableCopies > 0
    ? `<span class="badge badge-available">${book.availableCopies} available</span>`
    : `<span class="badge badge-overdue">none available</span>`;
}

function renderRow(book: Book): string {
  return `
    <tr data-id="${book._id}">
      <td>${escapeHtml(book.title)}</td>
      <td>${escapeHtml(book.author)}</td>
      <td class="mono">${escapeHtml(book.isbn)}</td>
      <td>${escapeHtml(book.category)}</td>
      <td class="mono">${book.availableCopies} / ${book.totalCopies}</td>
      <td>${availabilityBadge(book)}</td>
      <td>
        <button class="btn btn-ghost btn-sm" data-action="edit">Edit</button>
        <button class="btn btn-danger btn-sm" data-action="delete">Delete</button>
      </td>
    </tr>`;
}

async function loadBooks() {
  const search = searchInput.value.trim();
  try {
    const books = await api.getBooks(search ? { search } : {});
    if (books.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="glyph">Ω</div>No books match your search.</div></td></tr>`;
      return;
    }
    tbody.innerHTML = books.map(renderRow).join("");
  } catch (err) {
    showToast((err as Error).message, "error");
  }
}

function resetForm() {
  form.reset();
  editingId = null;
  formTitle.textContent = "Add a New Book";
  submitBtn.textContent = "Add Book";
  cancelEditBtn.hidden = true;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const payload = {
    title: String(formData.get("title") || "").trim(),
    author: String(formData.get("author") || "").trim(),
    isbn: String(formData.get("isbn") || "").trim(),
    category: String(formData.get("category") || "").trim(),
    publisher: String(formData.get("publisher") || "").trim(),
    totalCopies: Number(formData.get("totalCopies") || 1),
  };

  try {
    if (editingId) {
      await api.updateBook(editingId, payload);
      showToast("Book updated successfully", "success");
    } else {
      await api.createBook(payload);
      showToast("Book added to the catalog", "success");
    }
    resetForm();
    loadBooks();
  } catch (err) {
    showToast((err as Error).message, "error");
  }
});

cancelEditBtn.addEventListener("click", resetForm);

tbody.addEventListener("click", async (e) => {
  const target = e.target as HTMLElement;
  const action = target.dataset.action;
  const row = target.closest("tr");
  const id = row?.dataset.id;
  if (!action || !id) return;

  if (action === "delete") {
    const ok = await confirmAction("Remove this book from the catalog?");
    if (!ok) return;
    try {
      await api.deleteBook(id);
      showToast("Book removed", "success");
      loadBooks();
    } catch (err) {
      showToast((err as Error).message, "error");
    }
  }

  if (action === "edit") {
    try {
      const books = await api.getBooks();
      const book = books.find((b) => b._id === id);
      if (!book) return;
      (form.elements.namedItem("title") as HTMLInputElement).value = book.title;
      (form.elements.namedItem("author") as HTMLInputElement).value = book.author;
      (form.elements.namedItem("isbn") as HTMLInputElement).value = book.isbn;
      (form.elements.namedItem("category") as HTMLInputElement).value = book.category;
      (form.elements.namedItem("publisher") as HTMLInputElement).value = book.publisher || "";
      (form.elements.namedItem("totalCopies") as HTMLInputElement).value = String(book.totalCopies);
      editingId = book._id;
      formTitle.textContent = `Editing "${book.title}"`;
      submitBtn.textContent = "Save Changes";
      cancelEditBtn.hidden = false;
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (err) {
      showToast((err as Error).message, "error");
    }
  }
});

let debounceTimer: number | undefined;
searchInput.addEventListener("input", () => {
  window.clearTimeout(debounceTimer);
  debounceTimer = window.setTimeout(loadBooks, 300);
});

loadBooks();