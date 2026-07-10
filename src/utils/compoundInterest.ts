/**
 * Compound interest growth projections.
 *
 * ## Formula
 *
 * Monthly compounding with end-of-period contributions (ordinary annuity):
 * ```
 * monthlyRate = annualInterestRate / 100 / 12
 * balance[i]  = balance[i-1] × (1 + monthlyRate) + monthlyContribution
 * ```
 *
 * ## Assumptions
 *
 * - Interest compounds **monthly** (annual rate ÷ 12). No intra-month compounding.
 * - Contributions are made at the **end** of each period (post-interest).
 * - Rate input is a **whole-number percentage** (e.g. `7.5` = 7.5%, not 0.075).
 * - No taxes, fees, or inflation adjustments.
 *
 * ## Units and Integer Arithmetic
 *
 * All monetary inputs/outputs are in the **same abstract unit** as the rest of the
 * app (typically cents/pence as integers). The projection output is a floating-point
 * number because compounding inherently produces fractional results. The UI should
 * round display values to the nearest cent/pence using `formatCurrency()`.
 *
 * Deposits are recorded in Firestore as integer cents (`currentAmount + depositCents`).
 * Projections are **forward-looking estimates only** — they do not affect stored balances.
 *
 * ## Limits
 *
 * - `estimateCompletionMonths` caps iteration at 1200 months (100 years).
 * - Returns `Infinity` when growth is impossible (no contributions and no interest).
 *
 * @module
 */

/**
 * Project month-by-month balance growth with monthly compound interest.
 *
 * @param currentBalance  - Starting balance (same unit as deposits, e.g. cents)
 * @param monthlyContribution - Amount added each month after interest
 * @param annualInterestRate  - Annual rate as whole-number percentage (e.g. 7.5 for 7.5%)
 * @param months - Number of months to project (0 returns empty array)
 * @returns Array of length `months` with the balance at the end of each month
 *
 * @example
 * // £1000 starting, £100/month, 12% annual, 3 months
 * projectGrowth(1000, 100, 12, 3)
 * // → [1110, 1222.10, 1336.32]
 */
export function projectGrowth(
  currentBalance: number,
  monthlyContribution: number,
  annualInterestRate: number,
  months: number
): number[] {
  const monthlyRate = annualInterestRate / 100 / 12;
  const balances: number[] = [];
  let balance = currentBalance;
  for (let i = 0; i < months; i++) {
    balance = balance * (1 + monthlyRate) + monthlyContribution;
    balances.push(balance);
  }
  return balances;
}

/**
 * Estimate how many months until the balance reaches the target.
 *
 * Uses the same monthly compounding formula as {@link projectGrowth}.
 * Iterates until `balance >= targetAmount` or the 1200-month safety cap is hit.
 *
 * @param currentBalance    - Starting balance
 * @param targetAmount      - Savings goal to reach
 * @param monthlyContribution - Amount added each month
 * @param annualInterestRate  - Annual rate as whole-number percentage
 * @returns Number of months, or `Infinity` if the target is unreachable
 *
 * @example
 * // £0 starting, £100/month, 0% interest, £1200 target
 * estimateCompletionMonths(0, 1200, 100, 0) // → 12
 */
export function estimateCompletionMonths(
  currentBalance: number,
  targetAmount: number,
  monthlyContribution: number,
  annualInterestRate: number
): number {
  // Cannot grow without contributions or interest, or without a starting balance to compound
  if (monthlyContribution <= 0 && (annualInterestRate <= 0 || currentBalance <= 0)) {
    return Infinity;
  }
  const monthlyRate = annualInterestRate / 100 / 12;
  let balance = currentBalance;
  let months = 0;
  while (balance < targetAmount && months < 1200) {
    balance = balance * (1 + monthlyRate) + monthlyContribution;
    months++;
  }
  return months;
}
