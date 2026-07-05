import {
  Rocket,
  PenLine,
  Megaphone,
  Search,
  Scale,
  Zap,
  Bot,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  rocket: Rocket,
  pen: PenLine,
  megaphone: Megaphone,
  search: Search,
  scale: Scale,
  zap: Zap,
  bot: Bot,
};

export function AgentIcon({ icon, className }: { icon: string; className?: string }) {
  const Icon = ICONS[icon] || Bot;
  return <Icon className={className} />;
}
