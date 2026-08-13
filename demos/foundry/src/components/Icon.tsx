import {
  ArrowLeftRight,
  CircleDot,
  Cog,
  Drill,
  Droplet,
  Eye,
  Flame,
  GitMerge,
  Grip,
  Hammer,
  HandMetal,
  HelpCircle,
  Layers,
  MapPin,
  MoveHorizontal,
  Package,
  Ruler,
  RotateCw,
  ShieldCheck,
  Shrink,
  Shuffle,
  Waves,
  Wind,
  Wrench,
  Zap,
  type LucideProps,
} from 'lucide-react';

/**
 * Only the icons this application uses, listed by name, so that the bundle does
 * not carry the rest of the set.
 */
const registry: Record<string, React.ComponentType<LucideProps>> = {
  ArrowLeftRight,
  CircleDot,
  Cog,
  Drill,
  Droplet,
  Eye,
  Flame,
  GitMerge,
  Grip,
  Hammer,
  HandMetal,
  HelpCircle,
  Layers,
  MapPin,
  MoveHorizontal,
  Package,
  Ruler,
  RotateCw,
  ShieldCheck,
  Shrink,
  Shuffle,
  Waves,
  Wind,
  Wrench,
  Zap,
};

export function Icon({ name, ...props }: { name: string } & LucideProps) {
  const Component = registry[name] ?? HelpCircle;
  return <Component {...props} />;
}
