# EdgeMailer

🚀 一个基于 Cloudflare Workers + Resend API 的边缘邮件发送服务，支持网页端可视化发送邮件，安全、快速、可部署在全球边缘节点。

## ✨ 功能特性

* ✅ 基于 Cloudflare Workers 运行（无需服务器）
* ✅ 使用 Resend API 发送邮件
* ✅ 网页端可视化操作
* ✅ API Key / Token / 域名 使用 Workers Secret 管理
* ✅ 支持访问权限校验
* ✅ 发件人前缀可自定义
* ✅ 收件人 / 主题 / 正文完全自定义
* ✅ 简洁美观的 Web UI

## ⚙️ 环境要求

* Cloudflare 账号
* 已注册 Resend 并获取 API Key
* 已在 Resend 中验证发件域名

## 🔑 环境变量配置

请在 Cloudflare Workers 中配置以下变量：

| 变量名    | 说明             |
| ------ | -------------- |
| API    | Resend API Key |
| TOKEN  | 访问鉴权 Token     |
| DOMAIN | 已验证的发件域名       |

## 🚀 部署方式

### 简单方式

1. **Fork 本项目** 或者 **新建 Worker 项目**
2. **复制 `worker.js` 内容** 到你的 Worker  项目中
3. **在环境变量中设置** `API`、`TOKEN`、`DOMAIN`
4. 打开 Worker 地址即可访问

示例访问地址：

```
https://your-worker-or-pages-url/?token=你的TOKEN
```

## 🖥️ 使用说明

### 填写内容

| 字段    | 说明                                                             |
| ----- | -------------------------------------------------------------- |
| Token | 访问密钥（TOKEN）                                                    |
| 发件前缀  | 例如：admin → [admin@yourdomain.com](mailto:admin@yourdomain.com) |
| 收件人   | 目标邮箱地址                                                         |
| 主题    | 邮件主题                                                           |
| 正文    | HTML 邮件内容                                                      |

### 示例

```
Token: xxxxxx
发件前缀: service
收件人: test@gmail.com
主题: 测试邮件
正文: <h1>Hello</h1>
```

点击 **发送** 即可完成邮件发送。


## 🔐 安全机制

* Token 校验，防止滥用
* API Key 存储于 Secret / 环境变量，不暴露前端
* 域名不可前端修改
* 请求参数校验


## 📚 技术栈

* Cloudflare Workers / Pages
* JavaScript (ES Module)
* Resend API
* HTML / CSS


## 🛠 开发建议

本项目适用于：

* 个人邮件通知系统
* API 邮件服务
* 自动化脚本推送
* 边缘通知系统

可二次开发：

* 添加登录系统
* 日志记录
* 邮件模板
* 批量发送

## 📄 License

MIT License

## ❤️ 致谢

* Cloudflare
* Resend
* ChatGPT

---

⭐ 如果这个项目对你有帮助，请给个 Star 支持一下！
