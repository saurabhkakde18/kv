/**
 * VEHICLE FINANCE HUB — LOCAL INTERACTIVE APPLICATION ENGINE (JS)
 * Fully Data-Driven, Dynamic Schemas, Global FTS-Style Search, Financial Calculators.
 */

// Global App State
const state = {
  activeTab: 'dashboard',
  history: ['dashboard'],
  searchQuery: '',
  searchFilter: 'ALL',
  favorites: JSON.parse(localStorage.getItem('vfh_favorites') || '[]'),
  checkedDocs: JSON.parse(localStorage.getItem('vfh_checked_docs') || '{}'),
  theme: localStorage.getItem('vfh_theme') || 'DARK',
  appLockEnabled: localStorage.getItem('vfh_app_lock') === 'true',
  dataVersion: 1,
  lastUpdated: '2026-10-07',

  // EMI State
  emiAmount: 800000,
  emiRate: 9.25,
  emiTenure: 60,

  // Payout State
  payoutAmount: 1000000,
  payoutBasePct: 1.50,
  payoutBonusPct: 0.20,

  // Datasets Store
  datasets: {}
};

// Initial Data Loading
async function loadDatasets() {
  // 1. ALWAYS populate in-memory fallback datasets immediately first
  loadFallbackDatasets();

  // 2. Clear old cached localStorage data if schema version bumped
  const APP_DATA_VERSION = '2026.10.07-v6';
  if (localStorage.getItem('vfh_data_version') !== APP_DATA_VERSION) {
    const datasetKeys = ['approved_cars', 'car_policy', 'cv_grid', 'cv_policy', 'bolero_pickup_grid', 'dsa_payout', 'irr_matrix', 'charges', 'documents', 'contacts', 'schemes'];
    datasetKeys.forEach(k => localStorage.removeItem(`vfh_dataset_${k}`));
    localStorage.setItem('vfh_data_version', APP_DATA_VERSION);
  }

  const datasetIds = [
    'approved_cars',
    'car_policy',
    'cv_grid',
    'cv_policy',
    'bolero_pickup_grid',
    'charges',
    'dsa_payout',
    'irr_matrix',
    'documents',
    'contacts',
    'schemes'
  ];

  for (const id of datasetIds) {
    const saved = localStorage.getItem(`vfh_dataset_${id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.datasetId) {
          state.datasets[id] = parsed;
          continue;
        }
      } catch (e) {
        console.error(e);
      }
    }

    const pathsToTry = [
      `./data/${id}.json`,
      `../app/src/main/assets/data/${id}.json`,
      `/app/src/main/assets/data/${id}.json`,
      `data/${id}.json`
    ];

    for (const p of pathsToTry) {
      try {
        const resp = await fetch(p);
        if (resp.ok) {
          const json = await resp.json();
          if (json && json.datasetId) {
            state.datasets[id] = json;
            break;
          }
        }
      } catch (e) {
        // Continue trying next path
      }
    }
  }

  updateFavCount();
  renderView();
}

function loadFallbackDatasets() {
  // Built-in default datasets matching assets/data/
  state.datasets['approved_cars'] = {
    datasetId: 'approved_cars',
    title: 'Approved Cars Grid',
    category: 'Cars',
    columns: [
      { key: 'sNo', label: 'S.No', type: 'number', isPrimary: false, isSortable: true, isFilterable: false },
      { key: 'status', label: 'Status', type: 'status', isPrimary: false, isSortable: true, isFilterable: true },
      { key: 'oem', label: 'OEM', type: 'text', isPrimary: true, isSortable: true, isFilterable: true },
      { key: 'asset', label: 'Asset / Model', type: 'text', isPrimary: true, isSortable: true, isFilterable: true },
      { key: 'maxOwner', label: 'Max Owner Permitted', type: 'badge', isPrimary: false, isSortable: true, isFilterable: true },
      { key: 'segment', label: 'Segment', type: 'badge', isPrimary: false, isSortable: true, isFilterable: true },
      { key: 'fuelType', label: 'Fuel Type', type: 'text', isPrimary: false, isSortable: true, isFilterable: true },
      { key: 'remarks', label: 'Financing Remarks', type: 'text', isPrimary: false, isSortable: false, isFilterable: true }
    ],
    rows: [
      { sNo: 1, status: "Approved", oem: "Honda", asset: "Honda Amaze", maxOwner: "Up to 4th Owner", segment: "Sedan", fuelType: "Petrol / Diesel / CNG", remarks: "Personal & Commercial" },
      { sNo: 2, status: "Approved", oem: "Honda", asset: "Honda City", maxOwner: "Up to 4th Owner", segment: "Sedan", fuelType: "Petrol / Diesel", remarks: "Personal & Commercial" },
      { sNo: 3, status: "Approved", oem: "Honda", asset: "Honda WR-V", maxOwner: "Up to 4th Owner", segment: "Compact SUV", fuelType: "Petrol / Diesel", remarks: "Personal Only" },
      { sNo: 4, status: "Approved", oem: "Hyundai", asset: "Hyundai Aura", maxOwner: "Up to 4th Owner", segment: "Sedan", fuelType: "Petrol / CNG", remarks: "Personal & Commercial" },
      { sNo: 5, status: "Approved", oem: "Hyundai", asset: "Hyundai Creta", maxOwner: "Up to 4th Owner", segment: "SUV", fuelType: "Petrol / Diesel", remarks: "Personal Only" },
      { sNo: 6, status: "Approved", oem: "Hyundai", asset: "Hyundai Grand I 10", maxOwner: "Up to 4th Owner", segment: "Hatchback", fuelType: "Petrol / CNG", remarks: "Personal & Commercial" },
      { sNo: 7, status: "Approved", oem: "Hyundai", asset: "Hyundai I 10", maxOwner: "Up to 4th Owner", segment: "Hatchback", fuelType: "Petrol", remarks: "Personal Only" },
      { sNo: 8, status: "Approved", oem: "Hyundai", asset: "Hyundai I 20", maxOwner: "Up to 4th Owner", segment: "Premium Hatchback", fuelType: "Petrol / Diesel", remarks: "Personal Only" },
      { sNo: 9, status: "Approved", oem: "Hyundai", asset: "Hyundai Venue", maxOwner: "Up to 4th Owner", segment: "Compact SUV", fuelType: "Petrol / Diesel", remarks: "Personal Only" },
      { sNo: 10, status: "Approved", oem: "Hyundai", asset: "Hyundai Verna", maxOwner: "Up to 4th Owner", segment: "Sedan", fuelType: "Petrol / Diesel", remarks: "Personal Only" },
      { sNo: 11, status: "Approved", oem: "Hyundai", asset: "Hyundai Xcent", maxOwner: "Up to 4th Owner", segment: "Sedan", fuelType: "Petrol / CNG", remarks: "Personal & Commercial" },
      { sNo: 12, status: "Approved", oem: "Jeep", asset: "Jeep Compass", maxOwner: "Up to 4th Owner", segment: "Premium SUV", fuelType: "Petrol / Diesel", remarks: "Personal Only" },
      { sNo: 13, status: "Approved", oem: "Kia", asset: "Kia Seltos", maxOwner: "Up to 4th Owner", segment: "SUV", fuelType: "Petrol / Diesel", remarks: "Personal Only" },
      { sNo: 14, status: "Approved", oem: "Kia", asset: "Kia Sonet", maxOwner: "Up to 4th Owner", segment: "Compact SUV", fuelType: "Petrol / Diesel", remarks: "Personal Only" },
      { sNo: 15, status: "Approved", oem: "Mahindra", asset: "Mahindra Bolero", maxOwner: "Up to 5th Owner", segment: "MUV / Utility", fuelType: "Diesel", remarks: "Personal & Commercial" },
      { sNo: 16, status: "Approved", oem: "Mahindra", asset: "Mahindra Scorpio S 10", maxOwner: "Up to 4th Owner", segment: "SUV", fuelType: "Diesel", remarks: "Personal & Commercial" },
      { sNo: 17, status: "Approved", oem: "Mahindra", asset: "Mahindra Scorpio S 11", maxOwner: "Up to 4th Owner", segment: "SUV", fuelType: "Diesel", remarks: "Personal & Commercial" },
      { sNo: 18, status: "Approved", oem: "Mahindra", asset: "Mahindra Thar", maxOwner: "Up to 4th Owner", segment: "Lifestyle 4x4 SUV", fuelType: "Petrol / Diesel", remarks: "Personal Only" },
      { sNo: 19, status: "Approved", oem: "Mahindra", asset: "Mahindra XUV 300", maxOwner: "Up to 4th Owner", segment: "Compact SUV", fuelType: "Petrol / Diesel", remarks: "Personal Only" },
      { sNo: 20, status: "Approved", oem: "Maruti", asset: "Maruti Alto", maxOwner: "Up to 4th Owner", segment: "Hatchback", fuelType: "Petrol / CNG", remarks: "Personal Only" },
      { sNo: 21, status: "Approved", oem: "Maruti", asset: "Maruti Alto 800", maxOwner: "Up to 4th Owner", segment: "Hatchback", fuelType: "Petrol / CNG", remarks: "Personal Only" },
      { sNo: 22, status: "Approved", oem: "Maruti", asset: "Maruti Alto K 10", maxOwner: "Up to 4th Owner", segment: "Hatchback", fuelType: "Petrol / CNG", remarks: "Personal Only" },
      { sNo: 23, status: "Approved", oem: "Maruti", asset: "Maruti Baleno", maxOwner: "Up to 4th Owner", segment: "Premium Hatchback", fuelType: "Petrol / CNG", remarks: "Personal Only" },
      { sNo: 24, status: "Approved", oem: "Maruti", asset: "Maruti Celerio", maxOwner: "Up to 4th Owner", segment: "Hatchback", fuelType: "Petrol / CNG", remarks: "Personal Only" },
      { sNo: 25, status: "Approved", oem: "Maruti", asset: "Maruti Ciaz", maxOwner: "Up to 4th Owner", segment: "Sedan", fuelType: "Petrol / Diesel / Smart Hybrid", remarks: "Personal & Commercial" },
      { sNo: 26, status: "Approved", oem: "Maruti", asset: "Maruti Eeco", maxOwner: "Up to 4th Owner", segment: "Van / Commercial", fuelType: "Petrol / CNG", remarks: "Personal & Commercial" },
      { sNo: 27, status: "Approved", oem: "Maruti", asset: "Maruti Ertiga", maxOwner: "Up to 4th Owner", segment: "MUV", fuelType: "Petrol / CNG", remarks: "Personal & Commercial" },
      { sNo: 28, status: "Approved", oem: "Maruti", asset: "Maruti Ignis", maxOwner: "Up to 4th Owner", segment: "Hatchback", fuelType: "Petrol", remarks: "Personal Only" },
      { sNo: 29, status: "Approved", oem: "Maruti", asset: "Maruti Omni", maxOwner: "Up to 4th Owner", segment: "Van", fuelType: "Petrol / LPG", remarks: "Personal & Commercial" },
      { sNo: 30, status: "Approved", "oem": "Maruti", asset: "Maruti S Cross", maxOwner: "Up to 4th Owner", segment: "Crossover SUV", fuelType: "Petrol / Diesel", remarks: "Personal Only" },
      { sNo: 31, status: "Approved", oem: "Maruti", asset: "Maruti S-Presso", maxOwner: "Up to 4th Owner", segment: "Mini SUV / Hatchback", fuelType: "Petrol / CNG", remarks: "Personal Only" },
      { sNo: 32, status: "Approved", oem: "Maruti", asset: "Maruti Swift", maxOwner: "Up to 4th Owner", segment: "Hatchback", fuelType: "Petrol / CNG / Diesel", remarks: "Personal & Commercial" },
      { sNo: 33, status: "Approved", oem: "Maruti", asset: "Maruti Swift Dzire", maxOwner: "Up to 4th Owner", segment: "Sedan", fuelType: "Petrol / CNG / Diesel", remarks: "Personal & Commercial" },
      { sNo: 34, status: "Approved", oem: "Maruti", asset: "Maruti Vitara Brezza", maxOwner: "Up to 4th Owner", segment: "Compact SUV", fuelType: "Petrol / Diesel", remarks: "Personal Only" },
      { sNo: 35, status: "Approved", oem: "Maruti", asset: "Maruti Wagon R", maxOwner: "Up to 4th Owner", segment: "Tallboy Hatchback", fuelType: "Petrol / CNG", remarks: "Personal & Commercial" },
      { sNo: 36, status: "Approved", oem: "Maruti", asset: "Maruti XL 6", maxOwner: "Up to 4th Owner", segment: "Premium MUV", fuelType: "Petrol / CNG", remarks: "Personal Only" },
      { sNo: 37, status: "Approved", oem: "Renault", asset: "Renault Kwid", maxOwner: "Up to 4th Owner", segment: "Hatchback", fuelType: "Petrol", remarks: "Personal Only" },
      { sNo: 38, status: "Approved", oem: "Tata", asset: "Tata Altroz", maxOwner: "Up to 4th Owner", segment: "Premium Hatchback", fuelType: "Petrol / Diesel / CNG", remarks: "Personal Only" },
      { sNo: 39, status: "Approved", oem: "Tata", asset: "Tata Bolt", maxOwner: "Up to 4th Owner", segment: "Hatchback", fuelType: "Petrol / Diesel", remarks: "Personal Only" },
      { sNo: 40, status: "Approved", oem: "Tata", asset: "Tata Harrier", maxOwner: "Up to 4th Owner", segment: "SUV", fuelType: "Diesel", remarks: "Personal Only" },
      { sNo: 41, status: "Approved", oem: "Tata", asset: "Tata Hexa", maxOwner: "Up to 4th Owner", segment: "Premium MUV / SUV", fuelType: "Diesel", remarks: "Personal Only" },
      { sNo: 42, status: "Approved", oem: "Tata", asset: "Tata Nexon", maxOwner: "Up to 4th Owner", segment: "Compact SUV", fuelType: "Petrol / Diesel / EV", remarks: "Personal Only" },
      { sNo: 43, status: "Approved", oem: "Tata", asset: "Tata Tiago", maxOwner: "Up to 4th Owner", segment: "Hatchback", fuelType: "Petrol / CNG / EV", remarks: "Personal Only" },
      { sNo: 44, status: "Approved", oem: "Toyota", asset: "Toyota Fortuner", maxOwner: "Up to 4th Owner", segment: "Premium SUV", fuelType: "Petrol / Diesel", remarks: "Personal Only" },
      { sNo: 45, status: "Approved", oem: "Toyota", asset: "Toyota Glanza", maxOwner: "Up to 4th Owner", segment: "Hatchback", fuelType: "Petrol / CNG", remarks: "Personal Only" },
      { sNo: 46, status: "Approved", oem: "Toyota", asset: "Toyota Innova", maxOwner: "Up to 4th Owner", segment: "MUV", fuelType: "Diesel / Petrol", remarks: "Personal & Commercial" },
      { sNo: 47, status: "Approved", oem: "Toyota", asset: "Toyota Innova Crysta", maxOwner: "Up to 4th Owner", segment: "Premium MUV", fuelType: "Diesel / Petrol", remarks: "Personal & Commercial" },
      { sNo: 48, status: "Approved", oem: "Toyota", asset: "Toyota Urban Cruiser", maxOwner: "Up to 4th Owner", segment: "Compact SUV", fuelType: "Petrol", remarks: "Personal Only" },
      { sNo: 49, status: "Approved", oem: "Mahindra", asset: "Mahindra XUV 700", maxOwner: "Up to 4th Owner", segment: "Premium SUV", fuelType: "Petrol / Diesel", remarks: "Personal Only" },
      { sNo: 50, status: "Approved", oem: "Tata", asset: "Tata Punch", maxOwner: "Up to 4th Owner", segment: "Micro SUV", fuelType: "Petrol / CNG / EV", remarks: "Personal Only" },
      { sNo: 51, status: "Approved", oem: "Toyota", asset: "Toyota Hyryder", maxOwner: "Up to 4th Owner", segment: "Hybrid SUV", fuelType: "Petrol / Strong Hybrid", remarks: "Personal Only" },
      { sNo: 52, status: "Approved", oem: "Mahindra", asset: "Mahindra Scorpio N", maxOwner: "Up to 4th Owner", segment: "SUV", fuelType: "Petrol / Diesel", remarks: "Personal Only" },
      { sNo: 53, status: "Approved", oem: "Tata", asset: "Tata Tigor", maxOwner: "Up to 4th Owner", segment: "Sedan", fuelType: "Petrol / CNG / EV", remarks: "Personal & Commercial" },
      { sNo: 54, status: "Approved", oem: "Toyota", asset: "Etios (For commercial use only)", maxOwner: "Up to 4th Owner", segment: "Sedan", fuelType: "Petrol / Diesel", remarks: "For commercial use only" }
    ]
  };

  state.datasets['bolero_pickup_grid'] = {
    datasetId: 'bolero_pickup_grid',
    title: 'Bolero Pickup Master Grid & Refinance Matrix',
    category: 'Bolero',
    columns: [
      { key: 'categoryType', label: 'Grid / Category', type: 'badge', isPrimary: true, isSortable: true, isFilterable: true },
      { key: 'modelTier', label: 'Model / Variant Tier', type: 'text', isPrimary: true, isSortable: true, isFilterable: true },
      { key: 'y2022', label: '2022', type: 'currency', isPrimary: false, isSortable: true, isFilterable: false },
      { key: 'y2021', label: '2021', type: 'currency', isPrimary: false, isSortable: true, isFilterable: false },
      { key: 'y2020', label: '2020', type: 'currency', isPrimary: false, isSortable: true, isFilterable: false },
      { key: 'y2019', label: '2019', type: 'currency', isPrimary: false, isSortable: true, isFilterable: false },
      { key: 'y2018', label: '2018', type: 'currency', isPrimary: false, isSortable: true, isFilterable: false },
      { key: 'y2017', label: '2017', type: 'currency', isPrimary: false, isSortable: true, isFilterable: false },
      { key: 'y2016', label: '2016', type: 'currency', isPrimary: false, isSortable: true, isFilterable: false },
      { key: 'y2015', label: '2015', type: 'currency', isPrimary: false, isSortable: true, isFilterable: false },
      { key: 'y2014', label: '2014', type: 'currency', isPrimary: false, isSortable: true, isFilterable: false },
      { key: 'y2013', label: '2013', type: 'currency', isPrimary: false, isSortable: true, isFilterable: false },
      { key: 'y2012', label: '2012', type: 'currency', isPrimary: false, isSortable: true, isFilterable: false }
    ],
    rows: [
      { categoryType: "New KV Grid", modelTier: "Tier 1 (ExtraLong / 1.7T / HD)", y2022: "₹ 9,30,000", y2021: "₹ 8,95,000", y2020: "₹ 8,54,000", y2019: "₹ 8,10,000", y2018: "₹ 7,75,000", y2017: "₹ 7,33,000", y2016: "₹ 6,95,000", y2015: "₹ 6,55,000", y2014: "₹ 6,00,000", y2013: "₹ 5,40,000", y2012: "₹ 4,85,000" },
      { categoryType: "New KV Grid", modelTier: "Tier 2 (1.3T / ExtraStrong / City)", y2022: "₹ 7,89,000", y2021: "₹ 7,59,000", y2020: "₹ 7,30,000", y2019: "₹ 6,85,000", y2018: "₹ 6,53,000", y2017: "₹ 6,10,000", y2016: "₹ 5,80,000", y2015: "₹ 5,30,000", y2014: "₹ 5,00,000", y2013: "₹ 4,50,000", y2012: "₹ 4,20,000" },
      { categoryType: "New KV Grid", modelTier: "Tier 3 (Camper / CBC / Flat Bed)", y2022: "₹ 7,60,000", y2021: "₹ 7,32,000", y2020: "₹ 6,89,000", y2019: "₹ 6,40,000", y2018: "₹ 5,70,000", y2017: "₹ 5,40,000", y2016: "₹ 5,00,000", y2015: "₹ 4,60,000", y2014: "₹ 4,25,000", y2013: "₹ 3,70,000", y2012: "₹ 3,20,000" },
      { categoryType: "Existing KV Grid", modelTier: "Tier 1 (ExtraLong / 1.7T / HD)", y2022: "₹ 8,60,000", y2021: "₹ 8,20,000", y2020: "₹ 7,80,000", y2019: "₹ 7,40,000", y2018: "₹ 7,10,000", y2017: "₹ 6,70,000", y2016: "₹ 6,40,000", y2015: "₹ 6,10,000", y2014: "₹ 5,50,000", y2013: "₹ 5,10,000", y2012: "₹ 4,50,000" },
      { categoryType: "Existing KV Grid", modelTier: "Tier 2 (1.3T / ExtraStrong / City)", y2022: "₹ 7,50,000", y2021: "₹ 7,10,000", y2020: "₹ 6,70,000", y2019: "₹ 6,30,000", y2018: "₹ 6,00,000", y2017: "₹ 5,60,000", y2016: "₹ 5,30,000", y2015: "₹ 5,00,000", y2014: "₹ 4,75,000", y2013: "₹ 4,20,000", y2012: "₹ 4,00,000" },
      { categoryType: "Existing KV Grid", modelTier: "Tier 3 (Camper / CBC / Flat Bed)", y2022: "₹ 7,10,000", y2021: "₹ 6,80,000", y2020: "₹ 6,40,000", y2019: "₹ 6,00,000", y2018: "₹ 5,40,000", y2017: "₹ 5,10,000", y2016: "₹ 4,70,000", y2015: "₹ 4,40,000", y2014: "₹ 4,00,000", y2013: "₹ 3,50,000", y2012: "₹ 3,00,000" }
    ],
    sections: [
      {
        title: "1. Customer Categories & LTV Matrix (Repurchase Funding)",
        summary: "Eligible LTV limits categorized by driver profile, fleet size, and captive segment.",
        items: [
          "Suvidha Profile (Driver turning owner without DL, 60% No Grt, if add up to 5% then Grt required, specially for rented profile): Max 60% LTV",
          "FTU - First Time User (Without DL): Max 80% LTV",
          "FTB - First Time Buyer (With Transport TR-DL): Max 85% LTV",
          "Small Transporter (STO): Max 85% LTV",
          "Small Fleet Operator (SFO-1 & SFO-2): Max 90% LTV",
          "Medium Fleet Operator (MFO): Max 90% LTV",
          "Large Fleet Operator (LFO): Max 95% LTV",
          "Captive Category A & B: Max 90% LTV",
          "Captive Category C: Max 85% LTV",
          "Captive Category D (User funding restricted up to Pickup only): Max 80% LTV"
        ]
      },
      {
        title: "2. Asset & Operational Policy Parameters",
        summary: "Mandatory credit parameters for Mahindra Bolero Pickup, Camper, and Maxi Truck.",
        items: [
          "Product Coverage: Goods segment - Mahindra Bolero Pickup, Camper, and Maxi truck (Only for Non-breach branches).",
          "Business Experience: For FTB and above, Business experience = 2 years (Proof: LMV or above DL with transport validity / RC / Invoice / RTR / ITR / GSTR).",
          "Property Ownership: Owned Residential/Commercial property or Agri land min 2.00 acres in name of applicant/co-applicant.",
          "Rented Profile Norm: 5% standard deduction from applicable LTV + External Guarantor with Property Ownership mandatory.",
          "Co-Applicant Norm: Immediate family member mandatory as co-applicant.",
          "Asset Age & EOT Norm: End of Tenure (EOT) must be < 15 Years as per respective RTO authority (Existing norms for SCV/Pickup < 12 yrs).",
          "Ownership Capping: Used asset funding restricted up to 5th Owner, including proposed ownership.",
          "License Capping: Funding based on LMV-TR DL restricted to LCV or < 8 Ton of GVW only.",
          "Personal Discussion (PD): PD by RM / CRM / BM & above mandatory.",
          "LTV & Loan Cap: Max 90% LTV or Loan amount up to ₹ 8,00,000 (Applicable for FTU & FTB clients).",
          "Tenure: Max 48 Months (Additional 6 months up to 54M allowed @ RCM/PH approval, subject to EOT norms).",
          "Fitness & Banking: Valid Fitness Certificate mandatory + Last 6 months bank statement.",
          "IRR: As per official IRR Matrix."
        ]
      }
    ]
  };

  state.datasets['cv_grid'] = {
    datasetId: 'cv_grid',
    title: 'Used Commercial Vehicle (CV) Master Grid',
    category: 'CV Grid',
    columns: [
      { key: 'category', label: 'Category', type: 'badge', isPrimary: true, isSortable: true, isFilterable: true },
      { key: 'manufacturer', label: 'OEM / Make', type: 'text', isPrimary: true, isSortable: true, isFilterable: true },
      { key: 'model', label: 'Model / Variant', type: 'text', isPrimary: true, isSortable: true, isFilterable: true },
      { key: 'body', label: 'Body Type', type: 'text', isPrimary: false, isSortable: true, isFilterable: true },
      { key: 'y2024', label: '2024 (1Y)', type: 'currency', isPrimary: false, isSortable: true, isFilterable: false },
      { key: 'y2023', label: '2023 (2Y)', type: 'currency', isPrimary: false, isSortable: true, isFilterable: false },
      { key: 'y2022', label: '2022 (3Y)', type: 'currency', isPrimary: false, isSortable: true, isFilterable: false },
      { key: 'y2021', label: '2021 (4Y)', type: 'currency', isPrimary: false, isSortable: true, isFilterable: false },
      { key: 'y2020', label: '2020 (5Y)', type: 'currency', isPrimary: false, isSortable: true, isFilterable: false },
      { key: 'y2019', label: '2019 (6Y)', type: 'currency', isPrimary: false, isSortable: true, isFilterable: false },
      { key: 'y2018', label: '2018 (7Y)', type: 'currency', isPrimary: false, isSortable: true, isFilterable: false },
      { key: 'y2017', label: '2017 (8Y)', type: 'currency', isPrimary: false, isSortable: true, isFilterable: false },
      { key: 'y2016', label: '2016 (9Y)', type: 'currency', isPrimary: false, isSortable: true, isFilterable: false },
      { key: 'y2015', label: '2015 (10Y)', type: 'currency', isPrimary: false, isSortable: true, isFilterable: false },
      { key: 'y2014', label: '2014 (11Y)', type: 'currency', isPrimary: false, isSortable: true, isFilterable: false },
      { key: 'y2013', label: '2013 (12Y)', type: 'currency', isPrimary: false, isSortable: true, isFilterable: false },
      { key: 'y2012', label: '2012 (13Y)', type: 'currency', isPrimary: false, isSortable: true, isFilterable: false },
      { key: 'y2011', label: '2011 (14Y)', type: 'currency', isPrimary: false, isSortable: true, isFilterable: false }
    ],
    rows: [
      { category: "Bus", manufacturer: "AL", model: "AL HCV - Luxury Seating coach Bus (40-50 seat)", body: "AC Seater Coach Bus", y2024: "₹ 37.74 L", y2023: "₹ 33.96 L", y2022: "₹ 31.35 L", y2021: "₹ 28.74 L", y2020: "₹ 26.13 L", y2019: "₹ 23.51 L", y2018: "₹ 21.42 L", y2017: "₹ 18.81 L", y2016: "₹ 16.20 L", y2015: "₹ 14.11 L", y2014: "₹ 12.02 L", y2013: "₹ 9.93 L", y2012: "₹ 8.36 L", y2011: "₹ 7.32 L" },
      { category: "HCV", manufacturer: "Tata", model: "TATA LPT/SIGNA - 4825 / 4823 / 4830", body: "SS Tanker / Gas Tanker", y2024: "₹ 47.96 L", y2023: "₹ 43.17 L", y2022: "₹ 40.74 L", y2021: "₹ 38.30 L", y2020: "₹ 35.87 L", y2019: "—", y2018: "—", y2017: "—", y2016: "—", y2015: "—", y2014: "—", y2013: "—", y2012: "—", y2011: "—" },
      { category: "LCV / ICV", manufacturer: "EICHER", model: "Eicher 3015", body: "Goods", y2024: "₹ 22.50 L", y2023: "₹ 20.25 L", y2022: "₹ 19.17 L", y2021: "₹ 18.09 L", y2020: "₹ 17.01 L", y2019: "₹ 16.20 L", y2018: "₹ 15.12 L", y2017: "₹ 14.04 L", y2016: "₹ 12.96 L", y2015: "₹ 11.88 L", y2014: "₹ 10.53 L", y2013: "₹ 9.18 L", y2012: "₹ 7.56 L", y2011: "₹ 6.21 L" },
      { category: "Pick Up", manufacturer: "M & M", model: "Bolero Pick Up / Max Pick Up", body: "Goods", y2024: "₹ 10.22 L", y2023: "₹ 9.20 L", y2022: "₹ 8.60 L", y2021: "₹ 8.20 L", y2020: "₹ 7.80 L", y2019: "₹ 7.40 L", y2018: "₹ 7.10 L", y2017: "₹ 6.70 L", y2016: "₹ 6.40 L", y2015: "₹ 6.10 L", y2014: "₹ 5.50 L", y2013: "₹ 5.10 L", y2012: "₹ 4.50 L", y2011: "—" },
      { category: "SCV", manufacturer: "TATA", model: "Tata ACE - HT / HT+ / Gold (Diesel)", body: "Goods", y2024: "₹ 5.70 L", y2023: "₹ 5.13 L", y2022: "₹ 4.75 L", y2021: "₹ 4.40 L", y2020: "₹ 4.10 L", y2019: "₹ 3.60 L", y2018: "₹ 3.40 L", y2017: "₹ 3.10 L", y2016: "₹ 2.80 L", y2015: "₹ 2.50 L", y2014: "₹ 2.20 L", y2013: "₹ 1.80 L", y2012: "₹ 1.60 L", y2011: "—" },
      { category: "TIPPER-HCV", manufacturer: "TATA", model: "Tata 4825 / 4830 tipper", body: "TIPPER", y2024: "₹ 48.64 L", y2023: "₹ 43.78 L", y2022: "₹ 41.34 L", y2021: "₹ 38.91 L", y2020: "₹ 36.48 L", y2019: "—", y2018: "—", y2017: "—", y2016: "—", y2015: "—", y2014: "—", y2013: "—", y2012: "—", y2011: "—" },
      { category: "TRACTOR", manufacturer: "TATA", model: "Tata Signa 5530 trailer (10 W)", body: "Tip Trailer / Bulker / Tanker", y2024: "₹ 40.91 L", y2023: "₹ 36.82 L", y2022: "₹ 34.11 L", y2021: "₹ 31.41 L", y2020: "₹ 28.70 L", y2019: "—", y2018: "—", y2017: "—", y2016: "—", y2015: "—", y2014: "—", y2013: "—", y2012: "—", y2011: "—" }
    ],
    sections: [
      {
        title: "1. Uncovered / Ungraded Vehicle Depreciation Matrix",
        summary: "Standard percentage of Net on Road (NOD) cost applicable for commercial vehicles not explicitly listed in the grid.",
        items: [
          "1 Year Old (2024): 65.00% of NOD",
          "2 Year Old (2023): 60.00% of NOD",
          "3 Year Old (2022): 55.00% of NOD",
          "4 Year Old (2021): 50.00% of NOD",
          "5 Year Old (2020): 45.00% of NOD",
          "6 Year Old (2019): 40.00% of NOD",
          "7 Year Old (2018): 36.00% of NOD",
          "8 Year Old (2017): 32.00% of NOD",
          "9 Year Old (2016): 28.00% of NOD",
          "10 Year Old (2015): 24.00% of NOD",
          "11 Year Old (2014): 21.00% of NOD",
          "12 Year Old (2013): 19.00% of NOD",
          "13 Year Old (2012): 17.00% of NOD",
          "14 Year Old (2011): 15.00% of NOD"
        ]
      },
      {
        title: "2. Grid Valuation Calculation Formula",
        summary: "How to compute grid value for unlisted vehicle models:",
        items: [
          "Step 1: Showroom Cost - Discount = Net On Road Cost (NOD)",
          "Step 2: Calculated Grid Value = NOD × Applicable Manufacturing Year %",
          "Example: Showroom Cost ₹ 47,00,000 - Discount ₹ 4,70,000 = NOD ₹ 42,30,000. For 2024 (65%): Grid Value = ₹ 27,49,500."
        ]
      }
    ]
  };

  state.datasets['car_policy'] = {
    datasetId: 'car_policy',
    title: 'Private Car Credit Policy',
    category: 'Policy',
    columns: [
      { key: 'program', label: 'Program / Product', type: 'badge', isPrimary: true, isSortable: true, isFilterable: true },
      { key: 'targetProfile', label: 'Target Profile', type: 'text', isPrimary: false, isSortable: true, isFilterable: true },
      { key: 'loanCap', label: 'Loan Capping', type: 'text', isPrimary: false, isSortable: true, isFilterable: true },
      { key: 'maxTenure', label: 'Max Tenure', type: 'text', isPrimary: false, isSortable: false, isFilterable: false },
      { key: 'maxLtv', label: 'LTV (Refinance/Used)', type: 'percentage', isPrimary: false, isSortable: true, isFilterable: true },
      { key: 'criteria', label: 'Key Credit Criteria & Documentation', type: 'text', isPrimary: false, isSortable: false, isFilterable: false },
      { key: 'propertyNorm', label: 'Property / Land Norms', type: 'text', isPrimary: false, isSortable: false, isFilterable: false }
    ],
    rows: [
      {
        program: "IP (Income Proof) - Salaried",
        targetProfile: "Salaried Employees",
        loanCap: "₹ 10.00 Lakhs",
        maxTenure: "Used - 48M",
        maxLtv: "90.00%",
        criteria: "• Max FOIR: 60%\n• Job Stability: Min 2 yrs total, at least 1 yr in same organization\n• Income Proof: Last 3M salary slip + latest Form 16 or ITR\n• Min Salary: Net ₹ 20,000/mo or Min Income ₹ 2.50 Lakhs/yr\n• Banking: Last 6 months bank statement mandatory\n• Additional: Company ID card & Appointment letter\n• Disqualifiers: Cash salary not acceptable; Direct relatives/family working in Proprietorship firm not eligible",
        propertyNorm: "Property ownership proof mandatory in name of applicant/co-applicant (min 1 yr residence stability) OR Agri land property proof acceptable (market value >= 4x proposed loan amount, Deviation @ L2 ACM)."
      },
      {
        program: "IP (Income Proof) - SEP",
        targetProfile: "Self Employed Professionals",
        loanCap: "₹ 10.00 Lakhs",
        maxTenure: "Used - 48M",
        maxLtv: "90.00%",
        criteria: "• Experience: Min 2 yrs stability or experience\n• ITR Norms: Last 2 yrs ITR min ₹ 2.50 Lakhs mandatory with >= 6M gap between both ITRs\n• ITR Filing Vintage: At least 30 days old at loan application login\n• Audited Financials: Required in Company cases\n• Banking: Last 6M or 1 Yr bank statement/passbook + ABB 2x EMI (case-by-case)\n• Field Norm: Business visit + photos documented by Company employee\n• Documents: Shop Act / Registration Certificate / GST / ITR",
        propertyNorm: "Property ownership proof mandatory in name of applicant/co-applicant (min 1 yr residence stability) OR Agri land property proof acceptable (market value >= 4x proposed loan amount, Deviation @ L2 ACM)."
      },
      {
        program: "NIP (Non-Income Proof)",
        targetProfile: "Self Employed Non-Professionals",
        loanCap: "₹ 8.00 Lakhs",
        maxTenure: "Used - 48M",
        maxLtv: "80.00%",
        criteria: "• Experience: Min 2 yrs business stability/experience (validated via PD & TVR by Sales & Credit)\n• Field Verification: Business visit + FI + photos by RM/BM/employee capturing business activity & stock\n• Income Validation: Min 6M banking, RTR, GST Certificate, business bills/receipts, commission invoices\n• Banking: Last 6 months bank statement or passbook\n• LTV Booster: Optional +5% LTV with mandatory External Guarantor owning property or min 2 Acre Agri land (Deviation @ L2 ACM)\n• Models Allowed: Hatchback, Sedan, SUV, MUV Only (Excluding Premium Models)",
        propertyNorm: "Property ownership proof mandatory (applicant/co-applicant, min 1 yr residence stability) OR Agri land proof acceptable (market value >= 4x loan amount, purely Agri based criteria)."
      },
      {
        program: "Repayment Surrogate",
        targetProfile: "Self Employed (Individual/Partnership)",
        loanCap: "₹ 10.00 Lakhs",
        maxTenure: "Used - 48M",
        maxLtv: "85.00%",
        criteria: "• Max FOIR: 60%\n• Business Stability: Min 2 yrs business experience\n• Track Record: Min 1 yr satisfactory repayment track in AL, BL, HL, LAP, Property Loan\n• Structure: Only standard EMI structure with fixed dates accepted\n• Vintage: Loan running or closed within last 1 yr only\n• DPD Norms: Max 2 bounces <30 DPD/yr; Max 1 instance 30+ DPD/yr (allowed once only); 0 EMI bounce in last 6 months (except technical error)\n• Validation: SOA / Repayment schedule + banking where repayments are made\n• Banking: Last 6M bank statement/passbook mandatory\n• Multiplier: Applied on 1 loan only (>= 12 MOB); Other loans running not eligible",
        propertyNorm: "Property ownership proof mandatory (applicant/co-applicant, min 1 yr residence stability) OR Agri land proof acceptable (market value >= 4x loan amount, Deviation @ L2 ACM)."
      },
      {
        program: "Banking Surrogate",
        targetProfile: "Self Employed Business Profiles",
        loanCap: "₹ 10.00 Lakhs",
        maxTenure: "Used - 48M",
        maxLtv: "80.00%",
        criteria: "• Excluded Profiles: Tours & Travel, Agriculturist, Non-business profiles\n• Vintage: Main business account must be at least 1 year old\n• ABB Ratio: Last 6M bank statement with ABB to EMI Ratio >= 1.5x\n• Activity: Min 4 credit business transactions per month in banking\n• Bounce & Charges: No EMI bouncing and no penal charges in last 6 months\n• Restrictions: Not applicable for CC/OD limit accounts; Overleverage cases NOT allowed; Rented profiles NOT allowed\n• Field Check: Business visit + FI + photos capturing business activity & stock presence",
        propertyNorm: "Property ownership proof mandatory (applicant/co-applicant, min 1 yr residence stability) OR Agri land proof acceptable (market value >= 4x loan amount, Deviation @ L2 ACM)."
      },
      {
        program: "Agri Based Funding",
        targetProfile: "Agriculturists & Farmers",
        loanCap: "₹ 10.00 Lakhs",
        maxTenure: "Used - 48M",
        maxLtv: "80.00%",
        criteria: "• Landholding Slabs:\n  - Up to ₹ 5.00 Lakhs: >= 2 to 3 Acres\n  - Up to ₹ 8.00 Lakhs: >= 3 to 5 Acres\n  - Up to ₹ 10.00 Lakhs: >= 5 Acres\n• Deal Structure: Property owner must be part of the deal\n• Residence Stability: Min 1 year mandatory\n• Documents: Fresh 7/12 and 8A extract of Agri land mandatory\n• Field Check: Business/Farm visit + photo documented by Company employee\n• Deviations: No LTV deviation allowed in this program\n• Disqualifier: Rented profiles NOT allowed\n• Models Allowed: Hatchback, Sedan, Compact/Mid MUV/SUV Only (Excluding Premium Models)",
        propertyNorm: "Mandatory fresh 7/12 & 8A extracts meeting land slabs (>=2-3 Acres for <=5L, >=3-5 Acres for <=8L, >=5 Acres for <=10L). Property owner must be on the deal."
      }
    ],
    sections: [
      {
        title: "1. Policy Identification & Authority",
        summary: "Kredit Venture Private Car Amended Credit Policy (February 9, 2026 - JADS Services Private Limited).",
        items: [
          "Product Scope: Private Car Refinance / Used Car Purchase funding across 5 dedicated credit programs.",
          "Authority: Kredit Venture (JADS Services Private Limited), effective February 9, 2026.",
          "Standard Max Tenure: 48 Months across all Used Car programs.",
          "Loan Capping: ₹ 10.00 Lakhs for IP, Repayment Surrogate, Banking Surrogate, and Agri programs; ₹ 8.00 Lakhs for NIP Program."
        ]
      },
      {
        title: "2. Repayment Surrogate Multiplier Grid",
        summary: "Eligible loan multiplier values based on satisfactory repayment vintage (MOB).",
        items: [
          "Auto Loan (12 MOB): 1.4 Times of repayment track",
          "Auto Loan (24 MOB): 1.5 Times of repayment track",
          "Business Loan (BL) / Property Loan (< ₹ 15 Lakhs) (12 MOB): 1.4 Times of repayment track",
          "Business Loan (BL) / Property Loan (< ₹ 15 Lakhs) (24 MOB): 1.5 Times of repayment track",
          "Loan Against Property (LAP) / Home Loan (HL) (12 MOB): 0.5 Times of repayment track",
          "Track Norms: Minimum 1 yr track required with standard fixed-date EMI structure; running or closed within last 1 yr only.",
          "Bouncing Norms: Max 2 bounces <30 DPD/yr, Max 1 bounce 30+ DPD/yr (once only), 0 bounce in last 6 months."
        ]
      },
      {
        title: "3. Agri Based Funding Criteria",
        summary: "Clear land acreage slabs and underwriting conditions for agricultural profiles.",
        items: [
          "Loan up to ₹ 5.00 Lakhs: Requires minimum 2 to 3 Acres of agricultural land.",
          "Loan up to ₹ 8.00 Lakhs: Requires minimum 3 to 5 Acres of agricultural land.",
          "Loan up to ₹ 10.00 Lakhs: Requires minimum 5 Acres or more of agricultural land.",
          "Land Record Proof: Fresh 7/12 and 8A extracts mandatory.",
          "Deal Criteria: Land owner must be part of the deal; min 1 yr residence stability; Rented profile not allowed.",
          "No LTV deviation permitted under the Agri Based Funding program."
        ]
      },
      {
        title: "4. General Underwriting Norms & Restrictions",
        summary: "Critical policy standards applicable across all private car finance proposals.",
        items: [
          "End of Tenure (EOT): Car End of Tenure capped at 12 years across all segments.",
          "Discontinued Models: Funding restricted to a maximum of 60% LTV only.",
          "RC Serial Ownership: Permitted up to 4th owner only (including proposed ownership).",
          "Yellow Board / Commercial: Commercial passing yellow-board cars NOT allowed under Private Car policy.",
          "Negative Checks: NT (Negative Territory) areas and Negative Profiles must be strictly checked.",
          "Valuation & LTV Base: LTV calculated on lower of asset cost or fair valuation from CarWale, Spinny, CARS24, OBV, IBB, etc.",
          "External Balance Transfer (BT): Not allowed in direct sourcing; permitted only where nil hypothecation & original RTO papers in custody (applicable to branch RC limits and non-RC limit DSAs).",
          "Hypothecated RC Cases: Car must be parked in authorized parking yard until PDD submission, with proper financier FCL letter and lien clarification email.",
          "Rented Profiles: Permanent (Native) place address proof mandatory + FI to be conducted (local/external guarantor optional).",
          "Commercial Use Deduction: 10% standard LTV deduction from applicable norms if vehicle is used for commercial purpose.",
          "RC Limit & PDD Norms: Governed by standard CV policy norms.",
          "Age Criteria: Entry and maturity age criteria as per CV policy.",
          "Deviations: Any other deviation strictly approved at RCM / NCM level only."
        ]
      }
    ]
  };

  state.datasets['cv_policy'] = {
    datasetId: 'cv_policy',
    title: 'Commercial Vehicle (CV) Policy (2024-25)',
    category: 'Policy',
    columns: [
      { key: 'sNo', label: 'S.No', type: 'number', isPrimary: false, isSortable: true, isFilterable: false },
      { key: 'parameter', label: 'Policy Parameter', type: 'text', isPrimary: true, isSortable: true, isFilterable: true },
      { key: 'activeNorm', label: 'Policy Norm (Aug 2024)', type: 'text', isPrimary: true, isSortable: false, isFilterable: false },
      { key: 'previousNorm', label: 'Previous Norm (Jul 2023)', type: 'text', isPrimary: false, isSortable: false, isFilterable: false },
      { key: 'rationale', label: 'Credit Rationale', type: 'text', isPrimary: false, isSortable: false, isFilterable: true }
    ],
    rows: [
      {
        sNo: 1,
        parameter: "Max Funding: M&HCV (New & Used, Non-Tipper)",
        activeNorm: "CAT A1 (Captive Large): ₹ 75L | CAT A2 (Captive Small): ₹ 35L or 1 veh | CAT B: ₹ 100L | CAT C: ₹ 75L | CAT D: ₹ 40L | CAT E (FTB): ₹ 35L or 1 veh | CAT F (FTU): ₹ 30L or 1 veh",
        previousNorm: "CAT A1: ₹ 50L | CAT A2: ₹ 25L (1 veh) | CAT B: ₹ 100L | CAT C: ₹ 60L | CAT D: ₹ 35L | CAT E: ₹ 30L (1 veh) | CAT F: ₹ 25L (1 veh)",
        rationale: "New vehicle cost inflation in past 2 years increased secondary market prices. Capping increased to ensure fast TAT and regional level approvals."
      },
      {
        sNo: 2,
        parameter: "Max Funding: LCV (New & Used)",
        activeNorm: "CAT A1 (Captive Large): ₹ 40L | CAT A2 (Captive Small): ₹ 25L | CAT B: ₹ 100L | CAT C: ₹ 50L | CAT D: ₹ 35L | CAT E: ₹ 25L or 1 veh | CAT F: ₹ 22L or 1 veh",
        previousNorm: "CAT A1: ₹ 40L | CAT A2: ₹ 22L | CAT B: ₹ 75L | CAT C: ₹ 40L | CAT D: ₹ 25L | CAT E: ₹ 22L (1 veh) | CAT F: ₹ 20L (1 veh)",
        rationale: "Enhanced regional capping to accommodate commercial vehicle price escalation and improve turnaround time."
      },
      {
        sNo: 3,
        parameter: "Max Funding: SCV (New & Used)",
        activeNorm: "CAT A1 (Captive Large): ₹ 25L | CAT A2 (Captive Small): ₹ 12L or 1 veh | CAT B: ₹ 50L | CAT C: ₹ 40L | CAT D: ₹ 25L | CAT E: ₹ 12L or 1 veh | CAT F: ₹ 10L or 1 veh",
        previousNorm: "CAT A1: ₹ 25L | CAT A2: ₹ 12L (1 veh) | CAT B: ₹ 50L | CAT C: ₹ 25L | CAT D: ₹ 18L | CAT E: ₹ 12L (1 veh) | CAT F: ₹ 10L (1 veh)",
        rationale: "Adjusted funding limits for SCV category across Small/Medium fleet operators."
      },
      {
        sNo: 4,
        parameter: "Max Funding: Tipper (New & Used)",
        activeNorm: "CAT A1 (Captive Large): ₹ 60L | CAT A2 (Captive Small): ₹ 35L or 1 veh | CAT B: ₹ 100L | CAT C: ₹ 60L | CAT D: ₹ 45L or 1 veh | CAT E: ₹ 30L or 1 veh",
        previousNorm: "CAT A1: ₹ 50L | CAT A2: ₹ 25L (1 veh) | CAT B: ₹ 100L | CAT C: ₹ 50L | CAT D: ₹ 35L (1 veh) | CAT E: ₹ 25L (1 veh)",
        rationale: "Tipper price escalation addressed with higher regional approval caps."
      },
      {
        sNo: 7,
        parameter: "Fast Track Tatkal Screen (Used CV Funding)",
        activeNorm: "• No funding on Trailers under Tatkal\n• Tippers up to 28 Tons only: Max ₹ 25 Lacs\n• ICV funding restricted to 12 Ton segment: Max ₹ 15 Lacs\n• LTV: CAT E = 75%, CAT F = 70%\n• External Guarantor with property ownership acceptable",
        previousNorm: "₹ 20L on Trailers/M&HCV/Tippers, ₹ 15L on LCV/ICV; LTV: CAT E = 70%, CAT F = 65%",
        rationale: "Risk mitigation on heavy trailers and high-tonnage tippers under Tatkal expedited scheme."
      },
      {
        sNo: 9,
        parameter: "Approval Authority: Branch Level (BCM + Branch Head)",
        activeNorm: "New & Used: Up to ₹ 100 Lacs (Recommended by Branch Credit Manager & Approved by Branch Head)",
        previousNorm: "New & Used: Up to ₹ 20 Lacs",
        rationale: "Exposure approval @ Branch Level only for better TAT and customer service."
      },
      {
        sNo: 15,
        parameter: "Loan to Value (LTV) Calculation Base",
        activeNorm: "To be considered on LOWER of Grid / Valuation and Purchase Cost.",
        previousNorm: "To be considered on lower of Grid / Valuation.",
        rationale: "Prudent risk management and preventing asset over-invoicing."
      },
      {
        sNo: 18,
        parameter: "CV Asset Level Categorisation (Level 1, 2, 3)",
        activeNorm: "• Level 1: Good resale & widely used\n• Level 2: Moderate resale & usage (LTV cut by 5%)\n• Level 3: Low resale / specialized usage (LTV cut by 10%; CAT A-Small, CAT E, CAT F NOT eligible; CAT D eligible only with existing Level 3 ownership)\n• LTV cuts not applicable to CAT A-Large & CAT B\n• Unlisted models default to Level 3",
        previousNorm: "Standard unclassified asset norms",
        rationale: "To ensure controlled exposure on high-liquidity vs specialized qualitative assets."
      }
    ],
    sections: [
      {
        title: "1. Policy Amendment Identification",
        summary: "Regional Commercial Vehicle Credit Policy Norms — DOC-2024-25 (Effective August 2024).",
        items: [
          "Scope: Full credit parameters for M&HCV, LCV, SCV, Tippers, Commercial Buses, and School Buses.",
          "Branch Delegation: Approval authority up to ₹ 100 Lacs delegated directly to Branch Credit Manager & Branch Head.",
          "Corporate DSA Capping: Expanded to ₹ 500 Lacs across multi-state sourcing partners."
        ]
      },
      {
        title: "2. Asset Level Categorisation & Underwriting Cuts",
        summary: "Risk classification of vehicle assets based on secondary market liquidity and demand:",
        items: [
          "Level 1 Asset: High liquidity & wide market demand (Standard LTV).",
          "Level 2 Asset: Moderate resale value & usage (5% LTV reduction applied).",
          "Level 3 Asset: Low resale / specialized application (10% LTV reduction; CAT A-Small, CAT E, CAT F barred; CAT D requires prior ownership).",
          "LTV cuts for Level 2 & 3 are waived for CAT A (Large) and CAT B clients.",
          "Any unlisted vehicle model defaults to Level 3 classification."
        ]
      },
      {
        title: "3. Credit Bureau (CIBIL) Default Mitigation Rules",
        summary: "Mandatory mitigation options if default/overdue appears in applicant bureau report:",
        items: [
          "Option A: 10% reduction in applicable LTV norm.",
          "Option B: External Guarantor with property value exceeding proposed loan amount.",
          "Option C: Price loan at 20% minimum IRR.",
          "Option D: Owned residential/commercial property in applicant/co-app name valued at >= 2x loan amount.",
          "Option E: Additional vehicle collateral equal to loan amount."
        ]
      }
    ]
  };

  state.datasets['dsa_payout'] = {
    datasetId: 'dsa_payout',
    title: 'DSA Payout Policy – Vehicle Finance',
    category: 'Payout',
    columns: [
      { key: 'product', label: 'Product Segment', type: 'badge', isPrimary: true, isSortable: true, isFilterable: true },
      { key: 'wirrSlab', label: 'WIRR / IRR Slab', type: 'text', isPrimary: true, isSortable: true, isFilterable: true },
      { key: 'payoutUnder20L', label: 'Monthly Vol < 20L', type: 'percentage', isPrimary: false, isSortable: true, isFilterable: false },
      { key: 'payoutOver20L', label: 'Monthly Vol > 20L', type: 'percentage', isPrimary: false, isSortable: true, isFilterable: false },
      { key: 'remarks', label: 'Product Coverage & Notes', type: 'text', isPrimary: false, isSortable: false, isFilterable: true }
    ],
    rows: [
      { product: "Used Car", wirrSlab: ">= 16.00% - <= 16.99%", payoutUnder20L: "2.00%", payoutOver20L: "2.25%", remarks: "Private Car Refinance / Purchase" },
      { product: "Used Car", wirrSlab: ">= 17.00% - <= 17.99%", payoutUnder20L: "2.50%", payoutOver20L: "2.75%", remarks: "Private Car Refinance / Purchase" },
      { product: "Used Car", wirrSlab: ">= 18.00% - <= 18.99%", payoutUnder20L: "3.00%", payoutOver20L: "3.25%", remarks: "Private Car Refinance / Purchase" },
      { product: "Used Car", wirrSlab: ">= 19.00% - <= 19.99%", payoutUnder20L: "3.25%", payoutOver20L: "3.50%", remarks: "Private Car Refinance / Purchase" },
      { product: "Used Car", wirrSlab: ">= 20.00% - <= 20.99%", payoutUnder20L: "3.50%", payoutOver20L: "3.75%", remarks: "Private Car Refinance / Purchase" },
      { product: "Used Car", wirrSlab: ">= 21.00% - <= 21.99%", payoutUnder20L: "3.75%", payoutOver20L: "4.00%", remarks: "Private Car Refinance / Purchase" },
      { product: "Used Car", wirrSlab: ">= 22.00%", payoutUnder20L: "4.00%", payoutOver20L: "4.25%", remarks: "Private Car Refinance / Purchase" },
      { product: "Used CV", wirrSlab: ">= 16.00% - <= 17.99%", payoutUnder20L: "1.50%", payoutOver20L: "2.00%", remarks: "SCV, LCV, ICV, Buses & Pickups" },
      { product: "Used CV", wirrSlab: ">= 18.00% - <= 18.99%", payoutUnder20L: "2.00%", payoutOver20L: "2.25%", remarks: "SCV, LCV, ICV, Buses & Pickups" },
      { product: "Used CV", wirrSlab: ">= 19.00% - <= 19.99%", payoutUnder20L: "2.50%", payoutOver20L: "2.50%", remarks: "SCV, LCV, ICV, Buses & Pickups" },
      { product: "Used CV", wirrSlab: ">= 20.00%", payoutUnder20L: "3.00%", payoutOver20L: "3.00%", remarks: "SCV, LCV, ICV, Buses & Pickups" },
      { product: "M&HCV & CE", wirrSlab: "Flat Volume Rate", payoutUnder20L: "1.25%", payoutOver20L: "1.25%", remarks: "Flat 1.25% on volume across all IRR slabs" }
    ],
    sections: [
      {
        title: "1. Payout Calculation & Release Guidelines",
        summary: "Key operational rules governing monthly DSA commission disbursements:",
        items: [
          "Disbursement Release Cycle: DSA payout will be released in the next month following the disbursement month.",
          "Taxation: All stated payout slabs are strictly excluding GST (GST to be added as applicable).",
          "IRR Calculation Base: Processing fees and Stamp duty charges should NOT be included in the WIRR / IRR calculation.",
          "M&HCV & CE Exception: Standard WIRR slabs do not apply to M&HCV and Construction Equipment. Flat payout is 1.25% on volume."
        ]
      },
      {
        title: "2. Post-Disbursement Documentation (PDD) Norms",
        summary: "Strict compliance rules for RC and Insurance hypothecation updation:",
        items: [
          "PDD TAT: PDD documents must be updated within 60 days of loan disbursement date.",
          "Hold Penalty: If PDD is pending for > 90 days, all DSA payouts across all files will be stopped immediately until full PDD resolution.",
          "Mandatory PDD Documents: Registration Certificate (RC) and Insurance policy endorsed with Kredit Venture / JADS Services hypothecation."
        ]
      },
      {
        title: "3. Loan Cancellation & Clawback Policy",
        summary: "Rules for cancelled loan cases:",
        items: [
          "In case of loan cancellation, if the payout has already been released, the full amount will be deducted / clawbacked from the DSA's next month payout."
        ]
      }
    ]
  };

  state.datasets['irr_matrix'] = {
    datasetId: 'irr_matrix',
    title: 'IRR & Interest Rate Matrix',
    category: 'IRR',
    columns: [
      { key: 'product', label: 'Product', type: 'badge', isPrimary: true, isSortable: true, isFilterable: true },
      { key: 'cibilTier', label: 'CIBIL Tier', type: 'badge', isPrimary: true, isSortable: true, isFilterable: true },
      { key: 'slab', label: 'Loan Slab', type: 'text', isPrimary: false, isSortable: true, isFilterable: true },
      { key: 'tenure36m', label: '36M Rate', type: 'percentage', isPrimary: false, isSortable: true, isFilterable: false },
      { key: 'tenure48m', label: '48M Rate', type: 'percentage', isPrimary: false, isSortable: true, isFilterable: false },
      { key: 'tenure60m', label: '60M Rate', type: 'percentage', isPrimary: false, isSortable: true, isFilterable: false },
      { key: 'tenure84m', label: '84M Rate', type: 'percentage', isPrimary: false, isSortable: true, isFilterable: false }
    ],
    rows: [
      { product: "New Car", cibilTier: "Tier 1 (750+)", slab: "₹ 5L - ₹ 15L", tenure36m: "8.85%", tenure48m: "8.95%", tenure60m: "9.10%", tenure84m: "9.35%" },
      { product: "New Car", cibilTier: "Tier 1 (750+)", slab: "> ₹ 15 Lakhs", tenure36m: "8.65%", tenure48m: "8.75%", tenure60m: "8.90%", tenure84m: "9.15%" },
      { product: "New Car", cibilTier: "Tier 2 (700-749)", slab: "₹ 5L - ₹ 15L", tenure36m: "9.25%", tenure48m: "9.40%", tenure60m: "9.55%", tenure84m: "9.85%" },
      { product: "New Car", cibilTier: "NTC / -1", slab: "All Slabs", tenure36m: "9.75%", tenure48m: "9.95%", tenure60m: "10.20%", tenure84m: "10.50%" },
      { product: "Used Car", cibilTier: "Tier 1 (750+)", slab: "₹ 3L - ₹ 10L", tenure36m: "12.50%", tenure48m: "12.75%", tenure60m: "13.00%", tenure84m: "N/A" }
    ]
  };

  state.datasets['charges'] = {
    datasetId: 'charges',
    title: 'Schedule of Charges - Vehicle Finance',
    category: 'Charges',
    columns: [
      { key: 'sNo', label: 'S.No', type: 'number', isPrimary: false, isSortable: true, isFilterable: false },
      { key: 'description', label: 'Description', type: 'text', isPrimary: true, isSortable: true, isFilterable: true },
      { key: 'charges', label: 'Charges / Rate', type: 'text', isPrimary: true, isSortable: true, isFilterable: true },
      { key: 'applicability', label: 'Applicability / Remarks', type: 'text', isPrimary: false, isSortable: false, isFilterable: true },
      { key: 'category', label: 'Charge Category', type: 'badge', isPrimary: false, isSortable: true, isFilterable: true }
    ],
    rows: [
      { sNo: 1, description: "Processing Fees", charges: "1.25% + GST (1.50% + GST For Tractor Loan)", applicability: "Standard Car & CV: 1.25% + GST; Tractor Loan: 1.50% + GST on sanctioned loan amount", category: "Processing" },
      { sNo: 2, description: "Document Charges", charges: "Upto 5 Lac 1000/- Above 5 Lac 2000/- Per Loan Account", applicability: "Loan <= ₹ 5.00 Lakhs: ₹ 1,000/- | Loan > ₹ 5.00 Lakhs: ₹ 2,000/- per loan account", category: "Documentation" },
      { sNo: 3, description: "Valuation Charges (Car & SCV)", charges: "Rs. 1000/-", applicability: "Applicable for Private Cars and Small Commercial Vehicles (SCV / Pik-Up)", category: "Valuation" },
      { sNo: 4, description: "Valuation Charges (LCV / ICV)", charges: "Rs. 1200/-", applicability: "Applicable for Light Commercial Vehicles (LCV) and Intermediate Commercial Vehicles (ICV)", category: "Valuation" },
      { sNo: 5, description: "Valuation Charges (M & HCV, Tractor)", charges: "Rs. 1500/-", applicability: "Applicable for Medium & Heavy Commercial Vehicles (M&HCV) and Tractor Loans", category: "Valuation" },
      { sNo: 6, description: "Stamp duty charges", charges: "0.60% of Loan Account", applicability: "0.60% of sanctioned loan amount or as per respective State Stamp Act", category: "Statutory" },
      { sNo: 7, description: "Welcome Letter and Repayment Schedule", charges: "Free / Nil", applicability: "Complimentary digital/physical kit provided upon loan booking and disbursal", category: "Service" }
    ],
    sections: [
      {
        title: "1. Master Fee Structure — Kredit Venture (Jads Services Pvt Ltd)",
        summary: "Mandatory fee schedule applied across all vehicle loan origination files.",
        items: [
          "Processing Fees: 1.25% + GST for Cars & CVs; 1.50% + GST for Tractor Loans.",
          "Documentation Charges: ₹ 1,000 for loans up to ₹ 5 Lakhs; ₹ 2,000 for loans above ₹ 5 Lakhs.",
          "Stamp Duty: 0.60% of Loan Account amount.",
          "GST: Applicable at prevailing statutory rate (18%) on all service and processing fees."
        ]
      },
      {
        title: "2. Valuation Fee Classification Matrix",
        summary: "Standard valuation fee slabs by vehicle category.",
        items: [
          "Car & SCV: ₹ 1,000/- per asset inspection.",
          "LCV / ICV: ₹ 1,200/- per asset inspection.",
          "M & HCV & Tractor: ₹ 1,500/- per asset inspection."
        ]
      }
    ]
  };

  state.datasets['documents'] = {
    datasetId: 'documents',
    title: 'Loan Documentation Checklist',
    category: 'Docs',
    columns: [
      { key: 'docName', label: 'Document Name', type: 'text', isPrimary: true, isSortable: true, isFilterable: true },
      { key: 'profile', label: 'Profile', type: 'badge', isPrimary: false, isSortable: true, isFilterable: true },
      { key: 'docType', label: 'Type', type: 'badge', isPrimary: false, isSortable: true, isFilterable: true },
      { key: 'isMandatory', label: 'Requirement', type: 'badge', isPrimary: false, isSortable: true, isFilterable: true },
      { key: 'specifications', label: 'Specifications', type: 'text', isPrimary: false, isSortable: false, isFilterable: false }
    ],
    rows: [
      { docName: "PAN Card", profile: "All Profiles", docType: "Identity Proof", isMandatory: "Mandatory", specifications: "Original clear color copy / e-PAN" },
      { docName: "Aadhaar Card with XML/OTP", profile: "All Profiles", docType: "Address Proof", isMandatory: "Mandatory", specifications: "UIDAI mask copy or e-KYC" },
      { docName: "Salary Slips (Last 3 Months)", profile: "Salaried", docType: "Income Proof", isMandatory: "Mandatory", specifications: "Company stamped / digital payslips" },
      { docName: "Form 16 / 26AS (Last 2 Yrs)", profile: "Salaried", docType: "Income Proof", isMandatory: "Mandatory", specifications: "Part A & Part B with TRACES barcode" },
      { docName: "Salary Bank Statement (6 Months)", profile: "Salaried", docType: "Banking Proof", isMandatory: "Mandatory", specifications: "PDF statement direct from net banking" },
      { docName: "ITR with Computation (2 Yrs)", profile: "Self Employed", docType: "Income Proof", isMandatory: "Mandatory", specifications: "CA audited Balance Sheet + Computation" },
      { docName: "7/12 & 8A Land Records", profile: "Farmer / Agri", docType: "Income Proof", isMandatory: "Mandatory", specifications: "Digital land ownership record with crop details" }
    ]
  };

  state.datasets['contacts'] = {
    datasetId: 'contacts',
    title: 'Key Contacts Directory',
    category: 'Contacts',
    columns: [
      { key: 'name', label: 'Officer Name', type: 'text', isPrimary: true, isSortable: true, isFilterable: true },
      { key: 'designation', label: 'Designation', type: 'badge', isPrimary: false, isSortable: true, isFilterable: true },
      { key: 'department', label: 'Department', type: 'badge', isPrimary: false, isSortable: true, isFilterable: true },
      { key: 'phone', label: 'Mobile No.', type: 'phone', isPrimary: false, isSortable: false, isFilterable: false },
      { key: 'email', label: 'Email Address', type: 'email', isPrimary: false, isSortable: false, isFilterable: false }
    ],
    rows: []
  };

  state.datasets['schemes'] = {
    datasetId: 'schemes',
    title: 'Special Schemes & Offers',
    category: 'Schemes',
    columns: [
      { key: 'schemeName', label: 'Scheme Title', type: 'text', isPrimary: true, isSortable: true, isFilterable: true },
      { key: 'targetProduct', label: 'Product', type: 'badge', isPrimary: false, isSortable: true, isFilterable: true },
      { key: 'benefit', label: 'Benefit', type: 'text', isPrimary: false, isSortable: false, isFilterable: false },
      { key: 'validTill', label: 'Valid Till', type: 'text', isPrimary: false, isSortable: true, isFilterable: false },
      { key: 'status', label: 'Status', type: 'status', isPrimary: false, isSortable: true, isFilterable: true }
    ],
    rows: [
      { schemeName: "Festive Dhamaka Car Loan", targetProduct: "New Car", benefit: "Flat 8.65% ROI + Zero Processing Fee", validTill: "2026-11-15", status: "Active" },
      { schemeName: "Bolero Maxx Festive Booster", targetProduct: "Bolero Pik-Up", benefit: "100% Ex-Showroom funding + ₹5,000 Fuel voucher", validTill: "2026-11-30", status: "Active" },
      { schemeName: "Independence Day Bonanza", targetProduct: "Used Car", benefit: "Flat 50% waiver on documentation charges", validTill: "2026-08-31", status: "Expired" }
    ]
  };
}

// Financial Helpers
function formatINR(val) {
  return '₹ ' + Math.round(val).toLocaleString('en-IN');
}

function calculateEMI(amount, annualRate, tenureMonths) {
  if (amount <= 0 || tenureMonths <= 0) return { emi: 0, interest: 0, total: 0, schedule: [] };
  const r = (annualRate / 12) / 100;
  const factor = Math.pow(1 + r, tenureMonths);
  const emi = r > 0 ? (amount * r * factor) / (factor - 1) : amount / tenureMonths;
  const total = emi * tenureMonths;
  const interest = Math.max(0, total - amount);

  const schedule = [];
  let bal = amount;
  for (let m = 1; m <= tenureMonths; m++) {
    const intPart = bal * r;
    const princPart = Math.min(bal, emi - intPart);
    const closeBal = Math.max(0, bal - princPart);
    schedule.push({ month: m, princ: princPart, int: intPart, bal: closeBal });
    bal = closeBal;
  }

  return {
    emi,
    interest,
    total,
    principalPct: total > 0 ? (amount / total) * 100 : 100,
    interestPct: total > 0 ? (interest / total) * 100 : 0,
    schedule
  };
}

function calculatePayout(amount, basePct, bonusPct) {
  const totalPct = basePct + bonusPct;
  const baseEarnings = (amount * basePct) / 100;
  const bonusEarnings = (amount * bonusPct) / 100;
  return {
    amount,
    basePct,
    bonusPct,
    totalPct,
    baseEarnings,
    bonusEarnings,
    totalEarnings: baseEarnings + bonusEarnings
  };
}

// Helper to switch tabs smoothly from anywhere in app
function jumpToTab(tabName) {
  state.activeTab = tabName;
  state.searchQuery = '';
  const searchInput = document.getElementById('global-search-input');
  if (searchInput) searchInput.value = '';
  const clearBtn = document.getElementById('btn-clear-search');
  if (clearBtn) clearBtn.style.display = 'none';
  renderView();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Main Render Dispatcher
function renderView() {
  const main = document.getElementById('main-content');
  const chips = document.getElementById('search-filter-chips');

  // Trigger CSS Slide Animation
  if (main) {
    main.style.animation = 'none';
    main.offsetHeight; // force reflow
    main.style.animation = null;
  }

  // Global Auth Check
  const loggedInId = localStorage.getItem('vfh_auth_id');
  const headerTabs = document.getElementById('header-tabs');
  const searchSection = document.querySelector('.search-section');
  const topActions = document.querySelector('.top-actions');
  const androidNav = document.getElementById('android-nav');
  
  if (loggedInId !== 'KV0001') {
    // Lock the app
    if (headerTabs) headerTabs.style.display = 'none';
    if (searchSection) searchSection.style.display = 'none';
    if (topActions) topActions.style.visibility = 'hidden';
    if (androidNav) androidNav.style.display = 'none';
    
    renderLoginScreen(main);
    return;
  }
  
  // Unlock the app
  if (headerTabs) headerTabs.style.display = 'flex';
  if (searchSection) searchSection.style.display = 'block';
  if (topActions) topActions.style.visibility = 'visible';
  if (androidNav) androidNav.style.display = 'flex';

  // If in global search mode
  if (state.searchQuery.trim().length > 0) {
    chips.style.display = 'flex';
    renderSearchResults(main);
    return;
  }

  chips.style.display = 'none';

  // Highlight active tab
  document.querySelectorAll('.tab-item').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === state.activeTab);
  });
  
  // Toggle Global Logout icon
  const logoutBtn = document.getElementById('btn-logout-shortcut');
  if (logoutBtn) {
    if (localStorage.getItem('vfh_auth_id') === 'KV0001') {
      logoutBtn.style.display = 'inline-flex';
    } else {
      logoutBtn.style.display = 'none';
    }
  }

  switch (state.activeTab) {
    case 'dashboard':
      renderExecutiveDashboard(main);
      break;
    case 'approved_cars':
      renderApprovedCarsScreen(main);
      break;
    case 'cv_grid':
      renderCvGridScreen(main);
      break;
    case 'emi_calculator':
      renderEmiCalculator(main);
      break;
    case 'valuation_calculator':
      renderValuationCalculatorScreen(main);
      break;
    case 'dsa_payout':
      renderPayoutScreen(main);
      break;
    case 'irr_matrix':
      renderIrrMatrix(main);
      break;
    case 'documents':
      renderDocumentsScreen(main);
      break;
    case 'new_lead':
      renderNewLeadScreen(main);
      break;
    case 'contacts':
      renderContactsScreen(main);
      break;
    case 'favorites':
      renderFavoritesScreen(main);
      break;
    case 'profile':
      renderProfileScreen(main);
      break;
    default:
      renderGenericDataset(main, state.activeTab);
      break;
  }
}

// ================= MODULE 0: EXECUTIVE DASHBOARD =================
function renderExecutiveDashboard(container) {
  const carCount = state.datasets.approved_cars?.rows?.length || 54;
  const cvCount = state.datasets.cv_grid?.rows?.length || 214;
  const cvPolicyCount = state.datasets.cv_policy?.rows?.length || 19;
  const chargesCount = state.datasets.charges?.rows?.length || 10;
  const payoutSlabs = state.datasets.dsa_payout?.rows?.length || 12;

  // Mini calculator state
  const quickEmiAmount = state.emiAmount || 800000;
  const quickEmiRate = state.emiRate || 9.25;
  const quickEmiTenure = state.emiTenure || 60;
  const quickEmiRes = calculateEMI(quickEmiAmount, quickEmiRate, quickEmiTenure);

  const quickPayoutVol = state.payoutAmount || 1000000;
  const quickPayoutPct = 3.50; // Standard used car slab
  const quickPayoutRes = (quickPayoutVol * quickPayoutPct) / 100;

  container.innerHTML = `
    <div class="dashboard-container">
      
      <!-- HERO COMMAND BAR -->
      <div class="dash-hero">
        <div class="dash-hero-header">
          <div>
            <div class="dash-hero-title">
              <span class="highlight">Kredit Venture</span> • Executive Finance Portal
            </div>
            <p class="dash-hero-subtitle">
              Centralized underwriting guidelines, multi-asset valuation grids, policy amendment archives & DSA commission structures.
            </p>
          </div>
          <div class="dash-live-badge">
            <span class="pulse-dot"></span>
            2026-27 Active Credit Policies
          </div>
        </div>
      </div>


      <!-- INTERACTIVE FEATURE MODULES (12 MODULES) -->
      <div class="dash-section-header">
        <div class="dash-section-title">📂 Core Lending Modules & Tools</div>
      </div>

      <div class="module-grid">
        <!-- 1. Approved Cars -->
        <div class="module-card" onclick="jumpToTab('approved_cars')">
          <div class="module-card-top">
            <div class="module-icon-box">🚗</div>
            <span class="module-badge">54 Models</span>
          </div>
          <div class="module-card-title">Approved Cars</div>
          <div class="module-card-desc">Verified passenger car models across Maruti, Hyundai, Tata, Mahindra & Honda with resale valuations.</div>
          <div class="module-card-footer">
            <span>Explore Models</span>
            <span class="arrow">→</span>
          </div>
        </div>

        <!-- 2. Car Policy -->
        <div class="module-card" onclick="jumpToTab('car_policy')">
          <div class="module-card-top">
            <div class="module-icon-box">📋</div>
            <span class="module-badge">Feb 2026</span>
          </div>
          <div class="module-card-title">Private Car Policy</div>
          <div class="module-card-desc">Complete underwriting guidelines, 5 credit programs, banking surrogates, multiplier tables & age limits.</div>
          <div class="module-card-footer">
            <span>View Policy</span>
            <span class="arrow">→</span>
          </div>
        </div>

        <!-- 3. CV Master Grid -->
        <div class="module-card blue-theme" onclick="jumpToTab('cv_grid')">
          <div class="module-card-top">
            <div class="module-icon-box">🚛</div>
            <span class="module-badge">214 Assets</span>
          </div>
          <div class="module-card-title">CV Valuation Grid</div>
          <div class="module-card-desc">14-year (2024 to 2011) valuation matrix for LCV, SCV, M&HCV, Tippers, School and Commercial Buses.</div>
          <div class="module-card-footer">
            <span>Check Valuations</span>
            <span class="arrow">→</span>
          </div>
        </div>

        <!-- 4. CV Policy -->
        <div class="module-card blue-theme" onclick="jumpToTab('cv_policy')">
          <div class="module-card-top">
            <div class="module-icon-box">📜</div>
            <span class="module-badge">19 Norms</span>
          </div>
          <div class="module-card-title">CV Credit Policy</div>
          <div class="module-card-desc">All 19 official parameters: branch level approvals up to ₹100L, Tatkal screen caps & CIBIL mitigation.</div>
          <div class="module-card-footer">
            <span>Read Guidelines</span>
            <span class="arrow">→</span>
          </div>
        </div>

        <!-- 5. Bolero Pickup Grid -->
        <div class="module-card" onclick="jumpToTab('bolero_pickup_grid')">
          <div class="module-card-top">
            <div class="module-icon-box">🚙</div>
            <span class="module-badge">10 Years</span>
          </div>
          <div class="module-card-title">Bolero Pickup Grid</div>
          <div class="module-card-desc">Year-wise valuation benchmarks (2022–2012) and profile-based LTV matrix (CAT A to F).</div>
          <div class="module-card-footer">
            <span>Open Bolero Grid</span>
            <span class="arrow">→</span>
          </div>
        </div>

        <!-- 6. Charges -->
        <div class="module-card green-theme" onclick="jumpToTab('charges')">
          <div class="module-card-top">
            <div class="module-icon-box">🏷️</div>
            <span class="module-badge">10 Heads</span>
          </div>
          <div class="module-card-title">Schedule of Charges</div>
          <div class="module-card-desc">Processing fees, bounce charges, valuation fees, ROC filing, document charges and foreclosure norms.</div>
          <div class="module-card-footer">
            <span>View Fee Tariff</span>
            <span class="arrow">→</span>
          </div>
        </div>

        <!-- 7. DSA Payout -->
        <div class="module-card green-theme" onclick="jumpToTab('dsa_payout')">
          <div class="module-card-top">
            <div class="module-icon-box">💰</div>
            <span class="module-badge">4.25% Max</span>
          </div>
          <div class="module-card-title">DSA Payout Calculator</div>
          <div class="module-card-desc">WIRR volume-linked commission tiers for Used Car, Used CV & M&HCV with PDD compliance rules.</div>
          <div class="module-card-footer">
            <span>Calculate Payout</span>
            <span class="arrow">→</span>
          </div>
        </div>

        <!-- 8. IRR Matrix -->
        <div class="module-card" onclick="jumpToTab('irr_matrix')">
          <div class="module-card-top">
            <div class="module-icon-box">📊</div>
            <span class="module-badge">CIBIL Tiered</span>
          </div>
          <div class="module-card-title">IRR & Rate Matrix</div>
          <div class="module-card-desc">Interest rate matrix structured by CIBIL tiers (>750, 700-749, 650-699) and loan tenures (36M - 84M).</div>
          <div class="module-card-footer">
            <span>Inspect Rates</span>
            <span class="arrow">→</span>
          </div>
        </div>

        <!-- 9. EMI Calculator -->
        <div class="module-card blue-theme" onclick="jumpToTab('emi_calculator')">
          <div class="module-card-top">
            <div class="module-icon-box">🧮</div>
            <span class="module-badge">Amortization</span>
          </div>
          <div class="module-card-title">EMI Calculator</div>
          <div class="module-card-desc">Precision monthly installment calculator with full month-by-month principal-interest breakdown & WhatsApp share.</div>
          <div class="module-card-footer">
            <span>Calculate EMI</span>
            <span class="arrow">→</span>
          </div>
        </div>

        <!-- 10. Documents Checklist -->
        <div class="module-card" onclick="jumpToTab('documents')">
          <div class="module-card-top">
            <div class="module-icon-box">📁</div>
            <span class="module-badge">KYC Ready</span>
          </div>
          <div class="module-card-title">Document Checklist</div>
          <div class="module-card-desc">Interactive checklist of required loan documentation for Salaried, SENP, SEP, Fleet Operators & Fast Track.</div>
          <div class="module-card-footer">
            <span>Check Documents</span>
            <span class="arrow">→</span>
          </div>
        </div>

        <!-- 11. New Lead -->
        <div class="module-card red-theme" onclick="jumpToTab('new_lead')">
          <div class="module-card-top">
            <div class="module-icon-box">🚀</div>
            <span class="module-badge">Sourcing</span>
          </div>
          <div class="module-card-title">Log New Lead</div>
          <div class="module-card-desc">Quickly punch in a new customer lead, capture details, and send to the credit team instantly.</div>
          <div class="module-card-footer">
            <span>Add Lead</span>
            <span class="arrow">→</span>
          </div>
        </div>

        <!-- 12. Contact Directory -->
        <div class="module-card" onclick="jumpToTab('contacts')">
          <div class="module-card-top">
            <div class="module-icon-box">📞</div>
            <span class="module-badge">Directory</span>
          </div>
          <div class="module-card-title">Branch & Credit Contacts</div>
          <div class="module-card-desc">Direct 1-tap phone, WhatsApp & email contacts for Branch Credit Managers, Operations & Payout Desk.</div>
          <div class="module-card-footer">
            <span>Open Directory</span>
            <span class="arrow">→</span>
          </div>
        </div>
      </div>

      <!-- QUICK DASHBOARD ESTIMATORS -->
      <div class="dash-section-header">
        <div class="dash-section-title">⚡ Instant Financial Estimators</div>
      </div>

      <div class="dash-calc-grid">
        <!-- Quick EMI Estimator -->
        <div class="dash-calc-box">
          <div class="dash-calc-header">
            <div class="dash-calc-title">
              <span>🧮</span> Quick Loan EMI Estimator
            </div>
            <button class="btn btn-secondary" style="padding: 4px 10px; font-size: 11px;" onclick="jumpToTab('emi_calculator')">Full Tool →</button>
          </div>

          <div class="dash-calc-result-box">
            <div>
              <div class="dash-calc-result-label">ESTIMATED MONTHLY EMI</div>
              <div class="subtext" id="dash-quick-emi-subtext">${formatINR(quickEmiAmount)} @ ${quickEmiRate}% for ${quickEmiTenure}M</div>
            </div>
            <div class="dash-calc-result-val" id="dash-quick-emi-val">${formatINR(quickEmiRes.emi)}</div>
          </div>

          <div class="dash-calc-slider-row">
            <div class="dash-calc-slider-labels">
              <span>Loan Amount</span>
              <strong id="dash-slider-amt-label">${formatINR(quickEmiAmount)}</strong>
            </div>
            <input type="range" id="dash-slider-amt" min="100000" max="5000000" step="50000" value="${quickEmiAmount}" />
          </div>

          <div class="dash-calc-slider-row">
            <div class="dash-calc-slider-labels">
              <span>Tenure (Months)</span>
              <strong id="dash-slider-tenure-label">${quickEmiTenure} Months (${quickEmiTenure / 12} Yrs)</strong>
            </div>
            <input type="range" id="dash-slider-tenure" min="12" max="84" step="6" value="${quickEmiTenure}" />
          </div>
        </div>

        <!-- Quick DSA Commission Estimator -->
        <div class="dash-calc-box">
          <div class="dash-calc-header">
            <div class="dash-calc-title">
              <span>💰</span> Quick DSA Commission Estimator
            </div>
            <button class="btn btn-secondary" style="padding: 4px 10px; font-size: 11px;" onclick="jumpToTab('dsa_payout')">Full Slabs →</button>
          </div>

          <div class="dash-calc-result-box">
            <div>
              <div class="dash-calc-result-label">ESTIMATED DSA COMMISSION</div>
              <div class="subtext" id="dash-quick-payout-subtext">@ 3.50% on ${formatINR(quickPayoutVol)}</div>
            </div>
            <div class="dash-calc-result-val" style="color: var(--emerald);" id="dash-quick-payout-val">${formatINR(quickPayoutRes)}</div>
          </div>

          <div class="dash-calc-slider-row">
            <div class="dash-calc-slider-labels">
              <span>Monthly Disbursed Volume</span>
              <strong id="dash-slider-vol-label">${formatINR(quickPayoutVol)}</strong>
            </div>
            <input type="range" id="dash-slider-vol" min="200000" max="10000000" step="100000" value="${quickPayoutVol}" />
          </div>

          <div class="dash-calc-slider-row">
            <div class="dash-calc-slider-labels">
              <span>Payout Slab Rate</span>
              <strong id="dash-slider-payout-pct-label">3.50% (Used Car >20% IRR)</strong>
            </div>
            <input type="range" id="dash-slider-pct" min="1.25" max="4.25" step="0.25" value="3.50" />
          </div>
        </div>
      </div>



    </div>
  `;

  // Attach Dashboard Quick EMI Estimator listeners
  const sliderAmt = document.getElementById('dash-slider-amt');
  const sliderTenure = document.getElementById('dash-slider-tenure');
  const emiVal = document.getElementById('dash-quick-emi-val');
  const emiSub = document.getElementById('dash-quick-emi-subtext');
  const amtLabel = document.getElementById('dash-slider-amt-label');
  const tenureLabel = document.getElementById('dash-slider-tenure-label');

  function updateQuickEmi() {
    if (!sliderAmt || !sliderTenure) return;
    const amt = Number(sliderAmt.value);
    const tenure = Number(sliderTenure.value);
    state.emiAmount = amt;
    state.emiTenure = tenure;
    if (amtLabel) amtLabel.innerText = formatINR(amt);
    if (tenureLabel) tenureLabel.innerText = `${tenure} Months (${tenure / 12} Yrs)`;
    const res = calculateEMI(amt, state.emiRate || 9.25, tenure);
    if (emiVal) emiVal.innerText = formatINR(res.emi);
    if (emiSub) emiSub.innerText = `${formatINR(amt)} @ ${state.emiRate || 9.25}% for ${tenure}M`;
  }

  sliderAmt?.addEventListener('input', updateQuickEmi);
  sliderTenure?.addEventListener('input', updateQuickEmi);

  // Attach Dashboard Quick Payout Estimator listeners
  const sliderVol = document.getElementById('dash-slider-vol');
  const sliderPct = document.getElementById('dash-slider-pct');
  const payoutVal = document.getElementById('dash-quick-payout-val');
  const payoutSub = document.getElementById('dash-quick-payout-subtext');
  const volLabel = document.getElementById('dash-slider-vol-label');
  const pctLabel = document.getElementById('dash-slider-payout-pct-label');

  function updateQuickPayout() {
    if (!sliderVol || !sliderPct) return;
    const vol = Number(sliderVol.value);
    const pct = Number(sliderPct.value);
    state.payoutAmount = vol;
    if (volLabel) volLabel.innerText = formatINR(vol);
    if (pctLabel) pctLabel.innerText = `${pct.toFixed(2)}%`;
    const earned = (vol * pct) / 100;
    if (payoutVal) payoutVal.innerText = formatINR(earned);
    if (payoutSub) payoutSub.innerText = `@ ${pct.toFixed(2)}% on ${formatINR(vol)}`;
  }

  sliderVol?.addEventListener('input', updateQuickPayout);
  sliderPct?.addEventListener('input', updateQuickPayout);
}

// ================= MODULE 0.5: APPROVED CAR GRID & POLICY DESK =================
const APPROVED_CARS_DATA = [
  { sNo: 1, model: "Honda Amaze", oem: "Honda", trims: "Trims: V, VX, ZX", category: "Hatchback / Sedan", years: { 2024: 7.60, 2023: 6.95, 2022: 6.35, 2021: 5.75, 2020: 5.20, 2019: 4.70, 2018: 4.20, 2017: 3.75, 2016: 3.35, 2015: 2.95, 2014: 2.60, 2013: 2.30, 2012: null, 2011: null } },
  { sNo: 2, model: "Honda City", oem: "Honda", trims: "Trims: SV, V, ZX, ZX Plus", category: "Hatchback / Sedan", years: { 2024: 12.20, 2023: 11.10, 2022: 10.15, 2021: 9.25, 2020: 8.40, 2019: 7.60, 2018: 6.85, 2017: 6.15, 2016: 5.50, 2015: 4.90, 2014: 4.35, 2013: 3.80, 2012: 3.35, 2011: null } },
  { sNo: 3, model: "Honda WR-V", oem: "Honda", trims: "Trims: S, SV, VX, Exclusive", category: "SUV / MUV", years: { 2024: 8.40, 2023: 7.65, 2022: 6.95, 2021: 6.30, 2020: 5.70, 2019: 5.15, 2018: 4.65, 2017: 4.15, 2016: null, 2015: null, 2014: null, 2013: null, 2012: null, 2011: null } },
  { sNo: 4, model: "Hyundai Aura", oem: "Hyundai", trims: "Trims: E, S, SX, SX Plus, SX(O)", category: "Hatchback / Sedan", years: { 2024: 6.80, 2023: 6.20, 2022: 5.65, 2021: 5.15, 2020: 4.65, 2019: null, 2018: null, 2017: null, 2016: null, 2015: null, 2014: null, 2013: null, 2012: null, 2011: null } },
  { sNo: 5, model: "Hyundai Creta", oem: "Hyundai", trims: "Trims: E, EX, S, S Plus, SX, SX(O), Knight", category: "SUV / MUV", years: { 2024: 14.50, 2023: 13.20, 2022: 12.00, 2021: 10.78, 2020: 9.65, 2019: 8.65, 2018: 7.75, 2017: 6.90, 2016: 6.15, 2015: 5.45, 2014: null, 2013: null, 2012: null, 2011: null } },
  { sNo: 6, model: "Hyundai Grand I 10", oem: "Hyundai", trims: "Trims: Era, Magna, Sportz, Asta, Nios", category: "Hatchback / Sedan", years: { 2024: 6.20, 2023: 5.65, 2022: 5.15, 2021: 4.65, 2020: 4.20, 2019: 3.80, 2018: 3.40, 2017: 3.05, 2016: 2.70, 2015: 2.40, 2014: 2.10, 2013: 1.85, 2012: null, 2011: null } },
  { sNo: 7, model: "Hyundai I 10", oem: "Hyundai", trims: "Trims: D-Lite, Era, Magna, Sportz, Asta", category: "Hatchback / Sedan", years: { 2024: null, 2023: null, 2022: null, 2021: null, 2020: null, 2019: null, 2018: null, 2017: 2.60, 2016: 2.30, 2015: 2.05, 2014: 1.80, 2013: 1.60, 2012: 1.40, 2011: 1.25 } },
  { sNo: 8, model: "Hyundai I 20", oem: "Hyundai", trims: "Trims: Magna, Sportz, Asta, Asta(O), N-Line", category: "Hatchback / Sedan", years: { 2024: 8.50, 2023: 7.75, 2022: 7.05, 2021: 6.40, 2020: 5.80, 2019: 5.25, 2018: 4.70, 2017: 4.20, 2016: 3.75, 2015: 3.35, 2014: 2.95, 2013: 2.60, 2012: 2.30, 2011: 2.05 } },
  { sNo: 9, model: "Hyundai Venue", oem: "Hyundai", trims: "Trims: E, S, S Plus, SX, SX(O), N-Line", category: "SUV / MUV", years: { 2024: 9.80, 2023: 8.90, 2022: 8.10, 2021: 7.35, 2020: 6.65, 2019: 6.00, 2018: null, 2017: null, 2016: null, 2015: null, 2014: null, 2013: null, 2012: null, 2011: null } },
  { sNo: 10, model: "Hyundai Verna", oem: "Hyundai", trims: "Trims: EX, S, SX, SX(O), Turbo", category: "Hatchback / Sedan", years: { 2024: 12.80, 2023: 11.65, 2022: 10.60, 2021: 9.60, 2020: 8.70, 2019: 7.85, 2018: 7.05, 2017: 6.35, 2016: 5.65, 2015: 5.05, 2014: 4.45, 2013: 3.95, 2012: 3.50, 2011: 3.10 } },
  { sNo: 11, model: "Hyundai Xcent", oem: "Hyundai", trims: "Trims: Base, S, SX, SX(O)", category: "Hatchback / Sedan", years: { 2024: null, 2023: null, 2022: null, 2021: null, 2020: 4.40, 2019: 3.95, 2018: 3.55, 2017: 3.15, 2016: 2.80, 2015: 2.50, 2014: 2.20, 2013: null, 2012: null, 2011: null } },
  { sNo: 12, model: "Jeep Compass", oem: "Jeep", trims: "Trims: Sport, Longitude, Limited, Model S", category: "SUV / MUV", years: { 2024: 19.50, 2023: 17.75, 2022: 16.15, 2021: 14.65, 2020: 13.25, 2019: 11.95, 2018: 10.75, 2017: 9.65, 2016: null, 2015: null, 2014: null, 2013: null, 2012: null, 2011: null } },
  { sNo: 13, model: "Kia Seltos", oem: "Kia", trims: "Trims: HTE, HTK, HTX, GTX, X-Line", category: "SUV / MUV", years: { 2024: 14.20, 2023: 12.95, 2022: 11.75, 2021: 10.65, 2020: 9.60, 2019: 8.65, 2018: null, 2017: null, 2016: null, 2015: null, 2014: null, 2013: null, 2012: null, 2011: null } },
  { sNo: 14, model: "Kia Sonet", oem: "Kia", trims: "Trims: HTE, HTK, HTX, GTX, X-Line", category: "SUV / MUV", years: { 2024: 9.60, 2023: 8.75, 2022: 7.95, 2021: 7.20, 2020: 6.50, 2019: null, 2018: null, 2017: null, 2016: null, 2015: null, 2014: null, 2013: null, 2012: null, 2011: null } },
  { sNo: 15, model: "Mahindra Bolero", oem: "Mahindra", trims: "Trims: B4, B6, B6 Opt, Power Plus", category: "SUV / MUV", years: { 2024: 8.90, 2023: 8.10, 2022: 7.35, 2021: 6.65, 2020: 6.00, 2019: 5.40, 2018: 4.85, 2017: 4.35, 2016: 3.90, 2015: 3.45, 2014: 3.05, 2013: 2.70, 2012: 2.40, 2011: 2.10 } },
  { sNo: 16, model: "Mahindra Scorpio S 10", oem: "Mahindra", trims: "Trims: S10 2WD, S10 4WD, Special Edition", category: "SUV / MUV", years: { 2024: null, 2023: null, 2022: null, 2021: null, 2020: null, 2019: 9.10, 2018: 8.20, 2017: 7.35, 2016: 6.55, 2015: 5.85, 2014: 5.20, 2013: null, 2012: null, 2011: null } },
  { sNo: 17, model: "Mahindra Scorpio S 11", oem: "Mahindra", trims: "Trims: S11 Classic, S11 2WD, S11 4WD", category: "SUV / MUV", years: { 2024: 14.80, 2023: 13.50, 2022: 12.25, 2021: 11.10, 2020: 10.05, 2019: 9.10, 2018: 8.20, 2017: null, 2016: null, 2015: null, 2014: null, 2013: null, 2012: null, 2011: null } },
  { sNo: 18, model: "Mahindra Thar", oem: "Mahindra", trims: "Trims: AX Opt, LX 4x2, LX 4x4, Earth Edition", category: "SUV / MUV", years: { 2024: 13.50, 2023: 12.30, 2022: 11.15, 2021: 10.10, 2020: 9.15, 2019: 6.80, 2018: 6.10, 2017: 5.45, 2016: 4.85, 2015: 4.30, 2014: 3.80, 2013: 3.35, 2012: 2.95, 2011: null } },
  { sNo: 19, model: "Mahindra XUV 300", oem: "Mahindra", trims: "Trims: W4, W6, W8, W8(O), TurboSport", category: "SUV / MUV", years: { 2024: 10.20, 2023: 9.30, 2022: 8.45, 2021: 7.65, 2020: 6.90, 2019: 6.25, 2018: null, 2017: null, 2016: null, 2015: null, 2014: null, 2013: null, 2012: null, 2011: null } },
  { sNo: 20, model: "Maruti Alto", oem: "Maruti", trims: "Trims: Std, LX, LXi, VXi", category: "Hatchback / Sedan", years: { 2024: null, 2023: null, 2022: null, 2021: null, 2020: null, 2019: 2.10, 2018: 1.85, 2017: 1.65, 2016: 1.45, 2015: 1.30, 2014: 1.15, 2013: 1.00, 2012: 0.90, 2011: 0.80 } },
  { sNo: 21, model: "Maruti Alto 800", oem: "Maruti", trims: "Trims: Std, LXi, VXi, VXi Plus", category: "Hatchback / Sedan", years: { 2024: null, 2023: 3.30, 2022: 3.00, 2021: 2.70, 2020: 2.45, 2019: 2.20, 2018: 1.95, 2017: 1.75, 2016: 1.55, 2015: 1.35, 2014: 1.20, 2013: 1.05, 2012: 0.95, 2011: null } },
  { sNo: 22, model: "Maruti Alto K 10", oem: "Maruti", trims: "Trims: Std, LXi, VXi, VXi Plus", category: "Hatchback / Sedan", years: { 2024: 4.50, 2023: 4.10, 2022: 3.70, 2021: 3.10, 2020: 2.80, 2019: 2.50, 2018: 2.25, 2017: 2.00, 2016: 1.80, 2015: 1.60, 2014: 1.40, 2013: 1.25, 2012: 1.10, 2011: 0.95 } },
  { sNo: 23, model: "Maruti Baleno", oem: "Maruti", trims: "Trims: Sigma, Delta, Zeta, Alpha", category: "Hatchback / Sedan", years: { 2024: 7.80, 2023: 7.10, 2022: 6.45, 2021: 5.85, 2020: 5.30, 2019: 4.80, 2018: 4.30, 2017: 3.85, 2016: 3.45, 2015: 3.10, 2014: null, 2013: null, 2012: null, 2011: null } },
  { sNo: 24, model: "Maruti Celerio", oem: "Maruti", trims: "Trims: LXi, VXi, ZXi, ZXi Plus", category: "Hatchback / Sedan", years: { 2024: 5.60, 2023: 5.10, 2022: 4.65, 2021: 4.20, 2020: 3.80, 2019: 3.40, 2018: 3.05, 2017: 2.70, 2016: 2.40, 2015: 2.15, 2014: 1.90, 2013: null, 2012: null, 2011: null } },
  { sNo: 25, model: "Maruti Ciaz", oem: "Maruti", trims: "Trims: Sigma, Delta, Zeta, Alpha", category: "Hatchback / Sedan", years: { 2024: 9.20, 2023: 8.35, 2022: 7.60, 2021: 6.90, 2020: 6.25, 2019: 5.65, 2018: 5.10, 2017: 4.55, 2016: 4.10, 2015: 3.65, 2014: 3.25, 2013: null, 2012: null, 2011: null } },
  { sNo: 26, model: "Maruti Eeco", oem: "Maruti", trims: "Trims: 5 Str, 7 Str, Cargo, Ambulance, CNG", category: "Van / Utility", years: { 2024: 4.80, 2023: 4.35, 2022: 3.95, 2021: 3.60, 2020: 3.25, 2019: 2.90, 2018: 2.60, 2017: 2.30, 2016: 2.05, 2015: 1.80, 2014: 1.60, 2013: 1.40, 2012: 1.25, 2011: 1.10 } },
  { sNo: 27, model: "Maruti Ertiga", oem: "Maruti", trims: "Trims: LXi, VXi, ZXi, ZXi Plus", category: "SUV / MUV", years: { 2024: 10.40, 2023: 9.50, 2022: 8.65, 2021: 7.85, 2020: 7.10, 2019: 6.40, 2018: 5.75, 2017: 5.15, 2016: 4.60, 2015: 4.10, 2014: 3.65, 2013: 3.25, 2012: 2.90, 2011: null } },
  { sNo: 28, model: "Maruti Ignis", oem: "Maruti", trims: "Trims: Sigma, Delta, Zeta, Alpha", category: "Hatchback / Sedan", years: { 2024: 6.10, 2023: 5.55, 2022: 5.05, 2021: 4.55, 2020: 4.10, 2019: 3.70, 2018: 3.30, 2017: 2.95, 2016: null, 2015: null, 2014: null, 2013: null, 2012: null, 2011: null } },
  { sNo: 29, model: "Maruti Omni", oem: "Maruti", trims: "Trims: 5 Str, 8 Str, Cargo, LPG", category: "Van / Utility", years: { 2024: null, 2023: null, 2022: null, 2021: null, 2020: null, 2019: 2.20, 2018: 1.95, 2017: 1.70, 2016: 1.50, 2015: 1.30, 2014: 1.15, 2013: 1.00, 2012: 0.85, 2011: 0.75 } },
  { sNo: 30, model: "Maruti S Cross", oem: "Maruti", trims: "Trims: Sigma, Delta, Zeta, Alpha", category: "SUV / MUV", years: { 2024: null, 2023: null, 2022: 7.95, 2021: 7.20, 2020: 6.50, 2019: 5.85, 2018: 5.25, 2017: 4.70, 2016: 4.20, 2015: 3.75, 2014: null, 2013: null, 2012: null, 2011: null } },
  { sNo: 31, model: "Maruti S-Presso", oem: "Maruti", trims: "Trims: Std, LXi, VXi, VXi Plus", category: "Hatchback / Sedan", years: { 2024: 4.90, 2023: 4.45, 2022: 4.05, 2021: 3.65, 2020: 3.30, 2019: 2.95, 2018: null, 2017: null, 2016: null, 2015: null, 2014: null, 2013: null, 2012: null, 2011: null } },
  { sNo: 32, model: "Maruti Swift", oem: "Maruti", trims: "Trims: LXi, VXi, ZXi, ZXi Plus", category: "Hatchback / Sedan", years: { 2024: 7.20, 2023: 6.55, 2022: 5.95, 2021: 5.40, 2020: 4.90, 2019: 4.40, 2018: 3.95, 2017: 3.55, 2016: 3.15, 2015: 2.80, 2014: 2.50, 2013: 2.20, 2012: 1.95, 2011: 1.70 } },
  { sNo: 33, model: "Maruti Swift Dzire", oem: "Maruti", trims: "Trims: LXi, VXi, ZXi, ZXi Plus, Tour S", category: "Hatchback / Sedan", years: { 2024: 7.80, 2023: 7.10, 2022: 6.45, 2021: 5.85, 2020: 5.30, 2019: 4.80, 2018: 4.30, 2017: 3.85, 2016: 3.45, 2015: 3.10, 2014: 2.75, 2013: 2.45, 2012: 2.15, 2011: 1.90 } },
  { sNo: 34, model: "Maruti Vitara Brezza", oem: "Maruti", trims: "Trims: LXi, VXi, ZXi, ZXi Plus", category: "SUV / MUV", years: { 2024: 9.90, 2023: 9.00, 2022: 8.20, 2021: 7.45, 2020: 6.75, 2019: 6.10, 2018: 5.50, 2017: 4.90, 2016: 4.40, 2015: null, 2014: null, 2013: null, 2012: null, 2011: null } },
  { sNo: 35, model: "Maruti Wagon R", oem: "Maruti", trims: "Trims: LXi, VXi, ZXi, ZXi Plus", category: "Hatchback / Sedan", years: { 2024: 6.20, 2023: 5.65, 2022: 5.15, 2021: 4.65, 2020: 4.20, 2019: 3.80, 2018: 3.35, 2017: 2.95, 2016: 2.60, 2015: 2.30, 2014: 2.05, 2013: 1.80, 2012: 1.60, 2011: 1.40 } },
  { sNo: 36, model: "Maruti XL 6", oem: "Maruti", trims: "Trims: Zeta, Alpha, Alpha Plus", category: "SUV / MUV", years: { 2024: 11.80, 2023: 10.75, 2022: 9.75, 2021: 8.85, 2020: 8.00, 2019: 7.25, 2018: null, 2017: null, 2016: null, 2015: null, 2014: null, 2013: null, 2012: null, 2011: null } },
  { sNo: 37, model: "Renault Kwid", oem: "Renault", trims: "Trims: RXE, RXL, RXT, Climber", category: "Hatchback / Sedan", years: { 2024: 4.60, 2023: 4.15, 2022: 3.75, 2021: 3.40, 2020: 3.05, 2019: 2.75, 2018: 2.45, 2017: 2.15, 2016: 1.90, 2015: 1.70, 2014: null, 2013: null, 2012: null, 2011: null } },
  { sNo: 38, model: "Tata Altroz", oem: "Tata", trims: "Trims: XE, XM, XT, XZ, XZ Plus", category: "Hatchback / Sedan", years: { 2024: 7.60, 2023: 6.90, 2022: 6.25, 2021: 5.65, 2020: 5.10, 2019: null, 2018: null, 2017: null, 2016: null, 2015: null, 2014: null, 2013: null, 2012: null, 2011: null } },
  { sNo: 39, model: "Tata Bolt", oem: "Tata", trims: "Trims: XE, XM, XMS, XT", category: "Hatchback / Sedan", years: { 2024: null, 2023: null, 2022: null, 2021: null, 2020: null, 2019: 2.80, 2018: 2.50, 2017: 2.20, 2016: 1.95, 2015: 1.70, 2014: 1.50, 2013: null, 2012: null, 2011: null } },
  { sNo: 40, model: "Tata Harrier", oem: "Tata", trims: "Trims: Smart, Pure, Adventure, Fearless, Dark", category: "SUV / MUV", years: { 2024: 17.50, 2023: 15.90, 2022: 14.45, 2021: 13.10, 2020: 11.85, 2019: 10.70, 2018: null, 2017: null, 2016: null, 2015: null, 2014: null, 2013: null, 2012: null, 2011: null } },
  { sNo: 41, model: "Tata Hexa", oem: "Tata", trims: "Trims: XE, XM, XMA, XT, XTA, 4x4", category: "SUV / MUV", years: { 2024: null, 2023: null, 2022: null, 2021: null, 2020: 9.80, 2019: 8.80, 2018: 7.90, 2017: 7.10, 2016: null, 2015: null, 2014: null, 2013: null, 2012: null, 2011: null } },
  { sNo: 42, model: "Tata Nexon", oem: "Tata", trims: "Trims: Smart, Pure, Creative, Fearless, EV", category: "SUV / MUV", years: { 2024: 10.80, 2023: 9.85, 2022: 8.95, 2021: 8.10, 2020: 7.30, 2019: 6.60, 2018: 5.95, 2017: 5.35, 2016: null, 2015: null, 2014: null, 2013: null, 2012: null, 2011: null } },
  { sNo: 43, model: "Tata Tiago", oem: "Tata", trims: "Trims: XE, XM, XT, XZ, XZ Plus, NRG", category: "Hatchback / Sedan", years: { 2024: 5.90, 2023: 5.35, 2022: 4.85, 2021: 4.40, 2020: 3.95, 2019: 3.55, 2018: 3.20, 2017: 2.85, 2016: 2.55, 2015: null, 2014: null, 2013: null, 2012: null, 2011: null } },
  { sNo: 44, model: "Toyota Fortuner", oem: "Toyota", trims: "Trims: 4x2 AT/MT, 4x4 AT/MT, Legender", category: "SUV / MUV", years: { 2024: 33.00, 2023: 30.20, 2022: 27.50, 2021: 25.00, 2020: 22.70, 2019: 20.60, 2018: 18.70, 2017: 16.90, 2016: 15.20, 2015: 13.60, 2014: 12.10, 2013: 10.80, 2012: 9.60, 2011: 8.50 } },
  { sNo: 45, model: "Toyota Glanza", oem: "Toyota", trims: "Trims: E, S, G, V", category: "Hatchback / Sedan", years: { 2024: 7.80, 2023: 7.10, 2022: 6.45, 2021: 5.85, 2020: 5.30, 2019: 4.80, 2018: null, 2017: null, 2016: null, 2015: null, 2014: null, 2013: null, 2012: null, 2011: null } },
  { sNo: 46, model: "Toyota Innova", oem: "Toyota", trims: "Trims: GX, VX, ZX, Touring Sport", category: "SUV / MUV", years: { 2024: null, 2023: null, 2022: null, 2021: null, 2020: null, 2019: null, 2018: null, 2017: null, 2016: 9.80, 2015: 8.80, 2014: 7.85, 2013: 7.00, 2012: 6.25, 2011: 5.55 } },
  { sNo: 47, model: "Toyota Innova Crysta", oem: "Toyota", trims: "Trims: GX, VX, ZX, Leadership", category: "SUV / MUV", years: { 2024: 19.80, 2023: 18.00, 2022: 16.35, 2021: 14.85, 2020: 13.45, 2019: 12.15, 2018: 10.95, 2017: 9.85, 2016: 8.85, 2015: null, 2014: null, 2013: null, 2012: null, 2011: null } },
  { sNo: 48, model: "Toyota Urban Cruiser", oem: "Toyota", trims: "Trims: Mid, High, Premium", category: "SUV / MUV", years: { 2024: null, 2023: 8.55, 2022: 7.75, 2021: 7.05, 2020: 6.40, 2019: null, 2018: null, 2017: null, 2016: null, 2015: null, 2014: null, 2013: null, 2012: null, 2011: null } },
  { sNo: 49, model: "Mahindra XUV 700", oem: "Mahindra", trims: "Trims: MX, AX3, AX5, AX7, AX7L, AWD", category: "SUV / MUV", years: { 2024: 18.50, 2023: 16.80, 2022: 15.25, 2021: 13.85, 2020: null, 2019: null, 2018: null, 2017: null, 2016: null, 2015: null, 2014: null, 2013: null, 2012: null, 2011: null } },
  { sNo: 50, model: "Tata Punch", oem: "Tata", trims: "Trims: Pure, Adventure, Accomplished, Creative", category: "SUV / MUV", years: { 2024: 6.90, 2023: 6.25, 2022: 5.65, 2021: 5.10, 2020: null, 2019: null, 2018: null, 2017: null, 2016: null, 2015: null, 2014: null, 2013: null, 2012: null, 2011: null } },
  { sNo: 51, model: "Toyota Hyryder", oem: "Toyota", trims: "Trims: E, S, G, V, Neo Drive, Strong Hybrid", category: "SUV / MUV", years: { 2024: 13.80, 2023: 12.50, 2022: 11.35, 2021: null, 2020: null, 2019: null, 2018: null, 2017: null, 2016: null, 2015: null, 2014: null, 2013: null, 2012: null, 2011: null } },
  { sNo: 52, model: "Mahindra Scorpio N", oem: "Mahindra", trims: "Trims: Z2, Z4, Z6, Z8, Z8L, 4x4", category: "SUV / MUV", years: { 2024: 16.50, 2023: 15.00, 2022: 13.60, 2021: null, 2020: null, 2019: null, 2018: null, 2017: null, 2016: null, 2015: null, 2014: null, 2013: null, 2012: null, 2011: null } },
  { sNo: 53, model: "Tata Tigor", oem: "Tata", trims: "Trims: XE, XM, XZ, XZ Plus, EV", category: "Hatchback / Sedan", years: { 2024: 6.40, 2023: 5.80, 2022: 5.25, 2021: 4.75, 2020: 4.30, 2019: 3.85, 2018: 3.45, 2017: 3.10, 2016: null, 2015: null, 2014: null, 2013: null, 2012: null, 2011: null } },
  { sNo: 54, model: "Toyota Etios", oem: "Toyota", trims: "Trims: GD, VD, VXD, Platinum", category: "Hatchback / Sedan", years: { 2024: null, 2023: null, 2022: null, 2021: null, 2020: 4.40, 2019: 3.95, 2018: 3.55, 2017: 3.15, 2016: 2.80, 2015: 2.50, 2014: 2.20, 2013: 1.95, 2012: 1.70, 2011: 1.50 } }
];

// App Local State for Approved Car Desk
const carDeskState = {
  search: '',
  bodyFilter: 'ALL',
  mfgYear: 'ALL',
  ownerSeq: '1st', // '1st', '2nd', '3rd', '4th', '5th'
  oemFilter: 'ALL',
  instantModel: 'Hyundai Creta',
  instantYear: 2021,
  instantKm: 'under20k',
  instantOwner: '1st'
};

const OWNER_MULTIPLIERS = {
  '1st': { mult: 1.00, label: '1st Owner (100%)', desc: 'Single owner - 100% standard baseline grid value' },
  '2nd': { mult: 0.95, label: '2nd Owner (-5%)', desc: 'Second owner - 5% baseline grid deduction' },
  '3rd': { mult: 0.88, label: '3rd Owner (-12%)', desc: 'Third owner - 12% baseline grid deduction' },
  '4th': { mult: 0.82, label: '4th Owner (-18%)', desc: 'Fourth owner - 18% baseline grid deduction' },
  '5th': { mult: 0.78, label: '5th Owner (-22%)', desc: 'Fifth owner - 22% baseline grid deduction' }
};

const KM_MULTIPLIERS = {
  'under20k': { mult: 1.04, label: 'Under 20k km (~15,000 km)' },
  '20k_40k': { mult: 1.00, label: '20k - 40k km (~30,000 km)' },
  '40k_60k': { mult: 0.96, label: '40k - 60k km (~50,000 km)' },
  '60k_80k': { mult: 0.92, label: '60k - 80k km (~70,000 km)' },
  'above80k': { mult: 0.86, label: 'Above 80k km (>100,000 km)' }
};

const YEAR_COLS = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011];

function calculateCarInstantValue(modelName, year, kmKey, ownerKey) {
  const item = APPROVED_CARS_DATA.find(c => c.model === modelName) || APPROVED_CARS_DATA[4]; // Default Creta
  const baseVal = item.years[year] || 10.78;
  const kmMult = KM_MULTIPLIERS[kmKey]?.mult || 1.00;
  const ownerMult = OWNER_MULTIPLIERS[ownerKey]?.mult || 1.00;
  const fairVal = baseVal * kmMult * ownerMult;
  const loanCap = fairVal * 0.85;
  return { fairVal, loanCap };
}

function renderApprovedCarsScreen(container) {
  const currentOwnerObj = OWNER_MULTIPLIERS[carDeskState.ownerSeq];
  const { fairVal, loanCap } = calculateCarInstantValue(
    carDeskState.instantModel,
    carDeskState.instantYear,
    carDeskState.instantKm,
    carDeskState.instantOwner
  );

  // Filter models
  const q = carDeskState.search.toLowerCase().trim();
  const filteredCars = APPROVED_CARS_DATA.filter(car => {
    if (carDeskState.oemFilter !== 'ALL' && car.oem !== carDeskState.oemFilter) return false;
    if (carDeskState.bodyFilter !== 'ALL' && car.category !== carDeskState.bodyFilter) return false;
    if (q) {
      const matchText = `${car.model} ${car.oem} ${car.trims} ${car.category}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    return true;
  });

  const oems = ['All', 'Honda', 'Hyundai', 'Jeep', 'Kia', 'Mahindra', 'Maruti', 'Renault', 'Tata', 'Toyota'];
  const bodyCategories = [
    { key: 'ALL', label: 'All' },
    { key: 'Hatchback / Sedan', label: 'Hatchback / Sedan' },
    { key: 'SUV / MUV', label: 'SUV / MUV' },
    { key: 'Van / Utility', label: 'Van / Utility' }
  ];

  container.innerHTML = `
    <div class="car-desk-container">

      <!-- 1. TOP HEADER BANNER CARD -->
      <div class="car-hero-card">
        <div class="car-pill-badges-row">
          <span class="car-pill blue">🚗 Approved Car Grid</span>
          <span class="car-pill amber">✓ 54 Master Approved Vehicles & Variants</span>
          <span class="car-pill orange">⏳ Kilometer & Odometer Precision</span>
          <span class="car-pill purple">⚡ Instant Value Finder</span>
        </div>

        <div class="car-hero-body">
          <div>
            <h1 class="car-hero-title">Approved Car Grid & Policy Desk</h1>
            <p class="car-hero-desc">
              Real-time valuation based on car variant, manufacturing year, RC owner sequence, and odometer kilometers driven. Displays instant market value and complete Kredit Venture Used Car Loan Policy norms.
            </p>
          </div>
          <a href="https://www.carwale.com/used/car-valuation/" target="_blank" class="btn-carwale">
            CarWale Live Valuation ↗
          </a>
        </div>

        <div class="car-subnav-row">
          <button class="car-subnav-tab active">▦ Approved Car Grid Matrix (2011-2024)</button>
          <button class="car-subnav-tab" onclick="jumpToTab('valuation_calculator')">📊 Variant & Kilometer Valuation Calculator</button>
          <button class="car-subnav-tab" onclick="jumpToTab('approved_cars')">≡ 54 Approved Vehicles & Variant Families</button>
          <button class="car-subnav-tab policy-tab" onclick="jumpToTab('car_policy')">✚ Private Car Policy (Feb 2026)</button>
        </div>
      </div>

      <!-- 2. INSTANT VALUE & LOAN ELIGIBILITY FINDER (LIVE) -->
      <div class="car-instant-card">
        <div class="car-instant-header">
          <div class="car-instant-title-group">
            <div class="car-instant-title-row">
              <span>⚡</span> INSTANT VALUE & LOAN ELIGIBILITY FINDER
              <span class="car-live-badge-sm">LIVE</span>
            </div>
            <p class="car-instant-subtext">
              Change Model, Year, or Odometer Kms below to get the instant fair value and loan cap in real time.
            </p>
          </div>

          <div class="car-instant-stats-box">
            <div class="car-instant-stat-col">
              <span class="car-stat-label">INSTANT FAIR VALUE:</span>
              <span class="car-stat-val" id="desk-fair-val">₹${fairVal.toFixed(2)} Lakhs</span>
            </div>
            <div class="car-instant-stat-col">
              <span class="car-stat-label">85% LOAN CAP:</span>
              <span class="car-stat-val" id="desk-loan-cap">₹${loanCap.toFixed(2)} Lakhs</span>
            </div>
          </div>
        </div>

        <div class="car-instant-controls-row">
          <!-- Model Select -->
          <select class="car-select-dark" id="desk-model-select">
            ${APPROVED_CARS_DATA.map(c => `
              <option value="${c.model}" ${c.model === carDeskState.instantModel ? 'selected' : ''}>${c.model}</option>
            `).join('')}
          </select>

          <!-- Mfg Year Select -->
          <select class="car-select-dark" id="desk-year-select">
            ${YEAR_COLS.map(y => `
              <option value="${y}" ${y === Number(carDeskState.instantYear) ? 'selected' : ''}>Mfg: ${y}</option>
            `).join('')}
          </select>

          <!-- Odometer Select -->
          <select class="car-select-dark" id="desk-km-select">
            ${Object.entries(KM_MULTIPLIERS).map(([k, v]) => `
              <option value="${k}" ${k === carDeskState.instantKm ? 'selected' : ''}>${v.label}</option>
            `).join('')}
          </select>

          <!-- Owner Select -->
          <select class="car-select-dark" id="desk-owner-select">
            ${Object.entries(OWNER_MULTIPLIERS).map(([k, v]) => `
              <option value="${k}" ${k === carDeskState.instantOwner ? 'selected' : ''}>${k} Owner</option>
            `).join('')}
          </select>

          <!-- Action Button -->
          <button class="btn-desk-blue" onclick="jumpToTab('car_policy')">Full Policy Desk →</button>
        </div>
      </div>

      <!-- 3. WHITE SEARCH & FILTER TOOLBAR -->
      <div class="car-filter-card">
        <!-- Row 1: Search + Body + Mfg Year -->
        <div class="car-filter-row-1">
          <div class="car-search-input-box">
            <svg class="car-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input type="text" class="car-search-input" id="desk-search-input" placeholder="Search among 54 approved models or variants (e.g. Swift, Creta SX, Fortuner Legender)…" value="${carDeskState.search}" />
          </div>

          <div class="car-filter-group">
            <span class="car-filter-label">Body:</span>
            ${bodyCategories.map(b => `
              <button class="car-chip-light ${carDeskState.bodyFilter === b.key ? 'active' : ''}" data-desk-body="${b.key}">${b.label}</button>
            `).join('')}
          </div>

          <div class="car-filter-group">
            <span class="car-filter-label">Mfg Year:</span>
            <select class="car-select-light" id="desk-table-year-filter">
              <option value="ALL" ${carDeskState.mfgYear === 'ALL' ? 'selected' : ''}>All Years (2011-2024)</option>
              ${YEAR_COLS.map(y => `
                <option value="${y}" ${String(carDeskState.mfgYear) === String(y) ? 'selected' : ''}>${y}</option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- Row 2: Owner sequence on RC -->
        <div class="car-filter-row-2">
          <div class="car-filter-group">
            <span class="car-filter-label">👤 Owner No on RC:</span>
            ${Object.entries(OWNER_MULTIPLIERS).map(([k, v]) => `
              <button class="car-chip-light ${carDeskState.ownerSeq === k ? 'active' : ''}" data-desk-owner-seq="${k}">${v.label}</button>
            `).join('')}
          </div>
          <div class="car-info-helper">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <span id="desk-owner-helper-text">${currentOwnerObj.desc}</span>
          </div>
        </div>

        <!-- Row 3: OEM selection -->
        <div class="car-filter-row-3">
          <span class="car-filter-label">OEM:</span>
          ${oems.map(o => `
            <button class="car-chip-light ${(o === 'All' ? carDeskState.oemFilter === 'ALL' : carDeskState.oemFilter === o) ? 'active' : ''}" data-desk-oem="${o === 'All' ? 'ALL' : o}">${o}</button>
          `).join('')}
        </div>
      </div>

      <!-- 4. WHITE DATA GRID MATRIX CARD -->
      <div class="car-matrix-card">
        <div class="car-matrix-subbar">
          <div class="car-matrix-subbar-left">
            <span>Approved Car Grid Matrix (${filteredCars.length} Models)</span>
            <span class="car-matrix-owner-tag" id="desk-owner-subbar-tag">${currentOwnerObj.label}</span>
            <span style="color: var(--text-muted); font-weight: 400;">• Figures in <strong style="color: #2563EB;">₹ Lakhs</strong></span>
          </div>
          <div class="car-matrix-subbar-right">
            Click any cell to view Quick Quote & adjust Kilometers
          </div>
        </div>

        <div class="car-matrix-scroll">
          <table class="car-table">
            <thead>
              <tr>
                <th class="center-col" style="width: 40px;">#</th>
                <th style="min-width: 220px;">Approved Model & Variants</th>
                <th style="min-width: 140px;">Category</th>
                ${(carDeskState.mfgYear === 'ALL' ? YEAR_COLS : [Number(carDeskState.mfgYear)]).map(y => `
                  <th style="text-align: right; min-width: 65px;">${y}</th>
                `).join('')}
              </tr>
            </thead>
            <tbody>
              ${filteredCars.length === 0 ? `
                <tr>
                  <td colspan="${YEAR_COLS.length + 3}" style="text-align: center; padding: 30px; color: var(--text-muted);">
                    No matching approved models found for "${carDeskState.search}".
                  </td>
                </tr>
              ` : filteredCars.map((car, idx) => {
    const yearsToShow = carDeskState.mfgYear === 'ALL' ? YEAR_COLS : [Number(carDeskState.mfgYear)];
    const ownerMult = OWNER_MULTIPLIERS[carDeskState.ownerSeq].mult;

    return `
                  <tr>
                    <td class="center-col" style="color: var(--text-muted); font-weight: 700;">${car.sNo || idx + 1}</td>
                    <td>
                      <div class="car-model-col">
                        <span class="car-model-name">${car.model}</span>
                        <span class="car-model-oem">${car.oem}</span>
                        <span class="car-model-trims">${car.trims}</span>
                        <button class="btn-policy-desk-pill" onclick="jumpToTab('car_policy')">⚡ 1-Click Policy Desk</button>
                      </div>
                    </td>
                    <td>
                      <span class="car-cat-col">${car.category}</span>
                    </td>
                    ${yearsToShow.map(y => {
      const rawBase = car.years[y];
      if (rawBase === null || rawBase === undefined) {
        return `<td class="car-val-cell empty">-</td>`;
      }
      const adjustedVal = (rawBase * ownerMult).toFixed(2);
      return `
                        <td class="car-val-cell" data-click-car="${car.model}" data-click-year="${y}" title="${car.model} (${y}): ₹${adjustedVal} Lakhs">
                          ${adjustedVal}
                        </td>
                      `;
    }).join('')}
                  </tr>
                `;
  }).join('')}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;

  // Attach Event Listeners
  // 1. Instant Finder Selects
  const mSelect = document.getElementById('desk-model-select');
  const ySelect = document.getElementById('desk-year-select');
  const kSelect = document.getElementById('desk-km-select');
  const oSelect = document.getElementById('desk-owner-select');

  function updateInstantFinderFromSelects() {
    carDeskState.instantModel = mSelect.value;
    carDeskState.instantYear = Number(ySelect.value);
    carDeskState.instantKm = kSelect.value;
    carDeskState.instantOwner = oSelect.value;

    const res = calculateCarInstantValue(
      carDeskState.instantModel,
      carDeskState.instantYear,
      carDeskState.instantKm,
      carDeskState.instantOwner
    );

    document.getElementById('desk-fair-val').innerText = `₹${res.fairVal.toFixed(2)} Lakhs`;
    document.getElementById('desk-loan-cap').innerText = `₹${res.loanCap.toFixed(2)} Lakhs`;
  }

  mSelect?.addEventListener('change', updateInstantFinderFromSelects);
  ySelect?.addEventListener('change', updateInstantFinderFromSelects);
  kSelect?.addEventListener('change', updateInstantFinderFromSelects);
  oSelect?.addEventListener('change', updateInstantFinderFromSelects);

  // 2. Search Input
  let searchTimer;
  document.getElementById('desk-search-input')?.addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      carDeskState.search = e.target.value;
      renderApprovedCarsScreen(container);
      const input = document.getElementById('desk-search-input');
      if (input) {
        input.focus();
        const val = input.value;
        input.value = '';
        input.value = val;
      }
    }, 150);
  });

  // 3. Body Filter Chips
  document.querySelectorAll('[data-desk-body]').forEach(btn => {
    btn.addEventListener('click', () => {
      carDeskState.bodyFilter = btn.getAttribute('data-desk-body');
      renderApprovedCarsScreen(container);
    });
  });

  // 4. Mfg Year Filter
  document.getElementById('desk-table-year-filter')?.addEventListener('change', (e) => {
    carDeskState.mfgYear = e.target.value;
    renderApprovedCarsScreen(container);
  });

  // 5. Owner Seq Chips
  document.querySelectorAll('[data-desk-owner-seq]').forEach(btn => {
    btn.addEventListener('click', () => {
      carDeskState.ownerSeq = btn.getAttribute('data-desk-owner-seq');
      carDeskState.instantOwner = carDeskState.ownerSeq;
      renderApprovedCarsScreen(container);
    });
  });

  // 6. OEM Filter Chips
  document.querySelectorAll('[data-desk-oem]').forEach(btn => {
    btn.addEventListener('click', () => {
      carDeskState.oemFilter = btn.getAttribute('data-desk-oem');
      renderApprovedCarsScreen(container);
    });
  });

  // 7. Click Cell -> Sync to top Instant Value Finder
  document.querySelectorAll('.car-val-cell:not(.empty)').forEach(cell => {
    cell.addEventListener('click', () => {
      const model = cell.getAttribute('data-click-car');
      const year = Number(cell.getAttribute('data-click-year'));
      carDeskState.instantModel = model;
      carDeskState.instantYear = year;
      renderApprovedCarsScreen(container);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

// ================= MODULE 0.6: CV VALUATION GRID & FUNDING MATRIX =================
const cvDeskState = {
  search: '',
  categoryFilter: 'ALL',
  mfgFilter: 'ALL',
  activeTab: 'grid'
};

function setCvTab(tab) {
  cvDeskState.activeTab = tab;
  renderView();
}

const CV_CATEGORIES = [
  { key: 'ALL', label: 'All Categories' },
  { key: 'Bus', label: 'Bus (School / Staff / Coach)' },
  { key: 'HCV', label: 'HCV (Heavy Commercial)' },
  { key: 'LCV', label: 'LCV / ICV' },
  { key: 'MCV', label: 'MCV (Medium Commercial)' },
  { key: 'Pick Up', label: 'Pick Up (Bolero / Dost / Intra)' },
  { key: 'SCV', label: 'SCV (Ace / Jeeto / Supro / Carry)' },
  { key: 'Tipper', label: 'Tipper' },
  { key: 'Tractor', label: 'Tractor & Trailer' }
];

function formatCvVal(raw) {
  if (raw === null || raw === undefined) return '—';
  let s = String(raw).replace(/₹/g, '').replace(/L/g, '').trim();
  if (!s || s === '-' || s === '—' || s === 'null') return '—';
  const num = parseFloat(s);
  return isNaN(num) ? s : num.toFixed(2);
}

function renderCvGridScreen(container) {
  const schema = state.datasets['cv_grid'];
  const allRows = schema?.rows || [];

  // Extract unique manufacturers
  const mfgSet = new Set();
  allRows.forEach(r => {
    if (r.manufacturer) mfgSet.add(r.manufacturer.trim());
  });
  const allMfgs = ['All Manufacturers', ...Array.from(mfgSet).sort()];

  // Filter rows
  const q = cvDeskState.search.toLowerCase().trim();
  const filteredRows = allRows.filter(row => {
    // Category match
    if (cvDeskState.categoryFilter !== 'ALL') {
      const rowCat = (row.category || '').toLowerCase();
      const targetCat = cvDeskState.categoryFilter.toLowerCase();
      if (!rowCat.includes(targetCat)) return false;
    }
    // Mfg match
    if (cvDeskState.mfgFilter !== 'ALL' && cvDeskState.mfgFilter !== 'All Manufacturers') {
      if ((row.manufacturer || '').trim() !== cvDeskState.mfgFilter) return false;
    }
    // Search match
    if (q) {
      const searchStr = `${row.model} ${row.manufacturer} ${row.category} ${row.body}`.toLowerCase();
      if (!searchStr.includes(q)) return false;
    }
    return true;
  });

  const yearKeys = ['y2024', 'y2023', 'y2022', 'y2021', 'y2020', 'y2019', 'y2018', 'y2017', 'y2016', 'y2015', 'y2014', 'y2013', 'y2012', 'y2011'];

  container.innerHTML = `
    <div class="cv-desk-container">

      <!-- 1. TOP HEADER BANNER CARD -->
      <div class="cv-hero-card">
        <div class="cv-top-badge-row">
          <span class="cv-policy-pill">📜 Official Commercial Vehicle Policy Attachment</span>
          <div class="cv-tag-pill-group">
            <span class="cv-tag-pill gold">${allRows.length} CV Models Listed</span>
            <span class="cv-tag-pill gray">14 Years (2011–2024)</span>
          </div>
        </div>

        <div>
          <h1 class="cv-hero-title">Commercial Vehicle (CV) Valuation Grid & Funding Matrix</h1>
          <p class="cv-hero-desc">
            Benchmark valuation grid (2011–2024) across Bus, HCV, LCV, MCV, Pick Up, SCV, Tipper, Tractor & Trailer with uncovered vehicle depreciation norms.
          </p>
        </div>

        <div class="cv-subnav-row">
          <button class="cv-subnav-btn ${cvDeskState.activeTab === 'grid' ? 'active' : ''}" onclick="setCvTab('grid')">▦ Official CV Attachment Grid</button>
          <button class="cv-subnav-btn ${cvDeskState.activeTab === 'calculator' ? 'active' : ''}" onclick="setCvTab('calculator')">📄 CV Funding & LTV Calculator</button>
          <button class="cv-subnav-btn" id="btn-uncovered-norms">📈 Uncovered Models Depreciation Norms</button>
          <button class="cv-subnav-btn" onclick="jumpToTab('cv_policy')">🛡️ Policy Underwriting Rules</button>
        </div>
      </div>

      ${cvDeskState.activeTab === 'grid' ? `
      <!-- 2. FILTER & SEARCH TOOLBAR -->
      <div class="cv-filter-card">
        <!-- Row 1: Category Chips -->
        <div class="cv-category-chips-row">
          <span class="cv-cat-label">🏷️ Category:</span>
          ${CV_CATEGORIES.map(c => `
            <button class="cv-cat-chip ${cvDeskState.categoryFilter === c.key ? 'active' : ''}" data-cv-cat="${c.key}">${c.label}</button>
          `).join('')}
        </div>

        <!-- Row 2: Search Input & Manufacturer Select -->
        <div class="cv-search-mfg-row">
          <div class="cv-search-input-box">
            <svg class="cv-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input type="text" class="cv-search-input" id="cv-search-input" placeholder="Search model, body, or manufacturer (or click mic to speak)…" value="${cvDeskState.search}" />
            <button class="cv-search-mic" title="Voice Search">🎙️</button>
          </div>

          <div class="cv-mfg-group">
            <span class="cv-mfg-label">Manufacturer:</span>
            <select class="cv-mfg-select" id="cv-mfg-select">
              ${allMfgs.map(m => `
                <option value="${m}" ${cvDeskState.mfgFilter === m ? 'selected' : ''}>${m}</option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- Row 3: Legend & Status -->
        <div class="cv-legend-row">
          <div>
            Showing <strong>${filteredRows.length}</strong> of <strong>${allRows.length}</strong> CV models
          </div>
          <div>
            🟨 Values in ₹ Lakhs (e.g. 10.22 = ₹10,22,000) • Dash (—) = Model year not manufactured or discontinued
          </div>
        </div>
      </div>

      <!-- 3. DATA GRID TABLE CARD -->
      <div class="cv-matrix-card">
        <div class="cv-matrix-banner">
          <div class="cv-matrix-banner-title">
            <span>🚚</span> COMMERCIAL VEHICLE ATTACHMENT VALUATION MATRIX (IN ₹ LAKHS)
          </div>
          <span class="cv-matrix-banner-badge">Official Kredit Venture Attachment</span>
        </div>

        <div class="cv-matrix-scroll">
          <table class="cv-table">
            <thead>
              <tr>
                <th style="width: 50px;">Cat</th>
                <th style="width: 70px;">Mfg</th>
                <th style="min-width: 240px;">Model / Variant</th>
                <th class="highlight-year" style="min-width: 65px;">2024</th>
                <th style="text-align: right; min-width: 65px;">2023</th>
                <th style="text-align: right; min-width: 65px;">2022</th>
                <th style="text-align: right; min-width: 65px;">2021</th>
                <th style="text-align: right; min-width: 65px;">2020</th>
                <th style="text-align: right; min-width: 65px;">2019</th>
                <th style="text-align: right; min-width: 65px;">2018</th>
                <th style="text-align: right; min-width: 65px;">2017</th>
                <th style="text-align: right; min-width: 65px;">2016</th>
                <th style="text-align: right; min-width: 65px;">2015</th>
                <th style="text-align: right; min-width: 65px;">2014</th>
                <th style="text-align: right; min-width: 65px;">2013</th>
                <th style="text-align: right; min-width: 65px;">2012</th>
                <th style="text-align: right; min-width: 65px;">2011</th>
                <th style="text-align: center; min-width: 140px;">Action / Quote</th>
              </tr>
            </thead>
            <tbody>
              ${filteredRows.length === 0 ? `
                <tr>
                  <td colspan="18" style="text-align: center; padding: 30px; color: var(--text-muted);">
                    No matching commercial vehicle models found.
                  </td>
                </tr>
              ` : filteredRows.map((row, idx) => {
    const val2024 = formatCvVal(row.y2024);
    return `
                  <tr>
                    <td class="cv-cat-cell">${row.category || 'CV'}</td>
                    <td class="cv-mfg-cell">${row.manufacturer || '-'}</td>
                    <td class="cv-model-cell">
                      ${row.model || '-'}
                      ${row.body ? `<div style="font-size: 10.5px; color: var(--text-muted); font-weight: 500;">${row.body}</div>` : ''}
                    </td>
                    <td class="cv-val-num ${val2024 !== '—' ? 'col-2024' : 'dash'}">${val2024}</td>
                    ${yearKeys.slice(1).map(k => {
      const v = formatCvVal(row[k]);
      return `<td class="cv-val-num ${v === '—' ? 'dash' : ''}">${v}</td>`;
    }).join('')}
                    <td>
                      <div class="cv-actions-cell">
                        <button class="btn-cv-quote" data-quote-idx="${idx}">⚡ Quote</button>
                        <button class="btn-cv-fund" data-fund-idx="${idx}">📋 Fund</button>
                      </div>
                    </td>
                  </tr>
                `;
  }).join('')}
            </tbody>
          </table>
        </div>
      </div>
      ` : ''}

      ${cvDeskState.activeTab === 'calculator' ? renderCvCalculatorBlock(allRows) : ''}

    </div>
  `;

  // Attach Event Listeners
  // 1. Search Input
  let searchTimer;
  document.getElementById('cv-search-input')?.addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      cvDeskState.search = e.target.value;
      renderCvGridScreen(container);
      const input = document.getElementById('cv-search-input');
      if (input) {
        input.focus();
        const val = input.value;
        input.value = '';
        input.value = val;
      }
    }, 150);
  });

  // 2. Category Chips
  document.querySelectorAll('[data-cv-cat]').forEach(btn => {
    btn.addEventListener('click', () => {
      cvDeskState.categoryFilter = btn.getAttribute('data-cv-cat');
      renderCvGridScreen(container);
    });
  });

  // 3. Manufacturer Select
  document.getElementById('cv-mfg-select')?.addEventListener('change', (e) => {
    cvDeskState.mfgFilter = e.target.value;
    renderCvGridScreen(container);
  });

  if (cvDeskState.activeTab === 'calculator') {
    initCvCalculator(allRows);
  }

  // 4. Quote Action Button -> WhatsApp Quotation
  document.querySelectorAll('[data-quote-idx]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = btn.getAttribute('data-quote-idx');
      const row = filteredRows[idx];
      if (!row) return;

      const text = `🚚 *COMMERCIAL VEHICLE VALUATION QUOTE*\n━━━━━━━━━━━━━━━━━━━━\n` +
        `🔹 *Model:* ${row.model}\n` +
        `🔹 *Category:* ${row.category} (${row.manufacturer})\n` +
        `🔹 *Body Type:* ${row.body || 'Standard'}\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `💰 *2024 Valuation:* ₹ ${formatCvVal(row.y2024)} Lakhs\n` +
        `💰 *2023 Valuation:* ₹ ${formatCvVal(row.y2023)} Lakhs\n` +
        `💰 *2022 Valuation:* ₹ ${formatCvVal(row.y2022)} Lakhs\n` +
        `💰 *2021 Valuation:* ₹ ${formatCvVal(row.y2021)} Lakhs\n` +
        `💰 *2020 Valuation:* ₹ ${formatCvVal(row.y2020)} Lakhs\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `Generated via KV FLASH`;
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    });
  });

  // 5. Fund Action Button -> Detail Sheet with Policy Underwriting Limits
  document.querySelectorAll('[data-fund-idx]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = btn.getAttribute('data-fund-idx');
      const row = filteredRows[idx];
      if (!row) return;
      openDetailSheet(schema, row);
    });
  });

  // 6. Uncovered Models Norms Modal Trigger
  document.getElementById('btn-uncovered-norms')?.addEventListener('click', () => {
    alert(
      "📈 UNCOVERED VEHICLE DEPRECIATION BENCHMARKS:\n━━━━━━━━━━━━━━━━━━━━\n" +
      "For commercial vehicle models not listed in the standard attachment grid:\n" +
      "• 1 Yr Old (2024): 80% of original invoice\n" +
      "• 2 Yr Old (2023): 70%\n" +
      "• 3 Yr Old (2022): 60%\n" +
      "• 4 Yr Old (2021): 50%\n" +
      "• 5 Yr Old (2020): 42%\n" +
      "• 6 Yr Old (2019): 35%\n" +
      "• 7 Yr Old (2018): 30%\n" +
      "• 8 Yr Old (2017): 25%\n" +
      "• 9 Yr Old (2016): 20%\n" +
      "• 10 Yr Old (2015): 16%\n" +
      "• 11 Yr Old (2014): 13%\n" +
      "• 12 Yr Old (2013): 10%\n" +
      "• 13 Yr Old (2012): 8%\n" +
      "• 14 Yr Old (2011): 6%\n\n" +
      "Note: Unlisted assets default to Level 3 classification with 10% LTV reduction."
    );
  });
}

function renderCvCalculatorBlock(allRows) {
  return `
    <div style="display: flex; gap: 20px; margin-top: 20px; align-items: flex-start; padding: 0 20px;">
      <!-- LEFT FORM -->
      <div style="flex: 1.5; background: var(--bg); padding: 25px; border-radius: 12px; border: 1px solid var(--border);">
        <div style="display:flex; align-items:center; gap:10px; margin-bottom: 25px;">
          <span style="background: rgba(81, 143, 255, 0.1); padding: 8px; border-radius: 6px;">🚚</span>
          <div>
            <h3 style="margin:0; font-size: 16px; font-weight: 600;">Commercial Vehicle Repurchase & Refinance Assessment</h3>
            <p style="margin:4px 0 0 0; font-size:12px; color: var(--text-secondary);">Calculates maximum permissible loan against the CV attachment grid and client profile norms.</p>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: 1fr; gap: 20px;">
          <div>
            <label style="display:block; font-size:12px; color: var(--text-secondary); margin-bottom:6px;">Select Commercial Vehicle Model:</label>
            <select id="calc-cv-model" style="width:100%; padding:10px; background: var(--bg); border: 1px solid var(--border); border-radius:6px; color: var(--text-primary);">
              <option value="">Select a model...</option>
              ${allRows.map((r, i) => `<option value="${i}">[${r.category}] ${r.manufacturer} - ${r.model} (${r.body || 'Goods'})</option>`).join('')}
            </select>
          </div>
          
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
              <label style="display:block; font-size:12px; color: var(--text-secondary); margin-bottom:6px;">Manufacturing Year:</label>
              <select id="calc-cv-year" style="width:100%; padding:10px; background: var(--bg); border: 1px solid var(--border); border-radius:6px; color: var(--text-primary);" disabled>
                <option value="">Select model first...</option>
              </select>
            </div>
            <div>
              <label style="display:block; font-size:12px; color: var(--text-secondary); margin-bottom:6px;">Proposed Tenure (Months):</label>
              <select id="calc-cv-tenure" style="width:100%; padding:10px; background: var(--bg); border: 1px solid var(--border); border-radius:6px; color: var(--text-primary);">
                <option value="12">12 Months (1 Year)</option>
                <option value="24">24 Months (2 Years)</option>
                <option value="36">36 Months (3 Years)</option>
                <option value="48" selected>48 Months (4 Years)</option>
                <option value="60">60 Months (5 Years)</option>
              </select>
            </div>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
              <label style="display:block; font-size:12px; color: var(--text-secondary); margin-bottom:6px;">Customer Category:</label>
              <select id="calc-cv-profile" style="width:100%; padding:10px; background: var(--bg); border: 1px solid var(--border); border-radius:6px; color: var(--text-primary);">
                <option value="85">First Time Buyer (With TR-DL) — Max LTV: 85%</option>
                <option value="60">Suvidha Profile — Max LTV: 60%</option>
                <option value="80">First Time User (Without DL) — Max LTV: 80%</option>
                <option value="90">Small Fleet Operator — Max LTV: 90%</option>
                <option value="95">Large Fleet Operator — Max LTV: 95%</option>
              </select>
            </div>
            <div>
              <label style="display:block; font-size:12px; color: var(--text-secondary); margin-bottom:6px;">Residential Property Status:</label>
              <select id="calc-cv-property" style="width:100%; padding:10px; background: var(--bg); border: 1px solid var(--border); border-radius:6px; color: var(--text-primary);">
                <option value="0">Owned House (Standard LTV)</option>
                <option value="-5">Rented (-5% LTV Deduction)</option>
              </select>
            </div>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
              <div style="display:flex; justify-content:space-between;">
                <label style="display:block; font-size:12px; color: var(--text-secondary); margin-bottom:6px;">Physical Valuation (₹) (Optional):</label>
                <span style="font-size:10px; color: var(--text-muted);">By Empanelled Valuer</span>
              </div>
              <input type="number" id="calc-cv-physical" placeholder="e.g. 570000" style="width:100%; padding:10px; background: var(--bg); border: 1px solid var(--border); border-radius:6px; color: var(--text-primary);" />
              <p style="font-size:10px; color: var(--text-muted); margin:4px 0 0 0;">Policy mandate: Benchmark is strictly <strong>lower</strong> of Grid & Physical Valuation.</p>
            </div>
            <div>
              <label style="display:block; font-size:12px; color: var(--text-secondary); margin-bottom:6px;">Annual Interest Rate (% p.a.):</label>
              <input type="number" id="calc-cv-rate" value="18" style="width:100%; padding:10px; background: var(--bg); border: 1px solid var(--border); border-radius:6px; color: var(--text-primary);" />
              <p style="font-size:10px; color: var(--text-muted); margin:4px 0 0 0;">CV policy standard IRR range: 17.5% – 19.5% for repurchase & used assets.</p>
            </div>
          </div>

          <div style="background:rgba(81,143,255,0.05); border:1px solid rgba(81,143,255,0.2); border-radius:6px; padding:10px; display:flex; align-items:center; gap:8px;">
            <span>✔️</span>
            <span style="font-size:12px; color: var(--sapphire, #3B82F6);" id="calc-cv-eot">Vehicle EOT valid: Age at loan completion will be -- yrs (Cap: < 12 yrs).</span>
          </div>

        </div>
      </div>

      <!-- RIGHT SUMMARY -->
      <div style="flex: 1; background: var(--surface); color: var(--text-primary); padding: 25px; border-radius: 12px; border: 1px solid var(--border);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 25px;">
          <h3 style="margin:0; font-size: 13px; font-weight: 700; color: var(--text-muted); letter-spacing:0.5px;">UNDERWRITING SANCTION SUMMARY</h3>
          <span id="calc-cv-final-ltv-badge" style="background:#EEF2FF; color: var(--sapphire, #3B82F6); font-size:10px; font-weight:700; padding:4px 8px; border-radius:4px;">--% LTV</span>
        </div>

        <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
          <span style="color: var(--text-muted); font-size:13px;">Official Grid Valuation:</span>
          <strong id="calc-cv-out-grid">₹ 0</strong>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:20px; padding-bottom:20px; border-bottom:1px solid #E2E8F0;">
          <span style="color: var(--sapphire, #3B82F6); font-size:13px; font-weight:600;">Benchmark Valuation:</span>
          <strong id="calc-cv-out-bench" style="color: var(--sapphire, #3B82F6);">₹ 0</strong>
        </div>

        <div style="background: var(--card-elevated-bg); padding:20px; border-radius:8px; color: var(--text-primary); margin-bottom:20px;">
          <div style="font-size:11px; letter-spacing:0.5px; margin-bottom:8px;">MAXIMUM PERMISSIBLE LOAN:</div>
          <div id="calc-cv-out-loan" style="font-size:28px; font-weight:800;">₹ 0</div>
          <div id="calc-cv-out-loan-sub" style="font-size:11px; margin-top:4px; opacity:0.8;">At --% LTV of ₹ 0</div>
        </div>

        <div style="display:flex; justify-content:space-between; margin-bottom:25px;">
          <div>
            <div style="font-size:11px; color: var(--text-muted);">Down Payment Required</div>
            <div id="calc-cv-out-dp" style="font-size:14px; font-weight:600; margin-top:4px;">₹ 0</div>
          </div>
          <div>
            <div style="font-size:11px; color: var(--text-muted);">Est. Monthly EMI</div>
            <div id="calc-cv-out-emi" style="font-size:14px; font-weight:600; margin-top:4px;">₹ 0</div>
          </div>
        </div>

        <button id="calc-cv-btn-emi" style="width:100%; padding:14px; background: var(--card-elevated-bg); color: var(--text-primary); border:none; border-radius:8px; font-weight:600; cursor:pointer; display:flex; justify-content:center; gap:8px;">
          <span>📄</span> Open in EMI Calculator & Amortization
        </button>
      </div>
    </div>
  `;
}

function initCvCalculator(allRows) {
  const modelSel = document.getElementById('calc-cv-model');
  const yearSel = document.getElementById('calc-cv-year');
  const tenureSel = document.getElementById('calc-cv-tenure');
  const profileSel = document.getElementById('calc-cv-profile');
  const propertySel = document.getElementById('calc-cv-property');
  const physicalInp = document.getElementById('calc-cv-physical');
  const rateInp = document.getElementById('calc-cv-rate');

  const outGrid = document.getElementById('calc-cv-out-grid');
  const outBench = document.getElementById('calc-cv-out-bench');
  const outLoan = document.getElementById('calc-cv-out-loan');
  const outLoanSub = document.getElementById('calc-cv-out-loan-sub');
  const outDp = document.getElementById('calc-cv-out-dp');
  const outEmi = document.getElementById('calc-cv-out-emi');
  const outLtvBadge = document.getElementById('calc-cv-final-ltv-badge');
  const outEot = document.getElementById('calc-cv-eot');

  const years = ['y2024', 'y2023', 'y2022', 'y2021', 'y2020', 'y2019', 'y2018', 'y2017', 'y2016', 'y2015', 'y2014', 'y2013', 'y2012', 'y2011'];

  const parseVal = (str) => {
    if (!str || str === '—') return 0;
    const clean = String(str).replace(/[₹,\sL]/g, '');
    const num = parseFloat(clean);
    if (String(str).includes('L')) return num * 100000;
    return num;
  };

  const fmt = (num) => '₹ ' + Math.round(num).toLocaleString('en-IN');

  const updateCalc = () => {
    const rowIdx = modelSel.value;
    if (!rowIdx) return;
    const row = allRows[rowIdx];

    const yearKey = yearSel.value;
    let gridVal = 0;
    if (yearKey) gridVal = parseVal(row[yearKey]);

    const physicalVal = parseFloat(physicalInp.value) || 0;
    const benchVal = (physicalVal > 0 && physicalVal < gridVal) ? physicalVal : gridVal;

    let baseLtv = parseFloat(profileSel.value) || 0;
    let propDed = parseFloat(propertySel.value) || 0;
    let finalLtv = baseLtv + propDed;

    const loanAmt = (benchVal * finalLtv) / 100;
    const dp = Math.max(0, benchVal - loanAmt);

    const tenure = parseInt(tenureSel.value) || 48;
    const rate = parseFloat(rateInp.value) || 18;

    let emi = 0;
    if (loanAmt > 0) {
      const r = (rate / 12) / 100;
      const factor = Math.pow(1 + r, tenure);
      emi = r > 0 ? (loanAmt * r * factor) / (factor - 1) : loanAmt / tenure;
    }

    let ageAtStart = 0;
    if (yearKey) {
      const y = parseInt(yearKey.replace('y', ''));
      ageAtStart = 2024 - y;
    }
    const eot = ageAtStart + (tenure / 12);
    outEot.innerText = `Vehicle EOT valid: Age at loan completion will be ${eot.toFixed(1)} yrs (Cap: < 12 yrs).`;
    outEot.style.color = eot > 12 ? '#EF4444' : '#518FFF';

    outGrid.innerText = fmt(gridVal);
    outBench.innerText = fmt(benchVal);
    outLoan.innerText = fmt(loanAmt);
    outLoanSub.innerText = `At ${finalLtv}% LTV of ${fmt(benchVal)}`;
    outDp.innerText = fmt(dp);
    outEmi.innerText = fmt(emi);
    outLtvBadge.innerText = `${finalLtv}% LTV`;
  };

  modelSel.addEventListener('change', () => {
    const rowIdx = modelSel.value;
    if (rowIdx === "") {
      yearSel.innerHTML = '<option value="">Select model first...</option>';
      yearSel.disabled = true;
      return;
    }
    const row = allRows[rowIdx];
    let opts = '';
    years.forEach(y => {
      const v = parseVal(row[y]);
      if (v > 0) {
        opts += `<option value="${y}">${y.replace('y', '')} — ${row[y]}</option>`;
      }
    });
    yearSel.innerHTML = opts;
    yearSel.disabled = false;
    updateCalc();
  });

  [yearSel, tenureSel, profileSel, propertySel, physicalInp, rateInp].forEach(el => {
    el.addEventListener('input', updateCalc);
  });

  document.getElementById('calc-cv-btn-emi').addEventListener('click', () => {
    const rowIdx = modelSel.value;
    if (!rowIdx) {
      alert("Please select a Commercial Vehicle Model first.");
      return;
    }
    const v = parseVal(outLoan.innerText);
    state.emiAmount = v;
    state.emiRate = parseFloat(rateInp.value) || 18;
    state.emiTenure = parseInt(tenureSel.value) || 48;
    jumpToTab('emi_calculator');
  });
}

// ================= MODULE 1: DYNAMIC DATASET RENDERER =================
function renderChargesCalculatorBlock() {
  return `
    <div style="background: var(--bg); padding: 25px; border-radius: 12px; border: 1px solid var(--border); margin-top: 15px; margin-bottom: 25px;">
      <div style="display:flex; align-items:center; gap:10px; margin-bottom: 25px;">
        <span style="background: rgba(212, 175, 55, 0.1); padding: 8px; border-radius: 6px;">🧮</span>
        <h3 style="margin:0; font-size: 16px; font-weight: 600; color: var(--text-primary);">Upfront Loan Deduction Calculator</h3>
      </div>

      <div style="display: flex; gap: 40px; flex-wrap: wrap;">
        <!-- LEFT SIDE: SLIDER -->
        <div style="flex: 1; min-width: 300px;">
          <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
            <label style="font-size:11px; color: var(--text-secondary); letter-spacing:0.5px;">SANCTIONED LOAN AMOUNT (₹)</label>
            <strong style="color: var(--gold-primary);" id="calc-charges-amt-label">₹ 1,25,000</strong>
          </div>
          <input type="range" id="calc-charges-amt-slider" min="100000" max="5000000" step="25000" value="125000" style="width:100%; accent-color: var(--gold-primary);" />
          <div style="display:flex; gap:10px; margin-top:20px;">
            <button class="dash-chip" data-charges-val="300000">₹3L</button>
            <button class="dash-chip" data-charges-val="500000">₹5L</button>
            <button class="dash-chip" data-charges-val="800000">₹8L</button>
            <button class="dash-chip" data-charges-val="1200000">₹12L</button>
            <button class="dash-chip" data-charges-val="2000000">₹20L</button>
          </div>
        </div>
        
        <!-- RIGHT SIDE: VEHICLE SEGMENT -->
        <div style="flex: 1; min-width: 300px;">
          <label style="font-size:11px; color: var(--text-secondary); letter-spacing:0.5px; margin-bottom:12px; display:block;">VEHICLE SEGMENT</label>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
            <!-- Car & SCV -->
            <div class="segment-card active" data-segment="car_scv" style="border: 1px solid var(--gold-primary); background:rgba(212,175,55,0.05); padding:12px; border-radius:6px; cursor:pointer;">
              <div style="color: var(--text-primary); font-size:13px; font-weight:600;" class="segment-title">Car & SCV</div>
              <div style="color: var(--text-secondary); font-size:10px; margin-top:4px;" class="segment-desc">1.25% PF • ₹1,000 Val</div>
            </div>
            <!-- LCV / ICV -->
            <div class="segment-card" data-segment="lcv_icv" style="border: 1px solid var(--border); padding:12px; border-radius:6px; cursor:pointer;">
              <div style="color: var(--text-secondary); font-size:13px; font-weight:600;" class="segment-title">LCV / ICV</div>
              <div style="color: var(--text-muted); font-size:10px; margin-top:4px;" class="segment-desc">1.25% PF • ₹1,200 Val</div>
            </div>
            <!-- M&HCV / CE -->
            <div class="segment-card" data-segment="mhcv_ce" style="border: 1px solid var(--border); padding:12px; border-radius:6px; cursor:pointer;">
              <div style="color: var(--text-secondary); font-size:13px; font-weight:600;" class="segment-title">M&HCV / CE</div>
              <div style="color: var(--text-muted); font-size:10px; margin-top:4px;" class="segment-desc">1.25% PF • ₹1,500 Val</div>
            </div>
            <!-- Tractor -->
            <div class="segment-card" data-segment="tractor" style="border: 1px solid var(--border); padding:12px; border-radius:6px; cursor:pointer;">
              <div style="color: var(--text-secondary); font-size:13px; font-weight:600;" class="segment-title">Tractor</div>
              <div style="color: var(--text-muted); font-size:10px; margin-top:4px;" class="segment-desc">1.50% PF • ₹1,500 Val</div>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top:35px; border-top:1px solid #23283B; padding-top:25px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
          <span style="color: var(--text-secondary); font-size:13px;" id="calc-charges-pf-label">Processing Fee (1.25%)</span>
          <span style="color: var(--text-primary); font-size:13px; font-weight:600;" id="calc-charges-pf-val">₹1,563</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
          <span style="color: var(--text-secondary); font-size:13px;">GST on Processing Fee (18%)</span>
          <span style="color: var(--text-secondary); font-size:13px;" id="calc-charges-gst-val">₹281</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
          <span style="color: var(--text-secondary); font-size:13px;" id="calc-charges-doc-label">Documentation Charges (Upto ₹5L tier)</span>
          <span style="color: var(--text-primary); font-size:13px; font-weight:600;" id="calc-charges-doc-val">₹1,000</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
          <span style="color: var(--text-secondary); font-size:13px;">Valuation Charges</span>
          <span style="color: var(--text-primary); font-size:13px; font-weight:600;" id="calc-charges-val-val">₹1,000</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
          <span style="color: var(--text-secondary); font-size:13px;">Stamp Duty Charges (0.60% flat)</span>
          <span style="color: var(--text-primary); font-size:13px; font-weight:600;" id="calc-charges-stamp-val">₹750</span>
        </div>
        
        <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-top:25px; padding-top:20px; border-top:1px solid rgba(255,255,255,0.05);">
          <div>
            <div style="font-size:11px; color:#EF4444; letter-spacing:0.5px; margin-bottom:6px;" id="calc-charges-total-label">TOTAL UPFRONT DEDUCTIONS (3.68%)</div>
            <div style="color:#EF4444; font-size:20px; font-weight:700;" id="calc-charges-total-val">₹4,594</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:11px; color: var(--sapphire, #3B82F6); letter-spacing:0.5px; margin-bottom:6px;">NET DISBURSEMENT TO BORROWER / SELLER</div>
            <div style="color: var(--sapphire, #3B82F6); font-size:24px; font-weight:700;" id="calc-charges-net-val">₹1,20,406</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function initChargesCalculator() {
  const slider = document.getElementById('calc-charges-amt-slider');
  const amtLabel = document.getElementById('calc-charges-amt-label');
  const chips = document.querySelectorAll('[data-charges-val]');
  const segmentCards = document.querySelectorAll('.segment-card');

  const outPfLabel = document.getElementById('calc-charges-pf-label');
  const outPfVal = document.getElementById('calc-charges-pf-val');
  const outGstVal = document.getElementById('calc-charges-gst-val');
  const outDocLabel = document.getElementById('calc-charges-doc-label');
  const outDocVal = document.getElementById('calc-charges-doc-val');
  const outValVal = document.getElementById('calc-charges-val-val');
  const outStampVal = document.getElementById('calc-charges-stamp-val');

  const outTotalLabel = document.getElementById('calc-charges-total-label');
  const outTotalVal = document.getElementById('calc-charges-total-val');
  const outNetVal = document.getElementById('calc-charges-net-val');

  let activeSegment = 'car_scv';
  const fmt = (num) => '₹' + Math.round(num).toLocaleString('en-IN');

  const updateCalc = () => {
    const loanAmt = Number(slider.value);
    amtLabel.innerText = '₹ ' + loanAmt.toLocaleString('en-IN');

    let pfPct = 1.25;
    let valCharge = 1000;

    if (activeSegment === 'lcv_icv') valCharge = 1200;
    else if (activeSegment === 'mhcv_ce') valCharge = 1500;
    else if (activeSegment === 'tractor') { pfPct = 1.50; valCharge = 1500; }

    const pf = (loanAmt * pfPct) / 100;
    const gst = (pf * 18) / 100;
    const docCharge = loanAmt <= 500000 ? 1000 : 2000;
    const stamp = (loanAmt * 0.60) / 100;

    const total = pf + gst + docCharge + valCharge + stamp;
    const net = loanAmt - total;
    const totalPct = ((total / loanAmt) * 100).toFixed(2);

    outPfLabel.innerText = `Processing Fee (${pfPct.toFixed(2)}%)`;
    outPfVal.innerText = fmt(pf);
    outGstVal.innerText = fmt(gst);
    outDocLabel.innerText = `Documentation Charges (${loanAmt <= 500000 ? 'Upto ₹5L' : 'Above ₹5L'} tier)`;
    outDocVal.innerText = fmt(docCharge);
    outValVal.innerText = fmt(valCharge);
    outStampVal.innerText = fmt(stamp);

    outTotalLabel.innerText = `TOTAL UPFRONT DEDUCTIONS (${totalPct}%)`;
    outTotalVal.innerText = fmt(total);
    outNetVal.innerText = fmt(net);
  };

  slider.addEventListener('input', updateCalc);

  chips.forEach(btn => {
    btn.addEventListener('click', () => {
      slider.value = btn.getAttribute('data-charges-val');
      updateCalc();
    });
  });

  segmentCards.forEach(card => {
    card.addEventListener('click', () => {
      segmentCards.forEach(c => {
        c.classList.remove('active');
        c.style.border = '1px solid #23283B';
        c.style.background = 'transparent';
        c.querySelector('.segment-title').style.color = '#8A93A6';
        c.querySelector('.segment-desc').style.color = '#64748B';
      });
      card.classList.add('active');
      card.style.border = '1px solid var(--gold-light)';
      card.style.background = 'rgba(212,175,55,0.05)';
      card.querySelector('.segment-title').style.color = 'white';
      card.querySelector('.segment-desc').style.color = '#8A93A6';

      activeSegment = card.getAttribute('data-segment');
      updateCalc();
    });
  });

  // Initial
  updateCalc();
}

function renderGenericDataset(container, datasetId) {
  const schema = state.datasets[datasetId];
  if (!schema) {
    container.innerHTML = `<div class="hero-card"><p>Dataset "${datasetId}" is loading or not found.</p></div>`;
    return;
  }

  let html = `
    <div class="hero-card">
      <div>
        <div class="hero-title">${schema.title}</div>
        <div class="hero-subtitle">${schema.description || 'Dynamic lending parameters & reference grid'}</div>
      </div>
      <span class="card-badge">${schema.rows?.length || 0} Records</span>
    </div>
    
    ${datasetId === 'charges' ? renderChargesCalculatorBlock() : ''}

    <!-- Table Controls & Search Filter -->
    <div class="table-controls-row">
      <div class="filter-input-wrapper">
        <input type="text" id="table-filter-input" placeholder="Filter in ${schema.title}…" />
      </div>
      <div class="row-count-badge" id="table-row-count">${schema.rows?.length || 0} rows</div>
    </div>
  `;

  // Policy Sections (Expandable Accordion)
  if (schema.sections && schema.sections.length > 0) {
    html += `<div class="settings-group" style="margin-top: 10px;">
      <div class="section-label">📜 Official Policy Rules & Guidelines</div>`;
    schema.sections.forEach(sec => {
      html += `
        <details class="setting-row" style="display: block; cursor: pointer;">
          <summary style="font-weight: 700; color: var(--gold-primary);">${sec.title}</summary>
          <p class="subtext" style="margin-top: 6px;">${sec.summary}</p>
          <ul style="margin-top: 8px; padding-left: 18px; font-size: 12px; color: var(--text-primary);">
            ${sec.items.map(it => `<li>${it}</li>`).join('')}
          </ul>
        </details>
      `;
    });
    html += `</div>`;
  }

  // Dynamic Table
  html += `
    <div class="table-scroll-container">
      <table class="data-table" id="active-data-table">
        <thead>
          <tr>
            <th style="width: 40px; text-align: center;">★</th>
            ${schema.columns.map(col => `<th data-col="${col.key}">${col.label}</th>`).join('')}
          </tr>
        </thead>
        <tbody id="table-body">
          ${renderTableRows(schema, schema.rows)}
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = html;

  // Filter input event
  document.getElementById('table-filter-input')?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    const filtered = schema.rows.filter(row => Object.values(row).some(v => String(v).toLowerCase().includes(q)));
    document.getElementById('table-body').innerHTML = renderTableRows(schema, filtered);
    document.getElementById('table-row-count').innerText = `${filtered.length} rows`;
    attachRowClickEvents(schema, filtered);
  });

  attachRowClickEvents(schema, schema.rows);
  if (datasetId === 'charges') {
    initChargesCalculator();
  }
}

function renderTableRows(schema, rows) {
  if (rows.length === 0) {
    return `<tr><td colspan="${schema.columns.length + 1}" style="text-align: center; padding: 20px; color: var(--text-muted);">No matching records found</td></tr>`;
  }

  return rows.map((row, idx) => {
    const rowId = `${schema.datasetId}_row_${row.sNo || idx}`;
    const isFav = state.favorites.some(f => f.id === rowId);

    return `
      <tr data-index="${idx}">
        <td style="text-align: center;">
          <button class="star-btn ${isFav ? 'starred' : ''}" data-fav-id="${rowId}">★</button>
        </td>
        ${schema.columns.map(col => {
      const val = row[col.key] !== undefined ? row[col.key] : '-';
      if (col.type === 'badge') {
        return `<td><span class="status-pill status-default">${val}</span></td>`;
      } else if (col.type === 'status') {
        const cls = String(val).toLowerCase() === 'approved' || String(val).toLowerCase() === 'active' ? 'status-approved' : 'status-expired';
        return `<td><span class="status-pill ${cls}">${val}</span></td>`;
      } else if (col.type === 'currency') {
        return `<td><span class="currency-val">${val}</span></td>`;
      } else if (col.type === 'percentage') {
        return `<td><span class="pct-val">${val}</span></td>`;
      }
      return `<td>${val}</td>`;
    }).join('')}
      </tr>
    `;
  }).join('');
}

function attachRowClickEvents(schema, rows) {
  // Star button
  document.querySelectorAll('.star-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const favId = btn.getAttribute('data-fav-id');
      const tr = btn.closest('tr');
      const idx = tr.getAttribute('data-index');
      toggleFavorite(favId, schema, rows[idx]);
    });
  });

  // Tap row -> open detail bottom sheet
  document.querySelectorAll('#table-body tr').forEach(tr => {
    tr.addEventListener('click', () => {
      const idx = tr.getAttribute('data-index');
      if (idx !== null && rows[idx]) {
        openDetailSheet(schema, rows[idx]);
      }
    });
  });
}

// ================= MODULE 2: EMI CALCULATOR =================
function renderEmiCalculator(container) {
  const amount = state.emiAmount || 800000;
  const rate = state.emiRate || 17.75;
  const tenure = state.emiTenure || 48;
  const res = calculateEMI(amount, rate, tenure);

  // Upfront charges (assuming Car/SCV logic from Charges screen)
  const pf = (amount * 1.25) / 100;
  const gst = (pf * 18) / 100;
  const doc = amount <= 500000 ? 1000 : 2000;
  const stamp = (amount * 0.60) / 100;
  const val = 1000;
  const upfront = pf + gst + doc + stamp + val;
  const netDisbursal = amount - upfront;

  container.innerHTML = `
    <div class="hero-card" style="margin-bottom: 20px;">
      <div>
        <div class="hero-title">EMI & Loan Repayment Calculator</div>
        <div class="hero-subtitle">Calculate exact customer installment, total contracted interest, and upfront net disbursement.</div>
      </div>
    </div>

    <div style="display: flex; gap: 20px; flex-wrap: wrap;">
      
      <!-- LEFT PANEL -->
      <div style="flex: 1.5; min-width: 320px; background: var(--bg); padding: 25px; border-radius: 12px; border: 1px solid var(--border);">
        <label style="font-size: 11px; color: var(--text-secondary); letter-spacing: 0.5px; font-weight: 600;">COMMON VEHICLE PRESETS</label>
        <div style="display: flex; gap: 10px; margin-top: 12px; margin-bottom: 35px; flex-wrap: wrap;">
          <button class="dash-chip preset-btn" data-amt="800000" data-rate="17.75" style="flex: 1; text-align: center;">Bolero ₹8L</button>
          <button class="dash-chip preset-btn" data-amt="500000" data-rate="16.50" style="flex: 1; text-align: center;">Car ₹5L</button>
          <button class="dash-chip preset-btn" data-amt="400000" data-rate="21.00" style="flex: 1; text-align: center;">Tractor ₹4L</button>
          <button class="dash-chip preset-btn" data-amt="1800000" data-rate="14.50" style="flex: 1; text-align: center;">Tipper ₹18L</button>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <label style="font-size: 11px; color: var(--text-secondary); letter-spacing: 0.5px; font-weight: 600;">LOAN AMOUNT (₹)</label>
          <div style="display: flex; align-items: center; background: var(--surface); border: 1px solid var(--border); border-radius: 4px; padding: 6px 10px;">
            <span style="color: var(--text-secondary); margin-right: 5px; font-size: 13px;">₹</span>
            <input type="number" id="emi-input-amount" value="${amount}" style="background: transparent; border: none; color: var(--text-primary); width: 100px; text-align: right; outline: none; font-family: inherit; font-weight: 600; font-size: 13px;" />
          </div>
        </div>
        <input type="range" id="slider-amount" min="100000" max="5000000" step="25000" value="${amount}" style="width: 100%; accent-color: var(--sapphire, #3B82F6);" />
        <div style="display: flex; justify-content: space-between; font-size: 10px; color: var(--text-muted); margin-top: 8px; margin-bottom: 35px;">
          <span>₹1.00L</span>
          <span>₹10.00L</span>
          <span>₹20.00L</span>
          <span>₹35.00L</span>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <label style="font-size: 11px; color: var(--text-secondary); letter-spacing: 0.5px; font-weight: 600;">INTEREST RATE / IRR (%)</label>
          <div style="display: flex; align-items: center; background: var(--surface); border: 1px solid var(--border); border-radius: 4px; padding: 6px 10px;">
            <input type="number" id="emi-input-rate" value="${rate}" step="0.25" style="background: transparent; border: none; color: var(--text-primary); width: 60px; text-align: right; outline: none; font-family: inherit; font-weight: 600; font-size: 13px;" />
            <span style="color: var(--text-secondary); margin-left: 5px; font-size: 13px;">%</span>
          </div>
        </div>
        <input type="range" id="slider-rate" min="10" max="28" step="0.25" value="${rate}" style="width: 100%; accent-color: var(--sapphire, #3B82F6);" />
        <div style="display: flex; justify-content: space-between; font-size: 10px; color: var(--text-muted); margin-top: 8px; margin-bottom: 35px;">
          <span>14% (Subsidized)</span>
          <span>18% (Standard Used Car)</span>
          <span>21% (Tractor)</span>
          <span>24% (High Risk)</span>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <label style="font-size: 11px; color: var(--text-secondary); letter-spacing: 0.5px; font-weight: 600;">LOAN TENURE (MONTHS)</label>
          <div style="font-size: 13px; color: var(--sapphire, #3B82F6); font-weight: 600;">${tenure} Months (${(tenure / 12).toFixed(1)} Years)</div>
        </div>
        <div style="display: flex; gap: 10px; width: 100%;">
          ${[12, 24, 36, 48, 60].map(m => `
            <button class="tenure-btn" data-months="${m}" style="flex: 1; padding: 10px 0; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; border: 1px solid ${m === tenure ? '#518FFF' : '#23283B'}; background: ${m === tenure ? '#1E3A8A' : 'transparent'}; color: ${m === tenure ? 'white' : '#8A93A6'}; transition: 0.2s;">
              ${m}M
            </button>
          `).join('')}
        </div>
      </div>

      <!-- RIGHT PANEL -->
      <div style="flex: 1; min-width: 320px; background: linear-gradient(145deg, #1E3A8A, #0F172A); border-radius: 12px; padding: 30px; border: 1px solid #1D4ED8; display: flex; flex-direction: column;">
        
        <div style="font-size: 11px; color: #93C5FD; letter-spacing: 0.5px; margin-bottom: 8px; font-weight: 600;">MONTHLY EQUATED INSTALLMENT</div>
        <div style="font-size: 38px; font-weight: 700; color: #FBBF24; margin-bottom: 8px;">${formatINR(res.emi)}</div>
        <div style="font-size: 13px; color: #94A3B8; margin-bottom: 25px;">Payable monthly over ${tenure} installments at ${rate}% IRR.</div>

        <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 25px; margin-bottom: 25px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
            <span style="color: #94A3B8; font-size: 13px;">Principal Loan:</span>
            <span style="color: var(--text-primary); font-size: 13px; font-weight: 600;">${formatINR(amount)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
            <span style="color: #94A3B8; font-size: 13px;">Total Interest Payable:</span>
            <span style="color: #FBBF24; font-size: 13px; font-weight: 600;">${formatINR(res.interest)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <span style="color: #94A3B8; font-size: 13px;">Total Amount Repayable:</span>
            <span style="color: var(--text-primary); font-size: 13px; font-weight: 600;">${formatINR(res.total)}</span>
          </div>
        </div>

        <div style="border-top: 1px dashed rgba(255,255,255,0.2); padding-top: 25px; margin-bottom: 30px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
            <span style="color: #94A3B8; font-size: 13px;">Estimated Upfront Charges:</span>
            <span style="color: #FCA5A5; font-size: 13px; font-weight: 600;">-${formatINR(upfront)}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-primary); font-size: 14px; font-weight: 700;">Estimated Net Disbursal:</span>
            <span style="color: var(--sapphire, #3B82F6); font-size: 15px; font-weight: 700;">${formatINR(netDisbursal)}</span>
          </div>
        </div>

        <details style="margin-top: auto; margin-bottom: 15px; cursor: pointer; background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
          <summary style="font-size: 13px; color: var(--text-primary); font-weight: 600; text-align: center; list-style: none;">View Repayment Schedule (Amortization) ∨</summary>
          <div class="table-scroll-container" style="margin-top: 15px; max-height: 250px; background: rgba(0,0,0,0.4); border-radius: 6px; padding: 10px;">
            <table class="data-table" style="font-size: 11px; margin: 0; width: 100%;">
              <thead>
                <tr>
                  <th style="color: #94A3B8; text-align: left; padding: 6px;">Month</th>
                  <th style="color: #94A3B8; text-align: right; padding: 6px;">Principal</th>
                  <th style="color: #94A3B8; text-align: right; padding: 6px;">Interest</th>
                  <th style="color: #94A3B8; text-align: right; padding: 6px;">Balance</th>
                </tr>
              </thead>
              <tbody>
                ${res.schedule.map(m => `
                  <tr>
                    <td style="padding: 6px; border-bottom: 1px solid rgba(255,255,255,0.05);">M${m.month}</td>
                    <td style="color: var(--sapphire, #3B82F6); text-align: right; padding: 6px; border-bottom: 1px solid rgba(255,255,255,0.05);">${formatINR(m.princ)}</td>
                    <td style="color: #FBBF24; text-align: right; padding: 6px; border-bottom: 1px solid rgba(255,255,255,0.05);">${formatINR(m.int)}</td>
                    <td style="text-align: right; padding: 6px; border-bottom: 1px solid rgba(255,255,255,0.05);">${formatINR(m.bal)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </details>
        
        <button id="btn-share-emi" style="width: 100%; background: #3B82F6; color: #FFFFFF; border: none; padding: 12px; border-radius: 6px; font-weight: 600; font-size: 13px; cursor: pointer;">🚀 Share EMI Quote on WhatsApp</button>
      </div>

    </div>
  `;

  // Attach events
  const updateStateAndRender = () => {
    state.emiAmount = Number(document.getElementById('slider-amount').value);
    state.emiRate = Number(document.getElementById('slider-rate').value);
    renderView();
  };

  document.getElementById('slider-amount').addEventListener('input', updateStateAndRender);
  document.getElementById('slider-rate').addEventListener('input', updateStateAndRender);

  document.getElementById('emi-input-amount').addEventListener('change', (e) => {
    state.emiAmount = Number(e.target.value);
    document.getElementById('slider-amount').value = state.emiAmount;
    renderView();
  });

  document.getElementById('emi-input-rate').addEventListener('change', (e) => {
    state.emiRate = Number(e.target.value);
    document.getElementById('slider-rate').value = state.emiRate;
    renderView();
  });

  document.querySelectorAll('.tenure-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      state.emiTenure = Number(e.target.getAttribute('data-months'));
      renderView();
    });
  });

  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      state.emiAmount = Number(e.target.getAttribute('data-amt'));
      state.emiRate = Number(e.target.getAttribute('data-rate'));
      renderView();
    });
  });

  document.getElementById('btn-share-emi').addEventListener('click', () => {
    const text = `📊 *VEHICLE LOAN EMI QUOTATION*\n━━━━━━━━━━━━━━━━━━━━\n💰 *Loan Amount:* ${formatINR(state.emiAmount)}\n📈 *Interest Rate:* ${state.emiRate}% p.a.\n⏳ *Tenure:* ${state.emiTenure} Months\n━━━━━━━━━━━━━━━━━━━━\n⭐ *Monthly EMI:* ${formatINR(res.emi)}\n🔹 *Total Interest:* ${formatINR(res.interest)}\n🔹 *Total Payable:* ${formatINR(res.total)}\n━━━━━━━━━━━━━━━━━━━━\nGenerated via KV FLASH`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  });
}

// ================= MODULE 3: DSA PAYOUT SCREEN =================
const dsaCalcState = {
  amount: 750000,
  segment: 'car',
  wirr: 18.5,
  volume: '<20L'
};

function renderPayoutScreen(container) {
  let slab = 0;
  const isHighVol = dsaCalcState.volume === '>=20L';

  // Slab Logic
  if (dsaCalcState.segment === 'car') {
    if (dsaCalcState.wirr >= 22.0) slab = isHighVol ? 4.25 : 4.00;
    else if (dsaCalcState.wirr >= 21.0) slab = isHighVol ? 4.00 : 3.75;
    else if (dsaCalcState.wirr >= 20.0) slab = isHighVol ? 3.75 : 3.50;
    else if (dsaCalcState.wirr >= 19.0) slab = isHighVol ? 3.50 : 3.25;
    else if (dsaCalcState.wirr >= 18.0) slab = isHighVol ? 3.25 : 3.00;
    else if (dsaCalcState.wirr >= 17.0) slab = isHighVol ? 2.75 : 2.50;
    else if (dsaCalcState.wirr >= 16.0) slab = isHighVol ? 2.25 : 2.00;
    else slab = 0;
  } else if (dsaCalcState.segment === 'cv') {
    if (dsaCalcState.wirr >= 20.0) slab = isHighVol ? 3.00 : 3.00;
    else if (dsaCalcState.wirr >= 19.0) slab = isHighVol ? 2.50 : 2.50;
    else if (dsaCalcState.wirr >= 18.0) slab = isHighVol ? 2.25 : 2.00;
    else if (dsaCalcState.wirr >= 16.0) slab = isHighVol ? 2.00 : 1.50;
    else slab = 0;
  } else {
    slab = 1.25; // Flat for MHCV
  }

  const grossCommission = (dsaCalcState.amount * slab) / 100;
  const tds = (grossCommission * 5) / 100;
  const netPayable = grossCommission - tds;

  container.innerHTML = `
    <div style="background: var(--surface); border-radius: 12px; padding: 25px; border: 1px solid var(--border); box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 25px;">
      
      <h2 style="color: var(--text-primary); font-size: 18px; font-weight: 700; margin: 0 0 20px 0; display: flex; align-items: center; gap: 8px;">
        <span style="background: rgba(239, 68, 68, 0.15); color: #EF4444; border-radius: 6px; padding: 4px; display: inline-flex;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="16" y1="10" x2="16" y2="10"></line><line x1="12" y1="10" x2="12" y2="10"></line><line x1="8" y1="10" x2="8" y2="10"></line><line x1="16" y1="14" x2="16" y2="14"></line><line x1="12" y1="14" x2="12" y2="14"></line><line x1="8" y1="14" x2="8" y2="14"></line><line x1="16" y1="18" x2="16" y2="18"></line><line x1="12" y1="18" x2="12" y2="18"></line><line x1="8" y1="18" x2="8" y2="18"></line></svg></span>
        DSA Commission Calculator (Single Case)
      </h2>

      <!-- Inputs Row -->
      <div style="display: flex; gap: 15px; flex-wrap: wrap; margin-bottom: 25px;">
        <div style="flex: 1; min-width: 200px;">
          <label style="font-size: 10px; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px; display: block; text-transform: uppercase;">Disbursed Loan Amount (₹)</label>
          <input type="number" id="dsa-input-amt" value="${dsaCalcState.amount}" style="width: 100%; background: var(--bg); border: 1px solid var(--border); border-radius: 6px; padding: 12px; color: var(--text-primary); font-family: inherit; font-size: 13px; font-weight: 600; outline: none;" />
        </div>
        <div style="flex: 1; min-width: 200px;">
          <label style="font-size: 10px; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px; display: block; text-transform: uppercase;">Vehicle Segment</label>
          <select id="dsa-input-seg" style="width: 100%; background: var(--bg); border: 1px solid var(--border); border-radius: 6px; padding: 12px; color: var(--text-primary); font-family: inherit; font-size: 13px; font-weight: 600; outline: none;">
            <option value="car" ${dsaCalcState.segment === 'car' ? 'selected' : ''}>Used Car (2.00% - 4.25%)</option>
            <option value="cv" ${dsaCalcState.segment === 'cv' ? 'selected' : ''}>Used CV (1.50% - 3.00%)</option>
            <option value="mhcv" ${dsaCalcState.segment === 'mhcv' ? 'selected' : ''}>M&HCV (Flat 1.25%)</option>
          </select>
        </div>
        <div style="flex: 1; min-width: 120px;">
          <label style="font-size: 10px; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px; display: block; text-transform: uppercase;">File WIRR Rate (%)</label>
          <input type="number" id="dsa-input-wirr" step="0.1" value="${dsaCalcState.wirr}" style="width: 100%; background: var(--bg); border: 1px solid var(--border); border-radius: 6px; padding: 12px; color: var(--text-primary); font-family: inherit; font-size: 13px; font-weight: 600; outline: none;" ${dsaCalcState.segment === 'mhcv' ? 'disabled' : ''} />
        </div>
        <div style="flex: 1.5; min-width: 200px;">
          <label style="font-size: 10px; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px; display: block; text-transform: uppercase;">DSA Monthly Volume Sourced</label>
          <select id="dsa-input-vol" style="width: 100%; background: var(--bg); border: 1px solid var(--border); border-radius: 6px; padding: 12px; color: var(--text-primary); font-family: inherit; font-size: 13px; font-weight: 600; outline: none;">
            <option value="<20L" ${dsaCalcState.volume === '<20L' ? 'selected' : ''}>&lt; INR 20.00 Lacs Volume</option>
            <option value=">=20L" ${dsaCalcState.volume === '>=20L' ? 'selected' : ''}>&gt;= INR 20.00 Lacs Volume</option>
          </select>
        </div>
      </div>

      <!-- Results Cards -->
      <div style="display: flex; gap: 15px; flex-wrap: wrap;">
        <div style="flex: 1; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; padding: 18px;">
          <div style="font-size: 10px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 8px;">Applicable Payout Slab</div>
          <div style="font-size: 24px; font-weight: 700; color: #EF4444; margin-bottom: 6px;">${slab.toFixed(2)}%</div>
          <div style="font-size: 10px; color: var(--text-muted);">Based on WIRR ${dsaCalcState.segment === 'mhcv' ? 'N/A' : dsaCalcState.wirr + '%'} & ${dsaCalcState.volume.replace('L', 'L volume')}</div>
        </div>
        <div style="flex: 1.5; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; padding: 18px;">
          <div style="font-size: 10px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 8px;">Gross DSA Commission</div>
          <div style="font-size: 24px; font-weight: 700; color: var(--gold-primary); margin-bottom: 6px;">₹${grossCommission.toLocaleString('en-IN', {maximumFractionDigits:0})}</div>
          <div style="font-size: 10px; color: var(--text-muted);">Excludes 18% GST (invoiced extra)</div>
        </div>
        <div style="flex: 1.5; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; padding: 18px;">
          <div style="font-size: 10px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 8px;">Net Payable (After 5% TDS)</div>
          <div style="font-size: 24px; font-weight: 700; color: #3B82F6; margin-bottom: 6px;">₹${netPayable.toLocaleString('en-IN', {maximumFractionDigits:0})}</div>
          <div style="font-size: 10px; color: var(--text-muted);">TDS: ₹${tds.toLocaleString('en-IN', {maximumFractionDigits:0})} (Section 194H)</div>
        </div>
      </div>
    </div>

    <!-- Tables Row -->
    <div style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 25px;">
      
      <!-- Used Car Table -->
      <div style="flex: 1; min-width: 300px; background: white; border-radius: 8px; padding: 20px; border: 1px solid var(--border);">
        <h3 style="font-size: 12px; font-weight: 700; color: #1E293B; margin: 0 0 15px 0; text-transform: uppercase;">Used Car Payout Slabs</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
          <thead>
            <tr style="border-bottom: 1px solid #E2E8F0;">
              <th style="padding: 10px 0; color: var(--text-muted); font-weight: 600;">WIRR Range</th>
              <th style="padding: 10px 0; color: var(--text-muted); font-weight: 600; text-align: center;">&lt; 20 Lacs</th>
              <th style="padding: 10px 0; color: var(--text-muted); font-weight: 600; text-align: center;">&gt;= 20 Lacs</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #F1F5F9;">
              <td style="padding: 12px 0; color: #334155; font-family: monospace;">&gt;= 16.00 - &lt;= 16.99%</td>
              <td style="padding: 12px 0; color: #334155; font-weight: 600; text-align: center;">2.00%</td>
              <td style="padding: 12px 0; color: #2563EB; font-weight: 600; text-align: center;">2.25%</td>
            </tr>
            <tr style="border-bottom: 1px solid #F1F5F9;">
              <td style="padding: 12px 0; color: #334155; font-family: monospace;">&gt;= 17.00 - &lt;= 17.99%</td>
              <td style="padding: 12px 0; color: #334155; font-weight: 600; text-align: center;">2.50%</td>
              <td style="padding: 12px 0; color: #2563EB; font-weight: 600; text-align: center;">2.75%</td>
            </tr>
            <tr style="border-bottom: 1px solid #F1F5F9;">
              <td style="padding: 12px 0; color: #334155; font-family: monospace;">&gt;= 18.00 - &lt;= 18.99%</td>
              <td style="padding: 12px 0; color: #334155; font-weight: 600; text-align: center;">3.00%</td>
              <td style="padding: 12px 0; color: #2563EB; font-weight: 600; text-align: center;">3.25%</td>
            </tr>
            <tr style="border-bottom: 1px solid #F1F5F9;">
              <td style="padding: 12px 0; color: #334155; font-family: monospace;">&gt;= 19.00 - &lt;= 19.99%</td>
              <td style="padding: 12px 0; color: #334155; font-weight: 600; text-align: center;">3.25%</td>
              <td style="padding: 12px 0; color: #2563EB; font-weight: 600; text-align: center;">3.50%</td>
            </tr>
            <tr style="border-bottom: 1px solid #F1F5F9;">
              <td style="padding: 12px 0; color: #334155; font-family: monospace;">&gt;= 20.00 - &lt;= 20.99%</td>
              <td style="padding: 12px 0; color: #334155; font-weight: 600; text-align: center;">3.50%</td>
              <td style="padding: 12px 0; color: #2563EB; font-weight: 600; text-align: center;">3.75%</td>
            </tr>
            <tr style="border-bottom: 1px solid #F1F5F9;">
              <td style="padding: 12px 0; color: #334155; font-family: monospace;">&gt;= 21.00 - &lt;= 21.99%</td>
              <td style="padding: 12px 0; color: #334155; font-weight: 600; text-align: center;">3.75%</td>
              <td style="padding: 12px 0; color: #2563EB; font-weight: 600; text-align: center;">4.00%</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; color: #334155; font-family: monospace;">&gt;= 22.00%</td>
              <td style="padding: 12px 0; color: #334155; font-weight: 600; text-align: center;">4.00%</td>
              <td style="padding: 12px 0; color: #2563EB; font-weight: 600; text-align: center;">4.25%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Used CV Table -->
      <div style="flex: 1; min-width: 300px; background: white; border-radius: 8px; padding: 20px; border: 1px solid var(--border);">
        <h3 style="font-size: 12px; font-weight: 700; color: #1E293B; margin: 0 0 15px 0; text-transform: uppercase;">Used CV Payout Slabs</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
          <thead>
            <tr style="border-bottom: 1px solid #E2E8F0;">
              <th style="padding: 10px 0; color: var(--text-muted); font-weight: 600;">WIRR Range</th>
              <th style="padding: 10px 0; color: var(--text-muted); font-weight: 600; text-align: center;">&lt; 20 Lacs</th>
              <th style="padding: 10px 0; color: var(--text-muted); font-weight: 600; text-align: center;">&gt;= 20 Lacs</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #F1F5F9;">
              <td style="padding: 12px 0; color: #334155; font-family: monospace;">&gt;= 16.00 - &lt;= 17.99%</td>
              <td style="padding: 12px 0; color: #334155; font-weight: 600; text-align: center;">1.50%</td>
              <td style="padding: 12px 0; color: #2563EB; font-weight: 600; text-align: center;">2.00%</td>
            </tr>
            <tr style="border-bottom: 1px solid #F1F5F9;">
              <td style="padding: 12px 0; color: #334155; font-family: monospace;">&gt;= 18.00 - &lt;= 18.99%</td>
              <td style="padding: 12px 0; color: #334155; font-weight: 600; text-align: center;">2.00%</td>
              <td style="padding: 12px 0; color: #2563EB; font-weight: 600; text-align: center;">2.25%</td>
            </tr>
            <tr style="border-bottom: 1px solid #F1F5F9;">
              <td style="padding: 12px 0; color: #334155; font-family: monospace;">&gt;= 19.00 - &lt;= 19.99%</td>
              <td style="padding: 12px 0; color: #334155; font-weight: 600; text-align: center;">2.50%</td>
              <td style="padding: 12px 0; color: #2563EB; font-weight: 600; text-align: center;">2.50%</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; color: #334155; font-family: monospace;">&gt;= 20.00%</td>
              <td style="padding: 12px 0; color: #334155; font-weight: 600; text-align: center;">3.00%</td>
              <td style="padding: 12px 0; color: #2563EB; font-weight: 600; text-align: center;">3.00%</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>

    <!-- Guidelines Box -->
    <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid #F59E0B; border-radius: 8px; padding: 20px;">
      <h4 style="color: #D97706; font-size: 13px; font-weight: 700; margin: 0 0 12px 0; display: flex; align-items: center; gap: 8px;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        Mandatory DSA Operational & PDD Guidelines
      </h4>
      <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: var(--text-primary); line-height: 1.6; display: flex; flex-direction: column; gap: 6px;">
        <li><strong style="color: #D97706;">M&HCV / CE Payout:</strong> Sourced M&HCV and Construction Equipment earns flat <strong>1.25%</strong> payout on volume.</li>
        <li><strong style="color: #D97706;">PDD Updation Rule:</strong> RC transfer / PDD updation is mandatory within <strong>60 days</strong> of disbursal.</li>
        <li><strong style="color: #D97706;">Payout Block:</strong> If PDD/RC remains pending beyond <strong>90 days</strong>, all pending and fresh DSA payouts will be held until clearance.</li>
        <li><strong style="color: #D97706;">Exclusions:</strong> Processing fee and stamp duty deductions are excluded from IRR yield calculations.</li>
        <li><strong style="color: #D97706;">Tax Terms:</strong> All payouts exclude GST. Channel partner must provide valid GST invoice where applicable.</li>
      </ul>
    </div>
  `;

  // Attach event listeners to all inputs to trigger re-render
  ['dsa-input-amt', 'dsa-input-seg', 'dsa-input-wirr', 'dsa-input-vol'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', (e) => {
        const propMap = {
          'dsa-input-amt': 'amount',
          'dsa-input-seg': 'segment',
          'dsa-input-wirr': 'wirr',
          'dsa-input-vol': 'volume'
        };
        const val = e.target.value;
        dsaCalcState[propMap[id]] = (id === 'dsa-input-amt' || id === 'dsa-input-wirr') ? Number(val) : val;
        
        // Re-render via state update loop
        clearTimeout(window.dsaTimer);
        window.dsaTimer = setTimeout(() => {
          renderPayoutScreen(container);
          const reInput = document.getElementById(id);
          if (reInput && (id === 'dsa-input-amt' || id === 'dsa-input-wirr')) {
            reInput.focus();
            const v = reInput.value;
            reInput.value = '';
            reInput.value = v;
          }
        }, 50);
      });
    }
  });
}

// ================= MODULE 4: 2D IRR MATRIX =================
function renderIrrMatrix(container) {
  const schema = state.datasets['irr_matrix'];
  if (!schema) return;

  container.innerHTML = `
    <div class="hero-card">
      <div>
        <div class="hero-title">2D IRR & Interest Rate Matrix</div>
        <div class="hero-subtitle">Interactive interest rate tiers by CIBIL Score and Tenure</div>
      </div>
    </div>

    <div class="table-scroll-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>CIBIL Tier</th>
            <th>Loan Slab</th>
            <th style="text-align: center;">36M ROI</th>
            <th style="text-align: center;">48M ROI</th>
            <th style="text-align: center;">60M ROI</th>
            <th style="text-align: center;">84M ROI</th>
          </tr>
        </thead>
        <tbody>
          ${schema.rows.map((row, idx) => `
            <tr>
              <td><strong>${row.product}</strong></td>
              <td><span class="status-pill status-default">${row.cibilTier}</span></td>
              <td>${row.slab}</td>
              <td><div class="irr-cell" data-rate="${row.tenure36m}" data-tenure="36">${row.tenure36m}</div></td>
              <td><div class="irr-cell" data-rate="${row.tenure48m}" data-tenure="48">${row.tenure48m}</div></td>
              <td><div class="irr-cell selected-cell" data-rate="${row.tenure60m}" data-tenure="60">${row.tenure60m}</div></td>
              <td><div class="irr-cell" data-rate="${row.tenure84m}" data-tenure="84">${row.tenure84m}</div></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  document.querySelectorAll('.irr-cell').forEach(cell => {
    cell.addEventListener('click', () => {
      const rateStr = cell.getAttribute('data-rate');
      const tenure = Number(cell.getAttribute('data-tenure'));
      const numRate = parseFloat(rateStr.replace('%', ''));
      if (!isNaN(numRate)) {
        state.emiRate = numRate;
        state.emiTenure = tenure;
        state.activeTab = 'emi_calculator';
        renderView();
      }
    });
  });
}

const docGroups = [
  {
    title: "1. KYC & IDENTITY VERIFICATION",
    badge: "Mandatory For All",
    items: [
      { text: "PAN Card (Borrower & Co-borrower)", req: "Mandatory" },
      { text: "Aadhaar Card (with verified registered mobile number OTP/XML)", req: "Mandatory" },
      { text: "Recent Passport Size Photographs (2 each)", req: "Mandatory" },
      { text: "Voter ID / Driving License / Passport (Alternative Officially Valid Document)", req: "Optional" }
    ]
  },
  {
    title: "2. RESIDENCE & ADDRESS STABILITY PROOF",
    badge: "Ownership / Stability",
    items: [
      { text: "Electricity Bill (Latest 2 months) — relaxed to co-borrower/family in 2024 policy", req: "Mandatory" },
      { text: "Owned Property Tax Receipt / Municipal Valuation Certificate", req: "Optional" },
      { text: "Registered Rent Agreement + Landlord Utility Bill (if living in rented house)", req: "Optional" }
    ]
  },
  {
    title: "3. INCOME & BANKING VERIFICATION DOCUMENTS",
    badge: "Product Specific",
    items: [
      { text: "Salary Slips (Latest 3 consecutive months)", req: "Mandatory" },
      { text: "Form 16 / ITR V acknowledgement (Latest 2 Assessment Years)", req: "Mandatory" },
      { text: "6 Months Operative Bank Account Statement (Salary / Current Account)", req: "Mandatory" },
      { text: "12 Months Primary Current Account Statement with genuine business credits", req: "Mandatory" },
      { text: "Business Registration Proof (GSTIN, Udyam Aadhaar, Trade License)", req: "Mandatory" },
      { text: "Existing Vehicle Loan Statement of Account (12-month track record with zero bounce)", req: "Mandatory" },
      { text: "Agriculture Land Holding Proof (Jamabandi / Khasra-Khatauni / LPC)", req: "Mandatory" },
      { text: "Valid Commercial Heavy Transport Driving License (3+ yrs vintage)", req: "Mandatory" },
      { text: "Proof of Experience as Driver / Sourced Employer Reference Letter", req: "Mandatory" },
      { text: "Tipper Work Contract / Mining Transport Work Order Copy", req: "Optional" }
    ]
  },
  {
    title: "4. VEHICLE & ASSET PRE-DISBURSAL DOCUMENTS",
    badge: "Asset Security",
    items: [
      { text: "Original Registration Certificate (RC) book or Smart Card", req: "Mandatory" },
      { text: "Comprehensive Vehicle Insurance Policy (Valid for at least 60 days)", req: "Mandatory" },
      { text: "Vehicle Fitness Certificate (Valid for Commercial/Tippers)", req: "Mandatory" },
      { text: "State / National Goods Permit & Road Tax Receipt", req: "Mandatory" },
      { text: "Empanelled Valuation Agency Physical Inspection Report with photos", req: "Mandatory" },
      { text: "Seller Consent & Signed Form 29, 30 (Transfer set in duplicate)", req: "Mandatory" }
    ]
  },
  {
    title: "5. GUARANTOR & CO-APPLICANT VERIFICATION",
    badge: "Mitigation Requirement",
    items: [
      { text: "Guarantor Full KYC (PAN, Aadhaar, Photo)", req: "Mandatory" },
      { text: "Guarantor Residence Proof (Electricity Bill / House Tax)", req: "Mandatory" },
      { text: "Guarantor Bank Statement (6 months) or Property Ownership Document", req: "Optional" },
      { text: "Co-applicant KYC (Blood relative — spouse/parents/son)", req: "Mandatory" }
    ]
  }
];

function getFilteredItems(groupTitle, itemText, filter) {
  if (filter === "All Documents") return true;

  if (filter === "Commercial Vehicle Finance") {
    if (groupTitle.startsWith("3.")) {
      const allowed = ["Salary Slips", "Form 16", "6 Months Operative Bank Account"];
      return allowed.some(a => itemText.includes(a));
    }
    if (groupTitle.startsWith("2.")) {
      return itemText.includes("Electricity Bill");
    }
    return true;
  }

  if (filter === "Used Car Finance — Salaried Profile") {
    if (groupTitle.startsWith("3.")) {
      const allowed = ["Salary Slips", "Form 16", "6 Months Operative Bank Account"];
      return allowed.some(a => itemText.includes(a));
    }
    return true;
  }

  if (filter === "Used Car & CV — Self-Employed") {
    if (groupTitle.startsWith("3.")) {
      const allowed = ["12 Months Primary Current Account", "Business Registration Proof", "Existing Vehicle Loan Statement"];
      return allowed.some(a => itemText.includes(a));
    }
    return true;
  }

  if (filter === "Banking Surrogate Program" || filter === "Repayment Surrogate") {
    if (groupTitle.startsWith("3.")) {
      const allowed = ["6 Months Operative Bank Account", "Existing Vehicle Loan Statement"];
      return allowed.some(a => itemText.includes(a));
    }
    return true;
  }

  if (filter === "Agri-Based Vehicle & Tractor") {
    if (groupTitle.startsWith("3.")) {
      const allowed = ["Agriculture Land Holding Proof", "6 Months Operative Bank Account"];
      return allowed.some(a => itemText.includes(a));
    }
    return true;
  }

  return true;
}

// ================= MODULE 4.5: VARIANT & KILOMETER VALUATION =================
const valCalcState = {
  model: 'Maruti Swift',
  variant: 'ZXi',
  transmission: 'Manual',
  year: 2021,
  owner: '1st',
  fuel: 'Diesel',
  kmGroup: 'under20',
  kmValue: 15000,
  health: 'Good',
  overrideVal: '',
  useType: 'Personal'
};

function renderValuationCalculatorScreen(container) {
  const years = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011];

  const selectedCarData = APPROVED_CARS_DATA.find(c => c.model === valCalcState.model) || APPROVED_CARS_DATA[0];
  const trims = selectedCarData.trims.replace('Trims: ', '').split(', ');
  if (!trims.includes(valCalcState.variant)) valCalcState.variant = trims[0];

  const baseValueRaw = selectedCarData.years[valCalcState.year];
  let finalValue = baseValueRaw ? baseValueRaw : (selectedCarData.years[2024] || 5.0);

  const ownerMult = OWNER_MULTIPLIERS[valCalcState.owner] ? OWNER_MULTIPLIERS[valCalcState.owner].mult : 1.0;
  finalValue *= ownerMult;

  if (valCalcState.health === 'Excellent') finalValue *= 1.04;
  if (valCalcState.health === 'Fair') finalValue *= 0.93;

  let kmLabel = 'STANDARD USAGE';
  let kmColor = 'var(--text-secondary)';
  let kmBg = 'rgba(255,255,255,0.1)';
  let kmDesc = 'Average running (~11,000 km/yr) — standard market rate';

  if (valCalcState.kmValue <= 20000) {
    finalValue *= 1.05;
    kmLabel = 'LOW RUNNING (PREMIUM) (+5%)';
    kmColor = '#60A5FA';
    kmBg = 'rgba(59, 130, 246, 0.2)';
    kmDesc = 'Very low mileage (5,000 km/yr vs ~11,000 km standard) — adds +5% market premium';
  } else if (valCalcState.kmValue > 80000) {
    finalValue *= 0.95;
    kmLabel = 'HIGH RUNNING (PENALTY) (-5%)';
    kmColor = '#EF4444';
    kmBg = 'rgba(239, 68, 68, 0.2)';
    kmDesc = 'High mileage — deducts -5% from standard market value';
  }

  if (valCalcState.overrideVal) finalValue = Number(valCalcState.overrideVal);

  const catALtv = finalValue * 0.85;
  const catCLtv = finalValue * 0.80;
  const tatkalLtv = finalValue * 0.75;

  container.innerHTML = `
    <div class="hero-card" style="margin-bottom: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%; flex-wrap: wrap; gap: 15px;">
        <div>
          <div class="hero-title" style="display: flex; align-items: center; gap: 8px;">
            🧮 Variant & Kilometer Valuation Calculator
          </div>
          <div class="hero-subtitle">Exact valuation tuned for specific variant, transmission, RC owner, and odometer kilometers driven. Displays full used car loan policy rules.</div>
        </div>
        <a href="https://www.carwale.com/used/car-valuation/" target="_blank" style="background: rgba(255,255,255,0.1); color: var(--text-primary); padding: 6px 12px; border-radius: 6px; font-size: 11px; text-decoration: none; border: 1px solid rgba(255,255,255,0.2);">CarWale Source ↗</a>
      </div>
    </div>

    <!-- MAIN CONFIG SECTION -->
    <div class="setting-row" style="display: flex; flex-direction: column; gap: 15px; margin-bottom: 20px;">
      
      <!-- Selects Row 1 -->
      <div style="display: flex; gap: 15px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 150px;">
          <label style="font-size: 10px; color: var(--text-secondary); margin-bottom: 5px; display: block;">🚗 CAR MODEL</label>
          <select id="vc-model" style="width: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 10px; color: var(--text-primary); font-family: inherit; outline: none;">
            ${APPROVED_CARS_DATA.map(car => `<option value="${car.model}" style="background: var(--bg);" ${valCalcState.model === car.model ? 'selected' : ''}>${car.model} (${car.oem})</option>`).join('')}
          </select>
        </div>
        <div style="flex: 1; min-width: 150px;">
          <label style="font-size: 10px; color: var(--text-secondary); margin-bottom: 5px; display: block;">📚 VARIANT FAMILY</label>
          <select id="vc-variant" style="width: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 10px; color: var(--text-primary); font-family: inherit; outline: none;">
            ${trims.map(t => `<option value="${t}" style="background: var(--bg);" ${valCalcState.variant === t ? 'selected' : ''}>${t}</option>`).join('')}
          </select>
        </div>
        <div style="flex: 1; min-width: 150px;">
          <label style="font-size: 10px; color: var(--text-secondary); margin-bottom: 5px; display: block;">⚙️ TRANSMISSION</label>
          <select id="vc-trans" style="width: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 10px; color: var(--text-primary); font-family: inherit; outline: none;">
            <option value="Manual" style="background: var(--bg);" ${valCalcState.transmission === 'Manual' ? 'selected' : ''}>Manual</option>
            <option value="Automatic" style="background: var(--bg);" ${valCalcState.transmission === 'Automatic' ? 'selected' : ''}>Automatic</option>
          </select>
        </div>
      </div>

      <!-- Selects Row 2 -->
      <div style="display: flex; gap: 15px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 150px;">
          <label style="font-size: 10px; color: var(--text-secondary); margin-bottom: 5px; display: block;">📅 MFG YEAR</label>
          <select id="vc-year" style="width: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 10px; color: var(--text-primary); font-family: inherit; outline: none;">
            ${years.map(y => `<option value="${y}" style="background: var(--bg);" ${y === valCalcState.year ? 'selected' : ''}>${y}</option>`).join('')}
          </select>
        </div>
        <div style="flex: 1; min-width: 150px;">
          <label style="font-size: 10px; color: var(--text-secondary); margin-bottom: 5px; display: block;">👥 OWNER ON RC</label>
          <select id="vc-owner" style="width: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 10px; color: var(--text-primary); font-family: inherit; outline: none;">
            <option value="1st" style="background: var(--bg);" ${valCalcState.owner === '1st' ? 'selected' : ''}>1st Owner (100% Grid)</option>
            <option value="2nd" style="background: var(--bg);" ${valCalcState.owner === '2nd' ? 'selected' : ''}>2nd Owner (-5%)</option>
            <option value="3rd" style="background: var(--bg);" ${valCalcState.owner === '3rd' ? 'selected' : ''}>3rd Owner (-12%)</option>
          </select>
        </div>
        <div style="flex: 1; min-width: 150px;">
          <label style="font-size: 10px; color: var(--text-secondary); margin-bottom: 5px; display: block;">⛽ FUEL TYPE</label>
          <select id="vc-fuel" style="width: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 10px; color: var(--text-primary); font-family: inherit; outline: none;">
            <option value="Diesel" style="background: var(--bg);" ${valCalcState.fuel === 'Diesel' ? 'selected' : ''}>Diesel</option>
            <option value="Petrol" style="background: var(--bg);" ${valCalcState.fuel === 'Petrol' ? 'selected' : ''}>Petrol</option>
            <option value="CNG" style="background: var(--bg);" ${valCalcState.fuel === 'CNG' ? 'selected' : ''}>CNG</option>
          </select>
        </div>
      </div>

      <!-- KM Slider -->
      <div style="background: var(--surface); border-radius: 8px; padding: 15px; margin-top: 10px; border: 1px solid var(--border);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-wrap: wrap; gap: 10px;">
          <div>
            <div style="font-size: 11px; font-weight: 700; display: flex; align-items: center; gap: 8px;">
              <span style="background: #3B82F6; color: #FFFFFF; border-radius: 50%; width: 20px; height: 20px; display: inline-flex; align-items: center; justify-content: center; font-size: 10px;">⏱</span>
              KILOMETERS DRIVEN (ODOMETER READING)
              <span style="background: ${kmBg}; color: ${kmColor}; font-size: 9px; padding: 2px 6px; border-radius: 4px;">${kmLabel}</span>
            </div>
            <div style="font-size: 10px; color: var(--text-secondary); margin-top: 4px;">${kmDesc}</div>
          </div>
          <div style="background: var(--surface); border: 1px solid var(--border); border-radius: 4px; padding: 5px 10px; color: var(--text-primary); font-size: 12px; font-weight: 600;">
            ${valCalcState.kmValue.toLocaleString('en-IN')} KM
          </div>
        </div>
        
        <input type="range" id="vc-km-slider" min="5000" max="150000" step="1000" value="${valCalcState.kmValue}" style="width: 100%; margin-bottom: 15px; accent-color: #3B82F6;" />
        
        <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
          <span style="font-size: 10px; color: var(--text-secondary);">Quick Presets:</span>
          ${[
      { label: 'Under 20k km', val: 15000 },
      { label: '20k - 40k km', val: 30000 },
      { label: '40k - 60k km', val: 50000 },
      { label: '60k - 80k km', val: 70000 },
      { label: '80k - 1.0L km', val: 90000 },
      { label: '1.0L+ km', val: 120000 }
    ].map((p) => {
      const isActive = valCalcState.kmValue === p.val;
      return `<button class="vc-preset-btn ${isActive ? 'active' : ''}" data-val="${p.val}" style="background: ${isActive ? '#3B82F6' : 'rgba(255,255,255,0.05)'}; color: ${isActive ? 'white' : 'var(--text-secondary)'}; border: 1px solid ${isActive ? '#3B82F6' : 'var(--border)'}; padding: 4px 10px; border-radius: 20px; font-size: 10px; cursor: pointer;">${p.label}</button>`;
    }).join('')}
        </div>
      </div>

      <!-- Overrides Row -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); padding-top: 15px; flex-wrap: wrap; gap: 15px;">
        <div style="display: flex; gap: 8px; align-items: center;">
          <span style="font-size: 11px; color: var(--text-secondary);">Vehicle Health:</span>
          <button class="vc-health-btn" data-health="Excellent" style="background: ${valCalcState.health === 'Excellent' ? '#3B82F6' : 'transparent'}; border: 1px solid ${valCalcState.health === 'Excellent' ? '#3B82F6' : 'var(--border)'}; border-radius: 4px; padding: 4px 8px; color: var(--text-primary); font-size: 11px; cursor: pointer; transition: 0.2s;">Excellent (+4%)</button>
          <button class="vc-health-btn" data-health="Good" style="background: ${valCalcState.health === 'Good' ? '#3B82F6' : 'transparent'}; border: 1px solid ${valCalcState.health === 'Good' ? '#3B82F6' : 'var(--border)'}; border-radius: 4px; padding: 4px 8px; color: var(--text-primary); font-size: 11px; cursor: pointer; transition: 0.2s;">Good (Std)</button>
          <button class="vc-health-btn" data-health="Fair" style="background: ${valCalcState.health === 'Fair' ? '#3B82F6' : 'transparent'}; border: 1px solid ${valCalcState.health === 'Fair' ? '#3B82F6' : 'var(--border)'}; border-radius: 4px; padding: 4px 8px; color: var(--text-primary); font-size: 11px; cursor: pointer; transition: 0.2s;">Fair (-7%)</button>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 10px; color: var(--text-secondary);">Live CarWale Quote Override: ₹</span>
          <input type="number" id="vc-override" placeholder="e.g. 8.45" value="${valCalcState.overrideVal}" style="width: 80px; background: var(--surface); border: 1px solid var(--border); border-radius: 4px; padding: 6px; color: var(--text-primary); font-size: 11px; text-align: right; outline: none;" />
          <span style="font-size: 10px; color: var(--text-secondary);">Lakhs</span>
        </div>
      </div>
    </div>

    <!-- RESULT SECTION -->
    <div style="background: var(--card); border-radius: 12px; padding: 20px; border: 1px solid var(--border); box-shadow: 0 4px 6px rgba(0,0,0,0.2);">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 15px; flex-wrap: wrap; gap: 15px;">
        <div>
          <div style="display: flex; gap: 8px; margin-bottom: 8px; align-items: center; flex-wrap: wrap;">
            <span style="color: var(--sapphire, #3B82F6); font-size: 10px; font-weight: 700; letter-spacing: 0.5px;">ACCURATE MARKET VALUATION</span>
            <span style="background: rgba(255,255,255,0.1); color: var(--text-secondary); font-size: 9px; padding: 2px 6px; border-radius: 4px;">Variant: ${valCalcState.variant}</span>
            <span style="background: rgba(255,255,255,0.1); color: var(--text-secondary); font-size: 9px; padding: 2px 6px; border-radius: 4px;">${valCalcState.year} Model</span>
            <span style="background: rgba(255,255,255,0.1); color: var(--text-secondary); font-size: 9px; padding: 2px 6px; border-radius: 4px;">${valCalcState.kmValue.toLocaleString('en-IN')} KM</span>
            <span style="background: rgba(212, 175, 55, 0.2); color: var(--gold-primary); font-size: 9px; padding: 2px 6px; border-radius: 4px;">${valCalcState.owner} Owner</span>
          </div>
          <h2 style="color: var(--text-primary); font-size: 20px; font-family: serif; margin: 0 0 5px 0;">${valCalcState.model} • ${valCalcState.variant} (${valCalcState.transmission})</h2>
          <div style="color: var(--text-secondary); font-size: 11px;">OEM: Maruti • Category: Hatchback / Sedan • Fuel: ${valCalcState.fuel} • Condition: ${valCalcState.health} • Core Mid Trim (Standard)</div>
        </div>
        <div style="text-align: right;">
          <div style="color: var(--text-secondary); font-size: 10px; font-weight: 600; margin-bottom: 4px;">ACCURATE VALUE (1ST OWNER)</div>
          <div style="color: var(--gold-primary); font-size: 28px; font-weight: 700; line-height: 1;">₹${finalValue.toFixed(2)} <span style="font-size: 14px; font-weight: 500;">Lakhs</span></div>
          <div style="color: var(--sapphire, #3B82F6); font-size: 10px; margin-top: 4px;">(₹${(finalValue * 100000).toLocaleString('en-IN')})</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
        <!-- Card 1 -->
        <div style="background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 15px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <span style="color: var(--text-secondary); font-size: 10px; font-weight: 600;">Category A & B (85% LTV)</span>
            <span style="background: rgba(59, 130, 246, 0.2); color: var(--sapphire, #3B82F6); font-size: 8px; padding: 2px 4px; border-radius: 2px;">Prime Cap</span>
          </div>
          <div style="color: var(--text-primary); font-size: 18px; font-weight: 700; margin-bottom: 6px;">₹${catALtv.toFixed(2)} Lakhs</div>
          <div style="color: var(--text-secondary); font-size: 9px; margin-bottom: 12px; height: 22px;">For captive clients, strong banking and CIBIL ≥ 700.</div>
          <button onclick="state.emiAmount=${Math.round(catALtv * 100000)}; jumpToTab('emi_calculator');" style="width: 100%; background: #2563EB; color: #FFFFFF; border: none; border-radius: 4px; padding: 6px; font-size: 10px; font-weight: 600; cursor: pointer; transition: 0.2s;">Calculate EMI (85%) →</button>
        </div>

        <!-- Card 2 -->
        <div style="background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 15px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <span style="color: var(--text-secondary); font-size: 10px; font-weight: 600;">Category C (80% LTV)</span>
            <span style="background: rgba(255, 255, 255, 0.1); color: var(--text-secondary); font-size: 8px; padding: 2px 4px; border-radius: 2px;">Standard</span>
          </div>
          <div style="color: var(--text-primary); font-size: 18px; font-weight: 700; margin-bottom: 6px;">₹${catCLtv.toFixed(2)} Lakhs</div>
          <div style="color: var(--text-secondary); font-size: 9px; margin-bottom: 12px; height: 22px;">Standard used passenger car financing norm.</div>
          <button onclick="state.emiAmount=${Math.round(catCLtv * 100000)}; jumpToTab('emi_calculator');" style="width: 100%; background: #2563EB; color: #FFFFFF; border: none; border-radius: 4px; padding: 6px; font-size: 10px; font-weight: 600; cursor: pointer; transition: 0.2s;">Calculate EMI (80%) →</button>
        </div>

        <!-- Card 3 -->
        <div style="background: rgba(212, 175, 55, 0.05); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 8px; padding: 15px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <span style="color: var(--gold-primary); font-size: 10px; font-weight: 600;">Tatkal Scheme (75% LTV)</span>
            <span style="background: rgba(245, 158, 11, 0.2); color: #F59E0B; font-size: 8px; padding: 2px 4px; border-radius: 2px;">Fast Track</span>
          </div>
          <div style="color: var(--text-primary); font-size: 18px; font-weight: 700; margin-bottom: 6px;">₹${tatkalLtv.toFixed(2)} Lakhs</div>
          <div style="color: var(--text-secondary); font-size: 9px; margin-bottom: 12px; height: 22px;">Fast Track Tatkal Scheme without detailed banking requirement.</div>
          <button onclick="state.emiAmount=${Math.round(tatkalLtv * 100000)}; jumpToTab('emi_calculator');" style="width: 100%; background: #F59E0B; color: black; border: none; border-radius: 4px; padding: 6px; font-size: 10px; font-weight: 700; cursor: pointer; transition: 0.2s;">Calculate EMI (75%) →</button>
        </div>
      </div>
    </div>

    <!-- POLICY RULES SECTION -->
    <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 20px; border: 1px solid var(--border); margin-top: 20px;">
      
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 15px;">
        <div style="display: flex; gap: 12px;">
          <div style="background: rgba(59, 130, 246, 0.2); color: var(--sapphire, #3B82F6); border-radius: 8px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </div>
          <div>
            <h3 style="margin: 0 0 4px 0; color: var(--text-primary); font-size: 16px; font-weight: 700; display: flex; align-items: center; gap: 8px;">
              Used Car Loan Policy Rules <span style="color: var(--text-secondary); font-size: 13px; font-weight: 500;">(KV FLASH Policy 2024-25)</span>
            </h3>
            <div style="color: var(--text-secondary); font-size: 12px;">Applicable credit policy rules, IRR matrices, tenure caps, and delegation for this vehicle.</div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 10px; background: var(--surface); padding: 4px; border-radius: 8px; border: 1px solid var(--border);">
          <span style="font-size: 11px; color: var(--text-secondary); margin-left: 8px;">Use Type:</span>
          <button class="vc-usetype-btn" data-usetype="Personal" style="background: ${valCalcState.useType === 'Personal' ? '#2563EB' : 'transparent'}; color: ${valCalcState.useType === 'Personal' ? 'white' : 'var(--text-secondary)'}; border: none; border-radius: 6px; padding: 6px 12px; font-size: 11px; font-weight: 600; cursor: pointer; transition: 0.2s;">Personal</button>
          <button class="vc-usetype-btn" data-usetype="Commercial" style="background: ${valCalcState.useType === 'Commercial' ? '#2563EB' : 'transparent'}; color: ${valCalcState.useType === 'Commercial' ? 'white' : 'var(--text-secondary)'}; border: none; border-radius: 6px; padding: 6px 12px; font-size: 11px; font-weight: 600; cursor: pointer; transition: 0.2s;">Commercial / Taxi</button>
        </div>
      </div>

      <!-- 4 Cards -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 25px;">
        <!-- Card 1 -->
        <div style="background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 15px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <div style="color: var(--sapphire, #3B82F6); font-size: 11px; font-weight: 600; display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 12px;">⏱</span> Prescribed IRR
            </div>
            <div style="color: var(--sapphire, #3B82F6); font-size: 10px; font-weight: 600;">Mfg: ${valCalcState.year}</div>
          </div>
          <div style="color: var(--text-primary); font-size: 24px; font-weight: 800; margin-bottom: 4px;">18.0% <span style="font-size: 12px; font-weight: 600; color: var(--text-secondary);">IRR</span></div>
          <div style="color: var(--text-secondary); font-size: 10px;">Weighted IRR: <strong style="color: var(--text-primary);">16.0% WIRR</strong></div>
        </div>

        <!-- Card 2 -->
        <div style="background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 15px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <div style="color: var(--text-secondary); font-size: 11px; font-weight: 600; display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 12px;">🕒</span> Max Loan Tenure
            </div>
            <div style="color: var(--sapphire, #3B82F6); font-size: 10px; font-weight: 600;">EOT ≤ 12 yrs</div>
          </div>
          <div style="color: var(--text-primary); font-size: 24px; font-weight: 800; margin-bottom: 4px;">60 <span style="font-size: 12px; font-weight: 600; color: var(--text-secondary);">Months</span></div>
          <div style="color: var(--text-secondary); font-size: 10px;">Vehicle Age ${2024 - valCalcState.year} yrs + Tenure 5 yrs = ${2024 - valCalcState.year + 5} yrs</div>
        </div>

        <!-- Card 3 -->
        <div style="background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 15px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <div style="color: var(--text-primary); font-size: 11px; font-weight: 600; display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 12px;">🏛</span> Approval Authority
            </div>
            <div style="color: var(--text-primary); font-size: 10px; font-weight: 600;">Up to ₹100L</div>
          </div>
          <div style="color: var(--text-primary); font-size: 14px; font-weight: 700; margin-bottom: 6px; line-height: 1.3;">Branch Credit Manager + Branch Head</div>
          <div style="color: var(--text-secondary); font-size: 10px; line-height: 1.4;">Regional escalation only required if loan exceeds ₹100 Lacs.</div>
        </div>

        <!-- Card 4 -->
        <div style="background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 15px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <div style="color: var(--gold-primary); font-size: 11px; font-weight: 600; display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 12px;">👥</span> RC Owner Eligibility
            </div>
            <div style="color: var(--gold-primary); font-size: 10px; font-weight: 600;">Max 5th Owner</div>
          </div>
          <div style="color: var(--text-primary); font-size: 14px; font-weight: 700; margin-bottom: 6px; line-height: 1.3;">${valCalcState.owner} Owner (Approved)</div>
          <div style="color: var(--text-secondary); font-size: 10px; line-height: 1.4;">Single owner - 100% standard baseline grid value</div>
        </div>
      </div>

      <!-- Text Blocks -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px;">
        <!-- Left: Norms -->
        <div>
          <h4 style="color: var(--sapphire, #3B82F6); font-size: 11px; font-weight: 700; margin: 0 0 12px 0; display: flex; align-items: center; gap: 6px; letter-spacing: 0.5px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            CREDIT NORMS & ELIGIBILITY CONDITIONS
          </h4>
          <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px;">
            <li style="font-size: 11px; color: var(--text-secondary); display: flex; gap: 6px; line-height: 1.5;">
              <span style="color: #3B82F6;">✓</span> <span><strong>CIBIL Norm:</strong> Minimum CIBIL 650 standard. CIBIL ≥ 700 qualifies for 5% additional LTV with property ownership.</span>
            </li>
            <li style="font-size: 11px; color: var(--text-secondary); display: flex; gap: 6px; line-height: 1.5;">
              <span style="color: #3B82F6;">✓</span> <span><strong>Property Norm:</strong> Property ownership is optional for ticket size < ₹10L. For Tatkal / 5% extra LTV, verified self-owned property proof is mandatory.</span>
            </li>
            <li style="font-size: 11px; color: var(--text-secondary); display: flex; gap: 6px; line-height: 1.5;">
              <span style="color: #3B82F6;">✓</span> <span><strong>Rented Profile:</strong> 5% lower LTV applied unless an external property guarantor is provided.</span>
            </li>
            <li style="font-size: 11px; color: var(--text-secondary); display: flex; gap: 6px; line-height: 1.5;">
              <span style="color: #3B82F6;">✓</span> <span><strong>Processing Fee:</strong> 2.00% of loan amount + 18% GST (Documentation fee ₹2,500 + GST)</span>
            </li>
          </ul>
        </div>
        
        <!-- Right: Docs -->
        <div>
          <h4 style="color: var(--sapphire, #3B82F6); font-size: 11px; font-weight: 700; margin: 0 0 12px 0; display: flex; align-items: center; gap: 6px; letter-spacing: 0.5px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            MANDATORY SOURCING DOCUMENTATION
          </h4>
          <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px;">
            <li style="font-size: 11px; color: var(--text-secondary); display: flex; gap: 6px; line-height: 1.5;">
              <span style="color: #3B82F6;">✓</span> <span>Original Vehicle RC copy (up to 5th owner)</span>
            </li>
            <li style="font-size: 11px; color: var(--text-secondary); display: flex; gap: 6px; line-height: 1.5;">
              <span style="color: #3B82F6;">✓</span> <span>Valid Comprehensive Insurance & RTO fitness</span>
            </li>
            <li style="font-size: 11px; color: var(--text-secondary); display: flex; gap: 6px; line-height: 1.5;">
              <span style="color: #3B82F6;">✓</span> <span>CarWale / Empanelled Valuer Physical Inspection Report</span>
            </li>
            <li style="font-size: 11px; color: var(--text-secondary); display: flex; gap: 6px; line-height: 1.5;">
              <span style="color: #3B82F6;">✓</span> <span>Form 29 & Form 30 for RTO ownership transfer</span>
            </li>
            <li style="font-size: 11px; color: var(--text-secondary); display: flex; gap: 6px; line-height: 1.5;">
              <span style="color: #3B82F6;">✓</span> <span>KYC (Aadhaar & PAN) of borrower and co-borrower</span>
            </li>
            <li style="font-size: 11px; color: var(--text-secondary); display: flex; gap: 6px; line-height: 1.5;">
              <span style="color: #3B82F6;">✓</span> <span>6 Months Bank Statement (Salaried) or 12 Months (Self-Employed)</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  `;

  // Attach basic listeners to trigger re-renders
  const inputs = ['vc-model', 'vc-variant', 'vc-trans', 'vc-year', 'vc-owner', 'vc-fuel', 'vc-km-slider', 'vc-override'];
  inputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', (e) => {
        const propMap = {
          'vc-model': 'model', 'vc-variant': 'variant', 'vc-trans': 'transmission',
          'vc-year': 'year', 'vc-owner': 'owner', 'vc-fuel': 'fuel',
          'vc-km-slider': 'kmValue', 'vc-override': 'overrideVal'
        };
        valCalcState[propMap[id]] = e.target.value;
        if (id === 'vc-year' || id === 'vc-km-slider') valCalcState[propMap[id]] = Number(e.target.value);

        if (id === 'vc-km-slider' || id === 'vc-override') {
          clearTimeout(window.vcTimer);
          window.vcTimer = setTimeout(() => {
            renderValuationCalculatorScreen(container);
            const reInput = document.getElementById(id);
            if (reInput && id === 'vc-override') {
              reInput.focus();
              const v = reInput.value;
              reInput.value = '';
              reInput.value = v;
            }
          }, 150);
        } else {
          renderValuationCalculatorScreen(container);
        }
      });
    }
  });

  const healthBtns = container.querySelectorAll('.vc-health-btn');
  healthBtns.forEach(b => {
    b.addEventListener('click', () => {
      valCalcState.health = b.getAttribute('data-health');
      renderValuationCalculatorScreen(container);
    });
  });

  const presetBtns = container.querySelectorAll('.vc-preset-btn');
  presetBtns.forEach(b => {
    b.addEventListener('click', () => {
      valCalcState.kmValue = Number(b.getAttribute('data-val'));
      renderValuationCalculatorScreen(container);
    });
  });

  const useTypeBtns = container.querySelectorAll('.vc-usetype-btn');
  useTypeBtns.forEach(b => {
    b.addEventListener('click', () => {
      valCalcState.useType = b.getAttribute('data-usetype');
      renderValuationCalculatorScreen(container);
    });
  });
}

function renderDocumentsScreen(container) {
  const products = [
    "All Documents",
    "Commercial Vehicle Finance",
    "Used Car Finance — Salaried Profile",
    "Used Car & CV — Self-Employed",
    "Banking Surrogate Program",
    "Repayment Surrogate",
    "Agri-Based Vehicle & Tractor"
  ];

  let html = `
    <div style="background: white; border-radius: 12px; padding: 25px; margin-bottom: 25px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 15px;">
        <div>
          <span style="background: #F3E8FF; color: #7E22CE; font-size: 10px; font-weight: 700; padding: 4px 8px; border-radius: 4px; display: inline-flex; align-items: center; gap: 4px; margin-bottom: 10px; border: 1px solid #E9D5FF;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            FIELD DOCUMENTATION DESK
          </span>
          <h2 style="color: var(--text-primary); font-size: 20px; font-weight: 700; margin: 0 0 5px 0;">Documents Checklist by Loan Policy</h2>
          <p style="color: #6B7280; font-size: 13px; margin: 0;">Filter required customer proofs by scheme and export customer-ready WhatsApp checklists.</p>
        </div>
        <button id="btn-share-docs" style="background: #1D4ED8; color: #FFFFFF; border: none; padding: 10px 16px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          Copy WhatsApp Checklist
        </button>
      </div>
      
      <div style="margin-top: 25px;">
        <div style="color: var(--text-secondary); font-size: 12px; margin-bottom: 10px;">Filter Checklist by Product:</div>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          ${products.map(p => `
            <button class="doc-filter-btn ${p === 'All Documents' ? 'active' : ''}" data-product="${p}" style="padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; cursor: pointer; transition: 0.2s; border: 1px solid ${p === 'All Documents' ? '#7E22CE' : '#E5E7EB'}; background: ${p === 'All Documents' ? '#7E22CE' : '#F9FAFB'}; color: ${p === 'All Documents' ? 'white' : '#4B5563'};">
              ${p}
            </button>
          `).join('')}
        </div>
      </div>
    </div>
    <div id="docs-list-wrapper"></div>
  `;

  container.innerHTML = html;

  let currentFilter = "All Documents";

  const renderList = () => {
    let listHtml = '';
    docGroups.forEach(group => {
      const filteredItems = group.items.filter(item => getFilteredItems(group.title, item.text, currentFilter));
      if (filteredItems.length === 0) return; // Skip group entirely if empty

      listHtml += `
        <div style="background: white; border-radius: 10px; overflow: hidden; margin-bottom: 20px; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);">
          <div style="background: #F9FAFB; padding: 15px 20px; border-bottom: 1px solid #E5E7EB; display: flex; justify-content: space-between; align-items: center;">
            <strong style="color: var(--text-primary); font-size: 13px; font-family: serif; letter-spacing: 0.5px;">${group.title}</strong>
            <span style="background: #E5E7EB; color: #4B5563; font-size: 10px; padding: 4px 8px; border-radius: 4px; font-weight: 600;">${group.badge}</span>
          </div>
          <div>
      `;

      filteredItems.forEach((item, idx) => {
        const isMandatory = item.req === 'Mandatory';
        const iconColor = isMandatory ? '#3B82F6' : '#9CA3AF';
        const badgeBg = isMandatory ? '#FFE4E6' : '#F3F4F6';
        const badgeColor = isMandatory ? '#E11D48' : '#4B5563';
        const borderBtm = idx === filteredItems.length - 1 ? '' : 'border-bottom: 1px solid #F3F4F6;';

        listHtml += `
          <div style="padding: 15px 20px; ${borderBtm} display: flex; justify-content: space-between; align-items: center; cursor: pointer;" class="doc-item-row" data-name="${item.text}" data-req="${item.req}">
            <div style="display: flex; align-items: center; gap: 12px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="doc-chk-icon">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span style="color: var(--text-primary); font-size: 13px; font-weight: 500;">${item.text}</span>
            </div>
            <span style="background: ${badgeBg}; color: ${badgeColor}; font-size: 10px; padding: 4px 8px; border-radius: 4px; font-weight: 600;">${item.req}</span>
          </div>
        `;
      });

      listHtml += `
          </div>
        </div>
      `;
    });

    document.getElementById('docs-list-wrapper').innerHTML = listHtml;

    // Attach toggle events
    document.querySelectorAll('.doc-item-row').forEach(row => {
      row.addEventListener('click', () => {
        const icon = row.querySelector('.doc-chk-icon');
        const isCurrentlyBlue = icon.getAttribute('stroke') === '#3B82F6';
        icon.setAttribute('stroke', isCurrentlyBlue ? '#9CA3AF' : '#3B82F6');
      });
    });
  };

  // Initial render
  renderList();

  // Filter functionality
  const filterBtns = container.querySelectorAll('.doc-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.style.background = '#F9FAFB';
        b.style.color = '#4B5563';
        b.style.borderColor = '#E5E7EB';
        b.classList.remove('active');
      });
      btn.style.background = '#7E22CE';
      btn.style.color = 'white';
      btn.style.borderColor = '#7E22CE';
      btn.classList.add('active');

      currentFilter = btn.getAttribute('data-product');
      renderList();
    });
  });

  // Copy to WhatsApp
  document.getElementById('btn-share-docs')?.addEventListener('click', () => {
    let text = `📑 *LOAN DOCUMENTATION CHECKLIST* (${currentFilter})\n━━━━━━━━━━━━━━━━━━━━\n`;
    docGroups.forEach(group => {
      const filteredItems = group.items.filter(item => getFilteredItems(group.title, item.text, currentFilter));
      if (filteredItems.length === 0) return;

      text += `\n*${group.title}*\n`;
      filteredItems.forEach(item => {
        text += `• ${item.text} [${item.req}]\n`;
      });
    });
    text += `\n━━━━━━━━━━━━━━━━━━━━\nSent via KV FLASH`;
    navigator.clipboard.writeText(text).then(() => {
      alert("Checklist copied to clipboard!");
    }).catch(err => {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    });
  });
}

// ================= MODULE 6: NEW LEAD =================
window.submitNewLead = () => {
  const name = document.getElementById('nl-name').value.trim();
  const phone = document.getElementById('nl-phone').value.trim();
  const product = document.getElementById('nl-product').value;
  const amount = document.getElementById('nl-amount').value.trim();

  if (!name || !phone || !product || !amount) {
    alert('Please fill out all fields.');
    return;
  }

  const newLead = {
    id: Date.now(),
    date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    name,
    phone,
    product,
    amount: Number(amount),
    status: 'Pending'
  };

  const leads = JSON.parse(localStorage.getItem('vfh_leads') || '[]');
  leads.unshift(newLead);
  localStorage.setItem('vfh_leads', JSON.stringify(leads));

  alert('Lead Successfully Logged & Assigned to Credit Team!');
  renderView();
};

window.deleteLead = (id) => {
  if (confirm("Are you sure you want to delete this lead from history?")) {
    let leads = JSON.parse(localStorage.getItem('vfh_leads') || '[]');
    leads = leads.filter(l => l.id !== id);
    localStorage.setItem('vfh_leads', JSON.stringify(leads));
    renderView();
  }
};

window.updateLeadStatus = (id, el) => {
  let leads = JSON.parse(localStorage.getItem('vfh_leads') || '[]');
  const lead = leads.find(l => l.id === id);
  if (lead) {
    lead.status = el.value;
    localStorage.setItem('vfh_leads', JSON.stringify(leads));
    renderView();
  }
};

function renderNewLeadScreen(container) {
  const leads = JSON.parse(localStorage.getItem('vfh_leads') || '[]');

  let historyHtml = '';
  if (leads.length > 0) {
    historyHtml = `
      <div style="margin-top: 25px;">
        <h3 style="color: var(--text-primary); font-size: 14px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid var(--border);">Recent Lead History</h3>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${leads.map(l => {
      let statusColor = '#9CA3AF';
      if (l.status === 'Pending') statusColor = '#FBBF24';
      if (l.status === 'Under Process') statusColor = '#60A5FA';
      if (l.status === 'Completed') statusColor = '#34D399';
      if (l.status === 'Rejected') statusColor = '#F87171';

      return `
            <div class="setting-row" style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border-radius: 8px; background: var(--surface);">
              <div>
                <strong style="color: var(--text-primary); font-size: 14px;">${l.name}</strong>
                <div style="color: var(--text-secondary); font-size: 11.5px; margin-top: 4px;">
                  <span style="color: var(--gold-primary);">${l.product}</span> • ₹${l.amount.toLocaleString('en-IN')}
                </div>
                <div style="color: var(--sapphire, #3B82F6); font-size: 11px; margin-top: 3px;">📞 ${l.phone} &nbsp;|&nbsp; 🗓️ ${l.date}</div>
              </div>
              <div style="display: flex; flex-direction: column; gap: 8px; align-items: flex-end;">
                <select onchange="updateLeadStatus(${l.id}, this)" style="background: rgba(0,0,0,0.3); color: ${statusColor}; border: 1px solid ${statusColor}; border-radius: 4px; padding: 4px; font-size: 10px; font-weight: 600; outline: none; cursor: pointer;">
                  <option value="Pending" style="color: var(--text-primary); background: var(--bg);" ${l.status === 'Pending' ? 'selected' : ''}>Pending</option>
                  <option value="Under Process" style="color: var(--text-primary); background: var(--bg);" ${l.status === 'Under Process' ? 'selected' : ''}>Under Process</option>
                  <option value="Completed" style="color: var(--text-primary); background: var(--bg);" ${l.status === 'Completed' ? 'selected' : ''}>Completed</option>
                  <option value="Rejected" style="color: var(--text-primary); background: var(--bg);" ${l.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                </select>
                <button onclick="deleteLead(${l.id})" style="background: transparent; color: #FCA5A5; border: 1px solid rgba(252, 165, 165, 0.4); border-radius: 4px; padding: 4px 8px; cursor: pointer; font-size: 10px; transition: 0.2s;">Delete</button>
              </div>
            </div>
            `;
    }).join('')}
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="hero-card">
      <div>
        <div class="hero-title">Log New Lead</div>
        <div class="hero-subtitle">Instantly capture customer details and assign to the local credit team.</div>
      </div>
    </div>

    <div class="setting-row" style="display: flex; flex-direction: column; gap: 15px; margin-top: 10px;">
      
      <div>
        <label style="font-size: 11px; color: var(--text-secondary); margin-bottom: 5px; display: block;">CUSTOMER NAME</label>
        <input type="text" id="nl-name" placeholder="Enter Full Name" style="width: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 10px; color: var(--text-primary); font-family: inherit;" />
      </div>

      <div>
        <label style="font-size: 11px; color: var(--text-secondary); margin-bottom: 5px; display: block;">MOBILE NUMBER</label>
        <input type="tel" id="nl-phone" placeholder="+91" style="width: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 10px; color: var(--text-primary); font-family: inherit;" />
      </div>

      <div>
        <label style="font-size: 11px; color: var(--text-secondary); margin-bottom: 5px; display: block;">LOAN PRODUCT</label>
        <select id="nl-product" style="width: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 10px; color: var(--text-primary); font-family: inherit;">
          <option value="" style="background: var(--bg);">Select Product...</option>
          <option value="Commercial Vehicle Finance" style="background: var(--bg);">Commercial Vehicle Finance</option>
          <option value="Used Car Finance" style="background: var(--bg);">Used Car Finance</option>
          <option value="Tractor / Agri Finance" style="background: var(--bg);">Tractor / Agri Finance</option>
        </select>
      </div>

      <div>
        <label style="font-size: 11px; color: var(--text-secondary); margin-bottom: 5px; display: block;">REQUIRED LOAN AMOUNT (₹)</label>
        <input type="number" id="nl-amount" placeholder="Ex: 500000" style="width: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 10px; color: var(--text-primary); font-family: inherit;" />
      </div>

      <button class="btn btn-primary" onclick="submitNewLead();" style="margin-top: 10px;">🚀 Submit Lead</button>
    </div>

    ${historyHtml}
  `;
}

// ================= MODULE 7: CONTACTS DIRECTORY =================
window.deleteContact = (index) => {
  if (confirm("Are you sure you want to delete this contact?")) {
    state.datasets['contacts'].rows.splice(index, 1);
    localStorage.setItem('vfh_dataset_contacts', JSON.stringify(state.datasets['contacts']));
    renderView();
  }
};

window.editContact = (index) => {
  const c = state.datasets['contacts'].rows[index];
  const name = prompt("Name", c.name) || c.name;
  const designation = prompt("Designation", c.designation) || c.designation;
  const department = prompt("Department", c.department) || c.department;
  const phone = prompt("Phone", c.phone) || c.phone;
  const email = prompt("Email", c.email) || c.email;
  state.datasets['contacts'].rows[index] = { name, designation, department, phone, email };
  localStorage.setItem('vfh_dataset_contacts', JSON.stringify(state.datasets['contacts']));
  renderView();
};

window.addContact = () => {
  const name = prompt("Name");
  if (!name) return;
  const designation = prompt("Designation") || "";
  const department = prompt("Department") || "";
  const phone = prompt("Phone") || "";
  const email = prompt("Email") || "";
  state.datasets['contacts'].rows.push({ name, designation, department, phone, email });
  localStorage.setItem('vfh_dataset_contacts', JSON.stringify(state.datasets['contacts']));
  renderView();
};

function renderContactsScreen(container) {
  const schema = state.datasets['contacts'];
  if (!schema) return;

  container.innerHTML = `
    <div class="hero-card" style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div class="hero-title">Key Contacts & DSA Directory</div>
        <div class="hero-subtitle">Direct line to credit approvers, product managers and ops</div>
      </div>
      <button class="btn btn-primary" onclick="addContact()">➕ New</button>
    </div>

    <div style="display: flex; flex-direction: column; gap: 10px;">
      ${schema.rows.length === 0 ? '<p style="color: var(--text-secondary); text-align:center; padding: 20px;">No contacts found. Add a new one.</p>' : ''}
      ${schema.rows.map((c, i) => `
        <div class="setting-row">
          <div>
            <strong>${c.name}</strong> <span class="status-pill status-default">${c.department}</span>
            <p class="subtext">${c.designation}</p>
          </div>
          <div style="display: flex; gap: 8px; align-items: center;">
            <a href="tel:${c.phone}" class="icon-btn" title="Call"><span style="font-size: 14px;">📞</span></a>
            <a href="https://wa.me/${(c.phone || '').replace(/[^0-9]/g, '')}" target="_blank" class="icon-btn" title="WhatsApp"><span style="font-size: 14px;">💬</span></a>
            <a href="mailto:${c.email}" class="icon-btn" title="Email"><span style="font-size: 14px;">✉️</span></a>
            <div style="width: 1px; height: 24px; background: #23283B; margin: 0 4px;"></div>
            <button class="icon-btn" title="Edit" onclick="editContact(${i})"><span style="font-size: 14px;">✏️</span></button>
            <button class="icon-btn" title="Delete" onclick="deleteContact(${i})"><span style="font-size: 14px;">🗑️</span></button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// ================= MODULE 8: FAVORITES =================
function renderFavoritesScreen(container) {
  if (state.favorites.length === 0) {
    container.innerHTML = `
      <div class="hero-card" style="text-align: center; justify-content: center;">
        <div>
          <div class="hero-title">No Starred Favorites Yet</div>
          <div class="hero-subtitle" style="margin-top: 6px;">Tap the star (★) on any approved car, CV model, policy rule or payout row to pin it here.</div>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="hero-card">
      <div>
        <div class="hero-title">Starred Favorites (${state.favorites.length})</div>
        <div class="hero-subtitle">Quick access repository of pinned lending records</div>
      </div>
      <button class="btn btn-danger" id="btn-clear-favs">Clear All</button>
    </div>

    <div style="display: flex; flex-direction: column; gap: 10px;">
      ${state.favorites.map(fav => `
        <div class="setting-row">
          <div>
            <strong>${fav.title}</strong> <span class="status-pill status-default">${fav.datasetTitle}</span>
            <p class="subtext">${fav.subtitle}</p>
          </div>
          <button class="star-btn starred" data-remove-fav="${fav.id}">★</button>
        </div>
      `).join('')}
    </div>
  `;

  document.querySelectorAll('[data-remove-fav]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-remove-fav');
      state.favorites = state.favorites.filter(f => f.id !== id);
      localStorage.setItem('vfh_favorites', JSON.stringify(state.favorites));
      updateFavCount();
      renderView();
    });
  });

  document.getElementById('btn-clear-favs')?.addEventListener('click', () => {
    state.favorites = [];
    localStorage.setItem('vfh_favorites', JSON.stringify(state.favorites));
    updateFavCount();
    renderView();
  });
}

// ================= MODULE 15: PROFILE & LOGIN SCREEN =================
function renderLoginScreen(container) {
  container.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 60vh;">
      <div class="hero-card" style="width: 100%; max-width: 400px; padding: 32px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div class="hero-title">KV FLASH Portal Access</div>
          <div class="hero-subtitle" style="margin-top: 8px;">Authorized personnel only</div>
        </div>
        
        <div class="setting-row" style="display: flex; flex-direction: column; gap: 16px;">
          <div id="login-error-msg" style="color: #EF4444; font-size: 13px; font-weight: 600; text-align: center; display: none;"></div>
          
          <div style="width: 100%;">
            <label style="display: block; font-size: 12px; color: var(--text-secondary); margin-bottom: 6px; font-weight: 600;">Employee ID</label>
            <input type="text" id="login-emp-id" placeholder="e.g. KV0001" style="width: 100%; padding: 14px; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); outline: none; font-size: 15px;" />
          </div>
          
          <div style="width: 100%;">
            <label style="display: block; font-size: 12px; color: var(--text-secondary); margin-bottom: 6px; font-weight: 600;">Password / PIN</label>
            <input type="password" id="login-emp-pass" placeholder="Enter PIN" style="width: 100%; padding: 14px; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); outline: none; font-size: 15px;" />
          </div>
          
          <button class="btn btn-primary" id="btn-sign-in" style="width: 100%; padding: 16px; font-size: 15px; margin-top: 12px;">Secure Sign In</button>
        </div>
      </div>
    </div>
  `;
  
  document.getElementById('btn-sign-in').addEventListener('click', () => {
    const id = document.getElementById('login-emp-id').value.trim().toUpperCase();
    const pass = document.getElementById('login-emp-pass').value.trim();
    
    if (id === 'KV0001' && pass === '0007') {
      localStorage.setItem('vfh_auth_id', id);
      state.activeTab = 'dashboard';
      renderView();
    } else {
      const errMsg = document.getElementById('login-error-msg');
      errMsg.textContent = 'Invalid Employee ID or Password.';
      errMsg.style.display = 'block';
    }
  });
}

function renderProfileScreen(container) {
  const loggedInId = localStorage.getItem('vfh_auth_id');
  const empName = localStorage.getItem('vfh_emp_name') || 'Shubham';
  const initial = empName.charAt(0).toUpperCase() || 'S';
  
  container.innerHTML = `
    <div class="hero-card">
      <div>
        <div class="hero-title">Employee Profile</div>
        <div class="hero-subtitle">Authorized lending dashboard access</div>
      </div>
    </div>
    
    <div class="setting-row" style="display: flex; flex-direction: column; gap: 12px; margin-top: 16px;">
      <div style="width: 100%; display: flex; align-items: center; justify-content: space-between;">
        <div style="flex: 1;">
          <div style="font-size: 11px; color: var(--text-muted); font-weight: 600; letter-spacing: 1px;">EMPLOYEE NAME</div>
          <div style="display: flex; align-items: center; gap: 6px; margin-top: 4px;">
            <input type="text" id="profile-emp-name" value="${empName}" placeholder="Enter Name" style="font-size: 16px; color: var(--text-primary); font-weight: 700; background: transparent; border: none; border-bottom: 1px dashed var(--text-muted); outline: none; padding-bottom: 2px; width: 100%; max-width: 200px;" />
            <span style="font-size: 14px; color: var(--text-muted);" title="Edit Name">✎</span>
          </div>
        </div>
        <div id="profile-avatar" style="width: 40px; height: 40px; border-radius: 50%; background: rgba(212, 175, 55, 0.15); display: flex; align-items: center; justify-content: center; color: var(--gold-primary); font-weight: 700; font-size: 18px;">
          ${initial}
        </div>
      </div>
      
      <div style="width: 100%; border-top: 1px solid var(--border); padding-top: 12px;">
        <div style="font-size: 11px; color: var(--text-muted); font-weight: 600; letter-spacing: 1px;">EMPLOYEE CODE / ID</div>
        <div style="display: flex; align-items: center; gap: 6px; margin-top: 4px;">
          <input type="text" id="profile-emp-id" value="${loggedInId}" placeholder="Enter ID" style="font-size: 16px; color: var(--text-primary); font-weight: 700; background: transparent; border: none; border-bottom: 1px dashed var(--text-muted); outline: none; padding-bottom: 2px; width: 100%; max-width: 200px; text-transform: uppercase;" />
          <span style="font-size: 14px; color: var(--text-muted);" title="Edit ID">✎</span>
        </div>
      </div>
      
      <div style="width: 100%; border-top: 1px solid var(--border); padding-top: 12px;">
        <div style="font-size: 11px; color: var(--text-muted); font-weight: 600; letter-spacing: 1px;">ACCESS LEVEL</div>
        <div style="font-size: 14px; color: var(--text-secondary); font-weight: 600; margin-top: 4px;">
          <span class="status-pill status-default">Admin / Underwriter</span>
        </div>
      </div>
    </div>
    
    <button class="btn btn-danger" id="btn-sign-out" style="width: 100%; margin-top: 24px; padding: 14px;">Sign Out</button>
  `;
  
  // Auto-save name and update avatar
  document.getElementById('profile-emp-name').addEventListener('input', (e) => {
    const val = e.target.value.trim();
    if (val) {
      localStorage.setItem('vfh_emp_name', val);
      document.getElementById('profile-avatar').textContent = val.charAt(0).toUpperCase();
    }
  });

  // Auto-save ID
  document.getElementById('profile-emp-id').addEventListener('input', (e) => {
    const val = e.target.value.trim().toUpperCase();
    if (val) {
      localStorage.setItem('vfh_auth_id', val);
    }
  });
  
  document.getElementById('btn-sign-out').addEventListener('click', () => {
    localStorage.removeItem('vfh_auth_id');
    renderView();
  });
}

// ================= GLOBAL SEARCH ENGINE =================
function renderSearchResults(container) {
  const q = state.searchQuery.toLowerCase().trim();
  const filter = state.searchFilter;

  let allResults = [];

  Object.values(state.datasets).forEach(ds => {
    if (filter !== 'ALL' && ds.datasetId !== filter) return;

    if (ds.rows) {
      ds.rows.forEach(row => {
        const text = Object.values(row).join(' ').toLowerCase();
        if (text.includes(q)) {
          allResults.push({
            datasetId: ds.datasetId,
            datasetTitle: ds.title,
            primary: row.asset || row.modelName || row.model || row.parameter || row.docName || row.schemeName || row.name || row.product || 'Record',
            secondary: Object.entries(row).filter(([k]) => !['sNo', 'id'].includes(k)).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(' | '),
            row,
            schema: ds
          });
        }
      });
    }
  });

  if (allResults.length === 0) {
    container.innerHTML = `
      <div class="hero-card" style="text-align: center; justify-content: center;">
        <div>
          <div class="hero-title">No Matching Results</div>
          <div class="hero-subtitle">No records found matching "${state.searchQuery}". Try broader search keywords.</div>
        </div>
      </div>
    `;
    return;
  }

  // Group by Dataset
  const groups = {};
  allResults.forEach(item => {
    if (!groups[item.datasetTitle]) groups[item.datasetTitle] = [];
    groups[item.datasetTitle].push(item);
  });

  let html = `
    <div style="font-size: 13px; font-weight: 700; color: var(--gold-primary); margin-bottom: 8px;">
      Search Results (${allResults.length} matches found)
    </div>
  `;

  Object.entries(groups).forEach(([groupTitle, items]) => {
    html += `
      <div class="section-label" style="margin-top: 10px;">${groupTitle} (${items.length})</div>
      <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px;">
        ${items.map((item, idx) => `
          <div class="setting-row" style="cursor: pointer;" data-search-res-group="${groupTitle}" data-search-res-idx="${idx}">
            <div>
              <strong>${highlightMatch(item.primary, q)}</strong>
              <p class="subtext">${highlightMatch(item.secondary, q)}</p>
            </div>
            <span style="color: var(--gold-primary); font-size: 14px;">→</span>
          </div>
        `).join('')}
      </div>
    `;
  });

  container.innerHTML = html;

  // Click search result -> open detail sheet
  document.querySelectorAll('[data-search-res-group]').forEach(el => {
    el.addEventListener('click', () => {
      const g = el.getAttribute('data-search-res-group');
      const idx = el.getAttribute('data-search-res-idx');
      const item = groups[g][idx];
      openDetailSheet(item.schema, item.row);
    });
  });
}

function highlightMatch(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, 'gi');
  return String(text).replace(regex, `<mark style="background: var(--gold-container); color: var(--gold-primary); font-weight: bold; border-radius: 3px; padding: 0 2px;">$1</mark>`);
}

// ================= FAVORITES & DETAIL BOTTOM SHEET =================
function toggleFavorite(id, schema, row) {
  const idx = state.favorites.findIndex(f => f.id === id);
  if (idx >= 0) {
    state.favorites.splice(idx, 1);
  } else {
    const title = row.asset || row.modelName || row.model || row.parameter || row.docName || row.schemeName || row.name || 'Pinned Record';
    const subtitle = schema.columns.filter(c => !c.isPrimary).slice(0, 2).map(c => `${c.label}: ${row[c.key]}`).join(' • ');
    state.favorites.push({ id, datasetId: schema.datasetId, datasetTitle: schema.title, title, subtitle, row });
  }
  localStorage.setItem('vfh_favorites', JSON.stringify(state.favorites));
  updateFavCount();
  renderView();
}

function updateFavCount() {
  const bubble = document.getElementById('fav-count-bubble');
  if (state.favorites.length > 0) {
    bubble.style.display = 'flex';
    bubble.innerText = state.favorites.length;
  } else {
    bubble.style.display = 'none';
  }
}

function openDetailSheet(schema, row) {
  const overlay = document.getElementById('detail-sheet-overlay');
  const title = document.getElementById('sheet-title');
  const body = document.getElementById('sheet-body');

  title.innerText = `${schema.title}: ${row.asset || row.modelName || row.model || row.parameter || row.name || 'Record'}`;

  body.innerHTML = schema.columns.map(col => `
    <div class="detail-row">
      <span>${col.label}</span>
      <strong>${row[col.key] !== undefined ? row[col.key] : '-'}</strong>
    </div>
  `).join('');

  // Inject CV Funding & LTV Calculator for CV grids
  if (schema.datasetId === 'cv_grid' || schema.datasetId === 'bolero_pickup_grid') {
    body.innerHTML += `
      <div style="margin-top:20px; padding:15px; background:rgba(212, 175, 55, 0.05); border:1px solid rgba(212, 175, 55, 0.2); border-radius:12px;">
        <h4 style="color:#D4AF37; margin:0 0 15px 0; display:flex; align-items:center; gap:8px;">
          <span>🧮</span> CV Funding & LTV Calculator
        </h4>
        <div style="display:flex; flex-direction:column; gap:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <label style="color: var(--text-secondary); font-size:14px;">Asset Valuation (₹)</label>
            <input type="number" id="calc-valuation" placeholder="e.g. 500000" style="background: var(--bg); border: 1px solid var(--border); color: var(--text-primary); padding:8px 12px; border-radius:6px; width:140px; text-align:right;" />
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <label style="color: var(--text-secondary); font-size:14px;">Applicable LTV (%)</label>
            <input type="number" id="calc-ltv" value="85" style="background: var(--bg); border: 1px solid var(--border); color: var(--text-primary); padding:8px 12px; border-radius:6px; width:140px; text-align:right;" />
          </div>
          <div style="height:1px; background:#23283B; margin:5px 0;"></div>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <label style="color: var(--text-primary); font-weight:600;">Max Eligible Loan</label>
            <span id="calc-result" style="color:#10B981; font-weight:bold; font-size:18px;">₹ 0</span>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => {
      const valInput = document.getElementById('calc-valuation');
      const ltvInput = document.getElementById('calc-ltv');
      const resSpan = document.getElementById('calc-result');

      const calculate = () => {
        const v = parseFloat(valInput.value) || 0;
        const l = parseFloat(ltvInput.value) || 0;
        const result = (v * l) / 100;
        resSpan.innerText = '₹ ' + result.toLocaleString('en-IN', { maximumFractionDigits: 0 });
      };

      valInput.addEventListener('input', calculate);
      ltvInput.addEventListener('input', calculate);
    }, 100);
  }

  overlay.classList.add('active');

  // Copy details button
  document.getElementById('sheet-btn-copy').onclick = () => {
    const text = schema.columns.map(c => `${c.label}: ${row[c.key] || '-'}`).join('\n');
    navigator.clipboard.writeText(text);
    alert('Details copied to clipboard!');
  };

  // WhatsApp share button
  document.getElementById('sheet-btn-share').onclick = () => {
    const text = `📋 *${schema.title.toUpperCase()}*\n━━━━━━━━━━━━━━━━━━━━\n` +
      schema.columns.map(c => `• *${c.label}:* ${row[c.key] || '-'}`).join('\n') +
      `\n━━━━━━━━━━━━━━━━━━━━\nGenerated via KV FLASH`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };
}

// ================= INITIALIZATION & EVENT LISTENERS =================
document.addEventListener('DOMContentLoaded', () => {
  loadDatasets();

  // Tab switching
  document.getElementById('header-tabs').addEventListener('click', (e) => {
    const tabBtn = e.target.closest('.tab-item');
    if (tabBtn) {
      const newTab = tabBtn.getAttribute('data-tab');
      if (state.activeTab !== newTab) {
        state.history.push(newTab);
        state.activeTab = newTab;
      }
      state.searchQuery = '';
      document.getElementById('global-search-input').value = '';
      document.getElementById('btn-clear-search').style.display = 'none';
      renderView();
    }
  });

  // Profile Shortcut
  document.getElementById('btn-profile-shortcut')?.addEventListener('click', () => {
    state.activeTab = 'profile';
    state.searchQuery = '';
    document.getElementById('global-search-input').value = '';
    document.getElementById('btn-clear-search').style.display = 'none';
    renderView();
  });

  // Global Logout Shortcut
  document.getElementById('btn-logout-shortcut')?.addEventListener('click', () => {
    localStorage.removeItem('vfh_auth_id');
    state.activeTab = 'dashboard';
    state.history = ['dashboard'];
    renderView();
  });

  // Android Navigation Bar Listeners
  const screenOrder = ['contacts', 'dashboard', 'profile'];

  document.getElementById('nav-back')?.addEventListener('click', () => {
    if (state.activeTab === 'dashboard' || state.activeTab === 'profile') {
      state.activeTab = 'contacts';
      state.history.push('contacts');
    } else if (!screenOrder.includes(state.activeTab) && state.history.length > 1) {
      state.history.pop();
      state.activeTab = state.history[state.history.length - 1];
    }
    renderView();
  });

  document.getElementById('nav-home')?.addEventListener('click', () => {
    if (state.activeTab !== 'dashboard') {
      state.history.push('dashboard');
      state.activeTab = 'dashboard';
      renderView();
    }
  });

  document.getElementById('nav-recent')?.addEventListener('click', () => {
    if (state.activeTab !== 'profile') {
      state.history.push('profile');
      state.activeTab = 'profile';
      renderView();
    }
  });

  // Swipe to Slide Screens
  let touchStartX = 0;
  let touchEndX = 0;
  
  const mainContent = document.getElementById('main-content');
  if (mainContent) {
    mainContent.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    mainContent.addEventListener('touchend', e => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });
  }
  
  function handleSwipe() {
    const swipeThreshold = 50;
    if (touchEndX < touchStartX - swipeThreshold) {
      // Swiped Left
      let idx = screenOrder.indexOf(state.activeTab);
      if (idx !== -1 && idx < screenOrder.length - 1) {
        state.activeTab = screenOrder[idx + 1];
        state.history.push(state.activeTab);
        renderView();
      }
    }
    if (touchEndX > touchStartX + swipeThreshold) {
      // Swiped Right
      let idx = screenOrder.indexOf(state.activeTab);
      if (idx !== -1 && idx > 0) {
        state.activeTab = screenOrder[idx - 1];
        state.history.push(state.activeTab);
        renderView();
      } else if (idx === -1 && state.history.length > 1) {
        // Swiping right inside a tool acts like "Back"
        state.history.pop();
        state.activeTab = state.history[state.history.length - 1];
        renderView();
      }
    }
  }

  // Global Search Input (250ms debounced)
  let searchTimer;
  const searchInput = document.getElementById('global-search-input');
  const clearBtn = document.getElementById('btn-clear-search');

  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    const val = e.target.value;
    clearBtn.style.display = val.length > 0 ? 'block' : 'none';
    searchTimer = setTimeout(() => {
      state.searchQuery = val;
      renderView();
    }, 250);
  });

  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearBtn.style.display = 'none';
    state.searchQuery = '';
    renderView();
  });

  // Search Filter Chips
  document.getElementById('search-filter-chips').addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (chip) {
      document.querySelectorAll('#search-filter-chips .chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.searchFilter = chip.getAttribute('data-filter');
      renderView();
    }
  });

  // Shortcut to Favorites
  document.getElementById('btn-fav-shortcut').addEventListener('click', () => {
    state.activeTab = 'favorites';
    renderView();
  });

  // Modals & Bottom Sheets Close
  document.getElementById('sheet-btn-close').addEventListener('click', () => {
    document.getElementById('detail-sheet-overlay').classList.remove('active');
  });
  document.getElementById('detail-sheet-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'detail-sheet-overlay') {
      document.getElementById('detail-sheet-overlay').classList.remove('active');
    }
  });

  // Settings Modal
  const settingsModal = document.getElementById('settings-modal-overlay');
  document.getElementById('btn-settings').addEventListener('click', () => {
    settingsModal.classList.add('active');
  });
  document.getElementById('modal-btn-close').addEventListener('click', () => {
    settingsModal.classList.remove('active');
  });
  settingsModal.addEventListener('click', (e) => {
    if (e.target.id === 'settings-modal-overlay') settingsModal.classList.remove('active');
  });

  // Theme Toggle
  const applyTheme = (themeName) => {
    const validThemes = ['DARK', 'LIGHT', 'SAPPHIRE', 'CRIMSON', 'EMERALD', 'SAGE'];
    if (!validThemes.includes(themeName.toUpperCase())) {
      themeName = 'DARK';
    }
    
    document.body.className = 'theme-' + themeName.toLowerCase();
    
    validThemes.forEach(t => {
      const btn = document.getElementById('btn-theme-' + t.toLowerCase());
      if (btn) {
        if (t === themeName.toUpperCase()) btn.classList.add('active');
        else btn.classList.remove('active');
      }
    });
    localStorage.setItem('vfh_theme', themeName.toUpperCase());
  };

  applyTheme(state.theme || 'DARK');

  document.getElementById('btn-theme-dark')?.addEventListener('click', () => applyTheme('DARK'));
  document.getElementById('btn-theme-light')?.addEventListener('click', () => applyTheme('LIGHT'));
  document.getElementById('btn-theme-sapphire')?.addEventListener('click', () => applyTheme('SAPPHIRE'));
  document.getElementById('btn-theme-crimson')?.addEventListener('click', () => applyTheme('CRIMSON'));
  document.getElementById('btn-theme-emerald')?.addEventListener('click', () => applyTheme('EMERALD'));
  document.getElementById('btn-theme-sage')?.addEventListener('click', () => applyTheme('SAGE'));

  // Reset Data
  document.getElementById('btn-reset-data')?.addEventListener('click', () => {
    if (confirm('Reset all datasets back to default factory records?')) {
      localStorage.clear();
      loadFallbackDatasets();
      alert('Factory data restored successfully!');
      settingsModal.classList.remove('active');
      renderView();
    }
  });
});
