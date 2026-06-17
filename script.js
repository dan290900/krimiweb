document.addEventListener("DOMContentLoaded", () => {
  const roundConfig = {
    runde1: { password: "FEHMARN", label: "Runde 1" },
    runde2: { password: "OSTSEE", label: "Runde 2" },
    runde3: { password: "STRAND", label: "Runde 3" },
  };

  const storagePrefix = "krimi:sophie-mey:";
  const pageRound = document.body.dataset.round
    ? `runde${document.body.dataset.round}`
    : null;
  const revealItems = document.querySelectorAll("[data-reveal]");
  const protectedLinks = document.querySelectorAll("[data-protected-link]");
  const revealVariants = ["reveal-left", "reveal-right", "reveal-pop", "reveal-drop"];
  const productFilter = document.querySelector("[data-product-filter]");
  const productCards = document.querySelectorAll("[data-product-card]");

  function getStorageKey(roundKey) {
    return `${storagePrefix}${roundKey}:unlocked`;
  }

  function isUnlocked(roundKey) {
    return window.localStorage.getItem(getStorageKey(roundKey)) === "true";
  }

  function unlockRound(roundKey) {
    window.localStorage.setItem(getStorageKey(roundKey), "true");
  }

  function revealProtectedPage() {
    document.body.classList.remove("locked-view");
  }

  function normalizePassword(value) {
    return value.trim().toUpperCase();
  }

  function createAccessModal() {
    const modal = document.createElement("div");
    modal.className = "access-modal";
    modal.hidden = true;
    modal.innerHTML = `
      <div class="access-card" role="dialog" aria-modal="true" aria-labelledby="access-title">
        <p class="eyebrow">Zugang geschuetzt</p>
        <h2 id="access-title" data-access-title>Runde freischalten</h2>
        <p data-access-hint></p>
        <form class="access-form" data-access-form>
          <label class="access-label" for="access-password">
            Passwort
            <input
              id="access-password"
              class="access-input"
              data-access-input
              type="password"
              inputmode="text"
              autocomplete="off"
              spellcheck="false"
            />
          </label>
          <p class="access-error" data-access-error aria-live="polite"></p>
          <div class="access-actions">
            <button class="button button-primary" type="submit">Freischalten</button>
            <button class="button button-ghost" type="button" data-access-cancel>Abbrechen</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);
    return modal;
  }

  const accessModal = protectedLinks.length || pageRound ? createAccessModal() : null;

  function openAccessModal(roundKey, onSuccess) {
    const round = roundConfig[roundKey];
    if (!round || !accessModal) {
      return;
    }

    const title = accessModal.querySelector("[data-access-title]");
    const hint = accessModal.querySelector("[data-access-hint]");
    const form = accessModal.querySelector("[data-access-form]");
    const input = accessModal.querySelector("[data-access-input]");
    const error = accessModal.querySelector("[data-access-error]");
    const cancelButton = accessModal.querySelector("[data-access-cancel]");

    title.textContent = `${round.label} freischalten`;
    hint.textContent = `Gib das Passwort fuer ${round.label} ein, um diese Spielphase zu oeffnen.`;
    error.textContent = "";
    input.value = "";
    accessModal.hidden = false;

    cancelButton.hidden = pageRound === roundKey;
    cancelButton.onclick = () => {
      accessModal.hidden = true;
    };

    form.onsubmit = (event) => {
      event.preventDefault();

      if (normalizePassword(input.value) === round.password) {
        unlockRound(roundKey);
        accessModal.hidden = true;
        error.textContent = "";

        if (typeof onSuccess === "function") {
          onSuccess();
        }

        if (pageRound === roundKey) {
          revealProtectedPage();
        }

        return;
      }

      error.textContent = "Passwort falsch. Bitte pruefe deine Eingabe.";
      input.focus();
      input.select();
    };

    window.requestAnimationFrame(() => input.focus());
  }

  protectedLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const roundKey = link.dataset.protectedLink;

      if (!roundKey || isUnlocked(roundKey)) {
        return;
      }

      event.preventDefault();
      openAccessModal(roundKey, () => {
        window.location.href = link.getAttribute("href");
      });
    });
  });

  if (pageRound) {
    if (isUnlocked(pageRound)) {
      revealProtectedPage();
    } else {
      openAccessModal(pageRound, revealProtectedPage);
    }
  }

  revealItems.forEach((item, index) => {
    const delay = Math.min((index % 8) * 85, 420);
    item.style.setProperty("--reveal-delay", `${delay}ms`);

    if (!item.classList.contains("hero-home")) {
      item.classList.add(revealVariants[index % revealVariants.length]);
    }
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

  const root = document.documentElement;
  window.addEventListener("pointermove", (event) => {
    const xPercent = Math.round((event.clientX / window.innerWidth) * 100);
    const yPercent = Math.round((event.clientY / window.innerHeight) * 100);
    const floatX = `${(50 - xPercent) * 0.16}px`;
    const floatY = `${(50 - yPercent) * 0.12}px`;

    root.style.setProperty("--pointer-x", `${xPercent}%`);
    root.style.setProperty("--pointer-y", `${yPercent}%`);
    root.style.setProperty("--float-x", floatX);
    root.style.setProperty("--float-y", floatY);
  });

  const contactForm = document.querySelector("[data-contact-form]");
  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const formData = new FormData(contactForm);
      const subject = encodeURIComponent("Kontaktanfrage Darkside Games");
      const lines = [
        `Name: ${formData.get("name") || ""}`,
        `E-Mail: ${formData.get("email") || ""}`,
        `Anfrage: ${formData.get("topic") || ""}`,
        `Betreff: ${formData.get("inquirySubject") || ""}`,
        "",
        "Nachricht:",
        formData.get("message") || "",
      ];
      const body = encodeURIComponent(lines.join("\n"));

      window.location.href = `mailto:kd.digitalproduction@gmail.com?subject=${subject}&body=${body}`;
    });
  }

  if (productFilter && productCards.length) {
    const typeButtons = productFilter.querySelectorAll("[data-filter-type]");
    const playerSelect = productFilter.querySelector("[data-filter-players]");

    function matchesPlayers(card, value) {
      const min = Number(card.dataset.playersMin);
      const max = Number(card.dataset.playersMax);

      if (value === "small") {
        return min <= 6;
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
  }
});
