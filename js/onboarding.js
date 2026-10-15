/* TASK-05 — public landing, MSME login, questionnaire engine, stage classifier, account creation */
(function () {
  const tree = window.DCC_TREE;
  const OB = { node: null, answers: {}, asked: 0, multiSel: [] };

  window.Pub = {
    show(view) {
      ["landing", "login", "onboard"].forEach(v => document.getElementById("view-" + v).classList.toggle("hidden", v !== view));
      if (view === "login") setTimeout(() => document.getElementById("login-email").focus(), 50);
    },
    fill(email) { document.getElementById("login-email").value = email; document.getElementById("login-pass").value = "demo123"; },
    login() {
      const u = Auth.login(document.getElementById("login-email").value, document.getElementById("login-pass").value, "msme");
      const err = document.getElementById("login-err");
      if (!u) { err.textContent = "Invalid credentials (ERR-1001). Use a demo persona or your registered email."; err.classList.remove("hidden"); return; }
      location.href = "app.html#/dashboard";
    },
    startOnboarding() {
      const draft = localStorage.getItem("dcc_ob_draft");
      if (draft) { try { const d = JSON.parse(draft); OB.node = d.node; OB.answers = d.answers || {}; OB.asked = d.asked || 0; } catch (e) { OB.node = tree.start; } }
      else { OB.node = tree.start; OB.answers = {}; OB.asked = 0; }
      this.show("onboard"); this.renderNode();
    },
    saveDraft() { localStorage.setItem("dcc_ob_draft", JSON.stringify({ node: OB.node, answers: OB.answers, asked: OB.asked })); },

    renderNode() {
      const host = document.getElementById("onboard-host");
      const n = tree.nodes[OB.node];
      if (!n) { Pub.finish(); return; }
      const total = 12;
      const opts = n.options.map(o => `
        <div class="radio-card" data-v="${o.v}" onclick="Pub.pick(this,'${o.v}','${n.type}')">
          ${o.icon ? `<span class="icon">${o.icon}</span>` : ""}<span>${o.label}</span>
        </div>`).join("");
      host.innerHTML = `
        <div class="row mb"><span class="badge">Eligibility &amp; business profile</span>
          <span class="right small">Step ${OB.asked + 1} of ~${total} · tree@${tree.version}</span></div>
        <div class="progress mb"><div style="width:${Math.min(100, (OB.asked / total) * 100)}%"></div></div>
        <div class="row mb">
          <h3 class="grow">${n.text}</h3>
          ${n.audio ? `<button class="audio-btn" title="Listen (demo)" onclick="U.toast('Audio playback is simulated in this prototype')">🔊</button>` : ""}
        </div>
        <div class="radio-cards mb">${opts}</div>
        <div class="row">
          ${n.type === "multi" ? `<button class="btn" id="ob-next" disabled onclick="Pub.nextMulti()">Continue →</button>` : ""}
          <button class="btn ghost" onclick="Pub.assist()">🙋 Talk to a person</button>
          ${OB.asked > 0 ? `<button class="btn ghost right" onclick="Pub.back()">← Back</button>` : ""}
        </div>`;
    },

    pick(el, v, type) {
      if (type === "multi") { el.classList.toggle("selected"); document.getElementById("ob-next").disabled = !document.querySelector(".radio-card.selected"); return; }
      const n = tree.nodes[OB.node];
      OB.answers[n.id] = v; OB.asked++;
      const next = n.next[v] || n.next.default;
      OB.node = next; this.afterPick(next);
    },
    nextMulti() {
      const sel = [...document.querySelectorAll(".radio-card.selected")].map(e => e.dataset.v);
      const n = tree.nodes[OB.node];
      OB.answers[n.id] = sel; OB.asked++;
      OB.node = n.next.default; this.afterPick(OB.node);
    },
    afterPick(next) {
      if (next === "E1" || next === "E2") return Pub.exit(next);
      this.saveDraft();
      if (!next || next === "END") return Pub.finish();
      this.renderNode();
    },
    back() { U.toast("Back returns to the previous answer (demo: draft retained)"); },
    assist() {
      U.modal(`<h3>${tree.exits.E3.title}</h3><p class="muted mb">${tree.exits.E3.body}</p>
        <div class="field"><label>Your mobile number</label><input class="input" id="e3-mobile" placeholder="+91…"></div>
        <button class="btn" onclick="Pub.assistSubmit(this)">Request callback</button>`);
    },
    assistSubmit(btn) {
      Notify.push("U-SIDBI-001", "assist", "Onboarding assist requested by a new applicant (E3).", "#/queue", "high");
      btn.closest(".modal-backdrop").remove();
      U.toast("Callback requested. Our expert will reach out within 1 business day.", "success");
    },
    exit(code) {
      const e = tree.exits[code];
      localStorage.removeItem("dcc_ob_draft");
      if (code === "E1") { DB.d.metrics.scope_gate_exits++; DB.save(); }
      document.getElementById("onboard-host").innerHTML = `
        <div class="empty"><div class="big">${code === "E1" ? "ℹ️" : "📝"}</div>
        <h3>${e.title}</h3><p class="mt">${e.body}</p>
        <div class="chip-list mt" style="justify-content:center">${(e.links || []).map(l => `<a class="badge" href="${l}" target="_blank">${l.replace("https://", "")}</a>`).join("")}</div>
        <button class="btn secondary mt" onclick="Pub.show('landing')">Back to home</button></div>`;
    },

    classify() {
      const a = OB.answers;
      let stage = "S1", conf = 0.9;
      if (a["QR-07"] === "yes" && (a["QR-06"] === "confirmed_po" || a["QR-06"] === "executing")) stage = "S2";
      else if (a["QR-06"] === "delivered_pending_payment" || a["QR-08"] === "first_invoice") stage = "S4";
      else if (a["QR-06"] === "expansion") stage = "S5";
      else if (a["QR-06"] === "export") stage = "S6";
      else if (a["QR-06"] === "prototype") stage = "S0";
      else stage = "S1"; // grant_funded / trials_done with no PO & no revenue
      if (a["QR-07"] === "no" && a["QR-08"] === "no" && (stage === "S2" || stage === "S4")) { stage = "S1"; conf = 0.72; }
      return { stage, confidence: conf };
    },

    finish() {
      const a = OB.answers;
      const cls = this.classify();
      localStorage.removeItem("dcc_ob_draft");
      OB.result = cls;
      const cat = (tree.nodes["QR-05"].options.find(o => o.v === a["QR-05"]) || {}).label || "—";
      const buyer = (tree.nodes["QR-04"].options.find(o => o.v === a["QR-04"]) || {}).label || "—";
      document.getElementById("onboard-host").innerHTML = `
        <h3>Your business profile</h3>
        <p class="small mb">Review and confirm — this drives your funding route.</p>
        <table class="table mb">
          <tr><td><strong>Offering</strong></td><td>${U.esc(cat)}</td><td><button class="btn ghost sm" onclick="U.toast('Edit recorded — an expert will verify (demo)')">Edit</button></td></tr>
          <tr><td><strong>End customer</strong></td><td>${U.esc(buyer)}</td><td><button class="btn ghost sm" onclick="U.toast('Edit recorded — an expert will verify (demo)')">Edit</button></td></tr>
          <tr><td><strong>Stage</strong></td><td>${U.stageLabel(cls.stage)} ${U.badge("confidence " + Math.round(cls.confidence * 100) + "%", "neutral")}</td><td></td></tr>
          <tr><td><strong>Procurement path</strong></td><td>${a["QR-04"] === "idex" ? "iDEX / DIO" : "Direct / Tier-1"}</td><td></td></tr>
        </table>
        <div class="card" style="background:var(--info-bg)"><strong>Initial route indication:</strong>
          ${cls.stage === "S0" || cls.stage === "S1"
            ? "Equity & grants (pre-debt) — venture capital / seed funds / iDEX-TDF. Loans unlock once you have a confirmed order."
            : cls.stage === "S2" ? "Purchase-order / cash-flow finance." : cls.stage === "S4" ? "Receivables finance via TReDS." : "Term / specialised finance."}
        </div>
        <h3 class="mt mb">Create your login</h3>
        <div class="field"><label>Mobile number (login id)</label><input class="input" id="ob-mobile" placeholder="+91 98XXXXXXXX"></div>
        <div class="field"><label>Email</label><input class="input" id="ob-email" placeholder="you@company.in"></div>
        <div class="field"><label>Set password</label><input class="input" id="ob-pass" type="password" placeholder="min 6 characters"></div>
        <button class="btn" style="width:100%" onclick="Pub.createAccount()">Create account &amp; continue</button>`;
    },

    createAccount() {
      const email = document.getElementById("ob-email").value.trim();
      const pass = document.getElementById("ob-pass").value;
      const mobile = document.getElementById("ob-mobile").value.trim();
      if (!email || !pass || pass.length < 6 || !mobile) { U.toast("Enter mobile, email and a 6+ character password", "error"); return; }
      if (DB.d.users.some(u => u.email.toLowerCase() === email.toLowerCase())) { U.toast("Account exists — please login", "error"); return; }
      const a = OB.answers, cls = OB.result;
      const entId = U.uid("ENT"), caseId = U.uid("CASE"), userId = U.uid("U-MSME");
      const name = "New Defence MSME (" + mobile.slice(-4) + ")";
      DB.d.companies.push({ enterprise_id: entId, legal_name: name, udyam: "UDYAM-XX-00-0000000", gstin: "", constitution: "pvt_ltd", category: "micro", activity_class: a["QR-02"] === "services" ? "services" : "manufacturing", buyer_types: [a["QR-04"] || "none"], product_category: a["QR-05"] || "other", city: "—" });
      DB.d.users.push({ id: userId, portal: "msme", email, password: pass, name: "Applicant (" + mobile.slice(-4) + ")", role: "owner", roleLabel: "Owner", org: name, persona_key: "new", avatar_initials: "NA", locale: a["QR-00"] || "en", phone_masked: mobile, case_ids: [caseId] });
      DB.d.cases.push({ case_id: caseId, enterprise_id: entId, company: name, owner_user_id: userId, stage: cls.stage, route: cls.stage === "S0" || cls.stage === "S1" ? "equity_grant" : cls.stage === "S2" ? "po_finance" : cls.stage === "S4" ? "treds" : "term_loan", readiness: 22, state: "profiled", cohort: "C1", channel: "Self-onboarding (public page)", officer: "Anjali Verma", assigned: "U-SIDBI-001", opened_at: new Date().toISOString().slice(0, 10), sla_days_in_queue: 0, card: { offering: (tree.nodes["QR-05"].options.find(o => o.v === a["QR-05"]) || {}).label || "—", buyer_types: [a["QR-04"] || "none"], procurement_path: [a["QR-04"] === "idex" ? "idex" : "direct_tier1"], stage: cls.stage, confidence: cls.confidence }, answers: a, documents: [], transmissions: [], consents: [{ purpose: "profile_building", to: "Platform", expiry: "2027-10-13", revoked: false }], readinessFindings: [{ check: "docs", dim: "financial_records", status: "gap", severity: "high", text: "Upload your documents to begin analysis", task: "Upload PO / financial records", help: "self" }], decision: null, monitoring: null, rfi: null, audit: [{ at: new Date().toISOString(), actor: "System", action: "case.opened", detail: "Self-onboarding via public questionnaire; tree@" + tree.version }] });
      DB.save();
      U.toast("Account created — logging you in…", "success");
      setTimeout(() => { Auth.login(email, pass, "msme"); location.href = "app.html#/dashboard"; }, 800);
    }
  };
  document.addEventListener("keydown", e => { if (e.key === "Enter" && !document.getElementById("view-login").classList.contains("hidden")) Pub.login(); });
})();
