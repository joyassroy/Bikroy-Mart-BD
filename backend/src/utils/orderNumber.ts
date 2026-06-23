import { v4 as uuidv4 } from "uuid";

export const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = uuidv4().split("-")[0].toUpperCase();
  return `BM-${timestamp}-${random}`;
};

export const generateTransactionId = (): string => {
  return `TXN-${Date.now()}-${uuidv4().split("-")[0].toUpperCase()}`;
};
