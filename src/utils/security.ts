// Simple PIN hash & verification matching SecurityUtils from Android

export function hashPin(plainPin: string): string {
  let hash = 0;
  const str = `agro_salt_${plainPin.trim()}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `pin_hash_${Math.abs(hash)}`;
}

export function verifyPin(enteredPin: string, storedHash: string): boolean {
  if (!storedHash) return false;
  // If storedHash is already direct format or matches hashPin
  return hashPin(enteredPin) === storedHash || enteredPin === storedHash;
}
