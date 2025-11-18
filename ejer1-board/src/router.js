import express from 'express';
import multer from 'multer';
import fs from 'node:fs/promises';
import { ObjectId } from 'mongodb';
import * as store from './store.js';

import { Console } from 'node:console';

const router = express.Router();
export default router;

const upload = multer({ dest: store.UPLOADS_FOLDER })



router.get('/', async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 6;

    const searchTerm = req.query.q || '';
    const category = req.query.category || '';


    const data = await store.getProductsPaginated(page,limit,searchTerm,category);

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
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        pages,
        hasPrevPage: currentPage > 1,
        hasNextPage: currentPage < totalPages,
        prevPage: Math.max(1, currentPage - 1),
        nextPage: Math.min(totalPages, currentPage + 1),
        searchTerm,
        category,
        categories ,

    title: "Welcome to SellOra",
    subtitle: "Your Favorite Retro Shop",
    tagline: "Vintage Consoles, Games & More",
    homeLink: "/",
    logoSrc: "/img/logo.png",
    navbarText: "- SellOra",
    navItems: [
        { label: "Home", link: "/", active: "active" },
       
    ]
    });
});


router.get('/upload', (req, res) => {
    res.render('upload');
});


router.post('/product/new', upload.single('image'), async (req, res) => {

    let product = {
        user: req.body.user,
        title: req.body.title,
        text: req.body.text,
        price: req.body.price,
        category: req.body.category,
        imageFilename: req.file?.filename
    };

    const result = await store.addProduct(product);
    res.render('saved_product', { _id: result.insertedId.toString() });

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

  router.post('/upload', upload.single('file'), async (req, res) => {
  const title = req.body.title;
  const text = req.body.text;
  const priceNumber = req.body.price;
  const category = req.body.category;

  const product = {
    title: title,
    text: text,
    price: priceNumber + '€',
    category: category,
    imageFilename: req.file.filename,           
    image: '/uploads/' + req.file.filename      
  };
  const result = await store.addProduct(product);
  res.redirect(`/product/${result.insertedId.toString()}`);
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
    user: req.body.user,
    title: req.body.title,
    text: req.body.text,
    price: req.body.price,
    category: req.body.category
  };

  try {
    if (req.file) {
      updatedFields.imageFilename = req.file.filename;

      if (existing.imageFilename) {
        try {
          await fs.rm(store.UPLOADS_FOLDER + '/' + existing.imageFilename);
        } catch (err) {
          console.warn('Couldnt save the last uploaded image.', err.message);
        }
      }
    } else {
    }

    await store.updateProduct(id, updatedFields);
    res.redirect(`/product/${id}`);


  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).send('Error updating product.');
  }
});