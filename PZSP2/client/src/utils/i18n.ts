import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import plCommon from "../locales/pl/common.json";
import plErrors from "../locales/pl/errors.json";
import enCommon from "../locales/en/common.json";
import enErrors from "../locales/en/errors.json";

i18n.use(initReactI18next).init({
    resources: {
        pl: { common: plCommon, errors: plErrors },
        en: { common: enCommon, errors: enErrors },
    },
    lng: "pl",
    fallbackLng: "en",
    ns: ["common", "errors"],
    defaultNS: "common",
    interpolation: { escapeValue: false },
});

export default i18n;
