export function sumKeyValueArray(list: [{ [value: string]: number }]): number {
  return (list || []).reduce((total, item) => {
    const value = item.value;
    return total + (typeof value === 'number' ? value : 0);
  }, 0);
}
