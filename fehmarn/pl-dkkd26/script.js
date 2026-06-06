document.addEventListener("DOMContentLoaded", () => {
  const roundConfig = {
    runde1: { password: "DARKSIDE", label: "Runde 1" },
    runde2: { password: "INSELHOTEL", label: "Runde 2" },
    runde3: { password: "OSTSEESTURM", label: "Runde 3" },
  };

  const storagePrefix = "krimi:peter-lehmann:";
  const pageRound = document.body.dataset.round
    ? `runde${document.body.dataset.round}`
    : null;
  const revealItems = document.querySelectorAll("[data-reveal]");
  const protectedLinks = document.querySelectorAll("[data-protected-link]");
  const accessModal = createAccessModal();

  function getStorageKey(roundKey) {
    return `${storagePrefix}${roundKey}:unlocked`;
  }

  function isUnlocked(roundKey) {
    return window.sessionStorage.getItem(getStorageKey(roundKey)) === "true";
  }

  function unlockRound(roundKey) {
    window.sessionStorage.setItem(getStorageKey(roundKey), "true");
  }

  function revealProtectedPage() {
    document.body.classList.remove("locked-view");
  }

  function normalizePassword(value) {
    return value.trim().toUpperCase();
  }

  function openAccessModal(roundKey, onSuccess) {
    const round = roundConfig[roundKey];
    if (!round) return;

    const title = accessModal.querySelector("[data-access-title]");
    const hint = accessModal.querySelector("[data-access-hint]");
    const form = accessModal.querySelector("[data-access-form]");
    const input = accessModal.querySelector("[data-access-input]");
    const error = accessModal.querySelector("[data-access-error]");
    const cancelButton = accessModal.querySelector("[data-access-cancel]");

    title.textContent = `${round.label} freischalten`;
    hint.textContent = `Gib das Passwort für ${round.label} ein, um diese Spielphase zu öffnen. Du erhälst es von deinem Moderator, sobald die Runde startet.`;
    error.textContent = "";
    input.value = "";
    accessModal.hidden = false;

    cancelButton.hidden = pageRound === roundKey;
    cancelButton.onclick = () => { accessModal.hidden = true; };

    form.onsubmit = (event) => {
      event.preventDefault();
      if (normalizePassword(input.value) === normalizePassword(round.password)) {
        unlockRound(roundKey);
        accessModal.hidden = true;
        error.textContent = "";
        if (typeof onSuccess === "function") onSuccess();
        if (pageRound === roundKey) revealProtectedPage();
        return;
      }
      error.textContent = "Passwort falsch. Bitte prüfe deine Eingabe.";
      input.focus();
      input.select();
    };

    window.requestAnimationFrame(() => input.focus());
  }

  protectedLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const roundKey = link.dataset.protectedLink;
      if (!roundKey || isUnlocked(roundKey)) return;
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
      { threshold: 0.05, rootMargin: "0px 0px 120px 0px" }
    );
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  const root = document.documentElement;
  window.addEventListener("pointermove", (event) => {
    const x = `${Math.round((event.clientX / window.innerWidth) * 100)}%`;
    const y = `${Math.round((event.clientY / window.innerHeight) * 100)}%`;
    root.style.setProperty("--pointer-x", x);
    root.style.setProperty("--pointer-y", y);
  });

  // Beziehungs-Karussell: Pfeil-Buttons
  const relTrack = document.getElementById("relationsTrack");
  const arrowLeft = document.getElementById("arrowLeft");
  const arrowRight = document.getElementById("arrowRight");

  if (relTrack && arrowLeft && arrowRight) {
    const STEP = 210;

    function updateArrows() {
      arrowLeft.disabled = relTrack.scrollLeft <= 2;
      arrowRight.disabled = relTrack.scrollLeft >= relTrack.scrollWidth - relTrack.clientWidth - 2;
    }

    arrowLeft.addEventListener("click", () => relTrack.scrollBy({ left: -STEP, behavior: "smooth" }));
    arrowRight.addEventListener("click", () => relTrack.scrollBy({ left: STEP, behavior: "smooth" }));
    relTrack.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    updateArrows();
  }

  function createAccessModal() {
    const modal = document.createElement("div");
    modal.className = "access-modal";
    modal.hidden = true;
    modal.innerHTML = `
      <div class="access-card" role="dialog" aria-modal="true" aria-labelledby="access-title">
        <p class="eyebrow">Zugang geschützt</p>
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
});
