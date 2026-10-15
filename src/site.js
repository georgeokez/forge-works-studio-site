// All editable site content lives here. Anything in [BRACKETS] is a
// placeholder still to be filled in.
export const site = {
  name: 'Forgeworks Studio',
  tagline: 'Crafted on purpose. Built to last.',
  description:
    'Forgeworks Studio designs, builds and looks after websites and custom software for businesses that value craft, clarity and the long run.',
  email: 'hello@forgeworks.studio', // [CONFIRM EMAIL]
  booking: true, // shows the "Now booking new projects" badge

  nav: [
    { href: '#services', label: 'Services' },
    { href: '#approach', label: 'Approach' },
    { href: '#work', label: 'Work' },
  ],

  social: [
    { label: 'LinkedIn', href: '#' }, // [ADD URL]
    { label: 'Instagram', href: '#' }, // [ADD URL]
    { label: 'X', href: '#' }, // [ADD URL]
  ],

  services: [
    {
      title: 'Websites',
      text: 'Business sites, landing pages and redesigns — fast, accessible and easy to update.',
      href: '#contact',
    },
    {
      title: 'Custom software',
      text: 'Web apps, client portals, dashboards and mobile apps shaped around how you work.',
      href: '#contact',
    },
    {
      title: 'Care & hosting',
      text: 'Managed hosting, security, backups and monthly improvements — so it keeps working.',
      href: '#contact',
    },
  ],

  // Scrolling marquee under the hero
  capabilities: [
    'Business websites',
    'Landing pages',
    'Web apps',
    'Client portals',
    'Dashboards',
    'Mobile apps',
    'Managed hosting',
    'Monthly care',
  ],

  principles: [
    { n: 'i.', title: 'Craft over shortcuts', text: "If it's worth building, it's worth building well." },
    { n: 'ii.', title: 'Built to last', text: 'We build for year three, not launch day.' },
    { n: 'iii.', title: 'Clarity, always', text: 'Plain language, fixed scopes, no surprises.' },
    { n: 'iv.', title: 'Partners, not vendors', text: 'We stay after launch. Your success is ours.' },
    { n: 'v.', title: 'Performance is a feature', text: 'Fast, accessible and secure by default.' },
  ],

  process: [
    { title: 'Discover', text: 'Goals, users and what success looks like.' },
    { title: 'Design', text: 'Clickable concepts before a line of code.' },
    { title: 'Forge', text: 'Built in short, visible, tested steps.' },
    { title: 'Launch', text: 'Live, with training and a clean handover.' },
    { title: 'Care', text: 'Hosting, updates and steady improvement.' },
  ],

  work: [
    {
      slug: 'the-bridge',
      name: 'The Bridge',
      color: '#2e3560',
      meta: 'Website · Recruitment & HR · 2026',
      headline: 'A credible home for a growing HR firm',
      summary:
        'Five pages designed to explain three services clearly and turn corporate visitors into consultations.',
      href: '#work', // [CASE STUDY URL]
    },
  ],

  budgets: ['Not sure yet', 'Under £5k', '£5k – £15k', '£15k – £40k', '£40k+'], // [CONFIRM RANGES]
  projectTypes: ['Website', 'Custom software / app', 'Care plan & hosting', 'Something else'],
};
