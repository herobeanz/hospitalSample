(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const initReveal = () => {
    const elements = document.querySelectorAll('[data-aos], .aos-init');
    if (!elements.length) return;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('aos-animate', 'local-in-view'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const delay = Number(entry.target.dataset.aosDelay || 0);
        window.setTimeout(() => {
          entry.target.classList.add('aos-animate', 'local-in-view');
        }, delay);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });

    elements.forEach((element) => observer.observe(element));
  };

  const setActiveSlide = (slides, activeIndex) => {
    slides.forEach((slide, index) => {
      slide.classList.toggle('swiper-slide-active', index === activeIndex);
      slide.classList.toggle('swiper-slide-prev', index === activeIndex - 1);
      slide.classList.toggle('swiper-slide-next', index === activeIndex + 1);
      slide.setAttribute('aria-hidden', String(index !== activeIndex));
    });
  };

  const initLocalCarousel = (root, options = {}) => {
    const wrapper = root.querySelector('.swiper-wrapper, .corousel-wrapper, .carousel-wrapper');
    const slides = Array.from(root.querySelectorAll('.swiper-slide, .carousel-slide, .carousel-cell'));
    if (!wrapper || slides.length < 2) return;

    let index = Math.max(0, slides.findIndex((slide) => slide.classList.contains('swiper-slide-active')));
    if (index < 0) index = 0;

    const getVisible = () => typeof options.visible === 'function' ? options.visible() : options.visible || 1;
    const visible = () => Math.min(getVisible(), slides.length);
    const getStep = () => {
      const first = slides[0];
      const rect = first.getBoundingClientRect();
      const styles = window.getComputedStyle(first);
      return rect.width + Number.parseFloat(styles.marginRight || '0');
    };

    const render = () => {
      setActiveSlide(slides, index);
      wrapper.style.transform = `translate3d(${-getStep() * index}px, 0, 0)`;
      wrapper.style.transitionDuration = '700ms';
    };

    const goTo = (nextIndex) => {
      const maxIndex = Math.max(0, slides.length - visible());
      index = nextIndex > maxIndex ? 0 : nextIndex < 0 ? maxIndex : nextIndex;
      render();
    };

    root.querySelectorAll('.swiper-button-next, .carousel-ctr.--next').forEach((button) => {
      button.addEventListener('click', () => goTo(index + 1));
    });

    root.querySelectorAll('.swiper-button-prev, .carousel-ctr.--prev').forEach((button) => {
      button.addEventListener('click', () => goTo(index - 1));
    });

    let timer = prefersReducedMotion ? 0 : window.setInterval(() => goTo(index + 1), options.interval || 4500);
    root.addEventListener('mouseenter', () => timer && window.clearInterval(timer));
    root.addEventListener('mouseleave', () => {
      if (!prefersReducedMotion) timer = window.setInterval(() => goTo(index + 1), options.interval || 4500);
    });
    window.addEventListener('resize', render);
    render();
  };

  const initAccordions = () => {
    document.querySelectorAll('.accordion').forEach((accordion, index) => {
      const title = accordion.querySelector('.accordion-title');
      const content = accordion.querySelector('.accordion-content');
      if (!title || !content) return;

      const titleId = title.id || `local-accordion-title-${index}`;
      const contentId = content.id || `local-accordion-content-${index}`;
      title.id = titleId;
      content.id = contentId;
      title.setAttribute('role', 'button');
      title.setAttribute('tabindex', '0');
      title.setAttribute('aria-controls', contentId);

      const setOpen = (open) => {
        accordion.classList.toggle('is-open', open);
        accordion.classList.toggle('active', open);
        title.setAttribute('aria-expanded', String(open));
      };

      setOpen(index === 0 || accordion.classList.contains('active'));
      title.addEventListener('click', () => setOpen(!accordion.classList.contains('is-open')));
      title.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        setOpen(!accordion.classList.contains('is-open'));
      });
    });
  };

  document.addEventListener('DOMContentLoaded', () => {
    initReveal();
    initAccordions();
    document.querySelectorAll('.banner-slider .swiper').forEach((root) => initLocalCarousel(root, { interval: 4300 }));
    document.querySelectorAll('.reviews-list .swiper').forEach((root) => initLocalCarousel(root, {
      visible: () => window.innerWidth < 641 ? 1 : window.innerWidth < 992 ? 2 : 3,
      interval: 3600,
    }));
  });
})();
