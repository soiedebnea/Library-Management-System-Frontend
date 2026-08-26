export function showToast(message, kind = "info") {
    const el = document.createElement("div");
    el.className = `toast ${kind}`;
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3200);
}
export function formatDate(iso) {
    if (!iso)
        return "—";
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}
export function daysBetween(a, b) {
    const ms = 1000 * 60 * 60 * 24;
    return Math.floor((b.getTime() - a.getTime()) / ms);
}
export function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}
export async function confirmAction(message) {
    return window.confirm(message);
}
//# sourceMappingURL=ui.js.map