require("dotenv").config();
const cloudinary = require("cloudinary").v2;

// Handle both v2/v3 and v4+ of multer-storage-cloudinary
const msc = require("multer-storage-cloudinary");
const CloudinaryStorage = msc.CloudinaryStorage || msc;

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.warn("Cloudinary env vars missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.");
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: "WanderLust_DEV",
    allowed_formats: ["jpg", "jpeg", "png"],
    resource_type: "image",
  }),
});

module.exports = { cloudinary, storage };