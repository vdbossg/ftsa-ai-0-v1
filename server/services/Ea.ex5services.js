const fs = require("fs-extra");
const path = require("path");
const { exec } = require("child_process");

const SOURCE_DIR = "C:\\Users\\LENOVO\\Desktop\\FTSA_AI_0.v1\\mql5\\Licensed_mq5";
const OUTPUT_DIR = "C:\\Users\\LENOVO\\Desktop\\FTSA_AI_0.v1\\mql5\\Licensed_ex5";
const MT5_EDITOR = "C:\\Users\\LENOVO\\Desktop\\FTSA_AI_0.v1\\mt5\\MetaEditor64.exe";
const MT5_EXPERTS = "C:\\Users\\LENOVO\\Desktop\\FTSA_AI_0.v1\\mt5\\MQL5\\Experts";
const LOG_FILE = "C:\\Users\\LENOVO\\Desktop\\FTSA_AI_0.v1\\mt5\\logs\\metaeditor.log";

let isCompiling = false; // prevents multiple compiles at once

async function compileEA(file) {
    if (isCompiling) return;
    isCompiling = true;

    try {
        const srcPath = path.join(SOURCE_DIR, file);
        const tempPath = path.join(MT5_EXPERTS, file);
        const ex5Name = file.replace(".mq5", ".ex5");
        const compiledPath = path.join(MT5_EXPERTS, ex5Name);
        const finalPath = path.join(OUTPUT_DIR, ex5Name);

        console.log("📥 Found MQ5:", file);

        // Copy MQ5 to MT5 Experts folder
        await fs.copy(srcPath, tempPath, { overwrite: true });

        const command = `"${MT5_EDITOR}" /compile:"${tempPath}" /log`;

        exec(command, async (err) => {
            if (err) {
                console.log("❌ Compile process failed to start");
                isCompiling = false;
                return;
            }

            // wait 1 second to ensure EX5 written
            setTimeout(async () => {
                if (await fs.pathExists(compiledPath)) {
                    await fs.move(compiledPath, finalPath, { overwrite: true });
                    console.log("✅ EX5 Ready:", ex5Name);

                    // Delete sources
                    await fs.remove(srcPath);
                    await fs.remove(tempPath);
                } else {
                    console.log("❌ Compilation failed. Check log.");
                }

                isCompiling = false;
            }, 1000);
        });

    } catch (error) {
        console.log("Service error:", error.message);
        isCompiling = false;
    }
}

// 🔁 CHECK EVERY 2 SECONDS
setInterval(async () => {
    try {
        const files = await fs.readdir(SOURCE_DIR);
        const mq5Files = files.filter(f => f.endsWith(".mq5"));

        if (mq5Files.length > 0) {
            await compileEA(mq5Files[0]); // compile one at a time
        }
    } catch (err) {
        console.log("Watcher error:", err.message);
    }
}, 2000);

console.log("🚀 EA Compiler Service Running (2s interval, silent)");
