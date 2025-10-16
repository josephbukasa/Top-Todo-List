const STORAGE_KEY = 'notes_html';

export const notesManager = {
  get data() {
    return localStorage.getItem(STORAGE_KEY) || '';
  },

  set data(html) {
    localStorage.setItem(STORAGE_KEY, html);
  }
};