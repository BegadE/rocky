(() => {
  const root = document.documentElement;
  const themeButton = document.querySelector('.theme-toggle');
  const navButton = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');

  const preferredTheme = () =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

  const currentTheme = () => {
    const stored = localStorage.getItem('theme');
    return stored === 'light' || stored === 'dark' ? stored : preferredTheme();
  };

  const updateThemeLabel = () => {
    if (themeButton) themeButton.setAttribute('aria-label', `Switch to ${currentTheme() === 'dark' ? 'light' : 'dark'} theme`);
  };

  themeButton?.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    localStorage.setItem('theme', next);
    updateThemeLabel();
  });

  navButton?.addEventListener('click', () => {
    const open = navButton.getAttribute('aria-expanded') === 'true';
    navButton.setAttribute('aria-expanded', String(!open));
    nav?.classList.toggle('is-open', !open);
  });

  updateThemeLabel();
})();

