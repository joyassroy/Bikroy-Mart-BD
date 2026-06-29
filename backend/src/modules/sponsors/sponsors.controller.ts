import { Request, Response } from "express";
import prisma from "../../config/db";
import { sendSuccess, sendError } from "../../utils/apiResponse";

export const getSponsors = async (req: Request, res: Response) => {
  try {
    const sponsors = await prisma.sponsor.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    return sendSuccess(res, "Sponsors fetched", sponsors);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

export const getAllSponsors = async (req: Request, res: Response) => {
  try {
    const sponsors = await prisma.sponsor.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return sendSuccess(res, "Sponsors fetched", sponsors);
  } catch (error: any) {
    return sendError(res, error.message);
  }
};

export const createSponsor = async (req: Request, res: Response) => {
  try {
    const { name, website, sortOrder, isActive } = req.body;
    let logo = req.body.logo;

    if (req.file) {
      logo = req.file.path || req.file.filename;
    }

    if (!name || !logo) {
      return sendError(res, "Name and logo are required", 400);
    }

    const sponsor = await prisma.sponsor.create({
      data: {
        name,
        logo,
        website: website || null,
        sortOrder: parseInt(sortOrder) || 0,
        isActive: isActive === "true" || isActive === true,
      },
    });
    return sendSuccess(res, "Sponsor created", sponsor, 201);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const updateSponsor = async (req: Request, res: Response) => {
  try {
    const { name, website, sortOrder, isActive } = req.body;
    let logo = req.body.logo;

    if (req.file) {
      logo = req.file.path || req.file.filename;
    }

    const data: any = {};
    if (name !== undefined) data.name = name;
    if (logo !== undefined) data.logo = logo;
    if (website !== undefined) data.website = website;
    if (sortOrder !== undefined) data.sortOrder = parseInt(sortOrder);
    if (isActive !== undefined) data.isActive = isActive === "true" || isActive === true;

    const sponsor = await prisma.sponsor.update({
      where: { id: String(req.params.id) },
      data,
    });
    return sendSuccess(res, "Sponsor updated", sponsor);
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const deleteSponsor = async (req: Request, res: Response) => {
  try {
    await prisma.sponsor.delete({
      where: { id: String(req.params.id) },
    });
    return sendSuccess(res, "Sponsor deleted");
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};
