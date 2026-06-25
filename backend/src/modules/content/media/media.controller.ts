import { Request, Response } from "express";
import prisma from "../../../config/db";
import { sendSuccess, sendError } from "../../../utils/apiResponse";
import fs from "fs";
import path from "path";

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

    const { filename, mimetype, size } = req.file;
    const url = `/uploads/${filename}`;

    const media = await prisma.mediaLibrary.create({
      data: {
        filename,
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

    // Delete file from filesystem
    const filePath = path.join(__dirname, "../../../../../public", media.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.mediaLibrary.delete({
      where: { id: String(req.params.id) },
    });

    return sendSuccess(res, "Media deleted");
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};
