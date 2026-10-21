import { handlePremiumRequest } from "../../server/premium.mjs";
import { handleEraPagesRequest } from "../../server/era-pages.mjs";
import { handleArticleRequest } from "../../server/articles.mjs";
import { handleMemoriesRequest } from "../../server/memories.mjs";
export default (request, context) => {
  const path = new URL(request.url).pathname;
  if (path === "/api/memories") return handleMemoriesRequest(request, process.env, { clientId: context?.ip || "" });
  if (path === "/api/articles") return handleArticleRequest(request);
  if (path === "/api/era-pages") return handleEraPagesRequest(request);
  return handlePremiumRequest(request, process.env);
};
export const config = { path: "/api/*" };
