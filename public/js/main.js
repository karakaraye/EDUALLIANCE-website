/**
 * EDUALLIANCE - Main Interactive Behaviors & Site Logic
 */

(function () {
  'use strict';

  function initMain() {
    initHeader();
    initMobileNav();
    initFaqAccordion();
    initConsultationModal();
    initAnimatedStats();
  }

  // Header Scroll State
  function initHeader() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  // Mobile Navigation Drawer
  function initMobileNav() {
    const toggleBtn = document.querySelector('.mobile-toggle');
    const drawer = document.querySelector('.mobile-nav-drawer');
    const overlay = document.querySelector('.mobile-drawer-overlay');
    const closeBtn = document.querySelector('.mobile-drawer-close');
    const navLinks = document.querySelectorAll('.mobile-nav-link');

    if (!toggleBtn || !drawer || !overlay) return;

    function openDrawer() {
      drawer.classList.add('open');
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
      drawer.classList.remove('open');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }

    toggleBtn.addEventListener('click', openDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    overlay.addEventListener('click', closeDrawer);

    navLinks.forEach(link => {
      link.addEventListener('click', closeDrawer);
    });
  }

  // FAQ Accordion & Category Switching
  function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    const catButtons = document.querySelectorAll('.faq-cat-btn');
    if (!faqItems.length) return;

    // Accordion expand/collapse
    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      if (question) {
        question.addEventListener('click', () => {
          const isActive = item.classList.contains('active');
          faqItems.forEach(i => i.classList.remove('active'));
          if (!isActive) {
            item.classList.add('active');
          }
        });
      }
    });

    // Category filter buttons
    catButtons.forEach(btn => {
      btn.addEventListener('click', function () {
        catButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const targetCategory = this.dataset.category;

        faqItems.forEach(item => {
          if (targetCategory === 'all' || item.dataset.category === targetCategory) {
            item.style.display = 'block';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }

  // On-Site Campus Consultation Modal
  function initConsultationModal() {
    const modal = document.getElementById('consultation-modal');
    const openBtns = document.querySelectorAll('.btn-open-consultation');
    const closeBtn = document.getElementById('btn-close-consultation');
    const form = document.getElementById('consultation-form');

    if (!modal) return;

    openBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });

    function closeModal() {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const schoolName = document.getElementById('consult-school-name')?.value || 'Your School';
        const contactPerson = document.getElementById('consult-name')?.value || 'Proprietor';
        
        modal.querySelector('.modal-body').innerHTML = `
          <div style="text-align: center; padding: 2rem 1rem;">
            <div style="width: 60px; height: 60px; border-radius: 50%; background: var(--emerald-50); color: var(--emerald-600); display: flex; align-items: center; justify-content: center; font-size: 1.8rem; margin: 0 auto 1.25rem auto;">
              ✓
            </div>
            <h3 style="font-size: 1.35rem; font-weight: 800; color: var(--navy-900); margin-bottom: 0.5rem;">
              Campus Appraisal Visit Requested
            </h3>
            <p style="font-size: 0.95rem; color: var(--slate-600); margin-bottom: 1.5rem;">
              Thank you, <strong>${contactPerson}</strong>. An EDUALLIANCE Education Finance Specialist has received your request for <strong>${schoolName}</strong> and will contact you within 24 hours to confirm appointment details.
            </p>
            <button onclick="document.getElementById('consultation-modal').classList.remove('open'); document.body.style.overflow = '';" class="btn-primary-lg" style="font-size: 0.9rem; padding: 0.75rem 1.5rem;">
              Close Window
            </button>
          </div>
        `;
      });
    }
  }

  // Animated Numbers Counter on Viewport Scroll
  function initAnimatedStats() {
    const stats = document.querySelectorAll('.stat-num[data-target]');
    if (!stats.length) return;

    let animated = false;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !animated) {
          animated = true;
          stats.forEach(stat => {
            const target = parseInt(stat.dataset.target, 10);
            const prefix = stat.dataset.prefix || '';
            const suffix = stat.dataset.suffix || '';
            let count = 0;
            const step = Math.ceil(target / 40);
            const timer = setInterval(() => {
              count += step;
              if (count >= target) {
                count = target;
                clearInterval(timer);
              }
              stat.textContent = `${prefix}${count.toLocaleString()}${suffix}`;
            }, 35);
          });
        }
      });
    }, { threshold: 0.3 });

    const targetSection = document.querySelector('.impact-stats-strip');
    if (targetSection) observer.observe(targetSection);
  }

  // Run on DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMain);
  } else {
    initMain();
  }
})();
