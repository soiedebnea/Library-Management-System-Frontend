import { api } from "./api.js";
import { showToast, confirmAction, escapeHtml, formatDate } from "./ui.js";
import { Member } from "./types.js";

const form = document.getElementById("member-form") as HTMLFormElement;
const searchInput = document.getElementById("search-input") as HTMLInputElement;
const tbody = document.getElementById("members-body")!;
const formTitle = document.getElementById("form-title")!;
const submitBtn = document.getElementById("submit-btn") as HTMLButtonElement;
const cancelEditBtn = document.getElementById("cancel-edit-btn") as HTMLButtonElement;

let editingId: string | null = null;

function statusBadge(m: Member): string {
  return m.status === "active"
    ? `<span class="badge badge-available">active</span>`
    : `<span class="badge badge-returned">inactive</span>`;
}

function renderRow(m: Member): string {
  return `
    <tr data-id="${m._id}">
      <td>${escapeHtml(m.name)}</td>
      <td>${escapeHtml(m.email)}</td>
      <td class="mono">${escapeHtml(m.phone || "—")}</td>
      <td class="mono">${formatDate(m.membershipDate)}</td>
      <td>${statusBadge(m)}</td>
      <td>
        <button class="btn btn-ghost btn-sm" data-action="edit">Edit</button>
        <button class="btn btn-danger btn-sm" data-action="delete">Delete</button>
      </td>
    </tr>`;
}

async function loadMembers() {
  const search = searchInput.value.trim();
  try {
    const members = await api.getMembers(search ? { search } : {});
    if (members.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="glyph">Ω</div>No members match your search.</div></td></tr>`;
      return;
    }
    tbody.innerHTML = members.map(renderRow).join("");
  } catch (err) {
    showToast((err as Error).message, "error");
  }
}

function resetForm() {
  form.reset();
  editingId = null;
  formTitle.textContent = "Register a New Member";
  submitBtn.textContent = "Register Member";
  cancelEditBtn.hidden = true;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const payload = {
    name: String(formData.get("name") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    address: String(formData.get("address") || "").trim(),
  };

  try {
    if (editingId) {
      await api.updateMember(editingId, payload);
      showToast("Member details updated", "success");
    } else {
      await api.createMember(payload);
      showToast("Member registered", "success");
    }
    resetForm();
    loadMembers();
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
    const ok = await confirmAction("Remove this member? They must have no active loans.");
    if (!ok) return;
    try {
      await api.deleteMember(id);
      showToast("Member removed", "success");
      loadMembers();
    } catch (err) {
      showToast((err as Error).message, "error");
    }
  }

  if (action === "edit") {
    try {
      const members = await api.getMembers();
      const member = members.find((m) => m._id === id);
      if (!member) return;
      (form.elements.namedItem("name") as HTMLInputElement).value = member.name;
      (form.elements.namedItem("email") as HTMLInputElement).value = member.email;
      (form.elements.namedItem("phone") as HTMLInputElement).value = member.phone || "";
      (form.elements.namedItem("address") as HTMLInputElement).value = member.address || "";
      editingId = member._id;
      formTitle.textContent = `Editing ${member.name}`;
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
  debounceTimer = window.setTimeout(loadMembers, 300);
});

loadMembers();