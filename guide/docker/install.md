# 安装 Docker

> 适用于 Ubuntu 22.04 / Debian 12。

---

## 一键安装脚本

Docker 官方提供了安装脚本，直接用最省事：

```bash
curl -fsSL https://get.docker.com | sh
```

安装完成后把当前用户加入 docker 组，避免每次都要 sudo：

```bash
usermod -aG docker $USER
newgrp docker
```

---

## 验证安装

```bash
docker --version
docker run hello-world
```

看到 `Hello from Docker!` 说明安装成功。

---

## 安装 Docker Compose

新版 Docker 已内置 Compose 插件：

```bash
docker compose version
```

如果提示找不到命令，单独安装：

```bash
apt install -y docker-compose-plugin
```

---

## 下一步

参考 [常用命令速查](./commands) 开始使用。
