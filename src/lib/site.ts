export const site = {
  name: 'Reed Dadoune',
  title: 'Reed Dadoune',
  tagline: 'Code Enthusiast',
  url: 'https://www.dadoune.com',
  email: 'reed@dadoune.com',
  github: 'ReedD',
  repo: 'https://github.com/ReedD/dadoune.com',
  description:
    'Reed Dadoune is a software engineer writing about infrastructure, containers, and the web.',
} as const;

export const nav = [
  { href: '/about', label: 'About' },
  { href: '/blog', label: 'Blog' },
  { href: '/projects', label: 'Projects' },
] as const;

export const socials = [
  { href: `https://github.com/${site.github}`, label: 'GitHub', icon: 'github' },
  {
    href: 'http://stackoverflow.com/users/3322075/reedd',
    label: 'Stack Overflow',
    icon: 'stackoverflow',
  },
  {
    href: 'https://www.linkedin.com/in/reed-dadoune-a3604a91',
    label: 'LinkedIn',
    icon: 'linkedin',
  },
  { href: `mailto:${site.email}`, label: 'Email', icon: 'mail' },
] as const;

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

/** Rough reading time, matching the "N min read" the 2019 mock called for. */
export function readingTime(body: string) {
  return Math.max(1, Math.round(body.trim().split(/\s+/).length / 200));
}

export function slugTag(tag: string) {
  return tag.toLowerCase().trim().replace(/[\s\-]+/g, '-');
}
