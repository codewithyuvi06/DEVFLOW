
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiRequest } from '../services/api'
import { useAuth } from '../context/AuthContext'

interface AuthResponse {
  success: boolean
  message: string
  data?: {
    user: {
      id: string
      name: string
      email: string
    }
  }
}

export default function AuthPage() {
  const navigate = useNavigate()
  const { refreshUser } = useAuth()

  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login'

      const body = isRegister
        ? { name: name.trim(), email: email.trim(), password }
        : { email: email.trim(), password }

      const response = await apiRequest<AuthResponse>(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
      })

      if (!response.success || !response.data?.user) {
        throw new Error(response.message || 'Authentication failed.')
      }

      await refreshUser()
navigate('/', { replace: true })
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong.',
      )
    } finally {
      setLoading(false)
    }
  }

  function handleSocialLogin(provider: string) {
    setError(`${provider} sign-in is not configured yet.`)
  }

  return (
    <main className="auth-page">
      <section className="auth-card">

        <Link to="/login" className="auth-brand">
          DEV<span>FLOW</span>
        </Link>

        <p className="auth-eyebrow">
          YOUR DEVELOPMENT WORKSPACE
        </p>

        <h1>
          {isRegister ? 'Create your account' : 'Welcome back'}
        </h1>

        <p className="auth-description">
          {isRegister
            ? 'Join DEVFLOW and bring your development workflow together.'
            : 'Sign in to continue to your development workspace.'}
        </p>

        <div className="auth-social">
          <button
            type="button"
            className="auth-social-button"
            onClick={() => handleSocialLogin('Google')}
          >
            <svg
  className="auth-google-icon"
  viewBox="0 0 48 48"
  aria-hidden="true"
>
  <path fill="#4285F4" d="M43.6 24.5c0-1.5-.1-2.9-.4-4.3H24v8.1h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15.1Z" />
  <path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.6-5.1c-1.8 1.2-4.1 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44Z" />
  <path fill="#FBBC05" d="M12.6 27.7a12 12 0 0 1 0-7.4V15H5.8a20 20 0 0 0 0 18Z" />
  <path fill="#EA4335" d="M24 12.1c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 6.1 29.5 4 24 4A20 20 0 0 0 5.8 15l6.8 5.3c1.6-4.8 6.1-8.2 11.4-8.2Z" />
</svg>
            Continue with Google
          </button>

          <button
            type="button"
            className="auth-social-button"
            onClick={() => handleSocialLogin('GitHub')}
          >
            <svg
  className="auth-github-icon"
  viewBox="0 0 24 24"
  aria-hidden="true"
  fill="currentColor"
>
  <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.1c-3.1.67-3.76-1.32-3.76-1.32-.5-1.28-1.23-1.62-1.23-1.62-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15 1 .1.76 2.03 3.06 1.55.1-.72.39-1.2.7-1.48-2.47-.28-5.07-1.24-5.07-5.5 0-1.22.44-2.22 1.15-3-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.05 1.15a10.6 10.6 0 0 1 5.55 0c2.11-1.45 3.05-1.15 3.05-1.15.61 1.54.23 2.68.11 2.96.72.78 1.15 1.78 1.15 3 0 4.27-2.6 5.21-5.08 5.49.4.35.75 1.02.75 2.06v3.05c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" />
</svg>
            Continue with GitHub
          </button>
        </div>

        <div className="auth-divider">
          <span>OR CONTINUE WITH EMAIL</span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">

          {isRegister && (
            <label>
              Full name
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your full name"
                autoComplete="name"
                required
              />
            </label>
          )}

          <label>
            Email address
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label>
            Password

            <div className="auth-password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete={
                  isRegister ? 'new-password' : 'current-password'
                }
                minLength={isRegister ? 10 : undefined}
                required
              />

              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          <button
            className="button button-primary auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Please wait…'
              : isRegister
                ? 'Create account'
                : 'Sign in'}
          </button>
        </form>

        <p className="auth-switch">
          {isRegister
            ? 'Already have an account?'
            : "Don't have an account?"}{' '}

          <button
            type="button"
            onClick={() => {
              setIsRegister((current) => !current)
              setError('')
              setPassword('')
            }}
          >
            {isRegister ? 'Sign in' : 'Create account'}
          </button>
        </p>

        <p className="auth-footer">
          Secure access to your DEVFLOW workspace.
        </p>

      </section>
    </main>
  )
}
