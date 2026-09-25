// Rule-based suggestion generator per PRD 7.2
// Threshold-based static logic, fallback for AI enhancement

export function generateRuleBasedSuggestion(params: {
  humbleScore: number;
  hustleScore: number;
  totalScore: number;
  balanceIndex: number;
  humblePercentage: number;
  completionRate: number;
}): string {
  const { humbleScore, hustleScore, totalScore, balanceIndex, humblePercentage, completionRate } = params;

  if (totalScore === 0) {
    return "No completed tasks this week yet. Start small — add one light Hustle and one restorative Humble tomorrow to build momentum.";
  }

  const parts: string[] = [];

  // Balance framing (non-punitive per DESIGN 8)
  if (balanceIndex >= 80) {
    parts.push(`Great balance (balance index ${balanceIndex.toFixed(0)}). Hustle ${hustleScore.toFixed(0)} and Humble ${humbleScore.toFixed(0)} are nicely even — keep this rhythm.`);
  } else if (humblePercentage < 20) {
    parts.push(`Humble is only ${humblePercentage.toFixed(0)}% of ur week — burnout risk is rising. Try adding 1–2 recovery tasks (enough sleep, an easy walk, or journaling) for next week.`);
  } else if (humblePercentage > 80) {
    parts.push(`Humble dominates ${humblePercentage.toFixed(0)}% of ur week. Good for recovery, but if u have productivity goals, try mixing in 1–2 light Hustles.`);
  } else if (humblePercentage < 35) {
    parts.push(`The ratio still leans Hustle (${(100 - humblePercentage).toFixed(0)}% Hustle). Balance index ${balanceIndex.toFixed(0)} — add a little Humble to protect ur energy.`);
  } else if (humblePercentage > 65) {
    parts.push(`The ratio leans Humble (${humblePercentage.toFixed(0)}% Humble). Balance index ${balanceIndex.toFixed(0)} — consider one focused Hustle next week.`);
  } else {
    parts.push(`Balance index ${balanceIndex.toFixed(0)} — fairly balanced. Aim for consistency, not perfection.`);
  }

  // Completion rate insight
  if (completionRate < 0.5) {
    parts.push(`Completion rate ${(completionRate * 100).toFixed(0)}% — many tasks slipped. Try fewer tasks per day, or break big tasks into tiny steps to make them more achievable.`);
  } else if (completionRate < 0.8) {
    parts.push(`Completion rate ${(completionRate * 100).toFixed(0)}% — nicely consistent. Focusing on 1–2 priority tasks per day could lift it further.`);
  } else {
    parts.push(`Completion rate ${(completionRate * 100).toFixed(0)}% — impressively consistent!`);
  }

  return parts.join(" ");
}
