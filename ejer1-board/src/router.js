import express from 'express';
import multer from 'multer';
import fs from 'node:fs/promises';
import { ObjectId } from 'mongodb';

import * as store from './store.js';

const router = express.Router();
export default router;

const upload = multer({ dest: store.UPLOADS_FOLDER })

router.get('/', async (req, res) => {

    let products = await store.getProducts();

    res.render('SELLORA', { products });
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
    try {
        let product = await store.getProduct(req.params.id);
        res.render('detail', { product });
    } catch (error) {
        res.status(404).render('error', { message: 'Product not found' });
    }
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