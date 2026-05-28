export function formatMoney(
  minor: number | string | null | undefined,
  currency = "GBP",
  locale = "en-GB",
) {
  if (minor === undefined || minor === null || minor === "") return "";

  const n = typeof minor === "string" ? Number(minor) : minor;
  if (Number.isNaN(n)) return "";

  const major = n / 100;
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(major);
}

export default formatMoney;
