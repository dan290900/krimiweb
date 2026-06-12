document.addEventListener("DOMContentLoaded", () => {
  const revealItems = document.querySelectorAll("[data-reveal]");
  const revealVariants = ["reveal-left", "reveal-right", "reveal-pop", "reveal-drop"];
  const productFilter = document.querySelector("[data-product-filter]");
  const productCards = document.querySelectorAll("[data-product-card]");
  const root = document.documentElement;

  revealItems.forEach((item, index) => {
    const delay = Math.min((index % 8) * 85, 420);
    item.style.setProperty("--reveal-delay", `${delay}ms`);
    item.classList.add(revealVariants[index % revealVariants.length]);
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.16,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  window.addEventListener("pointermove", (event) => {
    const xPercent = Math.round((event.clientX / window.innerWidth) * 100);
    const yPercent = Math.round((event.clientY / window.innerHeight) * 100);

    root.style.setProperty("--pointer-x", `${xPercent}%`);
    root.style.setProperty("--pointer-y", `${yPercent}%`);
  });

  const lightboxItems = document.querySelectorAll("[data-lightbox-item]");
  if (lightboxItems.length) {
    const lightbox = document.createElement("div");
    lightbox.className = "image-lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", "Bild vergrößert");
    lightbox.innerHTML = `
      <button class="image-lightbox-close" type="button" aria-label="Bild schließen">&times;</button>
      <img alt="" />
    `;
    document.body.appendChild(lightbox);

    const lightboxImage = lightbox.querySelector("img");
    const lightboxClose = lightbox.querySelector(".image-lightbox-close");

    function closeLightbox() {
      lightbox.classList.remove("is-open");
      document.body.classList.remove("lightbox-open");
    }

    function openLightbox(image) {
      lightboxImage.src = image.currentSrc || image.src;
      lightboxImage.alt = image.alt || "";
      lightbox.classList.add("is-open");
      document.body.classList.add("lightbox-open");
      lightboxClose.focus();
    }

    lightboxItems.forEach((item) => {
      item.tabIndex = 0;
      item.setAttribute("role", "button");
      item.setAttribute("aria-label", "Bild vergrößern");

      item.addEventListener("click", () => {
        const image = item.querySelector("img");
        if (image) {
          openLightbox(image);
        }
      });

      item.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          const image = item.querySelector("img");
          if (image) {
            openLightbox(image);
          }
        }
      });
    });

    lightboxClose.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && lightbox.classList.contains("is-open")) {
        closeLightbox();
      }
    });
  }

  if (!productFilter || !productCards.length) {
    return;
  }

  const typeButtons = productFilter.querySelectorAll("[data-filter-type]");
  const playerSelect = productFilter.querySelector("[data-filter-players]");

  function matchesPlayers(card, value) {
    const min = Number(card.dataset.playersMin);
    const max = Number(card.dataset.playersMax);

    if (value === "small") {
      return max <= 5;
    }

    if (value === "medium") {
      return max >= 7 && min <= 8;
    }

    if (value === "large") {
      return max >= 9;
    }

    return true;
  }

  function applyProductFilters() {
    const activeType = productFilter.querySelector(".filter-button.is-active")?.dataset.filterType || "all";
    const players = playerSelect?.value || "all";

    productCards.forEach((card) => {
      const types = (card.dataset.type || "").split(" ");
      const typeMatch = activeType === "all" || types.includes(activeType);
      const playersMatch = matchesPlayers(card, players);

      card.hidden = !(typeMatch && playersMatch);
    });
  }

  typeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      typeButtons.forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      applyProductFilters();
    });
  });

  playerSelect?.addEventListener("change", applyProductFilters);
});
