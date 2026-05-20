export function groupBy<TItem, TKey extends string | number>(
  items: TItem[],
  keyFn: (item: TItem) => TKey
): Record<TKey, TItem[]> {
  return items.reduce((acc, item) => {
    const key = keyFn(item);
    acc[key] = acc[key] || [];
    acc[key].push(item);
    return acc;
  }, {} as Record<TKey, TItem[]>);
}
