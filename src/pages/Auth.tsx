import React, { useMemo, useState } from 'react';
import { Eye, EyeOff, Lock, User as UserIcon, LogIn, UserPlus, ShieldCheck } from 'lucide-react';
import styles from './Auth.module.css';

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
  const isFormValid = mode === 'login'
    ? (username.length > 0 && meetsLoginPassword)
    : (isUsernameValid && isPasswordStrong && isConfirmMatch);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload = mode === 'login'
      ? { mode, username, password }
      : { mode, username, password, confirmPassword, passwordStrength: pwdScore, passwordChecks: pwdChecks };
    console.log('Auth submit:', payload);
  };

  return (
    <div className={styles.authPage}>
      <header className={`glass-dark ${styles.authHeader}`}>
        <h1 className="page-title">Share</h1>
      </header>

      <div className={styles.authContent}>
        <div className={`glass ${styles.authCard}`}>
          <div className={styles.authTabs} role="tablist" aria-label="Auth tabs">
            <button
              className={`${styles.authTab} ${mode === 'login' ? styles.active : ''}`}
              role="tab"
              aria-selected={mode === 'login'}
              onClick={() => setMode('login')}
            >
              <LogIn size={16} />
              Login
            </button>
            <button
              className={`${styles.authTab} ${mode === 'register' ? styles.active : ''}`}
              role="tab"
              aria-selected={mode === 'register'}
              onClick={() => setMode('register')}
            >
              <UserPlus size={16} />
              Register
            </button>
          </div>

          <form className={styles.authForm} onSubmit={handleSubmit} noValidate>
            <label className={styles.inputLabel} htmlFor="username">Username</label>
            <div className={`${styles.inputField} ${mode === 'register' && !isUsernameValid && username.length > 0 ? styles.error : ''}`}>
              <UserIcon size={18} className={styles.inputIcon} />
              <input
                id="username"
                type="text"
                placeholder="your_username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                inputMode="text"
                pattern={mode === 'register' ? "[A-Za-z0-9_]{3,20}" : undefined}
                aria-invalid={mode === 'register' ? (!isUsernameValid && username.length > 0) : undefined}
              />
            </div>
            {mode === 'register' && (
              <p className={styles.helperText}>
                3–20 characters. Letters, numbers, and underscores only.
              </p>
            )}

            <label className={styles.inputLabel} htmlFor="password">Password</label>
            <div className={`${styles.inputField} ${mode === 'register' ? (isPasswordStrong || password.length === 0 ? '' : styles.error) : ''}`}>
              <Lock size={18} className={styles.inputIcon} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button type="button" className={styles.iconBtn} onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {mode === 'register' && (
              <>
                <label className={styles.inputLabel} htmlFor="confirmPassword">Confirm Password</label>
                <div className={`${styles.inputField} ${isConfirmMatch || confirmPassword.length === 0 ? '' : styles.error}`}>
                  <Lock size={18} className={styles.inputIcon} />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  <button type="button" className={styles.iconBtn} onClick={() => setShowConfirmPassword(v => !v)} aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {!isConfirmMatch && confirmPassword.length > 0 && (
                  <p className={styles.errorText}>Passwords do not match.</p>
                )}
              </>
            )}

            {mode === 'register' && (
              <>
                <div className={styles.strength}>
                  <div className={`${styles.bar} ${pwdScore >= 1 ? styles.on : ''}`}></div>
                  <div className={`${styles.bar} ${pwdScore >= 2 ? styles.on : ''}`}></div>
                  <div className={`${styles.bar} ${pwdScore >= 3 ? styles.on : ''}`}></div>
                  <div className={`${styles.bar} ${pwdScore >= 4 ? styles.on : ''}`}></div>
                  <div className={`${styles.bar} ${pwdScore >= 5 ? styles.on : ''}`}></div>
                </div>
                <ul className={styles.checklist}>
                  <li className={pwdChecks.length ? styles.ok : ''}>At least 8 characters</li>
                  <li className={pwdChecks.upper ? styles.ok : ''}>Uppercase letter</li>
                  <li className={pwdChecks.lower ? styles.ok : ''}>Lowercase letter</li>
                  <li className={pwdChecks.number ? styles.ok : ''}>Number</li>
                  <li className={pwdChecks.special ? styles.ok : ''}>Special character</li>
                </ul>
              </>
            )}

            <button className={styles.submitBtn} disabled={!isFormValid}>
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


