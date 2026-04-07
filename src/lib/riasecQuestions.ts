import { RiasecCategory, RiasecQuestion } from '../types/riasec';

export const RIASEC_CATEGORY_LABELS: Record<RiasecCategory, string> = {
  R: 'Realistic',
  I: 'Investigative',
  A: 'Artistic',
  S: 'Social',
  E: 'Enterprising',
  C: 'Conventional',
};

export const RIASEC_CATEGORY_DESCRIPTIONS: Record<RiasecCategory, string> = {
  R: 'You may enjoy hands-on work, building, fixing, tools, machines, nature, or active projects.',
  I: 'You may enjoy asking questions, solving problems, researching, science, data, or figuring out how things work.',
  A: 'You may enjoy creating, designing, writing, performing, imagining, or expressing your ideas.',
  S: 'You may enjoy helping, teaching, listening, caring for others, or working with people.',
  E: 'You may enjoy leading, persuading, starting projects, selling ideas, or making decisions.',
  C: 'You may enjoy organizing, planning, tracking details, working with numbers, or following clear systems.',
};

export const RIASEC_MATCHED_CAREERS: Record<RiasecCategory, string[]> = {
  R: ['Automotive Technician', 'Electrician', 'Robotics Technician', 'Construction Manager'],
  I: ['Nurse Practitioner', 'Data Analyst', 'Lab Technician', 'Software Developer'],
  A: ['Graphic Designer', 'Video Producer', 'Interior Designer', 'Writer'],
  S: ['Teacher', 'Counselor', 'Social Worker', 'Physical Therapist'],
  E: ['Entrepreneur', 'Marketing Manager', 'Real Estate Agent', 'Sales Manager'],
  C: ['Accountant', 'Project Coordinator', 'Office Manager', 'Financial Analyst'],
};

export const RIASEC_QUESTIONS: RiasecQuestion[] = [
  { id: 'r-1', category: 'R', prompt: 'Fix or build something with tools.' },
  { id: 'i-1', category: 'I', prompt: 'Research a question until you understand the answer.' },
  { id: 'a-1', category: 'A', prompt: 'Design a poster, video, song, outfit, or game world.' },
  { id: 's-1', category: 'S', prompt: 'Help a classmate learn something new.' },
  { id: 'e-1', category: 'E', prompt: 'Lead a team project or pitch an idea.' },
  { id: 'c-1', category: 'C', prompt: 'Organize a budget, schedule, or checklist.' },
  { id: 'r-2', category: 'R', prompt: 'Work outside or do an active hands-on job.' },
  { id: 'i-2', category: 'I', prompt: 'Use clues and evidence to solve a problem.' },
  { id: 'a-2', category: 'A', prompt: 'Create something original from your own ideas.' },
  { id: 's-2', category: 'S', prompt: 'Listen to someone and help them feel supported.' },
  { id: 'e-2', category: 'E', prompt: 'Start a club, small business, or fundraiser.' },
  { id: 'c-2', category: 'C', prompt: 'Keep records neat and make sure details are correct.' },
  { id: 'r-3', category: 'R', prompt: 'Use machines, equipment, or technology to make something work.' },
  { id: 'i-3', category: 'I', prompt: 'Run an experiment or compare different solutions.' },
  { id: 'a-3', category: 'A', prompt: 'Tell stories through art, music, writing, or media.' },
  { id: 's-3', category: 'S', prompt: 'Work with kids, patients, customers, or community members.' },
  { id: 'e-3', category: 'E', prompt: 'Convince people to support a plan or goal.' },
  { id: 'c-3', category: 'C', prompt: 'Use spreadsheets, forms, or systems to stay organized.' },
];
