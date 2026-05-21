import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { getInternalMetricsController } from "./metrics.controller";

const router = Router();

router.get(
  "/internal",
  authMiddleware,
  requireRole("maintainer"),
  getInternalMetricsController
);

export default router;