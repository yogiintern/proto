/* TASK-02 — domain seed data (fictional; shapes follow data_dictionary) */
window.DCC_SEED = {
  companies: [
    { enterprise_id:"ENT-DEMO-001", legal_name:"Precision Aero Components Pvt Ltd", udyam:"UDYAM-MH-19-0043210", gstin:"27AAQCP8821F1Z5", constitution:"pvt_ltd", category:"small", activity_class:"manufacturing", buyer_types:["tier1"], product_category:"machining", city:"Pune, Maharashtra" },
    { enterprise_id:"ENT-DEMO-002", legal_name:"Seeker Systems LLP", udyam:"UDYAM-KA-03-0099887", gstin:"29ABDFS4433K1Z2", constitution:"llp", category:"micro", activity_class:"manufacturing", buyer_types:["idex"], product_category:"electronics", city:"Bengaluru, Karnataka" },
    { enterprise_id:"ENT-DEMO-003", legal_name:"ShieldTest Services Pvt Ltd", udyam:"UDYAM-TN-24-0066112", gstin:"33AAWCS9917M1Z9", constitution:"pvt_ltd", category:"small", activity_class:"services", buyer_types:["oem"], product_category:"testing", city:"Chennai, Tamil Nadu" },
    { enterprise_id:"ENT-DEMO-104", legal_name:"Astra Composites", udyam:"UDYAM-GJ-01-0022004", gstin:"24AAOCA1122B1Z6", constitution:"partnership", category:"micro", activity_class:"manufacturing", buyer_types:["oem"], product_category:"composites", city:"Ahmedabad, Gujarat" },
    { enterprise_id:"ENT-DEMO-107", legal_name:"Helios Defence Software", udyam:"UDYAM-DL-07-0077451", gstin:"07AAECH5566P1Z4", constitution:"pvt_ltd", category:"micro", activity_class:"services", buyer_types:["idex"], product_category:"software", city:"New Delhi" }
  ],

  cases: [
    {
      case_id:"CASE-DEMO-001", enterprise_id:"ENT-DEMO-001", company:"Precision Aero Components Pvt Ltd",
      owner_user_id:"U-MSME-001", stage:"S2", route:"po_finance", readiness:78, state:"rfi", cohort:"C1",
      channel:"DIA — Pune defence cluster", officer:"Anjali Verma", assigned:"U-SIDBI-001",
      opened_at:"2026-09-28", sla_days_in_queue:6,
      card:{ offering:"CNC-machined avionics brackets and housings", buyer_types:["tier1"], procurement_path:["direct_tier1"], stage:"S2", confidence:0.93 },
      order:{ buyer:"Tier-1 vendor to HAL", order_value:850000000, currency:"INR", pbg_pct:10, emd_amount:0, ld_cap_pct:5,
        milestones:[ {name:"Raw material & tooling", due:"2026-11-15", amount:21250000, status:"pending"},
                     {name:"First article inspection (gate)", due:"2027-01-10", amount:21250000, status:"pending", gate:true},
                     {name:"Batch production 1", due:"2027-03-05", amount:25500000, status:"pending"},
                     {name:"Final delivery & acceptance", due:"2027-04-20", amount:17000000, status:"pending"} ],
        payment_triggers:[{event:"Milestone acceptance", days:30}], inspection_gates:["First article inspection by DGAQA-nominated authority"],
        ld_clause:"LD 0.5%/week of delayed portion, capped at 5% of order value.", reviewed:true },
      cashflow:{ formula_version:"cf-2.1.0", buffer_pct:10, peak_gap:31500000, suggested_facility:31500000,
        repayment_source:"Milestone receipts M1–M4 (buyer pays ≤30 days of acceptance)",
        monthly:[ {m:"Nov-26", uses:18000000, sources:0, net:-18000000}, {m:"Dec-26", uses:9500000, sources:0, net:-27500000},
                  {m:"Jan-27", uses:6500000, sources:21250000, net:-12750000}, {m:"Feb-27", uses:7000000, sources:0, net:-19750000},
                  {m:"Mar-27", uses:8000000, sources:25500000, net:-2250000}, {m:"Apr-27", uses:5000000, sources:17000000, net:9750000} ],
        approved_by:"R. Menon, CA", approved_at:"2026-10-06" },
      readinessFindings:[
        { check:"buyer_acceptance", dim:"order_buyer_evidence", status:"gap", severity:"high", text:"Buyer acceptance letter for the PO not yet on file", task:"Obtain countersigned PO acceptance from Tier-1 buyer", help:"expert" },
        { check:"insurance", dim:"compliance_insurance", status:"gap", severity:"medium", text:"Marine-cum-erection insurance certificate missing", task:"Upload insurance certificate", help:"self" },
        { check:"registrations", dim:"registrations", status:"met", severity:"high", text:"Udyam + GST verified" },
        { check:"financials", dim:"financial_records", status:"met", severity:"high", text:"Audited financials FY24, FY25 verified" } ],
      routing:{ route:"po_finance", instruments:["po_finance_cash_defence"], rationale_key:"rationale.s2.po",
        eligibility:[{c:"Validated defence PO", s:"met"},{c:"Buyer acceptance", s:"gap"},{c:"Order cash-flow model approved", s:"met"},{c:"CGTMSE eligibility", s:"met"}],
        action_plan:[{step:"Respond to RFI items", eta:"2 days"},{step:"Credit officer review", eta:"~1 week"},{step:"Sanction & documentation", eta:"1–2 weeks"}],
        rules_version:"2.1.0" },
      ip:{ completeness:55, design_ownership:"build_to_print", trl:null, certs:["ISO 9001:2015"], traction:[], review_flags:[] },
      dossier:{ version:3, type:"credit", status:"transmitted", approved_at:"2026-10-05",
        artefacts:[
          {kind:"credit_memo", title:"Credit Memo — PO Finance ₹31.5L", review:"approved", sources:["PO uploaded 02 Oct","Cash-flow model v2","Audited FY25"]},
          {kind:"order_summary", title:"Order Interpretation Summary", review:"approved", sources:["PO uploaded 02 Oct","Domain review: R. Menon"]},
          {kind:"cashflow_statement", title:"Cash-Flow Statement (6 months)", review:"approved", sources:["Cash-flow model v2"]},
          {kind:"use_of_funds", title:"Use of Funds Plan", review:"approved", sources:["Questionnaire QR-09"]},
          {kind:"risk_mitigation", title:"Risk-Mitigation Sheet", review:"approved", sources:["LD clause extract","Insurance gap note"]} ] },
      transmissions:[ {txn:"TXN-1001", partner:"SIDBI Defence Desk", scope:"credit_application", status:"rfi", sent:"2026-10-06", acked:"2026-10-07"} ],
      rfi:{ id:"RFI-501", status:"open", raised:"2026-10-09", due:"2026-10-16",
        items:[{key:"gst_fy25", text:"GST return — FY 2025-26 (latest filed)"},{key:"buyer_acceptance", text:"Countersigned buyer acceptance letter for the PO"}] },
      documents:[
        {name:"PO_HAL_Tier1.pdf", type:"po", scan:"clean", verified:true, uploaded:"2026-10-02"},
        {name:"Audited-FY25.pdf", type:"financial_statement", scan:"clean", verified:true, uploaded:"2026-10-02"},
        {name:"Bank-Stmt-Sep26.pdf", type:"bank_statement", scan:"clean", verified:false, uploaded:"2026-10-04"} ],
      consents:[ {purpose:"profile_building", to:"Platform", expiry:"2027-04-01", revoked:false},
                 {purpose:"credit_application", to:"SIDBI Defence Desk", expiry:"2027-04-01", revoked:false} ],
      decision:null, monitoring:null
    },
    {
      case_id:"CASE-DEMO-002", enterprise_id:"ENT-DEMO-002", company:"Seeker Systems LLP",
      owner_user_id:"U-MSME-002", stage:"S1", route:"equity_grant", readiness:64, state:"transmitted", cohort:"C2",
      channel:"iDEX partner incubator", officer:"Anjali Verma", assigned:"U-SIDBI-001",
      opened_at:"2026-09-15", sla_days_in_queue:12,
      card:{ offering:"Indigenous seeker-head signal processor (own design)", buyer_types:["idex"], procurement_path:["idex"], stage:"S1", confidence:0.9 },
      order:null, cashflow:null,
      runway:{ grant_inflows:[{scheme:"iDEX", tranche:"T2", amount:60000000, expected:"2026-12-01"}],
        monthly_burn:{team:2600000, prototyping:1400000, testing:900000, other:400000},
        runway_months:7.4, target_milestone:"Sea-trial evaluation + first limited-series PO",
        gap_to_milestone:180000000, ask_range:[150000000,220000000], approved_by:"R. Menon, CA", approved_at:"2026-09-30" },
      readinessFindings:[
        { check:"financials", dim:"financial_records", status:"gap", severity:"medium", text:"No audited financials yet (first year)", task:"Prepare CA-certified statement of accounts", help:"ca" },
        { check:"ip", dim:"ip_technical", status:"met", severity:"high", text:"2 patents filed; design authority evidenced" },
        { check:"registrations", dim:"registrations", status:"met", severity:"high", text:"Udyam + GST verified" } ],
      routing:{ route:"equity_grant", instruments:["vc_seed","incubator_seed","idex_prime"], rationale_key:"rationale.s1.equity",
        eligibility:[{c:"IP & technical evidence pack ≥60%", s:"met"},{c:"Runway model approved", s:"met"},{c:"Financial records", s:"gap"},{c:"Grant traction (iDEX)", s:"met"}],
        action_plan:[{step:"Evidence pack to 2 VC partners", eta:"done"},{step:"Investor meetings", eta:"2–4 weeks"},{step:"iDEX Prime application", eta:"parallel"}],
        future_options:[{route:"po_finance", unlock:"when you have a confirmed purchase order"}],
        rules_version:"2.1.0", is_predebt_equity:true },
      ip:{ completeness:82, design_ownership:"own", trl:5, trl_evidence:"Trial report TR-05 (non-classified summary)",
        items:[{type:"patent", number:"IN 202541-00871", status:"filed"},{type:"patent", number:"IN 202541-01102", status:"filed"}],
        indigenisation_band:"50_70", certs:[], traction:[{programme:"iDEX", status:"T1 disbursed"},{programme:"iDEX Prime", status:"eligible"}],
        review_flags:[], pack:{ status:"approved", reviewer:"Dr. K. Bhatt (domain expert)", version:2, generated:"2026-09-29" } },
      dossier:{ version:2, type:"equity", status:"transmitted", approved_at:"2026-09-29",
        artefacts:[
          {kind:"investor_dossier", title:"Investor Dossier — Seeker Systems", review:"approved", sources:["Business-model card","IP evidence pack v2","Runway model v1"]},
          {kind:"runway_model", title:"Runway & Milestone Budget", review:"approved", sources:["Runway model v1","iDEX sanction letter"]},
          {kind:"ip_evidence_pack", title:"IP & Technical Evidence Pack", review:"approved", sources:["Patent filings","TRL evidence TR-05"]},
          {kind:"use_of_funds", title:"Use of Funds Plan", review:"approved", sources:["Runway model v1"]} ] },
      transmissions:[
        {txn:"TXN-2001", partner:"Bharat Defence Ventures", scope:"equity_referral", status:"under_review", sent:"2026-09-30", acked:"2026-10-01"},
        {txn:"TXN-2002", partner:"SIDBI Seed Programme", scope:"equity_referral", status:"under_review", sent:"2026-09-30", acked:"2026-10-02"} ],
      rfi:null,
      documents:[ {name:"iDEX-sanction.pdf", type:"compliance_certificate", scan:"clean", verified:true, uploaded:"2026-09-20"},
                  {name:"Patent-871.pdf", type:"ip_certificate", scan:"clean", verified:true, uploaded:"2026-09-20"} ],
      consents:[ {purpose:"profile_building", to:"Platform", expiry:"2027-03-15", revoked:false},
                 {purpose:"equity_referral", to:"Bharat Defence Ventures, SIDBI Seed Programme", expiry:"2027-03-15", revoked:false} ],
      decision:null,
      monitoring:{ kind:"runway", note:"Post-term-sheet runway watch (demo)", alerts:[] }
    },
    {
      case_id:"CASE-DEMO-003", enterprise_id:"ENT-DEMO-003", company:"ShieldTest Services Pvt Ltd",
      owner_user_id:"U-MSME-003", stage:"S4", route:"treds", readiness:88, state:"monitoring", cohort:"C3",
      channel:"Defence & Aerospace Association, Chennai", officer:"Anjali Verma", assigned:"U-SIDBI-001",
      opened_at:"2026-08-22", sla_days_in_queue:0,
      card:{ offering:"Environmental & EMI/EMC testing services for OEMs", buyer_types:["oem"], procurement_path:["direct_tier1"], stage:"S4", confidence:0.95 },
      order:{ buyer:"Private OEM (defence electronics)", order_value:120000000, currency:"INR",
        milestones:[{name:"Test campaign 1", due:"2026-09-30", amount:40000000, status:"paid"}],
        payment_triggers:[{event:"Invoice acceptance", days:45}], inspection_gates:[], ld_clause:"—", reviewed:true },
      cashflow:null, runway:null,
      invoices:[ {number:"INV-1023", date:"2026-09-30", amount:40000000, acceptance:"accepted", due:"2026-11-14", paid:false, treds_routed:true},
                 {number:"INV-1041", date:"2026-10-10", amount:25000000, acceptance:"pending", due:"2026-11-24", paid:false, treds_routed:false} ],
      readinessFindings:[ {check:"receivable_docs", dim:"order_buyer_evidence", status:"gap", severity:"medium", text:"INV-1041 acceptance pending from buyer", task:"Follow up with OEM for invoice acceptance", help:"self"} ],
      routing:{ route:"treds", instruments:["treds"], rationale_key:"rationale.s4.treds",
        eligibility:[{c:"Accepted invoice from eligible buyer", s:"met"},{c:"TReDS onboarding", s:"met"}],
        action_plan:[{step:"Bid window on TReDS platform", eta:"1–2 days"}], rules_version:"2.1.0" },
      ip:{ completeness:40, design_ownership:"build_to_print", trl:null, certs:["ISO/IEC 17025"], traction:[], review_flags:[] },
      dossier:{ version:1, type:"credit", status:"transmitted", approved_at:"2026-09-01",
        artefacts:[ {kind:"invoice_pack", title:"Invoice Pack — INV-1023", review:"approved", sources:["Invoice upload","Buyer acceptance"]} ] },
      transmissions:[ {txn:"TXN-3001", partner:"TReDS Partner (RXIL)", scope:"credit_application", status:"decided", sent:"2026-09-02", acked:"2026-09-02"} ],
      rfi:null,
      documents:[ {name:"INV-1023.pdf", type:"invoice", scan:"clean", verified:true, uploaded:"2026-09-30"} ],
      consents:[ {purpose:"profile_building", to:"Platform", expiry:"2027-02-22", revoked:false},
                 {purpose:"monitoring", to:"SIDBI Defence Desk", expiry:"2027-02-22", revoked:false} ],
      decision:{ outcome:"sanctioned", amount:38000000, at:"2026-09-05", reasons:["Accepted invoice, strong buyer"], tat_days:3 },
      monitoring:{ kind:"receivables",
        rules:[ {id:"AR-1", trigger:"invoice_ageing", threshold:">60 days", severity:"warning", recipients:["MSME","Credit Officer"]},
                {id:"AR-2", trigger:"milestone_overdue", threshold:"7 days", severity:"critical", recipients:["MSME","Credit Officer"]} ],
        alerts:[ {id:"AL-301", kind:"invoice_ageing", severity:"warning", text:"INV-1023 unpaid — 13 days to due date window", at:"2026-10-11", rule:"AR-1"} ],
        milestones:[ {name:"Test campaign 2", due:"2026-11-30", status:"at_risk"} ] }
    },
    // SIDBI queue filler rows
    { case_id:"CASE-0104", enterprise_id:"ENT-DEMO-104", company:"Astra Composites", owner_user_id:null, stage:"S2", route:"po_finance", readiness:61, state:"new", cohort:"C1", officer:"Anjali Verma", assigned:"U-SIDBI-001", opened_at:"2026-10-11", sla_days_in_queue:2, card:{offering:"Composite radomes", buyer_types:["oem"], procurement_path:["direct_tier1"], stage:"S2", confidence:0.88}, documents:[], transmissions:[], consents:[], decision:null, monitoring:null, rfi:null },
    { case_id:"CASE-0107", enterprise_id:"ENT-DEMO-107", company:"Helios Defence Software", owner_user_id:null, stage:"S1", route:"equity_grant", readiness:52, state:"new", cohort:"C2", officer:"Anjali Verma", assigned:"U-SIDBI-001", opened_at:"2026-10-12", sla_days_in_queue:1, card:{offering:"Mission-planning software (iDEX grantee)", buyer_types:["idex"], procurement_path:["idex"], stage:"S1", confidence:0.86}, documents:[], transmissions:[], consents:[], decision:null, monitoring:null, rfi:null }
  ],

  partners: [
    { id:"PRT-RE-01", type:"re", name:"SIDBI Defence Desk", integration:"api", scopes:["credit_application"], sla_hours:48, status:"active", instruments:["po_finance_cash_defence","bank_cashflow_loan","cgtmse_facility","term_loan"] },
    { id:"PRT-RE-02", type:"re", name:"NBFC Growth Capital", integration:"portal", scopes:["credit_application"], sla_hours:72, status:"active", instruments:["bank_cashflow_loan"] },
    { id:"PRT-VC-01", type:"vc", name:"Bharat Defence Ventures", integration:"api", scopes:["equity_referral"], sla_hours:72, status:"active", instruments:["vc_seed"] },
    { id:"PRT-VC-02", type:"vc", name:"SIDBI Seed Programme", integration:"portal", scopes:["equity_referral"], sla_hours:96, status:"active", instruments:["vc_seed","incubator_seed"] },
    { id:"PRT-TREDS-01", type:"treds", name:"TReDS Partner (RXIL)", integration:"api", scopes:["credit_application"], sla_hours:24, status:"active", instruments:["treds"] },
    { id:"PRT-INC-01", type:"incubator", name:"iDEX Partner Incubator — Bengaluru", integration:"email", scopes:["equity_referral"], sla_hours:96, status:"active", instruments:["incubator_seed","idex_prime"] },
    { id:"PRT-EXP-01", type:"expert", name:"R. Menon, CA", integration:"email", scopes:["profile_building"], sla_hours:24, status:"active" },
    { id:"PRT-EXP-02", type:"expert", name:"Dr. K. Bhatt, IP attorney", integration:"email", scopes:["profile_building"], sla_hours:24, status:"active" }
  ],

  notifications: [
    { id:"N-001", user_id:"U-MSME-001", type:"rfi", text:"SIDBI requested 2 items for CASE-DEMO-001 (GST return FY25, buyer acceptance letter).", link:"#/tracking", read:false, at:"2026-10-09", severity:"high" },
    { id:"N-002", user_id:"U-MSME-001", type:"dossier", text:"Your dossier v3 was transmitted to SIDBI Defence Desk.", link:"#/tracking", read:true, at:"2026-10-06", severity:"normal" },
    { id:"N-003", user_id:"U-MSME-002", type:"route", text:"Funding route ready: Equity & Grants (pre-debt). 2 investors received your evidence pack.", link:"#/funding", read:false, at:"2026-09-30", severity:"high" },
    { id:"N-004", user_id:"U-MSME-003", type:"alert", text:"Alert: INV-1023 unpaid — ageing watch (rule AR-1).", link:"#/monitoring", read:false, at:"2026-10-11", severity:"warning" },
    { id:"N-005", user_id:"U-SIDBI-001", type:"case", text:"CASE-DEMO-001 RFI due in 3 days.", link:"#/case/CASE-DEMO-001", read:false, at:"2026-10-13", severity:"high" },
    { id:"N-006", user_id:"U-SIDBI-002", type:"review", text:"Decision proposal pending your approval: CASE-DEMO-001 (₹31.5L).", link:"#/decisions", read:false, at:"2026-10-12", severity:"high" },
    { id:"N-007", user_id:"U-SIDBI-003", type:"system", text:"Weekly outcome snapshot is ready.", link:"#/outcomes", read:true, at:"2026-10-12", severity:"normal" }
  ],

  proposals: [
    { id:"PROP-1", case_id:"CASE-DEMO-001", proposed_by:"Anjali Verma", outcome:"sanctioned", amount:31500000, reasons:["Validated defence order","Approved cash-flow model"], note:"Recommend PO finance under CASH Defence.", status:"awaiting_approval", at:"2026-10-12" }
  ],

  metrics: {
    funnel:[ {k:"Reached", v:10000}, {k:"Diagnostics", v:3000}, {k:"Guided journeys", v:1500}, {k:"Dossiers", v:750}, {k:"Transmitted", v:300}, {k:"Decisions", v:150}, {k:"Sanctions", v:87} ],
    dropoffs:{ "Reached→Diagnostics":"No Udyam / not defence", "Diagnostics→Guided":"Document gaps", "Dossiers→Transmitted":"Consent pending" },
    kpis:{ satisfaction:84, doc_prep_reduction:43, traceability_pass:96, median_tat:11 },
    equity:{ packs_sent:118, vc_referrals:96, investor_meetings:41, term_sheets:9 },
    scope_gate_exits: 214
  },

  config: {
    routing_rules:[
      { when:"Stage S0/S1 AND no confirmed PO AND no revenue", then:"equity_grant → VC/seed funds, incubator seed, iDEX/TDF", highlight:true },
      { when:"Stage S2 (confirmed order)", then:"po_finance / cashflow_loan (CASH Defence up to ₹20 Cr)" },
      { when:"Stage S3 (guarantees)", then:"non-fund BG/LC limits" },
      { when:"Stage S4 (invoice accepted)", then:"treds / factoring" },
      { when:"Stage S5 (expansion)", then:"term_loan / CGTMSE facility" },
      { when:"Stage S6 (export order)", then:"export credit" }
    ],
    model_inventory:[
      { agent:"AGT-01 Profiler", model:"extract-llm v4.2", purpose:"Profile extraction", data:"identity", gate:"gs-1.8 ✔" },
      { agent:"AGT-02 Order Parser", model:"doc-llm v3.9", purpose:"PO term extraction", data:"order_docs", gate:"gs-1.8 ✔" },
      { agent:"AGT-03 Cash-Flow", model:"deterministic cf-2.1.0", purpose:"Sources & uses", data:"financial", gate:"unit ✔" },
      { agent:"AGT-05 Capital Router", model:"rules engine 2.1.0", purpose:"Stage→instrument", data:"—", gate:"unit ✔" },
      { agent:"AGT-06 Credit-Pack", model:"draft-llm v4.2", purpose:"Dossier narratives", data:"financial, order_docs", gate:"gs-1.8 ✔" },
      { agent:"AGT-07 Compliance/IP", model:"extract-llm v4.2", purpose:"IP evidence extraction", data:"ip_docs", gate:"gs-1.8 ✔" }
    ]
  }
};
