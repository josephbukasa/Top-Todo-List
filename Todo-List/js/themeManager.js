export const themeManager = {
  init() {
    const saved = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (systemDark ? 'dark' : 'light');
    this.setTheme(theme);
  },

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    this.updateToggleButton(theme);
  },

  toggle() {
    const current = document.documentElement.getAttribute('data-theme');
    this.setTheme(current === 'dark' ? 'light' : 'dark');
  },

  updateToggleButton(theme) {
    const btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.textContent = theme === 'dark' ? '☀️ Mode clair' : '🌓 Mode sombre';
    }
  }
};