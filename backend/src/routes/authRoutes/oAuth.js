import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import authenticateToken from "../../middlewares/authenticateToken.js";
import { getUserData } from "../../controllers/auth/googleOAuth.js";

const router = express.Router();

// Route to initiate Facebook login
router.get("/google", passport.authenticate('google', { scope: ['profile','email']}));

// Callback route that Facebook will redirect to after successful login
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/failed" }),
  (req, res) => {
    console.log(req?.user)
    if (req.user) {
      const token = jwt.sign(
        { id: req.user._id, email: req.user.email },
        process.env.JWT_SECRET, // Use a strong secret key
        { expiresIn: "1m" } // Set token expiration
      );

      res.redirect(
       `${process.env.FRONTEND_URL}?token=${token}`
      );
    } else {
      res.redirect(`${process.env.FRONTEND_URL}/failedAuth`);
    }
  }
);

router.get("/google/userData",authenticateToken,getUserData)


export const OAuth= router