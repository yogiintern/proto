/* TASK-06..11 — MSME portal pages */
(function () {
  const JOURNEY = ["Profile", "Documents", "Analysis", "Readiness", "Funding route", "Dossier", "Sent", "Decision", "Monitoring"];
  const stateStep = { profiled: 1, docs: 2, analysed: 3, diagnosed: 4, routed: 5, packaged: 6, transmitted: 7, rfi: 8, decided: 9, monitoring: 10 };

  function head(title, sub) { return `<div class="page-head"><h1>${title}</h1>${sub ? `<span class="muted">${sub}</span>` : ""}</div>`; }
  function stepper(state) {
    const cur = stateStep[state] || 1;
    return `<div class="card"><div class="stepper">${JOURNEY.map((s, i) => `<div class="step ${i + 1 < cur ? "done" : i + 1 === cur ? "current" : ""}">${s}</div>`).join("")}</div></div>`;
  }
  function noCase() { return `<div class="empty"><div class="big">🧭</div><h3>No case yet</h3><p>Start onboarding from the public page.</p></div>`; }

  window.MSME_PAGES = {
    dashboard() {
      const u = Sess.user(), c = App.caseOf(u);
      if (!c) return noCase();
      const nba = c.rfi && c.rfi.status === "open" ? { t: `SIDBI requested ${c.rfi.items.length} item(s) — respond before ${U.fmtDate(c.rfi.due)}`, link: "#/tracking", b: "Respond to RFI" }
        : c.state === "profiled" ? { t: "Continue: upload your documents to start analysis", link: "#/documents", b: "Upload documents" }
        : c.state === "transmitted" && c.route === "equity_grant" ? { t: "2 investors are reviewing your evidence pack", link: "#/tracking", b: "View investor status" }
        : c.decision && c.decision.outcome === "sanctioned" ? { t: "Congratulations — funding sanctioned. Enrol in execution monitoring.", link: "#/monitoring", b: "View monitoring" }
        : c.state === "monitoring" ? { t: "Monitoring active — check alerts", link: "#/monitoring", b: "Open monitoring" }
        : { t: "Your case is progressing", link: "#/tracking", b: "Track application" };
      const openAlerts = (c.monitoring && c.monitoring.alerts || []).length;
      return `${head(t("dashboard"), c.company)}
        ${stepper(c.state)}
        <div class="kpi-grid mt">
          <div class="card center"><div class="ring" style="--p:${c.readiness};margin:0 auto"><span>${c.readiness}</span></div><div class="small mt">Readiness score</div></div>
          <div class="card"><div class="small">Stage</div><h3>${U.stageLabel(c.stage)}</h3></div>
          <div class="card"><div class="small">Funding route</div><h3>${U.routeLabel(c.route)}</h3>${c.routing && c.routing.is_predebt_equity ? U.badge("Pre-debt · equity track", "gold") : ""}</div>
          <div class="card"><div class="small">Open items</div><h3>${(c.rfi && c.rfi.status === "open" ? c.rfi.items.length : 0) + (openAlerts ? 1 : 0)}</h3><div class="small">RFIs / alerts</div></div>
        </div>
        <div class="card mt" style="border-left:4px solid var(--sidbi-gold)">
          <div class="row"><div class="grow"><strong>Next best action</strong><p class="muted">${nba.t}</p></div>
          <button class="btn" onclick="App.go('${nba.link}')">${nba.b} →</button></div>
        </div>
        <div class="grid2 mt">
          <div class="card"><h3>Business profile</h3>
            <p>${U.esc(c.card.offering)}</p>
            <div class="chip-list mt">${U.badge(c.stage, "")}${c.card.buyer_types.map(b => U.badge(b, "neutral")).join("")}${c.card.procurement_path.map(p => U.badge(p, "neutral")).join("")}</div>
            <p class="small mt">Confidence ${Math.round(c.card.confidence * 100)}% · verified by you</p></div>
          <div class="card"><h3>Recent activity</h3>
            <div class="timeline">${((c.audit || []).slice(0, 4).map(a => `<div class="t-item done"><strong>${a.action}</strong><br><small>${U.esc(a.detail || "")}</small><br><small class="muted">${U.fmtDate(a.at)}</small></div>`).join("")) || '<p class="muted">No activity yet.</p>'}</div></div>
        </div>`;
    },

    tracking() {
      const u = Sess.user(), c = App.caseOf(u);
      if (!c) return noCase();
      const tx = c.transmissions || [];
      const tl = (t) => {
        const steps = t.scope === "equity_referral" ? ["Referral sent", "Acknowledged", "Investor reviewing", "Meeting", "Term sheet"] : ["Sent", "Acknowledged", "Under review", "RFI", "Decision"];
        const idx = c.decision ? 4 : (c.rfi && c.rfi.status === "open") ? 3 : t.status === "under_review" ? 2 : t.status === "acked" ? 1 : 0;
        return `<div class="stepper">${steps.map((s, i) => `<div class="step ${i < idx ? "done" : i === idx ? "current" : ""}">${s}</div>`).join("")}</div>`;
      };
      const rfiBox = c.rfi && c.rfi.status === "open" ? `
        <div class="card mt" style="border-left:4px solid var(--danger)"><h3>❗ Request for Information (${c.rfi.id})</h3>
          <p class="small">Raised ${U.fmtDate(c.rfi.raised)} · due ${U.fmtDate(c.rfi.due)}</p>
          ${c.rfi.items.map((it, i) => `<div class="card mt" style="background:var(--sidbi-bg)"><div class="row"><span class="grow">${i + 1}. ${U.esc(it.text)}</span>
            <button class="btn sm ${it.done ? "secondary" : ""}" onclick="MSME_A.respondRfi('${c.case_id}',${i})">${it.done ? "✔ Responded" : "Respond / upload"}</button></div></div>`).join("")}
        </div>` : "";
      const decisionBox = c.decision ? `
        <div class="card mt" style="border-left:4px solid var(--success)"><h3>Decision: ${c.decision.outcome === "sanctioned" ? "✅ Sanctioned" : U.esc(c.decision.outcome)}</h3>
          <p>Amount: <span class="money">${U.fmtMoney(c.decision.amount)}</span> · TAT ${c.decision.tat_days} days</p>
          <p class="small">Reasons: ${c.decision.reasons.join("; ")}</p>
          ${c.decision.outcome === "sanctioned" && !c.monitoring ? `<button class="btn mt" onclick="MSME_A.enrolMonitoring('${c.case_id}')">Enrol in execution monitoring →</button>` : ""}
        </div>` : "";
      return `${head(t("tracking"), c.company)}
        ${tx.map(t => `<div class="card mb"><div class="row"><strong>${U.esc(t.partner)}</strong>${U.badge(t.scope === "equity_referral" ? "Equity referral" : "Credit application", t.scope === "equity_referral" ? "gold" : "")}<span class="right small">sent ${U.fmtDate(t.sent)}</span></div>${tl(t)}</div>`).join("") || '<div class="empty"><div class="big">📤</div><p>Nothing sent yet — complete your dossier first.</p></div>'}
        ${rfiBox}${decisionBox}`;
    },

    documents() {
      const u = Sess.user(), c = App.caseOf(u);
      if (!c) return noCase();
      const docs = c.documents || [];
      return `${head(t("documents"), "Allow-listed commercial documents only — never classified material")}
        <div class="card mb" style="background:var(--warning-bg)"><strong>⚠️ Before you upload:</strong> do not upload classified, restricted or operationally sensitive documents. Commercial documents only (PO, invoices, bank statements, GST returns, financials, certificates).</div>
        <div class="card mb"><h3>Upload</h3>
          <div class="field"><label class="checkbox-row"><input type="checkbox" id="attest"><span>I confirm this file contains no classified or restricted information (required)</span></label></div>
          <div class="row wrap">
            <select class="select" id="doc-type" style="max-width:260px">
              <option value="po">Purchase Order</option><option value="invoice">Invoice</option><option value="bank_statement">Bank statement</option>
              <option value="gst_return">GST return</option><option value="financial_statement">Financial statement</option>
              <option value="compliance_certificate">Compliance certificate</option><option value="ip_certificate">IP certificate</option>
            </select>
            <input type="file" id="doc-file" class="input" style="max-width:320px">
            <button class="btn" onclick="MSME_A.upload('${c.case_id}')">Upload</button>
            <button class="btn ghost" onclick="U.toast('Tip: to see the security quarantine path, upload a file named secret-*.pdf')">Demo tip</button>
          </div>
          <div id="scan-host"></div>
        </div>
        <div class="card"><h3>Document library</h3>
          <table class="table"><thead><tr><th>Name</th><th>Type</th><th>Scan</th><th>Verified</th><th>Uploaded</th><th></th></tr></thead><tbody>
          ${docs.length ? docs.map((d, i) => `<tr><td>${U.esc(d.name)}</td><td>${d.type}</td>
            <td>${d.scan === "clean" ? U.badge("Clean", "success") : d.scan === "quarantined" ? U.badge("Quarantined — blocked", "danger") : U.badge("Scanning…", "warning")}</td>
            <td>${d.verified ? U.badge("Verified", "success") : `<button class="btn sm secondary" onclick="MSME_A.verifyDoc('${c.case_id}',${i})">Confirm extracted data</button>`}</td>
            <td class="small">${U.fmtDate(d.uploaded)}</td>
            <td>${d.scan === "quarantined" ? '<span class="small text-danger">Cannot be used (policy)</span>' : ""}</td></tr>`).join("") : '<tr><td colspan="6" class="muted">No documents yet.</td></tr>'}
          </tbody></table></div>`;
    },

    readiness() {
      const u = Sess.user(), c = App.caseOf(u);
      if (!c) return noCase();
      const fs = c.readinessFindings || [];
      const gaps = fs.filter(f => f.status === "gap" || f.status === "disputed");
      return `${head(t("readiness"), c.company)}
        <div class="grid2">
          <div class="card center"><div class="ring" style="--p:${c.readiness};margin:0 auto"><span>${c.readiness}</span></div>
            <div class="small mt">Readiness score · rules@2.1.0</div></div>
          <div class="card"><h3>What this means</h3><p class="muted">Your readiness combines registrations, financial records, order evidence, commercial terms, guarantees, IP and compliance. Closing gaps below improves lender/investor confidence.</p></div>
        </div>
        <h3 class="mt mb">Findings &amp; corrective tasks</h3>
        ${fs.map((f, i) => `<div class="card mb"><div class="row wrap">
            ${f.status === "met" ? U.badge("Met", "success") : f.status === "disputed" ? U.badge("Disputed — under expert review", "warning") : U.badge("Gap · " + f.severity, f.severity === "high" ? "danger" : "warning")}
            <strong class="grow">${U.esc(f.text)}</strong></div>
          ${f.status !== "met" ? `<div class="row mt wrap"><span class="small">Task: ${U.esc(f.task)} (${f.help === "self" ? "self" : "with " + f.help})</span>
            <span class="right row">
              <button class="btn sm" onclick="MSME_A.fixFinding('${c.case_id}',${i})">Fix this</button>
              <button class="btn sm secondary" onclick="MSME_A.askExpert('${c.case_id}',${i})">Ask an expert</button>
              <button class="btn sm ghost" onclick="MSME_A.dispute('${c.case_id}',${i})">This is wrong</button>
            </span></div>` : ""}
        </div>`).join("")}
        ${!gaps.length ? '<div class="card" style="border-left:4px solid var(--success)">🎉 All findings met. Your case is at its best readiness.</div>' : ""}`;
    },

    funding() {
      const u = Sess.user(), c = App.caseOf(u);
      if (!c) return noCase();
      const r = c.routing;
      if (!r) return `${head(t("funding"))}<div class="empty"><div class="big">💰</div><p>Complete analysis to compute your funding route.</p></div>`;
      const equity = r.route === "equity_grant";
      const partners = DB.d.partners.filter(p => (equity ? p.type === "vc" || p.type === "incubator" : r.route === "treds" ? p.type === "treds" : p.type === "re"));
      return `${head(t("funding"), c.company)}
        <div class="card mb" style="border-left:4px solid var(--sidbi-primary)">
          <div class="row wrap"><h2 class="grow">${U.routeLabel(r.route)}</h2>
            ${equity ? U.badge("Pre-debt stage · no POs / no revenue → equity, not debt", "gold") : U.badge(c.stage, "")}</div>
          <p class="mt"><strong>Why this route:</strong>
            ${equity ? "Your company is at validation stage without confirmed orders or revenue, so debt is not serviceable yet. The right capital now is equity via venture capital / seed funds and grants — matched to your IP and iDEX traction. (Referral only — not investment advice.)"
              : r.route === "po_finance" ? "You have a confirmed defence order with milestone payments. Purchase-order finance funds execution against the validated order."
              : r.route === "treds" ? "You have an accepted invoice from an eligible buyer — TReDS gives without-recourse liquidity via competitive bidding."
              : "Matched to your stage and evidence."}</p>
          <div class="chip-list mt">${U.badge("Source: stage classification", "neutral")}${U.badge("Source: rules@" + r.rules_version, "neutral")}${U.badge("Deterministic routing — not an approval", "neutral")}</div>
        </div>
        <div class="card mb"><strong>Capital stack, simply:</strong> <span class="muted">Grants &amp; equity build technology → PO finance executes orders → TReDS unlocks receivables → term loans expand capacity.</span></div>
        <div class="grid2">
          <div class="card"><h3>Eligibility checklist</h3>
            ${(r.eligibility || []).map(e => `<div class="row mb">${e.s === "met" ? U.badge("Met", "success") : U.badge("Gap", "warning")}<span>${U.esc(e.c)}</span></div>`).join("") || '<p class="muted">Computed after analysis.</p>'}
            ${(r.eligibility || []).some(e => e.s !== "met") ? '<button class="btn secondary mt" onclick="App.go(\'#/readiness\')">Close gaps →</button>' : ""}
          </div>
          <div class="card"><h3>Numbers that matter</h3>
            ${c.cashflow ? `<table class="table"><tr><td>Peak funding gap</td><td class="money">${U.fmtMoney(c.cashflow.peak_gap)}</td></tr>
              <tr><td>Suggested facility</td><td class="money">${U.fmtMoney(c.cashflow.suggested_facility)}</td></tr>
              <tr><td>Repayment source</td><td>${U.esc(c.cashflow.repayment_source)}</td></tr></table>` : ""}
            ${c.runway ? `<table class="table"><tr><td>Runway</td><td class="money">${c.runway.runway_months} months</td></tr>
              <tr><td>Gap to milestone</td><td class="money">${U.fmtMoney(c.runway.gap_to_milestone)}</td></tr>
              <tr><td>Suggested raise</td><td class="money">${U.fmtMoney(c.runway.ask_range[0])} – ${U.fmtMoney(c.runway.ask_range[1])}</td></tr></table>` : ""}
            ${!c.cashflow && !c.runway ? '<p class="muted">Model outputs appear after document analysis.</p>' : ""}
          </div>
        </div>
        ${equity && r.future_options ? `<div class="card mt"><details><summary><strong>Future options (locked)</strong></summary><p class="muted mt">${r.future_options.map(f => `${U.routeLabel(f.route)} — unlocks ${f.unlock}`).join("; ")}.</p></details></div>` : ""}
        <div class="card mt"><h3>Action plan</h3>
          ${(r.action_plan || []).map((s, i) => `<div class="row mb"><span class="badge neutral">${i + 1}</span><span class="grow">${U.esc(s.step)}</span><span class="small">${U.esc(s.eta)}</span></div>`).join("")}
          <h4 class="mt mb">Choose institutions to receive your dossier</h4>
          ${partners.map(p => `<label class="radio-card mb"><input type="checkbox" class="pchk" value="${p.id}" style="width:20px;height:20px"><span class="grow"><strong>${U.esc(p.name)}</strong> <span class="small">(${p.type.toUpperCase()} · ${p.integration})</span></span></label>`).join("")}
          <button class="btn mt" onclick="MSME_A.sendDossier('${c.case_id}', ${equity})">Review consent &amp; send →</button>
        </div>`;
    },

    dossier() {
      const u = Sess.user(), c = App.caseOf(u);
      if (!c || !c.dossier) return `${head(t("dossier"))}<div class="empty"><div class="big">📦</div><p>Your dossier will be generated after routing.</p></div>`;
      const d = c.dossier;
      const allMarked = d.artefacts.every(a => a.userMark === "ok");
      const canApprove = allMarked && d.artefacts.every(a => a.review === "approved") && d.status !== "approved" && d.status !== "transmitted";
      return `${head(t("dossier"), `${c.company} · v${d.version} · ${d.type === "equity" ? "Equity dossier" : "Credit dossier"}`)}
        <div class="card mb">${U.badge("Status: " + d.status, d.status === "approved" ? "success" : d.status === "transmitted" ? "" : "warning")}
          ${d.approved_at ? `<span class="small"> · approved by you on ${U.fmtDate(d.approved_at)}</span>` : ""}</div>
        ${d.artefacts.map((a, i) => `
          <div class="card mb"><div class="row wrap"><strong class="grow">${U.esc(a.title)}</strong>
            ${a.review === "approved" ? U.badge("Reviewed: human expert", "success") : U.badge("In review", "warning")}
            <button class="btn sm ghost" onclick="MSME_A.viewArtefact('${c.case_id}',${i})">View</button></div>
            <div class="chip-list mt">${a.sources.map(s => U.badge("⛓ " + s, "neutral")).join("")}</div>
            <div class="row mt"><span class="small muted grow">Every figure is traceable to a source; narratives reviewed by humans.</span>
            ${a.userMark === "ok" ? U.badge("You confirmed", "success") : `<span class="row right">
              <button class="btn sm" onclick="MSME_A.markArtefact('${c.case_id}',${i},true)">Looks correct</button>
              <button class="btn sm secondary" onclick="MSME_A.markArtefact('${c.case_id}',${i},false)">Needs change</button></span>`}
            </div></div>`).join("")}
        <div class="card" style="border-left:4px solid var(--sidbi-gold)">
          <strong>Final approval</strong><p class="muted">Approving lets you transmit this dossier to institutions you choose. Institutions make their own decisions.</p>
          <button class="btn mt" ${canApprove ? "" : "disabled title='Confirm every artefact first (all must show expert review)'"} onclick="MSME_A.approveDossier('${c.case_id}')">Approve dossier v${d.version}</button>
          ${d.status === "transmitted" ? '<span class="small"> Already transmitted — see Tracking.</span>' : ""}
        </div>`;
    },

    monitoring() {
      const u = Sess.user(), c = App.caseOf(u);
      if (!c) return noCase();
      const m = c.monitoring;
      if (!m) return `${head(t("monitoring"))}<div class="empty"><div class="big">🛰️</div><h3>Not enrolled yet</h3><p>Monitoring activates after funding (or enrol after sanction).</p>${c.decision && c.decision.outcome === "sanctioned" ? `<button class="btn" onclick="MSME_A.enrolMonitoring('${c.case_id}')">Enrol now</button>` : ""}</div>`;
      const alerts = m.alerts || [];
      return `${head(t("monitoring"), c.company)}
        ${m.kind === "runway" ? `<div class="card mb"><h3>Runway watch (equity track)</h3><p class="muted">${U.esc(m.note)}</p><p class="mt">Burn vs plan: on track · Next tranche condition: trial report submission</p></div>` : ""}
        ${m.milestones ? `<div class="card mb"><h3>Milestones</h3>${m.milestones.map(ms => `<div class="row mb"><span class="grow">${U.esc(ms.name)} <span class="small">(due ${U.fmtDate(ms.due)})</span></span>${ms.status === "at_risk" ? U.badge("At risk", "warning") : U.badge(ms.status, "success")}<button class="btn sm secondary" onclick="U.toast('Evidence upload uses the Documents flow (attestation required) — demo')">Upload evidence</button></div>`).join("")}</div>` : ""}
        ${m.rules ? `<div class="card mb"><h3>Alert rules (set with your lender)</h3>${m.rules.map(r => `<div class="row mb"><span class="grow">${U.esc(r.trigger)} · ${U.esc(r.threshold)}</span>${U.badge(r.severity, r.severity === "critical" ? "danger" : "warning")}<span class="small">→ ${r.recipients.join(", ")}</span></div>`).join("")}</div>` : ""}
        <div class="card"><div class="row"><h3 class="grow">Alerts</h3><button class="btn sm gold" onclick="MSME_A.simAlert('${c.case_id}')">Simulate event (demo)</button></div>
          ${alerts.length ? alerts.map(a => `<div class="card mt" style="background:${a.severity === "critical" ? "var(--danger-bg)" : "var(--warning-bg)"}"><strong>${a.severity === "critical" ? "🔴" : "🟠"} ${U.esc(a.text)}</strong><br><small>Rule ${a.rule} · ${U.fmtDate(a.at)}</small></div>`).join("") : '<p class="muted mt">No active alerts.</p>'}
        </div>`;
    },

    notifications() {
      const u = Sess.user();
      const items = Notify.forUser(u.id);
      return `${head(t("notifications"))}
        <div class="card"><div class="row mb"><strong class="grow">${items.length} notifications</strong><button class="btn sm secondary" onclick="Notify.markAllRead('${u.id}');App.render()">Mark all read</button></div>
        ${items.map(n => `<div class="notif-item ${n.read ? "" : "unread"}" onclick="Notify.markRead('${n.id}');App.go('${n.link}')">
          <span>${n.severity === "high" ? "🔴" : n.severity === "warning" ? "🟠" : "🔵"}</span>
          <span class="grow">${U.esc(n.text)}<br><small>${U.fmtDate(n.at)} · ${n.type} · in-app</small></span></div>`).join("") || '<p class="muted">None.</p>'}
        <p class="small mt muted">Channels: in-app ✔ · SMS/WhatsApp/email per Preferences · quiet hours 21:00–08:00 IST (critical alerts excepted)</p></div>`;
    },

    settings() {
      const u = Sess.user(), c = App.caseOf(u);
      return `${head(t("settings"))}
        <div class="grid2">
          <div class="card"><h3>${t("profile")}</h3>
            <table class="table"><tr><td>Name</td><td>${U.esc(u.name)}</td></tr><tr><td>Role</td><td>${U.esc(u.roleLabel)}</td></tr>
            <tr><td>Organisation</td><td>${U.esc(u.org)}</td></tr><tr><td>Mobile</td><td>${U.esc(u.phone_masked)}</td></tr>
            ${c ? `<tr><td>Case</td><td>${c.case_id} · ${U.stageLabel(c.stage)}</td></tr>` : ""}</table></div>
          <div class="card"><h3>${t("preferences")}</h3>
            <div class="field"><label>Language / भाषा</label>
              <select class="select" onchange="MSME_A.locale(this.value)">
                ${["en", "hi", "mr"].map(l => `<option value="${l}" ${u.locale === l ? "selected" : ""}>${l === "en" ? "English" : l === "hi" ? "हिंदी" : "मराठी"}</option>`).join("")}
              </select></div>
            <div class="field"><label>Notification channels</label>
              <label class="checkbox-row"><input type="checkbox" checked> In-app</label>
              <label class="checkbox-row"><input type="checkbox" checked> SMS</label>
              <label class="checkbox-row"><input type="checkbox"> WhatsApp</label>
              <label class="checkbox-row"><input type="checkbox" checked> Email</label>
              <p class="small mt">Quiet hours 21:00–08:00 IST (critical alerts excepted).</p></div>
          </div>
        </div>
        ${c ? `<div class="card mt"><h3>Consent centre</h3>
          <p class="small mb">Every data share needs a purpose-specific consent. Revoking stops future sharing.</p>
          ${(c.consents || []).map((cs, i) => `<div class="row mb">${U.badge(cs.purpose, cs.revoked ? "danger" : "success")}<span class="grow">${U.esc(cs.to)} · till ${U.fmtDate(cs.expiry)}</span>
            ${cs.revoked ? '<span class="small text-danger">Revoked</span>' : `<button class="btn sm danger" onclick="MSME_A.revoke('${c.case_id}',${i})">Revoke</button>`}</div>`).join("")}
        </div>` : ""}
        <div class="card mt"><button class="btn secondary" onclick="DB.reset()">Reset demo data</button></div>`;
    }
  };

  // ---------- MSME actions ----------
  window.MSME_A = {
    upload(caseId) {
      const att = document.getElementById("attest");
      const f = document.getElementById("doc-file");
      if (!att.checked) { U.toast("Please confirm the no-classified-content attestation first", "error"); return; }
      if (!f.files.length) { U.toast("Choose a file", "error"); return; }
      const name = f.files[0].name;
      const okExt = /\.(pdf|png|jpg|jpeg)$/i.test(name);
      if (!okExt) { U.toast("ERR-3001: file type not allowed for this document type", "error"); return; }
      const c = DB.d.cases.find(x => x.case_id === caseId);
      const doc = { name, type: document.getElementById("doc-type").value, scan: "pending", verified: false, uploaded: new Date().toISOString().slice(0, 10) };
      c.documents.push(doc); DB.save(); App.render();
      const host = () => document.getElementById("scan-host");
      setTimeout(() => {
        if (/secret/i.test(name)) { doc.scan = "quarantined"; Audit.add(caseId, "System (DLP)", "doc.quarantined", name + " — blocked by sensitive-content policy (ERR-3002)"); }
        else doc.scan = "clean";
        DB.save(); App.render();
        U.toast(doc.scan === "quarantined" ? "This file can't be accepted under the platform's data policy. Contact support." : "Scan clean — please confirm extracted data", doc.scan === "quarantined" ? "error" : "success");
      }, 1200);
    },
    verifyDoc(caseId, i) {
      const c = DB.d.cases.find(x => x.case_id === caseId);
      U.modal(`<h3>Confirm extracted data (demo)</h3>
        <p class="small mb">Extraction: document AI · confidence 0.94 · please verify before use.</p>
        <table class="table"><tr><td>Field</td><td>Extracted value</td></tr>
        <tr><td>Document date</td><td>${U.fmtDate(c.documents[i].uploaded)}</td></tr>
        <tr><td>Reference</td><td>${U.esc(c.documents[i].name.replace(/\.pdf$/i, ""))}</td></tr>
        <tr><td>Amount (if any)</td><td class="money">₹2,12,500</td></tr></table>
        <button class="btn mt" onclick="MSME_A.confirmDoc('${caseId}',${i},this)">✔ Values are correct</button>`);
    },
    confirmDoc(caseId, i, btn) {
      const c = DB.d.cases.find(x => x.case_id === caseId);
      c.documents[i].verified = true;
      Audit.add(caseId, Sess.user().name, "doc.verified", c.documents[i].name);
      btn.closest(".modal-backdrop").remove(); DB.save(); App.render();
      U.toast("Document verified", "success");
    },
    fixFinding(caseId, i) {
      const c = DB.d.cases.find(x => x.case_id === caseId);
      const f = c.readinessFindings[i];
      if (f.check === "buyer_acceptance") { U.toast("This gap closes via the open RFI — see Tracking", ""); return; }
      f.status = "met"; c.readiness = Math.min(100, c.readiness + (f.severity === "high" ? 12 : 6));
      Audit.add(caseId, Sess.user().name, "readiness.task_done", f.text + " — re-diagnosed");
      DB.save(); App.render(); U.toast("Task done — readiness re-computed", "success");
    },
    askExpert(caseId, i) {
      const c = DB.d.cases.find(x => x.case_id === caseId);
      const f = c.readinessFindings[i];
      U.modal(`<h3>Ask an expert</h3><p class="muted mt">Share this finding with a vetted ${f.help === "ca" ? "Chartered Accountant" : "domain expert"}? Only this item's context is shared, with your consent.</p>
        <button class="btn mt" onclick="MSME_A.askExpertGo('${caseId}',${i},this)">Share &amp; request callback</button>`);
    },
    askExpertGo(caseId, i, btn) {
      const c = DB.d.cases.find(x => x.case_id === caseId);
      Audit.add(caseId, Sess.user().name, "expert.requested", c.readinessFindings[i].text);
      Notify.push(Sess.user().id, "expert", "Expert request noted — expect a callback within 1 business day.", "#/readiness");
      btn.closest(".modal-backdrop").remove(); U.toast("Expert request sent (consent-scoped)", "success");
    },
    dispute(caseId, i) {
      const c = DB.d.cases.find(x => x.case_id === caseId);
      U.modal(`<h3>Dispute this finding</h3><div class="field"><label>Why is this wrong?</label><textarea class="input" id="dispute-note"></textarea></div>
        <button class="btn" onclick="MSME_A.disputeGo('${caseId}',${i},this)">Submit for expert review</button>`);
    },
    disputeGo(caseId, i, btn) {
      const c = DB.d.cases.find(x => x.case_id === caseId);
      c.readinessFindings[i].status = "disputed";
      Audit.add(caseId, Sess.user().name, "readiness.disputed", c.readinessFindings[i].text);
      btn.closest(".modal-backdrop").remove(); DB.save(); App.render();
      U.toast("Disputed — a human expert will review", "success");
    },
    sendDossier(caseId, equity) {
      const c = DB.d.cases.find(x => x.case_id === caseId);
      const picks = [...document.querySelectorAll(".pchk:checked")].map(e => e.value);
      if (!picks.length) { U.toast("Choose at least one institution", "error"); return; }
      const scope = equity ? "equity_referral" : "credit_application";
      const consent = (c.consents || []).find(x => x.purpose === scope && !x.revoked);
      if (!consent && (c.consents || []).some(x => x.purpose === scope && x.revoked)) { U.toast("Consent for this purpose was revoked — restore it in Settings to send", "error"); return; }
      const names = picks.map(p => DB.d.partners.find(x => x.id === p).name);
      U.modal(`<h3>Consent &amp; send</h3>
        <p class="mt">You are sharing your approved dossier with: <strong>${names.join(", ")}</strong></p>
        <p class="small muted">Purpose: <strong>${scope.replace("_", " ")}</strong> · data: dossier artefacts + profile · expires in 180 days · revocable anytime.
        ${equity ? "<br><em>This is a referral with your evidence pack — not investment advice or a funding guarantee.</em>" : "<br><em>SIDBI/lenders decide independently; platform makes no approval promise.</em>"}</p>
        ${c.dossier && c.dossier.status !== "approved" && c.dossier.status !== "transmitted" ? '<p class="text-danger small">Dossier must be approved first (see Dossier page).</p>' : ""}
        <div class="row mt"><button class="btn" ${c.dossier && c.dossier.status !== "approved" && c.dossier.status !== "transmitted" ? "disabled" : ""} onclick="MSME_A.sendGo('${caseId}','${scope}','${picks.join(",")}',this)">I consent — send</button>
        <button class="btn ghost" onclick="this.closest('.modal-backdrop').remove()">Cancel</button></div>`);
    },
    sendGo(caseId, scope, picks, btn) {
      const c = DB.d.cases.find(x => x.case_id === caseId);
      const me = Sess.user();
      picks.split(",").forEach(pid => {
        const p = DB.d.partners.find(x => x.id === pid);
        c.transmissions.push({ txn: U.uid("TXN"), partner: p.name, scope, status: "sent", sent: new Date().toISOString().slice(0, 10), acked: null });
      });
      c.state = "transmitted";
      if (!(c.consents || []).some(x => x.purpose === scope)) c.consents.push({ purpose: scope, to: picks.split(",").map(pid => DB.d.partners.find(x => x.id === pid).name).join(", "), expiry: "2027-04-13", revoked: false });
      Audit.add(caseId, me.name, "dossier.transmitted", "Sent to " + picks + " (consent: " + scope + ")");
      Notify.push(me.id, "dossier", "Dossier transmitted to " + picks.split(",").length + " institution(s).", "#/tracking");
      Notify.push("U-SIDBI-001", "case", c.company + " transmitted a dossier (" + scope + ").", "#/case/" + caseId, "high");
      btn.closest(".modal-backdrop").remove(); DB.save(); App.go("#/tracking");
      U.toast("Sent with consent — track in Tracking", "success");
    },
    approveDossier(caseId) {
      const c = DB.d.cases.find(x => x.case_id === caseId);
      c.dossier.status = "approved"; c.dossier.approved_at = new Date().toISOString().slice(0, 10);
      c.state = "packaged";
      Audit.add(caseId, Sess.user().name, "dossier.approved", "Dossier v" + c.dossier.version + " approved by MSME");
      DB.save(); App.render(); U.toast("Dossier approved — you can now send it from Funding Options", "success");
    },
    markArtefact(caseId, i, ok) {
      const c = DB.d.cases.find(x => x.case_id === caseId);
      if (ok) { c.dossier.artefacts[i].userMark = "ok"; }
      else {
        U.modal(`<h3>What needs change?</h3><div class="field"><textarea class="input" id="chg"></textarea></div>
          <button class="btn" onclick="MSME_A.changeGo(this)">Create correction task</button>`);
        window._chg = { caseId, i };
        DB.save(); App.render(); return;
      }
      Audit.add(caseId, Sess.user().name, "artefact.confirmed", c.dossier.artefacts[i].title);
      DB.save(); App.render();
    },
    changeGo(btn) {
      const { caseId } = window._chg;
      Audit.add(caseId, Sess.user().name, "artefact.change_requested", document.getElementById("chg").value || "(no note)");
      Notify.push(caseId.startsWith("CASE-DEMO") ? "U-SIDBI-001" : "U-SIDBI-001", "case", "Correction requested on dossier — " + caseId, "#/case/" + caseId, "normal");
      btn.closest(".modal-backdrop").remove(); U.toast("Correction task created — our team will regenerate the artefact", "success");
    },
    viewArtefact(caseId, i) {
      const c = DB.d.cases.find(x => x.case_id === caseId);
      const a = c.dossier.artefacts[i];
      U.modal(`<h3>${U.esc(a.title)}</h3>
        <div class="docview mt">
          <h4>Generated artefact (demo render)</h4>
          <p>Prepared for ${U.esc(c.company)} · case ${c.case_id} · route ${U.routeLabel(c.route)}.</p>
          <p class="mt">Key figures: ${c.cashflow ? "Peak gap " + U.fmtMoney(c.cashflow.peak_gap) + "; suggested facility " + U.fmtMoney(c.cashflow.suggested_facility) : c.runway ? "Gap to milestone " + U.fmtMoney(c.runway.gap_to_milestone) + "; ask " + U.fmtMoney(c.runway.ask_range[0]) + "–" + U.fmtMoney(c.runway.ask_range[1]) : "As per case evidence."}</p>
          <p class="mt small">Traceability: ${a.sources.join(" · ")} · generated ${U.fmtDate(c.dossier.approved_at)} · reviewer status: ${a.review}</p>
        </div>
        <button class="btn mt" onclick="this.closest('.modal-backdrop').remove()">Close</button>`, true);
    },
    respondRfi(caseId, i) {
      const c = DB.d.cases.find(x => x.case_id === caseId);
      U.modal(`<h3>Respond: ${U.esc(c.rfi.items[i].text)}</h3>
        <div class="field"><label class="checkbox-row"><input type="checkbox" id="rfi-att"><span>I confirm no classified content (attestation)</span></label></div>
        <div class="field"><input type="file" id="rfi-file" class="input"></div>
        <div class="field"><label>Or note</label><textarea class="input" id="rfi-note"></textarea></div>
        <button class="btn" onclick="MSME_A.rfiGo('${caseId}',${i},this)">Submit response</button>`);
    },
    rfiGo(caseId, i, btn) {
      if (!document.getElementById("rfi-att").checked) { U.toast("Attestation required", "error"); return; }
      const c = DB.d.cases.find(x => x.case_id === caseId);
      c.rfi.items[i].done = true;
      if (c.rfi.items.every(x => x.done)) { c.rfi.status = "answered"; c.state = "transmitted"; }
      Audit.add(caseId, Sess.user().name, "rfi.responded", c.rfi.items[i].text);
      Notify.push("U-SIDBI-001", "rfi", c.company + " responded to " + c.rfi.id + " (" + (i + 1) + "/" + c.rfi.items.length + ").", "#/rfi", "high");
      btn.closest(".modal-backdrop").remove(); DB.save(); App.render();
      U.toast("Response sent to SIDBI", "success");
    },
    enrolMonitoring(caseId) {
      const c = DB.d.cases.find(x => x.case_id === caseId);
      c.monitoring = { kind: c.route === "equity_grant" ? "runway" : "receivables", note: "Enrolled post-sanction", rules: [{ id: "AR-N", trigger: "milestone_overdue", threshold: "7 days", severity: "critical", recipients: ["MSME", "Credit Officer"] }], alerts: [], milestones: (c.order ? c.order.milestones : [{ name: "Execution milestone", due: "2026-12-31", status: "on_track" }]) };
      c.state = "monitoring";
      if (!(c.consents || []).some(x => x.purpose === "monitoring")) c.consents.push({ purpose: "monitoring", to: "SIDBI Defence Desk", expiry: "2027-10-13", revoked: false });
      Audit.add(caseId, Sess.user().name, "monitoring.enrolled", "Consent: monitoring");
      DB.save(); App.render(); U.toast("Monitoring enrolled — alerts will appear here and in the bell", "success");
    },
    simAlert(caseId) {
      const c = DB.d.cases.find(x => x.case_id === caseId);
      const a = { id: U.uid("AL"), kind: "milestone", severity: "critical", text: "Milestone slipped beyond threshold (7 days) — rule AR triggered", at: new Date().toISOString().slice(0, 10), rule: "AR-2" };
      c.monitoring.alerts.unshift(a);
      Notify.push(Sess.user().id, "alert", "Alert: milestone overdue (rule AR-2).", "#/monitoring", "warning");
      Notify.push("U-SIDBI-001", "alert", "Alert on " + c.company + " (rule AR-2).", "#/monitoring", "warning");
      Audit.add(caseId, "System (AGT-08)", "monitoring.alert", a.text);
      DB.save(); App.render(); U.toast("Alert generated and sent to MSME + credit officer", "success");
    },
    locale(v) {
      const u = Sess.user(); u.locale = v; localStorage.setItem("dcc_locale", v); DB.save(); App.render();
      U.toast("Language switched", "success");
    },
    revoke(caseId, i) {
      const c = DB.d.cases.find(x => x.case_id === caseId);
      c.consents[i].revoked = true;
      Audit.add(caseId, Sess.user().name, "consent.revoked", c.consents[i].purpose);
      DB.save(); App.render(); U.toast("Consent revoked — future sharing for this purpose is blocked", "success");
    }
  };
})();
