// src/product.js
import fs from 'fs/promises';
import path from 'path';

export const UPLOADS_FOLDER = path.resolve('./uploads');

let products = []; // tableau temporaire pour stocker les produits

export async function getProducts() {
    return products;
}

export async function addProduct(product) {
    products.push(product);
}

export async function getProduct(id) {
    return products.find(p => p.id === id);
}

export async function deleteProduct(id) {
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
        return products.splice(index, 1)[0];
    }
    return null;
}
