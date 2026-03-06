import Fuse, { IFuseOptions } from 'fuse.js';
import { SearchQuery } from '@/shared/types/filterPreset';

export function performFuzzySearch<T>(
  data: T[],
  query: SearchQuery
): T[] {
  if (!query.text.trim()) {
    return data;
  }

  const options: IFuseOptions<T> = {
    keys: query.fields as string[],
    threshold: query.fuzzy ? 0.4 : 0.0,
    includeScore: true,
    minMatchCharLength: 2,
  };

  const fuse = new Fuse(data, options);
  const results = fuse.search(query.text);

  let filtered = results.map(result => result.item);

  if (query.minScore !== undefined) {
    filtered = filtered.filter((_, index) => {
      const score = results[index].score;
      return score !== undefined && score <= (1 - query.minScore! / 100);
    });
  }

  return filtered;
}

export function highlightMatches(text: string, query: string): string {
  if (!query.trim()) return text;

  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}
