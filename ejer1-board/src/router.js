import express from 'express';
import multer from 'multer';
import fs from 'node:fs/promises';
import { ObjectId } from 'mongodb';

import * as store from './store.js';

const router = express.Router();
export default router;

const upload = multer({ dest: store.UPLOADS_FOLDER })
router.get('/upload', (req, res) => {
    res.render('upload');
});





router.get('/', async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 6;
    const searchTerm = req.query.q || '';


    const data = await store.getProductsPaginated(page,limit,searchTerm);

    if (searchTerm && data.total === 1) {
        return res.redirect(`/product/${data.products[0]._id}`);
    }

    const currentPage = data.currentPage || page;
    const totalPages = data.totalPages || 1;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        pages.push({ number: i, isCurrent: i === currentPage });
    }

    res.render('SELLORA', {
        products: data.products || [],
        total,
        currentPage,
        totalPages,
        pages,
        hasPrevPage: currentPage > 1,
        hasNextPage: currentPage < totalPages,
        prevPage: Math.max(1, currentPage - 1),
        nextPage: Math.min(totalPages, currentPage + 1),
        searchTerm
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

    const product = {
        title: title,
        text: text,
        price: priceNumber + '€',                  
    };


    if (req.file) {
        product.image = '/uploads/' + req.file.filename;
    }
    await store.addProduct(product);
    res.redirect('/');
});

router.get('/product/:id/image', async (req, res) => {

    let product = await store.getProduct(req.params.id);

    res.download(store.UPLOADS_FOLDER + '/' + product.imageFilename);

});





