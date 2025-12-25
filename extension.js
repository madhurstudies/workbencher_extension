const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    // --- 1. DEFINE YOUR THEMES HERE ---
    // Every time you add a new JSON file to the /themes folder, add it to this list.
    const themesList = [
        { label: 'Codeforces', file: 'themes/codeforces.json' },
        { label: 'Dark Rangers', file: 'themes/darkrangers.json' },
    ];

    // --- 2. COMMAND: APPLY THEME ---
    let applyCommand = vscode.commands.registerCommand('workbencher.applyAesthetic', async function () {
        const selection = await vscode.window.showQuickPick(themesList, {
            placeHolder: 'Pick a Workbencher frame to apply'
        });

        if (selection) {
            try {
                const filePath = path.join(context.extensionPath, selection.file);
                const rawData = fs.readFileSync(filePath, 'utf8');
                const configData = JSON.parse(rawData);

                let workbenchColors = {};
                let otherSettings = {};

                // SMART DETECTION: Check if the JSON is nested or flat
                if (configData["workbench.colorCustomizations"]) {
                    // Nested Format (Big JSON)
                    workbenchColors = configData["workbench.colorCustomizations"];
                    // Keep everything else as general settings
                    otherSettings = { ...configData };
                    delete otherSettings["workbench.colorCustomizations"];
                } else {
                    // Flat Format (The "lol" JSON)
                    workbenchColors = configData;
                }

                // Apply Workbench Colors
                await vscode.workspace.getConfiguration().update(
                    'workbench.colorCustomizations',
                    workbenchColors,
                    vscode.ConfigurationTarget.Global
                );

                // Apply General Settings (Fonts, Layouts, etc.)
                for (const key in otherSettings) {
                    await vscode.workspace.getConfiguration().update(
                        key,
                        otherSettings[key],
                        vscode.ConfigurationTarget.Global
                    );
                }

                vscode.window.showInformationMessage(`Workbencher: ${selection.label} Applied!`);
            } catch (error) {
                vscode.window.showErrorMessage(`Error: ${error.message}`);
            }
        }
    });

    // --- 3. COMMAND: RESET ---
    let resetCommand = vscode.commands.registerCommand('workbencher.reset', async function () {
        // This clears all workbench color overrides
        await vscode.workspace.getConfiguration().update(
            'workbench.colorCustomizations',
            undefined,
            vscode.ConfigurationTarget.Global
        );

        // Optional: Add other settings here you want to reset, e.g.:
        // await vscode.workspace.getConfiguration().update('editor.fontSize', undefined, vscode.ConfigurationTarget.Global);

        vscode.window.showInformationMessage('Workbencher: UI reset to default.');
    });

    context.subscriptions.push(applyCommand, resetCommand);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};

//