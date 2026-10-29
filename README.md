# Sagar R Ravkhande — Portfolio

[![Site quality](https://github.com/sagary2j/Sagar-Ravkhande/actions/workflows/site-quality.yml/badge.svg?branch=main)](https://github.com/sagary2j/Sagar-Ravkhande/actions/workflows/site-quality.yml)
[![Live site](https://img.shields.io/badge/live-sagary2j.github.io-38bdf8?logo=githubpages&logoColor=white)](https://sagary2j.github.io/Sagar-Ravkhande/)

Personal portfolio of a Senior Cloud & DevOps Engineer, built as a static site and hosted on GitHub Pages.

**Live:** https://sagary2j.github.io/Sagar-Ravkhande/

## Features

- **Interactive terminal** in the hero — try `help`, `skills`, `kubectl get pods -n career`, `terraform plan`, `grep terraform` or `sudo hire-me` (Tab completion and ↑/↓ history included).
- **Command palette** — press `Ctrl/⌘ + K` or `/` to jump to sections, download the CV, copy the email or switch theme.
- **Skills linked to experience** — click a skill to highlight the roles where it was used.
- **Live data with static fallbacks** — articles from the DEV.to API, star counts and activity for featured repos from the GitHub API, and the last deployed commit in the footer. Responses are cached in `sessionStorage` for 30 minutes.
- **Dark and light themes** that follow the system preference and remember the visitor's choice.
- Accessible and print-friendly: skip link, labelled controls, `prefers-reduced-motion` support, and a clean one-column print layout.

## Tech stack

Plain HTML, CSS and JavaScript — no build step.

| Layer | Used |
| --- | --- |
| Base theme | [Start Bootstrap Resume](https://startbootstrap.com/theme/resume) (Bootstrap 5.1) |
| Styling | `css/theme.css` with CSS custom properties for theming |
| Icons & fonts | Font Awesome 6, Inter, JetBrains Mono |
| Data | DEV.to API, GitHub REST API (unauthenticated, read-only) |
| Hosting | GitHub Pages from the `main` branch |
| CI | GitHub Actions: lychee link check + Lighthouse CI |

## Repository layout

```text
.
├── index.html                    # All page content
├── css/
│   ├── styles.css                # Start Bootstrap Resume base theme (unmodified)
│   └── theme.css                 # Portfolio design, dark/light themes
├── js/scripts.js                 # Terminal, palette, filters, live data, animations
├── assets/img/                   # Profile photos and favicon
├── Sagar_Ravkhande_Resume_2026.pdf
└── .github/
    ├── workflows/site-quality.yml
    ├── lychee.toml               # Link-checker settings
    └── lighthouse/lighthouserc.json
```

## Run locally

Any static file server works. The page must be served over HTTP (not opened as a file) for the live API calls to behave as they do in production.

```bash
git clone https://github.com/sagary2j/Sagar-Ravkhande.git
cd Sagar-Ravkhande
python3 -m http.server 8000
# open http://localhost:8000
```

## Updating content

Everything lives in `index.html`; the JavaScript reads from the page, so the terminal and counters update automatically.

| To change | Edit |
| --- | --- |
| A role | The `.timeline-item` in `#experience`. Set `data-start` / `data-end` as `YYYY-MM` (or `present`); durations and total years are calculated from these. |
| Skills | The `.skill-tag` spans in `#skills`. A skill becomes clickable automatically when it appears in an experience bullet. |
| Certifications | Add a `.cert-card` with `data-provider` (`aws`, `microsoft`, `google`, `gitlab`, `cncf`, `akamai`). Filter chips and counts are generated from these. |
| Featured projects | Add a `.project-card` with `data-repo="<repo-name>"`; stars and activity are filled in from GitHub. |
| Blogs | Nothing to do — published DEV.to articles load automatically. The cards in the HTML are only the offline fallback. |
| Résumé | Replace the PDF and update the `href`s and `RESUME_PDF` in `js/scripts.js` if the file name changes. |

After changing `css/theme.css` or `js/scripts.js`, bump the `?v=` query string on its `<link>` / `<script>` tag in `index.html` so visitors don't get a cached copy.

## CI and deployment

`.github/workflows/site-quality.yml` runs on every push and pull request, weekly on Mondays, and on demand:

- **Broken links** — [lychee](https://github.com/lycheeverse/lychee) checks every link in `index.html`; the job fails on any broken link. Sites that block bots (LinkedIn, X) are excluded in `.github/lychee.toml`.
- **Lighthouse** — three runs with [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci). Accessibility or SEO below 90 fails the job; performance below 80 and best practices below 90 only warn. Reports are attached to the run and linked publicly.

Pushing to `main` deploys the site through GitHub Pages (Settings → Pages → *Deploy from a branch* → `main` / root). If the publishing branch ever changes, update `SITE_BRANCH` in `js/scripts.js` so the footer shows the right commit.

## Credits

Based on [Start Bootstrap — Resume](https://github.com/StartBootstrap/startbootstrap-resume), released under the [MIT License](https://github.com/StartBootstrap/startbootstrap-resume/blob/master/LICENSE).
