import { getEnv } from "../helper/validator";

export const APP_URL = getEnv({
  name: "NEXT_PUBLIC_BASE_APP",
  value: process.env.NEXT_PUBLIC_BASE_APP,
});
export const APP_NAME = "QR Menu - Kravy";
