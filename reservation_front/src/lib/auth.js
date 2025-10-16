export const getAccessToken = () => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('access')
}

export const getRefreshToken = () => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('refresh')
}

export const setTokens = (access, refresh) => {
  if (typeof window === 'undefined') return
  localStorage.setItem('access', access)
  localStorage.setItem('refresh', refresh)
}

export const clearTokens = () => {
  if (typeof window === 'undefined') return
  localStorage.removeItem('access')
  localStorage.removeItem('refresh')
}
