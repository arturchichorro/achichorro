import type { PostMeta } from "./content.ts";

export interface PostSeries {
  title: string;
  posts: string[];
}

export const postSeries: PostSeries[] = [
  {
    title: "bolota.eu",
    posts: ["1_bolotaeuv1", "6_bolotaeuv2", "15_bolotav3", "achichorrov4"],
  },
  {
    title: "Basketball shot counter",
    posts: ["7_sharing_and_buildspace", "10_bballvision"],
  },
];

export function validatePostSeries(posts: PostMeta[]) {
  const knownSlugs = new Set(posts.map((post) => post.slug));
  const assignedSlugs = new Set<string>();
  for (const series of postSeries) {
    for (const slug of series.posts) {
      if (!knownSlugs.has(slug)) throw new Error(`Unknown post "${slug}" in series "${series.title}"`);
      if (assignedSlugs.has(slug)) throw new Error(`Post "${slug}" appears more than once in the series registry`);
      assignedSlugs.add(slug);
    }
  }
}

export function seriesForPost(slug: string, posts: PostMeta[]) {
  const series = postSeries.find((series) => series.posts.includes(slug));
  if (!series) return undefined;

  const publishedPosts = new Map(posts.filter((post) => post.published !== false).map((post) => [post.slug, post]));
  const members = series.posts.flatMap((slug) => {
    const post = publishedPosts.get(slug);
    return post ? [post] : [];
  });
  const index = members.findIndex((post) => post.slug === slug);
  if (index < 0 || members.length < 2) return undefined;

  return {
    title: series.title,
    position: index + 1,
    total: members.length,
    previous: members[index - 1],
    next: members[index + 1],
  };
}
