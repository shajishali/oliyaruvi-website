const storageKey = "oliyaruvi.localAdminToken";

export function getLocalAdminToken() {
  try {
    return localStorage.getItem(storageKey);
  } catch {
    return null;
  }
}

export function setLocalAdminToken(token: string) {
  localStorage.setItem(storageKey, token);
}

export function clearLocalAdminToken() {
  localStorage.removeItem(storageKey);
}
