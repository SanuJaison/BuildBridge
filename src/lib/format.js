const currencyFormatters = new Map();

export function money(amount, currency = "USD") {
  if (amount === null || amount === undefined || amount === "") return "—";
  const numeric = Number(amount);
  if (!Number.isFinite(numeric)) return "—";
  const key = currency || "USD";
  if (!currencyFormatters.has(key)) {
    currencyFormatters.set(
      key,
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: key,
        maximumFractionDigits: 0,
      })
    );
  }
  return currencyFormatters.get(key).format(numeric);
}

export function compactNumber(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "0";
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(numeric);
}

export function formatDate(date, options = {}) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  }).format(new Date(date));
}

export function formatDateTime(date) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export function timeAgo(date) {
  if (!date) return "";
  const seconds = Math.round((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 45) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.round(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return formatDate(date);
}

export function initials(name = "BuildBridge") {
  return String(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function humanize(value = "") {
  return String(value)
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function truncate(value = "", length = 140) {
  const text = String(value);
  if (text.length <= length) return text;
  return `${text.slice(0, length).trimEnd()}…`;
}

export function fileSize(bytes) {
  if (!bytes) return "0 KB";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${(bytes / 1024 ** exponent).toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

export const PROVIDER_TYPE_LABELS = {
  freelancer: "Freelancer",
  developer: "Developer",
  company: "Company",
  agency: "Agency",
  studio: "Studio",
};

export const PROVIDER_TYPES = ["freelancer", "developer", "company", "agency", "studio"];

export const AVAILABILITY = {
  available: { label: "Available now", tone: "mint" },
  limited: { label: "Limited availability", tone: "amber" },
  unavailable: { label: "Unavailable", tone: "slate" },
};

export const INQUIRY_STATUS = {
  new: { label: "New", tone: "blue" },
  in_discussion: { label: "In discussion", tone: "amber" },
  proposal_sent: { label: "Proposal sent", tone: "violet" },
  accepted: { label: "Accepted", tone: "mint" },
  completed: { label: "Completed", tone: "mint" },
  declined: { label: "Declined", tone: "red" },
  cancelled: { label: "Cancelled", tone: "slate" },
};

export const PROPOSAL_STATUS = {
  sent: { label: "Awaiting response", tone: "violet" },
  accepted: { label: "Accepted", tone: "mint" },
  declined: { label: "Declined", tone: "red" },
  withdrawn: { label: "Withdrawn", tone: "slate" },
};

export const REVIEW_STATUS = {
  published: { label: "Published", tone: "mint" },
  hidden: { label: "Hidden", tone: "amber" },
  removed: { label: "Removed", tone: "red" },
};

export const REPORT_STATUS = {
  open: { label: "Open", tone: "amber" },
  reviewing: { label: "Reviewing", tone: "blue" },
  resolved: { label: "Resolved", tone: "mint" },
  dismissed: { label: "Dismissed", tone: "slate" },
};

export const BUDGET_RANGES = [
  { label: "Under $2,000", min: "", max: "2000" },
  { label: "$2,000 – $5,000", min: "2000", max: "5000" },
  { label: "$5,000 – $10,000", min: "5000", max: "10000" },
  { label: "$10,000 – $25,000", min: "10000", max: "25000" },
  { label: "$25,000+", min: "25000", max: "" },
];

export const POPULAR_SEARCHES = [
  "React Native",
  "SaaS dashboard",
  "Brand identity",
  "Game development",
  "SEO",
  "AI integration",
];
