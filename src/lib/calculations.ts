export function calculateFlatInterest(principal: number, rate: number, tenorMonths: number) {
  const totalInterest = principal * (rate / 100) * (tenorMonths / 12)
  const totalPayment = principal + totalInterest
  const installmentAmount = totalPayment / tenorMonths
  return { totalInterest, totalPayment, installmentAmount }
}

export function calculateLateFee(totalAmount: number, lateDays: number, rate: number = 1): number {
  if (lateDays <= 0) return 0
  return Math.round(totalAmount * (rate / 100) * (lateDays / 30))
}

export function calculateSimpananBalance(transactions: Array<{type: 'deposit' | 'withdrawal', amount: number}>): number {
  return transactions.reduce((sum, t) =>
    t.type === 'deposit' ? sum + t.amount : sum - t.amount, 0
  )
}
