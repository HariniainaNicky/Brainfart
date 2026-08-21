"use client";
import Link from "next/link";
import { Button } from "../shadcn-component/button";
import { Input } from "../shadcn-component/input";
import { useRouter } from "next/navigation";
import { ShowPassButton } from "@/components/ui/button/show-paas-button";
import { Label } from "../shadcn-component/label";
import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";
import { useState } from "react";

const ButtonMotion = motion.create(Button);

type FormType = {
  login: string;
  password: string;
};

export const SignIn = () => {
  const { register, handleSubmit } = useForm<FormType>();

  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [showPass, setShowPass] = useState(false);
  const handleClick = async (data: FormType) => {
    const { login, password } = data;
    const isEmail = login.includes("@");
    let loadId: string | undefined;
    const callbacks = {
      onSuccess: () => {
        toast.success("Welcome back.", { id: loadId });
        setLoading(false);
        router.push("/");
      },
      onError: (ctx: { error: { message: string } }) => {
        toast.error(ctx.error.message, { id: loadId });
        setLoading(false);
      },
      onRequest: () => {
        loadId = toast.loading("Wait please...");
        setLoading(true);
      },
    };
    if (isEmail) {
      await authClient.signIn.email(
        {
          email: login,
          password: password,
        },
        callbacks as never,
      );
    } else {
      await (authClient.signIn as unknown as { username: (opts: { username: string; password: string }, opts2: unknown) => Promise<void> }).username(
        {
          username: login,
          password,
        },
        callbacks as never,
      );
    }
  };
  return (
    <form className="flex flex-col gap-5 w-full">
      <div className="flex flex-col gap-2 w-full">
        <Label htmlFor="login">Email or username</Label>
        <Input
          {...register("login")}
          type="text"
          id="login"
          placeholder="user@gmail.com or username"
        />
      </div>
      <div className="flex flex-col gap-2 w-full">
        <Label htmlFor="password">Your password</Label>
        <div className="relative">
          <Input
            type={showPass ? "text" : "password"}
            id="password"
            {...register("password")}
            className="pr-9"
          />
          <ShowPassButton showPass={showPass} setShowPass={setShowPass} />
        </div>
      </div>
      <ButtonMotion
        className="w-full"
        whileTap={{ scale: 0.98 }}
        onClick={handleSubmit(handleClick)}
        disabled={loading}
      >
        Sign in
      </ButtonMotion>
      <Link href="/auth/sign-up" className="text-sm text-center hover:underline">
        Don&apos;t have an account?
      </Link>
    </form>
  );
};
