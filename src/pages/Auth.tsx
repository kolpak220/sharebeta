import React, { useMemo, useState } from 'react';
import { Eye, EyeOff, Lock, User as UserIcon, LogIn, UserPlus, ShieldCheck } from 'lucide-react';
import './Auth.css';

type AuthMode = 'login' | 'register';

const usernameRegex = /^[A-Za-z0-9_]{3,20}$/;

const getPasswordChecks = (password: string) => {
  return {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
};

const passwordStrengthScore = (password: string): number => {
  const checks = getPasswordChecks(password);
  return Object.values(checks).reduce((acc, ok) => acc + (ok ? 1 : 0), 0);
};

const Auth: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isUsernameValid = useMemo(() => usernameRegex.test(username), [username]);
  const pwdChecks = useMemo(() => getPasswordChecks(password), [password]);
  const pwdScore = passwordStrengthScore(password);
  const isPasswordStrong = pwdScore >= 4; // require 4/5 for registration
  const isConfirmMatch = mode === 'login' ? true : confirmPassword.length > 0 && confirmPassword === password;
  const meetsLoginPassword = password.length > 0; // login: only require non-empty
  const isFormValid = mode === 'login' ? (isUsernameValid && meetsLoginPassword) : (isUsernameValid && isPasswordStrong && isConfirmMatch);

  return (
    <div className="auth-page">
      <header className="auth-header glass-dark">
        <h1 className="page-title">Share</h1>
      </header>

      <div className="auth-content">
        <div className="auth-card glass">
          <div className="auth-tabs" role="tablist" aria-label="Auth tabs">
            <button
              className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
              role="tab"
              aria-selected={mode === 'login'}
              onClick={() => setMode('login')}
            >
              <LogIn size={16} />
              Login
            </button>
            <button
              className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
              role="tab"
              aria-selected={mode === 'register'}
              onClick={() => setMode('register')}
            >
              <UserPlus size={16} />
              Register
            </button>
          </div>

          <form className="auth-form" onSubmit={(e) => e.preventDefault()} noValidate>
            <label className="input-label" htmlFor="username">Username</label>
            <div className={`input-field ${isUsernameValid || username.length === 0 ? '' : 'error'}`}>
              <UserIcon size={18} className="input-icon" />
              <input
                id="username"
                type="text"
                placeholder="your_username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                inputMode="text"
                pattern="[A-Za-z0-9_]{3,20}"
                aria-invalid={!isUsernameValid && username.length > 0}
              />
            </div>
            <p className="helper-text">
              3–20 characters. Letters, numbers, and underscores only.
            </p>

            <label className="input-label" htmlFor="password">Password</label>
            <div className={`input-field ${mode === 'register' ? (isPasswordStrong || password.length === 0 ? '' : 'error') : ''}`}>
              <Lock size={18} className="input-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button type="button" className="icon-btn" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {mode === 'register' && (
              <>
                <label className="input-label" htmlFor="confirmPassword">Confirm Password</label>
                <div className={`input-field ${isConfirmMatch || confirmPassword.length === 0 ? '' : 'error'}`}>
                  <Lock size={18} className="input-icon" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  <button type="button" className="icon-btn" onClick={() => setShowConfirmPassword(v => !v)} aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {!isConfirmMatch && confirmPassword.length > 0 && (
                  <p className="error-text">Passwords do not match.</p>
                )}
              </>
            )}

            {mode === 'register' && (
              <>
                <div className="strength">
                  <div className={`bar ${pwdScore >= 1 ? 'on' : ''}`}></div>
                  <div className={`bar ${pwdScore >= 2 ? 'on' : ''}`}></div>
                  <div className={`bar ${pwdScore >= 3 ? 'on' : ''}`}></div>
                  <div className={`bar ${pwdScore >= 4 ? 'on' : ''}`}></div>
                  <div className={`bar ${pwdScore >= 5 ? 'on' : ''}`}></div>
                </div>
                <ul className="checklist">
                  <li className={pwdChecks.length ? 'ok' : ''}>At least 8 characters</li>
                  <li className={pwdChecks.upper ? 'ok' : ''}>Uppercase letter</li>
                  <li className={pwdChecks.lower ? 'ok' : ''}>Lowercase letter</li>
                  <li className={pwdChecks.number ? 'ok' : ''}>Number</li>
                  <li className={pwdChecks.special ? 'ok' : ''}>Special character</li>
                </ul>
              </>
            )}

            <button className="submit-btn" disabled={!isFormValid}>
              <ShieldCheck size={16} />
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;


