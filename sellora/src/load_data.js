import fs from 'node:fs/promises';
import { ObjectId } from 'mongodb';
import * as store from './store.js';

const UPLOADS_FOLDER = './uploads';
const DATA_FOLDER = './data';
const dataFile = 'data.json';

const dataString = await fs.readFile(`${DATA_FOLDER}/${dataFile}`, 'utf8');
let products = JSON.parse(dataString);

products = products.map(product => {
    if (!Array.isArray(product.reviews)) {
        product.reviews = [];
    }
    product.reviews = product.reviews.map(review => ({
        _id: new ObjectId(),
        author: review.author,
        text: review.text,
        rating: review.rating
    }));
    return product;
});

await store.deleteProducts();

for (const product of products) {
    await store.addProduct(product);
}

await fs.rm(UPLOADS_FOLDER, { recursive: true, force: true });
await fs.mkdir(UPLOADS_FOLDER);
await fs.cp(`${DATA_FOLDER}/images`, UPLOADS_FOLDER, { recursive: true });

console.log('Demo data loaded with reviews');
