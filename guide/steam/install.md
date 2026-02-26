# 如何下载并安装 Steam

> 适用系统：Windows 10/11、macOS、Linux（Ubuntu/Debian）

---

## Windows

### 1. 下载安装包

前往 Steam 官网下载安装程序：

```
https://store.steampowered.com/about/
```

点击页面中央的 **安装 Steam** 按钮，下载 `SteamSetup.exe`。

> 如果官网打不开，说明需要先解决网络问题，参考 [Steam 加速方案对比](./accelerator)。

### 2. 运行安装程序

双击 `SteamSetup.exe`，全程默认下一步即可。

默认安装路径是 `C:\Program Files (x86)\Steam`，**建议改到非系统盘**，避免 C 盘爆满：

```
D:\Steam
```

### 3. 首次启动

安装完成后 Steam 会自动启动并下载更新，等待进度条跑完。

注册账号或登录已有账号，完成。

---

## macOS

### 1. 下载

同样前往官网，点击 **安装 Steam**，下载的是 `steam.dmg`。

### 2. 安装

打开 `steam.dmg`，将 Steam 拖入 **应用程序** 文件夹。

### 3. 首次启动

从启动台打开 Steam，等待更新完成后登录即可。

> macOS 如果提示"无法打开，因为它来自未知开发者"，前往  
> **系统偏好设置 → 安全性与隐私 → 仍然打开**。

---

## Linux（Ubuntu / Debian）

### 方式一：apt 安装（推荐）

```bash
sudo apt update
sudo apt install steam
```

安装完成后在应用列表搜索 Steam 打开即可。

### 方式二：官网 .deb 包

```bash
# 下载
wget https://cdn.akamai.steamstatic.com/client/installer/steam.deb

# 安装
sudo dpkg -i steam.deb
sudo apt --fix-broken install
```

### 注意事项

Steam 在 Linux 上依赖 32 位库，如果提示缺少依赖：

```bash
sudo dpkg --add-architecture i386
sudo apt update
sudo apt install libgl1-mesa-dri:i386 libgl1:i386
```

---

## 常见问题

**Q：安装后打开一直转圈不进去？**  
A：大概率是网络问题，Steam 首次启动需要连接服务器。参考 [加速方案](./accelerator)。

**Q：下载游戏速度极慢？**  
A：进入 Steam → 设置 → 下载 → 下载地区，改为**上海**或**香港**。

**Q：安装路径能不能后期再改？**  
A：可以。Steam → 设置 → 存储 → 添加新存储库，迁移游戏不影响存档。
