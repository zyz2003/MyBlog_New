#!/bin/bash
# 博客系统部署脚本
set -e

CONTAINER_NAME="my-blog"
IMAGE_NAME="my-blog:dev"
PORT="3000"

echo "构建镜像..."
docker build -t $IMAGE_NAME .

echo "停止旧容器..."
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true

echo "创建数据卷..."
docker volume create ${CONTAINER_NAME}-data 2>/dev/null || true

echo "启动容器..."
docker run -d \
    --name $CONTAINER_NAME \
    -p $PORT:3000 \
    -v ${CONTAINER_NAME}-data:/app/apps/site/data \
    --restart unless-stopped \
    $IMAGE_NAME

sleep 3
echo "部署完成！访问：http://你的服务器 IP:$PORT"
