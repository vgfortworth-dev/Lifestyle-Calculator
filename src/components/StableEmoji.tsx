import React from 'react';

type StableEmojiProps = {
  symbol: string;
  className?: string;
  label?: string;
  decorative?: boolean;
};

export const CATEGORY_EMOJIS: Record<string, string> = {
  Shopping: '\u{1F6CD}\uFE0F',
  Gaming: '\u{1F3AE}',
  Music: '\u{1F3B5}',
  Entertainment: '\u{1F4FA}',
  'News & Books': '\u{1F4F0}',
  'AI & Tech': '\u{1F916}',
  Productivity: '\u{1F4BC}',
  'Cloud Storage': '\u2601\uFE0F',
  Security: '\u{1F6E1}\uFE0F',
  Fitness: '\u{1F4AA}',
  Wellness: '\u2764\uFE0F',
  'Auto Care': '\u{1F698}',
  Auto: '\u{1F697}',
  Home: '\u{1F3E0}',
  Health: '\u2764\uFE0F',
  Dental: '\u{1F601}',
  Vision: '\u{1F453}',
  Life: '\u{1F6E1}\uFE0F',
  Utilities: '\u{1F4F6}',
  'Personal Vehicles': '\u{1F698}',
  'Electric Vehicles': '\u{1F50B}',
  Cycling: '\u{1F6B2}',
  General: '\u2728',
};

export const USAGE_BADGE_EMOJIS: Record<string, string> = {
  'Light Use': '\u{1F7E2}',
  'Moderate Use': '\u{1F7E1}',
  'Heavy Use': '\u{1F534}',
  'Light Driving': '\u{1F7E2}',
  'Moderate Driving': '\u{1F7E1}',
  'Heavy Driving': '\u{1F534}',
};

export function getCategoryEmoji(name: string) {
  return CATEGORY_EMOJIS[name] || CATEGORY_EMOJIS.General;
}

export function getUsageBadgeEmoji(name: string) {
  return USAGE_BADGE_EMOJIS[name] || CATEGORY_EMOJIS.General;
}

export function StableEmoji({
  symbol,
  className = 'text-2xl leading-none',
  label,
  decorative = true,
}: StableEmojiProps) {
  return (
    <span
      role="img"
      aria-hidden={decorative ? 'true' : undefined}
      aria-label={decorative ? undefined : label}
      className={className}
    >
      {symbol}
    </span>
  );
}

export function CategoryEmoji({
  name,
  className = 'text-2xl leading-none',
  decorative = true,
}: {
  name: string;
  className?: string;
  decorative?: boolean;
}) {
  return (
    <StableEmoji
      symbol={getCategoryEmoji(name)}
      className={className}
      label={`${name} icon`}
      decorative={decorative}
    />
  );
}

export function UsageBadgeEmoji({
  label,
  className = 'text-sm leading-none',
}: {
  label: string;
  className?: string;
}) {
  return (
    <StableEmoji
      symbol={getUsageBadgeEmoji(label)}
      className={className}
      label={`${label} indicator`}
      decorative
    />
  );
}
