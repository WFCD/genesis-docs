/* globals $,  Cookies */

const setTheme = (themeName, superTheme, reset) => {
  const theme = $('#mode');
  const themecustom = $('#mode-custom');
  if (!reset) {
    if (theme.hasClass(themeName)) {
      setTheme(false, false, true);
    } else {
      theme.attr('href', `/css/bootstrap-${superTheme}.min.css`);
      themecustom.attr('href', `/css/main.${themeName}.css`);
      theme.removeClass();
      theme.addClass(themeName);
      Cookies.set('mode', themeName);
    }
  } else {
    theme.attr('href', '/css/bootstrap-default.min.css');
    themecustom.attr('href', '/css/main.css');
    theme.removeClass();
    Cookies.set('mode', 'day');
  }
};