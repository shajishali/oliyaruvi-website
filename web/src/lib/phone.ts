export function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  return phone;
}

export function telHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  const intl = digits.startsWith("0") ? `+94${digits.slice(1)}` : `+${digits}`;
  return `tel:${intl}`;
}

export function whatsAppHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  const intl = digits.startsWith("0") ? `94${digits.slice(1)}` : digits;
  return `https://wa.me/${intl}`;
}
