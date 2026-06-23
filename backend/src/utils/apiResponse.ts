import { Response } from "express";

interface ApiResponseData {
  success: boolean;
  message: string;
  data?: any;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const sendSuccess = (
  res: Response,
  message: string,
  data?: any,
  statusCode: number = 200,
  pagination?: ApiResponseData["pagination"]
) => {
  const response: ApiResponseData = {
    success: true,
    message,
  };
  if (data !== undefined) response.data = data;
  if (pagination) response.pagination = pagination;
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 500,
  errors?: any
) => {
  const response: ApiResponseData = {
    success: false,
    message,
  };
  if (errors) (response as any).errors = errors;
  return res.status(statusCode).json(response);
};
