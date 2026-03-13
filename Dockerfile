# 博客系统 - 生产环境
# 使用 Node.js 20 LTS
FROM node:20-slim

# 设置 npm 淘宝镜像
ENV NPM_CONFIG_REGISTRY=https://registry.npmmirror.com

# 设置工作目录
WORKDIR /app

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 复制 pnpm 配置（Docker 专用）
COPY .pnpmrc.docker .pnpmrc

# 复制 package.json 和 lock 文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# 复制 packages 和 apps 的 package.json
COPY packages/core/package.json ./packages/core/
COPY apps/site/package.json ./apps/site/
COPY apps/admin/package.json ./apps/admin/

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制全部源代码
COPY . .

# 构建应用
RUN pnpm build

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000 || exit 1

# 默认命令（生产模式运行）
CMD ["pnpm", "start"]
