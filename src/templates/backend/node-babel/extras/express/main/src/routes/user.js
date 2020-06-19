import { Router } from "express";

const router = Router();

router.route("/").get((req, res) => res.json({ message: "Hello Dear User" }));

export default router;
