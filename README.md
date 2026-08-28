# IELTS Computer-Delivered Mock Test Simulator

这是一个前端版 IELTS Computer-Delivered Mock Test Simulator。当前版本用于运行 `Mock Test 01`，重点还原 IELTS 机考的 Reading、Listening、Writing 基本考试体验。

## 技术栈

- React
- TypeScript
- Vite
- React Router
- CSS Modules
- Zustand
- pnpm

## 本地环境要求

请先确认本机可以访问以下命令：

```bash
node -v
npm -v
pnpm -v
```

当前项目使用：

```text
pnpm@11.19.0
```

## 安装依赖

进入项目目录：

```bash
cd /Users/lynn/Lynn_files/ielts-simulator
```

安装依赖：

```bash
pnpm install
```

## 启动开发环境

```bash
pnpm dev
```

启动后在浏览器打开终端里显示的地址，通常是：

```text
http://localhost:5173/
```

如果 `5173` 端口被占用，Vite 会自动使用下一个可用端口，请以终端实际显示为准。

## 构建检查

运行 TypeScript 检查并生成生产构建：

```bash
pnpm build
```

只做 TypeScript 检查：

```bash
pnpm typecheck
```

预览生产构建：

```bash
pnpm preview
```

## 当前考试内容

当前内置：

- `Mock Test 01`
- Academic Reading
- Listening
- Writing Task 1
- Writing Task 2

题库数据主要在：

```text
src/data/mockTest01.ts
```

考试资源在：

```text
public/assets/mock-test-01/
```

其中听力音频在：

```text
public/assets/mock-test-01/audio/
```

当前音频文件命名为：

```text
mock-test-01-listening-section-1.mp3
mock-test-01-listening-section-2.mp3
mock-test-01-listening-section-3.mp3
mock-test-01-listening-section-4.mp3
```

## 考试流程

1. 打开首页。
2. 选择 `Mock Test 01`。
3. 分别完成 Reading、Listening、Writing。
4. 单个模块提交后不会立即显示正确题数或答案。
5. 所有模块提交完成后，首页会显示 `View final result`。
6. 进入最终结果页后可以查看并复制完整考试结果。
7. 完成整套考试后可以使用 `Reset test` 清空本地考试记录并重新开始。

## 本地保存

考试进度保存在浏览器本地存储中，包括：

- answers
- writing text
- timer state
- current question
- review flags
- highlights
- notes
- submitted status

刷新页面不会重置考试计时器。

## 注意事项

- V1 是 frontend only，没有 backend、database、authentication 或 AI grading。
- Reading 和 Listening 使用本地 deterministic grading。
- Writing 不自动评分，只显示字数和复制按钮。
- Speaking 不在 V1 范围内。
- 考试材料中的 IELTS 原始内容保持英文，不翻译。

## GitHub

远程仓库：

```text
git@github.com:Lynnnnn-n/ielts-simulator.git
```

推送代码：

```bash
git push
```
