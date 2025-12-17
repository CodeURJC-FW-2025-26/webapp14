import { MongoClient, ObjectId } from 'mongodb';

export const UPLOADS_FOLDER = './uploads';

const client = new MongoClient('mongodb://localhost:27017');
await client.connect();

const db = client.db('store');
const products = db.collection('products');
// Ensure title is unique (case-insensitive) 
await products.createIndex({ title: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

export async function deleteProducts() {
  await products.deleteMany({});
}

export async function addProduct(product, imagePath) {
  const doc = {
    title: (product.title || '').trim(),
    text: (product.text || '').trim(),
    price: typeof product.price === 'number'
      ? product.price
      : Number(String(product.price).replace(/[^0-9.,]/g, '').replace(',', '.')),
    category: (product.category || '').trim(),
    image: imagePath || product.image || null,
    reviews: Array.isArray(product.reviews) ? product.reviews : []
  };

  const result = await products.insertOne(doc);
  return result.insertedId;
}

export async function getProduct(id) {
  return await products.findOne({ _id: new ObjectId(id) });
}

export async function deleteProduct(id) {
  const result = await products.findOneAndDelete({ _id: new ObjectId(id) });
  return result.value;
}

export async function updateProduct(id, updatedFields) {
  const set = {};

  if (updatedFields.title !== undefined) {
    set.title = (updatedFields.title || '').trim();
  }
  if (updatedFields.text !== undefined) {
    set.text = (updatedFields.text || '').trim();
  }
  if (updatedFields.price !== undefined) {
    const n = Number(
      String(updatedFields.price).replace(/[^0-9.,]/g, '').replace(',', '.')
    );
    set.price = n;
  }
  if (updatedFields.category !== undefined) {
    set.category = (updatedFields.category || '').trim();
  }
  if (updatedFields.image !== undefined) {
    set.image = updatedFields.image;
  }

  await products.updateOne(
    { _id: new ObjectId(id) },
    { $set: set }
  );
}

export async function getProductsPaginated(page = 1, limit = 6, searchTerm = '', category = '') {
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 6;

  const query = {};

  if (searchTerm) {
    query.title = { $regex: searchTerm, $options: 'i' };
  }

  if (category && category !== 'All') {
    query.category = category;
  }

  const total = await products.countDocuments(query);
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const skip = (currentPage - 1) * limit;

  const productsList = await products
    .find(query)
    .skip(skip)
    .limit(limit)
    .toArray();

  return {
    products: productsList,
    currentPage,
    totalPages
  };
}

export async function getAllProducts() {
  return await products.find().toArray();
}

export async function addReview(productId, review) {
  await products.updateOne(
    { _id: new ObjectId(productId) },
    { $push: { reviews: review } }
  );
}

export async function deleteReview(productId, reviewId) {
  const result = await products.updateOne(
    { _id: new ObjectId(productId) },
    { $pull: { reviews: { _id: new ObjectId(reviewId) } } }
  );
  return result;
}

export async function updateReview(productId, reviewId, updatedReview) {
  await products.updateOne(
    { _id: new ObjectId(productId), 'reviews._id': new ObjectId(reviewId) },
    {
      $set: {
        'reviews.$.author': updatedReview.author,
        'reviews.$.text': updatedReview.text,
        'reviews.$.rating': updatedReview.rating
      }
    }
  );
}

export async function getReview(productId, reviewId) {
  const product = await products.findOne(
    { _id: new ObjectId(productId) },
    { projection: { reviews: 1 } }
  );
  if (!product || !Array.isArray(product.reviews)) {
    return null;
  }
  const found = product.reviews.find(r => String(r._id) === String(reviewId));
  return found || null;
}

export function validateProduct(product) {
  const errors = [];

  const title = (product.title || '').trim();
  const text = (product.text || '').trim();
  const priceNumber = Number(
    typeof product.price === 'string'
      ? product.price.replace(/[^0-9.,]/g, '').replace(',', '.')
      : product.price
  );

  if (!title) {
    errors.push('Title is required.');
  } else if (title.length < 3) {
    errors.push('Title must have at least 3 characters.');
  } else if (title.length > 100) {
    errors.push('Title cannot exceed 100 characters.');
  }

  if (!text) {
    errors.push('Description is required.');
  } else if (text.length < 20) {
    errors.push('Description must be at least 20 characters long.');
  } else if (text.length > 500) {
    errors.push('Description cannot exceed 500 characters.');
  }

  if (!Number.isFinite(priceNumber) || priceNumber <= 0) {
    errors.push('Price must be greater than 0.');
  }

  if (!product.category || product.category.trim() === '') {
    errors.push('Category is required.');
  }

  return errors;
}

export async function existsProductWithTitle(title) {
  const t = (title || '').trim();
  if (!t) return false;
  const existing = await products.findOne({ title: t });
  return Boolean(existing);
}
