import {
  Cigarette, Wind, Flame, Package, Droplets, SprayCan,
  Beer, Leaf, Coffee, Dices, Smartphone, Gamepad2,
  Ban, ShoppingBag, Heart
} from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  cigarette: Cigarette,
  vape: Wind,
  iqos: Flame,
  snus: Package,
  nicotine_gum: Droplets,
  nicotine_spray: SprayCan,
  alcohol: Beer,
  cannabis: Leaf,
  caffeine: Coffee,
  gambling: Dices,
  social_media: Smartphone,
  gaming: Gamepad2,
  pornography: Ban,
  shopping: ShoppingBag,
  self_harm: Heart,
};

interface AddictionIconProps {
  typeId: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export const AddictionIcon = ({ typeId, className, size = "md" }: AddictionIconProps) => {
  const Icon = iconMap[typeId] || Cigarette;
  return <Icon className={cn(sizeClasses[size], className)} />;
};

export default AddictionIcon;
