document.addEventListener("DOMContentLoaded", () => {
  const playersList = document.getElementById("players-list");
  const searchInput = document.getElementById("player-search");
  const countTotal = document.getElementById("total-players-count");
  const countSponsors = document.getElementById("total-sponsors-count");
  const lastUpdatedEl = document.getElementById("last-updated");

  const filterDefault = document.getElementById("filter-default");
  const filterOwner = document.getElementById("filter-owner");
  const filterSponsor = document.getElementById("filter-sponsor");
  const filterOnline = document.getElementById("filter-online");

  const customSelect = document.getElementById("sort-select");
  const selectTrigger = customSelect.querySelector(".select-trigger");
  const selectValueSpan = customSelect.querySelector(".select-value");
  const selectOptions = customSelect.querySelectorAll(".select-option");
  const currentSortInput = document.getElementById("current-sort-value");

  const SERVER_IP = "mc.notka.pp.ua";

  const PLAYERS_JSON_URL =
    "https://map.notka.pp.ua/stats/all-players-data.json";
  const REGISTRATION_JSON_URL = "registration.json";

  let allPlayers = [];

  async function fetchAllData() {
    try {
      const [playersRes, regRes, statusRes] = await Promise.all([
        fetch(PLAYERS_JSON_URL + "?t=" + Date.now()),
        fetch(REGISTRATION_JSON_URL + "?t=" + Date.now()),
        fetch(`https://api.mcsrvstat.us/2/${SERVER_IP}`),
      ]);

      if (!playersRes.ok)
        throw new Error("Не вдалося завантажити файл гравців");

      const playersData = await playersRes.json();

      let regData = {};
      try {
        regData = await regRes.json();
      } catch (e) {
        console.warn("Файл реєстрації не знайдено або порожній");
      }

      const statusData = await statusRes.json();

      let onlineNames = [];
      if (statusData.online && statusData.players && statusData.players.list) {
        onlineNames = statusData.players.list.map((name) => name.toLowerCase());
      }

      allPlayers = processData(playersData, regData, onlineNames);

      countTotal.textContent = allPlayers.length;

      countSponsors.textContent = allPlayers.filter(
        (p) => p.group === "sponsor" || p.group === "owner",
      ).length;

      updateUI();
    } catch (error) {
      console.error("Critical Error:", error);
      playersList.innerHTML = `<div class="tooltip-error">
        Помилка завантаження даних.<br>
        <small>${error.message}</small>
      </div>`;
    }
  }

  function processData(mainData, regData, onlineNames) {
    if (mainData.generated_at && lastUpdatedEl) {
      const date = new Date(mainData.generated_at);
      lastUpdatedEl.textContent = date.toLocaleString("uk-UA", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return mainData.players.map((p) => {
      const ticks = p.stats["minecraft:custom:minecraft:play_time"] || 0;
      const hours = Math.floor(ticks / 20 / 3600);

      let regTimestamp;

      if (regData && regData[p.name]) {
        regTimestamp = new Date(regData[p.name]).getTime();
      } else {
        regTimestamp = Date.now();
      }

      const isOnline = onlineNames.includes(p.name.toLowerCase());

      return {
        ...p,
        playTimeHours: hours,
        isOnline: isOnline,
        regTime: regTimestamp,
      };
    });
  }

  function timeAgo(timestamp) {
    if (timestamp === 0) return "Ще не з'являвся";

    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(seconds / 3600);
    const days = Math.floor(seconds / 86400);

    if (days > 365) return Math.floor(days / 365) + " р. тому";
    if (days > 30) return Math.floor(days / 30) + " міс. тому";
    if (days > 0) return days + " дн. тому";
    if (hours > 0) return hours + " год. тому";
    return minutes + " хв. тому";
  }

  selectTrigger.addEventListener("click", (e) => {
    e.stopPropagation();
    customSelect.classList.toggle("open");
  });

  selectOptions.forEach((option) => {
    option.addEventListener("click", () => {
      selectOptions.forEach((opt) => opt.classList.remove("selected"));
      option.classList.add("selected");
      selectValueSpan.textContent = option.textContent;
      currentSortInput.value = option.getAttribute("data-value");
      customSelect.classList.remove("open");
      updateUI();
    });
  });

  document.addEventListener("click", (e) => {
    if (!customSelect.contains(e.target)) customSelect.classList.remove("open");
  });

  function updateUI() {
    let filtered = [...allPlayers];
    const searchText = searchInput.value.toLowerCase();

    if (searchText) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchText),
      );
    }

    const showDefault = filterDefault.checked;
    const showOwner = filterOwner.checked;
    const showSponsor = filterSponsor.checked;

    if (showDefault || showOwner || showSponsor) {
      filtered = filtered.filter((p) => {
        if (showDefault && p.group === "default") return true;
        if (showOwner && p.group === "owner") return true;
        if (showSponsor && p.group === "sponsor") return true;
        return false;
      });
    }

    if (filterOnline.checked) {
      filtered = filtered.filter((p) => p.isOnline);
    }

    const sortValue = currentSortInput.value;
    filtered.sort((a, b) => {
      if (sortValue === "time-desc") return b.playTimeHours - a.playTimeHours;
      if (sortValue === "time-asc") return a.playTimeHours - b.playTimeHours;
      if (sortValue === "name-asc") return a.name.localeCompare(b.name);
      if (sortValue === "name-desc") return b.name.localeCompare(a.name);

      if (sortValue === "reg-desc") return b.regTime - a.regTime;
      if (sortValue === "reg-asc") return a.regTime - b.regTime;

      if (sortValue === "seen-desc") {
        if (a.isOnline && !b.isOnline) return -1;
        if (!a.isOnline && b.isOnline) return 1;
        return b.logout_time - a.logout_time;
      }
      if (sortValue === "seen-asc") {
        if (a.isOnline && !b.isOnline) return 1;
        if (!a.isOnline && b.isOnline) return -1;
        return a.logout_time - b.logout_time;
      }
      return 0;
    });

    renderList(filtered);
  }

  function renderList(players) {
    playersList.innerHTML = "";
    if (players.length === 0) {
      playersList.innerHTML = `<div class="loading-spinner">Гравців не знайдено :(</div>`;
      return;
    }

    players.forEach((player, index) => {
      let badgeHtml = "";
      if (player.group === "sponsor" || player.group === "owner") {
        badgeHtml = `<i class="fa-solid fa-star sponsor-badge" title="Спонсор"></i>`;
      }

      let statusHtml;
      if (player.isOnline) {
        statusHtml = `<span class="player-status status-online">Онлайн</span>`;
      } else if (player.logout_time === 0) {
        statusHtml = `<span class="player-status" style="color: var(--text-muted); opacity: 0.7">Ще не з'являвся</span>`;
      } else {
        statusHtml = `<span class="player-status">${timeAgo(player.logout_time)}</span>`;
      }

      const card = document.createElement("a");
      card.className = "player-card";

      card.href = `/players/profile#${player.name}`;

      card.innerHTML = `
        <div class="player-rank">#${index + 1}</div>
        <img src="https://mc-heads.net/avatar/${player.name}/100" class="player-card-head" alt="${player.name}" loading="lazy">
        <div class="player-info">
          <div class="player-name-row">
            <span class="player-name">${player.name}</span>
            ${badgeHtml}
          </div>
          ${statusHtml}
        </div>
        <div class="player-hours">${player.playTimeHours} год.</div>
      `;

      playersList.appendChild(card);
    });
  }

  searchInput.addEventListener("input", updateUI);
  filterDefault.addEventListener("change", updateUI);
  filterOwner.addEventListener("change", updateUI);
  filterSponsor.addEventListener("change", updateUI);
  filterOnline.addEventListener("change", updateUI);

  fetchAllData();
});
