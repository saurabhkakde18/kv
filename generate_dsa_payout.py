import json
import csv

payout_data = {
  "datasetId": "dsa_payout",
  "title": "DSA Payout Policy – Vehicle Finance",
  "category": "Payout",
  "version": 2,
  "lastUpdated": "2026-10-07",
  "description": "Kredit Venture Official DSA Used Car & Used CV Payout Policy Structure based on WIRR Slabs & Monthly Sourcing Volume.",
  "columns": [
    { "key": "product", "label": "Product Segment", "type": "badge", "isPrimary": True, "isSortable": True, "isFilterable": True, "widthDp": 120 },
    { "key": "wirrSlab", "label": "WIRR / IRR Slab", "type": "text", "isPrimary": True, "isSortable": True, "isFilterable": True, "widthDp": 160 },
    { "key": "payoutUnder20L", "label": "Monthly Vol < 20L", "type": "percentage", "isPrimary": False, "isSortable": True, "isFilterable": False, "widthDp": 140 },
    { "key": "payoutOver20L", "label": "Monthly Vol > 20L", "type": "percentage", "isPrimary": False, "isSortable": True, "isFilterable": False, "widthDp": 140 },
    { "key": "remarks", "label": "Product Coverage & Notes", "type": "text", "isPrimary": False, "isSortable": False, "isFilterable": True, "widthDp": 220 }
  ],
  "rows": [
    # --- Used Car Payout Slabs ---
    { "product": "Used Car", "wirrSlab": ">= 16.00% - <= 16.99%", "payoutUnder20L": "2.00%", "payoutOver20L": "2.25%", "remarks": "Private Car Refinance / Purchase" },
    { "product": "Used Car", "wirrSlab": ">= 17.00% - <= 17.99%", "payoutUnder20L": "2.50%", "payoutOver20L": "2.75%", "remarks": "Private Car Refinance / Purchase" },
    { "product": "Used Car", "wirrSlab": ">= 18.00% - <= 18.99%", "payoutUnder20L": "3.00%", "payoutOver20L": "3.25%", "remarks": "Private Car Refinance / Purchase" },
    { "product": "Used Car", "wirrSlab": ">= 19.00% - <= 19.99%", "payoutUnder20L": "3.25%", "payoutOver20L": "3.50%", "remarks": "Private Car Refinance / Purchase" },
    { "product": "Used Car", "wirrSlab": ">= 20.00% - <= 20.99%", "payoutUnder20L": "3.50%", "payoutOver20L": "3.75%", "remarks": "Private Car Refinance / Purchase" },
    { "product": "Used Car", "wirrSlab": ">= 21.00% - <= 21.99%", "payoutUnder20L": "3.75%", "payoutOver20L": "4.00%", "remarks": "Private Car Refinance / Purchase" },
    { "product": "Used Car", "wirrSlab": ">= 22.00%", "payoutUnder20L": "4.00%", "payoutOver20L": "4.25%", "remarks": "Private Car Refinance / Purchase" },

    # --- Used CV Payout Slabs ---
    { "product": "Used CV", "wirrSlab": ">= 16.00% - <= 17.99%", "payoutUnder20L": "1.50%", "payoutOver20L": "2.00%", "remarks": "SCV, LCV, ICV, Buses & Pickups" },
    { "product": "Used CV", "wirrSlab": ">= 18.00% - <= 18.99%", "payoutUnder20L": "2.00%", "payoutOver20L": "2.25%", "remarks": "SCV, LCV, ICV, Buses & Pickups" },
    { "product": "Used CV", "wirrSlab": ">= 19.00% - <= 19.99%", "payoutUnder20L": "2.50%", "payoutOver20L": "2.50%", "remarks": "SCV, LCV, ICV, Buses & Pickups" },
    { "product": "Used CV", "wirrSlab": ">= 20.00%", "payoutUnder20L": "3.00%", "payoutOver20L": "3.00%", "remarks": "SCV, LCV, ICV, Buses & Pickups" },

    # --- Special Exception: M&HCV & Construction Equipment ---
    { "product": "M&HCV & CE", "wirrSlab": "Flat Volume Rate", "payoutUnder20L": "1.25%", "payoutOver20L": "1.25%", "remarks": "Flat 1.25% on volume across all IRR slabs" }
  ],
  "sections": [
    {
      "title": "1. Payout Calculation & Release Guidelines",
      "summary": "Key operational rules governing monthly DSA commission disbursements:",
      "items": [
        "Disbursement Release Cycle: DSA payout will be released in the next month following the disbursement month.",
        "Taxation: All stated payout slabs are strictly excluding GST (GST to be added as applicable).",
        "IRR Calculation Base: Processing fees and Stamp duty charges should NOT be included in the WIRR / IRR calculation.",
        "M&HCV & CE Exception: Standard WIRR slabs do not apply to M&HCV and Construction Equipment. Flat payout is 1.25% on volume."
      ]
    },
    {
      "title": "2. Post-Disbursement Documentation (PDD) Norms",
      "summary": "Strict compliance rules for RC and Insurance hypothecation updation:",
      "items": [
        "PDD TAT: PDD documents must be updated within 60 days of loan disbursement date.",
        "Hold Penalty: If PDD is pending for > 90 days, all DSA payouts across all files will be stopped immediately until full PDD resolution.",
        "Mandatory PDD Documents: Registration Certificate (RC) and Insurance policy endorsed with Kredit Venture / JADS Services hypothecation."
      ]
    },
    {
      "title": "3. Loan Cancellation & Clawback Policy",
      "summary": "Rules for cancelled loan cases:",
      "items": [
        "In case of loan cancellation, if the payout has already been released, the full amount will be deducted / clawbacked from the DSA's next month payout."
      ]
    }
  ]
}

# Write to app assets
with open("app/src/main/assets/data/dsa_payout.json", "w", encoding="utf-8") as f:
    json.dump(payout_data, f, indent=2, ensure_ascii=False)

# Write to DSA Payout/
with open("DSA Payout/dsa_payout.json", "w", encoding="utf-8") as f:
    json.dump(payout_data, f, indent=2, ensure_ascii=False)

# Write CSV to DSA Payout/
with open("DSA Payout/dsa_payout.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["Product Segment", "WIRR / IRR Slab", "Monthly Vol < 20L", "Monthly Vol > 20L", "Product Coverage & Notes"])
    for r in payout_data["rows"]:
        writer.writerow([r["product"], r["wirrSlab"], r["payoutUnder20L"], r["payoutOver20L"], r["remarks"]])

print("Successfully exported dsa_payout.json and dsa_payout.csv")
