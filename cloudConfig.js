const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const uploadFolder =
  process.env.NODE_ENV === "production" ? "WanderPG_PROD" : "WanderPG_DEV";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: uploadFolder,
    allowed_formats: ["png", "jpg", "jpeg", "webp"],
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  },
});

module.exports = {
  cloudinary,
  storage,
};
