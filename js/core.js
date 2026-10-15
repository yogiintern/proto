/* Core runtime: seed merge, session, utils, i18n, notifications, audit */
(function () {
  // ---- DB: seed + persistent overlay ----
  const SEED = {
    users: window.DCC_USERS,
    tree: window.DCC_TREE,
    ...window.DCC_SEED
  };
  const DB_KEY = "dcc_db_v1";
  window.DB = {
    d: null,
    load() {
      try {
        const raw = localStorage.getItem(DB_KEY);
        if (raw) { this.d = JSON.parse(raw); return; }
      } catch (e) {}
      this.d = JSON.parse(JSON.stringify(SEED));
    },
    save() { localStorage.setItem(DB_KEY, JSON.stringify(this.d)); },
    reset() { localStorage.removeItem(DB_KEY); sessionStorage.clear(); location.href = "index.html"; }
  };
  DB.load();

  // ---- Session ----
  window.Sess = {
    get() { try { return JSON.parse(sessionStorage.getItem("dcc_sess")); } catch (e) { return null; } },
    set(s) { sessionStorage.setItem("dcc_sess", JSON.stringify(s)); },
    clear() { sessionStorage.removeItem("dcc_sess"); },
    user() { const s = this.get(); return s ? DB.d.users.find(u => u.id === s.user_id) : null; }
  };

  // ---- Utils ----
  window.U = {
    fmtMoney(paise) {
      if (paise == null) return "—";
      const r = Math.round(paise / 100);
      return "₹" + r.toLocaleString("en-IN");
    },
    fmtDate(d) {
      if (!d) return "—";
      const dt = new Date(d);
      return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    },
    esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); },
    uid(p) { return (p || "ID") + "-" + Date.now().toString(36).toUpperCase(); },
    stageLabel(s) {
      return { S0: "S0 — Idea / R&D", S1: "S1 — Pre-debt (validation)", S2: "S2 — Confirmed order", S3: "S3 — Guarantees", S4: "S4 — Invoice pending", S5: "S5 — Expansion", S6: "S6 — Export" }[s] || s;
    },
    routeLabel(r) {
      return { equity_grant: "Equity & Grants", po_finance: "Purchase Order Finance", cashflow_loan: "Cash-flow Loan", guarantee: "Guarantees (BG/LC)", treds: "TReDS Receivables", term_loan: "Term Loan", export: "Export Finance" }[r] || r;
    },
    badge(txt, cls) { return `<span class="badge ${cls || ""}">${txt}</span>`; },
    toast(msg, cls) {
      let w = document.querySelector(".toast-wrap");
      if (!w) { w = document.createElement("div"); w.className = "toast-wrap"; document.body.appendChild(w); }
      const t = document.createElement("div"); t.className = "toast " + (cls || ""); t.textContent = msg;
      w.appendChild(t); setTimeout(() => t.remove(), 4200);
    },
    modal(html, wide) {
      const b = document.createElement("div"); b.className = "modal-backdrop";
      b.innerHTML = `<div class="modal ${wide ? "wide" : ""}">${html}</div>`;
      b.addEventListener("click", e => { if (e.target === b) b.remove(); });
      document.body.appendChild(b); return b;
    }
  };

  // ---- i18n (demonstration scope: shell + key labels) ----
  const I18N = {
    en: { dashboard: "Dashboard", documents: "Documents", readiness: "Readiness", funding: "Funding Options", dossier: "Dossier", tracking: "Tracking", monitoring: "Monitoring", notifications: "Notifications", settings: "Settings", queue: "Case Queue", rfi: "RFIs", decisions: "Decisions", outcomes: "Outcome Dashboard", admin: "Admin Config", logout: "Logout", preferences: "Preferences", profile: "My Profile", help: "Help & Support" },
    hi: { dashboard: "डैशबोर्ड", documents: "दस्तावेज़", readiness: "तैयारी", funding: "फंडिंग विकल्प", dossier: "डॉसियर", tracking: "ट्रैकिंग", monitoring: "निगरानी", notifications: "सूचनाएँ", settings: "सेटिंग्स", queue: "केस कतार", rfi: "RFI", decisions: "निर्णय", outcomes: "परिणाम डैशबोर्ड", admin: "एडमिन कॉन्फ़िग", logout: "लॉगआउट", preferences: "प्राथमिकताएँ", profile: "मेरी प्रोफ़ाइल", help: "मदद" },
    mr: { dashboard: "डॅशबोर्ड", documents: "कागदपत्रे", readiness: "तयारी", funding: "निधी पर्याय", dossier: "डॉसियर", tracking: "ट्रॅकिंग", monitoring: "देखरेख", notifications: "सूचना", settings: "सेटिंग्ज", queue: "केस रांग", rfi: "RFI", decisions: "निर्णय", outcomes: "परिणाम डॅशबोर्ड", admin: "अ‍ॅडमिन", logout: "बाहेर पडा", preferences: "पसंती", profile: "माझी प्रोफाइल", help: "मदत" }
  };
  window.t = function (k) {
    const u = Sess.user();
    const loc = (u && u.locale) || localStorage.getItem("dcc_locale") || "en";
    return (I18N[loc] && I18N[loc][k]) || I18N.en[k] || k;
  };

  // ---- Notifications ----
  window.Notify = {
    forUser(uid) { return DB.d.notifications.filter(n => n.user_id === uid).sort((a, b) => (a.at < b.at ? 1 : -1)); },
    unread(uid) { return this.forUser(uid).filter(n => !n.read); },
    push(user_id, type, text, link, severity) {
      DB.d.notifications.unshift({ id: U.uid("N"), user_id, type, text, link: link || "#/notifications", read: false, at: new Date().toISOString().slice(0, 10), severity: severity || "normal" });
      DB.save();
    },
    markRead(id) { const n = DB.d.notifications.find(x => x.id === id); if (n) { n.read = true; DB.save(); } },
    markAllRead(uid) { DB.d.notifications.forEach(n => { if (n.user_id === uid) n.read = true; }); DB.save(); }
  };

  // ---- Audit (visible in case review) ----
  window.Audit = {
    add(case_id, actor, action, detail) {
      const c = DB.d.cases.find(x => x.case_id === case_id);
      if (!c) return;
      c.audit = c.audit || [];
      c.audit.unshift({ at: new Date().toISOString(), actor, action, detail });
      DB.save();
    },
    seedIfEmpty(case_id, entries) {
      const c = DB.d.cases.find(x => x.case_id === case_id);
      if (c && !c.audit) { c.audit = entries; DB.save(); }
    }
  };

  // ---- Auth ----
  window.Auth = {
    login(email, password, portal) {
      const u = DB.d.users.find(x => x.email.toLowerCase() === String(email).toLowerCase().trim() && x.password === password && x.portal === portal);
      if (!u) return null;
      Sess.set({ user_id: u.id, portal });
      return u;
    },
    logout() {
      const s = Sess.get();
      Sess.clear();
      location.href = (s && s.portal === "sidbi") ? "sidbi.html" : "index.html";
    }
  };

  // Seed audit trails for demo cases
  Audit.seedIfEmpty("CASE-DEMO-001", [
    { at: "2026-10-09T11:02:00Z", actor: "Anjali Verma", action: "rfi.raised", detail: "RFI-501: 2 items (GST FY25, buyer acceptance)" },
    { at: "2026-10-06T09:12:00Z", actor: "Rohan Kulkarni", action: "dossier.approved", detail: "Dossier v3 approved; transmitted to SIDBI Defence Desk (consent CST-…, credit_application)" },
    { at: "2026-10-05T15:40:00Z", actor: "AGT-06 (model draft-llm v4.2)", action: "dossier.generated", detail: "5 artefacts; reviewer: R. Menon; tree@1.4.0, rules@2.1.0" },
    { at: "2026-10-04T10:22:00Z", actor: "AGT-02 (model doc-llm v3.9)", action: "order.parsed", detail: "PO parsed; LD clause flagged; domain review passed" },
    { at: "2026-09-28T08:00:00Z", actor: "System", action: "case.opened", detail: "Channel: DIA Pune defence cluster" }
  ]);
  Audit.seedIfEmpty("CASE-DEMO-002", [
    { at: "2026-09-30T10:00:00Z", actor: "Dr. Ananya Rao", action: "dossier.approved", detail: "Equity dossier v2 approved; referrals to Bharat Defence Ventures + SIDBI Seed (consent: equity_referral)" },
    { at: "2026-09-29T14:30:00Z", actor: "Dr. K. Bhatt", action: "ip.pack.approved", detail: "IP & Technical Evidence Pack v2 approved (completeness 82%)" },
    { at: "2026-09-20T09:00:00Z", actor: "AGT-07", action: "ip.extracted", detail: "2 patent filings extracted & user-verified" },
    { at: "2026-09-15T08:00:00Z", actor: "System", action: "case.opened", detail: "Channel: iDEX partner incubator" }
  ]);
})();
