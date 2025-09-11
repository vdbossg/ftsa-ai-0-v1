// src/pages/SettingsPage.jsx
import React, { useState, useEffect } from "react";
import NeonButton from "../components/NeonButton";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../contexts/AuthContext";
import APIControl from "../brain/APIControl";
import "../styles/SettingsPage.css";
import { useLanguage } from "../contexts/LanguageContext";
import Modal from "react-modal"; // Make sure installed

const languages = ["ENGLISH", "SWAHILI", "SPANISH", "CHINESE", "ARABIC", "INDIA", "FRENCH"];

export default function SettingsPage() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { language, setLanguage } = useLanguage();
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
    showPasswords: false,
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

  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [isSecurityModalOpen, setSecurityModalOpen] = useState(false);

  const t = translations[language ?? "ENGLISH"] || translations.ENGLISH;

  const neonColors = {
    background: "#000000",
    neonBlue: "#00FFFF",
    neonGreen: "#00FF00",
    neonOrange: "#FFA500",
    neonRed: "#FF0000",
  };

  const accentColors = ["Blue", "Green", "Red", "Aqua"];

  const toggleButtonStyle = (active, colors) => ({
    border: `2px solid ${active ? colors.neonGreen : colors.neonRed}`,
    minWidth: 80,
  });

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    APIControl.fetchSettingsData()
      .then((data) => {
        const mockData = {
          profile: {
            profitPhoto: "https://via.placeholder.com/100",
            firstName: "John",
            middleName: "A.",
            sirName: "Doe",
            phoneNumber: "123456789",
            email: "john@example.com",
            county: "Nairobi",
          },
          security: { twoFactorEnabled: true },
          notifications: {
            appUpdate: true,
            tradesUpdate: true,
            newsHeadlines: true,
            marketOffers: false,
          },
          theme: { darkMode: true, neonAccentColor: "Blue" },
          language: "ENGLISH",
        };
        const d = data ?? mockData;
        setProfile(d.profile);
        setSecurity((s) => ({ ...s, twoFactorEnabled: d.security?.twoFactorEnabled ?? false }));
        setNotifications(d.notifications);
        setTheme(d.theme ?? theme);
        setLanguage(d.language);
      })
      .catch(() => setError("Failed to load settings data"))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div style={{ fontFamily: "'Orbitron', sans-serif", color: neonColors.neonRed, padding: "4rem", textAlign: "center" }}>
        {t.pleaseLogin}
      </div>
    );
  }

  const handleProfileChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });
  const handleSecurityChange = (e) => setSecurity({ ...security, [e.target.name]: e.target.value });
  const handleToggleTwoFactor = () => setSecurity((prev) => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }));
  const handleToggleThemeMode = () => setTheme((prev) => ({ ...prev, darkMode: !prev.darkMode }));
  const handleAccentColorChange = (color) => setTheme((prev) => ({ ...prev, neonAccentColor: color }));
  const handleToggleNotifications = (key) => setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  const handleLanguageChange = (e) => setLanguage(e.target.value);

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      await new Promise((res) => setTimeout(res, 1000));
      console.log("Saved data:", { profile, security, notifications, theme, language });
      alert("Settings saved successfully!");
    } catch {
      alert("Failed to save settings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: neonColors.background, color: neonColors.neonBlue, fontFamily: "'Orbitron', sans-serif", minHeight: "100vh", padding: "1rem 2rem" }}>
      <header style={{ fontSize: "2rem", fontWeight: "bold", borderBottom: `2px solid ${neonColors.neonBlue}`, paddingBottom: "0.5rem", marginBottom: "1rem", textAlign: "center" }}>
        FTSA AI - {t.profileSettings}
      </header>

      {loading && <LoadingSpinner size={48} color={neonColors.neonBlue} />}
      {error && <StatusBadge status="error" style={{ margin: "1rem auto", maxWidth: 400 }}>{error}</StatusBadge>}

      {!loading && (
        <>
          {/* PROFILE SETTINGS */}
          <section style={sectionStyle(neonColors)}>
            <h2 style={{ color: neonColors.neonGreen }}>{t.profileSettings}</h2>
            <NeonButton onClick={() => setProfileModalOpen(true)}>Edit Profile</NeonButton>
          </section>

          <Modal isOpen={isProfileModalOpen} onRequestClose={() => setProfileModalOpen(false)} style={modalStyles(neonColors)} ariaHideApp={false}>
            <h2>{t.profileSettings}</h2>

            {/* Profit Photo */}
            <label key="profitPhoto" style={{ display: "block", marginBottom: "1rem" }}>
              {t.profitPhoto}:
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "0.5rem" }}>
                <img src={profile.profitPhoto || "https://via.placeholder.com/100"} alt="Profit" style={{ width: 80, height: 80, borderRadius: "8px", objectFit: "cover" }} />
                <NeonButton onClick={() => {
                  const url = prompt("Enter Profit Photo URL", profile.profitPhoto);
                  if (url) setProfile(prev => ({ ...prev, profitPhoto: url }));
                }}>Edit</NeonButton>
              </div>
            </label>

            {["firstName", "middleName", "sirName", "phoneNumber", "email", "county"].map((field) => (
              <label key={field} style={{ display: "block", marginBottom: "1rem" }}>
                {t[field]}:
                <input type="text" name={field} value={profile[field]} onChange={handleProfileChange} style={inputStyle(neonColors)} />
              </label>
            ))}

            <div style={{ marginTop: "1rem" }}>
              <NeonButton onClick={() => setProfileModalOpen(false)} style={{ marginRight: "1rem" }}>Close</NeonButton>
              <NeonButton onClick={handleSaveSettings}>Save</NeonButton>
            </div>
          </Modal>

          {/* SECURITY SETTINGS */}
          <section style={sectionStyle(neonColors)}>
            <h2 style={{ color: neonColors.neonOrange }}>{t.securitySettings}</h2>
            <NeonButton onClick={() => setSecurityModalOpen(true)}>Change Password / Security</NeonButton>
          </section>

          <Modal isOpen={isSecurityModalOpen} onRequestClose={() => setSecurityModalOpen(false)} style={modalStyles(neonColors)} ariaHideApp={false}>
            <h2>{t.securitySettings}</h2>
            {["oldPassword", "newPassword", "confirmNewPassword"].map((field) => (
              <label key={field} style={{ display: "block", marginBottom: "1rem" }}>
                {t[field]}:
                <input type={security.showPasswords ? "text" : "password"} name={field} value={security[field]} onChange={handleSecurityChange} style={inputStyle(neonColors)} />
              </label>
            ))}
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              Show Passwords
              <input type="checkbox" checked={security.showPasswords} onChange={() => setSecurity((prev) => ({ ...prev, showPasswords: !prev.showPasswords }))} />
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "1rem" }}>
              {t.twoFactorAuth}:
              <NeonButton onClick={handleToggleTwoFactor} style={toggleButtonStyle(security.twoFactorEnabled, neonColors)}>
                {security.twoFactorEnabled ? t.on : t.off}
              </NeonButton>
            </label>
            <div style={{ marginTop: "1rem" }}>
              <NeonButton onClick={() => setSecurityModalOpen(false)} style={{ marginRight: "1rem" }}>Close</NeonButton>
              <NeonButton onClick={handleSaveSettings}>Save</NeonButton>
            </div>
          </Modal>

          {/* NOTIFICATIONS */}
          <section style={sectionStyle(neonColors)}>
            <h2 style={{ color: neonColors.neonBlue }}>{t.notificationPreferences}</h2>
            {Object.entries(notifications).map(([key, val]) => (
              <label key={key} style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                {t[key] || key}
                <NeonButton onClick={() => handleToggleNotifications(key)} style={toggleButtonStyle(val, neonColors)}>
                  {val ? t.on : t.off}
                </NeonButton>
              </label>
            ))}
          </section>

          {/* THEME CUSTOMIZATION */}
          <section style={sectionStyle(neonColors)}>
            <h2 style={{ color: neonColors.neonBlue }}>{t.themeCustomization}</h2>
            <label style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
              {t.darkMode}:
              <NeonButton onClick={handleToggleThemeMode} style={toggleButtonStyle(theme.darkMode, neonColors)}>
                {theme.darkMode ? t.on : t.off}
              </NeonButton>
            </label>
            <div>
              {t.neonAccentColor}:
              <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                {accentColors.map((color) => (
                  <NeonButton key={color} onClick={() => handleAccentColorChange(color)} style={{ border: `2px solid ${theme.neonAccentColor === color ? neonColors.neonGreen : neonColors.neonBlue}`, minWidth: 80 }}>
                    {color}
                  </NeonButton>
                ))}
              </div>
            </div>
          </section>

          {/* LANGUAGE */}
          <section style={sectionStyle(neonColors)}>
            <h2 style={{ color: neonColors.neonBlue }}>{t.languageSettings}</h2>
            <select value={language} onChange={handleLanguageChange} style={inputStyle(neonColors)}>
              {languages.map((lang) => <option key={lang} value={lang}>{lang}</option>)}
            </select>
          </section>

          {/* SAVE BUTTON */}
          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            <NeonButton onClick={handleSaveSettings} style={{ minWidth: 160 }}>{t.saveSettings}</NeonButton>
          </div>

          {/* FOOTER */}
          <footer style={{ textAlign: "center", borderTop: `1px solid ${neonColors.neonBlue}`, paddingTop: "1rem", color: neonColors.neonBlue, fontSize: "0.9rem", marginTop: "2rem" }}>
            FTSA AI 0.V1 - Powered by KELVIN SPECTER © 2025
          </footer>
        </>
      )}
    </div>
  );
}

// STYLES
const sectionStyle = (colors) => ({
  marginBottom: "2rem",
  border: `2px solid ${colors.neonBlue}`,
  borderRadius: "12px",
  padding: "1rem",
  boxShadow: `0 0 15px ${colors.neonBlue}`,
  maxWidth: 400,
});

const modalStyles = (colors) => ({
  content: {
    background: "#111",
    color: colors.neonBlue,
    border: `2px solid ${colors.neonBlue}`,
    borderRadius: "12px",
    padding: "2rem",
    maxWidth: "500px",
    margin: "auto",
  },
});

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

// TRANSLATIONS
const translations = {
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
    apiIntegrations: "API & INTEGRATIONS",
    connected: "CONNECTED 🟩",
    notConnected: "NOT CONNECTED 🟥",
    dataPrivacy: "DATA & PRIVACY",
    exportCsv: "Export data as CSV",
    exportingCsv: "Exporting CSV...",
    deleteAccount: "Delete Account",
    privacyPolicy: "Privacy Policy",
    languageSettings: "LANGUAGE SETTINGS",
    saveSettings: "Save Settings",
    pleaseLogin: "Please login to access settings.",
    on: "ON",
    off: "OFF",
    appUpdate: "App Updates",
    tradesUpdate: "Trades Updates",
    newsHeadlines: "News Headlines",
    marketOffers: "Market Offers",
    deleteConfirm: "Are you sure you want to delete your account?",
    accountDeleted: "Account deleted successfully!"
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
    on: "WAKO", off: "ZIMEZIMWA", 
    appUpdate: "Mabadiliko ya App", 
    tradesUpdate: "Mabadiliko ya Biashara", 
    newsHeadlines: "Vichwa vya Habari", 
    marketOffers: "Ofa za Soko", 
    tradingPairsExample: "EURUSD, GBPUSD, USDJPY", 
    exportCsv: "Hamisha data kama CSV", 
    exportingCsv: "Kina hamisha CSV...", 
    deleteConfirm: "Una uhakika unataka kufuta akaunti yako?", 
    accountDeleted: "Akaunti imefutwa kwa mafanikio!" 
  
  }, SPANISH: { 
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
    off: "APAGADO", 
    appUpdate: "Actualizaciones de la App", 
    tradesUpdate: "Actualizaciones de Trades", 
    newsHeadlines: "Titulares de Noticias", 
    marketOffers: "Ofertas del Mercado", 
    tradingPairsExample: "EURUSD, GBPUSD, USDJPY", 
    exportCsv: "Exportar datos como CSV", 
    exportingCsv: "Exportando CSV...", 
    deleteConfirm: "¿Está seguro de que desea eliminar su cuenta?", 
    accountDeleted: "¡Cuenta eliminada con éxito!" 
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
      off: "关闭", 
      appUpdate: "应用更新", 
      tradesUpdate: "交易更新", 
      newsHeadlines: "新闻头条", 
      marketOffers: "市场优惠", 
      tradingPairsExample: "EURUSD, GBPUSD, USDJPY", 
      exportCsv: "导出数据为 CSV", 
      exportingCsv: "正在导出 CSV...", 
      deleteConfirm: "您确定要删除您的账户吗？", 
      accountDeleted: "账户已成功删除！" 
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
        off: "إيقاف", 
        appUpdate: "تحديثات التطبيق", 
        tradesUpdate: "تحديثات التداول", 
        newsHeadlines: "عناوين الأخبار", 
        marketOffers: "عروض السوق", 
        tradingPairsExample: "EURUSD, GBPUSD, USDJPY", 
        exportCsv: "تصدير البيانات كملف CSV", 
        exportingCsv: "جارٍ تصدير CSV...", 
        deleteConfirm: "هل أنت متأكد أنك تريد حذف حسابك؟", 
        accountDeleted: "تم حذف الحساب بنجاح!" 
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
        off: "बंद", 
        appUpdate: "ऐप अपडेट्स", 
        tradesUpdate: "ट्रेड अपडेट्स", 
        newsHeadlines: "समाचार शीर्षक", 
        marketOffers: "मार्केट ऑफ़र्स", 
        tradingPairsExample: "EURUSD, GBPUSD, USDJPY", 
        exportCsv: "CSV के रूप में डेटा निर्यात करें", 
        exportingCsv: "CSV निर्यात कर रहा है...", 
        deleteConfirm: "क्या आप वाकई अपना खाता हटाना चाहते हैं?", 
        accountDeleted: "खाता सफलतापूर्वक हटाया गया!" 
      }, 
      FRENCH: { 
        profileSettings: "PARAMÈTRES DU PROFIL", 
        profitPhoto: "URL de la photo de profit", 
        firstName: "Prénom", 
        middleName: "Deuxième prénom", 
        sirName: "Nom de famille", 
        phoneNumber: "Numéro de téléphone", 
        email: "Email", 
        county: "Comté", 
        securitySettings: "PARAMÈTRES DE SÉCURITÉ", 
        oldPassword: "Ancien mot de passe", 
        newPassword: "Nouveau mot de passe", 
        confirmNewPassword: "Confirmer le nouveau mot de passe", 
        twoFactorAuth: "Authentification à deux facteurs", 
        notificationPreferences: "PRÉFÉRENCES DE NOTIFICATION", 
        themeCustomization: "PERSONNALISATION DU THÈME", 
        darkMode: "Mode sombre", 
        neonAccentColor: "Couleur néon", 
        eaSettings: "PARAMÈTRES EA", 
        tradingPairs: "Paires de trading (séparées par des virgules)", 
        riskPerTrade: "Risque par trade (%)", 
        dailyTP: "Take Profit quotidien (%)", 
        dailySL: "Stop Loss quotidien (%)", 
        apiIntegrations: "API & INTÉGRATIONS", 
        connected: "CONNECTÉ 🟩", 
        notConnected: "NON CONNECTÉ 🟥", 
        dataPrivacy: "DONNÉES & CONFIDENTIALITÉ", 
        exportData: "Exporter les données en CSV", 
        deleteAccount: "Supprimer le compte", 
        privacyPolicy: "Politique de confidentialité", 
        languageSettings: "PARAMÈTRES DE LANGUE", 
        saveSettings: "Enregistrer les paramètres", 
        pleaseLogin: "Veuillez vous connecter pour accéder aux paramètres.", 
        on: "ACTIVÉ", 
        off: "DÉSACTIVÉ", 
        appUpdate: "Mises à jour de l'application", 
        tradesUpdate: "Mises à jour des transactions", 
        newsHeadlines: "Titres d'actualités", 
        marketOffers: "Offres du marché", 
        tradingPairsExample: "EURUSD, GBPUSD, USDJPY", 
        exportCsv: "Exporter les données en CSV", 
        exportingCsv: "Exportation du CSV...", 
        deleteConfirm: "Êtes-vous sûr de vouloir supprimer votre compte ?", 
        accountDeleted: "Compte supprimé avec succès !" 
      }
    };
