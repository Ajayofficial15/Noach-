# NOACH Transport Services — Official Static Website

A professional, modern, fully responsive static website for **NOACH Transport Services**, a commercial fleet management and goods transportation business.

---

## 🎨 Color Palette & Branding
The visual theme is derived directly from the brand palette:

| Token | Hex Code | Swatch Description | Usage |
|---|---|---|---|
| `--noach-espresso` | `#3F2A24` | Deep Rich Espresso / Umber | Primary text, bold headers, dark hero accents, footer base |
| `--noach-chestnut` | `#7A5947` | Warm Chestnut / Terracotta Bronze | Primary call-to-action buttons ("Contact Us", "Submit"), key badges, brand highlights |
| `--noach-sand` | `#C2A692` | Warm Sand / Cashmere Taupe | Accent borders, subtitle text, icons, timeline track |
| `--noach-cream` | `#F2EADF` | Warm Alabaster / Cream | Card backgrounds, pill highlights, badge backgrounds |
| `--noach-mocha` | `#A88A72` | Earthy Mocha Bronze | Secondary icons, subtle borders, interactive hover states |

---

## 🌐 Website Architecture & Navigation

### 1. Page 1: Home
- **Brand Identity**: Features the custom NOACH Transport Services freight emblem and company wordmark.
- **Main Headline**: *"Your Transport. Our Responsibility."*
- **Supporting Text**: *"Reliable transportation solutions for businesses, warehouses, and supply chains."*
- **Hero Call-to-Action**: Single **“Contact Us”** button in warm chestnut (`#7A5947`), routing smoothly to the contact form.
- **Logistics Visuals**: High-resolution fleet and modern distribution warehouse imagery with layered warm tone gradients.
- **Introduction**: Comprehensive narrative explaining fleet supervision, vehicle readiness, and personalized route consultation.

### 2. Page 2: Our Services
Five dedicated service cards with custom icons, photography, capability checklists, and direct contact buttons:
1. **Fleet Management**
2. **Goods Transportation**
3. **Warehouse Deliveries**
4. **Business and Supplier Transportation**
5. **Vehicle Arrangement and Trip Coordination**

### 3. Page 3: How It Works
Explains the end-to-end journey in four clear, progressive steps:
1. Customer visits the website.
2. Customer submits a vehicle request / inquiry with contact and transport requirements.
3. NOACH receives the request and contacts the customer by phone or message to review availability and route pricing.
4. After confirming availability, pricing, and other details, the transportation arrangement is finalized.

### 4. Page 4: Request a Vehicle (Original Form)
- **Accessible Exclusively via the Navigation Bar** (`Request a Vehicle`).
- Preserves all original fields and interactive chip selectors:
  - Customer Full Name *
  - Mobile Number *
  - Company or Business Name (Optional)
  - Pickup Location *
  - Delivery Location *
  - Interactive Vehicle Chips & Dropdown (Open Truck, Container Truck, Mini Truck, Other / Help) *
  - Required Transportation Date (with today/future date restriction) *
  - Type of Goods (Optional)
  - Load Weight or Quantity (Optional)
  - Additional Requirements (Optional)
- Primary Button: **“Submit Vehicle Request”** (`#7A5947`).
- Sidebar: “What Happens Next?” & Operating Desk consultation box.

### 5. Page 5: Contact Us (Customer Contact Form)
- **Accessible via the Hero CTA Button and Navigation Bar** (`Contact Us`).
- Fields:
  - Full Name *
  - Phone Number *
  - Email Address *
  - Company / Organization (Optional)
  - Service of Interest (Optional dropdown)
  - Subject *
  - Message *
- Primary Button: **“Send Message”** (`#7A5947`).
- Sidebar: Direct Contact Details (Phone, Email, Office Address, Operating Hours).

---

## 📧 Email Notification Setup (Formspree)
Form submissions are configured to notify: **`noach.transportservice@gmail.com`**.

To receive live submission emails in your inbox:
1. Go to [https://formspree.io](https://formspree.io) and register a free account using **`noach.transportservice@gmail.com`**.
2. Click **+ New Form**, enter a name (e.g., "NOACH Enquiries"), and copy the provided Form ID (e.g., `mrbgqovz`).
3. Open `assets/js/form.js` and set:
   ```javascript
   const FORMSPREE_CONFIG = {
     contactEndpoint: 'https://formspree.io/f/YOUR_FORM_ID',
     vehicleEndpoint: 'https://formspree.io/f/YOUR_FORM_ID',
     notificationEmail: 'noach.transportservice@gmail.com'
   };
   ```
4. Submissions will automatically send complete formatted emails to your inbox.

---

## 📱 Mobile Responsiveness
The website is responsive down to 320px mobile screens:
- Mobile drawer navigation with toggle button.
- 2-column input grids collapse to single columns on phones.
- Vehicle chips arrange in a 2x2 touch-friendly grid.
- Touch target sizes meet the 44px minimum standard with zero horizontal scrolling.
