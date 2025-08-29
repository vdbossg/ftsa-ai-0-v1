import React, { createContext, useState, useEffect, useContext } from "react";
import APIControl from "../brain/APIControl";

// Create the context
const LanguageContext = createContext();

// Context provider
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("ENGLISH");

  // Load language from backend when app starts
  useEffect(() => {
    async function loadLanguage() {
      const data = await APIControl.fetchSettingsData();

      if (data && data.eaSettings !== undefined && data.language) {
        setLanguage(data.language);
      }
    }
    loadLanguage();
  }, []);

  const changeLanguage = (newLang) => {
    setLanguage(newLang);

    // Optionally, save immediately to backend
    APIControl.saveSettingsData({ language: newLang });
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook for easy use
export const useLanguage = () => useContext(LanguageContext);

// ==============================
// Translations Dictionary
// ==============================
export const translations = {
  apiIntegrations: {
    en: "API & Integrations",
    sw: "API na Muunganiko",
    es: "API e Integraciones",
    zh: "API 与集成",
    ar: "واجهات برمجة التطبيقات والتكامل",
    hi: "एपीआई और एकीकरण",
  },
  connected: {
    en: "CONNECTED 🟩",
    sw: "IMEUNGANISHWA 🟩",
    es: "CONECTADO 🟩",
    zh: "已连接 🟩",
    ar: "متصل 🟩",
    hi: "कनेक्टेड 🟩",
  },
  notConnected: {
    en: "NOT CONNECTED 🟥",
    sw: "HAIJAUNGANISHWA 🟥",
    es: "NO CONECTADO 🟥",
    zh: "未连接 🟥",
    ar: "غير متصل 🟥",
    hi: "कनेक्टेड नहीं 🟥",
  },
  languageSettings: {
    en: "Language Settings",
    sw: "Mipangilio ya Lugha",
    es: "Configuración de idioma",
    zh: "语言设置",
    ar: "إعدادات اللغة",
    hi: "भाषा सेटिंग्स",
  },
  en: {
    en: "English",
    sw: "Kiingereza",
    es: "Inglés",
    zh: "英语",
    ar: "الإنجليزية",
    hi: "अंग्रेज़ी",
  },
  sw: {
    en: "Swahili",
    sw: "Kiswahili",
    es: "Suajili",
    zh: "斯瓦西里语",
    ar: "السواحيلية",
    hi: "स्वाहिली",
  },
  es: {
    en: "Spanish",
    sw: "Kihispania",
    es: "Español",
    zh: "西班牙语",
    ar: "الإسبانية",
    hi: "स्पैनिश",
  },
  zh: {
    en: "Chinese",
    sw: "Kichina",
    es: "Chino",
    zh: "中文",
    ar: "الصينية",
    hi: "चीनी",
  },
  ar: {
    en: "Arabic",
    sw: "Kiarabu",
    es: "Árabe",
    zh: "阿拉伯语",
    ar: "العربية",
    hi: "अरबी",
  },
  hi: {
    en: "Hindi",
    sw: "Kihindi",
    es: "Hindi",
    zh: "印地语",
    ar: "الهندية",
    hi: "हिन्दी",
  },
  dataPrivacy: {
    en: "Data & Privacy",
    sw: "Takwimu na Faragha",
    es: "Datos y Privacidad",
    zh: "数据与隐私",
    ar: "البيانات والخصوصية",
    hi: "डेटा और गोपनीयता",
  },
  exportCsv: {
    en: "Export data as CSV",
    sw: "Hamisha data kama CSV",
    es: "Exportar datos como CSV",
    zh: "导出数据为 CSV",
    ar: "تصدير البيانات كملف CSV",
    hi: "डेटा को CSV में निर्यात करें",
  },
  exportingCsv: {
    en: "Exporting data as CSV...",
    sw: "Inahamisha data kama CSV...",
    es: "Exportando datos como CSV...",
    zh: "正在导出数据为 CSV...",
    ar: "جارٍ تصدير البيانات كملف CSV...",
    hi: "CSV के रूप में डेटा निर्यात हो रहा है...",
  },
  deleteAccount: {
    en: "Delete Account",
    sw: "Futa Akaunti",
    es: "Eliminar cuenta",
    zh: "删除账户",
    ar: "حذف الحساب",
    hi: "खाता हटाएँ",
  },
  deleteConfirm: {
    en: "Are you sure you want to DELETE your account? This action is irreversible.",
    sw: "Je, una uhakika unataka KUFUTA akaunti yako? Hatua hii haiwezi kubadilishwa.",
    es: "¿Está seguro de que desea ELIMINAR su cuenta? Esta acción es irreversible.",
    zh: "您确定要删除账户吗？此操作不可撤销。",
    ar: "هل أنت متأكد أنك تريد حذف حسابك؟ هذا الإجراء لا رجعة فيه.",
    hi: "क्या आप वाकई अपना खाता हटाना चाहते हैं? यह क्रिया अपरिवर्तनीय है।",
  },
  accountDeleted: {
    en: "Account deleted",
    sw: "Akaunti imefutwa",
    es: "Cuenta eliminada",
    zh: "账户已删除",
    ar: "تم حذف الحساب",
    hi: "खाता हटा दिया गया",
  },
  privacyPolicy: {
    en: "Privacy Policy",
    sw: "Sera ya Faragha",
    es: "Política de Privacidad",
    zh: "隐私政策",
    ar: "سياسة الخصوصية",
    hi: "गोपनीयता नीति",
  },
};
