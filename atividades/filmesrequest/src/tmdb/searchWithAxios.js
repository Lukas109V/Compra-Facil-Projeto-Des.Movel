import { movieApi } from "./client.js";

export default function searchWithAxios(queryText, options) {
  return movieApi.search(queryText, true, options);
}
