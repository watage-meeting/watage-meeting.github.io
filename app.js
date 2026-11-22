(() => {
  "use strict";

  // Navigation and mobile header behavior.
  function initNavigation() {
    const menu = document.querySelector(".menu");
    const nav = document.querySelector(".navlinks");
    const header = document.querySelector(".header");
    const mobileQuery = window.matchMedia("(max-width: 650px)");

    menu?.addEventListener("click", () => {
      const isOpen = nav?.classList.toggle("open") ?? false;
      menu.classList.toggle("is-open", isOpen);
      menu.setAttribute("aria-expanded", String(isOpen));
      menu.setAttribute("aria-label", isOpen ? "メニューを閉じる" : "メニュー");
      header?.classList.remove("is-hidden");
    });

    nav?.querySelectorAll("a").forEach((link) =>
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        menu?.classList.remove("is-open");
        menu?.setAttribute("aria-expanded", "false");
        menu?.setAttribute("aria-label", "メニュー");
      }),
    );

    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateHeaderOnScroll = () => {
      const currentY = window.scrollY;
      const menuOpen = nav?.classList.contains("open");
      const isMobile = mobileQuery.matches;

      if (!isMobile) {
        header?.classList.remove("is-hidden", "is-scrolled");
        lastScrollY = currentY;
        ticking = false;
        return;
      }

      if (currentY > 12) {
        header?.classList.add("is-scrolled");
      } else {
        header?.classList.remove("is-scrolled");
      }

      if (menuOpen || currentY < 48) {
        header?.classList.remove("is-hidden");
      } else if (currentY > lastScrollY + 6) {
        header?.classList.add("is-hidden");
      } else if (currentY < lastScrollY - 6) {
        header?.classList.remove("is-hidden");
      }

      lastScrollY = currentY;
      ticking = false;
    };

    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(updateHeaderOnScroll);
      },
      { passive: true },
    );
  }

  // Reveal blocks as they approach the viewport, without a separate fast observer.
  function initScrollReveals() {
    const elements = document.querySelectorAll(".reveal");
    if (!elements.length) return;
  
    // Always show content when observation is unavailable or motion is reduced.
    if (!("IntersectionObserver" in window) ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      elements.forEach((el) => el.classList.add("visible"));
      return;
    }
  
    const observer = new IntersectionObserver(
      (entries, observerInstance) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          observerInstance.unobserve(entry.target);
        });
      },
      { threshold: 0.01, rootMargin: "100px 0px 0px 0px" },
    );
    elements.forEach((el) => observer.observe(el));
  }

  // Duplicate the cards once and pause the animation when not visible.
  function initActivityMarquee() {
    const carousel = document.querySelector(".activity-marquee");
    const track = carousel?.querySelector(".activity-marquee-track");
    if (!track) return;
  
    const originalSlides = Array.from(track.children).filter((el) =>
      el.matches(".activity-slide"),
    );
    if (!originalSlides.length) return;
  
    // Reduced-motion users can swipe the four original cards instead.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  
    // Duplicate slides at runtime instead of maintaining duplicate HTML.
    // Images share the same URLs, so the browser can reuse their cached files.
    const repeats = document.createDocumentFragment();
    originalSlides.forEach((slide) => {
      const duplicate = slide.cloneNode(true);
      duplicate.setAttribute("aria-hidden", "true");
      duplicate.querySelectorAll("img").forEach((image) => {
        image.loading = "eager";
      });
      repeats.appendChild(duplicate);
    });
    track.appendChild(repeats);
  
    let inViewport = false;
    const updateAnimation = () => {
      carousel.classList.toggle(
        "is-active",
        inViewport && document.visibilityState === "visible",
      );
    };
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          inViewport = entries[0]?.isIntersecting ?? false;
          updateAnimation();
        },
        { threshold: 0.01, rootMargin: "70px 0px 70px 0px" },
      );
      observer.observe(carousel);
    } else {
      inViewport = true;
      updateAnimation();
    }
    document.addEventListener("visibilitychange", updateAnimation);
    // Safari can restore a page from the back/forward cache without scrolling.
    window.addEventListener("pageshow", () => {
      const bounds = carousel.getBoundingClientRect();
      inViewport = bounds.bottom >= -70 && bounds.top <= window.innerHeight + 70;
      updateAnimation();
    });
  }

  function initNewsPagination() {
    document.querySelector(".more")?.addEventListener("click", (event) => {
      document
        .querySelectorAll(".news-row.hidden")
        .forEach((row) => row.classList.remove("hidden"));
      event.currentTarget.remove();
    });
  }

  function initBrandEffect() {
    const desktopHover = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!desktopHover.matches) return;
    document.querySelectorAll(".brand").forEach((brand) =>
      brand.addEventListener("mouseenter", (event) => {
        for (let i = 0; i < 6; i++) {
          const seed = document.createElement("span");
          seed.className = "seed-fly";
          seed.textContent = "✦";
          seed.style.left = `${event.clientX}px`;
          seed.style.top = `${event.clientY}px`;
          seed.style.setProperty("--x", `${Math.random() * 120 - 60}px`);
          seed.style.setProperty("--y", `${-40 - Math.random() * 100}px`);
          document.body.appendChild(seed);
          setTimeout(() => seed.remove(), 1300);
        }
      }),
    );
  }

  function initFlyerModal() {
    const flyerModal = document.querySelector("#flyerModal");
    if (!flyerModal) return;
    const flyerImage = flyerModal?.querySelector(".flyer-modal-image");
    const flyerCaption = flyerModal?.querySelector(".flyer-modal-caption");
    const flyerClose = flyerModal?.querySelector(".flyer-modal-close");
    const flyerPrev = flyerModal?.querySelector(".flyer-modal-prev");
    const flyerNext = flyerModal?.querySelector(".flyer-modal-next");
    const flyerItems = [
      {
        src: "assets/manabi-no-tsudoi-vol1-front.png",
        alt: "まなびのつどい vol.1 共感 チラシ表面",
        label: "チラシ表面",
      },
      {
        src: "assets/manabi-no-tsudoi-vol1-program.png",
        alt: "まなびのつどい vol.1 共感 プログラム",
        label: "裏面・プログラム",
      },
    ];

    let currentFlyerIndex = 0;
    let flyerTrigger = null;

    const renderFlyer = () => {
      const flyer = flyerItems[currentFlyerIndex];
      if (!flyer || !flyerImage || !flyerCaption) return;

      flyerImage.src = flyer.src;
      flyerImage.alt = flyer.alt;
      flyerCaption.textContent = `${currentFlyerIndex + 1} / ${flyerItems.length}　${flyer.label}`;
    };

    const openFlyerModal = (index, trigger) => {
      if (!flyerModal) return;

      currentFlyerIndex = index;
      flyerTrigger = trigger;
      renderFlyer();
      flyerModal.hidden = false;
      document.body.classList.add("flyer-modal-open");
      flyerClose?.focus();
    };

    const closeFlyerModal = () => {
      if (!flyerModal) return;

      flyerModal.hidden = true;
      document.body.classList.remove("flyer-modal-open");
      flyerTrigger?.focus();
    };

    const changeFlyer = (direction) => {
      currentFlyerIndex =
        (currentFlyerIndex + direction + flyerItems.length) % flyerItems.length;
      renderFlyer();
    };

    const flyerPoster = document.querySelector(".event-poster-button");
    const flyerPosterImage = flyerPoster?.querySelector("img");
    const flyerPreviewButtons = document.querySelectorAll(
      "[data-flyer-preview-index]",
    );

    const previewFlyer = (index) => {
      const flyer = flyerItems[index];
      if (!flyer || !flyerPoster || !flyerPosterImage) return;

      flyerPoster.dataset.flyerIndex = String(index);
      flyerPoster.setAttribute("aria-label", `${flyer.label}を拡大表示`);
      flyerPosterImage.src = flyer.src;
      flyerPosterImage.alt = flyer.alt;

      flyerPreviewButtons.forEach((button) => {
        const isActive = Number(button.dataset.flyerPreviewIndex) === index;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
      });
    };

    flyerPreviewButtons.forEach((button) => {
      button.addEventListener("click", () => {
        previewFlyer(Number(button.dataset.flyerPreviewIndex));
      });
    });

    document.querySelectorAll("[data-flyer-index]").forEach((button) => {
      button.addEventListener("click", () => {
        openFlyerModal(Number(button.dataset.flyerIndex), button);
      });
    });

    flyerClose?.addEventListener("click", closeFlyerModal);
    flyerPrev?.addEventListener("click", () => changeFlyer(-1));
    flyerNext?.addEventListener("click", () => changeFlyer(1));

    flyerModal?.addEventListener("click", (event) => {
      if (event.target === flyerModal) closeFlyerModal();
    });

    document.addEventListener("keydown", (event) => {
      if (!flyerModal || flyerModal.hidden) return;

      if (event.key === "Escape") closeFlyerModal();
      if (event.key === "ArrowLeft") changeFlyer(-1);
      if (event.key === "ArrowRight") changeFlyer(1);
    });
  }

  initNavigation();
  initScrollReveals();
  initActivityMarquee();
  initNewsPagination();
  initBrandEffect();
  initFlyerModal();
})();
