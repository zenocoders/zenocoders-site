# zenocoders.com — runbook de mise en production

Site vitrine statique : HTML, CSS, un seul script local (`main.js`), polices et médias auto-hébergés.
Aucun formulaire, aucun traitement serveur, aucune base de données, aucun cookie.

## Architecture

```
Internet ──443──> Caddy (projet Docker « proxy », HTTPS automatique)
                    └── reverse_proxy ──> zenocoders-site:8080 (projet « site », réseau « web »)
                                           nginx non-root, lecture seule, GET/HEAD uniquement
```

| Élément | Où |
|---|---|
| Contenu du site | `public/` (ce dépôt, branche `main`) |
| Config nginx + en-têtes de sécurité | `nginx/default.conf`, `nginx/security-headers.inc` |
| Projet Docker | `docker-compose.yml` → projet « site » dans le Docker Manager Hostinger |
| Routage du domaine | `/docker/proxy/Caddyfile` sur le VPS |

## Mettre en production une modification

1. Modifier les fichiers dans `public/` et pousser sur `main` (via une PR si besoin de relecture).
2. Redémarrer le projet « site » : hPanel → VPS → Docker Manager → site → Redémarrer
   (ou API Hostinger `vps_docker_restart`, projet `site`).
3. `site-fetch` clone la branche `main`, copie `public/` et la config nginx, puis nginx redémarre.
   Les logs du projet affichent `Version en ligne : <commit>`.
4. Tests de fumée :
   - `https://zenocoders.com/` répond 200 et affiche la page ;
   - `curl -sI https://zenocoders.com/ | grep -i content-security-policy` renvoie l'en-tête ;
   - `curl -s -o /dev/null -w "%{http_code}" -X POST https://zenocoders.com/` renvoie 405 ;
   - la vidéo d'ouverture se lance, le bouton e-mail ouvre la messagerie.

## Retour arrière

`git revert <commit>` sur `main`, pousser, puis redémarrer le projet « site » (étape 2).
Le site redevient identique à la version précédente en moins d'une minute.

## Sécurité — ce qui est en place

- **Aucun formulaire** : pas d'injection, pas de spam via formulaire, pas de relais de mail possible.
  Le contact passe par un lien `mailto:` : c'est la messagerie du visiteur qui envoie, jamais le serveur.
  L'adresse n'apparaît ni dans le HTML ni à l'écran ; elle est assemblée au clic seulement
  (les robots qui collectent des adresses ne la trouvent pas). Les mentions légales l'affichent
  sous la forme « romain [at] zenocoders.com », exigée par la loi et non exploitable telle quelle.
- **Méthodes HTTP** : seuls GET et HEAD sont acceptés (405 sinon) ; corps de requête limité à 1 Ko.
- **En-têtes** : CSP stricte (scripts du site uniquement, aucune ressource externe, `form-action 'none'`,
  `frame-ancestors 'none'`), HSTS, `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`,
  `Permissions-Policy`, COOP/CORP.
- **Conteneur** : image nginx non-root, système de fichiers en lecture seule, toutes les capacités Linux
  retirées, `no-new-privileges`, 128 Mo de mémoire max, aucun port publié.
- **Fichiers cachés** (`.git`, `.env`…) : jamais servis.
- **Aucun tiers** : polices et médias servis depuis le VPS (pas de Google Fonts, pas de CDN, pas d'analytics).

## Si un formulaire de contact est ajouté un jour

Ne pas l'héberger sur ce conteneur. Prévoir : validation et échappement côté serveur, en-têtes de mail
non modifiables par l'utilisateur (destinataire fixe, pas de `Cc`/`Bcc` injectables), limitation de débit,
champ piège anti-robot ou captcha respectueux de la vie privée, et mise à jour de la CSP (`form-action`).
