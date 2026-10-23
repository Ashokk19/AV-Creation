# AV Creation — Administrator & Catalogue Management Guide

Welcome to the **AV Creation** 3D Printing Studio Administration Guide. This document provides step-by-step instructions on setting up administrator access with Supabase, connecting your environment, and managing categories and products.

---

## Table of Contents
1. [Overview & Architecture](#1-overview--architecture)
2. [How to Setup Admin Login](#2-how-to-setup-admin-login)
   - [Step 1: Run the Database Schema](#step-1-run-the-database-schema)
   - [Step 2: Create a Supabase User](#step-2-create-a-supabase-user)
   - [Step 3: Grant Administrator Privileges](#step-3-grant-administrator-privileges)
   - [Step 4: Configure App Connection Keys](#step-4-configure-app-connection-keys)
   - [Step 5: Sign In to the Dashboard](#step-5-sign-in-to-the-dashboard)
3. [How to Add and Manage Categories](#3-how-to-add-and-manage-categories)
   - [Default Categories](#default-categories)
   - [Creating a New Category](#creating-a-new-category)
   - [Editing or Deleting Categories](#editing-or-deleting-categories)
4. [How to Add and Manage Products / Items](#4-how-to-add-and-manage-products--items)
   - [Adding a New Product](#adding-a-new-product)
   - [Product Pricing (INR ₹)](#product-pricing-inr-)
   - [Product Fields & Specifications](#product-fields--specifications)
   - [Uploading Images](#uploading-images)
   - [Status & Featured Showcase](#status--featured-showcase)
   - [Editing & Deleting Products](#editing--deleting-products)
5. [Customer Enquiries Management](#5-customer-enquiries-management)
   - [Viewing Enquiries](#viewing-enquiries)
   - [Status Lifecycle (New, In Progress, Completed)](#status-lifecycle)
   - [Internal Admin Notes](#internal-admin-notes)
   - [Direct WhatsApp & Contact Links](#direct-whatsapp--contact-links)
6. [Shopping Cart & WhatsApp Orders](#6-shopping-cart--whatsapp-orders)
   - [Cart Drawer Experience](#cart-drawer-experience)
   - [Unpriced Product Safeguards](#unpriced-product-safeguards)
   - [WhatsApp Order Generation](#whatsapp-order-generation)
   - [Business WhatsApp Configuration](#business-whatsapp-configuration)
7. [Database Migration (V2)](#7-database-migration-v2)
8. [Security & Role Architecture](#8-security--role-architecture)
9. [Troubleshooting & FAQs](#9-troubleshooting--faqs)

---

## 1. Overview & Architecture

The AV Creation catalogue is dynamically powered by **Supabase**:
- **Database (PostgreSQL):** Stores categories, products, technical specifications, customer custom-print enquiries, and administrator role assignments.
- **Authentication (Supabase Auth):** Handles secure email and password login.
- **Storage (Supabase Storage):**
  - `product-images` bucket: Stores high-resolution photos of 3D prints (public read, admin upload).
  - `enquiry-attachments` bucket: Stores customer reference files and images submitted via the custom print form (public upload, admin read/manage).
- **Row-Level Security (RLS):**
  - Public read access for active catalogue items.
  - Public insert access for customer custom print enquiries.
  - Strict admin-only access for viewing enquiries, modifying records, updating notes, and updating products/categories.

---

## 2. How to Setup Admin Login

### Step 1: Run the Database Schema
1. Open your project at [https://supabase.com/dashboard](https://supabase.com/dashboard).
2. In the left sidebar, click **SQL Editor** -> **New Query**.
3. Copy and paste the entire contents of the schema file located in this project at:
   ```
   /supabase/schema.sql
   ```
   *(You can also copy this directly from the "Supabase SQL Setup" tab in the Admin Dashboard).*
4. Click **Run**. This will create:
   - `categories` table (and automatically seed the 4 default categories: *Tea Lights*, *Clickers*, *Pokemon*, *Wall Decors*).
   - `products` table.
   - `admin_users` table with the `is_admin()` Security Definer function.
   - Row-Level Security policies.
   - The `product-images` storage bucket and access policies.

---

### Step 2: Create a Supabase User
1. In your Supabase Dashboard, navigate to **Authentication** -> **Users**.
2. Click **Add User** -> **Create User**.
3. Enter your administrator email (e.g., `admin@avcreation.com` or your personal email) and a secure password.
4. Set **Auto Confirm User?** to **ON** (so email verification is not required for immediate login).
5. Click **Create User**.
6. Copy the **User UID** (a string formatted like `e7b99c12-3456-7890-abcd-ef1234567890`).

---

### Step 3: Grant Administrator Privileges
In accordance with security requirements, an authenticated user is **not** an administrator by default. You must explicitly register the user in the `admin_users` table.

1. In your Supabase Dashboard, return to the **SQL Editor**.
2. Run either of the following SQL statements:

#### Option A: Grant Admin by User UID (Recommended)
```sql
INSERT INTO public.admin_users (id, email, role, notes)
VALUES (
  'PASTE_YOUR_COPIED_USER_UID_HERE',
  'your-admin-email@example.com',
  'admin',
  'Lead Studio Administrator'
)
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

#### Option B: Grant Admin by User Email
```sql
INSERT INTO public.admin_users (id, email, role, notes)
SELECT id, email, 'admin', 'Lead Studio Administrator'
FROM auth.users
WHERE email = 'your-admin-email@example.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

3. Click **Run**. Your user is now verified as an administrator!

---

### Step 4: Configure App Connection Keys
Provide your Supabase URL and Anon Public Key:

#### Method A: Via Environment Variables (Production & Local)
Add the following to your `.env` or project environment configuration:
```env
VITE_SUPABASE_URL=https://xyzcompany.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
*(Find these in your Supabase Dashboard under **Project Settings** -> **API**).*

#### Method B: Via the In-App Key Configurator
1. Navigate to `/admin/login` in your browser.
2. If the keys are not detected, a yellow banner will state *"Supabase Connection Needed"*.
3. Click **Configure Supabase Keys**.
4. Paste your **Project URL** and **Anon Key**, then click **Save & Connect**. Keys will be securely remembered.

---

### Step 5: Sign In to the Dashboard
1. Go to:
   ```
   https://<your-domain>/admin/login
   ```
   *(Or click the discreet "Admin Portal" link in the footer of the public site).*
2. Enter your administrator email and password.
3. Click **Authenticate & Enter Dashboard**.
4. You will be redirected to the protected `/admin` dashboard.

---

## 3. How to Add and Manage Categories

### Default Categories
The system automatically includes the four core studio collections:
- **Tea Lights** (`tea-lights`)
- **Clickers** (`clickers`)
- **Pokemon** (`pokemon`)
- **Wall Decors** (`wall-decors`)

These categories appear on the homepage and in the Collections view even when 0 products are currently loaded, presenting a polished empty state encouraging custom inquiries.

### Creating a New Category
1. In the Admin Dashboard, click the **Add Category** tab on the left sidebar.
2. Complete the fields:
   - **Category Name:** Enter the display title (e.g. `Mechanical Keycaps`, `Planters & Flora`, `Kinetic Sculptures`).
   - **URL Slug:** (Optional) Enter a kebab-case identifier (e.g. `mechanical-keycaps`). If left blank, it will be automatically generated from the name.
   - **Description:** (Optional) 1–2 sentences explaining the focus of this collection.
   - **Display Sort Order:** Integer (0, 1, 2...) controlling the sequence of category carousels on the Discovery page.
3. Click **Create Category**.
4. The category will instantly become available for product tagging and appear as a carousel row on the public website.

### Editing or Deleting Categories
- In the **Categories** tab, click **Edit** on any category card to update its name, slug, or sort order.
- **Safe Delete Protection:** You cannot delete a category if products are still assigned to it. To delete a category, first reassign or delete its associated products.

---

## 4. How to Add and Manage Products / Items

### Adding a New Product
1. In the Admin Dashboard, click **Add Product** on the left sidebar (or the **+ Add Product** button in the Products list).
2. Fill out the product details and technical specifications.
3. Click **Create Product**.

---

### Product Fields & Specifications

#### 1. Core Information
- **Product Title:** Distinctive editorial name (e.g., *Aura Lattice Luminaire*, *Gengar Shadow Luminary*, *Dual-Rotor Gyroid Clicker*).
- **Category:** Select which category this creation belongs to from the dropdown.
- **Price (INR ₹):** Product retail price in Indian Rupees (e.g., `350`, `1200`). Must be a positive numeric value or 0. Leave blank if the item is commissioned or quoted on demand — it will display as **"Price on request"** and customers will be guided to contact the studio for custom quoting.
- **Short Overview:** A 1-line hook displayed on preview cards and horizontal carousels (e.g. *Generative dual-layered Voronoi lamp diffusing warm ambient light.*).
- **Full Narrative Description:** In-depth description shown when a visitor clicks into the product detail modal. Explain the design inspiration, tactile qualities, and real-world usage.

#### 2. Product Image
- Click the image upload box or drag-and-drop a photo of your 3D print.
- **Accepted formats:** PNG, JPG, WEBP (up to 8MB).
- The file is automatically uploaded to the Supabase Storage bucket (`product-images`) and publicly served via CDN.
- If you don't upload an image immediately, the system displays a dynamic studio vector render until an image is provided.

#### 3. Technical 3D Printing Specifications
These specifications are prominently featured in the Netflix-style Product Detail Modal to highlight additive manufacturing craft:
- **Filament Material:** Select from `PLA+`, `PETG`, `Silk PLA`, `Carbon Fiber PETG`, `Engineering Resin`, or `ABS/ASA`.
- **Print Duration:** Estimated machine build time (e.g., `9.5 hours`).
- **Layer Resolution:** Layer height precision (e.g., `0.12 mm (Sub-fractional)`).
- **Infill Density:** Structural density and pattern (e.g., `18% Gyroid`).
- **Physical Dimensions:** Width × Depth × Height in mm (e.g., `140 × 140 × 190 mm`).
- **Weight / Filament Used:** In grams (e.g., `185g`).

#### 4. Available Color Finishes
Select or add color variants (e.g., *Matte Obsidian*, *Desert Ochre*, *Silk Gold*, *Translucent Amber*). Visitors can click these finishes in the product modal to preview color options.

---

### Status & Featured Showcase

- **Status (Active vs Draft):**
  - **Active:** The item is visible immediately across the public homepage, category carousels, search, and collections.
  - **Draft:** The item is saved in the database but hidden from public visitors. Use this while prints are still in prototyping or photography stages.
- **Featured Creation:**
  - Checking **"Feature this creation in Hero & Showcase"** marks the product for prime visibility.
  - The first active featured product is automatically spotlighted in the full-width cinematic hero section at the top of the homepage.

---

### Editing & Deleting Products
- In the **Products** tab, search or filter through your inventory.
- Click **Edit** to modify any details, swap the product image, or update pricing.
- Click **Delete** to permanently remove a product. A confirmation prompt prevents accidental deletion.

---

---

## 5. Customer Enquiries Management

When prospective clients submit custom 3D printing requests through the public **Custom Prints** technical estimator, submissions are stored in the `enquiries` table in Supabase.

### Accessing Enquiries
1. Log in to the Admin Dashboard at `/admin`.
2. Click **Customer Enquiries** in the left sidebar. The sidebar menu item displays a dynamic notification badge showing the number of unaddressed (`New`) enquiries.
3. Use the search bar to filter enquiries by customer name, email, or project title.
4. Filter by status using the quick filter pills: **All**, **New**, **In Progress**, or **Completed**.

### Enquiry Details & Lifecycle
Click **View Details** on any enquiry to open the dedicated inspection modal:
- **Contact Info:** Customer name, email, phone/WhatsApp number.
- **Project Specifications:** Category, quantity, dimensions, material preference, delivery timeline.
- **Reference Attachments:** If the customer uploaded a reference image or 3D model CAD file (via the `enquiry-attachments` bucket) or provided an external link (Thingiverse, Printables, etc.), click the link or preview to inspect the file.
- **Direct WhatsApp Chat:** Click the **WhatsApp Customer** button to open a direct chat with the customer with a pre-filled greeting.
- **Status Updating:** Toggle status between:
  - `New`: Newly submitted enquiry awaiting initial evaluation.
  - `In Progress`: Slicing, estimating, or printing in progress.
  - `Completed`: Delivered to customer or finished.
- **Internal Admin Notes:** Keep private workshop notes (e.g., slicing settings, machine used, material batch, quote given) that are only visible to administrators. Click **Save Notes** to persist.

---

## 6. Shopping Cart & WhatsApp Orders

AV Creations utilizes an additive-manufacturing tailored shopping experience integrated directly with WhatsApp order initiation:

### Cart Drawer Experience
- Visitors can add creations directly to their cart from product cards and from the Product Detail modal.
- The cart drawer slides in smoothly from the right, preserving the dark cinematic theme.
- Customers can adjust quantities with minimum 1 enforcement, view line totals, and remove items.
- The cart persists in browser `localStorage` across page reloads.

### Unpriced Product Safeguards
- If a product does not have a price configured in Supabase, the product card clearly displays **"Price on request"**.
- If a customer adds an unpriced product to their cart, checkout via WhatsApp is safely blocked and an alert banner lists the unpriced items requiring pricing before the order can be initiated.

### WhatsApp Order Generation
When the customer clicks **Order via WhatsApp**:
1. The cart items, quantities, unit prices, line subtotals, and overall order total are structured into a clean, professional order message:
   ```
   Hello AV Creations! I'd like to order:

   1. Lotus Lamp — Qty: 2 × ₹350 = ₹700
   2. Articulated Dragon — Qty: 1 × ₹500 = ₹500

   Total: ₹1,200

   Please confirm availability and delivery details.
   ```
2. The message is URL-encoded and opened via `https://wa.me/<NUMBER>?text=<MESSAGE>` in mobile or desktop browsers.
3. The cart is not erased merely because WhatsApp was opened, avoiding lost carts. An explicit customer action can clear the cart.

### Business WhatsApp Configuration
Set your business WhatsApp phone number in `.env`:
```env
VITE_WHATSAPP_NUMBER="919876543210"
```
The application automatically cleans spaces, `+`, and hyphens to generate valid WhatsApp international links.

---

## 7. Database Migration (V2)

If you are upgrading an existing Supabase project, execute the migration script located at:
```
/supabase/migration_v2.sql
```

This migration applies:
1. `price NUMERIC(10, 2)` column added to `products` (nullable for existing products, non-negative constraint).
2. `enquiries` table with customer details, project specifications, status enum check, reference links, and internal admin notes.
3. Automated `updated_at` trigger.
4. Strict Row-Level Security (RLS) on `enquiries` (public can `INSERT`, only admins can `SELECT`, `UPDATE`, `DELETE`).
5. `enquiry-attachments` storage bucket creation with public upload policies and admin-only management.

If you are setting up a brand new Supabase database, simply run `/supabase/schema.sql`, which contains the complete unified database setup.

---

## 8. Security & Role Architecture

The application enforces zero-trust role verification:

1. **Authentication Check:** The app checks whether a user has a valid Supabase Auth session token.
2. **Server-Verified Role Check (`admin_users` table):**
   - The user's `auth.uid()` is verified against `public.admin_users`.
   - Only users with `role = 'admin'` are granted access to the admin dashboard and mutative API actions.
3. **Row-Level Security (RLS):**
   - Database policies ensure that even if someone sends raw requests via the public anon key, write operations (`INSERT`, `UPDATE`, `DELETE`) are rejected unless the user passes `is_admin()`.
4. **Storage Policies:**
   - The `product-images` bucket allows public read access for fast image delivery, but restricts file uploads and deletions strictly to authenticated administrators.
   - The `enquiry-attachments` bucket allows public visitors to upload reference attachments for custom prints, but restricts reading and deleting attachments to administrators.

---

## 9. Troubleshooting & FAQs

### Q: I logged in with my Supabase email/password, but received "Access Denied: Administrator role required"?
**Cause:** Your user exists in Supabase Auth, but has not yet been registered in the `admin_users` table.  
**Fix:** Run this SQL query in your Supabase SQL Editor:
```sql
INSERT INTO public.admin_users (id, email, role, notes)
SELECT id, email, 'admin', 'Authorized via SQL'
FROM auth.users
WHERE email = 'your-login-email@example.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

### Q: Why does the public homepage say "Something exciting is taking shape"?
**Cause:** This is the intentional cinematic empty state. When no active products exist in the database, the site preserves its dark Netflix-inspired layout and all 4 category rows without displaying fictional placeholder products.  
**Fix:** Add at least one product with status set to **Active** in the Admin Dashboard.

### Q: How do I change which product appears in the top Hero section?
**Fix:** In the Admin Dashboard, edit your desired product and toggle **"Feature this creation in Hero & Showcase"** to ON.

### Q: What happens if an image fails to upload?
**Fix:** Ensure that you have run `/supabase/schema.sql`, which creates the `product-images` storage bucket and configures public read and admin upload policies. Verify that your file is under 8MB.

---

*AV Creation Studio — Additive Manufacturing & Computational Design*
