import bcrypt from "bcrypt";

export const testUser = {
  name: "Test User",
  email: "test@example.com",
  mobile: "1234567890",
  password: "Test@123",
  image: "test-image.jpg",
};

export const loginCredentials = {
  email: "test@example.com",
  password: "Test@123",
};

export const getHashedPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

export const createTestUser = async (User) => {
  const hashedPassword = await getHashedPassword(testUser.password);
  const user = new User({
    name: testUser.name,
    email: testUser.email,
    mobile: testUser.mobile,
    password: hashedPassword,
    is_verified: 1,
    image: "image/test-image.jpg",
  });
  return await user.save();
};
