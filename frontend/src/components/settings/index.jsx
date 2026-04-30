import useSettingsStore from '@/stores/settingsStore';

export function LanguageSwitcher() {
  const { language, setLanguage } = useSettingsStore();

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value)}
      className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-200"
    >
      <option value="ko">한국어</option>
      <option value="en">English</option>
      <option value="ja">日本語</option>
    </select>
  );
}

export function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useSettingsStore();

  return (
    <button
      onClick={toggleDarkMode}
      className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
    >
      {isDarkMode ? '☀️' : '🌙'}
    </button>
  );
}