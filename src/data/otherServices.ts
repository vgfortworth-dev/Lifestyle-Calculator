import { Option } from '../types';

export type OtherServicesCategoryId =
  | 'college-athletics'
  | 'concerts'
  | 'mlb-games'
  | 'nfl-games'
  | 'live-theatre'
  | 'other-events';

export type OtherServicesOffer = {
  id: string;
  name: string;
  description: string;
  price: number;
  emoji?: string;
};

export type OtherServicesCard = {
  id: string;
  title: string;
  icon: string;
  priceHint?: string;
  options: OtherServicesOffer[];
};

export type OtherServicesCategory = {
  id: OtherServicesCategoryId;
  label: string;
  heroImage?: string;
  heroImageAlt?: string;
  cards: OtherServicesCard[];
};

function annualToMonthly(price: number) {
  return Number((price / 12).toFixed(2));
}

export const OTHER_SERVICES_CATEGORIES: OtherServicesCategory[] = [
  {
    id: 'college-athletics',
    label: 'College Athletics',
    cards: [
      {
        id: 'college-football',
        title: 'Football',
        icon: '🏈',
        options: [
          { id: 'college-football-single', name: 'Single Game Tickets', description: '1 ticket per game.', price: 90, emoji: '🏈' },
          { id: 'college-football-season', name: 'Season Tickets', description: '7 games per season. 1 ticket for each game.', price: 350, emoji: '🏈' },
        ],
      },
      {
        id: 'college-basketball',
        title: 'Basketball',
        icon: '🏀',
        options: [
          { id: 'college-basketball-single', name: 'Single Game Tickets', description: '1 ticket per game.', price: 37, emoji: '🏀' },
          { id: 'college-basketball-season', name: 'Season Tickets', description: '7 games per season. 1 ticket for each game.', price: 325, emoji: '🏀' },
        ],
      },
      {
        id: 'college-baseball',
        title: 'Baseball',
        icon: '⚾',
        options: [
          { id: 'college-baseball-single', name: 'Single Game Tickets', description: '1 ticket per game.', price: 18, emoji: '⚾' },
          { id: 'college-baseball-season', name: 'Season Tickets', description: '7 games per season. 1 ticket for each game.', price: 200, emoji: '⚾' },
        ],
      },
    ],
  },
  {
    id: 'concerts',
    label: 'Concerts',
    heroImage: 'https://res.cloudinary.com/dyjfdwah7/image/upload/v1776451242/Concert_venue_large_with_stage_skvc9c.png',
    heroImageAlt: 'Concert venue seating diagram showing floor and upper seating levels.',
    cards: [
      {
        id: 'concert-niche',
        title: 'Niche Artist',
        icon: '🎵',
        priceHint: '$',
        options: [
          { id: 'concert-niche-floor', name: 'Floor Seats', description: '1 ticket only', price: 180, emoji: '🎵' },
          { id: 'concert-niche-100', name: '100s Section', description: '1 ticket only', price: 140, emoji: '🎵' },
          { id: 'concert-niche-200', name: '200s Section', description: '1 ticket only', price: 120, emoji: '🎵' },
          { id: 'concert-niche-300', name: '300s Section', description: '1 ticket only', price: 50, emoji: '🎵' },
        ],
      },
      {
        id: 'concert-established',
        title: 'Established Artist',
        icon: '🎶',
        priceHint: '$$$',
        options: [
          { id: 'concert-established-floor', name: 'Floor Seats', description: '1 ticket only', price: 340, emoji: '🎶' },
          { id: 'concert-established-100', name: '100s Section', description: '1 ticket only', price: 300, emoji: '🎶' },
          { id: 'concert-established-200', name: '200s Section', description: '1 ticket only', price: 220, emoji: '🎶' },
          { id: 'concert-established-300', name: '300s Section', description: '1 ticket only', price: 170, emoji: '🎶' },
        ],
      },
      {
        id: 'concert-superstar',
        title: 'Superstar Artist',
        icon: '🎤',
        priceHint: '$$$$',
        options: [
          { id: 'concert-superstar-floor', name: 'Floor Seats', description: '1 ticket only', price: 1600, emoji: '🎤' },
          { id: 'concert-superstar-100', name: '100s Section', description: '1 ticket only', price: 900, emoji: '🎤' },
          { id: 'concert-superstar-200', name: '200s Section', description: '1 ticket only', price: 565, emoji: '🎤' },
          { id: 'concert-superstar-300', name: '300s Section', description: '1 ticket only', price: 310, emoji: '🎤' },
        ],
      },
    ],
  },
  {
    id: 'mlb-games',
    label: 'MLB Games',
    cards: [
      {
        id: 'mlb-weekday',
        title: 'Weekday Games',
        icon: '⚾',
        options: [
          { id: 'mlb-weekday-single', name: 'Single Game Tickets', description: '1 ticket per game.', price: 14, emoji: '⚾' },
        ],
      },
      {
        id: 'mlb-weekend',
        title: 'Weekend Games',
        icon: '⚾⚾',
        options: [
          { id: 'mlb-weekend-single', name: 'Single Game Tickets', description: '1 ticket per game.', price: 35, emoji: '⚾' },
        ],
      },
      {
        id: 'mlb-rivalry-playoffs',
        title: 'Rivalry/Playoffs',
        icon: '⚾⚾⚾',
        options: [
          { id: 'mlb-rivalry-single', name: 'Single Game Tickets', description: '1 ticket per game.', price: 28, emoji: '⚾' },
        ],
      },
    ],
  },
  {
    id: 'nfl-games',
    label: 'NFL Games',
    cards: [
      {
        id: 'nfl-standard',
        title: 'Standard Games',
        icon: '🏈',
        options: [
          { id: 'nfl-standard-standing', name: 'Standing Room Only', description: '1 ticket per game.', price: 35, emoji: '🏈' },
          { id: 'nfl-standard-seated', name: 'Seated Ticket', description: '1 ticket per game.', price: 73, emoji: '🏈' },
        ],
      },
      {
        id: 'nfl-premium',
        title: 'Premium Games',
        icon: '🏈🏈',
        options: [
          { id: 'nfl-premium-basic', name: 'Single Game Tickets', description: '1 ticket per game.', price: 49, emoji: '🏈' },
          { id: 'nfl-premium-seated', name: 'Single Game Tickets', description: '1 ticket per game.', price: 122, emoji: '🏈' },
        ],
      },
      {
        id: 'nfl-marquee',
        title: 'Marquee Games',
        icon: '🏈🏈🏈',
        options: [
          { id: 'nfl-marquee-basic', name: 'Single Game Tickets', description: '1 ticket per game.', price: 76, emoji: '🏈' },
          { id: 'nfl-marquee-seated', name: 'Single Game Tickets', description: '1 ticket per game.', price: 233, emoji: '🏈' },
        ],
      },
    ],
  },
  {
    id: 'live-theatre',
    label: 'Live Theatre',
    cards: [
      {
        id: 'theatre-casa',
        title: 'Casa Manana',
        icon: '🎭',
        options: [
          { id: 'theatre-casa-single', name: 'Single Show Tickets', description: '1 ticket per show.', price: 125, emoji: '🎭' },
          { id: 'theatre-casa-season', name: 'Season Tickets', description: '5 shows a season.', price: 425, emoji: '🎭' },
        ],
      },
      {
        id: 'theatre-bass',
        title: 'Bass Hall',
        icon: '🎟️',
        options: [
          { id: 'theatre-bass-single', name: 'Single Show Tickets', description: '1 ticket per show.', price: 50, emoji: '🎟️' },
          { id: 'theatre-bass-season', name: 'Season Tickets', description: '9 shows a season.', price: 343, emoji: '🎟️' },
        ],
      },
      {
        id: 'theatre-fair-park',
        title: 'Music Hall at Fair Park',
        icon: '⭐',
        options: [
          { id: 'theatre-fair-park-single', name: 'Single Show Tickets', description: '1 ticket per show.', price: 115, emoji: '⭐' },
          { id: 'theatre-fair-park-season', name: 'Season Tickets', description: '7 shows a season.', price: 650, emoji: '⭐' },
        ],
      },
    ],
  },
  {
    id: 'other-events',
    label: 'Other Events',
    cards: [
      {
        id: 'events-zoo',
        title: 'Fort Worth Zoo',
        icon: '🦁',
        options: [
          { id: 'events-zoo-single', name: 'Single Day Tickets', description: '1 ticket per person.', price: 22, emoji: '🦁' },
          { id: 'events-zoo-membership', name: 'Annual Zoo Membership', description: '1 membership per person.', price: 80, emoji: '🦁' },
        ],
      },
      {
        id: 'events-sixflags',
        title: 'Six Flags/Hurricane Harbor',
        icon: '🎢',
        options: [
          { id: 'events-sixflags-single', name: 'Single Day Tickets', description: '1 ticket per person.', price: 39, emoji: '🎢' },
          { id: 'events-sixflags-gold', name: 'Gold Membership', description: '1 membership per person.', price: 116, emoji: '🎢' },
          { id: 'events-sixflags-prestige', name: 'Prestige Membership', description: '1 membership per person.', price: 188, emoji: '🎢' },
        ],
      },
      {
        id: 'events-statefair',
        title: 'State Fair of Texas',
        icon: '🎡',
        options: [
          { id: 'events-statefair-budget', name: 'Budget Package', description: '1 package per person.', price: 125, emoji: '🎡' },
          { id: 'events-statefair-foodie', name: 'Foodie Package', description: '1 package per person.', price: 210, emoji: '🎡' },
          { id: 'events-statefair-thrill', name: 'Thrill Seeker', description: '1 package per person.', price: 260, emoji: '🎡' },
          { id: 'events-statefair-allout', name: 'All Out Package', description: '1 package per person.', price: 350, emoji: '🎡' },
        ],
      },
      {
        id: 'events-dickies',
        title: 'Dickies Arena Events',
        icon: '🎟️',
        options: [
          { id: 'events-dickies-disney', name: 'Disney on Ice', description: '1 ticket per person.', price: 38, emoji: '🎟️' },
          { id: 'events-dickies-wwe', name: 'WWE Friday Night Smackdown', description: '1 ticket per person.', price: 68, emoji: '🎟️' },
          { id: 'events-dickies-circus', name: 'Ringing Bros Circus', description: '1 ticket per person.', price: 33, emoji: '🎟️' },
          { id: 'events-dickies-march-madness', name: 'March Madness Games', description: '1 ticket per person.', price: 80, emoji: '🎟️' },
          { id: 'events-dickies-rodeo', name: 'Fort Worth Stockshow & Rodeo', description: '1 ticket per person.', price: 90, emoji: '🎟️' },
        ],
      },
      {
        id: 'events-cowtown',
        title: 'Cowtown Marathon',
        icon: '🏃',
        options: [
          { id: 'events-cowtown-5k', name: 'Adults 5k', description: '1 entry per person.', price: 45, emoji: '🏃' },
          { id: 'events-cowtown-10k', name: '10k', description: '1 entry per person.', price: 50, emoji: '🏃' },
          { id: 'events-cowtown-half', name: 'Half Marathon', description: '1 entry per person.', price: 115, emoji: '🏃' },
          { id: 'events-cowtown-full', name: 'Full Marathon', description: '1 entry per person.', price: 125, emoji: '🏃' },
        ],
      },
      {
        id: 'events-botanic',
        title: 'Fort Worth Botanic Gardens',
        icon: '🌸',
        options: [
          { id: 'events-botanic-single', name: 'Single Day Tickets', description: '1 ticket per person.', price: 22, emoji: '🌸' },
          { id: 'events-botanic-membership', name: 'Annual Membership', description: '1 membership per person.', price: 80, emoji: '🌸' },
        ],
      },
    ],
  },
];

export const OTHER_OPTIONS: Option[] = OTHER_SERVICES_CATEGORIES.flatMap((category) =>
  category.cards.flatMap((card) =>
    card.options.map((offer) => ({
      id: offer.id,
      name: `${card.title}: ${offer.name}`,
      description: offer.description,
      monthlyCost: annualToMonthly(offer.price),
      emoji: offer.emoji ?? card.icon,
      category: category.label,
      type: card.title,
      notes: `Displayed price: $${offer.price.toLocaleString()} per year/event selection.`,
    }))
  )
);
