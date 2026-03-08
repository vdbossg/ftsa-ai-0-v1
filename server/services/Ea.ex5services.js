const fs = require("fs-extra");
const path = require("path");
const { exec } = require("child_process");


// Project root (adjust if your EA compiler file is nested differently)
const PROJECT_ROOT = path.resolve(__dirname, "../../"); 

const SOURCE_DIR = path.join(PROJECT_ROOT, "mql5", "Licensed_mq5");
const OUTPUT_DIR = path.join(PROJECT_ROOT, "mql5", "Licensed_ex5");
const MT5_EDITOR = path.join(PROJECT_ROOT, "mt5", "MetaEditor64.exe");
const MT5_EXPERTS = path.join(PROJECT_ROOT, "mt5", "MQL5", "Experts");


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

        // Compile using MetaEditor
        const command = `"${MT5_EDITOR}" /compile:"${tempPath}" /log`;

        const child = exec(command, (err, stdout, stderr) => {
            if (err) {
                console.error("❌ Compile process failed to start:", err.message);
                isCompiling = false;
                return;
            }

            console.log("📄 MetaEditor output:", stdout);
            if (stderr) console.error("📄 MetaEditor errors:", stderr);
        });

        // Wait for MetaEditor to finish
        child.on("exit", async (code) => {
            if (await fs.pathExists(compiledPath)) {
                await fs.move(compiledPath, finalPath, { overwrite: true });
                console.log("✅ EX5 Ready:", ex5Name);

                // Delete sources
                await fs.remove(srcPath);
                await fs.remove(tempPath);
            } else {
                console.log("❌ Compilation failed. Check MetaEditor log.");
            }
            isCompiling = false;
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
