import { AppwriteException } from "node-appwrite";

export function appwriteMessage(error: unknown, fallback = "Appwrite request failed") {
  if (error instanceof AppwriteException) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}
