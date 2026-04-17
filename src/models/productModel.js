import Product from "./product.js";

//get all products
export const getAllProducts = () => Product.findAll();

//create a new product
export const createProduct = (productData) => Product.create(productData);

export default Product;