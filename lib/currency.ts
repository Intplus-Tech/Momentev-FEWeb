export function majorToMinor(amount: number | string | null | undefined) {
  if (amount === null || amount === undefined || amount === "") {
    return 0;
  }

  const numericAmount = typeof amount === "string" ? Number(amount) : amount;

  if (Number.isNaN(numericAmount)) {
    return 0;
  }

  return Math.round(numericAmount * 100);
}

export function minorToMajor(amount: number | string | null | undefined) {
  if (amount === null || amount === undefined || amount === "") {
    return 0;
  }

  const numericAmount = typeof amount === "string" ? Number(amount) : amount;

  if (Number.isNaN(numericAmount)) {
    return 0;
  }

  return numericAmount / 100;
}
