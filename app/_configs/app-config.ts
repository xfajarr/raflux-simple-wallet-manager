const appConfig = {
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  REOWN_PROJECT_ID: process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || "c1ebb1b522893c60f8ee58a02ffc43d6",
};

export default appConfig;

export function getAppOrigin(): string {
  return appConfig.APP_URL.replace(/\/$/, "");
}
