/* TASK-02 — personas & credentials (fictional demo data) */
window.DCC_USERS = [
  // MSME portal users (index.html)
  { id: "U-MSME-001", portal: "msme", email: "msme.precision@demo.in", password: "demo123",
    name: "Rohan Kulkarni", role: "owner", roleLabel: "Founder & MD", org: "Precision Aero Components Pvt Ltd",
    persona_key: "precision", avatar_initials: "RK", locale: "en", phone_masked: "+91 98•••••210",
    case_ids: ["CASE-DEMO-001"] },
  { id: "U-MSME-002", portal: "msme", email: "msme.seeker@demo.in", password: "demo123",
    name: "Dr. Ananya Rao", role: "owner", roleLabel: "Co-founder & CTO", org: "Seeker Systems LLP",
    persona_key: "seeker", avatar_initials: "AR", locale: "en", phone_masked: "+91 97•••••455",
    case_ids: ["CASE-DEMO-002"] },
  { id: "U-MSME-003", portal: "msme", email: "msme.shieldtest@demo.in", password: "demo123",
    name: "Vikram Nair", role: "owner", roleLabel: "Director", org: "ShieldTest Services Pvt Ltd",
    persona_key: "shieldtest", avatar_initials: "VN", locale: "hi", phone_masked: "+91 99•••••870",
    case_ids: ["CASE-DEMO-003"] },
  // SIDBI portal users (sidbi.html)
  { id: "U-SIDBI-001", portal: "sidbi", email: "anjali.verma@sidbi.demo", password: "demo123",
    name: "Anjali Verma", role: "credit_officer", roleLabel: "Credit Officer — Defence Desk", org: "SIDBI",
    persona_key: "anjali", avatar_initials: "AV", locale: "en", phone_masked: "+91 96•••••112", case_ids: [] },
  { id: "U-SIDBI-002", portal: "sidbi", email: "meera.iyer@sidbi.demo", password: "demo123",
    name: "Meera Iyer", role: "senior_reviewer", roleLabel: "Senior Credit Reviewer", org: "SIDBI",
    persona_key: "meera", avatar_initials: "MI", locale: "en", phone_masked: "+91 96•••••345", case_ids: [] },
  { id: "U-SIDBI-003", portal: "sidbi", email: "rajesh.kumar@sidbi.demo", password: "demo123",
    name: "Rajesh Kumar", role: "programme_manager", roleLabel: "Programme Manager — PDI (SICF)", org: "SIDBI",
    persona_key: "rajesh", avatar_initials: "RJ", locale: "en", phone_masked: "+91 96•••••778", case_ids: [] }
];
