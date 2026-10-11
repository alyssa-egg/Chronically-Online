import { handlePremiumRequest } from "../../server/premium.mjs";
export default (request) => handlePremiumRequest(request, process.env);
export const config = { path: "/api/*" };
