
import express from "express";
import cors from "cors";
import { router } from "./apiRoutes";

const app = express();
// Add any cast to avoid type mismatches between different versions of express/connect types
app.use(cors() as any);
app.use(express.json() as any);
// Fix: Explicitly cast router to any to resolve "NextHandleFunction not assignable to PathParams" error
// This typically happens due to conflicting @types/express and @types/connect definitions
app.use("/api", router as any);

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
