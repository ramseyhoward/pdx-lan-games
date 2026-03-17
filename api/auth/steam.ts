import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_request: VercelRequest, response: VercelResponse) {
  const baseURL = process.env.APP_URL!;

  const params = new URLSearchParams({
    'openid.ns': 'http://specs.openid.net/auth/2.0',
    'openid.mode': 'checkid_setup',
    'openid.return_to': `${baseURL}/api/auth/callback`,
    'openid.realm': baseURL,
    'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
  });

  response.json({ url: `https://steamcommunity.com/openid/login?${params}` });
}