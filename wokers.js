export default {
  async fetch(request, env) {

    /* ========= 鉴权 ========= */

    const url = new URL(request.url);

    const queryToken = url.searchParams.get("token");

    const headerToken = request.headers
      .get("Authorization")
      ?.replace("Bearer ", "");

    const token = queryToken || headerToken;

    if (!token || token !== env.TOKEN) {
      return new Response("Unauthorized", { status: 403 });
    }

    /* ========= GET：页面 ========= */

    if (request.method === "GET") {
      return new Response(getHTML(token, env.DOMAIN), {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      });
    }

    /* ========= POST：发送邮件 ========= */

    if (request.method === "POST") {
      try {

        const body = await request.json();

        const {
          fromName,
          fromPrefix,
          to,
          subject,
          html,
        } = body;

        if (!fromPrefix || !to || !subject || !html) {
          return json({ error: "Missing parameters" }, 400);
        }

        if (!env.DOMAIN) {
          return json({ error: "DOMAIN not configured" }, 500);
        }

        const fromEmail = `${fromPrefix}@${env.DOMAIN}`;

        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.API}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromName
              ? `${fromName} <${fromEmail}>`
              : fromEmail,

            to: Array.isArray(to) ? to : [to],
            subject,
            html,
          }),
        });

        const result = await res.json();

        return json(result, res.status);

      } catch (e) {

        return json({ error: e.message }, 500);

      }
    }

    return new Response("Method Not Allowed", { status: 405 });
  },
};


/* ========= JSON 工具 ========= */

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}


/* ========= 页面 ========= */

function getHTML(token, domain) {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>EdgeMailer</title>

<meta name="viewport" content="width=device-width, initial-scale=1.0">

<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">

<style>
* {
  box-sizing: border-box;
  font-family: "Inter", system-ui;
}

body {
  margin: 0;
  min-height: 100vh;
  background: linear-gradient(135deg,#0f172a,#020617);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #e5e7eb;
}

.panel {
  width: 100%;
  max-width: 560px;
  background: rgba(15,23,42,0.9);
  backdrop-filter: blur(12px);
  border-radius: 14px;
  padding: 28px 30px;
  box-shadow: 0 0 40px rgba(0,0,0,.6);
}

h1 {
  margin: 0 0 16px;
  text-align: center;
  font-size: 22px;
  font-weight: 600;
}

.domain {
  text-align: center;
  font-size: 13px;
  color: #60a5fa;
  margin-bottom: 18px;
}

.form-group {
  margin-bottom: 14px;
}

label {
  display: block;
  font-size: 13px;
  margin-bottom: 5px;
  color: #94a3b8;
}

input,
textarea {
  width: 100%;
  background: #020617;
  border: 1px solid #1e293b;
  border-radius: 8px;
  padding: 10px 12px;
  color: #e5e7eb;
  font-size: 14px;
  outline: none;
  transition: .2s;
}

input:focus,
textarea:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59,130,246,.2);
}

textarea {
  resize: vertical;
  min-height: 110px;
}

button {
  width: 100%;
  margin-top: 8px;
  background: linear-gradient(135deg,#2563eb,#3b82f6);
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 15px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: .2s;
}

button:hover {
  opacity: .9;
  transform: translateY(-1px);
}

button:disabled {
  opacity: .5;
  cursor: not-allowed;
}

.status {
  margin-top: 14px;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 13px;
  display: none;
}

.status.ok {
  background: rgba(34,197,94,.15);
  color: #4ade80;
}

.status.err {
  background: rgba(239,68,68,.15);
  color: #f87171;
}

.footer {
  margin-top: 18px;
  text-align: center;
  font-size: 12px;
  color: #64748b;
}
</style>
</head>

<body>

<div class="panel">

<h1>📧 EdgeMailer</h1>

<div class="domain">
  发信域名：@${domain || "未配置"}
</div>

<div class="form-group">
  <label>发件人名称（可选）</label>
  <input id="fromName" placeholder="Admin">
</div>

<div class="form-group">
  <label>邮箱前缀</label>
  <input id="fromPrefix" placeholder="noreply / admin">
</div>

<div class="form-group">
  <label>收件人</label>
  <input id="to" placeholder="test@gmail.com">
</div>

<div class="form-group">
  <label>主题</label>
  <input id="subject" placeholder="邮件主题">
</div>

<div class="form-group">
  <label>正文（支持 HTML）</label>
  <textarea id="html" placeholder="请输入内容"></textarea>
</div>

<button id="sendBtn" onclick="send()">🚀 发送邮件</button>

<div id="status" class="status"></div>

<div class="footer">
  Powered by Resend · Cloudflare Workers
</div>

</div>


<script>
const TOKEN = "${token}";

const btn = document.getElementById("sendBtn");
const status = document.getElementById("status");

function show(msg, ok=true) {
  status.textContent = msg;
  status.className = "status " + (ok ? "ok" : "err");
  status.style.display = "block";
}

async function send() {

  btn.disabled = true;
  btn.textContent = "发送中...";

  status.style.display = "none";

  const data = {
    fromName: fromName.value.trim(),
    fromPrefix: fromPrefix.value.trim(),
    to: to.value.trim(),
    subject: subject.value.trim(),
    html: html.value.trim(),
  };

  if (!data.fromPrefix || !data.to || !data.subject || !data.html) {
    show("❌ 请填写完整信息", false);
    btn.disabled = false;
    btn.textContent = "🚀 发送邮件";
    return;
  }

  try {

    const res = await fetch("/?token=" + TOKEN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (res.ok) {
      show("✅ 邮件发送成功！");
    } else {
      show("❌ 发送失败：" + (result.error || "未知错误"), false);
    }

  } catch (e) {

    show("❌ 网络错误：" + e.message, false);

  }

  btn.disabled = false;
  btn.textContent = "🚀 发送邮件";
}
</script>

</body>
</html>
`;
}
