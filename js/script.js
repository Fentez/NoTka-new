document.addEventListener("layoutRendered", () => {
  const html = document.documentElement;
  const themeBtn = document.getElementById("theme-toggle");
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");
  const navbar = document.getElementById("navbar");
  const backToTopBtn = document.getElementById("back-to-top");

  if (themeBtn) {
    const themeIcon = themeBtn.querySelector("i");

    function applyTheme(isDark) {
      if (isDark) {
        html.setAttribute("data-theme", "dark");
        themeIcon.classList.replace("fa-moon", "fa-sun");
        localStorage.setItem("theme", "dark");
      } else {
        html.removeAttribute("data-theme");
        themeIcon.classList.replace("fa-sun", "fa-moon");
        localStorage.setItem("theme", "light");
      }
    }

    if (html.getAttribute("data-theme") === "dark") {
      themeIcon.classList.replace("fa-moon", "fa-sun");
    }

    themeBtn.addEventListener("click", () => {
      themeIcon.style.transform = "rotate(180deg) scale(0.5)";
      themeIcon.style.opacity = "0";

      setTimeout(() => {
        const isCurrentDark = html.getAttribute("data-theme") === "dark";
        applyTheme(!isCurrentDark);
        themeIcon.style.transform = "rotate(0deg) scale(1)";
        themeIcon.style.opacity = "1";
      }, 150);
    });
  }

  if (mobileMenuBtn && mobileMenu) {
    const menuIcon = mobileMenuBtn.querySelector("i");

    const toggleMenu = (isOpen) => {
      mobileMenu.classList.toggle("active", isOpen);
      if (mobileMenu.classList.contains("active")) {
        menuIcon.classList.replace("fa-bars", "fa-xmark");
        document.body.style.overflow = "hidden";
      } else {
        menuIcon.classList.replace("fa-xmark", "fa-bars");
        document.body.style.overflow = "";
      }
    };

    mobileMenuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleMenu();
    });

    document.addEventListener("click", (e) => {
      const isLink = e.target.classList.contains("mobile-link");
      const isOutside =
        !mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target);

      if (isLink || isOutside) {
        toggleMenu(false);
      }
    });
  }

  if (navbar && backToTopBtn) {
    let lastScrollY = window.scrollY;
    window.addEventListener(
      "scroll",
      () => {
        const currentScrollY = window.scrollY;

        if (currentScrollY > 50) {
          navbar.classList.toggle("hidden", currentScrollY > lastScrollY);
        } else {
          navbar.classList.remove("hidden");
        }

        backToTopBtn.classList.toggle("visible", currentScrollY > 300);
        lastScrollY = currentScrollY;
      },
      { passive: true },
    );

    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const words = ["Ванільний", "Український", "Креативний", "Затишний"];
  const typingSpan = document.querySelector(".typing-text");

  if (typingSpan) {
    let wordIndex = 0,
      charIndex = 0,
      isDeleting = false;
    function type() {
      const currentWord = words[wordIndex];
      const shouldDelete = isDeleting;
      typingSpan.textContent = currentWord.substring(
        0,
        shouldDelete ? charIndex - 1 : charIndex + 1,
      );
      charIndex = shouldDelete ? charIndex - 1 : charIndex + 1;
      let typeSpeed = shouldDelete ? 50 : 150;
      if (!shouldDelete && charIndex === currentWord.length) {
        isDeleting = true;
        typeSpeed = 2000;
      } else if (shouldDelete && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        typeSpeed = 500;
      }
      setTimeout(type, typeSpeed);
    }
    type();
  }

  const iconContainer = document.getElementById("floating-icons-container");
  if (iconContainer) {
    const icons = [
      "fa-sun",
      "fa-cloud",
      "fa-heart",
      "fa-star",
      "fa-feather",
      "fa-bolt",
      "fa-moon",
      "fa-snowflake",
      "fa-fire",
      "fa-leaf",
      "fa-ghost",
      "fa-dragon",
    ];
    iconContainer.innerHTML = "";
    for (let i = 0; i < 15; i++) {
      const div = document.createElement("div");
      div.classList.add("icon-container");
      div.innerHTML = `<i class="fa-solid ${icons[Math.floor(Math.random() * icons.length)]}"></i>`;
      const size = Math.random() * 30 + 20;
      const duration = Math.random() * 20 + 25;
      Object.assign(div.style, {
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${size * 0.8}px`,
        left: `${(100 / 15) * i + Math.random() * 5}%`,
        animationDuration: `${duration}s`,
        animationDelay: `-${Math.random() * duration}s`,
        opacity: Math.random() * 0.3 + 0.1,
      });
      iconContainer.appendChild(div);
    }
  }

  const heroImg = document.getElementById("hero-img");
  if (heroImg) {
    let mouseX = 0,
      mouseY = 0;
    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function animateParallax() {
      const x = (mouseX - window.innerWidth / 2) / 30;
      const y = (mouseY - window.innerHeight / 2) / 30;
      heroImg.style.transform = `translate(${x}px, ${y}px)`;
      requestAnimationFrame(animateParallax);
    }
    animateParallax();
  }

  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
      card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
    });
  });

  const mainImg = document.getElementById("gallery-main");
  const thumbs = document.querySelectorAll(".thumb");
  if (mainImg && thumbs.length > 0) {
    let currentIndex = 0;
    function updateGallery(index) {
      mainImg.style.opacity = "0.5";
      setTimeout(() => {
        mainImg.src = thumbs[index].getAttribute("data-src");
        mainImg.style.opacity = "1";
      }, 200);
      thumbs.forEach((t) => t.classList.remove("active"));
      thumbs[index].classList.add("active");
      currentIndex = index;
    }
    document
      .querySelector(".gallery-btn.prev")
      ?.addEventListener("click", () =>
        updateGallery((currentIndex - 1 + thumbs.length) % thumbs.length),
      );
    document
      .querySelector(".gallery-btn.next")
      ?.addEventListener("click", () =>
        updateGallery((currentIndex + 1) % thumbs.length),
      );
    thumbs.forEach((thumb, i) =>
      thumb.addEventListener("click", () => updateGallery(i)),
    );
  }

  document.querySelectorAll(".faq-item").forEach((item) => {
    item.querySelector(".faq-question").addEventListener("click", () => {
      const isActive = item.classList.contains("active");
      document.querySelectorAll(".faq-item").forEach((el) => {
        el.classList.remove("active");
        el.querySelector(".faq-answer").style.maxHeight = null;
      });
      if (!isActive) {
        item.classList.add("active");
        const ans = item.querySelector(".faq-answer");
        ans.style.maxHeight = ans.scrollHeight + "px";
      }
    });
  });

  const serverIp = "mc.notka.pp.ua";
  const playerCountElem = document.getElementById("player-count");
  const playerListElem = document.getElementById("player-list");

  if (playerCountElem) {
    async function fetchServerData() {
      if (document.hidden) return;

      try {
        const res = await fetch(`https://api.mcsrvstat.us/2/${serverIp}`);
        const data = await res.json();
        if (data.online) {
          playerCountElem.textContent = `${data.players.online} / ${data.players.max}`;
          playerListElem.innerHTML =
            data.players.list
              ?.map(
                (p) =>
                  `<a href="players/profile#${p}" class="player-row tooltip-player-link">
                     <img src="https://mc-heads.net/avatar/${p}/24" class="player-head">
                     <span class="player-name">${p}</span>
                   </a>`,
              )
              .join("") ||
            '<span class="tooltip-empty">Тут нікого немає :(</span>';
        } else {
          playerCountElem.textContent = "Офлайн";
          playerListElem.innerHTML =
            '<span class="tooltip-error">Сервер вимкнено</span>';
        }
      } catch {
        playerCountElem.textContent = "Помилка";
      }
    }

    fetchServerData();
    setInterval(fetchServerData, 60000);
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("active");
      });
    },
    { threshold: 0.15 },
  );
  document
    .querySelectorAll(".reveal")
    .forEach((el) => revealObserver.observe(el));
});
