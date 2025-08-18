import fs from "fs";
import path from "path";
import { exec } from "child_process";

// Paths to MetaEditor executables
const METAEDITOR_PATHS = {
  mt4: "C:\\Program Files (x86)\\HFM Metatrader 4\\metaeditor.exe",
  mt5: "C:\\Program Files\\Alpari MT5\\metaeditor64.exe"
};

export async function generateEA(userId, licenseKey, accountNumber, platform) {
  // 1️⃣ Template file
  const mqExt = platform === "mt5" ? "mq5" : "mq4";
  const exExt = platform === "mt5" ? "ex5" : "ex4";

  const templateFile = path.join(
    process.cwd(),
    `mql5/templates/FTSA_EA_TEMPLATE.${mqExt}`
  );

  if (!fs.existsSync(templateFile)) {
    throw new Error("EA template not found");
  }

  // 2️⃣ Inject license & account number
  let content = fs.readFileSync(templateFile, "utf8");
  content = content
    .replace(/%%LICENSE_KEY%%/g, licenseKey)
    .replace(/%%ACCOUNT_NUMBER%%/g, accountNumber);

  // 3️⃣ Output MQ file
  const outputDir = path.join(process.cwd(), "mql5/generated");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const mqFileName = `FTSA_EA_${userId}.${mqExt}`;
  const mqFilePath = path.join(outputDir, mqFileName);
  fs.writeFileSync(mqFilePath, content);

  // 4️⃣ Compile to EX4/EX5
  const metaEditorPath = METAEDITOR_PATHS[platform];
  await new Promise((resolve, reject) => {
    exec(
      `"${metaEditorPath}" /compile:"${mqFilePath}" /log`,
      (err, stdout, stderr) => {
        if (err) {
          console.error("MetaEditor compile error:", stderr || err);
          return reject(new Error("EA compilation failed"));
        }
        resolve();
      }
    );
  });

  // 5️⃣ Return compiled file path
  const exFilePath = mqFilePath.replace(`.${mqExt}`, `.${exExt}`);
  if (!fs.existsSync(exFilePath)) {
    throw new Error("Compiled EA not found");
  }

  return exFilePath;
}
