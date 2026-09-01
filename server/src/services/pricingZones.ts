import type { Request } from 'express';
import type { PaidPlan } from './entitlements.js';
import { clientIp } from '../utils/cookies.js';

export type PricingZone = 'A' | 'B';

export type PlanAmounts = Record<PaidPlan, number>;

/** Amounts in USD cents. Zone A is the default if geo detection fails.
 *  Former Zone C countries share Zone B prices. */
export const ZONE_AMOUNTS: Record<PricingZone, PlanAmounts> = {
  A: { week: 199, month: 399, year: 3490 },
  B: { week: 149, month: 299, year: 2490 }
};

export const DEFAULT_ZONE: PricingZone = 'A';

const LOOKUP_TTL_MS = 24 * 60 * 60 * 1000;
const countryCache = new Map<string, { country: string | null; until: number }>();

function list(codes: string): Set<string> {
  return new Set(codes.split(/\s+/).filter(Boolean));
}

/** Latin America, North Africa, Turkey, Caucasus, Central Asia */
const ZONE_B = list(`
  AG AR AW BB BO BR BS BZ CL CO CR CU CW DM DO EC GD GT GY HN HT JM KN KY LC MX NI PA PE PY SR SV TT UY VC VE
  AM AZ GE KG KZ TJ TM TR UZ
  DZ EG EH LY MA TN
`);

/** India, Indonesia, Pakistan, Nigeria, Southeast Asia, sub-Saharan Africa, nearby South Asia */
const ZONE_C = list(`
  IN ID PK NG BD LK NP AF BT MV
  BN KH LA MM MY PH SG TH TL VN
  AO BF BI BJ BW CD CF CG CI CM CV DJ ER ET GA GH GM GN GQ GW KE KM LR LS MG ML MR MU MW MZ
  NA NE RW SC SD SL SN SO SS ST SZ TD TG TZ UG ZA ZM ZW
`);

const NORTH_AFRICA_TZ = new Set([
  'Africa/Algiers',
  'Africa/Cairo',
  'Africa/Casablanca',
  'Africa/El_Aaiun',
  'Africa/Tripoli',
  'Africa/Tunis'
]);

const ZONE_B_TZ = new Set([
  'America/Argentina/Buenos_Aires',
  'America/Argentina/Catamarca',
  'America/Argentina/Cordoba',
  'America/Argentina/Jujuy',
  'America/Argentina/La_Rioja',
  'America/Argentina/Mendoza',
  'America/Argentina/Rio_Gallegos',
  'America/Argentina/Salta',
  'America/Argentina/San_Juan',
  'America/Argentina/San_Luis',
  'America/Argentina/Tucuman',
  'America/Argentina/Ushuaia',
  'America/Asuncion',
  'America/Bahia',
  'America/Barbados',
  'America/Belem',
  'America/Belize',
  'America/Bogota',
  'America/Boa_Vista',
  'America/Campo_Grande',
  'America/Cancun',
  'America/Caracas',
  'America/Cayenne',
  'America/Chihuahua',
  'America/Costa_Rica',
  'America/Cuiaba',
  'America/Curacao',
  'America/El_Salvador',
  'America/Fortaleza',
  'America/Guatemala',
  'America/Guayaquil',
  'America/Guyana',
  'America/Havana',
  'America/Hermosillo',
  'America/Jamaica',
  'America/La_Paz',
  'America/Lima',
  'America/Maceio',
  'America/Managua',
  'America/Manaus',
  'America/Martinique',
  'America/Matamoros',
  'America/Mazatlan',
  'America/Merida',
  'America/Mexico_City',
  'America/Monterrey',
  'America/Montevideo',
  'America/Nassau',
  'America/Noronha',
  'America/Panama',
  'America/Paramaribo',
  'America/Port-au-Prince',
  'America/Port_of_Spain',
  'America/Porto_Velho',
  'America/Recife',
  'America/Rio_Branco',
  'America/Santiago',
  'America/Santo_Domingo',
  'America/Sao_Paulo',
  'America/Tegucigalpa',
  'America/Tijuana',
  'Europe/Istanbul',
  'Asia/Almaty',
  'Asia/Baku',
  'Asia/Bishkek',
  'Asia/Dushanbe',
  'Asia/Tashkent',
  'Asia/Tbilisi',
  'Asia/Yerevan'
]);

const ZONE_C_TZ = new Set([
  'Asia/Kolkata',
  'Asia/Calcutta',
  'Asia/Karachi',
  'Asia/Dhaka',
  'Asia/Colombo',
  'Asia/Kathmandu',
  'Asia/Thimphu',
  'Asia/Kabul',
  'Asia/Jakarta',
  'Asia/Pontianak',
  'Asia/Makassar',
  'Asia/Jayapura',
  'Asia/Bangkok',
  'Asia/Ho_Chi_Minh',
  'Asia/Saigon',
  'Asia/Phnom_Penh',
  'Asia/Vientiane',
  'Asia/Yangon',
  'Asia/Rangoon',
  'Asia/Manila',
  'Asia/Kuala_Lumpur',
  'Asia/Kuching',
  'Asia/Singapore',
  'Asia/Brunei',
  'Asia/Dili',
  'Indian/Maldives',
  'Indian/Antananarivo',
  'Indian/Mauritius'
]);

export function zoneFromCountry(code: string | null | undefined): PricingZone {
  const country = normalizeCountry(code);
  if (!country) return DEFAULT_ZONE;
  if (ZONE_C.has(country) || ZONE_B.has(country)) return 'B';
  return DEFAULT_ZONE;
}

export function amountsForZone(zone: string | null | undefined): PlanAmounts {
  if (zone === 'B' || zone === 'C') return ZONE_AMOUNTS.B;
  return ZONE_AMOUNTS.A;
}

function normalizeCountry(code: string | null | undefined): string | null {
  const value = String(code || '').trim().toUpperCase();
  if (!value || value === 'XX' || value === 'T1') return null;
  if (value === 'UK') return 'GB';
  if (!/^[A-Z]{2}$/.test(value)) return null;
  return value;
}

function isPrivateIp(ip: string): boolean {
  const v4 = ip.replace(/^::ffff:/i, '');
  if (!v4 || v4 === 'unknown' || v4 === 'localhost' || v4 === '::1' || v4 === '127.0.0.1') return true;
  if (v4 === '::' || /^f[cd]/i.test(ip)) return true;
  if (/^10\./.test(v4) || /^192\.168\./.test(v4) || /^127\./.test(v4)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(v4)) return true;
  if (/^169\.254\./.test(v4)) return true;
  return false;
}

function requestIp(req: Request): string {
  return req.ip || clientIp(req);
}

function headerCountry(req: Request): string | null {
  const cfConnecting = req.headers['cf-connecting-ip'];
  const cfCountry = req.headers['cf-ipcountry'];
  if (cfConnecting && cfCountry) {
    const country = normalizeCountry(String(Array.isArray(cfCountry) ? cfCountry[0] : cfCountry));
    if (country) return country;
  }

  const cfViewerIp = req.headers['cloudfront-viewer-address'];
  const cfViewerCountry = req.headers['cloudfront-viewer-country'];
  if (cfViewerIp && cfViewerCountry) {
    const country = normalizeCountry(String(Array.isArray(cfViewerCountry) ? cfViewerCountry[0] : cfViewerCountry));
    if (country) return country;
  }

  return null;
}

function zoneFromTimezone(tz: string): PricingZone | null {
  const name = tz.trim();
  if (!name) return null;
  if (ZONE_C_TZ.has(name) || ZONE_B_TZ.has(name)) return 'B';
  if (name.startsWith('Africa/') && !NORTH_AFRICA_TZ.has(name)) return 'B';
  if (NORTH_AFRICA_TZ.has(name)) return 'B';
  return null;
}

async function lookupCountry(ip: string): Promise<string | null> {
  const now = Date.now();
  const cached = countryCache.get(ip);
  if (cached && cached.until > now) return cached.country;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 1800);
  try {
    const response = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) {
      countryCache.set(ip, { country: null, until: now + 5 * 60 * 1000 });
      return null;
    }
    const payload = await response.json() as { success?: boolean; country_code?: string };
    const country = payload.success === false ? null : normalizeCountry(payload.country_code);
    countryCache.set(ip, { country, until: now + LOOKUP_TTL_MS });
    return country;
  } catch {
    countryCache.set(ip, { country: null, until: now + 5 * 60 * 1000 });
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Detect the visitor pricing zone.
 * 1) CDN/country headers  2) IP lookup  3) browser timezone header  4) Zone A
 * Never persist the IP. Checkout must use this same function so display and charge match.
 */
export async function detectPricingZone(req: Request): Promise<PricingZone> {
  const fromHeader = headerCountry(req);
  if (fromHeader) return zoneFromCountry(fromHeader);

  const ip = requestIp(req);
  if (!isPrivateIp(ip)) {
    const looked = await lookupCountry(ip);
    if (looked) return zoneFromCountry(looked);
  }

  const tzHeader = req.headers['x-timezone'];
  const tz = String(Array.isArray(tzHeader) ? tzHeader[0] : tzHeader || '');
  const fromTz = zoneFromTimezone(tz);
  if (fromTz) return fromTz;

  return DEFAULT_ZONE;
}
