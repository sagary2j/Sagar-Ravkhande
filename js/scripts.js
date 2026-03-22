/*!
* Start Bootstrap - Resume v7.0.5 (https://startbootstrap.com/theme/resume)
* Copyright 2013-2022 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-resume/blob/master/LICENSE)
*/
//
// Scripts
// 

window.addEventListener('DOMContentLoaded', event => {

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
        const firstCareerYear = 2012;
        return Math.max(new Date().getFullYear() - firstCareerYear, 0);
    };

    const yearsExperience = document.querySelector('#yearsExperience');
    if (yearsExperience) {
        yearsExperience.textContent = `${getYearsOfExperience()}+`;
    }

    const animateCounters = () => {
        const counters = document.querySelectorAll('[data-counter]');
        counters.forEach(counter => {
            const target = Number(counter.getAttribute('data-counter')) || 0;
            const suffix = counter.getAttribute('data-suffix') || '';
            const duration = 900;
            const startTime = performance.now();

            const tick = now => {
                const progress = Math.min((now - startTime) / duration, 1);
                const value = Math.floor(progress * target);
                counter.textContent = `${value}${suffix}`;
                if (progress < 1) {
                    requestAnimationFrame(tick);
                }
            };

            requestAnimationFrame(tick);
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

        const items = Array.from(list.querySelectorAll('li'));

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

    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    revealTargets.forEach(target => revealObserver.observe(target));

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

});
