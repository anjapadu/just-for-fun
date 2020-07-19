import express from "express";
import cheerio from "cheerio";
import multer from "multer";
import mime from "mime-types";
import { upload, parse, download, translate } from "../controllers/index.mjs";
const router = express.Router();

router.get("/parse/:url", parse);
router.get("/parse", parse);

router.get("/translate/:url", translate);
router.get("/translate", translate);

router.post(
  "/upload",
  multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 8 * 1024 * 1024,
    },
  }).single("file"),
  upload
);

router.get("/download/:identifier", download);

export default router;
