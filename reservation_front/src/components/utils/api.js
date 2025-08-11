// api.js
export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) throw new Error('Refresh token not found');

  const res = await fetch('http://localhost:8000/api/token/refresh/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!res.ok) {
    throw new Error('Invalid refresh token');
  }

  const data = await res.json();
  localStorage.setItem('access_token', data.access);
  return data.access;
}

export async function fetchWithAuth(url, options = {}) {
  let accessToken = localStorage.getItem('access_token');
  options.headers = {
    ...options.headers,
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  let res = await fetch(url, options);

  if (res.status === 401) {
    // توکن اکسس منقضی شده، تلاش برای رفرش
    try {
      accessToken = await refreshAccessToken();
      options.headers['Authorization'] = `Bearer ${accessToken}`;
      res = await fetch(url, options);
    } catch (err) {
      // رفرش توکن هم ناموفق بود، مثلا logout کن
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      throw new Error('لطفا دوباره وارد شوید.');
    }
  }

  return res;
}
