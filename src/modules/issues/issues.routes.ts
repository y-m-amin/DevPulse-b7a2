import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import {
  createIssueController,
  deleteIssueController,
  getAllIssuesController,
  getSingleIssueController,
  updateIssueController
} from "./issues.controller";

const router = Router();

router.post("/", authMiddleware, createIssueController);

router.get("/", getAllIssuesController);
router.get("/:id", getSingleIssueController);

router.patch("/:id", authMiddleware, updateIssueController);

router.delete(
  "/:id",
  authMiddleware,
  requireRole("maintainer"), 
  deleteIssueController
);

export default router;