import express from "express";
import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";
import { getUser } from "../utils.mjs";
if (process.env.NODE_ENV === "develop") {
  dotenv.config();
}
const router = express.Router();

router.get("/login/:username/:password", (req, res) => {
  const user = getUser(req.params.username, req.params.password);
  if (user) {
    return res.send({
      token: jsonwebtoken.sign(
        {
          user,
        },
        process.env.SECRET,
        {
          algorithm: "HS512",
          expiresIn: "24h",
        }
      ),
    });
  }
  res.status(400).send({
    error: "User or pass not correct",
  });
});

export default router;
