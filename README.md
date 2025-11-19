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
https://youtu.be/NXUXLzrc36s
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
- Contributed to the router by adding/adjusting routes for products, reviews, and validations. 
- Added some helper functions and updates in `store.js` for product and review management.
- Improved the aesthetic of the edit page
- Implemented the reviews and their interactive functions
- Implemented interactive functions to products
- Made confirmation pages for the tasks he worked on
- overall aesthetics
- 
**5 most significant commits:**  
1. [Detail funcional](https://github.com/CodeURJC-FW-2025-26/webapp14/commit/47393b767a921b5bc7ac409763d2958964d528b0) - functional detail page, updated to work with db
2. [Delete product](https://github.com/CodeURJC-FW-2025-26/webapp14/commit/370e8d584d1e7436a3087119a6ac0ec838b3d316) - functional delete product function
3. [botones borrar y editar](https://github.com/CodeURJC-FW-2025-26/webapp14/commit/a976c70e8172ea2a76829942b8132aa0367d27ef) -functional update product function and revised delete function
4. [reviews funcionales](https://github.com/CodeURJC-FW-2025-26/webapp14/commit/fd9e88373736a26e4a2bd78d80abf89f835881f8)- functional review system

**Files with most participation:**  
- `router.js`  
- `store.js`
- `detail.html`
- `edit.html`
- `load_data.js`

---

#### Nuria Amrani Villuendas – Add New Product Page
**Tasks:**  
- Added form connection to data base.
- Added backend form validation for every field.
- Added validations if name already exists.

**5 most significant commits:**  
1. [Add Product](https://github.com/CodeURJC-FW-2025-26/webapp14/commit/3e2e9b246fbefbe3fa0de9e8083fa39d91d03ca8) – Implemented search functionality on the home page.
2. [Category fixes](https://github.com/CodeURJC-FW-2025-26/webapp14/commit/2cc11a47a7e0a678fb974ab48cd4ed59cad285b5) – Implemented search functionality on the home page.
3. [Redirect to Detail](https://github.com/CodeURJC-FW-2025-26/webapp14/commit/4ffc22d714fde6c1884f564b59a4acc4d5933dff) – Implemented search functionality on the home page.
4. [Validations](https://github.com/CodeURJC-FW-2025-26/webapp14/commit/c76215d3515943e79645b9d3a42ae6b5ba367d13) – Implemented search functionality on the home page.
5. [Form](https://github.com/CodeURJC-FW-2025-26/webapp14/commit/a761cb468644a23723ebca280f5c8dba267723b7) – Implemented search functionality on the home page.


**Files with most participation:**  






----

