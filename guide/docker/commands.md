# Docker 常用命令速查

---

## 镜像

```bash
# 拉取镜像
docker pull nginx

# 查看本地镜像
docker images

# 删除镜像
docker rmi nginx
```

---

## 容器

```bash
# 运行容器（前台）
docker run nginx

# 后台运行 + 端口映射 + 自动重启
docker run -d -p 80:80 --restart unless-stopped nginx

# 查看运行中的容器
docker ps

# 查看所有容器（含已停止）
docker ps -a

# 停止 / 启动 / 重启
docker stop <容器ID>
docker start <容器ID>
docker restart <容器ID>

# 删除容器
docker rm <容器ID>

# 进入容器终端
docker exec -it <容器ID> bash
```

---

## 日志

```bash
# 查看日志
docker logs <容器ID>

# 实时追踪日志
docker logs -f <容器ID>

# 只看最后 100 行
docker logs --tail 100 <容器ID>
```

---

## Docker Compose

```bash
# 启动（后台）
docker compose up -d

# 停止并删除容器
docker compose down

# 查看服务状态
docker compose ps

# 查看日志
docker compose logs -f
```

---

## 清理

```bash
# 删除所有停止的容器
docker container prune

# 删除未使用的镜像
docker image prune

# 一键清理所有无用资源
docker system prune -a
```
