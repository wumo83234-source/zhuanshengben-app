# 河南专升本上岸助手

基于视频里的方法，这里已经从静态 HTML 原型升级为 `Vite + React + Tailwind` 前端工程。

## 当前能力

- 手机 / iPad 预览模式切换
- 首页学习计划和避让型日程
- 专项练习与手写 Canvas 草稿
- AI 诊断弹窗 mock 流程
- 错题本回流，保存当前手写草稿图片
- 资料上传 mock 和考点贴标
- IndexedDB 本地持久化
- PWA manifest 和基础 service worker

原来的静态原型已保留在 `legacy-static-prototype.html`。

## 本地运行

```powershell
npm install
npm run dev
```

默认访问：

```text
http://localhost:5173/
```

## 构建

```powershell
npm run build
```

构建产物会输出到 `dist/`。

## Cloudflare Pages 部署

- Framework preset: `Vite`
- Build command: `npm run build`
- Build output directory: `dist`

后续接 AI/OCR 时，建议用 Cloudflare Worker 做 API 转发，避免前端暴露密钥。

## GitHub Pages 部署

仓库已包含 `.github/workflows/deploy-pages.yml`。推送到 GitHub 后，Actions 会构建并发布到：

```text
https://wumo83234-source.github.io/zhuanshengben-app/
```
