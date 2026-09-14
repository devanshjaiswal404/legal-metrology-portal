# ⚖️ National Legal Metrology Compliance Portal

> **Statutory Packaging Compliance & Enforcement System**  
> Under *The Legal Metrology Act, 2009* read with *The Legal Metrology (Packaged Commodities) Rules, 2011*  
> Ministry of Consumer Affairs, Food & Public Distribution • Government of India

---

## 📌 Overview

The **National Legal Metrology Compliance Portal** is an enterprise-grade statutory enforcement and automated inspection platform designed for Legal Metrology Officers (LMOs) and compliance auditors. It accelerates pre-packaged commodity label verification across physical retail packages and online e-commerce platforms.

---

## ✨ Key Features & Functional Modules

### 1. 📸 Physical Commodity Inspection (Live Scanner)
* **Real-time Optical Inspection:** Upload high-resolution commodity packaging artwork or capture live via camera.
* **Statutory Bounding Boxes:** Dynamic overlays mapped to detected declarations on the Principal Display Panel (PDP).
* **Two-Way Synchronized Inspection:** Click any detected label on the preview to focus the corresponding statutory rule card, and vice versa.
* **Calibrated Measurement Frame:** Custom calibration inputs for Package Width (cm) and Principal Display Panel (PDP Area in cm²) to calculate minimum required numeral and letter heights.

### 2. 🌐 E-Commerce Marketplace Audit (Rule 6(10))
* **Digital Listing Audits:** Audit product listings from Amazon, Blinkit, Flipkart, Zepto, etc. via URL input or screenshot.
* **Rule 6(10) Enforcement:** Enforces mandatory e-commerce declarations:
  - Total Maximum Retail Price (MRP) inclusive of all taxes.
  - Net Quantity in standard metric units (g, kg, ml, l).
  - Country of Origin (*Rule 6(1)(da)*).
  - Consumer Care Helpline & Grievance Redressal details (*Rule 6(1)(f)*).
  - Manufacturer / Packer / Importer credentials (*Rule 6(1)(a)*).
* **Exemption Handling:** Automatically accounts for statutory exemptions (e.g., month & year of manufacture exempt from digital display on e-commerce under Rule 6(10)).

### 3. 📋 Inspection Repository (Historical Ledger)
* **Search & Filter:** Search past inspections by commodity name, manufacturer, or memo reference.
* **Status Filtering:** Quickly filter between Compliant and Contravention dockets.
* **Case Dossier Modal:** Detailed view of each past audit with timestamps, inspector IDs, and rule findings.
* **Persistent Storage:** Stored locally in `localStorage` (`metrology_inspections`) with reactive badge count updates.

### 4. 📊 Enforcement Analytics Dashboard
* **Macro Metrics:** Real-time statistics on Total Seizures, Statutory Violations, Compliance Rate, and Inspections completed.
* **Violation Distribution:** Visual breakdown of contraventions by specific statutory clauses (MRP declarations, Net Quantity units, USP compliance, Country of Origin, Consumer Care).

### 5. 🇮🇳 Seamless Bilingual Engine (English & हिन्दी)
* **Native One-Click Language Switcher:** Instant toggle between English and Hindi across every module, button, statutory citation, and legal verdict without reloading the page.

### 6. 📄 Official Statutory Document Generators
* **Form V Inspection Notice (PDF):** One-click generation of the official Form V statutory notice formatted under Section 15 & 36 of The Legal Metrology Act, 2009. Includes officer stamp, reference memo number, prescribed font height, and legal findings table.
* **Audit Ledger (CSV):** Instant CSV spreadsheet export of commodity inspection findings for administrative archival.

---

## 🏛️ Statutory Rules Enforced

| Rule / Section | Statutory Provision | Enforcement Scope |
| :--- | :--- | :--- |
| **Rule 6(1)(a)** | Name & Complete Address of Manufacturer / Packer | Mandatory on PDP |
| **Rule 6(1)(c) & Rule 13** | Net Quantity in Standard Metric Units (g, kg, ml, l) | Mandatory metric symbols; non-standard units prohibited |
| **Rule 6(1)(d)** | Month & Year of Manufacture / Packing | Prescribed date format (MM/YYYY) |
| **Rule 6(1)(da)** | Country of Origin | Mandatory for imported and domestic goods |
| **Rule 6(1)(e)** | Maximum Retail Price (MRP) | Mandatory inclusive of all taxes clause |
| **Rule 6(1)(f)** | Consumer Care Details (Name, Address, Phone, Email) | Mandatory helpline for grievance redressal |
| **Rule 6(10)** | E-Commerce Digital Display Obligations | 2017 Amendment rules for digital marketplaces |
| **Rule 6(11)** | Unit Sale Price (USP) | Mandatory for commodities above 1 kg / 1 L |
| **Schedule II** | Maximum Permissible Error (MPE) | Tolerances on declared net quantity |

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** (v18 or higher)
* **npm** or **yarn**

### Installation & Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/devanshjaiswal404/legal-metrology-portal.git

# 2. Navigate to project directory
cd legal-metrology-portal

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

Visit **`http://localhost:5173`** in your web browser.

### Build for Production

```bash
# Generate optimized production build
npm run build

# Preview production build locally
npm run preview
```

---

## 🛠️ Tech Stack

* **Framework:** React 19
* **Build Tool:** Vite 8
* **Styling:** Tailwind CSS v4
* **Icons:** Lucide React
* **PDF Export:** jsPDF & jspdf-autotable
* **Code Quality & Linter:** Oxlint

---

## 📜 License

This project is open-source and intended for educational, statutory compliance, and demonstration purposes.
