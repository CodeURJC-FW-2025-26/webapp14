// src/product.js
import { MongoClient, ObjectId } from "mongodb";
import path from "path";

export const UPLOADS_FOLDER = path.resolve("./uploads");

const client = new MongoClient("mongodb://localhost:27017");
await client.connect(); 

const db = client.db("shop");             
const productsCollection = db.collection("products"); 

export async function getProducts() {
    return await productsCollection.find().toArray();
}

export async function addProduct(product) {
    
    await productsCollection.insertOne(product);
}

export async function getProduct(id) {
    return await productsCollection.findOne({ _id: new ObjectId(id) });
}

export async function deleteProduct(id) {
    return await productsCollection.deleteOne({ _id: new ObjectId(id) });
}