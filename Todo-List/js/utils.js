export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function isOverdue(deadline) {
  if (!deadline) return false;
  const now = new Date();
  const deadlineDate = new Date(deadline);
  return deadlineDate < now && !isNaN(deadlineDate);
}

export function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function highlightText(text, query) {
  if (!query.trim()) return text;
  const escapedQuery = escapeRegExp(query.trim());
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  return text.replace(regex, '<mark class="search-highlight">$1</mark>');
}

export function saveToStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function loadFromStorage(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}