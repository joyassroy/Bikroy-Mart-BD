import { Request, Response } from "express";
import prisma from "../../../config/db";
import { sendSuccess, sendError } from "../../../utils/apiResponse";

export const getBlogs = async (req: Request, res: Response) => {
  try {
    const blogs = await prisma.blog.findMany({
      orderBy: { createdAt: "desc" },
    });
    return sendSuccess(res, "Blogs fetched", blogs);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

export const createBlog = async (req: Request, res: Response) => {
  try {
    const { title, content, author, isPublished } = req.body;
    let image = req.body.image;
    
    if (req.file) {
      image = req.file.path || req.file.filename;
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const blog = await prisma.blog.create({
      data: {
        title,
        slug,
        content,
        author,
        image,
        isPublished: isPublished === 'true' || isPublished === true,
      },
    });
    return sendSuccess(res, "Blog created", blog, 201);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const updateBlog = async (req: Request, res: Response) => {
  try {
    const { title, content, author, isPublished } = req.body;
    let image = req.body.image;
    
    if (req.file) {
      image = req.file.path || req.file.filename;
    }

    const updateData: any = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (author) updateData.author = author;
    if (image) updateData.image = image;
    if (isPublished !== undefined) updateData.isPublished = isPublished === 'true' || isPublished === true;

    const blog = await prisma.blog.update({
      where: { id: String(req.params.id) },
      data: updateData,
    });
    return sendSuccess(res, "Blog updated", blog);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const deleteBlog = async (req: Request, res: Response) => {
  try {
    await prisma.blog.delete({
      where: { id: String(req.params.id) },
    });
    return sendSuccess(res, "Blog deleted");
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};
