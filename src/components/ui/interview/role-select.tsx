"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "../shadcn-component/button";
import { Input } from "../shadcn-component/input";
import { ChevronLeft, Sparkles, Terminal, Monitor, Code2, Cpu, Database, Brain, Smartphone, Shield, Cloud, Globe, Gamepad2, Network, Plus } from "lucide-react";
import { getRoleLabel } from "@/lib/ai-utils";

const roleIcons: Record<string, typeof Terminal> = {
  backend: Terminal,
  frontend: Monitor,
  fullstack: Code2,
  devops: Cpu,
  data: Database,
  datascience: Brain,
  mobile: Smartphone,
  security: Shield,
  cloud: Cloud,
  network: Globe,
  game: Gamepad2,
  sre: Network,
};

const roleKeys = [
  "backend", "frontend", "fullstack", "devops",
  "data", "datascience", "mobile", "security",
  "cloud", "network", "game", "sre",
] as const;

interface Props {
  onSelectRole: (role: string) => void;
  onBack: () => void;
}

export const RoleSelect = ({ onSelectRole, onBack }: Props) => {
  const [customRole, setCustomRole] = useState("");

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-8 py-8 px-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ChevronLeft className="size-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-semibold">Choose a role</h2>
          <p className="text-sm text-muted-foreground">
            Pick the position you want to interview for
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {roleKeys.map((key, i) => {
          const Icon = roleIcons[key];
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              whileHover={{
                y: -4,
                transition: { type: "spring", stiffness: 300 },
              }}
              onClick={() => onSelectRole(getRoleLabel(key))}
              className="flex flex-col items-center text-center gap-2 rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:shadow-md hover:ring-1 hover:ring-primary/30 transition-all duration-200 cursor-pointer"
            >
              <Icon className="size-6 text-primary" />
              <span className="text-sm font-medium">{getRoleLabel(key)}</span>
            </motion.div>
          );
        })}
      </div>

      <div className="border-t pt-6">
        <div className="flex items-center gap-2">
          <Plus className="size-4 text-muted-foreground shrink-0" />
          <p className="text-sm text-muted-foreground">
            Don&apos;t see your role? Add it below.
          </p>
        </div>
        <div className="flex gap-2 mt-2">
          <Input
            value={customRole}
            onChange={(e) => setCustomRole(e.target.value)}
            placeholder="e.g. Rust Developer, AI Engineer..."
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter" && customRole.trim()) {
                onSelectRole(customRole.trim());
              }
            }}
          />
          <Button
            variant="default"
            disabled={!customRole.trim()}
            onClick={() => onSelectRole(customRole.trim())}
          >
            <Sparkles className="size-4 mr-1" />
            Start
          </Button>
        </div>
      </div>
    </div>
  );
};
