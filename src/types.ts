export interface IBlog {
  body: string;
  publishedAt: string;
  slug: number;
  subTitle: string;
  tags: string[];
  title: string;
}

export interface IRepo {
  description: string;
  fork: boolean;
  forks_count: number;
  html_url: string;
  language: string;
  language_color: string;
  name: string;
  pushed_at: string;
  stargazers_count: number;
}
