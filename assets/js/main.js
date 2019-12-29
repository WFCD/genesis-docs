'use strict';

/* globals $,  Cookies, location, document */

const $body = $(document.body);
$body.scrollspy({
  target: '#affix-nav',
  offset: 205,
});

// eslint-disable-next-line no-unused-vars
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

/* Based on the solution here: https://css-tricks.com/snippets/jquery/smooth-scrolling/  */
// Select all links with hashes
$('a[href*="#"]')
  // Remove links that don't actually link to anything
  .not('[href="#"]')
  .not('[href="#0"]')
  .not('[href="#license"]') // ignore modal links
  .not('[href="#credits"]')
  .click((event) => {
    // On-page links
    if (
      location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '')
      && location.hostname === this.hostname
    ) {
      // Figure out element to scroll to
      let target = $(this.hash);
      target = target.length ? target : $(`[name=${this.hash.slice(1)}]`);
      // Does a scroll target exist?
      if (target.length) {
        // Only prevent default if animation is actually gonna happen
        event.preventDefault();
        $('html, body').animate({
          scrollTop: target.offset().top,
        }, 1000, () => {
          // Callback after animation
          // Must change focus!
          const $target = $(target);
          $target.focus();
          if ($target.is(':focus')) { // Checking if the target was focused
            return false;
          }
          $target.focus(); // Set focus again
          return true;
        });
      }
    }
  });
