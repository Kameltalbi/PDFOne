import type { Request, Response } from 'express';
import { getPaidAccess } from '../middleware/quota.js';
import {
  premiumRequiredMessage,
  premiumRequiresPro,
  type PremiumFeature
} from '../config/monetization.js';

/**
 * Server-side gate for expensive features. Returns false after sending 402.
 * When the feature does not require Pro (legacy freemium), always allows.
 */
export async function assertPremiumAccess(
  req: Request,
  res: Response,
  feature: PremiumFeature
): Promise<boolean> {
  if (!premiumRequiresPro(feature)) return true;
  const access = await getPaidAccess(req, res);
  if (access) return true;
  res.status(402).json({
    success: false,
    code: 'PRO_REQUIRED',
    feature,
    error: premiumRequiredMessage(req, feature)
  });
  return false;
}
