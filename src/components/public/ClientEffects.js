'use client';

import { useEffect } from 'react';

export default function ClientEffects() {
  useEffect(() => {
    // ===== NAV SCROLL =====
    const nav = document.getElementById('navbar');
    const handleScroll = () => {
      if (nav) {
        nav.classList.toggle('solid', window.scrollY > 60);
      }
    };
    window.addEventListener('scroll', handleScroll);

    // ===== MOBILE MENU =====
    const burger = document.getElementById('burger');
    const menu = document.getElementById('navMenu');
    const overlay = document.getElementById('navOverlay');

    const toggleMenu = () => {
      menu?.classList.toggle('open');
      overlay?.classList.toggle('open');
    };

    const closeMenu = () => {
      menu?.classList.remove('open');
      overlay?.classList.remove('open');
    };

    burger?.addEventListener('click', toggleMenu);
    overlay?.addEventListener('click', closeMenu);
    
    const menuLinks = menu?.querySelectorAll('a');
    menuLinks?.forEach(a => a.addEventListener('click', closeMenu));

    // ===== SCROLL ANIMATIONS =====
    const animEls = document.querySelectorAll('.anim');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('show');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    animEls.forEach(el => obs.observe(el));

    // ===== COUNTER ANIMATION =====
    let counted = false;
    const nums = document.querySelectorAll('.num[data-count]');
    const countObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && !counted) {
          counted = true;
          nums.forEach(n => {
            const target = parseInt(n.dataset.count || '0', 10);
            if (target === 0) return;
            const dur = 2000;
            const step = target / (dur / 16);
            let cur = 0;
            const tick = () => {
              cur += step;
              if (cur < target) {
                n.textContent = Math.floor(cur);
                requestAnimationFrame(tick);
              } else {
                n.textContent = target.toString();
              }
            };
            tick();
          });
        }
      });
    }, { threshold: 0.5 });
    nums.forEach(n => countObs.observe(n));

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      burger?.removeEventListener('click', toggleMenu);
      overlay?.removeEventListener('click', closeMenu);
      menuLinks?.forEach(a => a.removeEventListener('click', closeMenu));
      animEls.forEach(el => obs.unobserve(el));
      nums.forEach(n => countObs.unobserve(n));
    };
  }, []);

  return null;
}
