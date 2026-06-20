import en from "./en";
import bn from "./bn";

export const languages = {
  en: { label: "English", flag: "🇺🇸", translations: en },
  bn: { label: "বাংলা", flag: "🇧🇩", translations: bn },
};

export const getTranslation = (lang) => {
  return languages[lang]?.translations || languages.en.translations;
};
