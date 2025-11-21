import fs from 'node:fs/promises';
import path from 'node:path';
import { ObjectId } from 'mongodb';
import * as store from './store.js';

const DATA_FOLDER = './data';
const DATA_FILE = 'data.json';

const dataString = await fs.readFile(path.join(DATA_FOLDER, DATA_FILE), 'utf8');
let products = JSON.parse(dataString);

products = products.map(original => {
  const product = { ...original };

  if (!Array.isArray(product.reviews)) {
    product.reviews = [];
  }

  product.reviews = product.reviews.map(review => ({
    _id: new ObjectId(),
    author: review.author,
    text: review.text,
    rating: review.rating
  }));

  const priceStr = String(product.price ?? '').replace(/[^0-9.,]/g, '').replace(',', '.');
  const priceNum = parseFloat(priceStr);
  product.price = Number.isFinite(priceNum) ? priceNum : 0;

  if (typeof product.image !== 'string') {
    product.image = null;
  }

  return product;
});

await store.deleteProducts();

for (const product of products) {
  await store.addProduct(product, product.image);
}

console.log('Demo data loaded');
