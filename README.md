# Vim Auto Input Method

一个 VS Code 扩展，用于在使用 Vim 插件时自动切换输入法。当编辑器获得焦点时，自动切换到指定的默认输入法（通常是英文输入法），提升 Vim 使用体验。

## 功能特性

- 🎯 **智能模式检测**：通过监听光标样式变化检测 Vim 模式
- 🚀 **自动切换输入法**：进入 Normal 模式时自动切换到默认输入法
- 🔄 **多触发器支持**：支持编辑器焦点变化和窗口焦点变化
- ⚙️ **配置灵活**：支持自定义输入法切换命令
- 📝 **调试友好**：提供详细的输出日志
- 🎛️ **命令支持**：提供手动操作命令

## 工作原理

扩展通过监听以下事件来判断何时切换输入法：

1. **光标样式变化**：当光标样式变为 Normal 模式样式（通常是方块）时自动切换
2. **编辑器焦点变化**：编辑器获得焦点时检查当前模式，仅在 Normal 模式时切换
3. **窗口焦点变化**：VS Code 窗口获得焦点时自动切换

## 安装

1. 在 VS Code 扩展市场搜索 "Vim Auto Input Method"
2. 点击安装
3. 重启 VS Code

或者从 VSIX 文件安装：
```bash
code --install-extension vim-auto-input-method.vsix
```

## 配置

该扩展依赖于 VSCodeVim 扩展的输入法配置。在 VS Code 设置中添加以下配置：

### Windows 系统（推荐使用 im-select）

首先安装 [im-select](https://github.com/daipeihust/im-select)：

```json
{
  "vim.autoSwitchInputMethod.enable": true,
  "vim.autoSwitchInputMethod.defaultIM": "1033",
  "vim.autoSwitchInputMethod.obtainIMCmd": "im-select.exe",
  "vim.autoSwitchInputMethod.switchIMCmd": "im-select.exe {im}"
}
```

### macOS 系统

```json
{
  "vim.autoSwitchInputMethod.enable": true,
  "vim.autoSwitchInputMethod.defaultIM": "com.apple.keylayout.ABC",
  "vim.autoSwitchInputMethod.obtainIMCmd": "/usr/local/bin/im-select",
  "vim.autoSwitchInputMethod.switchIMCmd": "/usr/local/bin/im-select {im}"
}
```

### Linux 系统（使用 fcitx）

```json
{
  "vim.autoSwitchInputMethod.enable": true,
  "vim.autoSwitchInputMethod.defaultIM": "keyboard-us",
  "vim.autoSwitchInputMethod.obtainIMCmd": "fcitx-remote -n",
  "vim.autoSwitchInputMethod.switchIMCmd": "fcitx-remote -s {im}"
}
```

## 配置参数说明

| 参数 | 类型 | 说明 |
|------|------|------|
| `vim.autoSwitchInputMethod.enable` | boolean | 是否启用自动切换输入法功能 |
| `vim.autoSwitchInputMethod.defaultIM` | string | 默认输入法标识符 |
| `vim.autoSwitchInputMethod.obtainIMCmd` | string | 获取当前输入法的命令 |
| `vim.autoSwitchInputMethod.switchIMCmd` | string | 切换输入法的命令模板，`{im}` 会被替换为 defaultIM |


## 获取输入法标识符

### Windows 系统

使用 im-select 获取当前输入法 ID：
```bash
im-select.exe
```

常见的输入法 ID：
- `1033` - 英语（美国）
- `2052` - 中文（简体，中国）
- `1041` - 日语
- `1042` - 韩语

### macOS 系统

```bash
/usr/local/bin/im-select
```

常见的输入法标识符：
- `com.apple.keylayout.ABC` - 英语
- `com.apple.inputmethod.SCIM.ITABC` - 简体中文
- `com.sogou.inputmethod.sogou.pinyin` - 搜狗拼音

### Linux 系统

```bash
fcitx-remote -n
```

## 故障排除

### 1. 扩展不工作
- 确保已安装并启用 VSCodeVim 扩展
- 检查配置是否正确
- 查看输出日志：`Vim Auto Input Method: Show Output`

### 2. 输入法切换失败
- 确认输入法切换工具已正确安装（如 im-select）
- 验证 `defaultIM` 参数是否正确
- 检查命令路径是否正确

### 3. 获取输入法 ID
- Windows: 运行 `im-select.exe` 查看当前输入法 ID
- macOS: 运行 `/usr/local/bin/im-select` 查看当前输入法
- Linux: 运行 `fcitx-remote -n` 查看当前输入法

### 4. 权限问题
- 确保命令行工具有执行权限
- 在某些系统上可能需要管理员权限




欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 相关链接

- [VSCodeVim](https://github.com/VSCodeVim/Vim)
- [im-select (Windows/macOS)](https://github.com/daipeihust/im-select)
- [fcitx (Linux)](https://fcitx-im.org/)

---

如果这个扩展对您有帮助，请给个⭐️支持一下！