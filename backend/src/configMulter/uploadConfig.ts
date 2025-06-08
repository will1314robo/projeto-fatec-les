import multer from "multer";

const storage = multer.memoryStorage(); 

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(file.originalname.toLowerCase().match(/\.[0-9a-z]+$/i)?.[0] || '');
    const mime = allowed.test(file.mimetype);
    cb(null, ext && mime);
  }
});

export default upload;