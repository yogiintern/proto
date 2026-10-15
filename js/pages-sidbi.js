/* TASK-12..16 — SIDBI portal pages */
(function () {
  function head(title, sub) { return `<div class="page-head"><h1>${title}</h1>${sub ? `<span class="muted">${sub}</span>` : ""}</div>`; }
  const stateBadge = s => ({ new: U.badge("New", ""), rfi: U.badge("RFI open", "danger"), transmitted: U.badge("Under review", "warning"), decided: U.badge("Decided", "success"), monitoring: U.badge("Monitoring", "success"), profiled: U.badge("Profiling", "neutral") }[s] || U.badge(s, "neutral"));

  window.SIDBI_PAGES = {
    queue() {
      const u = Sess.user();
      const cases = DB.d.cases;
      const mine = window._mineOnly;
      const rows = cases.filter(c => !mine || c.assigned === u.id);
      return `${head(t("queue"), `${rows.length} cases · Defence Credit Copilot pilot`)}
        <div class="card mb"><div class="row wrap">
          <input class="input" style="max-width:240px" placeholder="Search company / case id" onkeyup="SIDBI_A.q(this.value)">
          <select class="select" style="max-width:180px" onchange="SIDBI_A.fStage(this.value)"><option value="">All stages</option>${["S0","S1","S2","S3","S4","S5","S6"].map(s => `<option ${window._fStage === s ? "selected" : ""}>${s}</option>`).join("")}</select>
          <select class="select" style="max-width:200px" onchange="SIDBI_A.fRoute(this.value)"><option value="">All routes</option><option value="po_finance" ${window._fRoute === "po_finance" ? "selected" : ""}>PO Finance</option><option value="equity_grant" ${window._fRoute === "equity_grant" ? "selected" : ""}>Equity & Grants</option><option value="treds" ${window._fRoute === "treds" ? "selected" : ""}>TReDS</option></select>
          <label class="checkbox-row"><input type="checkbox" ${mine ? "checked" : ""} onchange="window._mineOnly=this.checked;App.render()"> My cases</label>
        </div></div>
        <div class="card"><table class="table"><thead><tr><th>Case</th><th>Company</th><th>Stage</th><th>Route</th><th>Readiness</th><th>State</th><th>SLA</th><th></th></tr></thead><tbody id="queue-rows">
        ${rows.map(c => SIDBI_PAGES._row(c)).join("")}
        </tbody></table></div>`;
    },
    _row(c) {
      const q = (window._q || "").toLowerCase();
      if (q && !(c.company.toLowerCase().includes(q) || c.case_id.toLowerCase().includes(q))) return "";
      if (window._fStage && c.stage !== window._fStage) return "";
      if (window._fRoute && c.route !== window._fRoute) return "";
      const slaCls = c.sla_days_in_queue > 10 ? "danger" : c.sla_days_in_queue > 4 ? "warning" : "success";
      return `<tr><td class="small">${c.case_id}</td><td><strong>${U.esc(c.company)}</strong><br><small class="muted">${U.esc(c.card ? c.card.offering : "")}</small></td>
        <td>${U.badge(c.stage, "")}</td><td>${U.routeLabel(c.route)}${c.routing && c.routing.is_predebt_equity ? "<br>" + U.badge("Equity route", "gold") : ""}</td>
        <td><strong>${c.readiness}</strong></td><td>${stateBadge(c.state)}</td>
        <td>${c.state === "monitoring" ? U.badge("—", "neutral") : U.badge(c.sla_days_in_queue + "d", slaCls)}</td>
        <td><button class="btn sm" onclick="App.go('#/case/${c.case_id}')">Open</button></td></tr>`;
    },

    case_(id) {
      const c = DB.d.cases.find(x => x.case_id === id);
      if (!c) return `<div class="empty"><h3>Case not found</h3></div>`;
      const u = Sess.user();
      const tab = window._ctab || "overview";
      const ro = u.role === "programme_manager";
      return `${head(c.company, `${c.case_id} · ${U.stageLabel(c.stage)} · ${U.routeLabel(c.route)}`)}
        <div class="card mb"><div class="row wrap">
          ${stateBadge(c.state)} ${U.badge("Readiness " + c.readiness, "")} ${U.badge("Consent valid", "success")}
          <span class="right row">
            ${!ro ? `<button class="btn sm secondary" onclick="SIDBI_A.raiseRfi('${c.case_id}')">Raise RFI</button>` : ""}
            ${u.role === "credit_officer" ? `<button class="btn sm" onclick="SIDBI_A.propose('${c.case_id}')">Propose decision</button>` : ""}
            ${u.role === "senior_reviewer" ? `<button class="btn sm" onclick="App.go('#/decisions')">Go to approvals</button>` : ""}
            ${ro ? U.badge("Read-only (Programme Manager)", "neutral") : ""}
          </span></div></div>
        <div class="tabs mb">${["overview", "documents", "order", "ip", "dossier", "audit"].map(x => `<button class="${tab === x ? "active" : ""}" onclick="window._ctab='${x}';App.render()">${{ overview: "Overview", documents: "Documents", order: "Order & Cash Flow", ip: "IP & Technical", dossier: "Dossier", audit: "Audit Trail" }[x]}</button>`).join("")}</div>
        ${SIDBI_PAGES["tab_" + tab](c)}`;
    },
    tab_overview(c) {
      return `<div class="grid2">
        <div class="card"><h3>Business-model card</h3>
          <table class="table">
            <tr><td>Offering</td><td>${U.esc(c.card.offering)}</td></tr>
            <tr><td>Buyers</td><td>${c.card.buyer_types.join(", ")}</td></tr>
            <tr><td>Procurement path</td><td>${c.card.procurement_path.join(", ")}</td></tr>
            <tr><td>Stage</td><td>${U.stageLabel(c.stage)} (${Math.round(c.card.confidence * 100)}% conf.)</td></tr>
            <tr><td>Cohort / channel</td><td>${c.cohort} · ${U.esc(c.channel)}</td></tr>
            <tr><td>Opened</td><td>${U.fmtDate(c.opened_at)} · Officer: ${U.esc(c.officer)}</td></tr>
          </table></div>
        <div class="card"><h3>Journey</h3><div class="timeline">
          ${["Profile", "Documents", "Analysis", "Readiness", "Routing", "Dossier", "Transmission", "Decision"].map((s, i) => `<div class="t-item ${i < 7 || c.decision ? "done" : "current"}"><strong>${s}</strong></div>`).join("")}
        </div></div></div>`;
    },
    tab_documents(c) {
      const docs = c.documents || [];
      return `<div class="card"><h3>Documents (allow-listed; DLP-scanned)</h3>
        <table class="table"><thead><tr><th>Name</th><th>Type</th><th>Scan</th><th>Verified</th><th>Uploaded</th></tr></thead><tbody>
        ${docs.length ? docs.map(d => `<tr><td>${U.esc(d.name)}</td><td>${d.type}</td><td>${d.scan === "clean" ? U.badge("Clean", "success") : d.scan === "quarantined" ? U.badge("Quarantined", "danger") : U.badge("Scanning", "warning")}</td><td>${d.verified ? U.badge("Verified", "success") : U.badge("Pending user confirm", "warning")}</td><td class="small">${U.fmtDate(d.uploaded)}</td></tr>`).join("") : '<tr><td colspan="5" class="muted">No documents yet.</td></tr>'}
        </tbody></table></div>`;
    },
    tab_order(c) {
      if (!c.order) return `<div class="card"><div class="empty"><div class="big">📄</div><p>No confirmed order — ${c.stage === "S1" || c.stage === "S0" ? "pre-debt stage: see runway model below." : "awaiting order."}</p></div>
        ${c.runway ? `<div class="card mt"><h3>Runway model (pre-debt)</h3><table class="table">
          <tr><td>Runway</td><td>${c.runway.runway_months} months</td></tr>
          <tr><td>Monthly burn</td><td class="money">${U.fmtMoney(Object.values(c.runway.monthly_burn).reduce((a, b) => a + b, 0))}</td></tr>
          <tr><td>Gap to milestone</td><td class="money">${U.fmtMoney(c.runway.gap_to_milestone)}</td></tr>
          <tr><td>Suggested raise</td><td class="money">${U.fmtMoney(c.runway.ask_range[0])} – ${U.fmtMoney(c.runway.ask_range[1])}</td></tr>
          <tr><td>Target milestone</td><td>${U.esc(c.runway.target_milestone)}</td></tr>
          <tr><td>Assumptions approved</td><td>${U.esc(c.runway.approved_by)} · ${U.fmtDate(c.runway.approved_at)}</td></tr></table></div>` : ""}</div>`;
      const o = c.order;
      return `<div class="grid2">
        <div class="card"><h3>Order record ${U.badge("Domain-reviewed", "success")}</h3>
          <table class="table">
            <tr><td>Buyer</td><td>${U.esc(o.buyer)}</td></tr>
            <tr><td>Order value</td><td class="money">${U.fmtMoney(o.order_value)}</td></tr>
            <tr><td>Performance BG</td><td>${o.pbg_pct || "—"}%</td></tr>
            <tr><td>LD clause</td><td>${U.esc(o.ld_clause)}</td></tr>
            <tr><td>Inspection gates</td><td>${(o.inspection_gates || []).join("; ") || "—"}</td></tr>
            <tr><td>Payment trigger</td><td>${(o.payment_triggers || []).map(p => p.event + " + " + p.days + "d").join("; ")}</td></tr>
          </table>
          <h4 class="mt mb">Milestones</h4>
          <table class="table"><thead><tr><th>Milestone</th><th>Due</th><th>Amount</th><th>Status</th></tr></thead><tbody>
            ${(o.milestones || []).map(m => `<tr><td>${U.esc(m.name)}${m.gate ? " 🛡️" : ""}</td><td>${U.fmtDate(m.due)}</td><td class="money">${U.fmtMoney(m.amount)}</td><td>${U.badge(m.status, m.status === "paid" ? "success" : "neutral")}</td></tr>`).join("")}
          </tbody></table></div>
        <div class="card"><h3>Cash-flow model <span class="small">cf-2.1.0 · CA approved</span></h3>
          ${c.cashflow ? `<table class="table"><thead><tr><th>Month</th><th>Uses</th><th>Sources</th><th>Cumulative</th></tr></thead><tbody>
            ${c.cashflow.monthly.map(m => `<tr><td>${m.m}</td><td class="money">${U.fmtMoney(m.uses)}</td><td class="money">${U.fmtMoney(m.sources)}</td><td class="money ${m.net < 0 ? "text-danger" : "text-success"}">${U.fmtMoney(m.net)}</td></tr>`).join("")}
          </tbody></table>
          <p class="mt"><strong>Peak gap: <span class="money">${U.fmtMoney(c.cashflow.peak_gap)}</span></strong> · Suggested facility <span class="money">${U.fmtMoney(c.cashflow.suggested_facility)}</span></p>
          <p class="small">Repayment: ${U.esc(c.cashflow.repayment_source)} · Approved by ${U.esc(c.cashflow.approved_by)}</p>` : '<p class="muted">—</p>'}
        </div></div>`;
    },
    tab_ip(c) {
      const ip = c.ip;
      if (!ip) return `<div class="card"><p class="muted">No IP profile.</p></div>`;
      return `<div class="grid2">
        <div class="card"><h3>Technical capability profile</h3>
          <div class="row mb"><div class="ring" style="--p:${ip.completeness}"><span>${ip.completeness}%</span></div>
            <div><strong>Evidence completeness</strong><br><small>≥60% required for external transmission</small></div></div>
          <table class="table">
            <tr><td>Design ownership</td><td>${U.esc(ip.design_ownership || "—")}</td></tr>
            <tr><td>TRL</td><td>${ip.trl ? "TRL " + ip.trl + " (evidence: " + U.esc(ip.trl_evidence || "—") + ")" : "—"}</td></tr>
            <tr><td>IP items</td><td>${(ip.items || []).map(i => `${i.type} ${i.number} (${i.status})`).join("; ") || "—"}</td></tr>
            <tr><td>Indigenisation</td><td>${ip.indigenisation_band ? ip.indigenisation_band.replace("_", "–") + "%" : "—"}</td></tr>
            <tr><td>Certifications</td><td>${(ip.certs || []).join("; ") || "—"}</td></tr>
            <tr><td>Programme traction</td><td>${(ip.traction || []).map(x => x.programme + ": " + x.status).join("; ") || "—"}</td></tr>
          </table></div>
        <div class="card"><h3>IP & Technical Evidence Pack</h3>
          ${ip.pack ? `<p>${U.badge("Approved by " + ip.pack.reviewer, "success")}</p>
            <p class="small mt">Version ${ip.pack.version} · generated ${U.fmtDate(ip.pack.generated)} · every claim source-linked; unverified claims excluded.</p>` : '<p class="muted">Not generated.</p>'}
          <p class="small mt muted">Boundary: no classified drawings/specs; indigenisation in bands; platform gives no valuation or investment opinion.</p></div>
      </div>`;
    },
    tab_dossier(c) {
      if (!c.dossier) return `<div class="card"><p class="muted">No dossier yet.</p></div>`;
      return `<div class="card"><h3>Dossier v${c.dossier.version} ${U.badge(c.dossier.status, "success")}</h3>
        <p class="small mb">MSME approved: ${U.fmtDate(c.dossier.approved_at)} · type: ${c.dossier.type}</p>
        ${c.dossier.artefacts.map(a => `<div class="row mb">${U.badge(a.kind, "neutral")}<strong class="grow">${U.esc(a.title)}</strong>${U.badge("review: " + a.review, a.review === "approved" ? "success" : "warning")}</div>
          <div class="chip-list mb">${a.sources.map(s => U.badge("⛓ " + s, "neutral")).join("")}</div>`).join("")}
      </div>`;
    },
    tab_audit(c) {
      return `<div class="card"><h3>Audit trail (immutable)</h3>
        <table class="table"><thead><tr><th>When</th><th>Actor</th><th>Action</th><th>Detail</th></tr></thead><tbody>
        ${((c.audit || []).map(a => `<tr><td class="small">${U.fmtDate(a.at)}</td><td>${U.esc(a.actor)}</td><td>${U.badge(a.action, "neutral")}</td><td class="small">${U.esc(a.detail || "")}</td></tr>`)).join("") || '<tr><td colspan="4" class="muted">No events.</td></tr>'}
        </tbody></table></div>`;
    },

    rfi() {
      const open = DB.d.cases.filter(c => c.rfi).map(c => ({ c, r: c.rfi }));
      return `${head(t("rfi"), "Requests for information across cases")}
        <div class="card"><table class="table"><thead><tr><th>RFI</th><th>Case</th><th>Items</th><th>Raised</th><th>Due</th><th>Status</th><th></th></tr></thead><tbody>
        ${open.map(({ c, r }) => `<tr><td>${r.id}</td><td><a href="#/case/${c.case_id}">${U.esc(c.company)}</a></td>
          <td>${r.items.map(i => `${i.done ? "✔" : "○"} ${U.esc(i.text)}`).join("<br>")}</td>
          <td class="small">${U.fmtDate(r.raised)}</td><td class="small">${U.fmtDate(r.due)}</td>
          <td>${r.status === "open" ? U.badge("Open", "danger") : r.status === "answered" ? U.badge("Answered", "warning") : U.badge("Closed", "success")}</td>
          <td>${r.status === "answered" && Sess.user().role !== "programme_manager" ? `<button class="btn sm" onclick="SIDBI_A.closeRfi('${c.case_id}')">Close</button>` : ""}</td></tr>`).join("")}
        </tbody></table></div>`;
    },

    decisions() {
      const props = DB.d.proposals || [];
      const decided = DB.d.cases.filter(c => c.decision);
      const u = Sess.user();
      return `${head(t("decisions"), "Two-step control: officer proposes → reviewer records")}
        <div class="grid2">
          <div class="card"><h3>Awaiting approval</h3>
            ${props.filter(p => p.status === "awaiting_approval").map(p => { const c = DB.d.cases.find(x => x.case_id === p.case_id); return `
              <div class="card mb" style="background:var(--sidbi-bg)"><strong>${U.esc(c.company)}</strong> <span class="small">(${p.case_id})</span><br>
              Proposed: ${U.badge(p.outcome, "warning")} <span class="money">${U.fmtMoney(p.amount)}</span> · by ${U.esc(p.proposed_by)}<br>
              <span class="small">Reasons: ${p.reasons.join("; ")}</span><br>
              ${u.role === "senior_reviewer" ? `<div class="row mt"><button class="btn sm" onclick="SIDBI_A.record('${p.id}',true)">✔ Record decision</button>
                <button class="btn sm danger" onclick="SIDBI_A.record('${p.id}',false)">Decline proposal</button></div>` : '<span class="small muted">Awaiting senior reviewer…</span>'}
              </div>`; }).join("") || '<p class="muted">Nothing pending.</p>'}
          </div>
          <div class="card"><h3>Recorded decisions</h3>
            ${decided.map(c => `<div class="row mb"><span class="grow"><strong>${U.esc(c.company)}</strong><br><small>${c.case_id}</small></span>
              ${U.badge(c.decision.outcome, "success")} <span class="money">${U.fmtMoney(c.decision.amount)}</span> <span class="small">TAT ${c.decision.tat_days}d</span></div>`).join("") || '<p class="muted">None yet.</p>'}
          </div>
        </div>`;
    },

    monitoring() {
      const mons = DB.d.cases.filter(c => c.monitoring);
      return `${head(t("monitoring"), "Portfolio view")}
        <div class="kpi-grid mb">
          <div class="card"><div class="small">Cases monitored</div><h3>${mons.length}</h3></div>
          <div class="card"><div class="small">Active alerts</div><h3>${mons.reduce((a, c) => a + (c.monitoring.alerts || []).length, 0)}</h3></div>
          <div class="card"><div class="small">Critical</div><h3 class="text-danger">${mons.reduce((a, c) => a + (c.monitoring.alerts || []).filter(x => x.severity === "critical").length, 0)}</h3></div>
        </div>
        ${mons.map(c => `<div class="card mb"><div class="row"><strong class="grow">${U.esc(c.company)}</strong>${U.badge(c.monitoring.kind, "neutral")}<a href="#/case/${c.case_id}">Open case →</a></div>
          ${(c.monitoring.milestones || []).map(m => `<div class="row mt"><span class="grow small">${U.esc(m.name)} · due ${U.fmtDate(m.due)}</span>${U.badge(m.status, m.status === "at_risk" ? "warning" : "success")}</div>`).join("")}
          ${(c.monitoring.alerts || []).map(a => `<div class="card mt" style="background:${a.severity === "critical" ? "var(--danger-bg)" : "var(--warning-bg)"}"><strong>${U.esc(a.text)}</strong> <small>· rule ${a.rule} · ${U.fmtDate(a.at)}</small></div>`).join("") || '<p class="small muted mt">No alerts.</p>'}
        </div>`).join("") || '<div class="empty"><div class="big">🛰️</div><p>No cases under monitoring.</p></div>'}`;
    },

    outcomes() {
      const m = DB.d.metrics;
      const max = m.funnel[0].v;
      return `${head(t("outcomes"), "SICF pilot · cohorts C1/C2/C3 · all figures demo")}
        <div class="kpi-grid mb">
          <div class="card center"><h3>${m.kpis.satisfaction}%</h3><div class="small">User satisfaction</div></div>
          <div class="card center"><h3>−${m.kpis.doc_prep_reduction}%</h3><div class="small">Doc-prep time vs baseline</div></div>
          <div class="card center"><h3>${m.kpis.traceability_pass}%</h3><div class="small">AI source-traceability pass</div></div>
          <div class="card center"><h3>${m.kpis.median_tat}d</h3><div class="small">Median decision TAT</div></div>
        </div>
        <div class="grid2">
          <div class="card"><h3>Outcome funnel</h3>
            ${m.funnel.map(f => `<div class="funnel-bar"><div class="bar" style="width:${Math.max(6, (f.v / max) * 100)}%">${f.v.toLocaleString("en-IN")}</div><span class="small">${f.k}</span></div>`).join("")}
            <p class="small mt muted">Drop-off reasons: ${Object.entries(m.dropoffs).map(([k, v]) => `${k}: ${v}`).join(" · ")}</p></div>
          <div class="card"><h3>Equity track (reported separately)</h3>
            <table class="table">
              <tr><td>IP evidence packs sent</td><td class="money">${m.equity.packs_sent}</td></tr>
              <tr><td>VC / seed referrals</td><td class="money">${m.equity.vc_referrals}</td></tr>
              <tr><td>Investor meetings</td><td class="money">${m.equity.investor_meetings}</td></tr>
              <tr><td>Term sheets</td><td class="money">${m.equity.term_sheets}</td></tr>
            </table>
            <p class="small muted">Never blended into debt sanction rates (BR-MET-003).</p>
            <h4 class="mt">Scope-gate transparency</h4>
            <p>${U.badge(m.scope_gate_exits + " trading exits (E1)", "neutral")} <span class="small">— excluded by design; not counted as beneficiaries.</span></p>
          </div>
        </div>`;
    },

    admin() {
      const u = Sess.user();
      if (u.role !== "programme_manager") return `<div class="empty"><div class="big">🔒</div><h3>Programme Manager only</h3></div>`;
      const tab = window._atab || "tree";
      const tree = DB.d.tree;
      return `${head(t("admin"), "Config is versioned & four-eyes published (demo: read-only viewers)")}
        <div class="tabs mb">${["tree", "rules", "partners", "models"].map(x => `<button class="${tab === x ? "active" : ""}" onclick="window._atab='${x}';App.render()">${{ tree: "Questionnaire Tree", rules: "Routing Rules", partners: "Partners", models: "Model Inventory" }[x]}</button>`).join("")}</div>
        ${tab === "tree" ? `<div class="card"><h3>questionnaire@${tree.version} ${U.badge("published", "success")}</h3>
          <div class="docview mt">${Object.values(tree.nodes).map(n => `<div class="mb"><strong>${n.id}</strong> — ${U.esc(n.text)}<br><small class="muted">maps_to: ${n.maps_to.join(", ")} → next: ${Object.entries(n.next).map(([k, v]) => `${k}→${v}`).join(", ")}</small></div>`).join("")}
          <div class="card" style="background:var(--danger-bg)"><strong>Exits:</strong> E1 trading scope-gate · E2 pre-registration · E3 human assist</div></div>
          <p class="small mt muted">Edits require review + four-eyes publish; regression suite must pass (scope-gate & pre-debt conformance).</p></div>` : ""}
        ${tab === "rules" ? `<div class="card"><h3>Routing rules @2.1.0</h3>
          <table class="table"><thead><tr><th>When</th><th>Then route to</th></tr></thead><tbody>
          ${DB.d.config.routing_rules.map(r => `<tr style="${r.highlight ? "background:var(--warning-bg)" : ""}"><td>${U.esc(r.when)}</td><td>${U.esc(r.then)}</td></tr>`).join("")}</tbody></table>
          <h4 class="mt mb">Simulate</h4>
          <div class="row wrap">
            <select class="select" id="sim-stage" style="max-width:200px"><option value="S1">S1 — pre-debt</option><option value="S2">S2 — confirmed order</option><option value="S4">S4 — invoice pending</option><option value="S5">S5 — expansion</option></select>
            <label class="checkbox-row"><input type="checkbox" id="sim-po"> Has confirmed PO</label>
            <label class="checkbox-row"><input type="checkbox" id="sim-rev"> Revenue started</label>
            <button class="btn sm" onclick="SIDBI_A.simulate()">Run router</button>
          </div><div id="sim-out" class="mt"></div></div>` : ""}
        ${tab === "partners" ? `<div class="card"><h3>Partner registry</h3>
          <table class="table"><thead><tr><th>Partner</th><th>Type</th><th>Integration</th><th>Scopes</th><th>SLA</th><th>Status</th></tr></thead><tbody>
          ${DB.d.partners.map(p => `<tr><td>${U.esc(p.name)}</td><td>${p.type}</td><td>${p.integration}</td><td>${p.scopes.join(", ")}</td><td>${p.sla_hours}h</td><td>${U.badge(p.status, "success")}</td></tr>`).join("")}</tbody></table></div>` : ""}
        ${tab === "models" ? `<div class="card"><h3>Model inventory (Responsible AI)</h3>
          <table class="table"><thead><tr><th>Agent</th><th>Model/pipeline</th><th>Purpose</th><th>Data classes</th><th>Golden-set gate</th></tr></thead><tbody>
          ${DB.d.config.model_inventory.map(mi => `<tr><td>${mi.agent}</td><td>${mi.model}</td><td>${mi.purpose}</td><td>${mi.data}</td><td>${mi.gate}</td></tr>`).join("")}</tbody></table>
          <p class="small mt muted">Deterministic boundaries: classification, routing and all arithmetic never use generative models.</p></div>` : ""}`;
    }
  };

  // ---------- SIDBI actions ----------
  window.SIDBI_A = {
    q(v) { window._q = v; const tb = document.getElementById("queue-rows"); if (tb) tb.innerHTML = DB.d.cases.map(c => window.SIDBI_PAGES._row(c)).join(""); },
    fStage(v) { window._fStage = v; App.render(); },
    fRoute(v) { window._fRoute = v; App.render(); },
    raiseRfi(caseId) {
      const c = DB.d.cases.find(x => x.case_id === caseId);
      U.modal(`<h3>Raise RFI — ${U.esc(c.company)}</h3>
        <div class="field"><label>Item needed</label><input class="input" id="rfi-new-text" placeholder="e.g. Latest GST return"></div>
        <div class="field"><label>Due in (days)</label><input class="input" id="rfi-new-days" type="number" value="7"></div>
        <button class="btn" onclick="SIDBI_A.raiseRfiGo('${caseId}',this)">Send RFI to MSME</button>`);
    },
    raiseRfiGo(caseId, btn) {
      const c = DB.d.cases.find(x => x.case_id === caseId);
      const text = document.getElementById("rfi-new-text").value.trim() || "Additional document";
      const days = +document.getElementById("rfi-new-days").value || 7;
      const due = new Date(Date.now() + days * 864e5).toISOString().slice(0, 10);
      if (!c.rfi || c.rfi.status !== "open") c.rfi = { id: U.uid("RFI"), status: "open", raised: new Date().toISOString().slice(0, 10), due, items: [] };
      c.rfi.items.push({ key: U.uid("item"), text });
      c.state = "rfi";
      Audit.add(caseId, Sess.user().name, "rfi.raised", text);
      if (c.owner_user_id) Notify.push(c.owner_user_id, "rfi", `SIDBI requested information for ${c.case_id}: ${text}`, "#/tracking", "high");
      btn.closest(".modal-backdrop").remove(); DB.save(); App.render();
      U.toast("RFI sent — MSME notified", "success");
    },
    closeRfi(caseId) {
      const c = DB.d.cases.find(x => x.case_id === caseId);
      c.rfi.status = "closed"; c.state = "transmitted";
      Audit.add(caseId, Sess.user().name, "rfi.closed", c.rfi.id);
      DB.save(); App.render(); U.toast("RFI closed", "success");
    },
    propose(caseId) {
      const c = DB.d.cases.find(x => x.case_id === caseId);
      const isEquity = c.route === "equity_grant";
      U.modal(`<h3>Propose decision — ${U.esc(c.company)}</h3>
        <div class="field"><label>Outcome</label><select class="select" id="dec-outcome">
          ${isEquity ? '<option value="term_sheet">Term sheet issued (equity)</option>' : '<option value="sanctioned">Sanction</option>'}
          <option value="declined">Decline</option><option value="referred">Refer elsewhere</option></select></div>
        <div class="field"><label>Amount (₹)</label><input class="input" id="dec-amount" type="number" value="${c.cashflow ? c.cashflow.suggested_facility / 100 : ""}"></div>
        <div class="field"><label>Reason codes</label><select class="select" id="dec-reasons"><option>Validated defence order</option><option>Approved cash-flow model</option><option>Strong IP evidence pack</option><option>incomplete_docs</option><option>buyer_unverified</option></select></div>
        <button class="btn" onclick="SIDBI_A.proposeGo('${caseId}',this)">Send to senior reviewer →</button>`);
    },
    proposeGo(caseId, btn) {
      const c = DB.d.cases.find(x => x.case_id === caseId);
      const amt = Math.round((+document.getElementById("dec-amount").value || 0) * 100);
      const outcome = document.getElementById("dec-outcome").value;
      DB.d.proposals.push({ id: U.uid("PROP"), case_id: caseId, proposed_by: Sess.user().name, outcome, amount: amt, reasons: [document.getElementById("dec-reasons").value], note: "", status: "awaiting_approval", at: new Date().toISOString().slice(0, 10) });
      Audit.add(caseId, Sess.user().name, "decision.proposed", outcome + " " + U.fmtMoney(amt));
      Notify.push("U-SIDBI-002", "review", `Decision proposal pending approval: ${c.company} (${U.fmtMoney(amt)}).`, "#/decisions", "high");
      btn.closest(".modal-backdrop").remove(); DB.save();
      U.toast("Proposal sent to senior reviewer", "success");
    },
    record(propId, approve) {
      const p = DB.d.proposals.find(x => x.id === propId);
      const c = DB.d.cases.find(x => x.case_id === p.case_id);
      if (!approve) { p.status = "rejected"; Audit.add(c.case_id, Sess.user().name, "decision.proposal_declined", p.outcome); DB.save(); App.render(); U.toast("Proposal declined — back to credit officer", ""); return; }
      p.status = "recorded";
      const opened = new Date(c.opened_at), now = new Date();
      c.decision = { outcome: p.outcome, amount: p.amount, at: now.toISOString().slice(0, 10), reasons: p.reasons, tat_days: Math.max(1, Math.round((now - opened) / 864e5)) };
      c.state = "decided";
      Audit.add(c.case_id, Sess.user().name, "decision.recorded", `${p.outcome} ${U.fmtMoney(p.amount)} (TAT ${c.decision.tat_days}d)`);
      if (c.owner_user_id) Notify.push(c.owner_user_id, "decision", `Decision on ${c.case_id}: ${p.outcome === "sanctioned" ? "Sanctioned — " + U.fmtMoney(p.amount) : p.outcome}.`, "#/tracking", "high");
      DB.save(); App.render();
      U.toast("Decision recorded — MSME notified", "success");
    },
    simulate() {
      const st = document.getElementById("sim-stage").value;
      const po = document.getElementById("sim-po").checked;
      const rev = document.getElementById("sim-rev").checked;
      let route, why;
      if ((st === "S1" || st === "S0") && !po && !rev) { route = "equity_grant"; why = "Pre-debt rule BR-RTE-002 fired: no PO, no revenue → equity/grants (VC, seed, iDEX/TDF). Debt shown only as future option."; }
      else if (po) { route = "po_finance"; why = "Confirmed order → PO finance / CASH Defence."; }
      else if (st === "S4") { route = "treds"; why = "Accepted invoice → TReDS."; }
      else if (st === "S5") { route = "term_loan"; why = "Expansion → term loan / CGTMSE."; }
      else { route = "equity_grant"; why = "Default pre-debt handling."; }
      document.getElementById("sim-out").innerHTML = `<div class="card" style="background:var(--info-bg)"><strong>Route: ${U.routeLabel(route)}</strong> ${route === "equity_grant" ? U.badge("pre-debt equity", "gold") : ""}<br><span class="small">${why}</span></div>`;
    }
  };
})();
