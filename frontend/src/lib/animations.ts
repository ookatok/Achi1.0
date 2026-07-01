import { animate, inView, scroll } from "motion";

/**
 * Page titles and descriptions entry reveal animations on load.
 */
export function initPageReveal(): void {
  try {
    const titles = document.querySelectorAll('.motion-title');
    if (titles.length > 0) {
      animate(titles as any, { opacity: [0, 1], y: [25, 0] } as any, { duration: 0.8, ease: "easeOut" } as any);
    }

    const descs = document.querySelectorAll('.motion-desc');
    if (descs.length > 0) {
      animate(descs as any, { opacity: [0, 1], y: [15, 0] } as any, { duration: 0.8, delay: 0.15, ease: "easeOut" } as any);
    }
  } catch (err) {
    console.error('[Motion API Error] Page reveal animation failed.', err);
  }
}

/**
 * Scroll reveal animations for elements with class '.motion-item' when they come into viewport.
 */
export function initScrollReveal(): void {
  try {
    inView('.motion-item', (element) => {
      animate(element as any, { opacity: [0, 1], y: [30, 0] } as any, { duration: 0.7, ease: "easeOut" } as any);
    });
  } catch (err) {
    console.error('[Motion API Error] Scroll reveal animation failed.', err);
  }
}

/**
 * Hero Banner Scroll zoom, blur and text slide-up animation.
 * Uses clean and performant parallax zoom + blur + text lift (NO fade-out, NO sticky layout shifts).
 */
export function initHeroScrollZoom(): void {
  try {
    // Select all relative containers that have overflow-hidden and height classes
    const bannerContainers = Array.from(document.querySelectorAll('section, div')).filter(el => {
      const className = el.className;
      return className.includes('relative') && 
             className.includes('overflow-hidden') && 
             (className.includes('h-[') || className.includes('h-[100vh]')) &&
             !className.includes('admin-'); // ignore admin panel segments
    });

    bannerContainers.forEach(container => {
      // 1. Zoom and Blur background image on scroll
      const bgImg = container.querySelector('div[style*="background-image"], img.object-cover, .hero-banner-image') as HTMLElement | null;
      if (bgImg) {
        bgImg.style.willChange = 'transform, filter';
        scroll((progress: number) => {
          const scale = 1 + progress * 0.25; // Scales from 1.0 up to 1.25
          const blurVal = progress * 10; // Blurs from 0px up to 10px
          bgImg.style.transform = `scale(${scale})`;
          bgImg.style.filter = `blur(${blurVal}px)`;
        }, {
          target: container as HTMLElement,
          offset: ["start start", "end start"]
        });
      }

      // 2. Slide up the text content on scroll
      const textContainer = container.querySelector('.hero-banner-content, div.relative.w-full, div.relative.z-10') as HTMLElement | null;
      if (textContainer) {
        textContainer.style.willChange = 'transform';
        scroll((progress: number) => {
          const textY = -progress * 90; // Slides text up by 90px on scroll
          textContainer.style.transform = `translateY(${textY}px)`;
        }, {
          target: container as HTMLElement,
          offset: ["start start", "end start"]
        });
      }
    });
  } catch (err) {
    console.error('[Motion API Error] Hero scroll animation failed.', err);
  }
}

/**
 * Page-specific animations for the User Home Page.
 */
export function initHomePageAnimations(): void {
  try {
    // 1. Hero banner animation (Runs immediately on load)
    animate(".hero-subtitle" as any, { opacity: [0, 1], y: [20, 0] } as any, { duration: 0.8, ease: "easeOut" } as any);
    animate(".hero-title" as any, { opacity: [0, 1], y: [35, 0] } as any, { duration: 1, delay: 0.15, ease: "easeOut" } as any);
    animate(".hero-description" as any, { opacity: [0, 1], y: [20, 0] } as any, { duration: 0.8, delay: 0.35, ease: "easeOut" } as any);
    animate(".hero-cta" as any, { opacity: [0, 1], y: [15, 0] } as any, { duration: 0.7, delay: 0.5, ease: "easeOut" } as any);

    // 2. Categories animations
    inView(".category-title-section", (element) => {
      animate(element as any, { opacity: [0, 1], y: [30, 0] } as any, { duration: 0.8, ease: "easeOut" } as any);
    });

    inView("[data-category-card]", (element) => {
      animate(element as any, { opacity: [0, 1], y: [25, 0] } as any, { duration: 0.7, ease: "easeOut" } as any);
    });

    // 3. New Arrivals magazine grid
    inView(".new-arrivals-title", (element) => {
      animate(element as any, { opacity: [0, 1], y: [30, 0] } as any, { duration: 0.8, ease: "easeOut" } as any);
    });

    inView("[data-new-arrival-item]", (element) => {
      animate(element as any, { opacity: [0, 1], y: [35, 0] } as any, { duration: 0.8, ease: "easeOut" } as any);
    });

    // 4. Best sellers title and grid cards
    inView(".best-sellers-title-section", (element) => {
      animate(element as any, { opacity: [0, 1], y: [30, 0] } as any, { duration: 0.8, ease: "easeOut" } as any);
    });

    inView(".best-sellers-card", (element) => {
      animate(element as any, { opacity: [0, 1], y: [30, 0] } as any, { duration: 0.7, ease: "easeOut" } as any);
    });
  } catch (err) {
    console.error('[Motion API Error] Home page animations failed.', err);
  }
}

/**
 * Free scroll carousel with inertia drag-to-scroll momentum.
 */
export function initFreeScrollCarousel(): void {
  try {
    const slider = document.querySelector('.free-scroll-carousel') as HTMLElement | null;
    if (!slider || slider.children.length === 0) return;
    const carousel = slider; // narrowed as non-null HTMLElement

    // Calculate copy width for seamless looping
    const totalChildren = carousel.children.length;
    const originalCount = Math.floor(totalChildren / 2);
    
    const getSingleCopyWidth = (): number => {
      const repeatedItem = carousel.children[originalCount] as HTMLElement | null;
      return repeatedItem 
        ? repeatedItem.offsetLeft - (carousel.firstElementChild as HTMLElement).offsetLeft
        : carousel.scrollWidth / 2;
    };

    let isDown = false;
    let startX: number;
    let scrollLeft: number;
    let velX = 0;
    let momentumID: number;
    const autoScrollSpeed = 0.5; // Slow smooth slide: 0.5px per frame

    // Loop adjustment logic
    const handleLoop = () => {
      const copyWidth = getSingleCopyWidth();
      if (carousel.scrollLeft >= copyWidth) {
        carousel.scrollLeft -= copyWidth;
      } else if (carousel.scrollLeft <= 0) {
        carousel.scrollLeft += copyWidth;
      }
    };

    carousel.addEventListener('mousedown', (e) => {
      isDown = true;
      carousel.classList.add('active');
      startX = e.pageX - carousel.offsetLeft;
      scrollLeft = carousel.scrollLeft;
      cancelAnimationFrame(momentumID);
    });

    carousel.addEventListener('mouseleave', () => {
      isDown = false;
      carousel.classList.remove('active');
      beginPhysicsLoop();
    });

    carousel.addEventListener('mouseup', () => {
      isDown = false;
      carousel.classList.remove('active');
      beginPhysicsLoop();
    });

    carousel.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - carousel.offsetLeft;
      const walk = (x - startX) * 1.5;
      const prevScrollLeft = carousel.scrollLeft;
      carousel.scrollLeft = scrollLeft - walk;
      velX = carousel.scrollLeft - prevScrollLeft;
      handleLoop();
    });

    // Prevent default browser image/link ghost drag behavior
    carousel.addEventListener('dragstart', (e) => {
      e.preventDefault();
    });

    function beginPhysicsLoop() {
      cancelAnimationFrame(momentumID);
      momentumID = requestAnimationFrame(updatePhysics);
    }

    function updatePhysics() {
      if (isDown) return;

      if (Math.abs(velX) > 0.5) {
        // Friction momentum deceleration
        carousel.scrollLeft += velX;
        velX *= 0.92;
        handleLoop();
        momentumID = requestAnimationFrame(updatePhysics);
      } else {
        // Slow passive auto-scrolling marquee
        carousel.scrollLeft += autoScrollSpeed;
        handleLoop();
        momentumID = requestAnimationFrame(updatePhysics);
      }
    }

    // Start auto-scrolling loop
    beginPhysicsLoop();

    // Prevent navigation click while dragging
    const links = carousel.querySelectorAll('a');
    links.forEach(link => {
      let preventClick = false;
      link.addEventListener('click', (e) => {
        if (preventClick) {
          e.preventDefault();
        }
      });

      carousel.addEventListener('mousemove', () => {
        if (isDown) {
          preventClick = true;
        }
      });

      carousel.addEventListener('mousedown', () => {
        preventClick = false;
      });
    });
  } catch (err) {
    console.error('[Carousel Error]', err);
  }
}
