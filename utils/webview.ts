import * as Linking from 'expo-linking';
import {
  DOUBLE_SLASH_REGEX,
  HTTP_ORIGIN_REGEX,
  LEADING_TRAILING_SLASHES_REGEX,
  UUID_REGEX,
} from '../constants/regex';

export function parseDeepLinkToAppRoute(url: string | null): string | null {
  if (!url) return null;

  let parsed: ReturnType<typeof Linking.parse>;
  try {
    parsed = Linking.parse(url);
  } catch (e) {
    console.warn('Deep link parse error', e);
    return null;
  }

  let queryString = '';
  if (parsed.queryParams && Object.keys(parsed.queryParams).length > 0) {
    queryString =
      '?' +
      Object.entries(parsed.queryParams)
        .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
        .join('&');
  }

  const isFromScheme = parsed.scheme === 'yeogidot';
  const isShare = parsed.hostname === 'share';
  const rawPath = parsed.path ?? '';
  const pathForUuid = rawPath.replace(LEADING_TRAILING_SLASHES_REGEX, '');
  const isValidPath = pathForUuid.length > 0 && UUID_REGEX.test(pathForUuid);

  if (isFromScheme && isShare && !isValidPath) {
    console.warn('Invalid Link');
    return null;
  }
  return `/share/${pathForUuid}${queryString}`.replace(DOUBLE_SLASH_REGEX, '/');
}

export function buildWebViewTargetUri(
  baseUrl: string,
  initialRoute: string | null
): string {
  if (!initialRoute) {
    return baseUrl;
  }
  const originMatch = baseUrl.match(HTTP_ORIGIN_REGEX);
  const origin = originMatch ? originMatch[0] : baseUrl;
  return `${origin}${initialRoute}`;
}
