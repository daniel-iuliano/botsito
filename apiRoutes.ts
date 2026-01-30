
import { Router } from "express";
import * as handlers from "./apiHandlers";

const router = Router();

router.post("/set-api-keys", handlers.setApiKeys);
router.get("/test-connection", handlers.handleTestConnection);
router.get("/markets", handlers.listMarkets);
router.get("/balances", handlers.getBalances);

export { router };
