import { Router } from "express";
import { submitInquiry, getInquiries, updateInquiryStatus } from "../controllers/inquiryController";
import { requireAuth } from "../middleware/requireAuth";
import { requireAdmin } from "../middleware/requireAdmin";

const router = Router();

router.post("/contact", submitInquiry);
router.get("/admin/inquiries", requireAuth, requireAdmin, getInquiries);
router.put("/admin/inquiries/:id", requireAuth, requireAdmin, updateInquiryStatus);

export default router;
