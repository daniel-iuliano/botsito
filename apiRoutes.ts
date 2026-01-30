
import { Router } from "express";
import * as handlers from "./apiHandlers";

const router = Router();

// Auth & Connection
router.post("/set-api-keys", handlers.setApiKeys);
router.get("/connection-status", handlers.connectionStatus);
router.get("/test-connection", handlers.handleTestConnection);

// Market & Data
router.get("/market-snapshot", handlers.marketSnapshot);
router.get("/balances", handlers.getBalances);

// Bot Control
router.post("/start-bot", handlers.startBot);
router.post("/stop-bot", handlers.stopBot);

export { router };
