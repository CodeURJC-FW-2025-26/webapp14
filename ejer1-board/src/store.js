import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';

const router = express.Router();
export default router;

const client = new MongoClient('mongodb://localhost:27017');

await client.connect();

const db = client.db('store');
const products = db.collection('products');

export const UPLOADS_FOLDER = './uploads';

export async function addProduct(product) {

    return await products.insertOne(product);
}

export async function deleteProduct(id){

    return await products.findOneAndDelete({ _id: new ObjectId(id) });
}

export async function deleteProducts(){

    return await products.deleteMany();
}

export async function getProducts(){

    return await products.find().toArray();
}

export async function getProduct(id) {
    return await products.findOne({ _id: new ObjectId(id) });
}



export async function getProductsPaginated(page = 1, perPage = 6, searchTerm = '') {
    page = parseInt(page) || 1;
    perPage = parseInt(perPage) || 6;

    const skip = (page - 1) * perPage;

    // Construir query opcional para búsqueda
    const query = {};
    if (searchTerm) {
        query.title = { $regex: searchTerm, $options: 'i' }; // búsqueda insensible a mayúsculas
    }

    const total = await products.countDocuments(query);
    const items = await products.find(query).skip(skip).limit(perPage).toArray();

    const totalPages = Math.max(1, Math.ceil(total / perPage));

    return {
        products: items,  
        total,
        page,
        perPage,
        totalPages
    };
}
