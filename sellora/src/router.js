import express from 'express';
import multer from 'multer';
import fs from 'node:fs/promises';
import { ObjectId } from 'mongodb';
import * as store from './store.js';

import { setTimeout} from 'node:timers/promises';

const router = express.Router();
export default router;

const upload = multer({ dest: store.UPLOADS_FOLDER });



router.get('/', async (req, res) => {
  const page = 1;
  const limit = 6;

  const searchTerm = req.query.q || '';
  const category = req.query.category || '';

  const data = await store.getProductsPaginated(page, limit, searchTerm, category);

  const currentPage = data.currentPage;
  const totalPages = data.totalPages;

  const allCategories = ['All', 'Consoles', 'Videogames', 'Esports', 'Comics', 'Merch'];

  const categories = allCategories.map(cat => ({
    name: cat,
    isActive: Boolean(category === cat) || (category === '' && cat === 'All')
  }));


  res.render('SELLORA', {
    products: data.products || [],
    currentPage,
    totalPages,
    hasMore : currentPage< totalPages,
    searchTerm,
    category,
    categories,
    title: "Welcome to SellOra",
    subtitle: "Your Favorite Retro Shop",
    tagline: "Vintage Consoles, Games & More",
    homeLink: "/",
    logoSrc: "/img/logo.png",
    navbarText: "- SellOra",
    navItems: [
      { label: "Home", link: "/", active: "active" }
    ]
  });
});



router.get('/loadmoreproducts', async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 6;

    const searchTerm = req.query.q || '';
    const category = req.query.category || '';
    
    await setTimeout(500);

    const data = await store.getProductsPaginated(page, limit, searchTerm, category);
    
    res.json({
        products: data.products || [],
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        hasMore: data.currentPage < data.totalPages
    });
});


router.get('/upload', (req, res) => {
  res.render('upload', {
    errors: [],
    previous: {}
  });
});

router.post('/upload', upload.single('file'), async (req, res) => {
  const product = {
    title: (req.body.title || '').trim(),
    text: (req.body.text || '').trim(),
    price: Number((req.body.price || '').trim()),
    category: (req.body.category || '').trim()
  };

  const errors = store.validateProduct(product);

  if (!req.file) {
    errors.push("Image is required.");
  }

  if (await store.existsProductWithTitle(product.title)) {
    errors.push("A product with that title already exists.");
  }

  if (errors.length > 0) {
    return res.status(400).render('error', {
      message: errors.join(' '),
      backUrl: '/upload'
    });
  }

  await store.addProduct(product, req.file.filename);

  res.redirect('/');
});

router.get('/product/:id', async (req, res) => {
  const id = req.params.id;
  const product = await store.getProduct(id);

  if (!product) {
    return res.status(404).render('deleted_product');
  }

  res.render('detail', { product });
});

router.get('/product/:id/delete', async (req, res) => {
  const product = await store.deleteProduct(req.params.id);

  if (product && product.imageFilename) {
    await fs.rm(store.UPLOADS_FOLDER + '/' + product.imageFilename);
  }

  res.render('deleted_product');
});

router.get('/product/:id/image', async (req, res) => {
  const product = await store.getProduct(req.params.id);
  res.download(store.UPLOADS_FOLDER + '/' + product.imageFilename);
});

router.get('/product/:id/edit', async (req, res) => {
  const id = req.params.id;
  const product = await store.getProduct(id);

  if (!product) {
    return res.status(404).render('deleted_product');
  }

  product.category_Consoles   = product.category === "Consoles";
  product.category_Videogames = product.category === "Videogames";
  product.category_Esports    = product.category === "Esports";
  product.category_Comics     = product.category === "Comics";
  product.category_Merch      = product.category === "Merch";

  res.render('edit', { product });
});

router.post('/product/:id/edit', upload.single('image'), async (req, res) => {
  const id = req.params.id;
  const existing = await store.getProduct(id);

  if (!existing) {
    return res.status(404).render('deleted_product');
  }

  const updatedFields = {
    title: (req.body.title || '').trim(),
    text: (req.body.text || '').trim(),
    price: (req.body.price || '').trim(),
    category: (req.body.category || '').trim()
  };

  const errors = store.validateProduct(updatedFields);

  if (!updatedFields.title) {
    errors.push("Title cannot be empty.");
  }

  const allProducts = await store.getAllProducts();
  const isDuplicate = allProducts.some(p => 
    p._id.toString() !== id && 
    p.title.toLowerCase() === updatedFields.title.toLowerCase()
  );

  if (isDuplicate) {
    errors.push("A product with this title already exists.");
  }

  if (errors.length > 0) {
    return res.status(400).render('error', {
      message: errors.join(' '),
      backUrl: `/product/${id}/edit`
    });
  }

  try {
    if (req.file) {
      updatedFields.imageFilename = req.file.filename;

      if (existing.imageFilename) {
        try {
          await fs.rm(store.UPLOADS_FOLDER + '/' + existing.imageFilename);
        } catch {}
      }
    }

    await store.updateProduct(id, updatedFields);
    res.render('updated_product', { productId: id });
  } catch (err) {
    res.status(500).render('error', { message: 'Error updating product.' });
  }
});

router.post('/product/:id/reviews', async (req, res) => {
  const productId = req.params.id;

  // 1. Crear el objeto de la reseña con los datos del body
  const review = {
    _id: new ObjectId(),
    author: req.body.author,
    text: req.body.text,
    rating: req.body.rating
  };

  const errors = [];
  if (!review.author || review.author.trim() === '') {
    errors.push("Author is required.");
  }
  if (!review.text || review.text.trim().length < 1) {
    errors.push("Review text is required.");
  }
  if (!review.rating || review.rating.trim() === '') {
    errors.push("Rating is required.");
  }

  if (errors.length > 0) {
    return res.status(400).render('error', {
      message: errors.join(' '),
      backUrl: `/product/${productId}` 
    });
  }

  await store.addReview(productId, review);

  res.render("review_confirm", {
    message: "Your review has been submitted successfully!",
    productId
  });
});

router.post('/product/:id/reviews/:reviewId/edit', async (req, res) => {
  const { id, reviewId } = req.params;

  const updatedReview = {
    author: req.body.author,
    text: req.body.text,
    rating: req.body.rating
  };

  const errors = [];
  if (!updatedReview.author || updatedReview.author.trim() === '') {
    errors.push("Author is required.");
  }
  if (!updatedReview.text || updatedReview.text.trim().length < 1) {
    errors.push("Review text is required.");
  }
  if (!updatedReview.rating || updatedReview.rating.trim() === '') {
    errors.push("Rating is required.");
  }

  if (errors.length > 0) {
    return res.status(400).render('error', {
      message: errors.join(' '),
      backUrl: `/product/${id}/reviews/${reviewId}/edit`
    });
  }

  await store.updateReview(id, reviewId, updatedReview);

  res.render("review_confirm", {
    message: "Your review has been updated!",
    productId: id
  });
});

router.get('/product/:id/reviews/:reviewId/delete', async (req, res) => {
  const { id, reviewId } = req.params;

  await store.deleteReview(id, reviewId);

  res.render("review_confirm", { 
    message: "The review has been deleted.",
    productId: id 
  });
});

router.get('/product/:id/reviews/:reviewId/edit', async (req, res) => {
  const { id, reviewId } = req.params;

  const review = await store.getReview(id, reviewId);

  if (!review) {
    return res.status(404).render('review_confirm', {
      message: 'Review not found',
      productId: id
    });
  }

  res.render('edit_review', { review, productId: id });
});
