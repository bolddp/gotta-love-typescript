export type MotorLimits = [number, number, string];

export const motorLimits: MotorLimits[] = [
  [0, 15, 'Idling'],
  [16, 30, 'Low'],
  [31, 65, 'Optimal'],
  [66, 85, 'High'],
  [86, 100, 'Harmful'],
];

const value = 67;
const motorLimitText = motorLimits.find((m) => value >= m[0] && value <= m[1])?.[2] ?? 'Unknown';

// MotorLimits type can be removed, but it has implications
