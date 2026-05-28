export function formatMoney(
  minor: number | string | null | undefined,
  currency = "GBP",
  localeOrOptions: string | Intl.NumberFormatOptions = "en-GB",
) {
  if (minor === undefined || minor === null || minor === "") return "";

  const n = typeof minor === "string" ? Number(minor) : minor;
  if (Number.isNaN(n)) return "";

  const major = n / 100;
  if (typeof localeOrOptions === "string") {
    return new Intl.NumberFormat(localeOrOptions, { style: "currency", currency }).format(major);
  }

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    ...localeOrOptions,
  }).format(major);
}

export default formatMoney;
