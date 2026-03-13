#!/bin/bash
# 博客系统部署脚本 - 使用 docker-compose
set -e

echo "停止并移除旧容器..."
docker-compose down 2>/dev/null || true

echo "构建镜像..."
docker-compose build

echo "启动服务..."
docker-compose up -d

sleep 3

echo ""
echo "=========================================="
echo "部署完成！"
echo "博客系统：http://你的服务器 IP:3000"
echo "MySQL: 本地端口 3306 (blog/blog123)"
echo "=========================================="
echo ""
echo "查看日志：docker-compose logs -f"
echo "停止服务：docker-compose down"
echo ""
