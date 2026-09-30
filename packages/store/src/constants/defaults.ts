export const PAGE_SIZE = 10;
export const AFTER_API_TIME = 1000;
export const ViewModalBorderRadius = 2;

export const getApiUrl = (base: string) => {
  const env = process.env.REACT_APP_ENV;
  console.log("API ENV:", env);
  if (env === "prod") {
    return `https://api.bx.constrogen.com/${base}`;
  } else {
    return `http://localhost:8000/${base}`;
  }
};
