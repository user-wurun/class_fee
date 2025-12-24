(()=>{var e={};e.id=569,e.ids=[569],e.modules={62849:e=>{function t(e){var t=Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}t.keys=()=>[],t.resolve=t,t.id=62849,e.exports=t},20399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},78893:e=>{"use strict";e.exports=require("buffer")},84770:e=>{"use strict";e.exports=require("crypto")},17702:e=>{"use strict";e.exports=require("events")},98216:e=>{"use strict";e.exports=require("net")},35816:e=>{"use strict";e.exports=require("process")},76162:e=>{"use strict";e.exports=require("stream")},74026:e=>{"use strict";e.exports=require("string_decoder")},95346:e=>{"use strict";e.exports=require("timers")},82452:e=>{"use strict";e.exports=require("tls")},17360:e=>{"use strict";e.exports=require("url")},21764:e=>{"use strict";e.exports=require("util")},71568:e=>{"use strict";e.exports=require("zlib")},64130:(e,t,r)=>{"use strict";r.r(t),r.d(t,{originalPathname:()=>h,patchFetch:()=>g,requestAsyncStorage:()=>m,routeModule:()=>d,serverHooks:()=>E,staticGenerationAsyncStorage:()=>_});var a={};r.r(a),r.d(a,{GET:()=>p,POST:()=>l});var s=r(73278),i=r(45002),n=r(54877),o=r(1035),c=r(12467),u=r(29185);async function p(e){try{let t=e.headers.get("authorization");if(!t||!t.startsWith("Bearer "))return(0,c.m)();let r=t.substring(7);if(!(0,u.WX)(r))return(0,c.m)();let{searchParams:a}=new URL(e.url),s=parseInt(a.get("page")||"1"),i=parseInt(a.get("limit")||"20"),n=a.get("type")||"all",p=a.get("categoryId"),l=a.get("applicantId"),d=a.get("status"),m=a.get("search"),_=(s-1)*i,E=[];if("all"!==n&&E.push(`a.type = '${n}'`),p&&E.push(`a.category_id = ${p}`),l&&E.push(`a.applicant_id = ${l}`),d&&E.push(`a.status = '${d}'`),m){let e=m.replace(/'/g,"\\'");E.push(`(a.title LIKE '%${e}%' OR a.description LIKE '%${e}%')`)}let h=E.length>0?`WHERE ${E.join(" AND ")}`:"",g=await (0,o.IO)(`
      SELECT 
        a.*,
        u.username as applicant_username,
        u.real_name as applicant_name,
        c.name as category_name,
        admin.real_name as approved_by_name,
        (
          SELECT COUNT(*) 
          FROM proof_images pi 
          WHERE pi.application_id = a.id
        ) as proof_count
      FROM applications a
      LEFT JOIN users u ON a.applicant_id = u.id
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN users admin ON a.approved_by = admin.id
      ${h}
      ORDER BY a.created_at DESC
      LIMIT ${i} OFFSET ${_}
    `),x=(await (0,o.IO)(`
      SELECT COUNT(*) as total
      FROM applications a
      ${h}
    `))[0].total,R=Math.ceil(x/i);return(0,c.Xj)({applications:g,pagination:{page:s,limit:i,total:x,pages:R}})}catch(e){return console.error("Get applications error:",e),(0,c.VR)("获取申请列表失败")}}async function l(e){try{let t=e.headers.get("authorization");if(!t||!t.startsWith("Bearer "))return(0,c.m)();let r=t.substring(7),a=(0,u.WX)(r);if(!a)return(0,c.m)();let{title:s,type:i,amount:n,description:p,categoryId:l,expenseTime:d,source:m,reason:_,proofImages:E}=await e.json();if(!s||!i||!n||!p)return(0,c.VR)("必填字段不能为空");if("expense"===i&&(!d||!_))return(0,c.VR)("支出申请必须填写支出时间和原因");if("income"===i&&(!m||!_))return(0,c.VR)("收入申请必须填写来源和原因");if("expense"===i&&!l)return(0,c.VR)("支出申请必须选择分类");if((await (0,o.IO)(`
      SELECT COUNT(*) as count
      FROM applications 
      WHERE applicant_id = ? AND DATE(created_at) = CURDATE() AND status != 'cancelled'
    `,[a.id]))[0].count>=3)return(0,c.VR)("每日最多只能发起3个申请，请等待管理员批准后再试");return await (0,o.PS)(async e=>{let[t]=await e.execute(`
        INSERT INTO applications 
        (title, type, amount, description, applicant_id, category_id, expense_time, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
      `,[s,i,n,p,a.id,l,d]),r=t.insertId;if("income"===i?await e.execute(`
          INSERT INTO income_records (application_id, source, reason)
          VALUES (?, ?, ?)
        `,[r,m,_]):await e.execute(`
          INSERT INTO expense_records (application_id, applicant_name, reason, expense_time)
          VALUES (?, ?, ?, ?)
        `,[r,"",_,d]),E&&E.length>0)for(let t of E)await e.execute(`
            INSERT INTO proof_images (application_id, image_url, image_name, file_size)
            VALUES (?, ?, ?, ?)
          `,[r,t.url,t.name,t.size])}),(0,c.Xj)(null,"申请提交成功")}catch(e){return console.error("Create application error:",e),(0,c.VR)("创建申请失败")}}let d=new s.AppRouteRouteModule({definition:{kind:i.x.APP_ROUTE,page:"/api/applications/route",pathname:"/api/applications",filename:"route",bundlePath:"app/api/applications/route"},resolvedPagePath:"C:\\Users\\Wu\\Desktop\\班费管理系统\\app\\api\\applications\\route.ts",nextConfigOutput:"",userland:a}),{requestAsyncStorage:m,staticGenerationAsyncStorage:_,serverHooks:E}=d,h="/api/applications/route";function g(){return(0,n.patchFetch)({serverHooks:E,staticGenerationAsyncStorage:_})}},1035:(e,t,r)=>{"use strict";r.d(t,{IO:()=>s,PS:()=>i});let a=r(87615).createPool({host:process.env.DB_HOST||"localhost",port:Number(process.env.DB_PORT)||3306,user:process.env.DB_USER||"root",password:process.env.DB_PASSWORD||"",database:process.env.DB_NAME||"class_finance",waitForConnections:!0,connectionLimit:10,queueLimit:0});async function s(e,t){try{let[r]=await a.execute(e,t);return r}catch(e){throw console.error("Database query error:",e),e}}async function i(e){let t=await a.getConnection();try{await t.beginTransaction();let r=await e(t);return await t.commit(),r}catch(e){throw await t.rollback(),e}finally{t.release()}}},29185:(e,t,r)=>{"use strict";r.d(t,{Mi:()=>d,Oe:()=>l,RA:()=>c,WX:()=>u,c_:()=>p});var a=r(67390),s=r.n(a),i=r(63506),n=r.n(i);let o=process.env.JWT_SECRET||"your-secret-key",c=e=>s().sign({id:e.id,username:e.username,role:e.role},o,{expiresIn:"24h"}),u=e=>{try{return s().verify(e,o)}catch(e){return null}},p=async e=>n().hash(e,12),l=async(e,t)=>n().compare(e,t),d=()=>{let e="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",t="";for(let r=0;r<8;r++)t+=e.charAt(Math.floor(Math.random()*e.length));return t}},12467:(e,t,r)=>{"use strict";r.d(t,{Py:()=>o,VR:()=>i,Xj:()=>s,aX:()=>c,m:()=>n});var a=r(71309);let s=(e,t="操作成功")=>a.NextResponse.json({success:!0,message:t,data:e},{status:200}),i=(e,t=400,r)=>a.NextResponse.json({success:!1,message:e,error:r},{status:t}),n=(e="未授权访问")=>a.NextResponse.json({success:!1,message:e},{status:401}),o=(e="无权限访问")=>a.NextResponse.json({success:!1,message:e},{status:403}),c=(e="资源未找到")=>a.NextResponse.json({success:!1,message:e},{status:404})}};var t=require("../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),a=t.X(0,[787,454,615],()=>r(64130));module.exports=a})();