import multer from "multer";
import { uploadToCloudinary } from "../utils/cloudinary";

const storage = multer.memoryStorage();

const multerUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

const uploadToCloudinaryMiddleware = (folder: string = "bikroy-mart") => {
  return async (req: any, res: any, next: any) => {
    multerUpload.any()(req, res, async (err) => {
      if (err) return next(err);
      if (!req.files || req.files.length === 0) return next();

      try {
        for (const file of req.files) {
          const result = await uploadToCloudinary(file.buffer, folder);
          file.filename = result.url;
          file.path = result.url;
          (file as any).cloudinaryUrl = result.url;
          (file as any).cloudinaryPublicId = result.publicId;
        }
      } catch (uploadErr: any) {
        return res.status(500).json({ success: false, message: "Image upload failed: " + uploadErr.message });
      }
      next();
    });
  };
};

export const upload = {
  array: (fieldName: string, maxCount: number, folder: string = "bikroy-mart") => {
    return async (req: any, res: any, next: any) => {
      multerUpload.array(fieldName, maxCount)(req, res, async (err) => {
        if (err) return next(err);
        if (!req.files || req.files.length === 0) return next();

        try {
          for (const file of req.files) {
            const result = await uploadToCloudinary(file.buffer, folder);
            file.filename = result.url;
            file.path = result.url;
            (file as any).cloudinaryUrl = result.url;
            (file as any).cloudinaryPublicId = result.publicId;
          }
        } catch (uploadErr: any) {
          return res.status(500).json({ success: false, message: "Image upload failed: " + uploadErr.message });
        }
        next();
      });
    };
  },

  single: (fieldName: string, folder: string = "bikroy-mart") => {
    return async (req: any, res: any, next: any) => {
      multerUpload.single(fieldName)(req, res, async (err) => {
        if (err) return next(err);
        if (!req.file) return next();

        try {
          const result = await uploadToCloudinary(req.file.buffer, folder);
          req.file.filename = result.url;
          req.file.path = result.url;
          (req.file as any).cloudinaryUrl = result.url;
          (req.file as any).cloudinaryPublicId = result.publicId;
        } catch (uploadErr: any) {
          return res.status(500).json({ success: false, message: "Image upload failed: " + uploadErr.message });
        }
        next();
      });
    };
  },

  any: (folder: string = "bikroy-mart") => {
    return async (req: any, res: any, next: any) => {
      multerUpload.any()(req, res, async (err) => {
        if (err) return next(err);
        if (!req.files || req.files.length === 0) return next();

        try {
          for (const file of req.files) {
            const result = await uploadToCloudinary(file.buffer, folder);
            file.filename = result.url;
            file.path = result.url;
            (file as any).cloudinaryUrl = result.url;
            (file as any).cloudinaryPublicId = result.publicId;
          }
        } catch (uploadErr: any) {
          return res.status(500).json({ success: false, message: "Image upload failed: " + uploadErr.message });
        }
        next();
      });
    };
  },
};
