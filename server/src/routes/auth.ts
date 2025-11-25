import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import User from "../models/User";
import Verification from "../models/Verification";

const router = Router();

// --- EMAIL STYLING ---
const STYLE = {
  container: `font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb;`,
  header: `background-color: #1c1917; padding: 40px 20px; text-align: center;`,
  logo: `color: #ffffff; font-family: 'Georgia', serif; font-size: 24px; letter-spacing: 3px; text-transform: uppercase; margin: 0;`,
  subLogo: `color: #a8a29e; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; margin-top: 5px; display: block;`,
  body: `padding: 40px 30px; color: #44403c; line-height: 1.6;`,
  h2: `font-family: 'Georgia', serif; color: #1c1917; font-size: 20px; margin-top: 0;`,
  codeBox: `background-color: #fafaf9; border: 1px dashed #d6d3d1; padding: 25px; text-align: center; margin: 30px 0;`,
  code: `font-family: monospace; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1c1917; display: block;`,
  label: `font-size: 11px; color: #78716c; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 10px;`,
  footer: `background-color: #f5f5f4; padding: 20px 30px; font-size: 12px; color: #57534e; border-top: 1px solid #e7e5e4;`,
  policyList: `margin: 10px 0 0 0; padding-left: 20px; color: #57534e;`,
};

// --- 1. STANDARD USER VERIFICATION ---
async function sendVerificationEmail(email: string, code: string, name: string) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  const html = `
    <div style="${STYLE.container}">
      <div style="${STYLE.header}">
        <h1 style="${STYLE.logo}">GuestHub Resort</h1>
        <span style="${STYLE.subLogo}">Guest Verification</span>
      </div>
      <div style="${STYLE.body}">
        <h2 style="${STYLE.h2}">Welcome, ${name}</h2>
        <p>Please use the code below to verify your guest profile.</p>
        <div style="${STYLE.codeBox}">
          <span style="${STYLE.label}">Verification Code</span>
          <span style="${STYLE.code}">${code}</span>
        </div>
      </div>
       <div style="${STYLE.footer}">
        <strong>🔒 SECURITY PROTOCOLS</strong>
        <ul style="${STYLE.policyList}">
          <li>Do not share this code.</li>
          <li>Expires in 10 minutes.</li>
        </ul>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: '"GuestHub Concierge" <security@guesthub.com>',
    to: email,
    subject: "Verify Your Profile",
    html: html,
  });
}

// --- 2. MASTER ADMIN GATEKEEPER EMAIL ---
async function sendGatekeeperAlert(requestingAdmin: string, requestingEmail: string, code: string) {
  // Technical Note: We send this to the MASTER email defined in .env, NOT the user logging in.
  const targetEmail = process.env.MASTER_ADMIN_EMAIL || process.env.EMAIL_USER;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  const html = `
    <div style="${STYLE.container}">
      <div style="background-color: #7f1d1d; padding: 40px 20px; text-align: center;">
        <h1 style="${STYLE.logo}">SECURITY ALERT</h1>
        <span style="${STYLE.subLogo}">Administrative Access Request</span>
      </div>

      <div style="${STYLE.body}">
        <h2 style="${STYLE.h2} color: #7f1d1d;">Auth Request: ${requestingAdmin}</h2>
        <p><strong>User:</strong> ${requestingEmail}</p>
        <p>A staff member is attempting to access the Master Admin Console. To authorize this session, please provide them with the following Secure Code:</p>
        
        <div style="background-color: #fef2f2; border: 1px solid #fca5a5; padding: 25px; text-align: center; margin: 30px 0;">
          <span style="${STYLE.label} color: #991b1b;">Master Key</span>
          <span style="${STYLE.code} color: #7f1d1d;">${code}</span>
        </div>
      </div>

      <div style="${STYLE.footer}">
        <strong>🔒 GATEKEEPER PROTOCOL</strong>
        <ul style="${STYLE.policyList}">
          <li><strong>Strict Control:</strong> Only share this code if you verbally confirmed the request.</li>
          <li><strong>Audit Trail:</strong> This login attempt has been logged.</li>
        </ul>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: '"GuestHub Security Core" <security@guesthub.com>',
    to: targetEmail, // Sends to GM
    subject: `⚠ AUTH REQUEST: ${requestingAdmin}`,
    html: html,
  });
}

// --- 3. PASSWORD RESET EMAIL ---
async function sendResetEmail(email: string, code: string, name: string) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  // ... (Reuse existing HTML structure or keep simple) ...
  const html = `
    <div style="${STYLE.container}">
       <div style="${STYLE.header}">
        <h1 style="${STYLE.logo}">GuestHub Security</h1>
      </div>
      <div style="${STYLE.body}">
        <p>Dear ${name}, here is your password reset code:</p>
        <div style="${STYLE.codeBox}"><span style="${STYLE.code}">${code}</span></div>
      </div>
    </div>
  `;
  await transporter.sendMail({ from: 'GuestHub Security', to: email, subject: 'Password Reset', html });
}


// --- HELPERS ---
function setTokenCookie(res: any, payload: object) {
  const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "7d" });
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return token;
}

// --- ROUTES ---

// 1. LOGIN (With Admin Interceptor)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const stored = user.password || user.passwordHash || "";
    const valid = await bcrypt.compare(password, stored);
    if (!valid) return res.status(400).json({ error: "Invalid credentials" });

    // --- ADMIN INTERCEPTOR ---
    if (user.role === "admin") {
       // 1. Generate Master Code
       const code = Math.floor(100000 + Math.random() * 900000).toString();
       
       // 2. Store code in DB linked to the *Requesting Admin*
       await Verification.deleteMany({ email });
       await Verification.create({ email, code });

       // 3. Send Email to the *Master GM* (via .env)
       await sendGatekeeperAlert(user.name || "Admin", user.email, code);

       return res.json({ 
         requireOtp: true, 
         message: "Authorization required. Contact General Manager for access code.",
         email: user.email 
       });
    }

    // --- NORMAL USER FLOW ---
    if (!user.passwordHash && user.password) {
        await User.updateOne({ _id: user._id }, { $set: { passwordHash: user.password } });
    }

    setTokenCookie(res, { _id: user._id, role: user.role });
    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role });
  } catch {
    res.status(500).json({ error: "Login failed" });
  }
});

// 2. ADMIN VERIFY LOGIN (Step 2)
router.post("/admin/verify-login", async (req, res) => {
  try {
    const { email, code } = req.body;
    
    const record = await Verification.findOne({ email, code });
    if (!record) return res.status(400).json({ error: "Invalid security code" });

    const user = await User.findOne({ email });
    if (!user || user.role !== "admin") return res.status(403).json({ error: "Unauthorized" });

    await Verification.deleteOne({ _id: record._id });
    
    setTokenCookie(res, { _id: user._id, role: user.role });
    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Verification failed" });
  }
});

// 3. Register Send Code
router.post("/send-code", async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) return res.status(400).json({ error: "Name and email required" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already in use" });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await Verification.deleteMany({ email }); 
    await Verification.create({ email, code });

    await sendVerificationEmail(email, code, name);
    res.json({ message: "Code sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send verification email" });
  }
});

// 4. Register Verified
router.post("/register-verified", async (req, res) => {
  try {
    const { name, email, password, code } = req.body;
    const record = await Verification.findOne({ email, code });
    if (!record) return res.status(400).json({ error: "Invalid code" });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash, passwordHash: hash, role: "user" });

    await Verification.deleteOne({ _id: record._id }); 
    setTokenCookie(res, { _id: user._id, role: user.role });
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
});

// 5. Logout
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

// 6. Me
router.get("/me", async (req: any, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.json(null);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { _id: string; role: string };
    const user = await User.findById(decoded._id).select("_id name email role");
    res.json(user);
  } catch {
    res.json(null);
  }
});

// 7. Forgot Password Init
router.post("/forgot-password/init", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      await Verification.deleteMany({ email }); 
      await Verification.create({ email, code });
      await sendResetEmail(email, code, user.name || "Guest");
    }
    res.json({ message: "Code sent" });
  } catch {
    res.status(500).json({ error: "Error" });
  }
});

// 8. Forgot Password Complete
router.post("/forgot-password/complete", async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const record = await Verification.findOne({ email, code });
    if (!record) return res.status(400).json({ error: "Invalid code" });
    const hash = await bcrypt.hash(newPassword, 10);
    await User.updateOne({ email }, { $set: { passwordHash: hash, password: hash } });
    await Verification.deleteOne({ _id: record._id });
    res.json({ message: "Password updated" });
  } catch {
    res.status(500).json({ error: "Error" });
  }
});

export default router;