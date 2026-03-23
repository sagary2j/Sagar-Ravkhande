/*!
* Start Bootstrap - Resume v7.0.5 (https://startbootstrap.com/theme/resume)
* Copyright 2013-2022 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-resume/blob/master/LICENSE)
*/
//
// Scripts
// 

window.addEventListener('DOMContentLoaded', event => {

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Activate Bootstrap scrollspy on the main nav element
    const sideNav = document.body.querySelector('#sideNav');
    if (sideNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#sideNav',
            offset: 74,
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

    const getYearsOfExperience = () => {
        const monthMap = {
            january: 0,
            february: 1,
            march: 2,
            april: 3,
            may: 4,
            june: 5,
            july: 6,
            august: 7,
            september: 8,
            october: 9,
            november: 10,
            december: 11,
        };

        const parseMonthIndex = (value, isEnd) => {
            const text = (value || '').trim().toLowerCase();
            if (!text) {
                return null;
            }

            if (text.includes('present')) {
                const now = new Date();
                return (now.getFullYear() * 12) + now.getMonth();
            }

            const monthMatch = text.match(/january|february|march|april|may|june|july|august|september|october|november|december/);
            const yearMatch = text.match(/\b\d{4}\b/);
            if (!yearMatch) {
                return null;
            }

            const year = Number(yearMatch[0]);
            const month = monthMatch ? monthMap[monthMatch[0]] : (isEnd ? 11 : 0);
            return (year * 12) + month;
        };

        const dateRanges = Array.from(document.querySelectorAll('#experience .flex-shrink-0 .text-primary'));
        const intervals = dateRanges.map(range => {
            const [startText = '', endText = 'Present'] = range.textContent
                .replace(/\s*[\u2013\u2014]\s*/g, ' - ')
                .split(/\s+-\s+/);
            const start = parseMonthIndex(startText, false);
            const end = parseMonthIndex(endText, true);
            if (start === null || end === null || end < start) {
                return null;
            }
            return { start, end };
        }).filter(Boolean);

        if (intervals.length === 0) {
            return 0;
        }

        intervals.sort((a, b) => a.start - b.start);

        const merged = [intervals[0]];
        intervals.slice(1).forEach(interval => {
            const last = merged[merged.length - 1];
            if (interval.start <= last.end + 1) {
                last.end = Math.max(last.end, interval.end);
                return;
            }
            merged.push(interval);
        });

        const totalMonths = merged.reduce((sum, interval) => sum + (interval.end - interval.start + 1), 0);
        return Math.max(Math.floor(totalMonths / 12), 0);
    };

    const computedYearsOfExperience = getYearsOfExperience();

    const yearsExperience = document.querySelector('#yearsExperience');
    if (yearsExperience) {
        yearsExperience.textContent = `${computedYearsOfExperience}+`;
    }

    const animateCounters = () => {
        const counters = document.querySelectorAll('[data-counter]');
        counters.forEach(counter => {
            const autoCounter = counter.getAttribute('data-counter-auto');
            const target = autoCounter === 'years'
                ? computedYearsOfExperience
                : Number(counter.getAttribute('data-counter')) || 0;
            const suffix = counter.getAttribute('data-suffix') || '';
            const duration = prefersReducedMotion ? 0 : 900;
            const startTime = performance.now();

            const tick = now => {
                const progress = Math.min((now - startTime) / duration, 1);
                const value = Math.floor(progress * target);
                counter.textContent = `${value}${suffix}`;
                if (progress < 1) {
                    requestAnimationFrame(tick);
                }
            };

            if (duration === 0) {
                counter.textContent = `${target}${suffix}`;
            } else {
                requestAnimationFrame(tick);
            }
        });
    };
    animateCounters();

    const filterList = ({ listSelector, searchSelector, countSelector, providerSelector }) => {
        const list = document.querySelector(listSelector);
        const search = document.querySelector(searchSelector);
        const count = document.querySelector(countSelector);
        const provider = providerSelector ? document.querySelector(providerSelector) : null;
        if (!list || !search || !count) {
            return;
        }

        const items = Array.from(list.querySelectorAll('[data-filter-item], li'));

        const updateList = () => {
            const term = search.value.trim().toLowerCase();
            const sourceFilter = provider ? provider.value.toLowerCase() : 'all';

            let visibleCount = 0;
            items.forEach(item => {
                const text = item.textContent.toLowerCase();
                const link = item.querySelector('a');
                const href = link ? link.href.toLowerCase() : '';

                const matchesText = text.includes(term);
                const sourceMatch = sourceFilter === 'all'
                    || (sourceFilter === 'other'
                        ? !href.includes('credly') && !href.includes('credential.net') && !href.includes('gitlab')
                        : href.includes(sourceFilter));

                const show = matchesText && sourceMatch;
                item.classList.toggle('is-hidden', !show);
                if (show) {
                    visibleCount += 1;
                }
            });

            count.textContent = `${visibleCount} result${visibleCount === 1 ? '' : 's'}`;
        };

        search.addEventListener('input', updateList);
        if (provider) {
            provider.addEventListener('change', updateList);
        }
        updateList();
    };

    filterList({
        listSelector: '#certList',
        searchSelector: '#certSearch',
        countSelector: '#certCount',
        providerSelector: '#certSourceFilter',
    });

    filterList({
        listSelector: '#blogList',
        searchSelector: '#blogSearch',
        countSelector: '#blogCount',
    });

    const revealTargets = document.querySelectorAll('.resume-section, .kpi-card');
    revealTargets.forEach(target => target.classList.add('reveal-on-scroll'));

    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        revealTargets.forEach(target => revealObserver.observe(target));
    } else {
        revealTargets.forEach(target => target.classList.add('is-visible'));
    }

    const progressBar = document.querySelector('#scrollProgress');
    const backToTop = document.querySelector('#backToTop');
    const updateScrollUI = () => {
        const scrollTop = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const progress = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;

        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }

        if (backToTop) {
            backToTop.classList.toggle('is-visible', scrollTop > 500);
        }
    };

    updateScrollUI();
    window.addEventListener('scroll', updateScrollUI, { passive: true });

    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ─────────────────────────────────────────────────────────────
    //  DEVOPS ARCHITECT THEME — Particle code-rain + typewriter
    // ─────────────────────────────────────────────────────────────

    // 1. Scrolling code-rain particle canvas on sidebar
    const initSidebarCanvas = () => {
        if (prefersReducedMotion) {
            return;
        }

        const sideNav = document.getElementById('sideNav');
        if (!sideNav) return;

        const canvas = document.createElement('canvas');
        canvas.id = 'devopsCanvas';
        sideNav.insertBefore(canvas, sideNav.firstChild);

        const ctx = canvas.getContext('2d');
        const CHARS = '01{}[]<>()=>:/\\|#@!;~&%$'.split('');

        const syncSize = () => {
            canvas.width  = sideNav.offsetWidth;
            canvas.height = sideNav.offsetHeight;
        };
        syncSize();

        const ro = new ResizeObserver(syncSize);
        ro.observe(sideNav);

        const rand = (a, b) => a + Math.random() * (b - a);

        const makeParticle = () => ({
            x: rand(0, canvas.width),
            y: rand(-40, canvas.height),
            speed:   rand(0.25, 0.9),
            opacity: rand(0.15, 0.55),
            char:    CHARS[Math.floor(Math.random() * CHARS.length)],
            size:    rand(9, 14),
            color:   Math.random() > 0.55 ? '#0ea5e9' : '#22c55e',
        });

        const particles = Array.from({ length: 55 }, makeParticle);

        const tick = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                ctx.globalAlpha = p.opacity;
                ctx.fillStyle   = p.color;
                ctx.font        = `${p.size}px "Courier New", monospace`;
                ctx.fillText(p.char, p.x, p.y);
                p.y += p.speed;
                // randomly swap character occasionally for a "glitch" feel
                if (Math.random() < 0.008) {
                    p.char = CHARS[Math.floor(Math.random() * CHARS.length)];
                }
                if (p.y > canvas.height + 20) {
                    Object.assign(p, makeParticle(), { y: -20 });
                }
            });
            ctx.globalAlpha = 1;
            requestAnimationFrame(tick);
        };
        tick();
    };

    initSidebarCanvas();

    // 2. Typewriter effect on the name heading
    const initTypewriter = () => {
        if (prefersReducedMotion) {
            return;
        }

        const h1 = document.querySelector('#about h1');
        if (!h1) return;

        const firstText = 'Sagar R';
        const lastText  = 'Ravkhande';

        h1.innerHTML = '';

        const firstSpan = Object.assign(document.createElement('span'), { className: 'd-inline' });
        const gap       = document.createTextNode('\u00a0');
        const lastSpan  = Object.assign(document.createElement('span'), { className: 'text-primary' });
        const cursor    = Object.assign(document.createElement('span'), { className: 'typed-cursor' });

        h1.append(firstSpan, gap, lastSpan, cursor);

        let phase = 0, i = 0;
        const targets = [firstText, lastText];
        const spans   = [firstSpan, lastSpan];

        const type = () => {
            if (i < targets[phase].length) {
                spans[phase].textContent += targets[phase][i++];
                setTimeout(type, 75);
            } else if (phase === 0) {
                phase = 1;
                i = 0;
                setTimeout(type, 220);
            } else {
                setTimeout(() => { cursor.style.display = 'none'; }, 3500);
            }
        };

        setTimeout(type, 500);
    };

    initTypewriter();

    // 3. Subtle glitch / color-shift on skill category labels
    const initSkillGlow = () => {
        document.querySelectorAll('#skills .fa-ul li strong').forEach((el, idx) => {
            el.style.color = ['#0ea5e9', '#22c55e', '#a855f7', '#f59e0b',
                              '#0ea5e9', '#22c55e', '#0ea5e9', '#f59e0b'][idx % 8];
        });
    };

    initSkillGlow();

    // 4. Staggered reveal for experience timeline entries
    const initExperienceStagger = () => {
        const timelineItems = Array.from(document.querySelectorAll('#experience .d-flex.flex-column.flex-md-row'));
        if (timelineItems.length === 0) {
            return;
        }

        timelineItems.forEach((item, index) => {
            item.classList.add('timeline-reveal');
            item.style.setProperty('--stagger-delay', `${index * 90}ms`);
        });

        if (prefersReducedMotion) {
            timelineItems.forEach(item => item.classList.add('in-view'));
            return;
        }

        if (!('IntersectionObserver' in window)) {
            timelineItems.forEach(item => item.classList.add('in-view'));
            return;
        }

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        timelineItems.forEach(item => observer.observe(item));
    };

    initExperienceStagger();

    // 5. Lightweight magnetic hover for CTA + social icons
    const initMagneticHover = () => {
        const targets = document.querySelectorAll('.resume-action-btn, .social-icons .social-icon, .hero-chip');
        if (prefersReducedMotion || targets.length === 0) {
            return;
        }

        targets.forEach(el => {
            el.addEventListener('mousemove', e => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const moveX = ((x / rect.width) - 0.5) * 10;
                const moveY = ((y / rect.height) - 0.5) * 10;
                el.style.transform = `translate(${moveX}px, ${moveY}px)`;
            });

            el.addEventListener('mouseleave', () => {
                el.style.transform = '';
            });
        });
    };

    initMagneticHover();

});
