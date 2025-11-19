# webapp14
# SellOra
--------------------------------------------------------------------------
## Members:

| Name and Surnames | University Mail | Github Username |
|-----------|-----------|-----------|
| Nuria Amrani Villuendas   | n.amrani.2024@alumnos.urjc.es   | Nur1aURJC   |
| Rim Afoud  |  r.afoud.2024@alumnos.urjc.es | rimafd  |
| Ignacio Roncero Medina   | i.roncero.2024@alumnos.urjc.es   | NachoRonc   |


# Project - Part 2
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
  - Pagination, search, and category filtering
  - Image uploads and downloads via `multer`
  - Delegates database operations to `store.js`

- `store.js` – Handles all database operations:
  - Connects to MongoDB and manages the `products` collection
  - CRUD operations: create, read, update, delete products
  - Pagination and filtering

- `load_data.js` – Functions for loading data from JSON or the database.

- `product.js` – Handles product-related operations (finding, creating, updating…)


**/public**
- `css/` – Stylesheets used across the website.
- `img/` – All static images used in the web app (product photos, icons, etc.).
- `data/`
  - `data.json` – Example product data.
  - `images/` – Can be used for storing product images loaded from JSON.


**/views**
HTML templates rendered by the server:

- `partials/`
  - `header.html` – Reusable header section.
  - `footer.html` – Reusable footer section.

- `SELLORA.html` – Homepage.
- `upload.html` – Page for adding a new product.
- `detail.html` – Product detail page.
- `updated_product.html` – Confirmation page after editing a product.


## **Demonstration Video**

The video includes:

  - The main features of the web application
  - Navigation through the website
  - Product viewing, editing, and uploading

Video link: 

---------------------------------------
## **Members' participation**

#### Rim Afoud – Home page

**Tasks:**  
- Contributed to the router by adding/adjusting routes for products, reviews, and validations.  
- Added some helper functions and updates in `store.js` for product and review management.  
- Worked on `header` and `footer` partials for consistent site layout.  
- Implemented and improved the `SELLORA` homepage.  
- Enhanced the `error` page to handle form validation feedback properly.  

**5 most significant commits:**  
1. [Error pages](https://github.com/CodeURJC-FW-2025-26/webapp14/commit/74715debebc2e4daa622042acc50add2aaf2e798) – Implemented error pages for invalid inputs or missing products.  
2. [Pagination updates](https://github.com/CodeURJC-FW-2025-26/webapp14/commit/49a12fd3b5da2a02996773f214f99b333e55818e) – General fixes and improvements to router logic and template rendering.  
3. [Previous/next page](https://github.com/CodeURJC-FW-2025-26/webapp14/commit/f8507c86ebf63edb41d3f29a513a1b81c569752f) – Added pagination logic to product listings.  
4. [Search bar](https://github.com/CodeURJC-FW-2025-26/webapp14/commit/6ac9fbacea967afccfc6745de3d3e3af429f9cbb) – Implemented search functionality on the home page.




**Files with most participation:**  
- `views/SELLORA.ejs`  
- `views/partials/header.ejs`  
- `views/partials/footer.ejs`  
- `router.js`  
- `store.js`   

---

#### Ignacio Roncero Medina – Product Detail Page
**Tasks:**  

  
**5 most significant commits:**  


**Files with most participation:**  


---

#### Nuria Amrani Villuendas – Add New Product Page
**Tasks:**  


**5 most significant commits:**  



**Files with most participation:**  






----

