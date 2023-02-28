export function cn(names: Record<string, boolean>): string {
  return Object.entries(names).filter(([, b]) => b).map(([k]) => k).join(' ')
}
