# LUO XIN Portfolio

基于 Figma 设计实现的响应式作品集网站，使用 React、Vite 与 React Router。

## 本地运行

```bash
pnpm install
pnpm dev
```

生产构建与本地预览：

```bash
pnpm build
pnpm preview
```

## 部署到 Netlify

仓库已包含 `netlify.toml`：Netlify 会执行 `pnpm build`、发布 `dist/`，并把所有页面路径回退到 `index.html`，因此项目详情页和简历页可直接刷新。

1. 将项目推送至 GitHub 公开仓库。
2. 在 Netlify 中选择 **Add new site → Import an existing project**。
3. 连接 GitHub 并选择该仓库。
4. 保留仓库中的构建配置并发布。

以后推送到 GitHub 默认分支时，Netlify 会自动重新构建并上线。

## 更新简历

用新的同名文件替换：

`public/assets/resume/LUOXIN·RESUME.pdf`

网页预览和“下载 PDF”按钮会同时使用该文件。

## 更新首页封面

首页封面位于 `public/assets/home/`，文件名对应 `src/main.jsx` 顶部的项目卡片配置。建议继续使用无损 WebP；卡片宽度由页面样式控制，高度会按图片原始比例变化。

## 更新项目详情

项目素材均位于 `public/assets/projects/`：

- `6070/segments/`
- `ren-shi/segments/`
- `shouyu/segments/`
- `imeo/segments/`
- `reson/segments/`
- `b2b/`
- `logo/`

分段项目应保持现有文件名；替换同名 SVG 后即可更新。B 端与 Logo 项目分别使用各自目录中的背景图和卡片素材。

## 移动端说明

网站支持手机竖屏。手机横屏时会显示“请旋转至竖屏”的全屏提示，不加载横屏专用排版。
