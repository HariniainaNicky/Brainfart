import transporter from "@/lib/nodemailer";

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const from = process.env.NODEMAILER_USER ? `BrainFart <${process.env.NODEMAILER_USER}>` : "BrainFart <noreply@brainfart.com>";
    await transporter.sendMail({
      from,
      to,
      subject,
      html,
      envelope: process.env.NODEMAILER_USER ? { from: process.env.NODEMAILER_USER, to } : undefined,
    });
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
