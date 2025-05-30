import * as Crypto from 'expo-crypto';

export async function generateUUID() {
  const random = await Crypto.getRandomBytesAsync(16);
  const hex = Array.from(random).map(b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}
