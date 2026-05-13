import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { sendEmail } from "@/utils/extern";
import { admin } from "better-auth/plugins"

const appUrl = process.env.BETTER_AUTH_URL || "https://brainfart.vercel.app";

const emailLayout = (content: string) => `
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #fafafa; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background: #18181b; padding: 32px 40px; text-align: center;">
              <img src="${appUrl}/logo.png" alt="BrainFart" width="40" height="40" style="border-radius: 8px;" />
              <h1 style="color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 20px; font-weight: 700; margin: 12px 0 0 0; letter-spacing: -0.3px;">BrainFart</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 40px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #18181b; font-size: 15px; line-height: 1.7;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; border-top: 1px solid #e4e4e7; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #71717a;">
              <p style="margin: 0 0 4px 0;">This link expires in 30 minutes.</p>
              <p style="margin: 0;">If you didn't request this, you can safely ignore this email.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
`;

const emailButton = (url: string, label: string) => `
  <table cellpadding="0" cellspacing="0" style="margin: 24px 0;">
    <tr>
      <td style="background: #18181b; border-radius: 8px; text-align: center;">
        <a href="${url}" style="display: inline-block; padding: 12px 32px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; font-weight: 600; color: #fafafa; text-decoration: none; letter-spacing: -0.2px;">${label}</a>
      </td>
    </tr>
  </table>
`;

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 20,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [
    username({
      usernameNormalization(username) {
        return username.toLowerCase().trim().replaceAll(" ", "_");
      },
    }),
    admin()
  ],
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      const html = emailLayout(`
        <h2 style="font-size: 22px; font-weight: 700; margin: 0 0 8px 0; letter-spacing: -0.3px; color: #18181b;">Verify Your Email</h2>
        <p style="margin: 0 0 16px 0; color: #52525b;">Hi ${user.name || user.email},</p>
        <p style="margin: 0 0 4px 0; color: #52525b;">Thanks for signing up! Please confirm your email address to get started.</p>
        ${emailButton(url, "Verify Email")}
        <p style="margin: 0; color: #a1a1aa; font-size: 13px;">Or copy this link into your browser:</p>
        <p style="margin: 4px 0 0 0; font-size: 13px; word-break: break-all; color: #71717a;">${url}</p>
      `);
      await sendEmail(user.email, "Verify your email — BrainFart", html);
    },
  },
  user: {
    additionalFields: {
      rank: {
        type: "number",
        required: false,
      },
      highestScore: {
        type: "number",
        required: false,
        defaultValue: 0,
      },
    },
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({ user, newEmail, url }: { user: { name: string; email: string }; newEmail: string; url: string }) => {
        const html = emailLayout(`
          <h2 style="font-size: 22px; font-weight: 700; margin: 0 0 8px 0; letter-spacing: -0.3px; color: #18181b;">Confirm Email Change</h2>
          <p style="margin: 0 0 16px 0; color: #52525b;">Hi ${user.name || user.email},</p>
          <p style="margin: 0 0 4px 0; color: #52525b;">You requested to change your email address to <strong style="color: #18181b;">${newEmail}</strong>.</p>
          <p style="margin: 0 0 4px 0; color: #52525b;">Click below to confirm this change:</p>
          ${emailButton(url, "Approve Email Change")}
          <p style="margin: 16px 0 0 0; color: #a1a1aa; font-size: 13px;">Or copy this link into your browser:</p>
          <p style="margin: 4px 0 0 0; font-size: 13px; word-break: break-all; color: #71717a;">${url}</p>
        `);
        await sendEmail(user.email, "Approve Email Change — BrainFart", html);
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24 * 7,
  }
});
