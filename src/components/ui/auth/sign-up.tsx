"use client";
import { useState, useMemo } from "react";
import { Input } from "../shadcn-component/input";
import Link from "next/link";
import { Label } from "../shadcn-component/label";
import { ShowPassButton } from "@/components/ui/button/show-paas-button";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import { Button } from "../shadcn-component/button";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";

const ButtonMotion = motion.create(Button);

type FormType = {
  email: string;
  password: string;
  confirmPassword: string;
};

const getPasswordScore = (pw: string) => {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(4, Math.max(0, score - 1));
};

const scoreLabels = ["Too weak", "Weak", "Fair", "Good", "Strong"];
const scoreColors = ["bg-muted", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500"];

export const SignUp = () => {
  const router = useRouter()
  const { register, handleSubmit } = useForm<FormType>();
  const [cpass, setCPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const score = useMemo(() => getPasswordScore(cpass), [cpass]);
  const scoreLabel = cpass ? scoreLabels[score] : "";

  const handleClick = async (data: FormType) => {
    if (score < 2) {
      toast.error("Your password is not strong enough. Add uppercase, number or symbol.");
      return;
    }
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    const { email, password } = data;
    let loadId: string | undefined;
    await authClient.signUp.email(
      {
        name: email,
        email,
        password,
      },
      {
        onSuccess: () => {
          toast.success("Check your email to verify your account.", { id: loadId });
          router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`)
          setLoading(false);
        },
        onError: (ctx) => {
          toast.error(ctx.error.message, { id: loadId });
          setLoading(false);
        },
        onRequest: () => {
          loadId = toast.loading("Wait please...");
          setLoading(true);
        },
      },
    );
  };

  return (
    <form className="flex flex-col gap-5 w-full">
      <div className="flex flex-col gap-2 w-full">
        <Label htmlFor="email">Email</Label>
        <Input
          type="email"
          {...register("email")}
          id="email"
          placeholder="user@gmail.com"
        />
      </div>

      <div className="flex flex-col gap-2 w-full">
        <Label htmlFor="newPassword">New password</Label>
        <div className="relative">
          <Input
            type={showPass ? "text" : "password"}
            id="newPassword"
            {...register("password", {
              onChange: (e) => setCPass(e.target.value),
            })}
            className="pr-9"
          />
          <ShowPassButton showPass={showPass} setShowPass={setShowPass} />
        </div>
      </div>

      <div className="flex flex-col gap-2 w-full">
        <Label htmlFor="confirmPassword">Retype your password</Label>
        <div className="relative">
          <Input
            type={showConfirmPass ? "text" : "password"}
            id="confirmPassword"
            {...register("confirmPassword")}
            className="pr-9"
          />
          <ShowPassButton showPass={showConfirmPass} setShowPass={setShowConfirmPass} />
        </div>
      </div>

      {cpass && (
        <div className="flex flex-col gap-1.5">
          <div className="flex gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i < score ? scoreColors[score] : "bg-muted"}`}
              />
            ))}
          </div>
          <p className={`text-xs ${score < 2 ? "text-red-500" : score < 3 ? "text-orange-500" : "text-green-600"}`}>
            {scoreLabel} {score < 2 && cpass ? "— add uppercase, number or symbol" : ""}
          </p>
        </div>
      )}

      <ButtonMotion
        className="w-full"
        whileTap={{ scale: 0.98 }}
        onClick={handleSubmit(handleClick)}
        disabled={loading}
      >
        Sign up
      </ButtonMotion>

      <Link href="/auth/sign-in" className="text-sm text-center hover:underline">
        Already have an account?
      </Link>
    </form>
  );
};
