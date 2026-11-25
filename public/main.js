// zenocoders.com — seul script du site, sans dépendance ni appel externe.
(function () {
  'use strict';

  // Liens e-mail : l'adresse n'existe ni dans le HTML ni dans la page affichée.
  // Elle est assemblée seulement au clic, puis transmise à la messagerie du
  // visiteur : les robots qui lisent les pages ne la trouvent pas.
  document.querySelectorAll('a.js-mail').forEach(function (link) {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      var href = 'mailto:' + link.dataset.u + '@' + link.dataset.d;
      if (link.dataset.s) {
        href += '?subject=' + encodeURIComponent(link.dataset.s);
      }
      window.location.href = href;
    });
  });

  // Vidéo d'ouverture. Safari ignore parfois l'attribut autoplay : on lance la
  // lecture explicitement (vidéo muette, donc autorisée), puis on réessaie au
  // premier geste de l'utilisateur si le navigateur l'a quand même bloquée
  // (mode économie d'énergie sur iPhone, par exemple).
  var video = document.querySelector('video');
  if (!video) {
    return;
  }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    video.removeAttribute('autoplay');
    video.pause();
    return;
  }
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;

  function tryPlay() {
    var attempt = video.play();
    return attempt && attempt.catch ? attempt : Promise.resolve();
  }

  function retryOnGesture() {
    var events = ['touchstart', 'pointerdown', 'scroll', 'keydown'];
    function handler() {
      events.forEach(function (name) {
        window.removeEventListener(name, handler, true);
      });
      tryPlay().catch(function () {});
    }
    events.forEach(function (name) {
      window.addEventListener(name, handler, { capture: true, passive: true, once: true });
    });
  }

  tryPlay().catch(retryOnGesture);
})();
