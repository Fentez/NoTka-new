const siteConfig = {
  links: [
    { text: "Головна", href: "/" },
    { text: "Вікі", href: "https://wiki.notka.pp.ua/", target: "_blank" },
    { text: "Гравці", href: "/players" },
    { text: "Правила", href: "../rules" },
    { text: "Мапа", href: "https://map.notka.pp.ua/", target: "_blank" },
  ],
  socials: {
    discord: "https://discord.gg/y4vEfn7qS9",
    tiktok: "https://www.tiktok.com/@nottkaua",
  },
};

function isActive(href) {
  const currentPath = window.location.pathname
    .replace("/index.html", "/")
    .replace(/\/$/, "");
  const linkPath = href.replace("/index.html", "/").replace(/\/$/, "");
  if (linkPath === "") return currentPath === "" || currentPath === "/";
  return currentPath === linkPath;
}

function renderNavbar() {
  const navbar = document.getElementById("navbar");
  const mobileMenu = document.getElementById("mobile-menu");

  if (!navbar || !mobileMenu) return;

  const navLinksHTML = siteConfig.links
    .map((link) => {
      const activeClass = isActive(link.href) ? "active" : "";
      const targetAttr = link.target ? `target="${link.target}"` : "";
      return `<li><a href="${link.href}" class="${activeClass}" ${targetAttr}>${link.text}</a></li>`;
    })
    .join("");

  const mobileLinksHTML = siteConfig.links
    .map((link) => {
      const targetAttr = link.target ? `target="${link.target}"` : "";
      return `<a href="${link.href}" class="mobile-link" ${targetAttr}>${link.text}</a>`;
    })
    .join("");

  navbar.innerHTML = `
      <a href="${siteConfig.socials.discord}" target="_blank" class="discord-icon mobile-only">
        <i class="fa-brands fa-discord"></i>
      </a>
      <div class="nav-left">
        <a href="/" class="logo"><img src="/img/logo.webp" alt="Logo" /></a>
        <ul class="nav-links">${navLinksHTML}</ul>
      </div>
      <div class="nav-right">
        <a href="${siteConfig.socials.discord}" target="_blank" class="discord-icon desktop-only">
          <i class="fa-brands fa-discord"></i>
        </a>
        <button id="theme-toggle"><i class="fa-solid fa-moon"></i></button>
        <button id="mobile-menu-btn"><i class="fa-solid fa-bars"></i></button>
      </div>
  `;

  mobileMenu.innerHTML = mobileLinksHTML;
}

function renderFooter() {
  const footer = document.querySelector("footer");
  if (!footer) return;

  const currentYear = new Date().getFullYear();
  const footerNavHTML = siteConfig.links
    .map(
      (link) =>
        `<a href="${link.href}" ${link.target ? `target="${link.target}"` : ""}>${link.text}</a>`,
    )
    .join("");

  footer.innerHTML = `
      <div class="footer-content">
        <div class="footer-col"><h4>Навігація</h4>${footerNavHTML}</div>
        <div class="footer-col">
          <h4>Спільнота</h4>
          <a href="${siteConfig.socials.discord}" target="_blank">Discord</a>
          <a href="${siteConfig.socials.tiktok}" target="_blank">TikTok</a>
        </div>
        <div class="footer-col">
          <h4>Моніторинги</h4>
          <a href="https://allmc.in.ua/mc-notka-pp-ua" target="_blank">allmc</a>
          <a href="https://monicore.com.ua/server/372/notka-vanilla" target="_blank">monicore</a>
          <a href="https://disflip.com/guild/1226603339240964256" target="_blank">disflip</a>
        </div>
      </div>
      <div class="footer-bottom">
        <div class="footer-left">
          <p>© 2025-${currentYear} notka.pp.ua v1.2.5</p>
          <p>СЕРВЕР НЕ ПОВ'ЯЗАНИЙ З MOJANG АБО MICROSOFT.</p>
        </div>
        <div class="footer-right">
          <a href="#">Користувацтка угода</a>
          <a href="#">Політика конфіденційності</a>
        </div>
      </div>
  `;
}

function renderBackToTop() {
  if (document.getElementById("back-to-top")) return;

  const btn = document.createElement("button");
  btn.id = "back-to-top";
  btn.title = "Вгору";
  btn.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';

  document.body.appendChild(btn);
}

document.addEventListener("DOMContentLoaded", () => {
  renderNavbar();
  renderFooter();
  renderBackToTop();

  document.dispatchEvent(new Event("layoutRendered"));
});

