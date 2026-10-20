// Keep explicitly entered fronts and share the remaining opening exactly.
export function distributeDrawerHeights(heights, manual, count, target, minimum = 30) {
  const result = Array.from({ length: count }, (_, i) => heights[i] ?? 100);
  const free = [];
  let fixed = 0;
  for (let i = 0; i < count; i++) {
    if (manual[i]) {
      if (!Number.isFinite(result[i]) || result[i] < minimum) return { error: 'Entered drawer heights must be at least 30 mm.' };
      fixed += result[i];
    } else free.push(i);
  }
  if (!free.length) return { error: 'All drawer heights are entered. Clear a height to let Auto adjust it.' };
  const remaining = target - fixed;
  if (remaining < free.length * minimum - 1e-8) return { error: 'Entered heights leave too little space for the remaining drawers. Reduce or clear an entered height.' };
  const each = remaining / free.length;
  for (const i of free) result[i] = each;
  return { heights: result };
}

export function additionalDrawerHeight(heights, manual, count, target, reveal) {
  if (count < 1 || count >= 10 || !Array.from({length:count}, (_, i) => manual[i] === true).every(Boolean)) return null;
  const remaining = target - heights.slice(0,count).reduce((sum,h) => sum + h,0) - reveal;
  return Number.isFinite(remaining) && remaining >= 30 ? remaining : null;
}
