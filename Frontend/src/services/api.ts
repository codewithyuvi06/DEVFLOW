
const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1'

interface ApiOptions extends RequestInit {
  body?: BodyInit | null
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(
      data?.message || `Request failed with status ${response.status}`,
    )
  }

  return data as T
}
