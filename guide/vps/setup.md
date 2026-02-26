# 初始化服务器

> 拿到 VPS 后的第一步：登录、改密码、装常用工具。

---


## SSH 登录


```plain text
ssh root@你的服务器IP
```


首次登录输入收到的初始密码，然后立即改密码：


```plain text
passwd
```


---


## 更新系统


```plain text
apt update && apt upgrade -y
```


---


## 安装常用工具


```plain text
apt install -y curl wget git vim ufw htop
```


---


## 配置防火墙


只开放必要端口，其余全部关闭：


```plain text
# 默认拒绝所有入站
ufw default deny incoming
ufw default allow outgoing

# 放行 SSH（必须，否则断开后进不去）
ufw allow 22

# 放行 HTTP / HTTPS
ufw allow 80
ufw allow 443

# 启用
ufw enable
```


---


## 创建普通用户（可选但推荐）


长期用 root 操作风险较高，建议创建普通用户：


```plain text
adduser aba
usermod -aG sudo aba
```


之后用 aba 用户登录，需要权限时加 sudo。


---


## 下一步


服务器初始化完成后，可以：

- 安装 Docker：参考 [Docker 入门](../docker/index)
- 搭建反向代理：Nginx / Caddy
