
import { Router } from "express";
import * as handlers from "./apiHandlers";

const router = Router();

// Auth & Connection
router.get("/auth", handlers.connectionStatus);
router.post("/auth", handlers.setApiKeys);
router.post("/set-api-keys", handlers.setApiKeys);
router.get("/connection-status", handlers.connectionStatus);
router.get("/test-connection", handlers.handleTestConnection);

// Market & Data
router.get("/market", handlers.marketSnapshot);
router.get("/market-snapshot", handlers.marketSnapshot);
router.get("/balances", handlers.getBalances);

// Bot Control
router.post("/bot", handlers.botAction);
router.post("/start-bot", handlers.startBot);
router.post("/stop-bot", handlers.stopBot);

export { router };
