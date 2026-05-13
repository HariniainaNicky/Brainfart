import { GithubIcon, Linkedin, MailIcon, PhoneCall, Heart, ExternalLink } from "lucide-react";
import TypedText from "../typed-text";

const contactMethods = [
  {
    label: "Email",
    value: "ferrissushi@gmail.com",
    icon: MailIcon,
    href: "mailto:ferrissushi@gmail.com",
    action: "Send an email",
  },
  {
    label: "GitHub",
    value: "@ferrissushi",
    icon: GithubIcon,
    href: "https://github.com/ferrissushi",
    action: "View Profile",
  },
  {
    label: "LinkedIn",
    value: "ferrissusshi",
    icon: Linkedin,
    href: "https://www.linkedin.com/in/ferrissusshi/",
    action: "Connect",
  },
  {
    label: "Phone",
    value: "+261 38 158 4053",
    icon: PhoneCall,
    href: "tel:+261381584053",
    action: "Call",
  },
];

export const ContactBodyContent = () => {
  return (
    <div className="flex flex-col items-center gap-8 p-6 md:p-10 max-w-2xl mx-auto w-full">
      {/* Profile card */}
      <div className="w-full bg-card border border-border rounded-xl p-6 md:p-8 flex flex-col items-center gap-4 text-center hover:border-primary/30 transition-colors duration-200">
        <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <span className="text-3xl font-bold text-primary">F</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">@ferrissushi</h1>
          <p className="text-sm text-muted-foreground mt-1">BrainFart Developer</p>
        </div>
        <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
          Built BrainFart with lots of coffee, late nights, and a passion for trivia. If you have feedback, ideas, or just want to say hi — I&apos;d love to hear from you.
        </p>
      </div>

      {/* Contact method cards */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
        {contactMethods.map((method) => {
          const Icon = method.icon;
          return (
            <a
              key={method.label}
              href={method.href}
              target={method.href.startsWith("http") ? "_blank" : undefined}
              rel={method.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="group flex flex-col gap-3 bg-card border border-border rounded-lg p-4 hover:border-primary/30 transition-colors duration-200 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors duration-200">
                  <Icon className="size-5 text-primary" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-medium text-sm text-foreground">{method.label}</span>
                  <span className="text-xs text-muted-foreground truncate">{method.value}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
                {method.action}
                <ExternalLink className="size-3" />
              </div>
            </a>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Heart className="size-4 text-red-500 fill-red-500" />
        <TypedText strings={["A lot of love from @ferrissushi"]} />
      </div>
    </div>
  );
};
