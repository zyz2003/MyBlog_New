#!/bin/bash
# 博客系统管理脚本

CONTAINER_NAME="my-blog"
PORT="3000"
IMAGE_NAME="my-blog:latest"

case "$1" in
    start)
        docker start $CONTAINER_NAME
        echo "已启动"
        ;;
    stop)
        docker stop $CONTAINER_NAME
        echo "已停止"
        ;;
    restart)
        docker restart $CONTAINER_NAME
        echo "已重启"
        ;;
    rebuild)
        cd /opt/my-blog
        docker build -t $IMAGE_NAME .
        docker stop $CONTAINER_NAME 2>/dev/null || true
        docker rm $CONTAINER_NAME 2>/dev/null || true
        docker run -d --name $CONTAINER_NAME -p $PORT:3000 -v ${CONTAINER_NAME}-data:/app/apps/site/data --restart unless-stopped $IMAGE_NAME
        echo "重建完成"
        ;;
    logs)
        docker logs -f $CONTAINER_NAME
        ;;
    status)
        docker ps -a --filter name=$CONTAINER_NAME
        ;;
    backup)
        mkdir -p /opt/my-blog-backup
        docker run --rm -v ${CONTAINER_NAME}-data:/source -v /opt/my-blog-backup:/backup alpine cp /source/blog.db /backup/blog-$(date +%Y%m%d).db
        echo "备份完成"
        ;;
    restore)
        docker stop $CONTAINER_NAME
        docker run --rm -v ${CONTAINER_NAME}-data:/data -v /opt/my-blog-backup:/backup alpine cp /backup/blog.db /data/blog.db
        docker start $CONTAINER_NAME
        echo "恢复完成"
        ;;
    *)
        echo "用法：./blog.sh <命令>"
        echo "  start    启动"
        echo "  stop     停止"
        echo "  restart  重启"
        echo "  rebuild  重建"
        echo "  logs     日志"
        echo "  status   状态"
        echo "  backup   备份"
        echo "  restore  恢复"
        ;;
esac
