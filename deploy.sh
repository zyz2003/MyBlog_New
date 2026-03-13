#!/bin/bash
# 博客系统一键部署脚本
set -e

PROJECT_DIR="/opt/my-blog"
CONTAINER_NAME="my-blog"
IMAGE_NAME="my-blog:latest"
PORT="3000"

echo "=== 博客系统一键部署 ==="

# 检查 root
if [ "$EUID" -ne 0 ]; then
    echo "请使用 sudo 运行"
    exit 1
fi

# 安装 Docker
if ! command -v docker &> /dev/null; then
    echo "安装 Docker..."
    apt update && apt install -y docker.io
    systemctl start docker
    systemctl enable docker
fi

# 安装 Git
if ! command -v git &> /dev/null; then
    echo "安装 Git..."
    apt install -y git
fi

# 克隆代码
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

if [ -d ".git" ]; then
    echo "更新代码..."
    git pull origin master
else
    echo "克隆代码..."
    git clone https://github.com/zyz2003/MyBlog_New.git .
fi

# 构建镜像
echo "构建 Docker 镜像..."
docker build -t $IMAGE_NAME .

# 停止旧容器
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true

# 创建数据卷
docker volume create ${CONTAINER_NAME}-data 2>/dev/null || true

# 启动容器
echo "启动容器..."
docker run -d \
    --name $CONTAINER_NAME \
    -p $PORT:3000 \
    -v ${CONTAINER_NAME}-data:/app/apps/site/data \
    --restart unless-stopped \
    $IMAGE_NAME

sleep 5

echo ""
echo "=== 部署完成 ==="
echo "访问地址：http://你的服务器 IP:$PORT"
echo "后台地址：http://你的服务器 IP:$PORT/admin"
echo "查看日志：docker logs -f $CONTAINER_NAME"
echo "管理脚本：./blog.sh"
