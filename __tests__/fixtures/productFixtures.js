export const testProduct = {
  name: "Test Product",
  description: "This is a test product",
  price: 99.99,
  category: "Test Category",
  stock: 10,
  image: "test-image.jpg",
};

export const updatedProduct = {
  name: "Updated Product",
  description: "This is an updated test product",
  price: 199.99,
  category: "Updated Category",
  stock: 20,
};

export const createTestProduct = async (Product, userId) => {
  const product = new Product({
    ...testProduct,
    image: "/uploads/products/test-image.jpg",
    createdBy: userId,
  });
  return await product.save();
};
