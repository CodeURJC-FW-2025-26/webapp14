
# webapp14
# SellOra
--------------------------------------------------------------------------
## Members:

| Name and Surnames | University Mail | Github Username |
|-----------|-----------|-----------|
| Nuria Amrani Villuendas   | n.amrani.2024@alumnos.urjc.es   | Nur1aURJC   |
| Rim Afoud  |  r.afoud.2024@alumnos.urjc.es | rimafd  |
| Ignacio Roncero Medina   | i.roncero.2024@alumnos.urjc.es   | NachoRonc   |


--------------------------------------------------------------------------
## Cordination Tools:

None in use for now.

--------------------------------------------------------------------------
## Functionality:

**Main entity:** Product: 
- Name
- Price
- Description
- Images

**Secondariy entity:** Review:
- Author
- Rating
- Date

**Images:** Only the main/primary entity will be able to be uploaded with images.


# Project - Part 3
## **Execution Instructions**

### **Prerequisites**
- **Node.js** (v25.0.0)
- **MongoDB** (8.2.1)

**1. Download the project**

`git clone <repository-url>`

`cd webapp14/SellOra`

**2. Install dependencies**

`npm install`

**3. Run the application**

`npm run watch`

**4. Open the website**

Open your browser at:

`http://localhost:3000`

## **File Description**

**/src**

- `app.js` – Main server entry point. Sets up Express, middleware, MongoDB connection, and loads routes.

- `router.js` – Handles all web routes:
  - Rendering pages: homepage, product detail, upload, edit
  - Infinite scroll  (`GET /loadmoreproducts`): Loads additional products dynamically with a 500ms delay and spinner effect
  - Search and category filtering
  - Image uploads and downloads via `multer`
  - Delegates database operations to `store.js`
  - **Product upload** (`GET /upload`, `POST /upload`): Allows users to create new products with image upload validation
  - **Product editing** (`GET /product/:id/edit`, `POST /product/:id/edit`): 
    - Enables editing of existing products
    - Supports image replacement and removal 
  - **Product deletion** (`DELETE /product/:id`): Removes products and their associated images


- `store.js` – Handles all database operations:
  - Connects to MongoDB and manages the `products` collection
  - CRUD operations: create, read, update, delete products
  - Filtering

- `load_data.js` – Functions for loading data from JSON or the database.
  - Reads product data from `/data/data.json`
  - Clears existing database and loads demo products


**/public**
- `css/` – Stylesheets used across the website.
- `img/` – All static images used in the web app (product photos, icons, etc.).
- `js/` – Client-side JavaScript for interactive features like infinite scroll, AJAX operations, and form validation
- `data/`
  - `data.json` – Example product data.
  - `images/` – Can be used for storing product images loaded from JSON.


**/views**
HTML templates rendered by the server:

- `partials/`
  - `header.html` – Reusable header section.
  - `footer.html` – Reusable footer section.
  -  `head.html` – Reusable head section.

- `SELLORA.html` – Homepage (displays products with infinite scroll, category filtering and search funcitonality)
- `upload.html` – Page for adding a new product (fields for title, description, price, category, and image)
- `detail.html` – Product detail page (full product information display, review section with add/edit/delete functionalities)
- `edit.html` – Product editing page (pre-filled form with existing product data, image preview)


#### Rim Afoud – 

**Tasks:**  
 - Implemented **infinite scroll** functionality for the homepage (created `/loadmoreproducts` in `router.js` with pagination support and dynamic product loading without page refresh)
- Added **loading spinner** visual feedback
- Developed **image removal feature** for product editing
  - Added checkbox option in `edit.html` to remove product images
  - Implemented server-side logic in `router.js` to handle image deletion
  - Automatically deletes image files from `/uploads` directory when removed

** Most significant commits:**  
1. [Commit 1][# Infinite scroll+loading spinner ](https://github.com/CodeURJC-FW-2025-26/webapp14/commit/48948b81507912d43768ce4e18cacb76843b90bc)
2. [Commit 2][# Image editing feature in edit page] (https://github.com/CodeURJC-FW-2025-26/webapp14/commit/d97f9a9f3580415253b19b93cd0f34ef676c86a7)
3. [Commit 3][# Image deletion feature in edit page] (https://github.com/CodeURJC-FW-2025-26/webapp14/commit/507e96c37673888587f9036c86adada5be1a91fd)
4. [Commit 4][#README file creation]()
5. [Commit 5][# new products in data file] ()



**Files with most participation:**  
- `router.js`
- `app.js` (public)
- `SELLORA.html` 
- `edit.html` 
- `detail.html` 
- `README.md` 

---

#### Ignacio Roncero Medina – 
**Tasks:**  

- 
**Most significant commits:**  


**Files with most participation:**  

---

#### Nuria Amrani Villuendas – 
**Tasks:**  


**Most significant commits:**  




**Files with most participation:**  









