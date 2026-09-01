export const site = {
  name: 'Reed Dadoune',
  title: 'Reed Dadoune',
  tagline: 'Software Engineer',
  url: 'https://www.dadoune.com',
  email: 'reed@dadoune.com',
  github: 'ReedD',
  repo: 'https://github.com/ReedD/dadoune.com',
  description:
    'Reed Dadoune is a principal software engineer working on web performance, rendering at scale, and data platforms.',
} as const;

// Drives both the header and the footer.
//
// /blog is deliberately absent: the posts stay published and every old URL
// still resolves, they just are not advertised anywhere on the site. Do not
// re-add it without meaning to.
export const nav = [{ href: '/projects', label: 'Projects' }] as const;

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
