# 博客系统开发环境
# 使用 Node.js 20 LTS（与生产环境一致）
FROM node:20-alpine

# 安装必要的工具
RUN apk add --no-cache git

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

# 安装依赖（Linux 环境下 better-sqlite3 可以正常构建）
RUN pnpm install --frozen-lockfile

# 复制全部源代码
COPY . .

# 确保数据目录存在
RUN mkdir -p /app/apps/site/data

# 暴露端口
# Nuxt 默认端口 3000，devtools 端口 3001
EXPOSE 3000 3001

# 设置环境变量
ENV NODE_ENV=development
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000
ENV DATABASE_PATH=/app/apps/site/data/blog.db

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000 || exit 1

# 默认命令
CMD ["pnpm", "dev"]
