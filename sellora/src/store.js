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


export async function getProductsPaginated(page = 1, limit = 6, searchTerm = '',category = '') {
    page = parseInt(page) || 1;
    const skip = (page - 1) * limit;

    const currentPage = page;
    const query = {};
    if (searchTerm) {
        query.title = { $regex: searchTerm, $options: 'i' }; // búsqueda insensible a mayúsculas
    }

    if (category && category !== 'All') {
        query.category = category;
    }

     const productsList = await products.find(query)
        .skip(skip)
        .limit(limit)
        .toArray();
        
    const total = await products.countDocuments(query);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    return {
        products: productsList,  
        currentPage: page,
        totalPages
    };
}

export async function updateProduct(id, update) {
    return await products.updateOne(
        { _id: new ObjectId(id) },
        { $set: update }
    );
}
