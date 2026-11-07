import { movieApi } from "./client.js";

export default function searchWithFetch(queryText, options) {
  return movieApi.search(queryText, false, options);
}
