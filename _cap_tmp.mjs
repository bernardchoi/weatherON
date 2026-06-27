import puppeteer from "puppeteer";
import fs from "node:fs";
const out="/tmp/rws_caps"; fs.mkdirSync(out,{recursive:true});
const b=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-setuid-sandbox"]});
const pg=await b.newPage();
await pg.setViewport({width:1280,height:900,deviceScaleFactor:1});
const errs=[];
pg.on("pageerror",e=>errs.push(e.message));
pg.on("console",m=>{if(m.type()==="error")errs.push("console:"+m.text())});
await pg.goto("http://127.0.0.1:5173/",{waitUntil:"networkidle0"});
async function click(txt){await pg.evaluate(t=>{const el=[...document.querySelectorAll("button")].find(x=>x.textContent.trim().replace(/\s+/g," ").startsWith(t));el?.click();},txt);await new Promise(r=>setTimeout(r,400));}
const ids=["R1","R2","R4","W1","W2","W4","S1","S2","S3","C1","C2","H1","M2","H3"];
for(const id of ids){await click(id);await pg.screenshot({path:`${out}/${id}.png`});}
console.log("captured:",ids.length,"errors:",errs.length);
if(errs.length)console.log(errs.slice(0,10).join("\n"));
await b.close();
