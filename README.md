# Defence Credit Copilot — HTML Prototype

SIDBI-branded clickable prototype for the SICF application demo. Static HTML/CSS/JS — no build, no backend. All data is fictional and seeded in `data/*.js`; interactions persist in `localStorage` during the demo (see "Reset").

## Run

```bash
cd Prototype
python3 -m http.server 8080
# Public start page + MSME login:  http://localhost:8080/index.html
# SIDBI staff login:               http://localhost:8080/sidbi.html
```

(Opening the HTML files directly in a browser also works.)

## Entry points

- **`index.html`** — public webpage: product intro, eligibility scope (incl. "trading not supported"), self-onboarding via the questionnaire tree (creates MSME login credentials at the end), and the MSME login card.
- **`sidbi.html`** — SIDBI staff login (case lifecycle: queue → review → RFI → decision → monitoring).
- **`app.html`** — authenticated shell: hamburger left menu, top navbar with notification bell and persona avatar menu (profile / preferences / help / logout).

## Demo credentials

See `CREDENTIALS.md` (printable). Quick set — all passwords `demo123`:

| Portal | Persona | Login |
|---|---|---|
| MSME | Precision Aero (existing PO-finance case) | `msme.precision@demo.in` |
| MSME | Seeker Systems (pre-debt → equity/VC) | `msme.seeker@demo.in` |
| MSME | ShieldTest (TReDS + monitoring) | `msme.shieldtest@demo.in` |
| SIDBI | Anjali Verma (Credit Officer) | `anjali.verma@sidbi.demo` |
| SIDBI | Meera Iyer (Senior Reviewer) | `meera.iyer@sidbi.demo` |
| SIDBI | Rajesh Kumar (Programme Manager) | `rajesh.kumar@sidbi.demo` |

A new applicant account can be created live from the public onboarding page.

## Demo walkthroughs

See `DEMO_SCRIPTS.md` — scripts S1–S6 (~25 minutes total), mapped to SICF evaluation themes.

## Reset

Footer link "Reset demo data" on `index.html`, or Settings → Reset demo data (clears localStorage/sessionStorage and reseeds).

## Source mapping

Built per `../Prototype_dev_task/TASK-01..19` against `../BRD/`, `../FSD/`, `../data_dictionary/`. File layout:

```
Prototype/
  index.html            public landing + MSME login
  sidbi.html            SIDBI staff login
  app.html              authenticated shell (both portals)
  css/                  tokens, base, components, shell (TASK-01/03)
  data/                 users.js, questionnaire.js (tree@1.4.0), seed.js (TASK-02)
  js/core.js            DB/session/i18n/notifications/audit/auth
  js/onboarding.js      public flow: questionnaire engine, classifier, account creation (TASK-05)
  js/app.js             shell + router + persona gating (TASK-03/04)
  js/pages-msme.js      dashboard/tracking/documents/readiness/funding/dossier/monitoring/notifications/settings
  js/pages-sidbi.js     queue/case-review/rfi/decisions/monitoring/outcomes/admin
```

## Disclaimer

Prototype with fictional data for demonstration. Not a loan offer or investment advice; credit/investment decisions rest with regulated institutions. Do not upload real or classified documents.
