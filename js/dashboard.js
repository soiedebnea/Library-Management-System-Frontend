import { api } from "./api.js";
import { showToast, formatDate } from "./ui.js";
async function loadStats() {
    try {
        const stats = await api.getStats();
        const grid = document.getElementById("stat-grid");
        grid.innerHTML = `
      <div class="stat-card">
        <div class="label">Total Books</div>
        <div class="value">${stats.totalBooks}</div>
      </div>
      <div class="stat-card">
        <div class="label">Registered Members</div>
        <div class="value">${stats.totalMembers}</div>
      </div>
      <div class="stat-card">
        <div class="label">Copies On Loan</div>
        <div class="value">${stats.copiesOnLoan}</div>
      </div>
      <div class="stat-card accent-red">
        <div class="label">Overdue Loans</div>
        <div class="value">${stats.overdueCount}</div>
      </div>
      <div class="stat-card accent-red">
        <div class="label">Outstanding Fines</div>
        <div class="value">${stats.totalOutstandingFines}</div>
      </div>
    `;
    }
    catch (err) {
        showToast(err.message, "error");
    }
}
async function loadOverdue() {
    const tbody = document.getElementById("overdue-body");
    try {
        const records = await api.getBorrowRecords({ status: "overdue" });
        if (records.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="glyph">§</div>No overdue loans right now.</div></td></tr>`;
            return;
        }
        tbody.innerHTML = records
            .map((r) => {
            const book = r.book;
            const member = r.member;
            return `
        <tr>
          <td>${book?.title ?? "—"}</td>
          <td>${member?.name ?? "—"}</td>
          <td class="mono">${formatDate(r.dueDate)}</td>
          <td><span class="badge badge-overdue">Overdue</span></td>
          <td class="fine-amount">${r.fineAmount}</td>
        </tr>`;
        })
            .join("");
    }
    catch (err) {
        tbody.innerHTML = `<tr><td colspan="5">Could not load overdue loans.</td></tr>`;
        showToast(err.message, "error");
    }
}
loadStats();
loadOverdue();
//# sourceMappingURL=dashboard.js.map