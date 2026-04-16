import { atom } from 'nanostores';
import type { VerifyResult } from './types';

export const $scannedPayload = atom<string | null>(null);
export const $verifyResult = atom<VerifyResult | null>(null);
export const $isVerifying = atom<boolean>(false);
