export interface Vector2 {
  x: number;
  y: number;
}
export const Vector2 = (x: number, y: number): Vector2 => ({ x, y })
Vector2.zero = Vector2(0, 0)
