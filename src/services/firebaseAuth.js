import { getAuth } from "firebase/auth";

export const createFirebaseAuth = (app) => getAuth(app);
