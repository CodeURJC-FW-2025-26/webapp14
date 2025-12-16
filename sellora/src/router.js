import express from 'express';
import multer from 'multer';
import fs from 'node:fs/promises';
import path from 'node:path';
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

  const productsWithImages = data.products.map(p => ({
    ...p,
    _id: p._id.toString(),
    image: p.image ? (p.image.startsWith('/') ? p.image : `/uploads/${p.image}`) : '/img/placeholder.png'
  }));

  res.render('SELLORA', {
    products: productsWithImages,
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
    
    const productsWithImages = data.products.map(p => ({
      ...p,
      _id: p._id.toString(),
      image: p.image ? (p.image.startsWith('/') ? p.image : `/uploads/${p.image}`) : '/img/placeholder.png'
    }));
    
    res.json({
        products: productsWithImages,
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
  const wantsJson =
    (req.headers.accept || '').includes('application/json') ||
    req.xhr ||
    req.headers['x-requested-with'] === 'XMLHttpRequest';

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
    if (wantsJson) {
      return res.status(400).json({ success: false, errors });
    }

    return res.status(400).render('error', {
      message: errors.join(' '),
      backUrl: '/upload'
    });
  }

  const insertedId = await store.addProduct(product, req.file.filename);
  const productId = insertedId.toString();

  if (wantsJson) {
    return res.json({
      success: true,
      redirectUrl: `/product/${productId}`
    });
  }

  res.redirect(`/product/${productId}`);
});



router.get('/product/:id', async (req, res) => {
  const id = req.params.id;
  const product = await store.getProduct(id);

  if (!product) {
    return res.status(404).render('deleted_product');
  }
  product._id = product._id.toString();

  if (product.reviews && Array.isArray(product.reviews)) {
    product.reviews = product.reviews.map(review => ({
      ...review,
      _id: review._id.toString() 
    }));
  }
  
  if (product.image && !product.image.startsWith('/')) {
    product.image = `/uploads/${product.image}`;
  } else if (!product.image) {
    product.image = '/img/placeholder.png';
  }

  res.render('detail', { product });
});

router.delete('/product/:id', async (req, res) => {
  try {
    const product = await store.deleteProduct(req.params.id);

    if (product && product.image) {
      try {
        await fs.rm(store.UPLOADS_FOLDER + '/' + product.image);
      } catch (err) {
        console.error("Error deleting image:", err);
      }
    }

    res.json({ success: true });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error deleting product on server" });
  }
});


router.get('/product/:id/image', async (req, res) => {
  const product = await store.getProduct(req.params.id);
  if (!product || !product.image) return res.sendStatus(404);

  res.sendFile(path.resolve(store.UPLOADS_FOLDER, product.image));
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

  if (product.image) {
    product.imageUrl = product.image.startsWith('/') ? product.image : `/uploads/${product.image}`;
  }

  res.render('edit', { product });
});

router.post('/product/:id/edit', upload.single('image'), async (req, res) => {
  const id = req.params.id;
  const existing = await store.getProduct(id);

  if (!existing) {
    return res.status(404).json({ success: false, errors: ['Product not found'] });
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
  const currentProductId = new ObjectId(id);
  const isDuplicate = allProducts.some(p => {
    // exclude the current product being edited
    const isSameProduct = p._id.equals(currentProductId);
    const hasSameTitle = p.title.trim().toLowerCase() === updatedFields.title.trim().toLowerCase();
    return !isSameProduct && hasSameTitle;
  });

  if (isDuplicate) {
    errors.push("A product with this title already exists.");
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  try {
    
    if (req.file) {
      updatedFields.image = req.file.filename;

      if (existing.image && !existing.image.startsWith('/')) {
        try {
          await fs.rm(store.UPLOADS_FOLDER + '/' + existing.image);
        } catch {}
      }
    } else if (req.body.removeImage === 'on') {
      updatedFields.image = null;
      
      if (existing.image && !existing.image.startsWith('/')) {
        try {
          await fs.rm(store.UPLOADS_FOLDER + '/' + existing.image);
        } catch {}
      }
    }
    

    await store.updateProduct(id, updatedFields);
    const updatedProduct = await store.getProduct(id); 

    const productForTemplate = {
      ...updatedProduct,
      _id: updatedProduct._id.toString(),
      title: updatedProduct.title,
      text: updatedProduct.text,
      price: updatedProduct.price,
      category: updatedProduct.category,
      image: updatedProduct.image ? (updatedProduct.image.startsWith('/') ? updatedProduct.image : `/uploads/${updatedProduct.image}`) : '/img/placeholder.png'
    };

    res.render('detail.html', { 
      product: productForTemplate,  
      backUrl: `/product/${id}/edit` 
    });

  } catch (err) {
    res.status(500).json({ success: false, errors: ['Error updating product.'] });
  }
});

router.post('/product/:id/reviews', async (req, res) => {
  const productId = req.params.id;

  const review = {
    _id: new ObjectId(),
    author: (req.body.author || '').trim(),
    text: (req.body.text || '').trim(),
    rating: req.body.rating,
  };

  const errors = [];
  if (!review.author) {
    errors.push("Author is required.");
  }
  if (!review.text || review.text.length < 1) {
    errors.push("Review text is required.");
  }
  if (!review.rating) {
    errors.push("Rating is required.");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false, 
      message: errors.join(' ') 
    });
  }

  try {
    await store.addReview(productId, review);
    
    res.json({ 
      success: true, 
      message: "Review added successfully",
      review: review 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error saving review" });
  }
});

router.post('/product/:id/reviews/:reviewId/edit', async (req, res) => {
  const { id, reviewId } = req.params;

  const updatedReview = {
    _id: new ObjectId(reviewId),
    author: (req.body.author || '').trim(),
    text: (req.body.text || '').trim(),
    rating: req.body.rating,
  };

  const errors = [];
  if (!updatedReview.author) {
    errors.push("Author is required.");
  }
  if (!updatedReview.text || updatedReview.text.length < 1) {
    errors.push("Review text is required.");
  }
  if (!updatedReview.rating) {
    errors.push("Rating is required.");
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      success: false, 
      message: errors.join(' ') 
    });
  }

  try {
    await store.updateReview(id, reviewId, updatedReview);
    
    res.json({ 
      success: true, 
      message: "Review updated successfully",
      review: updatedReview
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error updating review" });
  }
});

router.delete('/product/:id/reviews/:reviewId', async (req, res) => {
  const { id, reviewId } = req.params;

  try {
    await store.deleteReview(id, reviewId);
    
    res.json({ success: true, message: 'Review deleted successfully' });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error deleting review' });
  }
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

router.delete('/product/:id/reviews/:reviewId', async (req, res) => {
  const { id, reviewId } = req.params;
  try {
    await store.deleteReview(id, reviewId);
    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting review' });
  }
});