'use strict';

/* globals $, document, window */

const $body = $(document.body);
$body.scrollspy({
  target: '#affix-nav',
  offset: 205,
});

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
    if (this.pathname &&
      window.location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '')
      &&
      window.location.hostname === this.hostname
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


const setChannel = (channel) => { // eslint-disable-line no-unused-vars
  document.getElementById('prefixValue').value = channel.prefix;
  document.getElementById('respondToSettings').checked = channel.respondToSettings;
};
