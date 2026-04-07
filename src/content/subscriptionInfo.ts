export type SubscriptionOptionInfo = {
  what: string;
  included: string[];
  bestFor?: string;
};

export const SUBSCRIPTION_OPTION_INFO: Record<string, SubscriptionOptionInfo> = {
  eos: {
    what: 'A gym membership that gives you access to workout equipment and facilities.',
    included: [
      'Access to gym equipment',
      'Cardio and weight machines',
      'Open workout space',
      'Some locations include group classes',
    ],
  },
  planet: {
    what: 'A low-cost gym focused on a beginner-friendly environment.',
    included: [
      'Gym equipment access',
      'Cardio and strength machines',
      'Judgment-free workout environment',
      'Basic membership perks',
    ],
  },
  crunch: {
    what: 'A gym that combines workouts with group fitness classes.',
    included: [
      'Gym equipment',
      'Group fitness classes',
      'Strength and cardio areas',
      'Fun, energetic workout environment',
    ],
  },
  calm: {
    what: 'A mobile app focused on relaxation, sleep, and meditation.',
    included: [
      'Guided meditation sessions',
      'Sleep stories and music',
      'Breathing exercises',
      'Stress-reduction tools',
    ],
  },
  headspace: {
    what: 'A mindfulness app that helps with focus and mental health.',
    included: [
      'Guided meditation programs',
      'Focus and productivity tools',
      'Stress and anxiety support',
      'Daily mindfulness exercises',
    ],
  },
  betterhelp: {
    what: 'An online therapy service that connects you with licensed counselors.',
    included: [
      'One-on-one therapy sessions',
      'Messaging with a therapist',
      'Mental health support',
      'Flexible scheduling',
    ],
  },
  superstar: {
    what: 'A subscription car wash service.',
    included: [
      'Unlimited car washes',
      'Access to multiple locations',
      'Exterior cleaning services',
      'Regular vehicle upkeep',
    ],
  },
  slappys: {
    what: 'A local car wash membership plan.',
    included: [
      'Regular car washes',
      'Local service access',
      'Basic cleaning options',
      "Maintenance for your vehicle's appearance",
    ],
  },
  icloud: {
    what: "Apple's cloud storage service for saving files and photos.",
    included: [
      'Photo and video backup',
      'File storage across Apple devices',
      'Device backups',
      'Family sharing options',
    ],
  },
  googleone: {
    what: "Google's cloud storage for files, photos, and email.",
    included: [
      'Google Drive storage',
      'Gmail storage',
      'Google Photos backup',
      'Access across devices',
    ],
  },
  dropbox: {
    what: 'A cloud storage service focused on file sharing and organization.',
    included: [
      'File storage and backup',
      'Easy file sharing',
      'Folder organization',
      'Access from multiple devices',
    ],
  },
  'onedrive-100gb': {
    what: "Microsoft's cloud storage connected to Office tools.",
    included: [
      'File storage',
      'Integration with Word, Excel, PowerPoint',
      'File sharing',
      'Access across devices',
    ],
  },
  'googleone-2tb': {
    what: 'A higher-capacity Google storage plan.',
    included: [
      'Large file and photo storage',
      'Google Drive + Gmail + Photos',
      'Backup for large amounts of data',
      'Multi-device access',
    ],
  },
  'box-personal-pro': {
    what: 'A cloud storage service focused on security and organization.',
    included: [
      'Secure file storage',
      'File sharing',
      'Organized folders',
      'Professional-style storage tools',
    ],
  },
  nordvpn: {
    what: 'A service that protects your internet activity and privacy.',
    included: [
      'Secure internet connection',
      'Private browsing',
      'Protection on public Wi-Fi',
      'Data encryption',
    ],
  },
  expressvpn: {
    what: 'A fast VPN service for secure browsing.',
    included: [
      'High-speed secure connection',
      'Privacy protection',
      'Access on multiple devices',
      'Safe browsing',
    ],
  },
  incogni: {
    what: 'A service that helps remove your personal data from the internet.',
    included: [
      'Data removal requests',
      'Privacy protection',
      'Monitoring personal data exposure',
      'Reduced online tracking',
    ],
  },
  amclist: {
    what: 'A movie subscription that lets you watch multiple movies each week.',
    included: [
      'Up to 3 movies per week',
      'Access to AMC theaters',
      'Online booking',
      'Premium format options in some cases',
    ],
  },
  cinemark: {
    what: 'A monthly movie membership program.',
    included: [
      'Monthly movie credits',
      'Discounted tickets',
      'Concessions discounts',
      'Easy ticket booking',
    ],
  },
};
