import type { ComponentType, ReactNode } from 'react';
import {
  Building2,
  FerrisWheel,
  Fish,
  Flame,
  Flower2,
  Guitar,
  Heart,
  Landmark,
  MapPin,
  Mountain,
  Rocket,
  Sailboat,
  Shield,
  Tornado,
  TreePine,
  Waves,
  Wheat,
} from 'lucide-react';

type GlyphProps = {
  className?: string;
};

type LocationIconBadgeProps = {
  regionId: string;
  iconKey?: string;
};

function CustomGlyph({ className, children, viewBox = '0 0 24 24' }: GlyphProps & { children: ReactNode; viewBox?: string }) {
  return (
    <svg viewBox={viewBox} fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {children}
    </svg>
  );
}

function EagleGlyph({ className }: GlyphProps) {
  return (
    <CustomGlyph className={className}>
      <path d="M5.5 13.2C7.6 11.4 9.6 10.5 12 10.5C14.4 10.5 16.4 11.4 18.5 13.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8.2 10.7C9 8.2 10.3 6.8 12 6.8C13.7 6.8 15 8.2 15.8 10.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 10.4V18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M10.2 18H13.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M10.9 13L12 14.2L13.1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </CustomGlyph>
  );
}

function FootballGlyph({ className }: GlyphProps) {
  return (
    <CustomGlyph className={className}>
      <path d="M7 7C10 4.5 14 4.5 17 7C19.5 10 19.5 14 17 17C14 19.5 10 19.5 7 17C4.5 14 4.5 10 7 7Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 9L15 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M11.2 7.9L8.2 10.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M15.8 13.1L12.8 16.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M11.2 11.2H12.6M10.8 13H13M10.4 14.8H11.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </CustomGlyph>
  );
}

function SheepGlyph({ className }: GlyphProps) {
  return (
    <CustomGlyph className={className}>
      <path d="M8 15C6.1 15 5 13.8 5 12C5 10.4 6 9.2 7.5 9C7.8 7.3 9.2 6 11 6C12.1 6 13.1 6.5 13.7 7.3C14.1 7.1 14.5 7 15 7C16.7 7 18 8.3 18 10C19.2 10.2 20 11.3 20 12.5C20 14 18.8 15 17.3 15H8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M10.5 15V18M15 15V18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M7 11.6C7 10.7 7.7 10 8.6 10H10V13H8.6C7.7 13 7 12.3 7 11.6Z" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="8.5" cy="11.2" r="0.6" fill="currentColor" />
    </CustomGlyph>
  );
}

function DeerGlyph({ className }: GlyphProps) {
  return (
    <CustomGlyph className={className}>
      <path d="M9 8L7 5M9 8L6.2 7.2M15 8L17 5M15 8L17.8 7.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.5 9.5C8.5 7.8 9.8 6.5 11.5 6.5H12.5C14.2 6.5 15.5 7.8 15.5 9.5V11.2C15.5 13.3 13.8 15 11.7 15H12.3C10.2 15 8.5 13.3 8.5 11.2V9.5Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M10.5 15L9.5 18M13.5 15L14.5 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="10.6" cy="10.5" r="0.55" fill="currentColor" />
      <circle cx="13.4" cy="10.5" r="0.55" fill="currentColor" />
    </CustomGlyph>
  );
}

function ShellGlyph({ className }: GlyphProps) {
  return (
    <CustomGlyph className={className}>
      <path d="M6 16C6 10.5 8.7 7 12 7C15.3 7 18 10.5 18 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M7 16L8.5 18M10 16L10.5 18M12 16V18M14 16L13.5 18M17 16L15.5 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 7V16M9 9.2L10.2 16M15 9.2L13.8 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </CustomGlyph>
  );
}

function PalmGlyph({ className }: GlyphProps) {
  return (
    <CustomGlyph className={className}>
      <path d="M12 9V18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M10.5 18H13.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 9C10.7 7.3 8.9 6.3 7 6.2C8.2 7.8 9.8 8.9 12 9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 9C13.2 7.2 15 6.2 17 6C15.9 7.8 14.4 8.8 12 9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 9C9.7 8.8 8 9.5 6.5 10.8C8.5 11 10.1 10.5 12 9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 9C14.2 8.9 15.9 9.5 17.5 10.7C15.6 11 13.9 10.4 12 9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </CustomGlyph>
  );
}

function HatGlyph({ className }: GlyphProps) {
  return (
    <CustomGlyph className={className}>
      <path d="M7 14C7.6 10.8 9 9 12 9C15 9 16.4 10.8 17 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M4.5 15C6.5 13.8 8.8 13.2 12 13.2C15.2 13.2 17.5 13.8 19.5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9.5 9.5C10.2 8.2 11 7.5 12 7.5C13 7.5 13.8 8.2 14.5 9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </CustomGlyph>
  );
}

function BaseballGlyph({ className }: GlyphProps) {
  return (
    <CustomGlyph className={className}>
      <circle cx="12" cy="12" r="6.8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 6.8C10.5 8.4 11.2 10.1 11.2 12C11.2 13.9 10.5 15.6 9 17.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M15 6.8C13.5 8.4 12.8 10.1 12.8 12C12.8 13.9 13.5 15.6 15 17.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </CustomGlyph>
  );
}

function PepperGlyph({ className }: GlyphProps) {
  return (
    <CustomGlyph className={className}>
      <path d="M13 7C13 6 13.7 5 14.8 4.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9.5 9.5C9.5 7.8 10.7 6.5 12.4 6.5C14.1 6.5 15.5 7.8 15.5 9.8C17 10.5 18 11.9 18 13.8C18 16.6 15.7 19 12.2 19C8.7 19 6.5 16.7 6.5 13.8C6.5 11.7 7.7 10.2 9.5 9.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </CustomGlyph>
  );
}

function BullGlyph({ className }: GlyphProps) {
  return (
    <CustomGlyph className={className}>
      <path d="M8 9C6.7 8.2 5.9 7.2 5.6 6C7.1 6.3 8.3 7 9.2 8.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 9C17.3 8.2 18.1 7.2 18.4 6C16.9 6.3 15.7 7 14.8 8.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.5 9.5C8.5 7.8 9.9 6.5 11.6 6.5H12.4C14.1 6.5 15.5 7.8 15.5 9.5V11C15.5 13.4 13.6 15.3 11.2 15.3H12.8C10.4 15.3 8.5 13.4 8.5 11V9.5Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M10.2 15.3L9.6 17.5M13.8 15.3L14.4 17.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="10.6" cy="10.5" r="0.55" fill="currentColor" />
      <circle cx="13.4" cy="10.5" r="0.55" fill="currentColor" />
    </CustomGlyph>
  );
}

function CactusGlyph({ className }: GlyphProps) {
  return (
    <CustomGlyph className={className}>
      <path d="M12 6V18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 10C10 10 9 11.3 9 13.2V14.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 14.2C9 15.2 8.4 16 7.2 16C6.1 16 5.5 15.2 5.5 14.2V12.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 9.5C14 9.5 15 10.8 15 12.7V13.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M15 13.7C15 14.7 15.6 15.5 16.8 15.5C17.9 15.5 18.5 14.7 18.5 13.7V12.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </CustomGlyph>
  );
}

const REGION_ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  alamo: Landmark,
  football: FootballGlyph,
  rocket: Rocket,
  music: Guitar,
  badge: Shield,
  waves: Waves,
  sheep: SheepGlyph,
  city: Building2,
  deer: DeerGlyph,
  rose: Flower2,
  shell: ShellGlyph,
  heart: Heart,
  palm: PalmGlyph,
  eagle: EagleGlyph,
  fair: FerrisWheel,
  pine: TreePine,
  tornado: Tornado,
  hat: HatGlyph,
  oil: Flame,
  baseball: BaseballGlyph,
  ship: Sailboat,
  wheat: Wheat,
  pepper: PepperGlyph,
  bull: BullGlyph,
  fishing: Fish,
  mountain: Mountain,
  cactus: CactusGlyph,
};

export function LocationIconBadge({ regionId, iconKey }: LocationIconBadgeProps) {
  const Icon = REGION_ICON_MAP[iconKey || regionId] || MapPin;

  return (
    <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-orange-300 via-orange-500 to-orange-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] ring-1 ring-white/35">
      <span className="pointer-events-none absolute inset-[1px] rounded-[15px] bg-white/10" />
      <span className="pointer-events-none absolute inset-x-2 top-1 h-3 rounded-full bg-white/35 blur-[2px]" />
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.25),transparent_45%)]" />
      <Icon className="relative z-10 h-5 w-5 text-white" />
    </span>
  );
}
