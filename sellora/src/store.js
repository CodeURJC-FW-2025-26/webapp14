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

export async function addReview(productId, review) {
    return await products.updateOne(
        { _id: new ObjectId(productId) },
        { $push: { reviews: review } }
    );
}

export async function deleteReview(productId, reviewId) {
    return await products.updateOne(
        { _id: new ObjectId(productId) },
        { $pull: { reviews: { _id: new ObjectId(reviewId) } } }
    );
}

export async function updateReview(productId, reviewId, updatedReview) {
    return await products.updateOne(
        { 
            _id: new ObjectId(productId),
            "reviews._id": new ObjectId(reviewId)
        },
        { 
            $set: {
                "reviews.$.author": updatedReview.author,
                "reviews.$.text": updatedReview.text,
                "reviews.$.rating": updatedReview.rating
            }
        }
    );
}

export async function getReview(productId, reviewId) {
    const product = await products.findOne(
        { _id: new ObjectId(productId) },
        { projection: { reviews: 1 } }
    );
    return product?.reviews?.find(r => r._id.toString() === reviewId) || null;
}


export function validateProduct(product) {
    const errors = [];

    if (!product.title || product.title.trim() === "") {
        errors.push("Title cannot be empty.");
    }

    if (product.title && !/^[A-Z]/.test(product.title)) {
        errors.push("Title must start with a capital letter.");
    }

    if (!product.price || product.price <= 0) {
        errors.push("Price must be greater than 0.");
    }

    if (!product.category || product.category.trim() === "") {
        errors.push("Category is required.");
    }

    const description = (product.text || "").trim();

    if (description.length === 0) {
        errors.push("Description is required.");
    } else if (description.length < 20) {
        errors.push("Description must be at least 20 characters long.");
    } else if (description.length > 500) {
        errors.push("Description cannot exceed 500 characters.");
    }

    return errors;
}

export async function existsProductWithTitle(title) {
    const products = await getProducts();
    return products.some(p => p.title.toLowerCase() === title.toLowerCase());
}