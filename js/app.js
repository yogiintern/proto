/* TASK-03/04 — app shell, hash router, persona gating, bell + avatar menus */
(function () {
  const MENUS = {
    msme: [
      { route: "dashboard", icon: "🏠", key: "dashboard" },
      { route: "documents", icon: "📄", key: "documents" },
      { route: "readiness", icon: "✅", key: "readiness" },
      { route: "funding", icon: "💰", key: "funding" },
      { route: "dossier", icon: "📦", key: "dossier" },
      { route: "tracking", icon: "📈", key: "tracking" },
      { route: "monitoring", icon: "🛰️", key: "monitoring" },
      { route: "notifications", icon: "🔔", key: "notifications" },
      { route: "settings", icon: "⚙️", key: "settings" }
    ],
    credit_officer: [
      { route: "queue", icon: "📋", key: "queue" },
      { route: "rfi", icon: "❓", key: "rfi" },
      { route: "decisions", icon: "⚖️", key: "decisions" },
      { route: "monitoring", icon: "🛰️", key: "monitoring" },
      { route: "outcomes", icon: "📊", key: "outcomes" },
      { route: "notifications", icon: "🔔", key: "notifications" },
      { route: "settings", icon: "⚙️", key: "settings" }
    ],
    senior_reviewer: [
      { route: "queue", icon: "📋", key: "queue" },
      { route: "decisions", icon: "⚖️", key: "decisions" },
      { route: "rfi", icon: "❓", key: "rfi" },
      { route: "monitoring", icon: "🛰️", key: "monitoring" },
      { route: "outcomes", icon: "📊", key: "outcomes" },
      { route: "notifications", icon: "🔔", key: "notifications" },
      { route: "settings", icon: "⚙️", key: "settings" }
    ],
    programme_manager: [
      { route: "queue", icon: "📋", key: "queue" },
      { route: "monitoring", icon: "🛰️", key: "monitoring" },
      { route: "outcomes", icon: "📊", key: "outcomes" },
      { route: "admin", icon: "🛠️", key: "admin" },
      { route: "notifications", icon: "🔔", key: "notifications" },
      { route: "settings", icon: "⚙️", key: "settings" }
    ]
  };

  window.App = {
    openDD: null,
    start() {
      const s = Sess.get();
      if (!s) { location.href = "index.html"; return; }
      window.addEventListener("hashchange", () => this.render());
      document.addEventListener("click", e => { if (!e.target.closest(".dropdown") && !e.target.closest(".icon-btn") && !e.target.closest(".avatar-btn")) this.closeDD(); });
      this.render();
    },
    route() {
      const h = location.hash.replace(/^#\//, "") || "";
      const [page, param] = h.split("/");
      return { page: page || (Sess.get().portal === "msme" ? "dashboard" : "queue"), param };
    },
    closeDD() { this.openDD = null; document.querySelectorAll(".dropdown").forEach(d => d.remove()); },
    toggleDD(kind) {
      const was = this.openDD; this.closeDD();
      if (was === kind) return;
      this.openDD = kind;
      const u = Sess.user();
      const host = document.querySelector(".topbar");
      const dd = document.createElement("div");
      if (kind === "bell") {
        const items = Notify.forUser(u.id);
        dd.className = "dropdown wide";
        dd.innerHTML = `<div class="dd-head row">Notifications <button class="btn ghost sm right" onclick="event.stopPropagation();App.allRead()">Mark all read</button></div>
          ${items.length ? items.slice(0, 6).map(n => `
            <button class="dd-item" onclick="event.stopPropagation();App.openNotif('${n.id}','${n.link}')">
              <span>${n.severity === "high" ? "🔴" : n.severity === "warning" ? "🟠" : "🔵"}</span>
              <span class="${n.read ? "" : "grow"}"><span class="${n.read ? "" : ""}">${U.esc(n.text)}</span><br><small>${U.fmtDate(n.at)}</small></span>
              ${n.read ? "" : '<span class="badge">New</span>'}
            </button>`).join("") : '<div class="empty">No notifications</div>'}
          <button class="dd-item" style="justify-content:center;color:var(--sidbi-primary)" onclick="event.stopPropagation();App.closeDD();location.hash='#/notifications'">View all →</button>`;
      } else {
        dd.className = "dropdown";
        dd.innerHTML = `<div class="dd-head">${U.esc(u.name)}<br><small class="muted">${U.esc(u.roleLabel)} · ${U.esc(u.org)}</small></div>
          <button class="dd-item" onclick="App.closeDD();location.hash='#/settings'">👤 ${t("profile")}</button>
          <button class="dd-item" onclick="App.closeDD();location.hash='#/settings'">🎛️ ${t("preferences")}</button>
          <button class="dd-item" onclick="App.help()">🆘 ${t("help")}</button>
          <button class="dd-item" style="color:var(--danger)" onclick="Auth.logout()">⏻ ${t("logout")}</button>`;
      }
      host.appendChild(dd);
    },
    openNotif(id, link) { Notify.markRead(id); this.closeDD(); if (link) location.hash = link; else this.render(); },
    allRead() { Notify.markAllRead(Sess.user().id); this.closeDD(); this.render(); },
    help() { this.closeDD(); U.modal(`<h3>Help &amp; Support</h3><p class="muted mt">Programme helpdesk: 1800-DEMO-HELP (demo)<br>Email: support@dcc.demo<br><br>Demo guide: see README → DEMO_SCRIPTS.md</p><button class="btn mt" onclick="this.closest('.modal-backdrop').remove()">Close</button>`); },
    toggleNav() {
      const sh = document.querySelector(".shell");
      if (window.innerWidth <= 860) sh.classList.toggle("nav-open"); else sh.classList.toggle("collapsed");
    },

    menuFor(u) { return MENUS[u.portal === "msme" ? "msme" : u.role] || []; },

    render() {
      const u = Sess.user();
      if (!u) { location.href = "index.html"; return; }
      const { page, param } = this.route();
      const menu = this.menuFor(u);
      const allowed = menu.some(m => m.route === page) || (page === "case" && u.portal === "sidbi");
      const unread = Notify.unread(u.id).length;
      const pages = { ...window.MSME_PAGES, ...window.SIDBI_PAGES };
      const fn = page === "case" ? (window.SIDBI_PAGES && window.SIDBI_PAGES.case_) : pages[page];
      const body = !allowed
        ? `<div class="empty"><div class="big">🔒</div><h3>Not available for your role</h3><p>Your persona (${U.esc(u.roleLabel)}) does not include this module.</p></div>`
        : (fn ? fn(param) : `<div class="empty"><div class="big">🧭</div><h3>Page not found</h3></div>`);
      document.getElementById("app").innerHTML = `
      <div class="shell">
        <div class="topbar">
          <button class="icon-btn" onclick="App.toggleNav()" aria-label="menu">☰</button>
          <div class="brand"><span class="logo">SIDBI</span><span>Defence Credit Copilot <span class="sub">${u.portal === "msme" ? "MSME Portal" : "SIDBI Portal"}</span></span></div>
          <div class="right row">
            <button class="icon-btn" onclick="App.toggleDD('bell')" aria-label="notifications">🔔${unread ? `<span class="bell-badge">${unread}</span>` : ""}</button>
            <button class="avatar-btn" onclick="App.toggleDD('avatar')">
              <span class="avatar">${u.avatar_initials}</span>
              <span class="who">${U.esc(u.name)}<small>${U.esc(u.roleLabel)} · ${U.esc(u.org)}</small></span>▾
            </button>
          </div>
        </div>
        <nav class="sidebar">
          ${menu.map(m => `<a class="menu-item ${page === m.route ? "active" : ""}" href="#/${m.route}"><span>${m.icon}</span><span class="label">${t(m.key)}</span>${m.route === "rfi" && App.openRfis() ? `<span class="mi-badge">${App.openRfis()}</span>` : ""}</a>`).join("")}
          <div class="side-foot">Prototype v0.1 (demo data)<br>Tree@${DB.d.tree.version} · Rules@2.1.0</div>
        </nav>
        <main class="main">${body}</main>
      </div>`;
    },

    openRfis() { return DB.d.cases.filter(c => c.rfi && c.rfi.status === "open").length; },
    caseOf(u) { return DB.d.cases.find(c => u.case_ids && u.case_ids.includes(c.case_id)); },
    go(hash) { location.hash = hash; }
  };
})();
