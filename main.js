document.addEventListener('DOMContentLoaded', () => {

  // Scroll reveal
  const targets = document.querySelectorAll(
    '.skill-card, .project-card, .exp-entry, .volunteer-entry, .resume-block, .about-grid, .contact-wrap, .experience-timeline'
  );

  targets.forEach((el, i) => {
    el.classList.add('reveal');
    if (el.classList.contains('skill-card') || el.classList.contains('project-card')) {
      const siblings = el.parentElement.querySelectorAll('.skill-card, .project-card');
      siblings.forEach((card, idx) => {
        card.style.transitionDelay = `${idx * 0.08}s`;
      });
    }
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(el => observer.observe(el));


  // Back to top button
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('visible', window.scrollY > 300);
    });
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Hamburger menu
  const hamburger = document.querySelector('.nav-hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });
  }

  // Page transitions
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (href && !href.startsWith('#') && !href.startsWith('http') && !href.startsWith('mailto')) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        document.body.classList.add('page-exit');
        setTimeout(() => { window.location.href = href; }, 250);
      });
    }
  });

});
