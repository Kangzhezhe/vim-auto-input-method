import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as util from 'util';

// 将exec转换为Promise形式
const execAsync = util.promisify(exec);

// 创建输出通道
let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
    // 创建专用的输出通道
    outputChannel = vscode.window.createOutputChannel('Vim Input Mode');
    outputChannel.appendLine('Vim Input Mode extension is now active!');
    

    // 获取vim插件的输入法相关配置
    function getVimInputMethodConfig() {
        const config = vscode.workspace.getConfiguration('vim.autoSwitchInputMethod');
        
        const defaultIM = config.get<string>('defaultIM');
        const obtainIMCmd = config.get<string>('obtainIMCmd');
        const switchIMCmd = config.get<string>('switchIMCmd');
        const enable = config.get<boolean>('enable');
        
        const configInfo = {
            defaultIM,
            obtainIMCmd,
            switchIMCmd,
            enable
        };
        
        return configInfo;
    }

    // 执行输入法切换命令
    async function switchInputMethod() {
        const config = getVimInputMethodConfig();
        
        if (!config.enable) {
            outputChannel.appendLine('Input method switching is disabled');
            return;
        }

        if (!config.switchIMCmd || !config.defaultIM) {
            outputChannel.appendLine('Missing switchIMCmd or defaultIM configuration');
            return;
        }

        try {
            // 将{im}替换为defaultIM
            const command = config.switchIMCmd.replace('{im}', config.defaultIM);
            outputChannel.appendLine(`Executing command: ${command}`);
            
            const { stdout, stderr } = await execAsync(command);
            
            if (stderr) {
                outputChannel.appendLine(`Switch IM command stderr: ${stderr}`);
            } else {
                outputChannel.appendLine(`Switch IM command executed successfully: ${stdout}`);
            }
        } catch (error) {
            outputChannel.appendLine(`Error executing switch IM command: ${error}`);
            vscode.window.showErrorMessage(`Failed to switch input method: ${error}`);
        }
    }

    // 获取当前输入法
    async function getCurrentInputMethod() {
        const config = getVimInputMethodConfig();
        
        if (!config.obtainIMCmd) {
            outputChannel.appendLine('Missing obtainIMCmd configuration');
            return null;
        }

        try {
            const { stdout, stderr } = await execAsync(config.obtainIMCmd);
            
            if (stderr) {
                outputChannel.appendLine(`Obtain IM command stderr: ${stderr}`);
                return null;
            }
            
            const currentIM = stdout.trim();
            outputChannel.appendLine(`Current input method: ${currentIM}`);
            return currentIM;
        } catch (error) {
            outputChannel.appendLine(`Error getting current input method: ${error}`);
            return null;
        }
    }

    // 创建命令来手动切换输入法
    const switchIMCommand = vscode.commands.registerCommand('vim-auto-input-method.switchInputMethod', async () => {
        outputChannel.appendLine('Manual switch input method command triggered');
        await switchInputMethod();
    });

    // 创建命令来获取当前输入法
    const getCurrentIMCommand = vscode.commands.registerCommand('vim-auto-input-method.getCurrentInputMethod', async () => {
        outputChannel.appendLine('Get current input method command triggered');
        const currentIM = await getCurrentInputMethod();
        if (currentIM) {
            vscode.window.showInformationMessage(`Current input method: ${currentIM}`);
        }
    });

    // 创建命令来获取配置
    const getConfigCommand = vscode.commands.registerCommand('vim-auto-input-method.getVimConfig', () => {
        outputChannel.appendLine('Get vim config command triggered');
        const config = getVimInputMethodConfig();
        vscode.window.showInformationMessage(`Vim Config: ${JSON.stringify(config, null, 2)}`);
    });

    // 创建命令来显示输出通道
    const showOutputCommand = vscode.commands.registerCommand('vim-auto-input-method.showOutput', () => {
        outputChannel.show();
    });

    // 监听配置变化
    const configWatcher = vscode.workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration('vim.autoSwitchInputMethod')) {
            outputChannel.appendLine('Vim input method configuration changed');
            const config = getVimInputMethodConfig();
            
            // 如果enable变为true，自动切换输入法
            if (config.enable) {
                switchInputMethod();
            }
        }
    });

     // 添加光标样式映射
    const cursorStyleMap: Record<string, vscode.TextEditorCursorStyle> = {
        'line': vscode.TextEditorCursorStyle.Line,
        'block': vscode.TextEditorCursorStyle.Block,
        'underline': vscode.TextEditorCursorStyle.Underline,
        'line-thin': vscode.TextEditorCursorStyle.LineThin,
        'block-outline': vscode.TextEditorCursorStyle.BlockOutline,
        'underline-thin': vscode.TextEditorCursorStyle.UnderlineThin,
    };

    // 记录上一个光标样式
    let lastCursorStyle: vscode.TextEditorCursorStyle | null = null;


    // 获取Vim配置中的光标样式
    function getVimCursorStyles() {
    const vimConfig = vscode.workspace.getConfiguration('vim');
    const cursorStyleForNormal = vimConfig.get<string>('cursorStylePerMode.normal');
    const cursorStyleForInsert = vimConfig.get<string>('cursorStylePerMode.insert');
    
    return {
        normal: cursorStyleForNormal && cursorStyleMap[cursorStyleForNormal] 
            ? cursorStyleMap[cursorStyleForNormal] 
            : vscode.TextEditorCursorStyle.Block,
        insert: cursorStyleForInsert && cursorStyleMap[cursorStyleForInsert] 
            ? cursorStyleMap[cursorStyleForInsert] 
            : vscode.TextEditorCursorStyle.Line
    };
}

    // 检查是否为Normal模式（方块光标）
    function isVimNormalMode(cursorStyle: vscode.TextEditorCursorStyle): boolean {
        const vimCursorStyles = getVimCursorStyles();
        return cursorStyle === vimCursorStyles.normal;
    }

    // 监听编辑器选项变化（包括光标样式）
    const editorOptionsWatcher = vscode.window.onDidChangeTextEditorOptions((event) => {
        const config = getVimInputMethodConfig();
        if (!config.enable) {
            return;
        }

        const cursorStyle = event.options.cursorStyle;
        
        // 如果光标样式发生变化
        if (cursorStyle && cursorStyle !== lastCursorStyle) {
            outputChannel.appendLine(`Cursor style changed: ${cursorStyle}`);
            
            // 检查是否为Normal模式（方块光标）
            if (isVimNormalMode(cursorStyle)) {
                outputChannel.appendLine('Detected Normal mode (block cursor), switching input method');
                switchInputMethod();
            } else {
                outputChannel.appendLine('Detected Insert mode or other mode, not switching input method');
            }
            
            lastCursorStyle = cursorStyle;
        }
    });

    // 监听活动编辑器变化（当焦点在文本编辑窗口时）
    const editorChangeWatcher = vscode.window.onDidChangeActiveTextEditor(editor => {
        const config = getVimInputMethodConfig();
        if (!config.enable) {
            return;
        }
        outputChannel.appendLine(`Active text editor changed: ${editor ? 'Editor present' : 'No editor'}`);

        if (editor && editor.document) {
            outputChannel.appendLine('Text editor focused, checking vim mode via cursor style');
            outputChannel.appendLine(`Editor file type: ${editor.document.languageId}`);
            outputChannel.appendLine(`Editor file path: ${editor.document.fileName}`);
            
            // 延迟一点时间确保光标样式已更新
            setTimeout(() => {
                const cursorStyle = editor.options.cursorStyle;
                if (cursorStyle && isVimNormalMode(cursorStyle)) {
                    outputChannel.appendLine('Editor focused with Normal mode cursor, switching input method');
                    switchInputMethod();
                } else {
                    outputChannel.appendLine('Editor focused but not in Normal mode, skipping input method switch');
                }
            }, 100);
        }
    });

    // 监听窗口焦点变化（当VS Code窗口获得焦点时）
    const windowFocusWatcher = vscode.window.onDidChangeWindowState(windowState => {
        const config = getVimInputMethodConfig();
        if (!config.enable) {
            return;
        }

        if (windowState.focused) {
            outputChannel.appendLine('VS Code window focused');
            // 检查是否有活动的文本编辑器
            const activeEditor = vscode.window.activeTextEditor;
            if (activeEditor && activeEditor.document) {
                outputChannel.appendLine('Window focused with active text editor, switching input method');
                switchInputMethod();
            }
        }
    });

    context.subscriptions.push(
        outputChannel, // 重要：将输出通道添加到订阅中，以便在扩展停用时清理
        switchIMCommand,
        getCurrentIMCommand,
        getConfigCommand,
        showOutputCommand,
        configWatcher,
        editorChangeWatcher,
        windowFocusWatcher,
    );
}

export function deactivate() {
    if (outputChannel) {
        outputChannel.dispose();
    }
}