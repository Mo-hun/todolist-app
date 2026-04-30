import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, InputField } from '@/components/common';
import { LanguageSwitcher, DarkModeToggle } from '@/components/settings';
import { useLoginMutation } from '@/hooks/useAuth';
import useI18n from '@/hooks/useI18n';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { mutate: login, isPending, error } = useLoginMutation();
  const { t } = useI18n();

  const handleSubmit = (e) => {
    e.preventDefault();
    login({ email, password });
  };

  const errorMessage = error?.response?.data?.error?.message || (error ? t('auth.loginError') : null);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <header className="border-b border-border-grid px-4 py-4 sm:px-6 dark:border-gray-600">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link to="/" className="text-xl font-bold text-black dark:text-gray-100">TodoList</Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <DarkModeToggle />
            <div className="flex gap-4">
              <Link to="/register" className="text-sm font-medium text-text-secondary hover:text-black dark:text-gray-400">{t('nav.register')}</Link>
              <Link to="/login" className="text-sm font-medium text-brand-blue">{t('nav.login')}</Link>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="hidden lg:block space-y-6">
            <div className="space-y-2">
              <h2 className="text-4xl font-bold text-black leading-tight dark:text-gray-100">
                {t('auth.loginHeroTitle')}
              </h2>
              <p className="text-lg text-text-secondary dark:text-gray-400">
                {t('auth.loginHeroDescription')}
              </p>
            </div>
            <ul className="space-y-4">
              {[
                t('auth.loginHighlightCategory'),
                t('auth.loginHighlightDueDate'),
                t('auth.loginHighlightStatus'),
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-black dark:text-gray-100">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="mx-auto w-full max-w-sm rounded-2xl border border-border-grid bg-white p-8 shadow-sm dark:border-gray-600 dark:bg-gray-800">
            <h1 className="text-2xl font-bold text-black mb-8 text-center lg:text-left dark:text-gray-100">{t('auth.loginTitle')}</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <InputField
                label={t('auth.email')}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.emailPlaceholder')}
                required
              />
              <InputField
                label={t('auth.password')}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.passwordPlaceholder')}
                required
              />
              {errorMessage && <p className="text-sm text-brand-red">{errorMessage}</p>}
              <Button type="submit" loading={isPending} disabled={isPending} className="w-full justify-center mt-2">
                {t('auth.loginButton')}
              </Button>
            </form>
            <p className="text-sm text-text-secondary text-center mt-6 dark:text-gray-400">
              {t('auth.noAccount')}{' '}
              <Link to="/register" className="text-brand-blue hover:underline">
                {t('nav.register')}
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
