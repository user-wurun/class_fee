(()=>{var e={};e.id=818,e.ids=[818],e.modules={62849:e=>{function t(e){var t=Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}t.keys=()=>[],t.resolve=t,t.id=62849,e.exports=t},20399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},78893:e=>{"use strict";e.exports=require("buffer")},84770:e=>{"use strict";e.exports=require("crypto")},17702:e=>{"use strict";e.exports=require("events")},98216:e=>{"use strict";e.exports=require("net")},35816:e=>{"use strict";e.exports=require("process")},76162:e=>{"use strict";e.exports=require("stream")},74026:e=>{"use strict";e.exports=require("string_decoder")},95346:e=>{"use strict";e.exports=require("timers")},82452:e=>{"use strict";e.exports=require("tls")},17360:e=>{"use strict";e.exports=require("url")},21764:e=>{"use strict";e.exports=require("util")},71568:e=>{"use strict";e.exports=require("zlib")},48616:(e,t,r)=>{"use strict";r.r(t),r.d(t,{originalPathname:()=>m,patchFetch:()=>b,requestAsyncStorage:()=>u,routeModule:()=>l,serverHooks:()=>x,staticGenerationAsyncStorage:()=>h});var a={};r.r(a),r.d(a,{POST:()=>p});var s=r(73278),o=r(45002),i=r(54877),n=r(1035),c=r(29185),d=r(12467);async function p(e){try{let t=e.headers.get("authorization");if(!t||!t.startsWith("Bearer "))return(0,d.m)();let r=t.substring(7);if(!(0,c.WX)(r))return(0,d.m)();let a=await (0,n.IO)(`
      SELECT 
        a.title,
        CASE WHEN a.type = 'income' THEN '收入' ELSE '支出' END as type,
        a.amount,
        a.description,
        u.real_name as applicant_name,
        c.name as category_name,
        a.created_at
      FROM applications a
      LEFT JOIN users u ON a.applicant_id = u.id
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.status = 'approved'
      ORDER BY a.created_at DESC
      LIMIT 1000
    `),s=a.reduce((e,t)=>"收入"===t.type?e+parseFloat(t.amount||0):e,0),o=a.reduce((e,t)=>"支出"===t.type?e+parseFloat(t.amount||0):e,0),i=new Date,p=`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent("https://pay.cubestudio.top")}`,l=`
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>班费明细报表</title>
    <style>
        body {
            font-family: 'Microsoft YaHei', Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: white;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 20px;
        }
        .header h1 {
            margin: 0;
            color: #1f2937;
            font-size: 28px;
        }
        .header .date {
            color: #6b7280;
            margin-top: 10px;
        }
        .stats {
            display: flex;
            justify-content: space-between;
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .stat-item {
            text-align: center;
        }
        .stat-item .label {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 5px;
        }
        .stat-item .value {
            font-size: 20px;
            font-weight: bold;
            color: #1f2937;
        }
        .income { color: #10b981; }
        .expense { color: #ef4444; }
        .balance { color: #3b82f6; }
        .table-container {
            margin-bottom: 30px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        th {
            background: #f9fafb;
            font-weight: bold;
            color: #374151;
        }
        tr:nth-child(even) {
            background: #f9fafb;
        }
        .type-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            color: white;
            font-size: 12px;
            font-weight: bold;
        }
        .income-badge { background: #10b981; }
        .expense-badge { background: #ef4444; }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
        }
        .qr-section {
            position: absolute;
            bottom: 20px;
            right: 20px;
            text-align: center;
        }
        .qr-placeholder {
            width: 100px;
            height: 100px;
            border: 1px solid #d1d5db;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
            border-radius: 8px;
            overflow: hidden;
        }
        .qr-image {
            width: 96px;
            height: 96px;
            object-fit: contain;
        }
        .qr-text {
            margin-top: 5px;
            font-size: 12px;
            color: #6b7280;
        }
        @media print {
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Class Finance Report</h1>
        <div class="date">Generated: ${i.toISOString().split("T")[0]}</div>
    </div>

    <div class="stats">
        <div class="stat-item">
            <div class="label">Total Income</div>
            <div class="value income">\xa5${s.toFixed(2)}</div>
        </div>
        <div class="stat-item">
            <div class="label">Total Expense</div>
            <div class="value expense">\xa5${o.toFixed(2)}</div>
        </div>
        <div class="stat-item">
            <div class="label">Current Balance</div>
            <div class="value balance">\xa5${(s-o).toFixed(2)}</div>
        </div>
        <div class="stat-item">
            <div class="label">Records</div>
            <div class="value">${a.length}</div>
        </div>
    </div>

    <div class="table-container">
        <h2>Transaction Details</h2>
        <table>
            <thead>
                <tr>
                    <th>No.</th>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Applicant</th>
                    <th>Amount</th>
                    <th>Category</th>
                    <th>Date</th>
                </tr>
            </thead>
            <tbody>
`;a.forEach((e,t)=>{l+=`
                <tr>
                    <td>${t+1}</td>
                    <td>${e.title||""}</td>
                    <td><span class="type-badge ${"收入"===e.type?"income-badge":"expense-badge"}">${e.type||""}</span></td>
                    <td>${e.applicant_name||""}</td>
                    <td>\xa5${parseFloat(e.amount||0).toFixed(2)}</td>
                    <td>${e.category_name||"-"}</td>
                    <td>${e.created_at?new Date(e.created_at).toLocaleDateString("zh-CN"):""}</td>
                </tr>
`}),l+=`
            </tbody>
        </table>
    </div>

    <div class="footer">
        <p>此报表由班费管理系统自动生成</p>
        <p>访问pay.cubestudio.top或扫描二维码查看详情</p>
    </div>

    <div class="qr-section">
        <div class="qr-placeholder">
            <img src="${p}" alt="报表二维码" class="qr-image" />
        </div>
        <div class="qr-text">扫码查看详情</div>
    </div>

</body>
</html>
`;let u=i.toISOString().split("T")[0];return new Response(l,{headers:{"Content-Type":"text/html; charset=utf-8","Content-Disposition":`attachment; filename="class_finance_report_${u}.html"; filename*=UTF-8''%E7%8F%AD%E8%B4%B9%E6%98%8E%E7%BB%86%E6%8A%A5%E8%A1%A8_${u}.html`}})}catch(e){return console.error("Export PNG error:",e),new Response("导出失败",{status:500})}}let l=new s.AppRouteRouteModule({definition:{kind:o.x.APP_ROUTE,page:"/api/export/png/route",pathname:"/api/export/png",filename:"route",bundlePath:"app/api/export/png/route"},resolvedPagePath:"C:\\Users\\Wu\\Desktop\\班费管理系统\\app\\api\\export\\png\\route.ts",nextConfigOutput:"",userland:a}),{requestAsyncStorage:u,staticGenerationAsyncStorage:h,serverHooks:x}=l,m="/api/export/png/route";function b(){return(0,i.patchFetch)({serverHooks:x,staticGenerationAsyncStorage:h})}},1035:(e,t,r)=>{"use strict";r.d(t,{IO:()=>s,PS:()=>o});let a=r(87615).createPool({host:process.env.DB_HOST||"localhost",port:Number(process.env.DB_PORT)||3306,user:process.env.DB_USER||"root",password:process.env.DB_PASSWORD||"",database:process.env.DB_NAME||"class_finance",waitForConnections:!0,connectionLimit:10,queueLimit:0});async function s(e,t){try{let[r]=await a.execute(e,t);return r}catch(e){throw console.error("Database query error:",e),e}}async function o(e){let t=await a.getConnection();try{await t.beginTransaction();let r=await e(t);return await t.commit(),r}catch(e){throw await t.rollback(),e}finally{t.release()}}},29185:(e,t,r)=>{"use strict";r.d(t,{Mi:()=>u,Oe:()=>l,RA:()=>c,WX:()=>d,c_:()=>p});var a=r(67390),s=r.n(a),o=r(63506),i=r.n(o);let n=process.env.JWT_SECRET||"your-secret-key",c=e=>s().sign({id:e.id,username:e.username,role:e.role},n,{expiresIn:"24h"}),d=e=>{try{return s().verify(e,n)}catch(e){return null}},p=async e=>i().hash(e,12),l=async(e,t)=>i().compare(e,t),u=()=>{let e="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",t="";for(let r=0;r<8;r++)t+=e.charAt(Math.floor(Math.random()*e.length));return t}},12467:(e,t,r)=>{"use strict";r.d(t,{Py:()=>n,VR:()=>o,Xj:()=>s,aX:()=>c,m:()=>i});var a=r(71309);let s=(e,t="操作成功")=>a.NextResponse.json({success:!0,message:t,data:e},{status:200}),o=(e,t=400,r)=>a.NextResponse.json({success:!1,message:e,error:r},{status:t}),i=(e="未授权访问")=>a.NextResponse.json({success:!1,message:e},{status:401}),n=(e="无权限访问")=>a.NextResponse.json({success:!1,message:e},{status:403}),c=(e="资源未找到")=>a.NextResponse.json({success:!1,message:e},{status:404})}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),a=t.X(0,[787,454,615],()=>r(48616));module.exports=a})();