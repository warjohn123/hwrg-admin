export function sumKeyValueArray(list: [{ [value: string]: number }]): number {
  return (list || []).reduce((total, item) => {
    const value = Object.values(item)[0];
    return total + (typeof value === 'number' ? value : 0);
  }, 0);
}
