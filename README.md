# EdgeMailer

基于 Cloudflare Workers + Resend API 的边缘邮件发送服务，支持网页端可视化发送邮件，安全、快速、可部署在全球边缘节点。

## 🔑 环境变量配置

请在 Cloudflare Workers 中配置以下变量：

| 变量名    | 说明             |
| ------ | -------------- |
| API    | Resend API Key |
| TOKEN  | 访问鉴权 Token     |
| DOMAIN | 已验证的发件域名       |

## 🚀 简单部署

1. **Fork 本项目** 或者 **新建 Worker 项目**
2. **复制 `worker.js` 内容** 到你的 Worker  项目中
3. **在环境变量中设置** `API`、`TOKEN`、`DOMAIN`
4. 打开 Worker 地址即可访问

访问地址：

```
https://your-worker-or-pages-url/?token=你的TOKEN
```

## 🖥️ 使用说明

### 填写内容

| 字段    | 说明                                                             |
| ----- | -------------------------------------------------------------- |
| 发件前缀  | 例如：admin → [admin@yourdomain.com](mailto:admin@yourdomain.com) |
| 收件人   | 目标邮箱地址                                                         |
| 主题    | 邮件主题                                                           |
| 正文    | HTML 邮件内容                                                      |

### 示例

```
发件前缀: service
收件人: test@gmail.com
主题: 测试邮件
正文: <h1>Hello</h1>
```

点击 **发送** 即可完成邮件发送。

## ❤️ 致谢

* Cloudflare
* Resend
* ChatGPT

⭐ 如果这个项目对你有帮助，请给个 Star 支持一下！
