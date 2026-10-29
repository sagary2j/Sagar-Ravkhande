/*!
* Based on Start Bootstrap - Resume v7.0.5 (https://startbootstrap.com/theme/resume)
* Copyright 2013-2022 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-resume/blob/master/LICENSE)
*/

window.addEventListener('DOMContentLoaded', () => {
    'use strict';

    const GITHUB_USER = 'sagary2j';
    const DEVTO_USER = 'sagary2j';
    const SITE_REPO = 'Sagar-Ravkhande';
    // GitHub Pages publishes this branch; keep in sync with the Pages settings.
    const SITE_BRANCH = 'main';
    const RESUME_PDF = 'Sagar_Ravkhande_Resume_2026.pdf';
    const CACHE_TTL_MS = 30 * 60 * 1000;

    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';
    const email = ($('#contactEmail')?.getAttribute('href') || '').replace(/^mailto:/, '');

    const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[char]));

    const safeUrl = url => (/^https:\/\//i.test(url || '') ? url : '#');

    const isTyping = el => Boolean(el) && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);

    const onVisible = (elements, callback, threshold = 0.15) => {
        if (!('IntersectionObserver' in window)) {
            elements.forEach(callback);
            return;
        }
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    callback(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold });
        elements.forEach(el => observer.observe(el));
    };

    const timeAgo = iso => {
        const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
        const seconds = (new Date(iso).getTime() - Date.now()) / 1000;
        const units = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]];
        for (const [unit, size] of units) {
            if (Math.abs(seconds) >= size || unit === 'minute') {
                return rtf.format(Math.round(seconds / size), unit);
            }
        }
        return '';
    };

    const fetchJson = async (url, cacheKey, transform = data => data) => {
        try {
            const cached = JSON.parse(sessionStorage.getItem(cacheKey) || 'null');
            if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
                return cached.data;
            }
        } catch (error) { /* storage unavailable */ }

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8000);
        try {
            const response = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const data = transform(await response.json());
            try {
                sessionStorage.setItem(cacheKey, JSON.stringify({ at: Date.now(), data }));
            } catch (error) { /* storage full or disabled */ }
            return data;
        } finally {
            clearTimeout(timer);
        }
    };

    // ── Toast + clipboard ───────────────────────────────────
    let toastTimer;
    const toast = message => {
        const el = $('#toast');
        if (!el) return;
        el.textContent = message;
        el.classList.add('is-visible');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2400);
    };

    const copyEmail = async () => {
        try {
            await navigator.clipboard.writeText(email);
            toast(`Copied ${email}`);
        } catch (error) {
            window.location.href = `mailto:${email}`;
        }
    };

    $$('[data-copy-email]').forEach(button => button.addEventListener('click', copyEmail));

    // ── Theme ───────────────────────────────────────────────
    const applyTheme = theme => {
        document.documentElement.setAttribute('data-theme', theme);
        const meta = $('meta[name="theme-color"]');
        if (meta) {
            meta.setAttribute('content', theme === 'light' ? '#f6f8fb' : '#0a0e14');
        }
    };

    const toggleTheme = () => {
        const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        applyTheme(next);
        try {
            localStorage.setItem('theme', next);
        } catch (error) { /* storage disabled */ }
        return next;
    };

    applyTheme(document.documentElement.getAttribute('data-theme') || 'dark');
    $$('[data-theme-toggle]').forEach(button => button.addEventListener('click', toggleTheme));

    // ── Navigation ──────────────────────────────────────────
    if ($('#sideNav') && window.bootstrap) {
        new bootstrap.ScrollSpy(document.body, { target: '#sideNav', offset: 74 });
    }

    const navbarToggler = $('.navbar-toggler');
    $$('#navbarResponsive .nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (navbarToggler && window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

    const goTo = id => {
        const target = document.getElementById(id);
        if (!target) return false;
        target.scrollIntoView({ behavior: scrollBehavior });
        history.replaceState(null, '', `#${id}`);
        return true;
    };

    // ── Experience: durations + total years ─────────────────
    const toMonthIndex = value => {
        if (!value || value === 'present') {
            const now = new Date();
            return (now.getFullYear() * 12) + now.getMonth();
        }
        const [year, month] = value.split('-').map(Number);
        return (year * 12) + (month - 1);
    };

    const formatDuration = months => {
        const years = Math.floor(months / 12);
        const rest = months % 12;
        const parts = [];
        if (years) parts.push(`${years} yr${years > 1 ? 's' : ''}`);
        if (rest) parts.push(`${rest} mo${rest > 1 ? 's' : ''}`);
        return parts.join(' ') || '1 mo';
    };

    const roles = $$('.timeline-item').map(item => ({
        item,
        title: $('.tl-title', item)?.textContent.trim() || '',
        org: ($('.tl-org', item)?.textContent.trim() || '').split('·')[0].trim(),
        current: item.dataset.end === 'present',
        start: toMonthIndex(item.dataset.start),
        end: toMonthIndex(item.dataset.end),
    }));

    roles.forEach(role => {
        role.months = role.end - role.start + 1;
        const badge = $('[data-duration]', role.item);
        if (badge) badge.textContent = formatDuration(role.months);
        role.item.classList.toggle('is-current', role.current);
    });

    const yearsOfExperience = (() => {
        const intervals = roles.map(({ start, end }) => ({ start, end })).sort((a, b) => a.start - b.start);
        if (!intervals.length) return 0;
        const merged = [intervals[0]];
        intervals.slice(1).forEach(interval => {
            const last = merged[merged.length - 1];
            if (interval.start <= last.end + 1) {
                last.end = Math.max(last.end, interval.end);
            } else {
                merged.push(interval);
            }
        });
        const months = merged.reduce((sum, { start, end }) => sum + (end - start + 1), 0);
        return Math.floor(months / 12);
    })();

    const yearsEl = $('#yearsExperience');
    if (yearsEl && yearsOfExperience) yearsEl.textContent = `${yearsOfExperience}+`;

    const footerYear = $('#footerYear');
    if (footerYear) footerYear.textContent = String(new Date().getFullYear());

    // ── Metric counters ─────────────────────────────────────
    const autoCounts = {
        years: yearsOfExperience,
        certs: $$('#certList [data-filter-item]').length,
    };

    const renderCounter = (el, value) => {
        const decimals = Number(el.dataset.decimals || 0);
        el.textContent = `${el.dataset.prefix || ''}${value.toFixed(decimals)}${el.dataset.suffix || ''}`;
    };

    const counters = $$('[data-counter]');
    counters.forEach(el => {
        const auto = autoCounts[el.dataset.counterAuto];
        if (auto) el.dataset.counter = String(auto);
        renderCounter(el, Number(el.dataset.counter));
    });

    if (!prefersReducedMotion) {
        onVisible(counters, el => {
            const target = Number(el.dataset.counter) || 0;
            renderCounter(el, 0);
            const startedAt = performance.now();
            const step = now => {
                const progress = Math.min((now - startedAt) / 1200, 1);
                renderCounter(el, target * (1 - Math.pow(1 - progress, 3)));
                if (progress < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        }, 0.4);
    }

    // ── Rotating role line ──────────────────────────────────
    const roleRotator = $('#roleRotator');
    if (roleRotator && !prefersReducedMotion) {
        let phrases = [];
        try {
            phrases = JSON.parse(roleRotator.dataset.roles || '[]');
        } catch (error) { /* keep static text */ }

        if (phrases.length > 1) {
            let index = 0;
            let chars = phrases[0].length;
            let deleting = true;
            const tick = () => {
                const phrase = phrases[index];
                if (deleting) {
                    chars -= 1;
                    roleRotator.textContent = phrase.slice(0, chars);
                    if (chars === 0) {
                        deleting = false;
                        index = (index + 1) % phrases.length;
                    }
                    setTimeout(tick, chars === 0 ? 300 : 30);
                } else {
                    chars += 1;
                    roleRotator.textContent = phrase.slice(0, chars);
                    if (chars === phrase.length) {
                        deleting = true;
                        setTimeout(tick, 2400);
                    } else {
                        setTimeout(tick, 65);
                    }
                }
            };
            setTimeout(tick, 2600);
        }
    }

    // ── Skills ↔ experience linking ─────────────────────────
    const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const skillMatcher = term => new RegExp(`(^|[^a-z0-9])${escapeRegExp(term)}(?![a-z0-9])`, 'i');
    const matchingPoints = (role, matcher) => $$('.tl-points li', role.item).filter(li => matcher.test(li.textContent));

    const skillBanner = $('#skillFilterBanner');
    let activeSkillButton = null;

    const clearSkill = () => {
        roles.forEach(role => role.item.classList.remove('is-dimmed'));
        $$('.tl-points li.is-match').forEach(li => li.classList.remove('is-match'));
        if (skillBanner) skillBanner.hidden = true;
        if (activeSkillButton) activeSkillButton.setAttribute('aria-pressed', 'false');
        activeSkillButton = null;
    };

    const applySkill = (term, button = null) => {
        clearSkill();
        const matcher = skillMatcher(term);
        let roleCount = 0;
        roles.forEach(role => {
            const hits = matchingPoints(role, matcher);
            hits.forEach(li => li.classList.add('is-match'));
            role.item.classList.toggle('is-dimmed', hits.length === 0);
            if (hits.length) {
                roleCount += 1;
                const details = $('details', role.item);
                if (details) details.open = true;
            }
        });

        if (!roleCount) {
            clearSkill();
            return 0;
        }

        if (skillBanner) {
            $('#skillFilterTerm').textContent = term;
            $('#skillFilterCount').textContent = `${roleCount} role${roleCount === 1 ? '' : 's'}`;
            skillBanner.hidden = false;
        }
        if (button) {
            activeSkillButton = button;
            button.setAttribute('aria-pressed', 'true');
        }
        goTo('experience');
        return roleCount;
    };

    $('#skillFilterClear')?.addEventListener('click', clearSkill);

    $$('.skill-tag').forEach(tag => {
        const term = tag.textContent.trim();
        const matcher = skillMatcher(term);
        const roleCount = roles.filter(role => matchingPoints(role, matcher).length > 0).length;
        if (!roleCount) return;

        const button = document.createElement('button');
        button.type = 'button';
        button.className = tag.className;
        button.setAttribute('aria-pressed', 'false');
        button.setAttribute('aria-label', `${term}: used in ${roleCount} role${roleCount === 1 ? '' : 's'}. Show in experience.`);
        button.innerHTML = `${escapeHtml(term)}<span class="skill-tag-count" aria-hidden="true">${roleCount}</span>`;
        button.addEventListener('click', () => (button === activeSkillButton ? clearSkill() : applySkill(term, button)));
        tag.replaceWith(button);
    });

    // ── Search + chip filters (certifications, blogs) ───────
    const createFilter = ({ list, search, count, noun }) => {
        if (!list) return null;
        const state = { term: '', group: 'all' };
        const empty = $('[data-empty]', list.parentElement);

        const update = () => {
            const items = $$('[data-filter-item]', list);
            let visible = 0;
            items.forEach(item => {
                const matchesTerm = !state.term || item.textContent.toLowerCase().includes(state.term);
                const matchesGroup = state.group === 'all' || item.dataset.provider === state.group;
                const show = matchesTerm && matchesGroup;
                item.classList.toggle('is-hidden', !show);
                if (show) visible += 1;
            });
            if (count) count.textContent = `${visible} / ${items.length} ${noun}`;
            if (empty) empty.hidden = visible !== 0;
        };

        search?.addEventListener('input', () => {
            state.term = search.value.trim().toLowerCase();
            update();
        });

        update();
        return {
            update,
            setGroup(group) {
                state.group = group;
                update();
            },
        };
    };

    const certList = $('#certList');
    const certFilter = createFilter({ list: certList, search: $('#certSearch'), count: $('#certCount'), noun: 'certs' });
    const certChips = $('#certChips');
    if (certFilter && certChips) {
        const labels = { aws: 'AWS', microsoft: 'Microsoft', gitlab: 'GitLab', google: 'Google Cloud', cncf: 'CNCF', akamai: 'Akamai' };
        const items = $$('[data-filter-item]', certList);
        const counts = items.reduce((acc, item) => {
            acc[item.dataset.provider] = (acc[item.dataset.provider] || 0) + 1;
            return acc;
        }, {});
        const groups = [['all', 'All', items.length], ...Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .map(([key, total]) => [key, labels[key] || key, total])];

        certChips.innerHTML = groups.map(([key, label, total]) => (
            `<button type="button" class="chip" data-group="${escapeHtml(key)}" aria-pressed="${key === 'all'}">${escapeHtml(label)}<span class="chip-count">${total}</span></button>`
        )).join('');

        certChips.addEventListener('click', event => {
            const chip = event.target.closest('.chip');
            if (!chip) return;
            $$('.chip', certChips).forEach(c => c.setAttribute('aria-pressed', String(c === chip)));
            certFilter.setGroup(chip.dataset.group);
        });
    }

    const blogList = $('#blogList');
    const blogFilter = createFilter({ list: blogList, search: $('#blogSearch'), count: $('#blogCount'), noun: 'posts' });
    let blogSort = 'date';

    const sortBlogs = () => {
        if (!blogList) return;
        const key = blogSort === 'reactions' ? 'reactions' : 'date';
        $$('[data-filter-item]', blogList)
            .sort((a, b) => (key === 'date'
                ? b.dataset.date.localeCompare(a.dataset.date)
                : Number(b.dataset.reactions) - Number(a.dataset.reactions)))
            .forEach(card => blogList.append(card));
    };

    const blogSortGroup = $('#blogSort');
    blogSortGroup?.addEventListener('click', event => {
        const chip = event.target.closest('.chip');
        if (!chip) return;
        $$('.chip', blogSortGroup).forEach(c => c.setAttribute('aria-pressed', String(c === chip)));
        blogSort = chip.dataset.sort;
        sortBlogs();
    });

    // ── Scroll reveal ───────────────────────────────────────
    const revealSelector = '.section-head, .metric, .timeline-item, .skill-card, .project-card, .cert-card, .blog-card, .edu-item, .award-card, .interest-card, .contact-card';
    const reveal = elements => {
        if (prefersReducedMotion) return;
        elements.forEach(el => {
            const siblings = Array.from(el.parentElement?.children || []);
            el.style.setProperty('--delay', `${(siblings.indexOf(el) % 6) * 60}ms`);
            el.classList.add('reveal');
        });
        // Drop the reveal classes afterwards so hover transitions aren't slowed by the entrance timing.
        onVisible(elements, el => {
            el.classList.add('is-visible');
            const delay = parseInt(el.style.getPropertyValue('--delay'), 10) || 0;
            setTimeout(() => {
                el.classList.remove('reveal', 'is-visible');
                el.style.removeProperty('--delay');
            }, 650 + delay);
        }, 0.12);
    };
    reveal($$(revealSelector));

    // ── Live data: DEV articles, GitHub repos, last deploy ──
    const blogSource = $('#blogSource');
    const loadBlogs = async () => {
        if (!blogList) return;
        try {
            const articles = await fetchJson(
                `https://dev.to/api/articles?username=${DEVTO_USER}&per_page=100`,
                'devto-articles',
                data => data.map(a => ({
                    title: a.title,
                    url: a.url,
                    description: a.description,
                    date: (a.published_at || '').slice(0, 10),
                    minutes: a.reading_time_minutes,
                    reactions: a.public_reactions_count || 0,
                    tags: (a.tag_list || []).filter(tag => tag && tag !== 'emptystring').slice(0, 4),
                })),
            );
            if (!articles.length) return;

            const month = iso => new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
            blogList.innerHTML = articles.map(a => `
                <article class="blog-card" data-filter-item data-date="${escapeHtml(a.date)}" data-reactions="${Number(a.reactions)}">
                    <p class="blog-meta">
                        <span><i class="far fa-calendar" aria-hidden="true"></i>${escapeHtml(month(a.date))}</span>
                        <span><i class="far fa-clock" aria-hidden="true"></i>${Number(a.minutes) || 1} min read</span>
                        ${a.reactions ? `<span><i class="far fa-heart" aria-hidden="true"></i>${Number(a.reactions)}</span>` : ''}
                    </p>
                    <h3><a href="${escapeHtml(safeUrl(a.url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(a.title)}</a></h3>
                    ${a.description ? `<p>${escapeHtml(a.description)}</p>` : ''}
                    <div class="blog-tags">${a.tags.map(tag => `<span class="blog-tag">${escapeHtml(tag)}</span>`).join('')}</div>
                </article>`).join('');

            sortBlogs();
            blogFilter?.update();
            reveal($$('.blog-card', blogList));
            if (blogSource) {
                blogSource.classList.add('is-live');
                blogSource.lastChild.textContent = 'live · DEV API';
            }
        } catch (error) {
            if (blogSource) blogSource.lastChild.textContent = 'static list';
        }
    };

    const loadRepoStats = async () => {
        const cards = $$('.project-card[data-repo]');
        if (!cards.length) return;
        try {
            const repos = await fetchJson(
                `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=pushed`,
                'gh-repos',
                data => data.map(r => ({ name: r.name, stars: r.stargazers_count, pushed: r.pushed_at })),
            );
            const byName = new Map(repos.map(repo => [repo.name.toLowerCase(), repo]));
            cards.forEach(card => {
                const repo = byName.get(card.dataset.repo.toLowerCase());
                if (!repo) return;
                const stars = $('[data-stars]', card);
                const updated = $('[data-updated]', card);
                if (stars && repo.stars > 0) {
                    stars.innerHTML = `<i class="far fa-star" aria-hidden="true"></i> ${Number(repo.stars)}`;
                    stars.hidden = false;
                }
                if (updated && repo.pushed) {
                    updated.textContent = `updated ${timeAgo(repo.pushed)}`;
                    updated.hidden = false;
                }
            });
        } catch (error) { /* static cards remain */ }
    };

    const loadDeployStatus = async () => {
        const el = $('#deployStatus');
        if (!el) return;
        try {
            const commit = await fetchJson(
                `https://api.github.com/repos/${GITHUB_USER}/${SITE_REPO}/commits/${SITE_BRANCH}`,
                'gh-deploy',
                data => ({ sha: data.sha, url: data.html_url, date: data.commit?.committer?.date }),
            );
            el.innerHTML = `<span class="dot" aria-hidden="true"></span>deployed <a href="${escapeHtml(safeUrl(commit.url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(commit.sha.slice(0, 7))}</a> · ${escapeHtml(timeAgo(commit.date))}`;
        } catch (error) { /* keep static footer */ }
    };

    loadBlogs();
    loadRepoStats();
    loadDeployStatus();

    // ── Interactive terminal ────────────────────────────────
    const initTerminal = () => {
        const terminal = $('#terminal');
        if (!terminal) return null;

        const output = $('#terminalOutput', terminal);
        const form = $('#terminalForm', terminal);
        const input = $('#terminalInput', terminal);
        const body = $('.terminal-body', terminal);
        const PROMPT = '<span class="t-prompt">sagar@cloud</span><span class="t-muted">:</span><span class="t-path">~</span><span class="t-muted">$</span>';
        const sections = $$('main > section[id]').map(section => section.id);
        const commandHistory = [];
        let historyIndex = 0;
        let userInteracted = false;

        const print = html => {
            const line = document.createElement('p');
            line.className = 'terminal-line';
            line.innerHTML = html;
            output.append(line);
            body.scrollTop = body.scrollHeight;
        };

        const pad = (value, width) => String(value).padEnd(width, ' ');

        const skillsYaml = () => $$('.skill-card').map(card => {
            const heading = $('h3', card).textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
            const tags = $$('.skill-tag', card).map(tag => tag.firstChild.textContent.trim());
            return `<span class="t-key">${escapeHtml(heading)}</span>: [${tags.map(escapeHtml).join(', ')}]`;
        }).join('\n');

        const commands = {
            help: {
                desc: 'list available commands',
                run: () => print([
                    '<span class="t-head">Available commands</span>',
                    ...Object.entries(commands)
                        .filter(([, cmd]) => cmd.desc)
                        .map(([name, cmd]) => `  <span class="t-accent">${pad(name, 12)}</span><span class="t-muted">${cmd.desc}</span>`),
                    '',
                    '<span class="t-muted">Tip: Tab autocompletes, ↑/↓ browse history, Ctrl+L clears.</span>',
                ].join('\n')),
            },
            whoami: {
                desc: 'short bio',
                run: () => print([
                    '<span class="t-head">Sagar R Ravkhande</span> — Senior Cloud &amp; DevOps Engineer',
                    `<span class="t-muted">${yearsOfExperience}+ yrs · AWS · Azure · Kubernetes · Terraform · DevSecOps</span>`,
                    'Currently building multi-cloud platforms at Luxoft, Wrocław.',
                ].join('\n')),
            },
            skills: { desc: 'cat skills.yaml', run: () => print(skillsYaml()) },
            experience: {
                desc: 'career as kubectl output',
                run: () => commands.kubectl.run(['get', 'pods']),
            },
            certs: {
                desc: 'list certifications',
                run: () => print($$('#certList .cert-card').map(card => (
                    `<span class="t-ok">✔</span> ${escapeHtml($('h3', card).textContent.trim())}`
                )).join('\n')),
            },
            blogs: {
                desc: 'latest articles',
                run: () => print($$('#blogList .blog-card').slice(0, 5).map(card => {
                    const link = $('h3 a', card);
                    return `<span class="t-accent">→</span> <a href="${escapeHtml(link.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.textContent.trim())}</a>`;
                }).join('\n')),
            },
            contact: {
                desc: 'ways to reach me',
                run: () => print([
                    `<span class="t-key">email</span>    <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>`,
                    '<span class="t-key">linkedin</span> <a href="https://www.linkedin.com/in/sagar-ravkhande/" target="_blank" rel="noopener noreferrer">/in/sagar-ravkhande</a>',
                    '<span class="t-key">github</span>   <a href="https://github.com/sagary2j" target="_blank" rel="noopener noreferrer">@sagary2j</a>',
                ].join('\n')),
            },
            grep: {
                desc: 'grep <skill> — highlight roles using it',
                run: args => {
                    const term = args.join(' ').trim();
                    if (!term) {
                        print('<span class="t-warn">usage:</span> grep &lt;skill&gt;   e.g. grep terraform');
                        return;
                    }
                    const count = applySkill(term);
                    print(count
                        ? `<span class="t-ok">${count} role${count === 1 ? '' : 's'}</span> mention "${escapeHtml(term)}" — highlighted in Experience.`
                        : `<span class="t-err">no matches</span> for "${escapeHtml(term)}"`);
                },
            },
            ls: {
                desc: 'list sections',
                run: () => print(sections.map(id => `<span class="t-accent">${id}/</span>`).join('  ')),
            },
            cd: {
                desc: 'cd <section> — jump to a section',
                run: args => {
                    const target = (args[0] || '').replace(/^~?\/?|\/$/g, '');
                    if (!target || target === '~') {
                        goTo('about');
                    } else if (!goTo(target)) {
                        print(`<span class="t-err">cd: no such section:</span> ${escapeHtml(target)}`);
                    }
                },
            },
            cv: {
                desc: 'open résumé PDF',
                run: () => {
                    window.open(RESUME_PDF, '_blank', 'noopener');
                    print('<span class="t-ok">Opening</span> résumé in a new tab…');
                },
            },
            theme: {
                desc: 'toggle light/dark theme',
                run: () => print(`theme set to <span class="t-accent">${toggleTheme()}</span>`),
            },
            history: {
                desc: 'show command history',
                run: () => print(commandHistory.map((cmd, i) => `<span class="t-muted">${pad(i + 1, 4)}</span>${escapeHtml(cmd)}`).join('\n') || '<span class="t-muted">(empty)</span>'),
            },
            clear: { desc: 'clear the screen', run: () => { output.innerHTML = ''; } },
            kubectl: {
                run: args => {
                    if (args[0] !== 'get') {
                        print('<span class="t-warn">hint:</span> try <span class="t-accent">kubectl get pods -n career</span>');
                        return;
                    }
                    const podSuffix = text => Array.from(text).reduce((hash, char) => ((hash * 31) + char.charCodeAt(0)) >>> 0, 7).toString(16).slice(-5);
                    const header = `<span class="t-muted">${pad('NAME', 22)}${pad('READY', 7)}${pad('STATUS', 11)}AGE</span>`;
                    const rows = roles.map(role => {
                        const slug = role.org.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 14).replace(/^-|-$/g, '');
                        const status = role.current ? '<span class="t-ok">Running</span>    ' : '<span class="t-muted">Completed</span>  ';
                        return `${pad(`${slug}-${podSuffix(role.title + role.org)}`, 22)}${pad('1/1', 7)}${status}${formatDuration(role.months)}`;
                    });
                    print([header, ...rows].join('\n'));
                    print('<span class="t-muted">Run</span> <span class="t-accent">cd experience</span> <span class="t-muted">for the full story.</span>');
                },
            },
            terraform: {
                run: args => {
                    if (args[0] !== 'plan' && args[0] !== 'apply') {
                        print('<span class="t-warn">hint:</span> try <span class="t-accent">terraform plan</span>');
                        return;
                    }
                    if (args[0] === 'apply') {
                        print('<span class="t-ok">Apply complete!</span> Resources: 1 added. Run <span class="t-accent">contact</span> to finish provisioning.');
                        return;
                    }
                    print([
                        'Terraform will perform the following actions:',
                        '',
                        '  <span class="t-muted"># team_member.sagar will be created</span>',
                        '  <span class="t-ok">+</span> resource "team_member" "sagar" {',
                        '      <span class="t-ok">+</span> role       = "Senior Cloud &amp; DevOps Engineer"',
                        `      <span class="t-ok">+</span> experience = "${yearsOfExperience}+ years"`,
                        '      <span class="t-ok">+</span> clouds     = ["aws", "azure"]',
                        '      <span class="t-ok">+</span> focus      = ["kubernetes", "terraform", "devsecops"]',
                        '      <span class="t-ok">+</span> location   = "Wrocław, Poland"',
                        '    }',
                        '',
                        '<span class="t-head">Plan:</span> 1 to add, 0 to change, 0 to destroy.',
                    ].join('\n'));
                },
            },
            sudo: {
                run: args => {
                    if (args.join(' ') === 'hire-me') {
                        print('<span class="t-ok">[sudo] access granted.</span> Opening your mail client…');
                        setTimeout(() => { window.location.href = `mailto:${email}?subject=${encodeURIComponent('Hello Sagar')}`; }, 600);
                    } else {
                        print('<span class="t-err">sagar is not in the sudoers file.</span> This incident will be reported. (try <span class="t-accent">sudo hire-me</span>)');
                    }
                },
            },
            exit: { run: () => print('There is no escape from good infrastructure. Try <span class="t-accent">clear</span>.') },
        };

        const aliases = { goto: 'cd', resume: 'cv', about: 'whoami', certifications: 'certs', blog: 'blogs', '?': 'help' };

        const run = raw => {
            const line = raw.trim();
            print(`${PROMPT} ${escapeHtml(line)}`);
            if (!line) return;
            commandHistory.push(line);
            historyIndex = commandHistory.length;

            if (/^cat\s+skills(\.ya?ml)?$/i.test(line)) {
                commands.skills.run([]);
                return;
            }

            const [rawName, ...args] = line.split(/\s+/);
            const name = aliases[rawName.toLowerCase()] || rawName.toLowerCase();
            const command = commands[name];
            if (command) {
                command.run(args);
            } else if (sections.includes(name)) {
                goTo(name);
            } else {
                print(`<span class="t-err">command not found:</span> ${escapeHtml(rawName)} — type <span class="t-accent">help</span>`);
            }
        };

        const completions = () => [...Object.keys(commands), ...sections];

        form.addEventListener('submit', event => {
            event.preventDefault();
            userInteracted = true;
            run(input.value);
            input.value = '';
        });

        input.addEventListener('keydown', event => {
            userInteracted = true;
            if (event.key === 'ArrowUp' && commandHistory.length) {
                event.preventDefault();
                historyIndex = Math.max(historyIndex - 1, 0);
                input.value = commandHistory[historyIndex];
            } else if (event.key === 'ArrowDown' && commandHistory.length) {
                event.preventDefault();
                historyIndex = Math.min(historyIndex + 1, commandHistory.length);
                input.value = commandHistory[historyIndex] || '';
            } else if (event.key === 'Tab') {
                const parts = input.value.split(/\s+/);
                const partial = parts[parts.length - 1].toLowerCase();
                if (!partial) return;
                const pool = parts.length > 1 ? sections : completions();
                const matches = pool.filter(option => option.startsWith(partial));
                if (matches.length === 1) {
                    event.preventDefault();
                    parts[parts.length - 1] = matches[0];
                    input.value = `${parts.join(' ')} `;
                } else if (matches.length > 1) {
                    event.preventDefault();
                    print(matches.map(m => `<span class="t-accent">${m}</span>`).join('  '));
                }
            } else if (event.key === 'l' && event.ctrlKey) {
                event.preventDefault();
                output.innerHTML = '';
            }
        });

        body.addEventListener('click', () => {
            if (!window.getSelection()?.toString()) input.focus({ preventScroll: true });
        });

        $$('[data-command]', terminal).forEach(button => {
            button.addEventListener('click', () => {
                userInteracted = true;
                run(button.dataset.command);
                input.focus({ preventScroll: true });
            });
        });

        const boot = () => {
            output.innerHTML = '';
            print(`<span class="t-muted">Last login: ${new Date().toUTCString().replace(' GMT', '')} on ttys001</span>`);
            if (prefersReducedMotion) {
                run('whoami');
                print('<span class="t-muted">Type</span> <span class="t-accent">help</span> <span class="t-muted">to explore, or click a suggestion below.</span>');
                return;
            }
            const demo = 'whoami';
            let i = 0;
            const type = () => {
                if (userInteracted) return;
                input.value = demo.slice(0, i);
                if (i < demo.length) {
                    i += 1;
                    setTimeout(type, 90);
                    return;
                }
                setTimeout(() => {
                    if (userInteracted) return;
                    input.value = '';
                    run(demo);
                    print('<span class="t-muted">Type</span> <span class="t-accent">help</span> <span class="t-muted">to explore, or click a suggestion below.</span>');
                }, 350);
            };
            setTimeout(type, 600);
        };

        onVisible([terminal], boot, 0.3);

        return {
            focus() {
                goTo('about');
                setTimeout(() => input.focus({ preventScroll: true }), prefersReducedMotion ? 0 : 450);
            },
        };
    };

    const terminal = initTerminal();

    // ── Command palette (Ctrl/⌘ + K) ────────────────────────
    const initPalette = () => {
        const dialog = $('#palette');
        const openers = $$('[data-palette-open]');
        if (!dialog || typeof dialog.showModal !== 'function') {
            openers.forEach(el => { el.hidden = true; });
            return;
        }

        const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
        $$('[data-mod-key]').forEach(el => { el.textContent = isMac ? '⌘' : 'Ctrl'; });

        const input = $('#paletteInput');
        const list = $('#paletteList');
        const openUrl = url => () => window.open(url, '_blank', 'noopener');

        const actions = [
            ...$$('#navbarResponsive .nav-link').map(link => {
                const id = link.getAttribute('href').slice(1);
                return { label: `Go to ${id}`, group: 'navigate', icon: 'fas fa-hashtag', run: () => goTo(id) };
            }),
            { label: 'Open interactive terminal', group: 'action', icon: 'fas fa-terminal', keywords: 'shell cli', run: () => terminal?.focus() },
            { label: 'Download résumé (PDF)', group: 'action', icon: 'fas fa-download', keywords: 'cv resume', run: () => { const a = document.createElement('a'); a.href = RESUME_PDF; a.download = RESUME_PDF; a.click(); } },
            { label: 'Preview résumé', group: 'action', icon: 'fas fa-eye', keywords: 'cv resume', run: openUrl(RESUME_PDF) },
            { label: 'Copy email address', group: 'action', icon: 'far fa-copy', keywords: 'mail contact', run: copyEmail },
            { label: 'Send an email', group: 'action', icon: 'fas fa-envelope', keywords: 'mail contact hire', run: () => { window.location.href = `mailto:${email}`; } },
            { label: 'Toggle light / dark theme', group: 'action', icon: 'fas fa-circle-half-stroke', keywords: 'dark light mode', run: () => toast(`Theme: ${toggleTheme()}`) },
            { label: 'LinkedIn', group: 'link', icon: 'fab fa-linkedin-in', run: openUrl('https://www.linkedin.com/in/sagar-ravkhande/') },
            { label: 'GitHub', group: 'link', icon: 'fab fa-github', keywords: 'code repos', run: openUrl('https://github.com/sagary2j') },
            { label: 'DEV Community', group: 'link', icon: 'fab fa-dev', keywords: 'blog articles', run: openUrl('https://dev.to/sagary2j') },
            { label: 'X / Twitter', group: 'link', icon: 'fab fa-x-twitter', run: openUrl('https://x.com/RavkhandeSagar') },
        ];

        let filtered = actions;
        let selected = 0;

        const setSelected = index => {
            selected = index;
            $$('.palette-item', list).forEach((item, i) => item.setAttribute('aria-selected', String(i === index)));
            const active = $(`#palette-opt-${index}`);
            input.setAttribute('aria-activedescendant', active ? active.id : '');
            active?.scrollIntoView({ block: 'nearest' });
        };

        const render = () => {
            list.innerHTML = filtered.length
                ? filtered.map((action, i) => (
                    `<li class="palette-item" role="option" id="palette-opt-${i}" data-index="${i}" aria-selected="false"><i class="${action.icon}" aria-hidden="true"></i><span>${escapeHtml(action.label)}</span><span class="palette-group">${action.group}</span></li>`
                )).join('')
                : '<li class="palette-empty" role="presentation">No matching commands</li>';
            setSelected(0);
        };

        const filter = () => {
            const tokens = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
            filtered = actions.filter(action => {
                const haystack = `${action.label} ${action.group} ${action.keywords || ''}`.toLowerCase();
                return tokens.every(token => haystack.includes(token));
            });
            render();
        };

        const open = () => {
            input.value = '';
            filter();
            dialog.showModal();
            input.focus();
        };

        const runAction = index => {
            const action = filtered[index];
            if (!action) return;
            dialog.close();
            action.run();
        };

        input.addEventListener('input', filter);
        input.addEventListener('keydown', event => {
            if (!filtered.length) return;
            if (event.key === 'ArrowDown') {
                event.preventDefault();
                setSelected((selected + 1) % filtered.length);
            } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                setSelected((selected - 1 + filtered.length) % filtered.length);
            } else if (event.key === 'Enter') {
                event.preventDefault();
                runAction(selected);
            }
        });

        list.addEventListener('click', event => {
            const item = event.target.closest('.palette-item');
            if (item) runAction(Number(item.dataset.index));
        });

        list.addEventListener('mousemove', event => {
            const item = event.target.closest('.palette-item');
            if (item && Number(item.dataset.index) !== selected) setSelected(Number(item.dataset.index));
        });

        dialog.addEventListener('click', event => {
            if (event.target === dialog) dialog.close();
        });

        openers.forEach(el => el.addEventListener('click', open));

        document.addEventListener('keydown', event => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                if (dialog.open) {
                    dialog.close();
                } else {
                    open();
                }
            } else if (event.key === '/' && !dialog.open && !isTyping(event.target)) {
                event.preventDefault();
                open();
            }
        });
    };

    initPalette();

    // ── Scroll progress + back to top ───────────────────────
    const progressBar = $('#scrollProgress');
    const backToTop = $('#backToTop');
    let scrollTicking = false;

    const updateScrollUI = () => {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
        if (progressBar) progressBar.style.transform = `scaleX(${progress})`;
        if (backToTop) backToTop.classList.toggle('is-visible', window.scrollY > 600);
        scrollTicking = false;
    };

    window.addEventListener('scroll', () => {
        if (!scrollTicking) {
            scrollTicking = true;
            requestAnimationFrame(updateScrollUI);
        }
    }, { passive: true });
    updateScrollUI();

    backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: scrollBehavior }));

    // Closed <details> would hide experience from printed copies.
    window.addEventListener('beforeprint', () => {
        $$('.timeline-card').forEach(details => { details.open = true; });
        $$('.reveal').forEach(el => el.classList.add('is-visible'));
    });
});
