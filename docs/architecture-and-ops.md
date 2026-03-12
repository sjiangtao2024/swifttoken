# swifttoken 架构与初始运维说明

## 当前部署结构

### 核心角色
- `new-api`
  - 作为后端服务，同时自带管理后台。
- Hugging Face Space
  - 运行私有的 `new-api` 实例。
- Cloudflare Worker：`console`
  - 作为管理后台的公网入口。
- Cloudflare Worker：`api`
  - 作为 API 流量的公网入口，只放行业务接口路径。
- Aiven PostgreSQL
  - 作为 `new-api` 的持久化数据库。

### 域名分工
- `console.swifttoken.cn`
  - 管理后台登录、初始化、系统配置。
- `api.swifttoken.cn`
  - API 网关，供客户端和后续前端调用。
- `swifttoken.cn`
  - 预留给静态前端官网。

## 运行链路

### 管理后台链路
1. 浏览器访问 `https://console.swifttoken.cn`
2. Cloudflare `console` Worker 转发到私有 Hugging Face Space
3. Hugging Face Space 运行 `new-api`
4. `new-api` 读写 Aiven PostgreSQL

### API 链路
1. 客户端访问 `https://api.swifttoken.cn`
2. Cloudflare `api` Worker 只转发允许的 API 路径
3. 私有 Hugging Face Space 接收请求
4. `new-api` 执行鉴权、限额、路由和上游转发

## 当前关键配置

### new-api
- `server_address`
  - `https://api.swifttoken.cn`
- `passkey_rp_id`
  - `console.swifttoken.cn`
- `passkey_origins`
  - `https://console.swifttoken.cn`

### Hugging Face Space Secrets
- `SESSION_SECRET`
- `CRYPTO_SECRET`
- `SQL_DSN`

### Worker Secret
- `HF_SPACE_BEARER_TOKEN`

### Cloudflare 部署变量
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

## 为什么必须使用 PostgreSQL
- 新建的 Hugging Face Space 已不再提供 `/data` 持久化存储。
- 在 Space 内使用 SQLite，重启后数据会丢失。
- 因此持久化状态必须放到外部数据库。

## 初始控制策略

### 目标
保护上游套餐账号，保证对外流量稳定，避免渠道被打爆或触发风控。

### 优先级顺序
1. 渠道保护
2. Token 级限流
3. 用户级限流
4. 全局兜底限流
5. 模型级微调

### 原因
- 你的核心资产是上游账号池，不是单个高价模型。
- 最大风险是某个渠道被集中打爆、被限速或被风控。
- 对外发放的 key 不能无限制消耗流量。
- 全局限流只是最后一道保险，不应该成为主策略。

## 建议的初始策略

### 渠道层
- 尽量将流量分散到多个上游渠道。
- 避免单个套餐账号承接全部热点流量。
- 初期先保守设置单渠道承载能力，观察稳定性后再放宽。

### Token 层
- 每个外部 API key 都要有明确的使用边界。
- Token 级限流应作为最直接的反滥用措施。

### 用户层
- 用用户级限流避免同一用户通过多个 key 绕过单 key 限制。

### 全局层
- 保留系统级上限，用于保护 HF Space 和后端不被突发流量打穿。

### 模型层
- 即使使用的是性价比较高的模型，也建议保留模型级控制，用于拥塞管理与资源分配。

## 安全建议
- Hugging Face Space 保持 `private`
- 对公网仅暴露 Cloudflare Workers
- 不向用户暴露真实上游供应商结构和凭据
- 数据库密码、供应商密钥一旦在聊天、终端、日志中暴露，就立即轮换
- 建议给 `console.swifttoken.cn` 增加 Cloudflare Access

## 当前仓库结构
- `Dockerfile`
  - 用于 Hugging Face 运行 `new-api` 的薄包装
- `workers/console`
  - 管理后台 Worker
- `workers/api`
  - API Worker

## 下一步建议
- 为 `console.swifttoken.cn` 增加 Cloudflare Access 或等效保护
- 如有必要，进一步收紧 `api` Worker 的路径白名单
- 开始建设 `swifttoken.cn` 静态前端
- 在 `new-api` 控制台中配置正式限流与渠道策略
