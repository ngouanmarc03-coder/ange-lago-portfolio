const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Stockage pour images (photos hero, actus, galerie, partenaires...)
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'ange-lago/images',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  },
});

// Stockage pour vidéos (hero vidéo, galerie vidéo)
const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'ange-lago/videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mov', 'webm'],
  },
});

// Stockage mixte (accepte image OU vidéo dans le même champ, ex: galerie)
const mixedStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith('video/');
    return {
      folder: isVideo ? 'ange-lago/videos' : 'ange-lago/images',
      resource_type: isVideo ? 'video' : 'image',
      allowed_formats: isVideo
        ? ['mp4', 'mov', 'webm']
        : ['jpg', 'jpeg', 'png', 'webp'],
    };
  },
});

const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

const uploadMixed = multer({
  storage: mixedStorage,
  limits: { fileSize: 100 * 1024 * 1024 },
});

module.exports = { cloudinary, uploadImage, uploadVideo, uploadMixed };
