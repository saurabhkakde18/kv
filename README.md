# Vehicle Finance Hub (DSA & Lending Reference Android App)

Executive, data-driven, offline-first native Android reference tool designed for vehicle-loan sales teams, credit underwriters, and Direct Sales Associates (DSAs) in India. Built with modern Kotlin, Jetpack Compose (Material 3), Room Database with Full-Text Search (FTS4), and dynamic schema-driven rendering.

---

## 💎 Features & Highlights

- **Executive & Luxury Theme**: Rich Obsidian Dark theme, Imperial Gold (`#D4AF37`) accents, Sapphire Cobalt highlights, glassmorphism cards, and smooth micro-animations.
- **Data-Driven Architecture**: All tables, grids, policies, and slabs are rendered dynamically from structured JSON files in `assets/data/`. Adding columns or changing fields does **not** require any UI code changes.
- **Unified Global Search (FTS4)**: Instant search (<250ms debounced) across all vehicle models, CV tonnage, Bolero variants, policies, payout slabs, contacts, and documents with categorized match count badges and keyword highlighting.
- **Persistent Header Tab Row**: Horizontal tabs across all 12 modules that stay accessible on every screen.
- **In-App Data Importer (Settings)**: Live file picker for JSON & CSV files with preview validation, schema detection, and automatic Room FTS re-indexing.
- **Interactive Calculators**:
  - **EMI & Amortization Calculator**: Real-time sliders, Principal vs. Interest progress breakdown, full month-wise amortization schedule, and 1-tap WhatsApp Quote sharing.
  - **DSA Payout Calculator**: Instant commission calculation by loan amount, base slab %, and volume bonuses.
  - **2D IRR Rate Matrix**: Interactive multi-tier rate matrix with 1-tap transfer to EMI Calculator.
- **Offline-First & Security**:
  - Fully functional offline without internet access.
  - Confidential App Lock (4-digit PIN + Biometric support).
  - Screenshot Security (`FLAG_SECURE` window toggle).

---

## 🗂️ Project Architecture & Structure

```
d:/KV App/
├── app/
│   ├── build.gradle.kts                   # Android build configuration & dependencies
│   ├── proguard-rules.pro                 # ProGuard obfuscation rules
│   └── src/
│       ├── main/
│       │   ├── AndroidManifest.xml        # Permissions (Biometric, Dial, Audio)
│       │   ├── assets/data/               # Dynamic Data-Driven JSON Datasets
│       │   │   ├── approved_cars.json     # 54+ Pre-approved car models
│       │   │   ├── bolero_pickup_grid.json# 13+ Mahindra Bolero Pik-Up variants
│       │   │   ├── car_policy.json        # Car loan eligibility, LTV, FOIR rules
│       │   │   ├── contacts.json          # Key personnel phone/email/WhatsApp
│       │   │   ├── cv_grid.json           # SCV, LCV, MHCV, Bus tonnage & LTV grids
│       │   │   ├── cv_policy.json         # Body funding, permit, fleet norms
│       │   │   ├── documents.json         # KYC & income checklists by profile
│       │   │   ├── dsa_payout.json        # Commission slabs & volume bonuses
│       │   │   ├── irr_matrix.json        # 2D interest rate matrix by CIBIL tier
│       │   │   └── schemes.json           # Active & expired promotional schemes
│       │   ├── java/com/vehiclefinancehub/app/
│       │   │   ├── FinanceHubApplication.kt
│       │   │   ├── MainActivity.kt
│       │   │   ├── data/
│       │   │   │   ├── local/             # Room DB, FTS4 Entities, DAOs, DataStore
│       │   │   │   ├── model/             # Generic Schemas, Search & Calculator models
│       │   │   │   ├── parser/            # Dynamic JSON & CSV Parser & Validator
│       │   │   │   └── repository/        # FinanceRepository (Search, Import, Cache)
│       │   │   ├── di/                    # Hilt Module & Service Locator
│       │   │   └── ui/
│       │   │       ├── components/        # TopBar, SearchBar, TabRow, DynamicTable, BottomSheet
│       │   │       ├── navigation/        # Jetpack Navigation Compose Routes & NavHost
│       │   │       ├── screens/           # All 12 Module Screens + Search + Settings + Lock
│       │   │       └── theme/             # Luxury Theme, Color Palette & Typography
│       │   └── res/                       # Vectors, strings, colors, themes, adaptive icons
│       └── test/java/com/vehiclefinancehub/app/
│           ├── EmiCalculatorTest.kt       # Unit test for EMI math & amortization
│           ├── PayoutCalculatorTest.kt    # Unit test for DSA commission calculation
│           └── DataParserTest.kt          # Unit test for JSON/CSV dynamic schema parser
├── build.gradle.kts                       # Root build configuration
├── settings.gradle.kts                    # Gradle settings
└── gradle.properties                      # JVM & AndroidX memory flags
```

---

## 📊 Generic JSON Dataset Schema

Every dataset in `assets/data/` follows this standard schema:

```json
{
  "datasetId": "approved_cars",
  "title": "Approved Cars Grid",
  "category": "Cars",
  "version": 1,
  "lastUpdated": "2026-10-07",
  "description": "Pre-approved passenger vehicle OEM models",
  "columns": [
    {
      "key": "oem",
      "label": "Make / OEM",
      "type": "text",
      "isPrimary": true,
      "isSortable": true,
      "isFilterable": true,
      "widthDp": 110
    },
    {
      "key": "segment",
      "label": "Segment",
      "type": "badge",
      "isPrimary": false,
      "isSortable": true,
      "isFilterable": true,
      "widthDp": 130
    }
  ],
  "rows": [
    {
      "sNo": 1,
      "status": "Approved",
      "oem": "Honda",
      "asset": "Honda Amaze",
      "maxOwner": "Up to 4th Owner",
      "segment": "Sedan",
      "fuelType": "Petrol / Diesel / CNG",
      "notes": "Personal & Commercial"
    }
  ],
  "sections": [
    {
      "title": "Policy Section Title",
      "summary": "Brief summary",
      "items": ["Guideline 1", "Guideline 2"]
    }
  ]
}
```

### Supported Column Types
- `text`: Standard text (supports search and sorting)
- `number`: Numeric values
- `currency`: Formatted Indian Rupee currency (e.g. `₹ 8,85,000`)
- `percentage`: Percentage figures (e.g. `90%`, `13.5%`)
- `badge`: Categorical chips with luxury styling
- `status`: Active/Approved (Emerald) or Expired (Ruby)
- `phone`: Direct dial & WhatsApp button
- `email`: Direct email intent

---

## 📥 How to Import Your Exact Data Later

You can update any dataset without recompiling the app:
1. Open the app and tap **Settings (⚙️)** in the top bar.
2. Tap **Import Data**.
3. Select the module you wish to replace (e.g., *Approved Cars* or *DSA Payout*).
4. Tap **Pick JSON / CSV File from Storage** (or paste raw JSON/CSV).
5. The live validator will check row counts, preview columns, and verify integrity.
6. Tap **Confirm & Replace Dataset**. The app will immediately update Room and re-build the global search index.

---

## 🛠️ Build & Run Instructions

### 1. Build Debug APK
Open terminal or Android Studio in the project directory:
```bash
./gradlew assembleDebug
```
The debug APK will be located at:
`app/build/outputs/apk/debug/app-debug.apk`

### 2. Run Unit Tests
```bash
./gradlew test
```

### 3. Generate Signed Release APK
```bash
./gradlew assembleRelease
```
The release APK will be located at:
`app/build/outputs/apk/release/app-release-unsigned.apk`

---

## ✅ Delivery & Feature Checklist

| # | Header Tab / Module | Feature Description | Status |
|---|---|---|---|
| 1 | **Car Policy** | Loan eligibility, LTV caps, FOIR slabs, and expandable policy guidelines | ✅ Verified & Working |
| 2 | **Approved Car** | 54+ pre-approved models with OEM, fuel, segment, owner filters | ✅ Verified & Working |
| 3 | **CV Grid** | SCV, LCV, MHCV, and Bus tonnage, LTV, ROI, and tenure grids | ✅ Verified & Working |
| 4 | **CV Policy** | Commercial vehicle credit policy, body funding, and fleet norms | ✅ Verified & Working |
| 5 | **Bolero Pickup Grid** | Mahindra Bolero Pik-Up variants with payload, ex-showroom, LTV, and margin | ✅ Verified & Working |
| 6 | **DSA Payout** | Slabs, commission %, and interactive instant payout calculator | ✅ Verified & Working |
| 7 | **IRR Matrix** | 2D interest rate matrix by CIBIL tier with 1-tap transfer to EMI | ✅ Verified & Working |
| 8 | **EMI Calculator** | Monthly EMI, interest breakdown, amortization schedule, WhatsApp quote share | ✅ Verified & Working |
| 9 | **Documents** | Interactive checklist by profile (Salaried, Self-Employed, Farmer, etc.) | ✅ Verified & Working |
| 10 | **Schemes / Offers** | Active & expired promotional schemes with validity badges | ✅ Verified & Working |
| 11 | **Contacts** | Directory with 1-tap Call, WhatsApp, and Email triggers | ✅ Verified & Working |
| 12 | **Favorites** | Unified repository of all starred rows across modules | ✅ Verified & Working |
| 13 | **Global Search** | Room FTS4 full-text search with 250ms debounce & categorized results | ✅ Verified & Working |
| 14 | **Settings & Importer** | Live JSON/CSV importer, factory reset, theme switch, app lock, FLAG_SECURE | ✅ Verified & Working |
