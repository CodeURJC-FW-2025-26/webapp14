import express from 'express';
import multer from 'multer';
import fs from 'node:fs/promises';
import { ObjectId } from 'mongodb';
import * as store from './store.js';

const router = express.Router();
export default router;

const upload = multer({ dest: store.UPLOADS_FOLDER });
const { validateProduct } = store; 

router.get('/', async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
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

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push({ number: i, active: i === currentPage });
  }

  res.render('SELLORA', {
    products: data.products || [],
    currentPage,
    totalPages,
    pages,
    hasPrevPage: currentPage > 1,
    hasNextPage: currentPage < totalPages,
    prevPage: Math.max(1, currentPage - 1),
    nextPage: Math.min(totalPages, currentPage + 1),
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

router.get('/upload', (req, res) => {
  res.render('upload', {
    errors: [],
    previous: {}
  });
});

router.post('/upload', upload.single('file'), async (req, res) => {
  const product = {
   title  : (req.body.title || '').trim(),
   text : (req.body.text || '').trim(),
   price : Number((req.body.price || '').trim()),
   category : (req.body.category || '').trim()
  };

  const errors = validateProduct(product);

  if (!req.file) errors.push("Image is required.");


if (errors.length > 0) {
    return res.status(400).render('error', {
      message: errors.join(' '),
      backUrl: `/upload`,
    });
  }
   
  product.imageFilename = req.file.filename;
  product.image = '/uploads/' + req.file.filename;
  product.price += '€';

  const result = await store.addProduct(product);
  res.render("uploaded_product", { productId: result.insertedId.toString() });
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
  let product = await store.deleteProduct(req.params.id);

  if (product && product.imageFilename) {
    await fs.rm(store.UPLOADS_FOLDER + '/' + product.imageFilename);
  }

  res.render('deleted_product');
});

router.get('/product/:id/image', async (req, res) => {
  let product = await store.getProduct(req.params.id);
  res.download(store.UPLOADS_FOLDER + '/' + product.imageFilename);
});

router.get('/product/:id/edit', async (req, res) => {
  const id = req.params.id;
  const product = await store.getProduct(id);

  if (!product) {
    return res.status(404).render('deleted_product');
  }

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

  const errors = validateProduct(updatedFields);

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
    return res.status(400).render('edit', {
      product: existing,
      errors: errors,
      previous: updatedFields
    });
  }

  try {
    if (req.file) {
      updatedFields.imageFilename = req.file.filename;

      if (existing.imageFilename) {
        try {
          await fs.rm(store.UPLOADS_FOLDER + '/' + existing.imageFilename);
        } catch (_) {}
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

    const review = {
        _id: new ObjectId(),
        author: req.body.author,
        text: req.body.text,
        rating: req.body.rating,
    };

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

