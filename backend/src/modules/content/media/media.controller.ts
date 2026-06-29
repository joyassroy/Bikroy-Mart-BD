import { Request, Response } from "express";
import prisma from "../../../config/db";
import { sendSuccess, sendError } from "../../../utils/apiResponse";
import { deleteFromCloudinary } from "../../../utils/cloudinary";

export const getMedia = async (req: Request, res: Response) => {
  try {
    const media = await prisma.mediaLibrary.findMany({
      orderBy: { createdAt: "desc" },
    });
    return sendSuccess(res, "Media fetched", media);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

export const uploadMedia = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return sendError(res, "No file uploaded", 400);
    }

    const { originalname, mimetype, size } = req.file;
    const url = req.file.path || req.file.filename;

    const media = await prisma.mediaLibrary.create({
      data: {
        filename: originalname,
        url,
        fileType: mimetype,
        size,
      },
    });

    return sendSuccess(res, "Media uploaded", media, 201);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const deleteMedia = async (req: Request, res: Response) => {
  try {
    const media = await prisma.mediaLibrary.findUnique({
      where: { id: String(req.params.id) },
    });

    if (!media) {
      return sendError(res, "Media not found", 404);
    }

    if (media.url && media.url.includes("cloudinary.com")) {
      const parts = media.url.split("/");
      const folderAndFile = parts.slice(parts.indexOf("upload") + 1).join("/");
      const publicId = folderAndFile.replace(/\.[^.]+$/, "");
      await deleteFromCloudinary(publicId);
    }

    await prisma.mediaLibrary.delete({
      where: { id: String(req.params.id) },
    });

    return sendSuccess(res, "Media deleted");
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};
