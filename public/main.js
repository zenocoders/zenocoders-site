// zenocoders.com — seul script du site, sans dépendance ni appel externe.
(function () {
  'use strict';

  // Adresse e-mail reconstruite au chargement : elle n'apparaît pas en clair
  // dans le HTML, ce qui limite la collecte par les robots de spam.
  document.querySelectorAll('a.js-mail').forEach(function (link) {
    var address = link.dataset.u + '@' + link.dataset.d;
    var href = 'mailto:' + address;
    if (link.dataset.s) {
      href += '?subject=' + encodeURIComponent(link.dataset.s);
    }
    link.setAttribute('href', href);
    if (link.dataset.text) {
      link.textContent = address;
    }
  });

  // Vidéo d'ouverture : en pause si l'utilisateur limite les animations.
  var video = document.querySelector('video');
  if (video && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    video.removeAttribute('autoplay');
    video.pause();
  }
})();
