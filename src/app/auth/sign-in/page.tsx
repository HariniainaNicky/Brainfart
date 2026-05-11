import { OAuth } from "@/components/ui/auth/oauth";
import { SignIn } from "@/components/ui/auth/sign-in";
import { ModeToggle } from "@/components/ui/button/dark-mode-toggle";
import { Separator } from "@/components/ui/shadcn-component/separator";
import * as motion from "motion/react-client";

const Page = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-5"
    >
      <div className="flex justify-end -mt-1">
        <ModeToggle />
      </div>
      <SignIn />
      <Separator />
      <OAuth />
    </motion.div>
  );
};

export default Page;
