# cf SssS优选


> ⚠️ 本教程仅讲 **网站加速与稳定性优化** 的“优选域名”配置思路（基于 Cloudflare for SaaS / Custom Hostname）。请确保你的业务合规，并遵守 Cloudflare 与当地法律法规。


### 1. 什么是“CF 优选域名”（你在做什么）


“优选域名”常见指一种接入方式：

- 让 **业务域名**（例如 `www.a.com`）通过 **Cloudflare for SaaS（Custom Hostname）** 接入 Cloudflare。
- 将 SaaS 的 **回退源（Fallback origin）** 指向一个你可控的 **优选域名**（例如 `www.b.com`）。
- 再通过 DNS 的指向关系，让流量更倾向于走你筛选过的、更适合你网络环境的节点。

它解决的核心问题通常是：在某些网络环境下，Cloudflare 默认泛播节点并不总是最优，导致延迟、丢包、抖动不稳定。


---


### 2. 适用场景与限制


**适用场景**

- 你有一个网站想走 Cloudflare，但希望更可控地选择访问效果更好的线路。
- 你的业务域名不一定托管在 Cloudflare，也想享受 Cloudflare 的证书与代理能力。

**常见限制与提醒**

- 如果你的根域（`a.com`）同时用于邮箱（MX 记录），直接把根域改成 CNAME 往往会冲突。建议优先用 `www.a.com` 做网站域名。
- Cloudflare 的界面与套餐能力可能随时间变化，文案位置可能略有不同。

---


### 3. 准备清单（开始之前必须有）


你需要准备三样东西：

1. **业务域名（被加速的域名）**
    - 示例：`www.a.com`
    - 说明：可以不托管在 Cloudflare，在哪个 DNS 服务商都可以。
2. **优选域名（工具域名 / 回退源域名）**
    - 示例：`www.b.com`
    - 说明：**必须托管在 Cloudflare**，并且 DNS 记录需要能开启代理（橙云）。
3. **源站（你的网站服务器）**
    - 示例：源站公网 IPv4：`1.2.3.4`
    - 或者源站域名：`origin.yourdomain.com`
> 推荐命名：
> - 业务域名：`www.a.com`
> - 优选域名：`www.b.com`
> - 源站域名：`origin.b.com`（可选，用于更清晰地分离“回源”和“优选”）

---


### 4. 第一步：把“优选域名 [b.com](http://b.com/)”接入 Cloudflare 并能正常回源


4.1 将 [b.com](http://b.com/) 托管到 Cloudflare

- 到 [b.com](http://b.com/) 的域名注册商 / DNS 服务商处，把 NS 修改为 Cloudflare 提供的 NS。
- 等待解析生效。

4.2 在 [b.com](http://b.com/) 的 Cloudflare DNS 里配置回源（基础版）


在 Cloudflare → [b.com](http://b.com/) → **DNS**：

- 添加 `origin` 记录（推荐）：
    - `origin.b.com` → **A 记录** 指向源站 IP（例：`1.2.3.4`）
    - 代理：建议先 **关闭（灰云）**，保证回源明确稳定
- 添加 `www` 记录（优选域名入口）：
    - `www.b.com` → **CNAME** 指向 `origin.b.com`
    - 代理：**开启（橙云）**
> 这样做的好处：
> - `origin.b.com` 永远指向真实源站（便于排错）
> - `www.b.com` 是对外入口（可承接 SaaS 回退源）

4.3 SSL/TLS 基础设置建议


在 Cloudflare → [b.com](http://b.com/) → **SSL/TLS**：

- 如果源站已经有正确证书：建议选择 **Full (strict)**
- 如果源站暂时没有证书：可临时用 **Full** 过渡（不建议长期）

---


### 5. 第二步：开启 SaaS（Custom Hostname）并设置回退源（关键步骤）


在 Cloudflare（通常在 **SSL/TLS → Custom Hostnames（自定义主机名）**）：


5.1 设置回退源（Fallback origin）

- 将 **Fallback origin** 设置为：`www.b.com`

5.2 添加业务域名为 Custom Hostname

- 新增 **Custom Hostname**：填写 `www.a.com`

5.3 做 DCV 域名验证（按 Cloudflare 给你的值照填）

- Cloudflare 会提示你添加一条用于验证的记录（常见是 `_acme-challenge` 的 CNAME 或 TXT）。
- 到 [a.com](http://a.com/) 当前使用的 DNS 服务商，添加该记录。
- 等验证通过。
> 小贴士：
> - 记录名与记录值要严格一致
> - 若长时间不通过，优先检查：是否添加到了正确的域名区域、是否拼写多了点号、是否加错了子域层级

---


### 6. 第三步：把业务域名 CNAME 到优选域名


在 [a.com](http://a.com/) 的 DNS 服务商：

- 将 `www.a.com` 的记录设置为：
    - `www.a.com` → **CNAME** 到 `www.b.com`

此时典型访问链路是：

1. 用户访问 `www.a.com`
2. DNS 把 `www.a.com` 指向 `www.b.com`
3. `www.b.com` 在 Cloudflare 代理下处理 TLS 与转发
4. SaaS 根据 Custom Hostname 识别 `www.a.com`，并按设置回退源到 `www.b.com`（以及其后续回源逻辑）

---


### 7. 第四步：让“优选”真正生效（把优选域名指向你选的节点）


这一步有多种实现方式，下面给出最常用、最容易理解的一种：


7.1 选出你网络环境下更合适的 Cloudflare 节点 IP

- 你需要一份“优选 IP”列表，或自行测速筛选。
- 建议分别对 80/443 的可用性、延迟、丢包做测试。

7.2 将 `www.b.com` 指向优选 IP


在 Cloudflare → [b.com](http://b.com/) → **DNS**，将：

- `www.b.com` 的记录改为：
    - `www.b.com` → **A 记录** 指向你筛选出的优选 IP
    - 代理：保持 **橙云开启**
> 注意：不同“优选 IP”方案对端口、TLS、回源方式要求可能不同。
> 如果你改完后网站不可用：先把 `www.b.com` 记录恢复到上一版（例如 CNAME → `origin.b.com`）以回滚。

---


### 8. 常见问题（FAQ）


8.1 根域有邮箱（MX）怎么办？

- 根域 `a.com` 常常需要保留 MX 等记录，直接改 CNAME 会冲突。
- 推荐：网站用 `www.a.com`，邮箱继续用根域或 `mail.a.com`。

8.2 验证一直不通过（DCV 卡住）

- 检查 `_acme-challenge` 记录是否加在了正确的 DNS 区域。
- 检查记录值是否多了域名后缀或多了一个点。
- 等待 DNS 缓存刷新后重试。

8.3 HTTPS 打不开或证书不对

- 确认 Custom Hostname 状态是 Active。
- 确认 SSL/TLS 模式与源站证书匹配。
- 若源站是自签证书且你用了 Full (strict)，会失败。

---


### 9. 最小可用检查清单（按顺序打勾）

- [ ] `origin.b.com` 能直连访问源站（用于排错）
- [ ] `www.b.com` 在 Cloudflare 中已开启代理（橙云）
- [ ] Cloudflare Custom Hostname 中 `www.a.com` 已通过验证并激活
- [ ] [a.com](http://a.com/) DNS 中 `www.a.com` 已 CNAME 到 `www.b.com`
- [ ]（可选）`www.b.com` 已切换到你筛选的优选 IP，并且业务访问正常

---


### 10. 建议的记录示例（便于照抄）


[**b.com**](http://b.com/)**（在 Cloudflare）**

- `origin`：A → `1.2.3.4`（灰云）
- `www`：CNAME → `origin.b.com`（橙云）

[**a.com**](http://a.com/)**（在你的 DNS 服务商）**

- `_acme-challenge.www`：按 Cloudflare 给的 DCV 记录添加
- `www`：CNAME → `www.b.com`
