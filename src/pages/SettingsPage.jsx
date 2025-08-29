// src/pages/SettingsPage.jsx
import React, { useState, useEffect } from "react";
import NeonButton from "../components/NeonButton";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../contexts/AuthContext";
import APIControl from "../brain/APIControl";
import "../styles/SettingsPage.css";
import { useLanguage } from "../contexts/LanguageContext";


export const translations = {
  ENGLISH: {
    profileSettings: "PROFILE SETTINGS",
    profitPhoto: "Profit Photo URL",
    firstName: "First Name",
    middleName: "Middle Name",
    sirName: "Sir Name",
    phoneNumber: "Phone Number",
    email: "Email",
    county: "County",
    securitySettings: "SECURITY SETTINGS",
    oldPassword: "Old Password",
    newPassword: "New Password",
    confirmNewPassword: "Confirm New Password",
    twoFactorAuth: "Two-Factor Authentication",
    notificationPreferences: "NOTIFICATION PREFERENCES",
    themeCustomization: "THEME CUSTOMIZATION",
    darkMode: "Dark Mode",
    neonAccentColor: "Neon Accent Color",
    eaSettings: "EA SETTINGS",
    tradingPairs: "Trading Pairs (comma separated)",
    riskPerTrade: "Risk per Trade (%)",
    dailyTP: "Daily Take Profit (%)",
    dailySL: "Daily Stop Loss (%)",
    apiIntegrations: "API & INTEGRATIONS",
    connected: "CONNECTED 🟩",
    notConnected: "NOT CONNECTED 🟥",
    dataPrivacy: "DATA & PRIVACY",
    exportData: "Export data as CSV",
    deleteAccount: "Delete Account",
    privacyPolicy: "Privacy Policy",
    languageSettings: "LANGUAGE SETTINGS",
    saveSettings: "Save Settings",
    pleaseLogin: "Please login to access settings.",
    on: "ON",
    off: "OFF"
  },

  SWAHILI: {
    profileSettings: "MPANGILIKO WA PROFAYILI",
    profitPhoto: "URL ya Picha ya Faida",
    firstName: "Jina la Kwanza",
    middleName: "Jina la Kati",
    sirName: "Jina la Mwisho",
    phoneNumber: "Nambari ya Simu",
    email: "Barua Pepe",
    county: "Kaunti",
    securitySettings: "MPANGILIKO WA USALAMA",
    oldPassword: "Nenosiri la Zamani",
    newPassword: "Nenosiri Jipya",
    confirmNewPassword: "Thibitisha Nenosiri Jipya",
    twoFactorAuth: "Uthibitisho wa Hatua Mbili",
    notificationPreferences: "UPREFERENSI ZA TAARIFA",
    themeCustomization: "UBADILISHO WA MUUNDO",
    darkMode: "Hali ya Giza",
    neonAccentColor: "Rangi ya Neon",
    eaSettings: "MPANGILIKO WA EA",
    tradingPairs: "Jozi za Biashara (zagawanywe kwa koma)",
    riskPerTrade: "Hatari kwa Biashara (%)",
    dailyTP: "Faida ya Kila Siku (%)",
    dailySL: "Hasara ya Kila Siku (%)",
    apiIntegrations: "API & INTEGRATIONS",
    connected: "IMEUNGANISHWA 🟩",
    notConnected: "HAIJUNGANISHWA 🟥",
    dataPrivacy: "DATA & USALAMA",
    exportData: "Hamisha data kama CSV",
    deleteAccount: "Futa Akaunti",
    privacyPolicy: "Sera ya Usalama",
    languageSettings: "MPANGILIKO WA LUGHA",
    saveSettings: "Hifadhi Mpangilio",
    pleaseLogin: "Tafadhali ingia ili kupata mpangilio.",
    on: "WAKO",
    off: "ZIMEZIMWA"
  },

  SPANISH: {
    profileSettings: "CONFIGURACIÓN DE PERFIL",
    profitPhoto: "URL de Foto de Ganancias",
    firstName: "Nombre",
    middleName: "Segundo Nombre",
    sirName: "Apellido",
    phoneNumber: "Número de Teléfono",
    email: "Correo Electrónico",
    county: "Condado",
    securitySettings: "CONFIGURACIÓN DE SEGURIDAD",
    oldPassword: "Contraseña Antigua",
    newPassword: "Nueva Contraseña",
    confirmNewPassword: "Confirmar Nueva Contraseña",
    twoFactorAuth: "Autenticación de Dos Factores",
    notificationPreferences: "PREFERENCIAS DE NOTIFICACIÓN",
    themeCustomization: "PERSONALIZACIÓN DEL TEMA",
    darkMode: "Modo Oscuro",
    neonAccentColor: "Color Neon",
    eaSettings: "CONFIGURACIÓN DE EA",
    tradingPairs: "Pares de Trading (separados por comas)",
    riskPerTrade: "Riesgo por Trade (%)",
    dailyTP: "Take Profit Diario (%)",
    dailySL: "Stop Loss Diario (%)",
    apiIntegrations: "API & INTEGRACIONES",
    connected: "CONECTADO 🟩",
    notConnected: "NO CONECTADO 🟥",
    dataPrivacy: "DATOS & PRIVACIDAD",
    exportData: "Exportar datos como CSV",
    deleteAccount: "Eliminar Cuenta",
    privacyPolicy: "Política de Privacidad",
    languageSettings: "CONFIGURACIÓN DE IDIOMA",
    saveSettings: "Guardar Configuración",
    pleaseLogin: "Por favor inicia sesión para acceder a la configuración.",
    on: "ENCENDIDO",
    off: "APAGADO"
  },

  CHINESE: {
    profileSettings: "个人设置",
    profitPhoto: "收益照片 URL",
    firstName: "名字",
    middleName: "中间名",
    sirName: "姓氏",
    phoneNumber: "电话号码",
    email: "电子邮箱",
    county: "县",
    securitySettings: "安全设置",
    oldPassword: "旧密码",
    newPassword: "新密码",
    confirmNewPassword: "确认新密码",
    twoFactorAuth: "双重身份验证",
    notificationPreferences: "通知偏好",
    themeCustomization: "主题自定义",
    darkMode: "黑暗模式",
    neonAccentColor: "霓虹强调色",
    eaSettings: "EA 设置",
    tradingPairs: "交易对（逗号分隔）",
    riskPerTrade: "每笔交易风险 (%)",
    dailyTP: "每日止盈 (%)",
    dailySL: "每日止损 (%)",
    apiIntegrations: "API 与集成",
    connected: "已连接 🟩",
    notConnected: "未连接 🟥",
    dataPrivacy: "数据与隐私",
    exportData: "导出数据为 CSV",
    deleteAccount: "删除账户",
    privacyPolicy: "隐私政策",
    languageSettings: "语言设置",
    saveSettings: "保存设置",
    pleaseLogin: "请登录以访问设置。",
    on: "开启",
    off: "关闭"
  },

  ARABIC: {
    profileSettings: "إعدادات الملف الشخصي",
    profitPhoto: "رابط صورة الربح",
    firstName: "الاسم الأول",
    middleName: "الاسم الأوسط",
    sirName: "اسم العائلة",
    phoneNumber: "رقم الهاتف",
    email: "البريد الإلكتروني",
    county: "المقاطعة",
    securitySettings: "إعدادات الأمان",
    oldPassword: "كلمة المرور القديمة",
    newPassword: "كلمة المرور الجديدة",
    confirmNewPassword: "تأكيد كلمة المرور الجديدة",
    twoFactorAuth: "المصادقة الثنائية",
    notificationPreferences: "تفضيلات الإشعارات",
    themeCustomization: "تخصيص المظهر",
    darkMode: "الوضع الداكن",
    neonAccentColor: "لون النيون",
    eaSettings: "إعدادات EA",
    tradingPairs: "أزواج التداول (مفصولة بفواصل)",
    riskPerTrade: "المخاطرة لكل صفقة (%)",
    dailyTP: "الربح اليومي (%)",
    dailySL: "وقف الخسارة اليومي (%)",
    apiIntegrations: "API والتكاملات",
    connected: "متصل 🟩",
    notConnected: "غير متصل 🟥",
    dataPrivacy: "البيانات والخصوصية",
    exportData: "تصدير البيانات كملف CSV",
    deleteAccount: "حذف الحساب",
    privacyPolicy: "سياسة الخصوصية",
    languageSettings: "إعدادات اللغة",
    saveSettings: "حفظ الإعدادات",
    pleaseLogin: "الرجاء تسجيل الدخول للوصول إلى الإعدادات.",
    on: "تشغيل",
    off: "إيقاف"
  },

  INDIA: {
    profileSettings: "प्रोफ़ाइल सेटिंग्स",
    profitPhoto: "लाभ फ़ोटो URL",
    firstName: "पहला नाम",
    middleName: "मध्यम नाम",
    sirName: "उपनाम",
    phoneNumber: "फ़ोन नंबर",
    email: "ईमेल",
    county: "काउंटी",
    securitySettings: "सुरक्षा सेटिंग्स",
    oldPassword: "पुराना पासवर्ड",
    newPassword: "नया पासवर्ड",
    confirmNewPassword: "नया पासवर्ड पुष्टि करें",
    twoFactorAuth: "दो-कारक प्रमाणीकरण",
    notificationPreferences: "सूचना प्राथमिकताएँ",
    themeCustomization: "थीम अनुकूलन",
    darkMode: "डार्क मोड",
    neonAccentColor: "नीऑन हाइलाइट रंग",
    eaSettings: "ईए सेटिंग्स",
    tradingPairs: "ट्रेडिंग पेयर्स (कॉमा से अलग करें)",
    riskPerTrade: "प्रति ट्रेड जोखिम (%)",
    dailyTP: "दैनिक लाभ (%)",
    dailySL: "दैनिक स्टॉप लॉस (%)",
    apiIntegrations: "एपीआई और इंटीग्रेशन",
    connected: "कनेक्टेड 🟩",
    notConnected: "कनेक्टेड नहीं 🟥",
    dataPrivacy: "डेटा और गोपनीयता",
    exportData: "CSV के रूप में डेटा निर्यात करें",
    deleteAccount: "खाता हटाएँ",
    privacyPolicy: "गोपनीयता नीति",
    languageSettings: "भाषा सेटिंग्स",
    saveSettings: "सेटिंग्स सहेजें",
    pleaseLogin: "सेटिंग्स तक पहुँचने के लिए कृपया लॉगिन करें।",
    on: "चालू",
    off: "बंद"
  }
};

const neonColors = {
  background: "#000000",
  neonBlue: "#00FFFF",
  neonGreen: "#00FF00",
  neonOrange: "#FFA500",
  neonRed: "#FF0000",
};

const accentColors = ["Blue", "Green", "Red", "Aqua"];
const languages = [
  "ENGLISH",
  "SWAHILI",
  "SPANISH",
  "FRENCH",
  "CHINESE",
  "ARABIC",
  "INDIA",
];

export default function SettingsPage() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Settings state
  const [profile, setProfile] = useState({
    profitPhoto: "",
    firstName: "",
    middleName: "",
    sirName: "",
    phoneNumber: "",
    email: "",
    county: "",
  });

  const [security, setSecurity] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
    twoFactorEnabled: false,
  });

  const [notifications, setNotifications] = useState({
    appUpdate: true,
    tradesUpdate: true,
    newsHeadlines: true,
    marketOffers: false,
  });

  const [theme, setTheme] = useState({
    darkMode: true,
    neonAccentColor: "Blue",
  });

  const [apiIntegrations, setApiIntegrations] = useState({
    mt4: false,
    mt5: false,
    propFirm: false,
    binance: false,
    firebase: false,
  });

  const [dataPrivacy, setDataPrivacy] = useState({
    exportData: false,
    deleteAccount: false,
  });

  const { language, setLanguage } = useLanguage();



  const [eaSettings, setEaSettings] = useState({
  pairs: [],
  risk: 1,
  dailyTP: 2,
  dailySL: 1,
});


  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    APIControl.fetchSettingsData()
      .then((data) => {
        setProfile(data.profile ?? {
  profitPhoto: "",
  firstName: "",
  middleName: "",
  sirName: "",
  phoneNumber: "",
  email: "",
  county: "",
});
        setSecurity((s) => ({ ...s, twoFactorEnabled: data.security?.twoFactorEnabled ?? false }));
        setNotifications(data.notifications);
        setTheme({
  darkMode: data.theme?.darkMode ?? true,
  neonAccentColor: data.theme?.neonAccentColor ?? "Blue",
});

        setApiIntegrations(data.apiIntegrations);
        setLanguage(data.language);
setEaSettings(data.eaSettings ?? {
  pairs: [],
  risk: 1,
  dailyTP: 2,
  dailySL: 1,
});

      })
      .catch(() => setError("Failed to load settings data"))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div
        style={{
          fontFamily: "'Orbitron', sans-serif",
          color: neonColors.neonRed,
          padding: "4rem",
          textAlign: "center",
        }}
      >
        Please login to access settings.
      </div>
    );
  }

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSecurityChange = (e) => {
    setSecurity({ ...security, [e.target.name]: e.target.value });
  };

  const handleToggleNotifications = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleToggleTwoFactor = () => {
    setSecurity((prev) => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }));
  };

  const handleToggleThemeMode = () => {
    setTheme((prev) => ({ ...prev, darkMode: !prev.darkMode }));
  };

  const handleAccentColorChange = (color) => {
    setTheme((prev) => ({ ...prev, neonAccentColor: color }));
  };

  const handleApiIntegrationToggle = (key) => {
    setApiIntegrations((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const handleSaveSettings = () => {
    setLoading(true);
    APIControl.saveSettingsData({
      profile,
      security,
      notifications,
      theme,
      apiIntegrations,
      language,
      eaSettings, // include EA settings here
    })
      .then(() => alert("Settings saved successfully!"))
      .catch(() => alert("Failed to save settings."))
      .finally(() => setLoading(false));
  };

  return (
    <div
      style={{
        backgroundColor: neonColors.background,
        color: neonColors.neonBlue,
        fontFamily: "'Orbitron', sans-serif",
        minHeight: "100vh",
        padding: "1rem 2rem",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header
        style={{
          fontSize: "2rem",
          fontWeight: "bold",
          borderBottom: `2px solid ${neonColors.neonBlue}`,
          paddingBottom: "0.5rem",
          marginBottom: "1rem",
          textAlign: "center",
        }}
      >
        FTSA AI - SETTINGS
      </header>

      {loading && <LoadingSpinner size={48} color={neonColors.neonBlue} />}
      {error && (
        <StatusBadge status="error" style={{ margin: "1rem auto", maxWidth: 400 }}>
          {error}
        </StatusBadge>
      )}

      {!loading && (
        <>
          {/* PROFILE SETTINGS */}
          <section
            style={{
              marginBottom: "2rem",
              border: `2px solid ${neonColors.neonBlue}`,
              borderRadius: "12px",
              padding: "1rem",
              boxShadow: `0 0 15px ${neonColors.neonBlue}`,
            }}
          >
            <h2 style={{ color: neonColors.neonGreen }}>
  {translations[language].profileSettings}
</h2>
<div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
  <label style={{ flex: "1 1 200px" }}>
    {translations[language].profitPhoto}:
    <input
      type="text"
      name="profitPhoto"
      value={profile.profitPhoto}
      onChange={handleProfileChange}
      style={inputStyle(neonColors)}
      placeholder={translations[language].profitPhoto}
    />
  </label>

              <label style={{ flex: "1 1 150px" }}>
                First Name:
                <input
                  type="text"
                  name="firstName"
                  value={profile.firstName}
                  onChange={handleProfileChange}
                  style={inputStyle(neonColors)}
                />
              </label>
              <label style={{ flex: "1 1 150px" }}>
                Middle Name:
                <input
                  type="text"
                  name="middleName"
                  value={profile.middleName}
                  onChange={handleProfileChange}
                  style={inputStyle(neonColors)}
                />
              </label>
              <label style={{ flex: "1 1 150px" }}>
                Sir Name:
                <input
                  type="text"
                  name="sirName"
                  value={profile.sirName}
                  onChange={handleProfileChange}
                  style={inputStyle(neonColors)}
                />
              </label>
              <label style={{ flex: "1 1 150px" }}>
                Phone Number:
                <input
                  type="tel"
                  name="phoneNumber"
                  value={profile.phoneNumber}
                  onChange={handleProfileChange}
                  style={inputStyle(neonColors)}
                />
              </label>
              <label style={{ flex: "1 1 200px" }}>
                Email:
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  style={inputStyle(neonColors)}
                />
              </label>
              <label style={{ flex: "1 1 150px" }}>
                County:
                <input
                  type="text"
                  name="county"
                  value={profile.county}
                  onChange={handleProfileChange}
                  style={inputStyle(neonColors)}
                />
              </label>
            </div>
          </section>

          {/* SECURITY SETTINGS */}
          <section
            style={{
              marginBottom: "2rem",
              border: `2px solid ${neonColors.neonBlue}`,
              borderRadius: "12px",
              padding: "1rem",
              boxShadow: `0 0 15px ${neonColors.neonBlue}`,
            }}
          >
            <h2 style={{ color: neonColors.neonOrange }}>
  {translations[language].securitySettings}
</h2>
<div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: 400 }}>
  <label>
    {translations[language].oldPassword}:
    <input
      type="password"
      name="oldPassword"
      value={security.oldPassword}
      onChange={handleSecurityChange}
      style={inputStyle(neonColors)}
    />
  </label>

              <label>
                New Password:
                <input
                  type="password"
                  name="newPassword"
                  value={security.newPassword}
                  onChange={handleSecurityChange}
                  style={inputStyle(neonColors)}
                />
              </label>
              <label>
                Confirm New Password:
                <input
                  type="password"
                  name="confirmNewPassword"
                  value={security.confirmNewPassword}
                  onChange={handleSecurityChange}
                  style={inputStyle(neonColors)}
                />
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                Two-Factor Authentication:
                <NeonButton
                  onClick={handleToggleTwoFactor}
                  style={{
                    border: `2px solid ${
                      security.twoFactorEnabled ? neonColors.neonGreen : neonColors.neonRed
                    }`,
                    backgroundColor: security.twoFactorEnabled ? "#002200" : "transparent",
                    minWidth: 80,
                  }}
                >
                  {security.twoFactorEnabled ? "ON" : "OFF"}
                </NeonButton>
              </label>
            </div>
          </section>

          {/* NOTIFICATION PREFERENCES */}
          <section
            style={{
              marginBottom: "2rem",
              border: `2px solid ${neonColors.neonBlue}`,
              borderRadius: "12px",
              padding: "1rem",
              boxShadow: `0 0 15px ${neonColors.neonBlue}`,
              maxWidth: 400,
            }}
          >
            <h2 style={{ color: neonColors.neonBlue }}>
  {translations[language].notificationPreferences}
</h2>
{Object.entries(notifications || {}).map(([key, val]) => (
  <label
    key={key}
    style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
  >
    {translations[language][key] || key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())}
    <NeonButton
      onClick={() => handleToggleNotifications(key)}
      style={{
        border: `2px solid ${val ? neonColors.neonGreen : neonColors.neonRed}`,
        backgroundColor: val ? "#002200" : "transparent",
        minWidth: 80,
      }}
    >
      {val ? translations[language].on : translations[language].off}
    </NeonButton>
  </label>
))}
          </section>

          {/* THEME CUSTOMIZATION */}
          <section
            style={{
              marginBottom: "2rem",
              border: `2px solid ${neonColors.neonBlue}`,
              borderRadius: "12px",
              padding: "1rem",
              boxShadow: `0 0 15px ${neonColors.neonBlue}`,
              maxWidth: 400,
            }}
          >
            <h2 style={{ color: neonColors.neonBlue }}>
  {translations[language].themeCustomization}
</h2>
<label
  style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}
>
  {translations[language].darkMode}:
  <NeonButton
    onClick={handleToggleThemeMode}
    style={{
      border: `2px solid ${theme.darkMode ? neonColors.neonGreen : neonColors.neonRed}`,
      backgroundColor: theme.darkMode ? "#002200" : "transparent",
      minWidth: 80,
    }}
  >
    {theme.darkMode ? translations[language].on : translations[language].off}
  </NeonButton>
</label>
            <div>
              Neon Accent Color:
              <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                {accentColors.map((color) => (
                  <NeonButton
                    key={color}
                    onClick={() => handleAccentColorChange(color)}
                    style={{
                      border: `2px solid ${
                        theme.neonAccentColor === color
                          ? neonColors.neonGreen
                          : neonColors.neonBlue
                      }`,
                      backgroundColor: "transparent",
                      minWidth: 80,
                    }}
                  >
                    {color}
                  </NeonButton>
                ))}
              </div>
            </div>
          </section>
          {/* EA SETTINGS */}
<section
  style={{
    marginBottom: "2rem",
    border: `2px solid ${neonColors.neonBlue}`,
    borderRadius: "12px",
    padding: "1rem",
    boxShadow: `0 0 15px ${neonColors.neonBlue}`,
    maxWidth: 400,
  }}
>
<h2 style={{ color: neonColors.neonOrange }}>
  {translations[language].eaSettings}
</h2>
<div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
  <label>
    {translations[language].tradingPairs}:
    <input
      type="text"
      value={eaSettings.pairs.join(",")}
      onChange={(e) =>
        setEaSettings((prev) => ({
          ...prev,
          pairs: e.target.value.split(",").map((p) => p.trim()),
        }))
      }
      style={inputStyle(neonColors)}
      placeholder="EURUSD, GBPUSD, USDJPY"
    />
  </label>
    <label>
      Risk per Trade (%):
      <input
        type="number"
        value={eaSettings.risk}
        onChange={(e) =>
          setEaSettings((prev) => ({ ...prev, risk: parseFloat(e.target.value) }))
        }
        style={inputStyle(neonColors)}
        min={0.1}
        max={100}
        step={0.1}
      />
    </label>

    <label>
      Daily Take Profit (%):
      <input
        type="number"
        value={eaSettings.dailyTP}
        onChange={(e) =>
          setEaSettings((prev) => ({ ...prev, dailyTP: parseFloat(e.target.value) }))
        }
        style={inputStyle(neonColors)}
        min={0}
        step={0.1}
      />
    </label>

    <label>
      Daily Stop Loss (%):
      <input
        type="number"
        value={eaSettings.dailySL}
        onChange={(e) =>
          setEaSettings((prev) => ({ ...prev, dailySL: parseFloat(e.target.value) }))
        }
        style={inputStyle(neonColors)}
        min={0}
        step={0.1}
      />
    </label>
  </div>
</section>


          {/* API & INTEGRATIONS */}
          <section
            style={{
              marginBottom: "2rem",
              border: `2px solid ${neonColors.neonBlue}`,
              borderRadius: "12px",
              padding: "1rem",
              boxShadow: `0 0 15px ${neonColors.neonBlue}`,
              maxWidth: 400,
            }}
          >
            <h2 style={{ color: neonColors.neonBlue }}>
  {translations[language].apiIntegrations}
</h2>
{Object.entries(apiIntegrations || {}).map(([key, val]) => (
  <label
    key={key}
    style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
  >
    {key.toUpperCase()}
    <NeonButton
      onClick={() => handleApiIntegrationToggle(key)}
      style={{
        border: `2px solid ${val ? neonColors.neonGreen : neonColors.neonRed}`,
        backgroundColor: val ? "#002200" : "transparent",
        minWidth: 80,
      }}
    >
      {val
        ? translations[language].connected
        : translations[language].notConnected}
    </NeonButton>
  </label>
))}
          </section>

          {/* DATA & PRIVACY */}
          <section
            style={{
              marginBottom: "2rem",
              border: `2px solid ${neonColors.neonBlue}`,
              borderRadius: "12px",
              padding: "1rem",
              boxShadow: `0 0 15px ${neonColors.neonBlue}`,
              maxWidth: 400,
            }}
          >
            <h2 style={{ color: neonColors.neonRed }}>
  {translations[language].dataPrivacy}
</h2>

<NeonButton
  onClick={() => alert(translations[language].exportingCsv)}
  style={{ marginBottom: "1rem" }}
>
  {translations[language].exportCsv}
</NeonButton>

<NeonButton
  onClick={() => {
    if (window.confirm(translations[language].deleteConfirm)) {
      alert(translations[language].accountDeleted);
    }
  }}
  style={{ backgroundColor: neonColors.neonRed, borderColor: neonColors.neonRed }}
>
  {translations[language].deleteAccount}
</NeonButton>

<p style={{ marginTop: "1rem", fontSize: "0.8rem" }}>
  <a href="/privacy-policy" style={{ color: neonColors.neonBlue }}>
    {translations[language].privacyPolicy}
  </a>
</p>
</section>


          {/* LANGUAGE SETTINGS */}
          <section
            style={{
              marginBottom: "2rem",
              border: `2px solid ${neonColors.neonBlue}`,
              borderRadius: "12px",
              padding: "1rem",
              boxShadow: `0 0 15px ${neonColors.neonBlue}`,
              maxWidth: 400,
            }}
          >
            <h2 style={{ color: neonColors.neonBlue }}>
  {translations[language].languageSettings}
</h2>

<select
  value={language}
  onChange={handleLanguageChange}
  style={inputStyle(neonColors)}
>
  {languages.map((lang) => (
    <option key={lang} value={lang}>
      {translations[language][lang]} {/* ✅ show translated language name */}
    </option>
  ))}
</select>
<p style={{ marginTop: "1rem", color: "yellow" }}>
  Current language: {language}
</p>

</section>
          {/* APP VERSION */}
          <footer
            style={{
              textAlign: "center",
              borderTop: `1px solid ${neonColors.neonBlue}`,
              paddingTop: "1rem",
              color: neonColors.neonBlue,
              fontSize: "0.9rem",
              marginTop: "auto",
            }}
          >
            FTSA AI 0.V1 - Powered by KELVIN SPECTER (MBURU G) © 2025
          </footer>

          {/* Save button */}
          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            <NeonButton onClick={handleSaveSettings} style={{ minWidth: 160 }}>
              Save Settings
            </NeonButton>
          </div>
        </>
      )}
    </div>
  );
}

// Helper style for inputs
const inputStyle = (colors) => ({
  width: "100%",
  padding: "0.5rem",
  borderRadius: "6px",
  border: `2px solid ${colors.neonBlue}`,
  backgroundColor: "#111",
  color: colors.neonBlue,
  fontFamily: "'Orbitron', sans-serif",
  outline: "none",
});
