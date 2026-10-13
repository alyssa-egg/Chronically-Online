import { handlePremiumRequest } from "../../server/premium.mjs";
import { handleArticleRequest } from "../../server/articles.mjs";
export default (request) => new URL(request.url).pathname === "/api/articles" ? handleArticleRequest(request) : handlePremiumRequest(request, process.env);
export const config = { path: "/api/*" };
