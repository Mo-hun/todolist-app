import useSettingsStore from '@/stores/settingsStore';
import TRANSLATIONS from '@/i18n/translations';

const useI18n = () => {
  const language = useSettingsStore((state) => state.language) || 'ko';

  const t = (key) => {
    const keys = key.split('.');
    let value = TRANSLATIONS[language]?.translation;

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key;
      }
    }

    return value || key;
  };

  return { t, language };
};

export default useI18n;
