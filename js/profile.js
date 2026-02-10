document.addEventListener("DOMContentLoaded", async () => {
  const hash = window.location.hash.substring(1);
  const rawNick = hash ? decodeURIComponent(hash) : "Steve";

  document.title = `NoTka | ${rawNick}`;

  setText("bread-nick", rawNick);
  setText("error-nick", rawNick);

  const dlBtn = document.getElementById("dl-btn");
  if (dlBtn) dlBtn.href = `https://mc-heads.net/download/${rawNick}`;

  await loadPlayerData(rawNick);
});

async function loadPlayerData(nick) {
  const loader = document.getElementById("content-loader");
  const profileContent = document.getElementById("profile-content");
  const errorMessage = document.getElementById("error-message");

  try {
    const playersRes = await fetch(
      "https://map.notka.pp.ua/stats/all-players-data.json",
    );
    const playersData = await playersRes.json();

    const player = playersData.players.find(
      (p) => p.name.toLowerCase() === nick.toLowerCase(),
    );

    if (!player) {
      if (loader) loader.classList.add("hidden");
      setTimeout(() => {
        if (loader) loader.style.display = "none";
      }, 500);

      errorMessage.style.display = "block";
      profileContent.style.display = "none";
      return;
    }

    initSkinViewer(nick);

    const [regRes, onlineRes] = await Promise.all([
      fetch("registration.json").catch(() => ({})),
      fetch("https://api.mcsrvstat.us/2/mc.notka.pp.ua").catch(() => ({})),
    ]);

    let regData = {};
    try {
      regData = await regRes.json();
    } catch (e) {}

    const onlineData = await onlineRes.json();

    let isOnline = false;
    if (onlineData?.players?.list) {
      isOnline = onlineData.players.list.some(
        (p) => p.toLowerCase() === nick.toLowerCase(),
      );
    }

    fillProfileData(player, regData, isOnline);

    profileContent.style.display = "block";
    errorMessage.style.display = "none";
  } catch (error) {
    console.error("Critical Error:", error);
    errorMessage.style.display = "block";
    profileContent.style.display = "none";
    setText("error-nick", "Помилка");
  } finally {
    if (loader && !loader.classList.contains("hidden")) {
      loader.classList.add("hidden");
      setTimeout(() => {
        loader.style.display = "none";
      }, 500);
    }
  }
}

function initSkinViewer(nick) {
  const container = document.getElementById("skin_container");
  if (!container) return;

  try {
    const skinViewer = new skinview3d.SkinViewer({
      canvas: container,
      width: 280,
      height: 350,
      skin: `https://mc-heads.net/skin/${nick}`,
    });

    skinViewer.camera.position.set(35, 20, 50);
    skinViewer.zoom = 0.85;
    skinViewer.animation = new skinview3d.WalkingAnimation();
    skinViewer.animation.speed = 0.6;
    skinViewer.autoRotate = false;

    const btnWalk = document.getElementById("btn-walk");
    const btnRotate = document.getElementById("btn-rotate");
    let isWalking = true;
    let isRotating = false;

    if (btnWalk) {
      btnWalk.addEventListener("click", () => {
        isWalking = !isWalking;
        btnWalk.classList.toggle("active", isWalking);
        skinViewer.animation = isWalking
          ? new skinview3d.WalkingAnimation()
          : null;
      });
    }
    if (btnRotate) {
      btnRotate.addEventListener("click", () => {
        isRotating = !isRotating;
        btnRotate.classList.toggle("active", isRotating);
        skinViewer.autoRotate = isRotating;
      });
    }
  } catch (e) {
    console.error("Skin init error", e);
  }
}

function fillProfileData(player, regData, isOnline) {
  setText("player-nick", player.name);

  const group = player.group || "default";
  const isOwner = group === "owner" || group === "admin";
  const isSponsor = group === "sponsor" || group === "premium" || isOwner;

  const rolesContainer = document.getElementById("roles-container");
  const sponsorStar = document.getElementById("sponsor-star");
  const onlineDot = document.getElementById("online-dot");

  rolesContainer.innerHTML = "";
  if (onlineDot) onlineDot.style.display = isOnline ? "block" : "none";

  if (sponsorStar) sponsorStar.style.display = isSponsor ? "block" : "none";

  if (isOwner) {
    rolesContainer.innerHTML += `<span class="role-badge owner">Власник</span>`;
    rolesContainer.innerHTML += `<span class="role-badge sponsor">Спонсор</span>`;
  } else if (isSponsor) {
    rolesContainer.innerHTML += `<span class="role-badge sponsor">Спонсор</span>`;
  } else {
    rolesContainer.innerHTML += `<span class="role-badge player">Гравець</span>`;
  }

  const sponsorBox = document.getElementById("sponsor-big-box");
  if (sponsorBox) {
    if (isSponsor) {
      sponsorBox.className = "sponsor-big-card sponsor-gold";
      sponsorBox.innerHTML = `
                <div class="sp-icon"><i class="fa-solid fa-star"></i></div>
                <div class="sp-title">Спонсорство</div>
                <div class="sp-text">У ${player.name} активна підписка</div>
            `;
    } else {
      sponsorBox.className = "sponsor-big-card not-sponsor";
      sponsorBox.innerHTML = `
                <div class="sp-icon"><i class="fa-regular fa-star"></i></div>
                <div class="sp-title">Спонсорство</div>
                <div class="sp-text" style="font-size: 0.9rem; color: var(--text-muted);">Немає спонсорки</div>
                <a href="https://wiki.notka.pp.ua/info/donate" target="_blank" class="gift-link">Подарувати</a>
            `;
    }
  }

  const stats = player.stats || {};
  const getVal = (key) => stats[key] || 0;

  let joinDateText = "Невідомо";
  const regKey = Object.keys(regData).find(
    (k) => k.toLowerCase() === player.name.toLowerCase(),
  );
  if (regKey && regData[regKey]) {
    joinDateText = new Date(regData[regKey]).toLocaleDateString("uk-UA");
  }
  setText("val-join-date", joinDateText);

  const ticks = getVal("minecraft:custom:minecraft:play_time");
  const totalHours = Math.floor(ticks / 20 / 3600);
  const daysPlayed = Math.floor(totalHours / 24);
  setText("val-play-time", `${totalHours} год.`);
  setText("sub-play-days", `≈ ${daysPlayed} дн.`);

  const statusCard = document.getElementById("status-card");
  const statusIcon = document.getElementById("status-icon");
  const statusIconBg = document.getElementById("status-icon-bg");
  const statusLabel = document.getElementById("status-label");
  const valStatus = document.getElementById("val-status");
  const subStatus = document.getElementById("sub-status");

  if (isOnline) {
    statusIcon.className = "fa-solid fa-signal";
    statusIconBg.style = "background: rgba(34, 197, 94, 0.2); color: #4ade80;";
    statusLabel.textContent = "Статус";
    valStatus.textContent = "Онлайн";
    valStatus.style.color = "#4ade80";
    subStatus.textContent = "Грає прямо зараз";
    statusCard.style.borderColor = "rgba(34, 197, 94, 0.3)";
  } else {
    statusIcon.className = "fa-solid fa-power-off";
    statusIconBg.removeAttribute("style");
    valStatus.removeAttribute("style");
    statusCard.removeAttribute("style");
    statusLabel.textContent = "Вхід";
    if (player.logout_time > 0) {
      valStatus.textContent = timeAgo(player.logout_time);
      subStatus.textContent = "";
    } else {
      valStatus.textContent = "Невідомо";
      subStatus.textContent = "Немає даних";
    }
  }

  const toKm = (val) => (val / 100000).toFixed(2) + " км";
  setText("val-sessions", getVal("minecraft:custom:minecraft:leave_game"));
  setText("val-cakes", getVal("minecraft:custom:minecraft:eat_cake_slice"));
  setText("val-killed-by", getVal("minecraft:killed_by:minecraft:player"));
  setText("val-kills", getVal("minecraft:killed:minecraft:player"));
  setText("val-deaths", getVal("minecraft:custom:minecraft:deaths"));
  setText("val-mob-kills", getVal("minecraft:custom:minecraft:mob_kills"));
  setText(
    "val-aviate",
    toKm(getVal("minecraft:custom:minecraft:aviate_one_cm")),
  );
  setText(
    "val-sprint",
    toKm(getVal("minecraft:custom:minecraft:sprint_one_cm")),
  );
  setText("val-walk", toKm(getVal("minecraft:custom:minecraft:walk_one_cm")));
  setText("val-swim", toKm(getVal("minecraft:custom:minecraft:swim_one_cm")));
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function timeAgo(timestamp) {
  if (!timestamp) return "Невідомо";
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "щойно";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} хв. тому`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} год. тому`;
  const days = Math.floor(hours / 24);
  return `${days} дн. тому`;
}
