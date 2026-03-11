export default {
  async fetch(request, env) {

    const url = new URL(request.url);

    /* ========= Token ========= */

    const queryToken = url.searchParams.get("token");

    const headerToken = request.headers
      .get("Authorization")
      ?.replace("Bearer ", "");

    const token = queryToken || headerToken;

    if (!token || token !== env.TOKEN) {
      return new Response("Unauthorized", { status: 403 });
    }

    /* ========= 解析域名 ========= */

    const apis = (env.API || "").split(",");
    const domains = (env.DOMAIN || "").split(",");

    const pairs = domains.map((d, i) => ({
      domain: d.trim(),
      api: apis[i]?.trim()
    }));


    /* ========= GET 页面 ========= */

    if (request.method === "GET") {

      return new Response(getHTML(token, pairs), {
        headers: {
          "Content-Type": "text/html;charset=utf-8"
        }
      });

    }


    /* ========= POST 发送 ========= */

    if (request.method === "POST") {

      try {

        const body = await request.json();

        const {
          fromName,
          fromPrefix,
          to,
          subject,
          html,
          domain
        } = body;

        if (!fromPrefix || !to || !subject || !html || !domain) {
          return json({ error: "Missing parameters" }, 400);
        }

        const pair = pairs.find(p => p.domain === domain);

        if (!pair) {
          return json({ error: "Domain not allowed" }, 403);
        }

        const fromEmail = `${fromPrefix}@${pair.domain}`;

        const toList = to.split(",").map(v => v.trim());

        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${pair.api}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            from: fromName
              ? `${fromName} <${fromEmail}>`
              : fromEmail,
            to: toList,
            subject,
            html
          })
        });

        const result = await res.json();

        return json(result, res.status);

      } catch (e) {

        return json({ error: e.message }, 500);

      }

    }

    return new Response("Method Not Allowed", { status: 405 });

  }
};



function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}



function getHTML(token, pairs) {

  const buttons = pairs.map(p =>
    `<button class="domainBtn" onclick="setDomain('${p.domain}')">${p.domain}</button>`
  ).join("");

  const defaultDomain = pairs[0]?.domain || "";

  return `

<!DOCTYPE html>
<html lang="zh">

<head>

<meta charset="utf-8">
<title>EdgeMailer</title>

<meta name="viewport" content="width=device-width,initial-scale=1">

<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">

<style>

*{box-sizing:border-box;font-family:Inter,system-ui}

body{
margin:0;
min-height:100vh;
background:linear-gradient(135deg,#0f172a,#020617);
display:flex;
align-items:center;
justify-content:center;
color:#e5e7eb;
}

.panel{
width:100%;
max-width:600px;
background:rgba(15,23,42,.9);
border-radius:14px;
padding:28px;
box-shadow:0 0 40px rgba(0,0,0,.6);
}

h1{
text-align:center;
margin-bottom:18px;
}

.domainBox{
display:flex;
gap:8px;
margin-bottom:10px;
}

.domainBtn{
flex:1;
background:#1e293b;
border:none;
color:#e5e7eb;
padding:8px;
border-radius:6px;
cursor:pointer;
}

.domainBtn:hover{
background:#334155;
}

.current{
text-align:center;
font-size:13px;
color:#60a5fa;
margin-bottom:16px;
}

.form-group{
margin-bottom:14px;
}

label{
font-size:13px;
color:#94a3b8;
display:block;
margin-bottom:5px;
}

input,textarea{
width:100%;
background:#020617;
border:1px solid #1e293b;
border-radius:8px;
padding:10px;
color:#e5e7eb;
}

textarea{
min-height:120px;
resize:vertical;
}

.row{
display:flex;
gap:8px;
}

button{
border:none;
border-radius:8px;
padding:10px;
cursor:pointer;
}

.send{
width:100%;
margin-top:10px;
background:linear-gradient(135deg,#2563eb,#3b82f6);
color:white;
font-weight:600;
}

.random{
background:#334155;
color:#e5e7eb;
white-space:nowrap;
min-width:60px;
text-align:center;
}

.status{
margin-top:14px;
padding:10px;
border-radius:8px;
font-size:13px;
display:none;
}

.ok{background:rgba(34,197,94,.15);color:#4ade80}
.err{background:rgba(239,68,68,.15);color:#f87171}

.footer{
margin-top:18px;
text-align:center;
font-size:12px;
color:#64748b;
}

</style>

</head>

<body>

<div class="panel">

<h1>📧 EdgeMailer</h1>

<div class="domainBox">

${buttons}

</div>

<div class="current">
当前域名：@<span id="domain">${defaultDomain}</span>
</div>

<div class="form-group">
<label>发件人名称</label>
<input id="fromName" placeholder="Admin">
</div>

<div class="form-group">
<label>邮箱前缀</label>

<div class="row">

<input id="fromPrefix" placeholder="noreply">

<button class="random" onclick="randomPrefix()">随机</button>

</div>

</div>

<div class="form-group">
<label>收件人（支持多个，用逗号分隔）</label>
<input id="to" placeholder="a@gmail.com,b@gmail.com">
</div>

<div class="form-group">
<label>主题</label>
<input id="subject">
</div>

<div class="form-group">
<label>正文 HTML</label>
<textarea id="html"></textarea>
</div>

<button class="send" id="sendBtn" onclick="send()">🚀 发送邮件</button>

<div id="status" class="status"></div>

<div class="footer">
Cloudflare Workers · Resend API
</div>

</div>


<script>

const TOKEN="${token}";

let currentDomain="${defaultDomain}";

const btn=document.getElementById("sendBtn");
const status=document.getElementById("status");

function setDomain(d){

currentDomain=d;

document.getElementById("domain").textContent=d;

}

function randomPrefix(){

const chars="abcdefghijklmnopqrstuvwxyz0123456789";

let s="";

for(let i=0;i<6;i++){

s+=chars[Math.floor(Math.random()*chars.length)];

}

fromPrefix.value=s;

}

function show(msg,ok=true){

status.textContent=msg;

status.className="status "+(ok?"ok":"err");

status.style.display="block";

}

async function send(){

btn.disabled=true;

btn.textContent="发送中...";

status.style.display="none";

const data={

fromName:fromName.value.trim(),
fromPrefix:fromPrefix.value.trim(),
to:to.value.trim(),
subject:subject.value.trim(),
html:html.value.trim(),
domain:currentDomain

};

if(!data.fromPrefix||!data.to||!data.subject||!data.html){

show("❌ 请填写完整信息",false);

btn.disabled=false;

btn.textContent="🚀 发送邮件";

return;

}

try{

const res=await fetch("/?token="+TOKEN,{

method:"POST",

headers:{"Content-Type":"application/json"},

body:JSON.stringify(data)

});

const result=await res.json();

if(res.ok){

show("✅ 邮件发送成功");

}else{

show("❌ "+(result.error||"发送失败"),false);

}

}catch(e){

show("❌ "+e.message,false);

}

btn.disabled=false;

btn.textContent="🚀 发送邮件";

}

</script>

</body>

</html>

`;
}
