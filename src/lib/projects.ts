import fallback from '../data/repos.json';
import { site } from './site';

export interface Repo {
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  fork: boolean;
  archived: boolean;
  pushed_at: string | null;
}

/** GitHub's own language colours, for the languages this account actually uses. */
export const languageColors: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Shell: '#89e051',
  Swift: '#F05138',
  PHP: '#4F5D95',
  Python: '#3572A5',
  Go: '#00ADD8',
  Rust: '#dea584',
  HTML: '#e34c26',
  CSS: '#563d7c',
  'Objective-C': '#438eff',
};

/**
 * Repos for the projects page, fetched at build time so the page stays static.
 * GitHub rate-limits unauthenticated calls hard, and a personal site should not
 * fail to build because of it, so a snapshot committed alongside is the fallback.
 */
export async function getRepos(): Promise<{ repos: Repo[]; live: boolean }> {
  try {
    const res = await fetch(
      `https://api.github.com/users/${site.github}/repos?type=owner&sort=pushed&per_page=100`,
      { headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'dadoune.com' } },
    );
    if (!res.ok) throw new Error(`GitHub responded ${res.status}`);

    const repos = (await res.json()) as Repo[];
    return { repos: shape(repos), live: true };
  } catch (error) {
    console.warn(`[projects] falling back to the committed snapshot: ${error}`);
    return { repos: shape(fallback as Repo[]), live: false };
  }
}

function shape(repos: Repo[]) {
  return repos
    .filter((r) => !r.fork)
    .sort((a, b) => {
      // Starred work first, then most recently pushed.
      if (b.stargazers_count !== a.stargazers_count) return b.stargazers_count - a.stargazers_count;
      return (b.pushed_at ?? '').localeCompare(a.pushed_at ?? '');
    });
}
