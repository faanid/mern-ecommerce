import mongoose from "mongoose";
import dotenv from "dotenv";
import users from "./data/users.js";
import products from "./data/products.js";
import User from "./modules/userModel.js";
import Product from "./modules/productModel.js";
import Order from "./modules/orderModel.js";
import connectDB from "./config/db.js";

dotenv.config();

const importData = async () => {
  await Order.deleteMany();
  await Product.deleteMany();
  await User.deleteMany();

  const createdUsers = await User.insertMany(users);
  const adminUser = createdUsers[0]._id;

  const sampleProducts = products.map((product) => ({
    ...product,
    user: adminUser,
  }));

  await Product.insertMany(sampleProducts);
  console.log("Data imported successfully.");
};

const destroyData = async () => {
  await Order.deleteMany();
  await Product.deleteMany();
  await User.deleteMany();

  console.log("Data destroyed successfully.");
};

const runSeeder = async () => {
  try {
    await connectDB();

    if (process.argv[2] === "-d") {
      await destroyData();
    } else {
      await importData();
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Seeder failed:", error);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
};

runSeeder();
