import {
  Boxes,
  Brain,
  Cloud,
  Code,
  Gamepad2,
  Globe,
  Layers,
  PenTool,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TrendingUp,
} from "lucide-react";

const ICONS = {
  globe: Globe,
  code: Code,
  smartphone: Smartphone,
  gamepad: Gamepad2,
  "trending-up": TrendingUp,
  "pen-tool": PenTool,
  sparkles: Sparkles,
  brain: Brain,
  cloud: Cloud,
  shield: ShieldCheck,
  boxes: Boxes,
  layers: Layers,
};

export default function CategoryIcon({ name, size = 20, className = "", strokeWidth = 1.7 }) {
  const Icon = ICONS[name] || Layers;
  return <Icon size={size} className={className} strokeWidth={strokeWidth} />;
}
