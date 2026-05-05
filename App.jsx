import React, { useState, useMemo } from "react";

// ── COLORS & THEME ──
const C = {
  primary: "#1a56db",
  dark: "#1e2d5a",
  light: "#f0f4ff",
  accent: "#ff6b35",
  success: "#0e9f6e",
  warn: "#f59e0b",
  danger: "#e02424",
  text: "#111928",
  muted: "#6b7280",
  border: "#e5e7eb",
  white: "#ffffff",
  bg: "#f9fafb",
};

const fmt = n => "₹" + Number(n||0).toLocaleString("en-IN",{maximumFractionDigits:0});
const fmt2 = n => "₹" + Number(n||0).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2});
const fmtL = n => {
  if(n>=10000000) return "₹"+(n/10000000).toFixed(2)+" Cr";
  if(n>=100000) return "₹"+(n/100000).toFixed(2)+" L";
  return fmt(n);
};

function numberToWords(amount) {
  const num = Math.floor(amount);
  if(num===0) return "Zero";
  const ones=["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const tens=["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  const convert = n => {
    if(n<20) return ones[n];
    if(n<100) return tens[Math.floor(n/10)]+(n%10?" "+ones[n%10]:"");
    return ones[Math.floor(n/100)]+" Hundred"+(n%100?" and "+convert(n%100):"");
  };
  let result="";
  if(num>=10000000) result+=convert(Math.floor(num/10000000))+" Crore ";
  if(num>=100000)   result+=convert(Math.floor((num%10000000)/100000))+" Lakh ";
  if(num>=1000)     result+=convert(Math.floor((num%100000)/1000))+" Thousand ";
  if(num>=100)      result+=convert(Math.floor((num%1000)/100))+" Hundred ";
  if(num%100)       result+=convert(num%100);
  return result.trim();
}

const STATES = ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh","Chandigarh","Puducherry","Andaman & Nicobar","Dadra & Nagar Haveli","Daman & Diu","Lakshadweep"];

const INVOICE_TYPES = [
  { id:"regular",       label:"Regular",             desc:"Normal B2B/B2C supply" },
  { id:"deemed_export", label:"Deemed Export",        desc:"Supply to EOU/STPI/EHTP etc." },
  { id:"sez_payment",   label:"SEZ with Payment",     desc:"Supply to SEZ with IGST payment" },
  { id:"sez_nopayment", label:"SEZ without Payment",  desc:"Supply to SEZ under LUT/Bond" },
];

const NAV = [
  {id:"home",    icon:"🏠", label:"Home"},
  {id:"tax",     icon:"🧾", label:"Income Tax"},
  {id:"tds",     icon:"📋", label:"TDS / TCS"},
  {id:"capital", icon:"📈", label:"Cap. Gains"},
  {id:"sip",     icon:"💹", label:"SIP"},
  {id:"emi",     icon:"🏦", label:"EMI"},
  {id:"invoice", icon:"🧾", label:"GST Invoice"},
  {id:"mis",     icon:"📊", label:"MIS"},
  {id:"blog",    icon:"📝", label:"Blog"},
];

const BLOG_POSTS = [
  { id:1, tag:"Tax Law",      date:"Apr 20, 2026", read:"5 min",  title:"New Income Tax Act 2025 — 5 Key Changes Every Taxpayer Must Know", excerpt:"The Income Tax Act 2025 replaces the 6-decade-old 1961 Act effective from April 1, 2026. Here's what changed and how it impacts your filing." },
  { id:2, tag:"Tax Planning", date:"Apr 15, 2026", read:"7 min",  title:"Old vs New Tax Regime — Which Saves More in FY 2025-26?", excerpt:"A CA's complete guide with real examples for salaried employees, business owners, and freelancers. Includes calculation examples." },
  { id:3, tag:"Investment",   date:"Apr 10, 2026", read:"6 min",  title:"Top 5 Tax-Saving Investments for the 30% Tax Slab in 2026", excerpt:"ELSS, NPS, PPF, Tax-free bonds — which gives the best post-tax returns for high-income taxpayers this year?" },
  { id:4, tag:"Case Law",     date:"Apr 5, 2026",  read:"10 min", title:"Important Supreme Court Tax Judgements — 2025 Edition", excerpt:"Key rulings that changed how we interpret GST, income tax, and TDS provisions. Every CA and taxpayer should know these." },
  { id:5, tag:"GST",          date:"Mar 28, 2026", read:"8 min",  title:"GST on Real Estate 2025 — Complete Guide for Builders & Buyers", excerpt:"Under-construction vs ready-to-move, commercial vs residential — all GST rates and ITC rules explained with examples." },
  { id:6, tag:"Costing",      date:"Mar 20, 2026", read:"9 min",  title:"Product Costing for Small Manufacturers — A Practical CA Guide", excerpt:"How to calculate the true cost of your product including overheads, wastage, and profit margin using standard costing methods." },
];

const TAG_COLORS = {
  "Tax Law":     { bg:"#eff6ff", text:"#1d4ed8" },
  "Tax Planning":{ bg:"#f0fdf4", text:"#15803d" },
  "Investment":  { bg:"#fdf4ff", text:"#7c3aed" },
  "Case Law":    { bg:"#fefce8", text:"#b45309" },
  "GST":         { bg:"#fff7ed", text:"#c2410c" },
  "Costing":     { bg:"#f0f9ff", text:"#0369a1" },
};

const UQC_LIST = ["NOS","KGS","MTR","LTR","BOX","PKT","PCS","SET","BAG","BTL","CAN","CTN","DZN","GMS","TON","SQM","CFT","OTH"];

// ── STYLES ──
const g = {
  app:     { fontFamily:"'Inter','Segoe UI',sans-serif", background:C.bg, minHeight:"100vh", color:C.text },
  topBar:  { background:C.dark, color:"#fff", padding:"14px 20px", display:"flex", justifyContent:"space-between", alignItems:"center" },
  logo:    { fontSize:22, fontWeight:900, letterSpacing:"-0.5px" },
  logoSpan:{ color:"#60a5fa" },
  tagline: { fontSize:11, opacity:0.65 },
  nav:     { background:C.white, borderBottom:`1px solid ${C.border}`, display:"flex", overflowX:"auto", position:"sticky", top:0, zIndex:100, boxShadow:"0 1px 6px rgba(0,0,0,0.06)" },
  navBtn:  { display:"flex", flexDirection:"column", alignItems:"center", gap:2, padding:"10px 12px", border:"none", background:"transparent", cursor:"pointer", color:C.muted, fontSize:16, minWidth:58, borderBottom:"3px solid transparent", whiteSpace:"nowrap", transition:"all 0.2s" },
  navActive:{ color:C.primary, borderBottom:`3px solid ${C.primary}`, background:"#f5f8ff" },
  body:    { padding:"16px", maxWidth:640, margin:"0 auto" },
  card:    { background:C.white, borderRadius:14, padding:18, marginBottom:14, boxShadow:"0 1px 6px rgba(0,0,0,0.07)", border:`1px solid ${C.border}` },
  cardTitle:{ fontSize:16, fontWeight:800, color:C.dark, margin:"0 0 4px" },
  cardSub: { fontSize:12, color:C.muted, margin:"0 0 16px" },
  lbl:     { display:"block", fontSize:11, fontWeight:600, color:C.muted, marginBottom:4, textTransform:"uppercase", letterSpacing:"0.4px" },
  inp:     { width:"100%", padding:"10px 12px", borderRadius:9, border:`1.5px solid ${C.border}`, fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit", background:C.white, transition:"border 0.2s" },
  sel:     { width:"100%", padding:"10px 12px", borderRadius:9, border:`1.5px solid ${C.border}`, fontSize:13, outline:"none", boxSizing:"border-box", background:C.white },
  fld:     { marginBottom:12 },
  row2:    { display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 },
  row3:    { display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 },
  btn:     { background:C.primary, color:"#fff", border:"none", borderRadius:10, padding:"12px 18px", fontSize:14, fontWeight:700, cursor:"pointer", width:"100%", marginTop:8, letterSpacing:"0.2px" },
  btnSm:   { background:C.primary, color:"#fff", border:"none", borderRadius:8, padding:"8px 16px", fontSize:12, fontWeight:700, cursor:"pointer" },
  result:  { background:`linear-gradient(135deg, ${C.dark}, ${C.primary})`, borderRadius:14, padding:18, color:"#fff", marginTop:14 },
  rRow:    { display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:"1px solid rgba(255,255,255,0.1)", fontSize:13 },
  rTotal:  { display:"flex", justifyContent:"space-between", padding:"10px 0", fontSize:16, fontWeight:800, borderTop:"2px solid rgba(255,255,255,0.25)", marginTop:4 },
  note:    { background:"#eff6ff", borderRadius:10, padding:"12px 14px", fontSize:12, color:C.dark, marginTop:12, borderLeft:`3px solid ${C.primary}` },
  warn:    { background:"#fffbeb", borderRadius:10, padding:"12px 14px", fontSize:12, color:"#92400e", marginTop:10, borderLeft:"3px solid #f59e0b" },
  danger:  { background:"#fef2f2", borderRadius:10, padding:"12px 14px", fontSize:12, color:"#991b1b", marginTop:10, borderLeft:"3px solid #ef4444" },
  divider: { height:1, background:C.border, margin:"12px 0" },
  adSlot:  { background:"#f3f4f6", borderRadius:10, padding:"20px 16px", textAlign:"center", fontSize:12, color:C.muted, border:`1px dashed ${C.border}`, margin:"14px 0" },
};

export default function App() {
  const [page, setPage] = useState("home");
  return (
    <div style={g.app}>
      <div style={g.topBar}>
        <div>
          <div style={g.logo}>Tax<span style={g.logoSpan}>Gyaan</span>.in</div>
          <div style={g.tagline}>India's Free CA Finance Portal</div>
        </div>
        <div style={{fontSize:11,opacity:0.7,textAlign:"right"}}></div>
      </div>
      <div style={g.nav}>
        {NAV.map(n=>(
          <button key={n.id} style={{...g.navBtn,...(page===n.id?g.navActive:{})}} onClick={()=>setPage(n.id)}>
            <span>{n.icon}</span>
            <span style={{fontSize:9,fontWeight:600}}>{n.label}</span>
          </button>
        ))}
      </div>
      <div style={g.body}>
        {page==="home"    && <HomePage setPage={setPage}/>}
        {page==="tax"     && <IncomeTaxCalc/>}
        {page==="tds"     && <TDSTCSCalc/>}
        {page==="capital" && <CapitalGainsCalc/>}
        {page==="sip"     && <SIPCalc/>}
        {page==="emi"     && <EMICalc/>}
        {page==="invoice" && <GSTInvoice/>}
        {page==="mis"     && <MISCosting/>}
        {page==="blog"    && <BlogSection/>}
      </div>
    </div>
  );
}

// ── HOME ──
function HomePage({setPage}){
  const tools=[
    {id:"tax",    icon:"🧾", label:"Income Tax",    sub:"Old vs New • All income heads",     color:"#eff6ff",border:"#bfdbfe"},
    {id:"tds",    icon:"📋", label:"TDS / TCS",      sub:"Interest on late payment",          color:"#fff7ed",border:"#fed7aa"},
    {id:"capital",icon:"📈", label:"Capital Gains",  sub:"Equity, Property, Gold, Debt",      color:"#f0fdf4",border:"#bbf7d0"},
    {id:"sip",    icon:"💹", label:"SIP Returns",    sub:"Pre & Post Tax vs FD",              color:"#fdf4ff",border:"#e9d5ff"},
    {id:"emi",    icon:"🏦", label:"EMI Calculator", sub:"Amortisation • Prepayment savings", color:"#fff1f2",border:"#fecdd3"},
    {id:"invoice",icon:"🧾", label:"GST Invoice",    sub:"CGST/SGST/IGST • WhatsApp",        color:"#fefce8",border:"#fde68a"},
    {id:"mis",    icon:"📊", label:"MIS & Costing",  sub:"Break-even, Product cost",          color:"#f0f9ff",border:"#bae6fd"},
  ];
  return(
    <div>
      <div style={{background:`linear-gradient(135deg, ${C.dark} 0%, #1a56db 100%)`, borderRadius:16, padding:"28px 20px", color:"#fff", textAlign:"center", marginBottom:16}}>
        <div style={{fontSize:44, marginBottom:8}}>🎓</div>
        <h1 style={{margin:"0 0 6px", fontSize:22, fontWeight:900, letterSpacing:"-0.5px"}}>India's Free CA Finance Portal</h1>
        <p style={{margin:"0 0 20px", fontSize:13, opacity:0.85}}>Tax Calculators • GST Invoice • Investment Tools</p>
        <div style={{display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap"}}>
          <button style={{...g.btnSm, background:"#fff", color:C.dark, fontSize:13, padding:"10px 20px"}} onClick={()=>setPage("tax")}>🧾 Income Tax Calculator</button>
          <button style={{...g.btnSm, background:"rgba(255,255,255,0.15)", border:"1.5px solid rgba(255,255,255,0.3)", color:"#fff", fontSize:13, padding:"10px 20px"}} onClick={()=>setPage("blog")}>📝 Read CA Blog</button>
        </div>
      </div>
      <div style={g.adSlot}>📢 Advertisement — Google AdSense Slot (728×90)</div>

      {/* Government Tax Portals */}
      <h2 style={{fontSize:16, fontWeight:800, color:C.dark, margin:"0 0 10px"}}>🏛️ Important Government Portals</h2>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16}}>
        {[
          { icon:"🧾", label:"Income Tax e-Filing", sub:"File ITR, check refund, Form 26AS", url:"https://www.incometax.gov.in", color:"#eff6ff", border:"#bfdbfe", tag:"incometax.gov.in" },
          { icon:"📦", label:"GST Portal", sub:"GST returns, registration, e-invoice", url:"https://www.gst.gov.in", color:"#fff7ed", border:"#fed7aa", tag:"gst.gov.in" },
          { icon:"🏢", label:"MCA / ROC Portal", sub:"Company registration, annual filings", url:"https://www.mca.gov.in", color:"#f0fdf4", border:"#bbf7d0", tag:"mca.gov.in" },
          { icon:"📋", label:"TDS / TRACES", sub:"TDS certificates, 26AS, correction", url:"https://www.tdscpc.gov.in", color:"#fdf4ff", border:"#e9d5ff", tag:"tdscpc.gov.in" },
          { icon:"🏦", label:"EPFO Member Portal", sub:"PF balance, UAN, withdrawals", url:"https://unifiedportal-mem.epfindia.gov.in", color:"#fefce8", border:"#fde68a", tag:"epfindia.gov.in" },
          { icon:"📰", label:"GST Council / CBIC", sub:"Circulars, notifications, rulings", url:"https://www.cbic.gov.in", color:"#f0f9ff", border:"#bae6fd", tag:"cbic.gov.in" },
        ].map(p=>(
          <a key={p.label} href={p.url} target="_blank" rel="noopener noreferrer"
            style={{background:p.color, border:`1.5px solid ${p.border}`, borderRadius:12, padding:14, textDecoration:"none", display:"block"}}>
            <div style={{fontSize:22, marginBottom:4}}>{p.icon}</div>
            <div style={{fontWeight:700, fontSize:13, color:C.dark}}>{p.label}</div>
            <div style={{fontSize:11, color:C.muted, marginTop:2}}>{p.sub}</div>
            <div style={{fontSize:10, color:C.primary, marginTop:6, fontWeight:600}}>🔗 {p.tag}</div>
          </a>
        ))}
      </div>

      <h2 style={{fontSize:16, fontWeight:800, color:C.dark, margin:"0 0 10px"}}>Free Calculators & Tools</h2>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16}}>
        {tools.map(t=>(
          <div key={t.id} onClick={()=>setPage(t.id)} style={{background:t.color, border:`1.5px solid ${t.border}`, borderRadius:12, padding:14, cursor:"pointer"}}>
            <div style={{fontSize:24, marginBottom:6}}>{t.icon}</div>
            <div style={{fontWeight:700, fontSize:13, color:C.dark}}>{t.label}</div>
            <div style={{fontSize:11, color:C.muted, marginTop:2}}>{t.sub}</div>
          </div>
        ))}
      </div>
      <h2 style={{fontSize:16, fontWeight:800, color:C.dark, margin:"0 0 10px"}}>Latest from CA Blog</h2>
      {BLOG_POSTS.slice(0,2).map(p=>(
        <div key={p.id} style={{...g.card, borderLeft:`4px solid ${C.primary}`}}>
          <span style={{...TAG_COLORS[p.tag], padding:"2px 10px", borderRadius:20, fontSize:10, fontWeight:700, display:"inline-block", marginBottom:6}}>{p.tag}</span>
          <div style={{fontWeight:700, fontSize:14, color:C.dark, marginBottom:4, lineHeight:1.4}}>{p.title}</div>
          <div style={{fontSize:12, color:C.muted}}>{p.excerpt}</div>
          <div style={{fontSize:11, color:C.muted, marginTop:8}}>{p.date} • {p.read} read</div>
        </div>
      ))}
      <div style={g.adSlot}>📢 Advertisement — Google AdSense Slot (300×250)</div>
    </div>
  );
}

// ── INCOME TAX ──
function IncomeTaxCalc(){
  const [age,setAge]=useState("below60");
  const [salary,setSalary]=useState("");
  const [hra,setHra]=useState("");
  const [lta,setLta]=useState("");
  const [hpSelf,setHpSelf]=useState("");
  const [hpRent,setHpRent]=useState("");
  const [hpRentInt,setHpRentInt]=useState("");
  const [stcg,setStcg]=useState("");
  const [ltcg,setLtcg]=useState("");
  const [other,setOther]=useState("");
  const [d80c,setD80c]=useState("");
  const [d80d,setD80d]=useState("");
  const [nps,setNps]=useState("");
  const [d80e,setD80e]=useState("");
  const [d80g,setD80g]=useState("");
  const [d80tta,setD80tta]=useState("");
  const [result,setResult]=useState(null);

  // ── INCOME TAX CALCULATION (FY 2025-26) ──
  // Computes: slab tax + surcharge + cess, with rebate 87A and marginal relief
  const calcTax = (inc, age, isNew) => {
    if(inc<=0) return 0;

    // Step 1: Slab tax
    const slabs = isNew
      ? [[400000,0],[400000,.05],[400000,.10],[400000,.15],[400000,.20],[400000,.25],[Infinity,.30]]
      : age==="senior80"
        ? [[500000,0],[500000,.20],[Infinity,.30]]
        : age==="senior60"
          ? [[300000,0],[200000,.05],[500000,.20],[Infinity,.30]]
          : [[250000,0],[250000,.05],[500000,.20],[Infinity,.30]];

    let slabTax=0, rem=inc;
    for(const [lim,rate] of slabs){
      if(rem<=0) break;
      slabTax += Math.min(rem,lim)*rate;
      rem -= lim;
    }

    // Step 2: Rebate u/s 87A
    let rebate = 0;
    if(isNew  && inc<=1200000) rebate = Math.min(slabTax, 60000);
    if(!isNew && inc<=500000)  rebate = Math.min(slabTax, 12500);
    let taxAfterRebate = Math.max(0, slabTax - rebate);

    // Step 3: Surcharge (applicable above ₹50 Lakhs)
    let surchargeRate = 0;
    if(isNew){
      if(inc > 20000000)      surchargeRate = 0.25; // above 2Cr
      else if(inc > 10000000) surchargeRate = 0.15; // 1Cr to 2Cr
      else if(inc > 5000000)  surchargeRate = 0.10; // 50L to 1Cr
    } else {
      if(inc > 50000000)      surchargeRate = 0.37; // above 5Cr old
      else if(inc > 20000000) surchargeRate = 0.25; // 2Cr to 5Cr
      else if(inc > 10000000) surchargeRate = 0.15; // 1Cr to 2Cr
      else if(inc > 5000000)  surchargeRate = 0.10; // 50L to 1Cr
    }
    let surcharge = taxAfterRebate * surchargeRate;

    // Step 4: Marginal relief on surcharge
    // Tax + Surcharge at threshold should not exceed (income - threshold)
    const thresholds = isNew
      ? [5000000, 10000000, 20000000]
      : [5000000, 10000000, 20000000, 50000000];

    for(const thresh of thresholds){
      if(inc > thresh){
        // Tax+surcharge at threshold
        const taxAtThresh = calcSlabOnly(thresh, age, isNew);
        const surchargeAtThresh = taxAtThresh * getSurchargeRate(thresh, isNew);
        const totalAtThresh = taxAtThresh + surchargeAtThresh;
        const maxAllowed = totalAtThresh + (inc - thresh);
        if(taxAfterRebate + surcharge > maxAllowed){
          surcharge = Math.max(0, maxAllowed - taxAfterRebate);
        }
      }
    }

    return taxAfterRebate + surcharge;
  };

  const getSurchargeRate = (inc, isNew) => {
    if(isNew){
      if(inc > 20000000) return 0.25;
      if(inc > 10000000) return 0.15;
      if(inc > 5000000)  return 0.10;
    } else {
      if(inc > 50000000) return 0.37;
      if(inc > 20000000) return 0.25;
      if(inc > 10000000) return 0.15;
      if(inc > 5000000)  return 0.10;
    }
    return 0;
  };

  const calcSlabOnly = (inc, age, isNew) => {
    if(inc<=0) return 0;
    const slabs = isNew
      ? [[400000,0],[400000,.05],[400000,.10],[400000,.15],[400000,.20],[400000,.25],[Infinity,.30]]
      : age==="senior80"
        ? [[500000,0],[500000,.20],[Infinity,.30]]
        : age==="senior60"
          ? [[300000,0],[200000,.05],[500000,.20],[Infinity,.30]]
          : [[250000,0],[250000,.05],[500000,.20],[Infinity,.30]];
    let t=0,r=inc;
    for(const [lim,rate] of slabs){if(r<=0)break;t+=Math.min(r,lim)*rate;r-=lim;}
    return t;
  };

  // Keep calcSlab as alias for compatibility
  const calcSlab = calcSlabOnly;

  const calculate = () => {
    const sal=parseFloat(salary)||0, hraEx=parseFloat(hra)||0, ltaEx=parseFloat(lta)||0;
    const hpSelfInt=Math.min(parseFloat(hpSelf)||0,200000);
    const hpRentAmt=parseFloat(hpRent)||0, hpRentIntAmt=parseFloat(hpRentInt)||0;
    const stcgAmt=parseFloat(stcg)||0, ltcgAmt=parseFloat(ltcg)||0;
    const otherAmt=parseFloat(other)||0;
    const c80c=Math.min(parseFloat(d80c)||0,150000), c80d=Math.min(parseFloat(d80d)||0,(age==="senior60"||age==="senior80")?50000:25000);
    const cNps=Math.min(parseFloat(nps)||0,50000), c80e=parseFloat(d80e)||0;
    const c80g=parseFloat(d80g)||0, c80tta=Math.min(parseFloat(d80tta)||0,10000);
    const hpLetOut = hpRentAmt*0.7 - hpRentIntAmt;
    const salOld = Math.max(0,sal-50000-hraEx-ltaEx);
    const hpOld = Math.max(hpLetOut,-200000) - hpSelfInt;
    const grossOld = salOld + hpOld + stcgAmt + ltcgAmt + otherAmt;
    const dedOld = c80c+c80d+cNps+c80e+c80g+c80tta;
    const taxableOld = Math.max(0,grossOld-dedOld);
    const normalOld = Math.max(0,taxableOld-stcgAmt-ltcgAmt);
    const taxOld = calcTax(normalOld,age,false) + stcgAmt*0.15 + Math.max(0,ltcgAmt-100000)*0.10;
    const cessOld = taxOld*0.04;
    const salNew = Math.max(0,sal-75000);
    const grossNew = salNew + hpLetOut + stcgAmt + ltcgAmt + otherAmt;
    const normalNew = Math.max(0,grossNew-stcgAmt-ltcgAmt);
    const taxNew = calcTax(normalNew,age,true) + stcgAmt*0.15 + Math.max(0,ltcgAmt-100000)*0.10;
    const cessNew = taxNew*0.04;
    setResult({
      old:{ sal:salOld, hp:hpOld, cg:stcgAmt+ltcgAmt, other:otherAmt, gross:grossOld, ded:dedOld, taxable:taxableOld, tax:Math.round(taxOld), cess:Math.round(cessOld), total:Math.round(taxOld+cessOld) },
      new:{ sal:salNew, hp:hpLetOut, cg:stcgAmt+ltcgAmt, other:otherAmt, gross:grossNew, ded:0, taxable:Math.max(0,grossNew), tax:Math.round(taxNew), cess:Math.round(cessNew), total:Math.round(taxNew+cessNew) },
      better: Math.round(taxNew+cessNew)<=Math.round(taxOld+cessOld)?"new":"old",
      saving: Math.abs(Math.round(taxNew+cessNew)-Math.round(taxOld+cessOld)),
    });
  };

  return(
    <div>
      <div style={g.adSlot}>📢 Advertisement</div>
      <h1 style={g.cardTitle}>🧾 Income Tax Calculator</h1>
      <p style={g.cardSub}>FY 2025-26 (AY 2026-27) • All Income Heads • Old vs New Regime</p>
      <div style={g.card}>
        <div style={{fontWeight:700,color:C.dark,marginBottom:10,fontSize:13}}>👤 Personal Info</div>
        <div style={g.fld}>
          <label style={g.lbl}>Age Group</label>
          <select style={g.sel} value={age} onChange={e=>setAge(e.target.value)}>
            <option value="below60">Below 60 years</option>
            <option value="senior60">60–80 years (Senior Citizen)</option>
            <option value="senior80">Above 80 years (Super Senior)</option>
          </select>
        </div>
      </div>
      <div style={g.card}>
        <div style={{fontWeight:700,color:C.dark,marginBottom:10,fontSize:13}}>💰 Income from Salary</div>
        <div style={g.fld}><label style={g.lbl}>Gross Salary / Pension (₹)</label><input style={g.inp} type="number" placeholder="e.g. 1200000" value={salary} onChange={e=>setSalary(e.target.value)}/></div>
        <div style={g.row2}>
          <div style={g.fld}><label style={g.lbl}>HRA Exemption (₹) — Old Regime</label><input style={g.inp} type="number" placeholder="0" value={hra} onChange={e=>setHra(e.target.value)}/></div>
          <div style={g.fld}><label style={g.lbl}>LTA Exemption (₹) — Old Regime</label><input style={g.inp} type="number" placeholder="0" value={lta} onChange={e=>setLta(e.target.value)}/></div>
        </div>
      </div>
      <div style={g.card}>
        <div style={{fontWeight:700,color:C.dark,marginBottom:10,fontSize:13}}>🏠 Income from House Property</div>
        <div style={g.row2}>
          <div style={g.fld}><label style={g.lbl}>Home Loan Interest — Self Occupied (₹) Max ₹2L</label><input style={g.inp} type="number" placeholder="0" value={hpSelf} onChange={e=>setHpSelf(e.target.value)}/></div>
          <div style={g.fld}><label style={g.lbl}>Annual Rental Income (₹)</label><input style={g.inp} type="number" placeholder="0" value={hpRent} onChange={e=>setHpRent(e.target.value)}/></div>
        </div>
        <div style={g.fld}><label style={g.lbl}>Home Loan Interest — Let Out Property (₹)</label><input style={g.inp} type="number" placeholder="0" value={hpRentInt} onChange={e=>setHpRentInt(e.target.value)}/></div>
      </div>
      <div style={g.card}>
        <div style={{fontWeight:700,color:C.dark,marginBottom:10,fontSize:13}}>📈 Capital Gains & Other Income</div>
        <div style={g.row2}>
          <div style={g.fld}><label style={g.lbl}>Short Term Capital Gains (₹) @15%</label><input style={g.inp} type="number" placeholder="0" value={stcg} onChange={e=>setStcg(e.target.value)}/></div>
          <div style={g.fld}><label style={g.lbl}>Long Term Capital Gains (₹) @10%</label><input style={g.inp} type="number" placeholder="0" value={ltcg} onChange={e=>setLtcg(e.target.value)}/></div>
        </div>
        <div style={g.fld}><label style={g.lbl}>Other Income — Interest, Dividend etc. (₹)</label><input style={g.inp} type="number" placeholder="0" value={other} onChange={e=>setOther(e.target.value)}/></div>
      </div>
      <div style={g.card}>
        <div style={{fontWeight:700,color:C.dark,marginBottom:10,fontSize:13}}>🔖 Deductions — Old Regime Only</div>
        <div style={g.row2}>
          <div style={g.fld}><label style={g.lbl}>80C — PF/PPF/ELSS/LIC (Max ₹1.5L)</label><input style={g.inp} type="number" placeholder="0" value={d80c} onChange={e=>setD80c(e.target.value)}/></div>
          <div style={g.fld}><label style={g.lbl}>80D — Medical Insurance (Max ₹25K / ₹50K for Senior)</label><input style={g.inp} type="number" placeholder="0" value={d80d} onChange={e=>setD80d(e.target.value)}/></div>
        </div>
        <div style={g.row2}>
          <div style={g.fld}><label style={g.lbl}>80CCD(1B) — NPS (Max ₹50K)</label><input style={g.inp} type="number" placeholder="0" value={nps} onChange={e=>setNps(e.target.value)}/></div>
          <div style={g.fld}><label style={g.lbl}>80E — Education Loan Interest</label><input style={g.inp} type="number" placeholder="0" value={d80e} onChange={e=>setD80e(e.target.value)}/></div>
        </div>
        <div style={g.row2}>
          <div style={g.fld}><label style={g.lbl}>80G — Donations</label><input style={g.inp} type="number" placeholder="0" value={d80g} onChange={e=>setD80g(e.target.value)}/></div>
          <div style={g.fld}><label style={g.lbl}>80TTA — Savings Interest (Max ₹10K)</label><input style={g.inp} type="number" placeholder="0" value={d80tta} onChange={e=>setD80tta(e.target.value)}/></div>
        </div>
        <button style={g.btn} onClick={calculate}>📊 Calculate Income Tax</button>
      </div>
      {result&&(
        <div>
          <div style={{...g.card, background:result.better==="new"?"#f0fdf4":"#fdf4ff", borderLeft:`4px solid ${result.better==="new"?C.success:"#7c3aed"}`}}>
            <div style={{fontWeight:800,fontSize:15,color:result.better==="new"?C.success:"#7c3aed"}}>
              ✅ {result.better==="new"?"New":"Old"} Regime saves you {fmtL(result.saving)}
            </div>
            <div style={{fontSize:12,color:C.muted,marginTop:2}}>Choose the {result.better==="new"?"New":"Old"} Regime to minimise your tax outflow</div>
          </div>
          {["old","new"].map(r=>(
            <div key={r} style={{...g.card, borderTop:`4px solid ${r==="new"?C.primary:"#7c3aed"}`}}>
              <div style={{fontWeight:800,color:r==="new"?C.primary:"#7c3aed",marginBottom:10,fontSize:13}}>{r==="new"?"New Regime":"Old Regime"} — Tax Computation</div>
              {[
                ["Salary / Pension (after Std. Deduction)", result[r].sal],
                ["Income from House Property", result[r].hp],
                ["Capital Gains", result[r].cg],
                ["Income from Other Sources", result[r].other],
              ].map(([k,v])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${C.border}`,fontSize:12}}>
                  <span style={{color:C.muted}}>{k}</span>
                  <span style={{color:v<0?C.danger:C.dark,fontWeight:600}}>{v<0?"("+fmt(Math.abs(v))+")":fmt(v)}</span>
                </div>
              ))}
              <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}`,fontWeight:700,fontSize:13}}>
                <span>Gross Total Income</span><span style={{color:r==="new"?C.primary:"#7c3aed"}}>{fmtL(result[r].gross)}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${C.border}`,fontSize:12}}>
                <span style={{color:C.muted}}>Less: Chapter VI-A Deductions</span>
                <span style={{color:C.danger}}>({fmt(result[r].ded)})</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`2px solid ${C.dark}`,fontWeight:800,fontSize:13}}>
                <span>Total Taxable Income</span><span>{fmtL(result[r].taxable)}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",fontSize:12}}><span style={{color:C.muted}}>Income Tax</span><span>{fmt(result[r].tax)}</span></div>
              <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",fontSize:12}}><span style={{color:C.muted}}>Health & Education Cess @4%</span><span>{fmt(result[r].cess)}</span></div>
              <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",fontWeight:900,fontSize:16,color:r==="new"?C.primary:"#7c3aed"}}>
                <span>Total Tax Liability</span><span>{fmtL(result[r].total)}</span>
              </div>
            </div>
          ))}
          <div style={g.note}>💡 <b>CA Note:</b> New Regime slabs (FY 2025-26): 0→₹4L Nil, ₹4-8L 5%, ₹8-12L 10%, ₹12-16L 15%, ₹16-20L 20%, ₹20-24L 25%, above ₹24L 30%. Rebate u/s 87A: ₹60,000 (New, income ≤₹12L) / ₹12,500 (Old, income ≤₹5L). Surcharge applicable above ₹50L. STCG @15% u/s 111A. LTCG @10% above ₹1L u/s 112A.</div>
          <div style={g.adSlot}>📢 Advertisement — Affiliate: ClearTax / Zerodha</div>
        </div>
      )}
    </div>
  );
}

// ── TDS / TCS ──
function TDSTCSCalc(){
  const [mode,setMode]=useState("tds");
  const [tdsAmt,setTdsAmt]=useState("");
  const [dedDate,setDedDate]=useState("");
  const [payDate,setPayDate]=useState("");
  const [result,setResult]=useState(null);

  const getDueDate = (date) => {
    if(!date) return "";
    const d=new Date(date);
    const m=d.getMonth(), y=d.getFullYear();
    if(m===2) return `${y}-04-30`;
    const nm=m+1===12?0:m+1, ny=m+1===12?y+1:y;
    return `${ny}-${String(nm+1).padStart(2,"0")}-07`;
  };
  const dueDate=getDueDate(dedDate);

  const calculate=()=>{
    const amt=parseFloat(tdsAmt)||0;
    if(!amt||!dedDate||!payDate) return alert("Please fill all fields");
    const due=new Date(dueDate), paid=new Date(payDate);
    const days=Math.max(0,Math.floor((paid-due)/(1000*60*60*24)));
    const months=Math.ceil(days/30);
    const interest=days>0?Math.round(amt*0.015*months):0;
    const penalty234E=days>0?Math.min(days*200,amt):0;
    setResult({amt,days,months,interest,penalty234E,total:amt+interest});
  };

  return(
    <div>
      <div style={g.adSlot}>📢 Advertisement</div>
      <h1 style={g.cardTitle}>📋 TDS / TCS Calculator</h1>
      <p style={g.cardSub}>Interest u/s 201(1A) for late deposit • Auto due date calculation</p>
      <div style={g.card}>
        <div style={{display:"flex",gap:8,marginBottom:14}}>
          {["tds","tcs"].map(m=>(
            <button key={m} onClick={()=>setMode(m)} style={{flex:1,padding:"10px",borderRadius:9,border:`2px solid ${mode===m?C.primary:C.border}`,background:mode===m?C.light:C.white,color:mode===m?C.primary:C.muted,fontWeight:700,cursor:"pointer",fontSize:13}}>
              {m==="tds"?"TDS — Tax Deducted at Source":"TCS — Tax Collected at Source"}
            </button>
          ))}
        </div>
        <div style={g.fld}>
          <label style={g.lbl}>{mode==="tds"?"TDS Amount Deducted (₹)":"TCS Amount Collected (₹)"}</label>
          <input style={g.inp} type="number" placeholder="e.g. 50000" value={tdsAmt} onChange={e=>setTdsAmt(e.target.value)}/>
        </div>
        <div style={g.row2}>
          <div style={g.fld}><label style={g.lbl}>Date of Deduction / Collection</label><input style={g.inp} type="date" value={dedDate} onChange={e=>setDedDate(e.target.value)}/></div>
          <div style={g.fld}><label style={g.lbl}>Due Date (Auto Calculated)</label><input style={{...g.inp,background:C.light,color:C.primary,fontWeight:700}} value={dueDate||"Select deduction date"} readOnly/></div>
        </div>
        <div style={g.fld}><label style={g.lbl}>Actual Payment / Deposit Date</label><input style={g.inp} type="date" value={payDate} onChange={e=>setPayDate(e.target.value)}/></div>
        <button style={g.btn} onClick={calculate}>⚡ Calculate Interest & Penalty</button>
      </div>
      {result&&(
        <div>
          <div style={{...g.result,background:result.days>0?`linear-gradient(135deg,${C.danger},#9b1c1c)`:`linear-gradient(135deg,${C.success},#065f46)`}}>
            <div style={{opacity:0.85,fontSize:12,marginBottom:4}}>
              {result.days>0?`⚠️ ${result.days} days late (${result.months} month${result.months>1?"s":""})`:"✅ Paid within due date"}
            </div>
            <div style={{fontWeight:900,fontSize:24}}>{result.days>0?`Interest: ${fmt(result.interest)}`:"No Interest Payable"}</div>
            {result.days>0&&<div style={{opacity:0.8,fontSize:13,marginTop:4}}>{mode.toUpperCase()}: {fmt(result.amt)} + Interest: {fmt(result.interest)} = Total: {fmt(result.total)}</div>}
          </div>
          {result.days>0&&(<div style={g.warn}>⚠️ <b>Penalty u/s 234E:</b> ₹200/day for late TDS/TCS return filing = <b>{fmt(result.penalty234E)}</b> (capped at TDS amount). File quarterly return on time!</div>)}
          <div style={g.note}>💡 <b>CA Note:</b> Interest @1.5%/month u/s 201(1A) for late deposit (part month = full month). For non-deduction: 1%/month from date payable to date of deduction. March TDS due date: 30th April.</div>
        </div>
      )}
    </div>
  );
}

// ── CAPITAL GAINS ──
function CapitalGainsCalc(){
  const [assetType,setAssetType]=useState("equity");
  const [term,setTerm]=useState("lt");
  const [sale,setSale]=useState("");
  const [cost,setCost]=useState("");
  const [indexed,setIndexed]=useState("");
  const [expenses,setExpenses]=useState("");
  const [slab,setSlab]=useState("30");
  const [result,setResult]=useState(null);

  const calculate=()=>{
    const s=parseFloat(sale)||0, c=parseFloat(cost)||0, idx=parseFloat(indexed)||c, exp=parseFloat(expenses)||0;
    if(!s||!c) return alert("Enter sale and cost price");
    const gains=s-(term==="lt"&&assetType!=="equity"?idx:c)-exp;
    let taxRate=0,exemption=0,note="";
    if(term==="lt"){
      if(assetType==="equity"){taxRate=0.10;exemption=100000;note="LTCG on equity/equity MF taxed @10% above ₹1L exemption u/s 112A";}
      else if(assetType==="debt"){taxRate=0.20;note="LTCG on debt MF/bonds taxed @20% with indexation u/s 112";}
      else if(assetType==="property"){taxRate=0.125;note="LTCG on property @12.5% without indexation (post Jul 2024 budget amendment)";}
      else{taxRate=0.125;note="LTCG on gold/silver @12.5% without indexation";}
    } else {
      if(assetType==="equity"){taxRate=0.15;note="STCG on equity/equity MF taxed @15% u/s 111A";}
      else{taxRate=parseFloat(slab)/100;note=`STCG on ${assetType} added to total income and taxed as per slab rate (${slab}%)`;}
    }
    const taxableGains=Math.max(0,gains-exemption);
    const tax=Math.round(taxableGains*taxRate);
    const cess=Math.round(tax*0.04);
    setResult({gains,taxableGains,exemption,taxRate,tax,cess,total:tax+cess,note});
  };

  return(
    <div>
      <div style={g.adSlot}>📢 Advertisement</div>
      <h1 style={g.cardTitle}>📈 Capital Gains Tax Calculator</h1>
      <p style={g.cardSub}>Equity • Debt MF • Property • Gold — STCG & LTCG with correct rates</p>
      <div style={g.card}>
        <div style={g.row2}>
          <div style={g.fld}><label style={g.lbl}>Asset Type</label><select style={g.sel} value={assetType} onChange={e=>setAssetType(e.target.value)}><option value="equity">Equity / Equity Mutual Fund</option><option value="debt">Debt MF / Bonds / Debentures</option><option value="property">Property / Real Estate</option><option value="gold">Gold / Silver / Jewellery</option></select></div>
          <div style={g.fld}><label style={g.lbl}>Holding Period</label><select style={g.sel} value={term} onChange={e=>setTerm(e.target.value)}><option value="lt">Long Term (LTCG)</option><option value="st">Short Term (STCG)</option></select></div>
        </div>
        <div style={g.row2}>
          <div style={g.fld}><label style={g.lbl}>Sale Price (₹)</label><input style={g.inp} type="number" placeholder="e.g. 5000000" value={sale} onChange={e=>setSale(e.target.value)}/></div>
          <div style={g.fld}><label style={g.lbl}>Cost / Purchase Price (₹)</label><input style={g.inp} type="number" placeholder="e.g. 3000000" value={cost} onChange={e=>setCost(e.target.value)}/></div>
        </div>
        {(term==="lt"&&(assetType==="debt"||assetType==="property"))&&(<div style={g.fld}><label style={g.lbl}>Indexed Cost (₹) — optional</label><input style={g.inp} type="number" placeholder="Calculated using CII" value={indexed} onChange={e=>setIndexed(e.target.value)}/></div>)}
        <div style={g.row2}>
          <div style={g.fld}><label style={g.lbl}>Transfer Expenses / Brokerage (₹)</label><input style={g.inp} type="number" placeholder="0" value={expenses} onChange={e=>setExpenses(e.target.value)}/></div>
          {term==="st"&&assetType!=="equity"&&(<div style={g.fld}><label style={g.lbl}>Your Tax Slab (%)</label><select style={g.sel} value={slab} onChange={e=>setSlab(e.target.value)}>{["5","10","15","20","30"].map(r=><option key={r} value={r}>{r}%</option>)}</select></div>)}
        </div>
        <button style={g.btn} onClick={calculate}>Calculate Capital Gains Tax</button>
      </div>
      {result&&(
        <div>
          <div style={g.result}>
            <div style={{opacity:0.8,fontSize:12,marginBottom:4}}>{term==="lt"?"Long Term":"Short Term"} Capital Gains Tax Payable</div>
            <div style={{fontWeight:900,fontSize:26}}>{fmtL(result.total)}</div>
            <div style={{opacity:0.8,fontSize:12,marginTop:4}}>Tax: {fmt(result.tax)} + Cess @4%: {fmt(result.cess)}</div>
            <div style={{height:1,background:"rgba(255,255,255,0.2)",margin:"12px 0"}}/>
            {[["Capital Gains",fmtL(result.gains)],result.exemption?["Less: Exemption u/s 112A","("+fmtL(result.exemption)+")"]:[],["Taxable Capital Gains",fmtL(result.taxableGains)],["Applicable Tax Rate",(result.taxRate*100).toFixed(1)+"%"]].filter(r=>r.length).map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"4px 0"}}><span style={{opacity:0.8}}>{k}</span><span style={{fontWeight:700}}>{v}</span></div>
            ))}
          </div>
          <div style={g.note}>💡 <b>CA Note:</b> {result.note}</div>
          <div style={g.adSlot}>📢 Advertisement — Affiliate: Zerodha / Groww</div>
        </div>
      )}
    </div>
  );
}

// ── SIP CALCULATOR ──
function SIPCalc(){
  const [mode,setMode]=useState("sip");
  const [monthly,setMonthly]=useState("");
  const [lumpsum,setLumpsum]=useState("");
  const [rate,setRate]=useState("12");
  const [years,setYears]=useState("10");
  const [taxSlab,setTaxSlab]=useState("30");
  const [result,setResult]=useState(null);

  const calculate=()=>{
    const r=parseFloat(rate)/100/12,n=parseFloat(years)*12,sl=parseFloat(taxSlab)/100;
    let inv=0,mat=0;
    if(mode==="sip"){const m=parseFloat(monthly)||0;inv=m*n;mat=m*((Math.pow(1+r,n)-1)/r)*(1+r);}
    else{const l=parseFloat(lumpsum)||0;inv=l;mat=l*Math.pow(1+parseFloat(rate)/100,parseFloat(years));}
    const gains=mat-inv;
    const ltcgTax=Math.max(0,gains-100000)*0.10;
    const postTax=mat-ltcgTax;
    const fdRate=0.07,fdMat=mode==="sip"?parseFloat(monthly||0)*n*Math.pow(1+fdRate,parseFloat(years)):parseFloat(lumpsum||0)*Math.pow(1+fdRate,parseFloat(years));
    const fdPost=fdMat-(fdMat-inv)*sl;
    setResult({inv,mat,gains,ltcgTax,postTax,fdPost,extra:postTax-fdPost});
  };

  return(
    <div>
      <div style={g.adSlot}>📢 Advertisement</div>
      <h1 style={g.cardTitle}>💹 SIP Returns Calculator</h1>
      <p style={g.cardSub}>Mutual Fund Returns — Pre & Post Tax — vs Fixed Deposit comparison</p>
      <div style={g.card}>
        <div style={{display:"flex",gap:8,marginBottom:14}}>
          {["sip","lumpsum"].map(m=>(
            <button key={m} onClick={()=>setMode(m)} style={{flex:1,padding:"10px",borderRadius:9,border:`2px solid ${mode===m?C.primary:C.border}`,background:mode===m?C.light:C.white,color:mode===m?C.primary:C.muted,fontWeight:700,cursor:"pointer",fontSize:13}}>
              {m==="sip"?"SIP (Monthly)":"Lumpsum"}
            </button>
          ))}
        </div>
        <div style={g.row2}>
          <div style={g.fld}><label style={g.lbl}>{mode==="sip"?"Monthly SIP Amount (₹)":"Lumpsum Amount (₹)"}</label><input style={g.inp} type="number" placeholder={mode==="sip"?"10000":"100000"} value={mode==="sip"?monthly:lumpsum} onChange={e=>mode==="sip"?setMonthly(e.target.value):setLumpsum(e.target.value)}/></div>
          <div style={g.fld}><label style={g.lbl}>Expected Annual Return (%)</label><input style={g.inp} type="number" value={rate} onChange={e=>setRate(e.target.value)}/></div>
        </div>
        <div style={g.row2}>
          <div style={g.fld}><label style={g.lbl}>Investment Period (Years)</label><input style={g.inp} type="number" value={years} onChange={e=>setYears(e.target.value)}/></div>
          <div style={g.fld}><label style={g.lbl}>Your Income Tax Slab (for FD comparison)</label><select style={g.sel} value={taxSlab} onChange={e=>setTaxSlab(e.target.value)}>{["0","5","10","20","30"].map(r=><option key={r} value={r}>{r}%</option>)}</select></div>
        </div>
        <button style={g.btn} onClick={calculate}>📊 Calculate Returns</button>
      </div>
      {result&&(
        <div>
          <div style={g.result}>
            <div style={{opacity:0.8,fontSize:12}}>Maturity Value (Pre-Tax)</div>
            <div style={{fontWeight:900,fontSize:26}}>{fmtL(result.mat)}</div>
            <div style={{opacity:0.8,fontSize:12}}>Total Invested: {fmtL(result.inv)} • Gains: {fmtL(result.gains)}</div>
            <div style={{height:1,background:"rgba(255,255,255,0.2)",margin:"12px 0"}}/>
            {[["LTCG Tax (10% on gains above ₹1L)",fmt(result.ltcgTax)],["Post-Tax Maturity (Mutual Fund)",fmtL(result.postTax)],["FD Post-Tax Returns @7%",fmtL(result.fdPost)],["MF Advantage over FD",fmtL(result.extra)]].map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"4px 0"}}><span style={{opacity:0.85}}>{k}</span><span style={{fontWeight:700,color:k.includes("Advantage")?"#86efac":"#fff"}}>{v}</span></div>
            ))}
          </div>
          <div style={g.note}>💡 <b>CA Note:</b> Equity MF LTCG above ₹1L taxed @10% u/s 112A. FD interest taxed as per income slab. For 30% slab payers, MF is significantly more tax-efficient over long term.</div>
          <div style={g.adSlot}>📢 Advertisement — Affiliate: Groww / Zerodha / ET Money</div>
        </div>
      )}
    </div>
  );
}

// ── INLINE EDITABLE FIELD ──
// Renders as styled text; on click becomes an input/select. Pencil hint on hover.
function EditField({ value, onChange, type="text", options=null, style={}, textStyle={}, placeholder="—", multiline=false }){
  const [editing, setEditing] = useState(false);
  const ref = React.useRef();

  const commit = () => setEditing(false);

  const hoverBorder = {
    outline:"2px dashed #93c5fd",
    borderRadius:4,
    cursor:"text",
    position:"relative",
  };

  if(editing){
    const base = {
      border:`2px solid #1a56db`,
      borderRadius:6,
      padding:"3px 6px",
      fontSize:"inherit",
      fontFamily:"inherit",
      fontWeight:"inherit",
      color:"inherit",
      background:"#eff6ff",
      outline:"none",
      width:"100%",
      boxSizing:"border-box",
    };
    if(options){
      return(
        <select autoFocus ref={ref} value={value} style={{...base,...style}}
          onChange={e=>onChange(e.target.value)} onBlur={commit}>
          {options.map(o=><option key={o} value={o}>{o}</option>)}
        </select>
      );
    }
    if(multiline){
      return(
        <textarea autoFocus ref={ref} value={value} rows={2} style={{...base,...style,resize:"vertical"}}
          onChange={e=>onChange(e.target.value)} onBlur={commit}/>
      );
    }
    return(
      <input autoFocus ref={ref} type={type} value={value} style={{...base,...style}}
        onChange={e=>onChange(e.target.value)} onBlur={commit}
        onKeyDown={e=>e.key==="Enter"&&commit()}/>
    );
  }

  return(
    <span onClick={()=>setEditing(true)}
      title="Click to edit"
      style={{
        display:"inline-block", minWidth:40, cursor:"text",
        borderRadius:4, padding:"1px 3px",
        transition:"outline 0.15s",
        ...textStyle,
        ...style,
      }}
      onMouseEnter={e=>e.currentTarget.style.outline="2px dashed #93c5fd"}
      onMouseLeave={e=>e.currentTarget.style.outline="none"}
    >
      {value||<span style={{color:"#9ca3af",fontStyle:"italic"}}>{placeholder}</span>}
    </span>
  );
}

// ── GST INVOICE GENERATOR (Advanced) ──
const emptyItem = () => ({ id:Date.now()+Math.random(), name:"", hsn:"", qty:1, uqc:"NOS", price:"", tax:18 });
const calcInvItem = it => {
  const base = (parseFloat(it.price)||0)*(parseFloat(it.qty)||0);
  const taxAmt = base*(it.tax/100);
  return { base, cgst:taxAmt/2, sgst:taxAmt/2, igst:taxAmt, taxAmt, total:base+taxAmt };
};

function GSTInvoice(){
  const [step, setStep] = useState(1);
  const [invType, setInvType]    = useState("regular");
  const [rcm, setRcm]            = useState("no");
  const [placeOfSupply, setPos]  = useState("Maharashtra");
  const [invNo, setInvNo]        = useState(`INV-${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2,"0")}${String(new Date().getDate()).padStart(2,"0")}-001`);
  const [invDate, setInvDate]    = useState(new Date().toISOString().slice(0,10));
  const [ewayBill, setEwayBill]  = useState("");
  const [poNumber, setPoNumber]  = useState("");
  const [biz, setBiz]   = useState({ name:"", gstin:"", address:"", city:"", state:"Maharashtra", pin:"", phone:"", email:"", upi:"", bankName:"", accountNo:"", ifsc:"", pan:"" });
  const [billTo, setBillTo]      = useState({ name:"", gstin:"", address:"", city:"", state:"Maharashtra", pin:"", phone:"", email:"" });
  const [sameAsShip, setSameAsShip] = useState(true);
  const [shipTo, setShipTo]      = useState({ name:"", address:"", city:"", state:"Maharashtra", pin:"" });
  const [items, setItems]        = useState([emptyItem()]);
  const [note, setNote]          = useState("");

  const updateItem = (id,f,v) => setItems(p=>p.map(it=>it.id===id?{...it,[f]:v}:it));
  const addItem    = () => setItems(p=>[...p,emptyItem()]);
  const removeItem = id => setItems(p=>p.filter(it=>it.id!==id));

  const totals = items.reduce((a,it)=>{
    const c=calcInvItem(it);
    return { base:a.base+c.base, cgst:a.cgst+c.cgst, sgst:a.sgst+c.sgst, igst:a.igst+c.igst, tax:a.tax+c.taxAmt, total:a.total+c.total };
  },{ base:0,cgst:0,sgst:0,igst:0,tax:0,total:0 });

  const isIGST = invType==="sez_payment" || invType==="deemed_export" || (biz.state && billTo.state && biz.state!==billTo.state);
  const invTypeLabel = INVOICE_TYPES.find(t=>t.id===invType)?.label || "Regular";
  const grandTotal = invType==="sez_nopayment" ? totals.base : totals.total;

  const whatsappMsg = () => {
    let m=`*TAX INVOICE*\n*${biz.name}*\nGSTIN: ${biz.gstin}\n\nInvoice No: ${invNo} | Date: ${invDate}\nType: ${invTypeLabel}\n\n*Bill To:* ${billTo.name}\nGSTIN: ${billTo.gstin}\n\n*Items:*\n`;
    items.forEach(it=>{const c=calcInvItem(it);m+=`• ${it.name} ${it.qty} ${it.uqc} @ ₹${it.price} = ${fmt2(c.total)}\n`;});
    m+=`\nSubtotal: ${fmt2(totals.base)}\nTotal GST: ${fmt2(totals.tax)}\n*Grand Total: ${fmt2(grandTotal)}*`;
    if(biz.upi) m+=`\n\n💳 UPI: ${biz.upi}`;
    return encodeURIComponent(m);
  };
  const sendWA = () => {
    const ph=(billTo.phone||"").replace(/\D/g,"");
    window.open(ph?`https://wa.me/91${ph}?text=${whatsappMsg()}`:`https://wa.me/?text=${whatsappMsg()}`,"_blank");
  };

  const printInvoice = () => {
    const igst = isIGST;
    const taxRows = [5,12,18,28].map(rate=>{
      const ri=items.filter(it=>it.tax===rate);
      if(!ri.length) return "";
      const rb=ri.reduce((s,it)=>s+calcInvItem(it).base,0);
      const rt=ri.reduce((s,it)=>s+calcInvItem(it).taxAmt,0);
      return `<tr><td>${rate}%</td><td style="text-align:right">₹${rb.toFixed(2)}</td>${igst?`<td style="text-align:right">₹${rt.toFixed(2)}</td><td></td><td></td>`:`<td style="text-align:right">₹${(rt/2).toFixed(2)}</td><td style="text-align:right">₹${(rt/2).toFixed(2)}</td>`}<td style="text-align:right">₹${rt.toFixed(2)}</td></tr>`;
    }).join("");
    const w = window.open("","_blank");
    w.document.write(`<!DOCTYPE html><html><head><title>${invNo}</title>
    <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;font-size:12px;color:#111;background:#fff;padding:16px}.page{max-width:720px;margin:0 auto;border:1px solid #333}.header{background:#1e2d5a;color:#fff;padding:14px 18px;display:flex;justify-content:space-between;align-items:flex-start}.biz-name{font-size:18px;font-weight:900;margin-bottom:3px}.inv-title{font-size:20px;font-weight:900;color:#93c5fd;text-align:right}.meta-row{display:flex;border-bottom:1px solid #d1d5db}.meta-box{flex:1;padding:10px 14px;border-right:1px solid #d1d5db;font-size:11px}.meta-box:last-child{border-right:none}.meta-label{font-size:9px;font-weight:700;color:#6b7280;letter-spacing:1px;text-transform:uppercase;margin-bottom:4px}.meta-value{font-weight:700;font-size:12px;margin-bottom:2px}.meta-sub{color:#6b7280;font-size:11px;margin-bottom:1px}table{width:100%;border-collapse:collapse}th{background:#1e2d5a;color:#fff;padding:7px 8px;text-align:left;font-size:10px;font-weight:700}th.r{text-align:right}td{padding:7px 8px;border-bottom:1px solid #f3f4f6;font-size:11px}td.r{text-align:right;font-weight:600}tr.alt{background:#f9fafb}.totals-section{display:flex;border-top:2px solid #d1d5db}.gst-summary{flex:1;padding:12px 14px;border-right:1px solid #d1d5db;font-size:11px}.amount-summary{width:220px;padding:12px 14px;font-size:12px}.amount-row{display:flex;justify-content:space-between;margin-bottom:4px}.grand-total{display:flex;justify-content:space-between;font-size:16px;font-weight:900;border-top:2px solid #1e2d5a;padding-top:6px;margin-top:4px;color:#1e2d5a}.footer-section{display:flex;border-top:1px solid #d1d5db;min-height:80px}.footer-box{flex:1;padding:10px 14px;border-right:1px solid #d1d5db;font-size:11px}.footer-box:last-child{border-right:none}.declaration{background:#f9fafb;border-top:1px solid #d1d5db;padding:10px 14px;font-size:10px;color:#374151;font-style:italic;line-height:1.5}.bottom-footer{background:#1e2d5a;color:rgba(255,255,255,0.7);text-align:center;padding:6px;font-size:9px}.sign-area{margin-top:8px;border-top:1px solid #374151;padding-top:3px;font-size:10px;font-weight:700;text-align:center}@media print{body{padding:0}.page{border:none;max-width:100%}}</style></head><body>
    <div class="page">
      <div class="header">
        <div>
          <div class="biz-name">${biz.name||"Your Business"}</div>
          <div style="font-size:10px;opacity:0.85;margin-bottom:2px">GSTIN: ${biz.gstin||"—"} | PAN: ${biz.pan||"—"}</div>
          <div style="font-size:10px;opacity:0.8">${biz.address||""}, ${biz.city||""}, ${biz.state} - ${biz.pin||""}</div>
          <div style="font-size:10px;opacity:0.8">📞 ${biz.phone||"—"} | ✉ ${biz.email||"—"}</div>
        </div>
        <div style="text-align:right">
          <div class="inv-title">TAX INVOICE</div>
          <div style="font-size:11px;margin-top:4px;opacity:0.9">Invoice No: <b>${invNo}</b></div>
          <div style="font-size:11px;opacity:0.9">Date: <b>${new Date(invDate).toLocaleDateString("en-IN",{day:"2-digit",month:"2-digit",year:"numeric"})}</b></div>
          ${poNumber?`<div style="font-size:10px;opacity:0.8">PO No: ${poNumber}</div>`:""}
          ${ewayBill?`<div style="font-size:10px;opacity:0.8">E-Way Bill No: ${ewayBill}</div>`:""}
        </div>
      </div>
      <div class="meta-row" style="background:#f0f4ff;padding:8px 14px;display:flex;gap:24px;font-size:11px;align-items:center">
        <div><span style="color:#6b7280;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px">Invoice Type: </span><b>${invTypeLabel}</b></div>
        <div><span style="color:#6b7280;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px">RCM: </span><b>${rcm==="yes"?"Yes — Reverse Charge Applicable":"No"}</b></div>
        <div><span style="color:#6b7280;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px">Place of Supply: </span><b>${placeOfSupply}</b></div>
      </div>
      <div class="meta-row">
        <div class="meta-box"><div class="meta-label">Bill To</div><div class="meta-value">${billTo.name||"—"}</div><div class="meta-sub">GSTIN: ${billTo.gstin||"—"}</div><div class="meta-sub">${billTo.address||""}, ${billTo.city||""}</div><div class="meta-sub">${billTo.state} - ${billTo.pin||""}</div><div class="meta-sub">📞 ${billTo.phone||"—"}</div><div class="meta-sub">✉ ${billTo.email||""}</div></div>
        <div class="meta-box"><div class="meta-label">Ship To</div><div class="meta-value">${sameAsShip?billTo.name||"Same as Bill To":shipTo.name||"—"}</div><div class="meta-sub">${sameAsShip?(billTo.address||"Same as billing address"):shipTo.address||""}</div>${!sameAsShip?`<div class="meta-sub">${shipTo.city||""}, ${shipTo.state} - ${shipTo.pin||""}</div>`:""}</div>
        <div class="meta-box"><div class="meta-label">Bank Details</div><div class="meta-sub"><b>Bank:</b> ${biz.bankName||"—"}</div><div class="meta-sub"><b>A/C No:</b> ${biz.accountNo||"—"}</div><div class="meta-sub"><b>IFSC:</b> ${biz.ifsc||"—"}</div><div class="meta-sub"><b>UPI:</b> ${biz.upi||"—"}</div></div>
      </div>
      <table><thead><tr><th style="width:28px">#</th><th>Description of Goods / Services</th><th style="width:60px">HSN/SAC</th><th style="width:40px" class="r">Qty</th><th style="width:40px">UQC</th><th style="width:70px" class="r">Rate (₹)</th><th style="width:80px" class="r">Taxable (₹)</th>${igst?`<th style="width:80px" class="r">IGST (₹)</th>`:`<th style="width:70px" class="r">CGST (₹)</th><th style="width:70px" class="r">SGST (₹)</th>`}<th style="width:80px" class="r">Total (₹)</th></tr></thead>
      <tbody>${items.map((it,i)=>{const c=calcInvItem(it);return`<tr class="${i%2===1?"alt":""}"><td style="color:#6b7280">${i+1}</td><td style="font-weight:600">${it.name||"—"}</td><td style="color:#6b7280">${it.hsn||"—"}</td><td class="r">${it.qty}</td><td style="color:#6b7280">${it.uqc}</td><td class="r">₹${parseFloat(it.price||0).toFixed(2)}</td><td class="r">₹${c.base.toFixed(2)}</td>${igst?`<td class="r">₹${c.igst.toFixed(2)}<br><span style="color:#6b7280;font-size:9px">${it.tax}%</span></td>`:`<td class="r">₹${c.cgst.toFixed(2)}<br><span style="color:#6b7280;font-size:9px">${it.tax/2}%</span></td><td class="r">₹${c.sgst.toFixed(2)}<br><span style="color:#6b7280;font-size:9px">${it.tax/2}%</span></td>`}<td class="r" style="font-weight:700">₹${c.total.toFixed(2)}</td></tr>`;}).join("")}</tbody></table>
      <div class="totals-section">
        <div class="gst-summary"><div style="font-size:9px;font-weight:700;color:#6b7280;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px">GST Rate-wise Summary</div>
          <table style="font-size:10px"><thead><tr style="background:#f3f4f6"><th style="text-align:left;padding:4px 6px;color:#374151;font-weight:700">Rate</th><th style="text-align:right;padding:4px 6px;color:#374151;font-weight:700">Taxable</th>${igst?`<th style="text-align:right;padding:4px 6px;color:#374151;font-weight:700">IGST</th><th></th><th></th>`:`<th style="text-align:right;padding:4px 6px;color:#374151;font-weight:700">CGST</th><th style="text-align:right;padding:4px 6px;color:#374151;font-weight:700">SGST</th>`}<th style="text-align:right;padding:4px 6px;color:#374151;font-weight:700">Total Tax</th></tr></thead><tbody>${taxRows}</tbody></table>
          ${rcm==="yes"?`<div style="margin-top:8px;font-size:10px;color:#b45309;font-weight:700;background:#fef9c3;padding:4px 8px;border-radius:4px">⚠️ Tax payable on Reverse Charge Basis</div>`:""}
        </div>
        <div class="amount-summary"><div style="font-size:9px;font-weight:700;color:#6b7280;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">Amount Summary</div>
          <div class="amount-row"><span style="color:#6b7280">Taxable Value</span><span>₹${totals.base.toFixed(2)}</span></div>
          ${igst?`<div class="amount-row"><span style="color:#6b7280">IGST</span><span>₹${totals.igst.toFixed(2)}</span></div>`:`<div class="amount-row"><span style="color:#6b7280">CGST</span><span>₹${totals.cgst.toFixed(2)}</span></div><div class="amount-row"><span style="color:#6b7280">SGST</span><span>₹${totals.sgst.toFixed(2)}</span></div>`}
          <div class="amount-row"><span style="color:#6b7280">Total GST</span><span>₹${totals.tax.toFixed(2)}</span></div>
          ${invType==="sez_nopayment"?`<div class="amount-row" style="color:#15803d"><span>GST (LUT/Bond)</span><span>₹0.00</span></div>`:""}
          <div class="grand-total"><span>Grand Total</span><span>₹${grandTotal.toFixed(2)}</span></div>
          <div style="font-size:9px;color:#6b7280;font-style:italic;margin-top:4px">Rupees ${numberToWords(Math.floor(grandTotal))} Only</div>
        </div>
      </div>
      <div class="footer-section">
        <div class="footer-box" style="flex:2">${biz.upi?`<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:6px 10px;margin-bottom:6px;font-size:11px;color:#15803d;font-weight:700">💳 Pay via UPI: ${biz.upi}</div>`:""} ${note?`<div style="font-size:11px;color:#374151;font-style:italic">📝 ${note}</div>`:""} ${ewayBill?`<div style="font-size:10px;color:#374151;margin-top:4px">E-Way Bill No: <b>${ewayBill}</b></div>`:""} ${poNumber?`<div style="font-size:10px;color:#374151;margin-top:2px">PO Number: <b>${poNumber}</b></div>`:""}</div>
        <div class="footer-box" style="text-align:center"><div style="font-size:9px;font-weight:700;color:#6b7280;letter-spacing:1px;text-transform:uppercase;margin-bottom:30px">For ${biz.name||"Your Business"}</div><div class="sign-area">Authorised Signatory</div></div>
      </div>
      <div class="declaration"><b>Declaration:</b> We declare that this invoice shows the actual price of the goods and services described and that all particulars are true and correct to the best of our knowledge.${invType==="deemed_export"?` <b>Deemed Export:</b> Supply made under Deemed Export category as per Section 147 of CGST Act, 2017.`:""}${invType==="sez_payment"?` <b>SEZ Supply:</b> Supply to SEZ with payment of Integrated Tax as per Section 16(3)(b) of IGST Act, 2017.`:""}${invType==="sez_nopayment"?` <b>SEZ Supply (LUT/Bond):</b> Supply to SEZ without payment of Integrated Tax under LUT/Bond as per Section 16(3)(a) of IGST Act, 2017.`:""}${rcm==="yes"?` <b>RCM:</b> Tax is payable on reverse charge basis by the recipient as per Section 9(3)/9(4) of CGST Act, 2017.`:""}</div>
      <div class="bottom-footer">Generated by <b style="color:#93c5fd">TaxGyaan.in</b> — India's Free CA Finance Portal &nbsp;|&nbsp; Computer generated invoice &nbsp;|&nbsp; No signature required</div>
    </div>
    <script>window.onload=()=>window.print()</script></body></html>`);
    w.document.close();
  };

  const IS = { // Invoice styles
    card:  {...g.card},
    title: {fontWeight:700,color:C.dark,marginBottom:12,fontSize:13},
    lbl:   {...g.lbl},
    inp:   {...g.inp},
    sel:   {...g.sel},
    fld:   {...g.fld},
    row2:  {...g.row2},
    row3:  {...g.row3},
    btnGreen:{ background:C.success, color:"#fff", border:"none", borderRadius:10, padding:"12px 18px", fontSize:13, fontWeight:700, cursor:"pointer", flex:1, marginTop:6 },
    btnWA:   { background:"#25D366", color:"#fff", border:"none", borderRadius:10, padding:"12px 18px", fontSize:13, fontWeight:700, cursor:"pointer", flex:1, marginTop:6 },
    btnGray: { background:"#6b7280", color:"#fff", border:"none", borderRadius:10, padding:"12px 18px", fontSize:13, fontWeight:700, cursor:"pointer", flex:1, marginTop:6 },
  };

  return(
    <div>
      <div style={g.adSlot}>📢 Advertisement</div>
      <h1 style={g.cardTitle}>🧾 GST Tax Invoice Generator</h1>
      <p style={g.cardSub}>Professional • CGST/SGST/IGST Auto-split • WhatsApp Ready • Print to PDF</p>

      {step===1 && (
        <div>
          {/* Invoice Configuration */}
          <div style={IS.card}>
            <div style={IS.title}>📋 Invoice Configuration</div>
            <div style={IS.fld}>
              <label style={IS.lbl}>Invoice Type</label>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {INVOICE_TYPES.map(t=>(
                  <div key={t.id} onClick={()=>setInvType(t.id)} style={{border:`2px solid ${invType===t.id?C.primary:C.border}`,borderRadius:9,padding:"10px 12px",cursor:"pointer",background:invType===t.id?C.light:C.white}}>
                    <div style={{fontWeight:700,fontSize:13,color:invType===t.id?C.primary:C.text}}>{t.label}</div>
                    <div style={{fontSize:10,color:C.muted,marginTop:2}}>{t.desc}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={IS.row2}>
              <div style={IS.fld}>
                <label style={IS.lbl}>Reverse Charge Mechanism (RCM)</label>
                <div style={{display:"flex",gap:8}}>
                  {["yes","no"].map(v=>(
                    <div key={v} onClick={()=>setRcm(v)} style={{flex:1,border:`2px solid ${rcm===v?C.primary:C.border}`,borderRadius:9,padding:"10px",cursor:"pointer",background:rcm===v?C.light:C.white,textAlign:"center",fontWeight:700,fontSize:13,color:rcm===v?C.primary:C.text}}>
                      {v==="yes"?"✅ Yes":"❌ No"}
                    </div>
                  ))}
                </div>
                {rcm==="yes"&&<div style={{fontSize:11,color:"#b45309",marginTop:4,background:"#fef9c3",borderRadius:6,padding:"4px 8px"}}>⚠️ Tax payable by recipient on Reverse Charge basis</div>}
              </div>
              <div style={IS.fld}>
                <label style={IS.lbl}>Place of Supply</label>
                <select style={IS.sel} value={placeOfSupply} onChange={e=>setPos(e.target.value)}>{STATES.map(st=><option key={st} value={st}>{st}</option>)}</select>
              </div>
            </div>
            <div style={IS.row3}>
              <div style={IS.fld}><label style={IS.lbl}>Invoice Number</label><input style={IS.inp} value={invNo} onChange={e=>setInvNo(e.target.value)}/></div>
              <div style={IS.fld}><label style={IS.lbl}>Invoice Date</label><input style={IS.inp} type="date" value={invDate} onChange={e=>setInvDate(e.target.value)}/></div>
              <div style={IS.fld}><label style={IS.lbl}>PO Number (optional)</label><input style={IS.inp} placeholder="Purchase Order No." value={poNumber} onChange={e=>setPoNumber(e.target.value)}/></div>
            </div>
            <div style={IS.fld}><label style={IS.lbl}>E-Way Bill Number (optional)</label><input style={IS.inp} placeholder="12-digit E-Way Bill No." value={ewayBill} onChange={e=>setEwayBill(e.target.value)}/></div>
          </div>

          {/* Business Details */}
          <div style={IS.card}>
            <div style={IS.title}>🏪 Your Business Details</div>
            <div style={IS.row2}>
              <div style={IS.fld}><label style={IS.lbl}>Business / Trade Name</label><input style={IS.inp} placeholder="e.g. Sharma General Store" value={biz.name} onChange={e=>setBiz({...biz,name:e.target.value})}/></div>
              <div style={IS.fld}><label style={IS.lbl}>GSTIN</label><input style={IS.inp} placeholder="27AABCS9603R1ZX" value={biz.gstin} onChange={e=>setBiz({...biz,gstin:e.target.value})}/></div>
            </div>
            <div style={IS.row2}>
              <div style={IS.fld}><label style={IS.lbl}>PAN</label><input style={IS.inp} placeholder="AABCS9603R" value={biz.pan} onChange={e=>setBiz({...biz,pan:e.target.value})}/></div>
              <div style={IS.fld}><label style={IS.lbl}>Phone</label><input style={IS.inp} type="tel" placeholder="10-digit" value={biz.phone} onChange={e=>setBiz({...biz,phone:e.target.value})}/></div>
            </div>
            <div style={IS.fld}><label style={IS.lbl}>Address</label><input style={IS.inp} placeholder="Street / Area" value={biz.address} onChange={e=>setBiz({...biz,address:e.target.value})}/></div>
            <div style={IS.row3}>
              <div style={IS.fld}><label style={IS.lbl}>City</label><input style={IS.inp} placeholder="City" value={biz.city} onChange={e=>setBiz({...biz,city:e.target.value})}/></div>
              <div style={IS.fld}><label style={IS.lbl}>State</label><select style={IS.sel} value={biz.state} onChange={e=>setBiz({...biz,state:e.target.value})}>{STATES.map(st=><option key={st} value={st}>{st}</option>)}</select></div>
              <div style={IS.fld}><label style={IS.lbl}>PIN Code</label><input style={IS.inp} placeholder="440012" value={biz.pin} onChange={e=>setBiz({...biz,pin:e.target.value})}/></div>
            </div>
            <div style={IS.row2}>
              <div style={IS.fld}><label style={IS.lbl}>Email</label><input style={IS.inp} type="email" placeholder="email@domain.com" value={biz.email} onChange={e=>setBiz({...biz,email:e.target.value})}/></div>
              <div style={IS.fld}><label style={IS.lbl}>UPI ID</label><input style={IS.inp} placeholder="name@upi" value={biz.upi} onChange={e=>setBiz({...biz,upi:e.target.value})}/></div>
            </div>
            <div style={{fontWeight:700,color:C.dark,marginBottom:8,marginTop:4,fontSize:12}}>🏦 Bank Details</div>
            <div style={IS.row3}>
              <div style={IS.fld}><label style={IS.lbl}>Bank Name</label><input style={IS.inp} placeholder="State Bank of India" value={biz.bankName} onChange={e=>setBiz({...biz,bankName:e.target.value})}/></div>
              <div style={IS.fld}><label style={IS.lbl}>Account Number</label><input style={IS.inp} placeholder="12345678901" value={biz.accountNo} onChange={e=>setBiz({...biz,accountNo:e.target.value})}/></div>
              <div style={IS.fld}><label style={IS.lbl}>IFSC Code</label><input style={IS.inp} placeholder="SBIN0012345" value={biz.ifsc} onChange={e=>setBiz({...biz,ifsc:e.target.value})}/></div>
            </div>
          </div>

          {/* Bill To */}
          <div style={IS.card}>
            <div style={IS.title}>👤 Bill To — Customer Details</div>
            <div style={IS.row2}>
              <div style={IS.fld}><label style={IS.lbl}>Customer / Company Name</label><input style={IS.inp} placeholder="Ramesh Trading Co." value={billTo.name} onChange={e=>setBillTo({...billTo,name:e.target.value})}/></div>
              <div style={IS.fld}><label style={IS.lbl}>GSTIN (if registered)</label><input style={IS.inp} placeholder="27AABCR1234R1ZX" value={billTo.gstin} onChange={e=>setBillTo({...billTo,gstin:e.target.value})}/></div>
            </div>
            <div style={IS.fld}><label style={IS.lbl}>Address</label><input style={IS.inp} placeholder="Street / Area" value={billTo.address} onChange={e=>setBillTo({...billTo,address:e.target.value})}/></div>
            <div style={IS.row3}>
              <div style={IS.fld}><label style={IS.lbl}>City</label><input style={IS.inp} placeholder="City" value={billTo.city} onChange={e=>setBillTo({...billTo,city:e.target.value})}/></div>
              <div style={IS.fld}><label style={IS.lbl}>State</label><select style={IS.sel} value={billTo.state} onChange={e=>setBillTo({...billTo,state:e.target.value})}>{STATES.map(st=><option key={st} value={st}>{st}</option>)}</select></div>
              <div style={IS.fld}><label style={IS.lbl}>PIN Code</label><input style={IS.inp} placeholder="440002" value={billTo.pin} onChange={e=>setBillTo({...billTo,pin:e.target.value})}/></div>
            </div>
            <div style={IS.row2}>
              <div style={IS.fld}><label style={IS.lbl}>Phone / WhatsApp</label><input style={IS.inp} type="tel" placeholder="10-digit" value={billTo.phone} onChange={e=>setBillTo({...billTo,phone:e.target.value})}/></div>
              <div style={IS.fld}><label style={IS.lbl}>Email</label><input style={IS.inp} type="email" placeholder="customer@email.com" value={billTo.email} onChange={e=>setBillTo({...billTo,email:e.target.value})}/></div>
            </div>
          </div>

          {/* Ship To */}
          <div style={IS.card}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={IS.title}>🚚 Ship To — Delivery Address</div>
              <div onClick={()=>setSameAsShip(!sameAsShip)} style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:12,fontWeight:600,color:sameAsShip?C.primary:C.muted}}>
                <div style={{width:16,height:16,borderRadius:3,border:`2px solid ${sameAsShip?C.primary:C.border}`,background:sameAsShip?C.primary:C.white,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {sameAsShip&&<div style={{color:"#fff",fontSize:10,fontWeight:900}}>✓</div>}
                </div>
                Same as Bill To
              </div>
            </div>
            {!sameAsShip?(
              <div>
                <div style={IS.fld}><label style={IS.lbl}>Recipient Name</label><input style={IS.inp} placeholder="Name / Company" value={shipTo.name} onChange={e=>setShipTo({...shipTo,name:e.target.value})}/></div>
                <div style={IS.fld}><label style={IS.lbl}>Delivery Address</label><input style={IS.inp} placeholder="Street / Area" value={shipTo.address} onChange={e=>setShipTo({...shipTo,address:e.target.value})}/></div>
                <div style={IS.row3}>
                  <div style={IS.fld}><label style={IS.lbl}>City</label><input style={IS.inp} placeholder="City" value={shipTo.city} onChange={e=>setShipTo({...shipTo,city:e.target.value})}/></div>
                  <div style={IS.fld}><label style={IS.lbl}>State</label><select style={IS.sel} value={shipTo.state} onChange={e=>setShipTo({...shipTo,state:e.target.value})}>{STATES.map(st=><option key={st} value={st}>{st}</option>)}</select></div>
                  <div style={IS.fld}><label style={IS.lbl}>PIN Code</label><input style={IS.inp} placeholder="PIN" value={shipTo.pin} onChange={e=>setShipTo({...shipTo,pin:e.target.value})}/></div>
                </div>
              </div>
            ):(
              <div style={{fontSize:12,color:C.muted,padding:"8px 12px",background:"#f9fafb",borderRadius:8}}>📦 Delivery address same as billing address</div>
            )}
          </div>

          {/* Items */}
          <div style={IS.card}>
            <div style={IS.title}>📦 Items / Services</div>
            {items.map((it,i)=>(
              <div key={it.id} style={{borderBottom:`1px dashed ${C.border}`,paddingBottom:12,marginBottom:12}}>
                <div style={{display:"grid",gridTemplateColumns:"2.5fr 1fr 0.8fr 0.8fr",gap:8,marginBottom:6}}>
                  <div style={IS.fld}>{i===0&&<label style={IS.lbl}>Item / Service Description</label>}<input style={IS.inp} placeholder="Item name" value={it.name} onChange={e=>updateItem(it.id,"name",e.target.value)}/></div>
                  <div style={IS.fld}>{i===0&&<label style={IS.lbl}>HSN / SAC</label>}<input style={IS.inp} placeholder="HSN code" value={it.hsn} onChange={e=>updateItem(it.id,"hsn",e.target.value)}/></div>
                  <div style={IS.fld}>{i===0&&<label style={IS.lbl}>Qty</label>}<input style={IS.inp} type="number" min="0.01" step="0.01" value={it.qty} onChange={e=>updateItem(it.id,"qty",e.target.value)}/></div>
                  <div style={IS.fld}>{i===0&&<label style={IS.lbl}>UQC</label>}<select style={IS.sel} value={it.uqc} onChange={e=>updateItem(it.id,"uqc",e.target.value)}>{UQC_LIST.map(u=><option key={u} value={u}>{u}</option>)}</select></div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 0.8fr 1fr auto",gap:8,alignItems:"flex-end"}}>
                  <div style={IS.fld}>{i===0&&<label style={IS.lbl}>Rate per Unit (₹)</label>}<input style={IS.inp} type="number" placeholder="0.00" value={it.price} onChange={e=>updateItem(it.id,"price",e.target.value)}/></div>
                  <div style={IS.fld}>{i===0&&<label style={IS.lbl}>GST Rate</label>}<select style={IS.sel} value={it.tax} onChange={e=>updateItem(it.id,"tax",Number(e.target.value))}>{[0,5,12,18,28].map(r=><option key={r} value={r}>{r}%</option>)}</select></div>
                  <div style={IS.fld}>{i===0&&<label style={IS.lbl}>{isIGST?"IGST Amount":"CGST + SGST"}</label>}
                    <div style={{...IS.inp,background:"#f0fdf4",color:C.success,fontWeight:700,display:"flex",alignItems:"center",fontSize:12}}>
                      {isIGST?fmt2(calcInvItem(it).igst):`${fmt2(calcInvItem(it).cgst)} + ${fmt2(calcInvItem(it).sgst)}`}
                    </div>
                  </div>
                  {items.length>1&&<button style={{background:"#fee2e2",border:"none",borderRadius:8,width:34,height:38,cursor:"pointer",color:C.danger,fontSize:14,alignSelf:"flex-end",flexShrink:0}} onClick={()=>removeItem(it.id)}>✕</button>}
                </div>
              </div>
            ))}
            <button onClick={addItem} style={{background:C.light,color:C.primary,border:`1.5px solid ${C.primary}`,borderRadius:8,padding:"8px 16px",fontSize:12,fontWeight:700,cursor:"pointer"}}>+ Add Item</button>

            {/* Totals Preview */}
            <div style={{background:"#f0f4ff",borderRadius:10,padding:"12px 14px",marginTop:12}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:4}}><span style={{color:C.muted}}>Taxable Value</span><span>{fmt2(totals.base)}</span></div>
              {isIGST
                ?<div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:4}}><span style={{color:C.muted}}>IGST</span><span>{fmt2(totals.igst)}</span></div>
                :<>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:4}}><span style={{color:C.muted}}>CGST</span><span>{fmt2(totals.cgst)}</span></div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:4}}><span style={{color:C.muted}}>SGST</span><span>{fmt2(totals.sgst)}</span></div>
                </>
              }
              {invType==="sez_nopayment"&&<div style={{fontSize:11,color:C.success,fontWeight:700}}>✅ GST = ₹0 (SEZ without payment — LUT/Bond)</div>}
              <div style={{display:"flex",justifyContent:"space-between",fontWeight:900,fontSize:17,borderTop:`2px solid ${C.dark}`,paddingTop:8,marginTop:4,color:C.dark}}>
                <span>Grand Total</span><span>{fmt2(grandTotal)}</span>
              </div>
              <div style={{fontSize:11,color:C.muted,marginTop:4,fontStyle:"italic"}}>Rupees {numberToWords(Math.floor(grandTotal))} Only</div>
            </div>

            <div style={{...IS.fld,marginTop:10}}><label style={IS.lbl}>Notes / Terms (optional)</label><input style={IS.inp} placeholder="e.g. Payment due within 7 days." value={note} onChange={e=>setNote(e.target.value)}/></div>

            {/* Declaration preview */}
            <div style={{background:"#f9fafb",borderRadius:8,padding:"10px 12px",marginTop:8,fontSize:11,color:"#374151",fontStyle:"italic",border:`1px solid ${C.border}`}}>
              <b>Declaration:</b> We declare that this invoice shows the actual price of the goods and services described and that all particulars are true and correct.
              {invType==="sez_nopayment"&&<> <b>SEZ Supply (LUT/Bond):</b> Without payment of IGST u/s 16(3)(a) of IGST Act, 2017.</>}
              {invType==="sez_payment"&&<> <b>SEZ Supply:</b> With payment of IGST u/s 16(3)(b) of IGST Act, 2017.</>}
              {invType==="deemed_export"&&<> <b>Deemed Export:</b> u/s 147 of CGST Act, 2017.</>}
              {rcm==="yes"&&<> <b>RCM:</b> Tax payable by recipient u/s 9(3)/9(4) of CGST Act, 2017.</>}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            <button style={IS.btnGreen} onClick={()=>setStep(2)}>👁️ Preview Invoice</button>
            <button style={IS.btnWA} onClick={sendWA}>📲 Send on WhatsApp</button>
            <button style={{...g.btn,flex:1,marginTop:6}} onClick={printInvoice}>🖨️ Print / PDF</button>
          </div>
        </div>
      )}

      {step===2 && (
        <div>
          {/* Edit hint banner */}
          <div style={{background:"#eff6ff",border:`1px solid #bfdbfe`,borderRadius:10,padding:"8px 14px",marginBottom:10,fontSize:12,color:C.primary,display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:16}}>✏️</span>
            <span><b>Inline Edit Mode</b> — Click any field on the invoice below to edit it directly. Changes reflect instantly.</span>
          </div>

          {/* Invoice Preview — Inline Editable */}
          <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:4,overflow:"hidden"}}>

            {/* Header */}
            <div style={{background:C.dark,padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div style={{color:"#fff",flex:1,marginRight:16}}>
                <div style={{fontSize:18,fontWeight:900,marginBottom:3}}>
                  <EditField value={biz.name} onChange={v=>setBiz({...biz,name:v})} placeholder="Business Name" textStyle={{fontSize:18,fontWeight:900,color:"#fff"}}/>
                </div>
                <div style={{fontSize:10,opacity:0.85,marginBottom:2}}>
                  GSTIN: <EditField value={biz.gstin} onChange={v=>setBiz({...biz,gstin:v})} placeholder="GSTIN" textStyle={{fontSize:10,color:"#fff"}}/>
                  {" | "}PAN: <EditField value={biz.pan} onChange={v=>setBiz({...biz,pan:v})} placeholder="PAN" textStyle={{fontSize:10,color:"#fff"}}/>
                </div>
                <div style={{fontSize:10,opacity:0.8,marginBottom:2}}>
                  <EditField value={biz.address} onChange={v=>setBiz({...biz,address:v})} placeholder="Address" textStyle={{fontSize:10,color:"#fff"}}/>{", "}
                  <EditField value={biz.city} onChange={v=>setBiz({...biz,city:v})} placeholder="City" textStyle={{fontSize:10,color:"#fff"}}/>{", "}
                  <EditField value={biz.state} onChange={v=>setBiz({...biz,state:v})} options={STATES} textStyle={{fontSize:10,color:"#fff"}}/>{" - "}
                  <EditField value={biz.pin} onChange={v=>setBiz({...biz,pin:v})} placeholder="PIN" textStyle={{fontSize:10,color:"#fff"}}/>
                </div>
                <div style={{fontSize:10,opacity:0.8}}>
                  📞 <EditField value={biz.phone} onChange={v=>setBiz({...biz,phone:v})} placeholder="Phone" textStyle={{fontSize:10,color:"#fff"}}/>
                  {" | ✉ "}<EditField value={biz.email} onChange={v=>setBiz({...biz,email:v})} placeholder="Email" textStyle={{fontSize:10,color:"#fff"}}/>
                </div>
              </div>
              <div style={{textAlign:"right",color:"#fff",flexShrink:0}}>
                <div style={{fontSize:20,fontWeight:900,color:"#93c5fd"}}>TAX INVOICE</div>
                <div style={{fontSize:11,marginTop:4,opacity:0.9}}>
                  No: <b><EditField value={invNo} onChange={setInvNo} textStyle={{fontSize:11,color:"#fff",fontWeight:700}}/></b>
                </div>
                <div style={{fontSize:11,opacity:0.9}}>
                  Date: <b><EditField value={invDate} onChange={setInvDate} type="date" textStyle={{fontSize:11,color:"#fff",fontWeight:700}}/></b>
                </div>
                <div style={{fontSize:10,opacity:0.8}}>
                  PO: <EditField value={poNumber} onChange={setPoNumber} placeholder="—" textStyle={{fontSize:10,color:"#fff"}}/>
                </div>
                <div style={{fontSize:10,opacity:0.8}}>
                  E-Way: <EditField value={ewayBill} onChange={setEwayBill} placeholder="—" textStyle={{fontSize:10,color:"#fff"}}/>
                </div>
              </div>
            </div>

            {/* Type/RCM/POS bar */}
            <div style={{background:"#f0f4ff",padding:"6px 16px",display:"flex",gap:16,fontSize:11,borderBottom:`1px solid ${C.border}`,flexWrap:"wrap",alignItems:"center"}}>
              <span><b>Type:</b> <EditField value={invType} onChange={setInvType} options={INVOICE_TYPES.map(t=>t.id)} textStyle={{fontSize:11,color:C.primary,fontWeight:700}}/></span>
              <span><b>RCM:</b> <EditField value={rcm} onChange={setRcm} options={["yes","no"]} textStyle={{fontSize:11,color:C.text}}/></span>
              <span><b>Place of Supply:</b> <EditField value={placeOfSupply} onChange={setPos} options={STATES} textStyle={{fontSize:11,color:C.text}}/></span>
              {isIGST&&<span style={{color:C.primary,fontWeight:700}}>⚡ IGST Applicable</span>}
            </div>

            {/* Bill To / Ship To / Bank — all editable */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",borderBottom:`1px solid ${C.border}`}}>
              {/* Bill To */}
              <div style={{padding:"10px 12px",borderRight:`1px solid ${C.border}`,fontSize:11}}>
                <div style={{fontSize:9,fontWeight:700,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>Bill To</div>
                <div style={{fontWeight:700,marginBottom:1}}><EditField value={billTo.name} onChange={v=>setBillTo({...billTo,name:v})} placeholder="Customer Name" textStyle={{fontWeight:700,fontSize:11}}/></div>
                <div style={{color:C.muted,marginBottom:1}}>GSTIN: <EditField value={billTo.gstin} onChange={v=>setBillTo({...billTo,gstin:v})} placeholder="GSTIN" textStyle={{fontSize:11,color:C.muted}}/></div>
                <div style={{color:C.muted,marginBottom:1}}><EditField value={billTo.address} onChange={v=>setBillTo({...billTo,address:v})} placeholder="Address" textStyle={{fontSize:11,color:C.muted}}/></div>
                <div style={{color:C.muted,marginBottom:1}}>
                  <EditField value={billTo.city} onChange={v=>setBillTo({...billTo,city:v})} placeholder="City" textStyle={{fontSize:11,color:C.muted}}/>{", "}
                  <EditField value={billTo.state} onChange={v=>setBillTo({...billTo,state:v})} options={STATES} textStyle={{fontSize:11,color:C.muted}}/>{" - "}
                  <EditField value={billTo.pin} onChange={v=>setBillTo({...billTo,pin:v})} placeholder="PIN" textStyle={{fontSize:11,color:C.muted}}/>
                </div>
                <div style={{color:C.muted}}>📞 <EditField value={billTo.phone} onChange={v=>setBillTo({...billTo,phone:v})} placeholder="Phone" textStyle={{fontSize:11,color:C.muted}}/></div>
              </div>
              {/* Ship To */}
              <div style={{padding:"10px 12px",borderRight:`1px solid ${C.border}`,fontSize:11}}>
                <div style={{fontSize:9,fontWeight:700,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>
                  Ship To
                  <span onClick={()=>setSameAsShip(!sameAsShip)} style={{marginLeft:6,fontWeight:600,color:sameAsShip?C.primary:C.muted,cursor:"pointer",fontSize:9,textTransform:"none",border:`1px solid ${sameAsShip?C.primary:C.border}`,borderRadius:4,padding:"1px 5px"}}>
                    {sameAsShip?"= Bill To":"≠ Bill To"}
                  </span>
                </div>
                {sameAsShip
                  ?<div style={{color:C.muted,fontStyle:"italic",fontSize:11}}>Same as Bill To</div>
                  :<>
                    <div style={{fontWeight:700,marginBottom:1}}><EditField value={shipTo.name} onChange={v=>setShipTo({...shipTo,name:v})} placeholder="Recipient Name" textStyle={{fontWeight:700,fontSize:11}}/></div>
                    <div style={{color:C.muted,marginBottom:1}}><EditField value={shipTo.address} onChange={v=>setShipTo({...shipTo,address:v})} placeholder="Address" textStyle={{fontSize:11,color:C.muted}}/></div>
                    <div style={{color:C.muted}}>
                      <EditField value={shipTo.city} onChange={v=>setShipTo({...shipTo,city:v})} placeholder="City" textStyle={{fontSize:11,color:C.muted}}/>{", "}
                      <EditField value={shipTo.state} onChange={v=>setShipTo({...shipTo,state:v})} options={STATES} textStyle={{fontSize:11,color:C.muted}}/>{" - "}
                      <EditField value={shipTo.pin} onChange={v=>setShipTo({...shipTo,pin:v})} placeholder="PIN" textStyle={{fontSize:11,color:C.muted}}/>
                    </div>
                  </>
                }
              </div>
              {/* Bank */}
              <div style={{padding:"10px 12px",fontSize:11}}>
                <div style={{fontSize:9,fontWeight:700,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>Bank / Payment</div>
                <div style={{color:C.muted,marginBottom:1}}>Bank: <EditField value={biz.bankName} onChange={v=>setBiz({...biz,bankName:v})} placeholder="Bank Name" textStyle={{fontSize:11,color:C.muted}}/></div>
                <div style={{color:C.muted,marginBottom:1}}>A/C: <EditField value={biz.accountNo} onChange={v=>setBiz({...biz,accountNo:v})} placeholder="Account No." textStyle={{fontSize:11,color:C.muted}}/></div>
                <div style={{color:C.muted,marginBottom:1}}>IFSC: <EditField value={biz.ifsc} onChange={v=>setBiz({...biz,ifsc:v})} placeholder="IFSC" textStyle={{fontSize:11,color:C.muted}}/></div>
                <div style={{color:C.muted}}>UPI: <EditField value={biz.upi} onChange={v=>setBiz({...biz,upi:v})} placeholder="UPI ID" textStyle={{fontSize:11,color:C.muted}}/></div>
              </div>
            </div>

            {/* Items Table — inline editable */}
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
              <thead>
                <tr style={{background:"#f9fafb",borderBottom:`2px solid ${C.dark}`}}>
                  {["#","Description","HSN","Qty","UQC","Rate (₹)",isIGST?"IGST":"CGST",isIGST?null:"SGST","Total (₹)"].filter(Boolean).map(h=>(
                    <th key={h} style={{padding:"7px 8px",textAlign:["Rate (₹)","IGST","CGST","SGST","Total (₹)"].includes(h)?"right":"left",fontSize:10,fontWeight:700,color:"#374151"}}>{h}</th>
                  ))}
                  <th style={{width:28}}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((it,i)=>{
                  const c=calcInvItem(it);
                  return(
                    <tr key={it.id} style={{borderBottom:`1px solid ${C.border}`,background:i%2===0?C.white:"#f9fafb"}}>
                      <td style={{padding:"6px 8px",color:C.muted,width:24}}>{i+1}</td>
                      <td style={{padding:"6px 8px",fontWeight:600}}>
                        <EditField value={it.name} onChange={v=>updateItem(it.id,"name",v)} placeholder="Item name" textStyle={{fontWeight:600,fontSize:11}}/>
                      </td>
                      <td style={{padding:"6px 8px",color:C.muted}}>
                        <EditField value={it.hsn} onChange={v=>updateItem(it.id,"hsn",v)} placeholder="HSN" textStyle={{fontSize:11,color:C.muted}}/>
                      </td>
                      <td style={{padding:"6px 8px",textAlign:"right"}}>
                        <EditField value={String(it.qty)} onChange={v=>updateItem(it.id,"qty",v)} type="number" textStyle={{fontSize:11}}/>
                      </td>
                      <td style={{padding:"6px 8px",color:C.muted}}>
                        <EditField value={it.uqc} onChange={v=>updateItem(it.id,"uqc",v)} options={UQC_LIST} textStyle={{fontSize:11,color:C.muted}}/>
                      </td>
                      <td style={{padding:"6px 8px",textAlign:"right"}}>
                        <EditField value={String(it.price)} onChange={v=>updateItem(it.id,"price",v)} type="number" placeholder="0" textStyle={{fontSize:11}}/>
                      </td>
                      {isIGST
                        ?<td style={{padding:"6px 8px",textAlign:"right"}}>
                            {fmt2(c.igst)}<br/>
                            <EditField value={String(it.tax)} onChange={v=>updateItem(it.id,"tax",Number(v))} options={["0","5","12","18","28"]} textStyle={{fontSize:9,color:C.muted}}/>%
                          </td>
                        :<>
                          <td style={{padding:"6px 8px",textAlign:"right"}}>
                            {fmt2(c.cgst)}<br/>
                            <EditField value={String(it.tax)} onChange={v=>updateItem(it.id,"tax",Number(v))} options={["0","5","12","18","28"]} textStyle={{fontSize:9,color:C.muted}}/>%
                          </td>
                          <td style={{padding:"6px 8px",textAlign:"right"}}>{fmt2(c.sgst)}<br/><span style={{fontSize:9,color:C.muted}}>{it.tax/2}%</span></td>
                        </>
                      }
                      <td style={{padding:"6px 8px",textAlign:"right",fontWeight:700}}>{fmt2(c.total)}</td>
                      <td style={{padding:"4px"}}>
                        {items.length>1&&<button onClick={()=>removeItem(it.id)} style={{background:"#fee2e2",border:"none",borderRadius:6,width:22,height:22,cursor:"pointer",color:C.danger,fontSize:11,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>}
                      </td>
                    </tr>
                  );
                })}
                {/* Add item row */}
                <tr>
                  <td colSpan={isIGST?8:9} style={{padding:"8px 8px"}}>
                    <button onClick={addItem} style={{background:C.light,color:C.primary,border:`1.5px dashed ${C.primary}`,borderRadius:6,padding:"5px 14px",fontSize:11,fontWeight:700,cursor:"pointer"}}>+ Add Item</button>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Totals */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 200px",borderTop:`2px solid ${C.border}`}}>
              <div style={{padding:"12px 14px",borderRight:`1px solid ${C.border}`,fontSize:11}}>
                <div style={{fontSize:9,fontWeight:700,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>GST Rate-wise Summary</div>
                <table style={{width:"100%",fontSize:10}}>
                  <thead><tr style={{color:C.muted}}><th style={{textAlign:"left",paddingBottom:3}}>Rate</th><th style={{textAlign:"right"}}>Taxable</th>{isIGST?<th style={{textAlign:"right"}}>IGST</th>:<><th style={{textAlign:"right"}}>CGST</th><th style={{textAlign:"right"}}>SGST</th></>}<th style={{textAlign:"right"}}>Total</th></tr></thead>
                  <tbody>
                    {[0,5,12,18,28].map(rate=>{
                      const ri=items.filter(it=>Number(it.tax)===rate);
                      if(!ri.length) return null;
                      const rb=ri.reduce((s,it)=>s+calcInvItem(it).base,0);
                      const rt=ri.reduce((s,it)=>s+calcInvItem(it).taxAmt,0);
                      return(<tr key={rate}><td style={{paddingBottom:2}}>{rate}%</td><td style={{textAlign:"right"}}>{fmt2(rb)}</td>{isIGST?<td style={{textAlign:"right"}}>{fmt2(rt)}</td>:<><td style={{textAlign:"right"}}>{fmt2(rt/2)}</td><td style={{textAlign:"right"}}>{fmt2(rt/2)}</td></>}<td style={{textAlign:"right",fontWeight:700}}>{fmt2(rt)}</td></tr>);
                    })}
                  </tbody>
                </table>
                {rcm==="yes"&&<div style={{marginTop:6,fontSize:10,color:"#b45309",background:"#fef9c3",padding:"3px 8px",borderRadius:4,fontWeight:700}}>⚠️ Tax payable on Reverse Charge</div>}
              </div>
              <div style={{padding:"12px 14px",fontSize:12}}>
                <div style={{fontSize:9,fontWeight:700,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Amount Summary</div>
                {[
                  ["Taxable Value",fmt2(totals.base)],
                  isIGST?["IGST",fmt2(totals.igst)]:["CGST",fmt2(totals.cgst)],
                  ...(!isIGST?[["SGST",fmt2(totals.sgst)]]:[]),
                  ["Total GST",fmt2(totals.tax)],
                ].map(([k,v])=>(
                  <div key={k} style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{color:C.muted}}>{k}</span><span>{v}</span></div>
                ))}
                {invType==="sez_nopayment"&&<div style={{fontSize:11,color:C.success,fontWeight:700}}>GST = ₹0 (LUT/Bond)</div>}
                <div style={{display:"flex",justifyContent:"space-between",fontWeight:900,fontSize:15,borderTop:`2px solid ${C.dark}`,paddingTop:6,marginTop:4,color:C.dark}}>
                  <span>Grand Total</span><span>{fmt2(grandTotal)}</span>
                </div>
                <div style={{fontSize:9,color:C.muted,fontStyle:"italic",marginTop:4}}>Rupees {numberToWords(Math.floor(grandTotal))} Only</div>
              </div>
            </div>

            {/* Footer */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",borderTop:`1px solid ${C.border}`}}>
              <div style={{padding:"10px 14px",borderRight:`1px solid ${C.border}`,fontSize:11}}>
                <div style={{marginBottom:4}}>
                  💳 UPI: <EditField value={biz.upi} onChange={v=>setBiz({...biz,upi:v})} placeholder="UPI ID" textStyle={{fontSize:11,color:C.success,fontWeight:700}}/>
                </div>
                <div style={{fontStyle:"italic",color:"#374151"}}>
                  📝 <EditField value={note} onChange={setNote} placeholder="Add notes / terms..." textStyle={{fontSize:11,color:"#374151",fontStyle:"italic"}} multiline/>
                </div>
              </div>
              <div style={{padding:"10px 14px",textAlign:"center",fontSize:11}}>
                <div style={{color:C.muted,marginBottom:28,fontSize:10}}>
                  For <EditField value={biz.name} onChange={v=>setBiz({...biz,name:v})} placeholder="Business Name" textStyle={{fontSize:10,color:C.muted}}/>
                </div>
                <div style={{borderTop:`1px solid ${C.text}`,paddingTop:3,fontWeight:700,fontSize:11}}>Authorised Signatory</div>
              </div>
            </div>

            {/* Declaration */}
            <div style={{background:"#f9fafb",borderTop:`1px solid ${C.border}`,padding:"10px 14px",fontSize:10,color:"#374151",fontStyle:"italic",lineHeight:1.6}}>
              <b>Declaration:</b> We declare that this invoice shows the actual price of the goods and services described and that all particulars are true and correct to the best of our knowledge.
              {invType==="deemed_export"&&<> <b>Deemed Export:</b> Supply under Section 147 of CGST Act, 2017.</>}
              {invType==="sez_payment"&&<> <b>SEZ Supply:</b> With payment of IGST u/s 16(3)(b) of IGST Act, 2017.</>}
              {invType==="sez_nopayment"&&<> <b>SEZ Supply (LUT/Bond):</b> Without payment of IGST u/s 16(3)(a) of IGST Act, 2017.</>}
              {rcm==="yes"&&<> <b>RCM:</b> Tax payable by recipient u/s 9(3)/9(4) of CGST Act, 2017.</>}
            </div>

            <div style={{background:C.dark,padding:"6px 16px",textAlign:"center",fontSize:9,color:"rgba(255,255,255,0.6)"}}>
              Generated by <b style={{color:"#93c5fd"}}>TaxGyaan.in</b> — India's Free CA Finance Portal | Computer generated invoice | No signature required
            </div>
          </div>

          <div style={{display:"flex",gap:10,marginTop:10,flexWrap:"wrap"}}>
            <button style={{background:"#6b7280",color:"#fff",border:"none",borderRadius:10,padding:"12px 18px",fontSize:13,fontWeight:700,cursor:"pointer",flex:1,marginTop:6}} onClick={()=>setStep(1)}>← Back to Form</button>
            <button style={{background:"#25D366",color:"#fff",border:"none",borderRadius:10,padding:"12px 18px",fontSize:13,fontWeight:700,cursor:"pointer",flex:1,marginTop:6}} onClick={sendWA}>📲 WhatsApp</button>
            <button style={{...g.btn,flex:1}} onClick={printInvoice}>🖨️ Print / PDF</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── EMI CALCULATOR ──
function EMICalc(){
  const [loanAmt,    setLoanAmt]    = useState("2000000");
  const [rate,       setRate]       = useState("8.5");
  const [tenure,     setTenure]     = useState("20");
  const [tenureType, setTenureType] = useState("years");
  const [startMonth, setStartMonth] = useState(()=>{
    const d=new Date();
    return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0");
  });
  const [prepay,      setPrepay]      = useState("");
  const [prepayMonth, setPrepayMonth] = useState("12");
  const [tab,         setTab]         = useState("summary");
  const [schedView,   setSchedView]   = useState("monthly");
  const [schedPage,   setSchedPage]   = useState(0);
  const ROWS_PER_PAGE = 12;

  const P = parseFloat(loanAmt)||0;
  const r = (parseFloat(rate)||0)/100/12;
  const nYears = parseFloat(tenure)||0;
  const N = tenureType==="years" ? nYears*12 : nYears;

  const emi = useMemo(()=>{
    if(!P||!r||!N) return 0;
    return P*r*Math.pow(1+r,N)/(Math.pow(1+r,N)-1);
  },[P,r,N]);

  const totalPayment  = emi*N;
  const totalInterest = totalPayment - P;
  const fixedPrincipalPerMonth = N>0 ? P/N : 0;

  // Get calendar date label for month index (1-based)
  const getMonthLabel = (idx) => {
    if(!startMonth) return "Month "+idx;
    const parts = startMonth.split("-").map(Number);
    const sy=parts[0], sm=parts[1];
    const d = new Date(sy, sm-1+idx-1, 1);
    return d.toLocaleDateString("en-IN",{month:"short",year:"numeric"});
  };

  // Get FY label for a given calendar month index (1-based)
  // FY runs Apr–Mar. e.g. Apr 2026 – Mar 2027 = FY 2026-27
  const getFYLabel = (idx) => {
    if(!startMonth) return "Year "+Math.ceil(idx/12);
    const parts = startMonth.split("-").map(Number);
    const sy=parts[0], sm=parts[1];
    const d = new Date(sy, sm-1+idx-1, 1);
    const mo = d.getMonth(); // 0=Jan ... 3=Apr
    const yr = d.getFullYear();
    // FY starts in April (month index 3)
    const fyStart = mo >= 3 ? yr : yr-1;
    return "FY "+fyStart+"-"+(String(fyStart+1).slice(2));
  };

  // Build EMI schedule (reducing balance)
  const emiSchedule = useMemo(()=>{
    if(!emi||!P||!r) return [];
    let bal=P, rows=[];
    for(let i=1;i<=N;i++){
      const intPart  = bal*r;
      const prinPart = emi - intPart;
      bal = Math.max(0, bal-prinPart);
      rows.push({ month:i, label:getMonthLabel(i), fy:getFYLabel(i), payment:emi, principal:prinPart, interest:intPart, balance:bal });
    }
    return rows;
  },[emi,P,r,N,startMonth]);

  // Build Fixed Principal schedule
  const fpSchedule = useMemo(()=>{
    if(!P||!r||!N) return [];
    let bal=P, rows=[];
    for(let i=1;i<=N;i++){
      const intPart  = bal*r;
      const prinPart = fixedPrincipalPerMonth;
      const payment  = prinPart+intPart;
      bal = Math.max(0, bal-prinPart);
      rows.push({ month:i, label:getMonthLabel(i), fy:getFYLabel(i), payment, principal:prinPart, interest:intPart, balance:bal });
    }
    return rows;
  },[P,r,N,startMonth]);

  const fpTotalInterest = fpSchedule.reduce((s,row)=>s+row.interest,0);
  const fpTotalPayment  = P + fpTotalInterest;
  const fpFirstEMI      = fpSchedule[0]?.payment||0;
  const fpLastEMI       = fpSchedule[fpSchedule.length-1]?.payment||0;

  // Group by FY for yearly view
  const groupByFY = (schedule) => {
    const map = {};
    const order = [];
    schedule.forEach(row => {
      if(!map[row.fy]){ map[row.fy]={fy:row.fy, principal:0, interest:0, payment:0, balance:0, months:0}; order.push(row.fy); }
      map[row.fy].principal += row.principal;
      map[row.fy].interest  += row.interest;
      map[row.fy].payment   += row.payment;
      map[row.fy].balance    = row.balance;
      map[row.fy].months    += 1;
    });
    return order.map(fy=>map[fy]);
  };

  const emiFY = useMemo(()=>groupByFY(emiSchedule),[emiSchedule]);
  const fpFY  = useMemo(()=>groupByFY(fpSchedule), [fpSchedule]);

  // Prepayment on EMI schedule
  const prepayAmt = parseFloat(prepay)||0;
  const prepayMo  = parseInt(prepayMonth)||1;
  const prepayResult = useMemo(()=>{
    if(!prepayAmt||!emi||!P||!r) return null;
    let bal=P, mo=0, totalInt=0;
    for(let i=1;i<=N;i++){
      const intPart=bal*r, prinPart=emi-intPart;
      bal=Math.max(0,bal-prinPart);
      totalInt+=intPart; mo=i;
      if(i===prepayMo) bal=Math.max(0,bal-prepayAmt);
      if(bal<=0) break;
    }
    return { newMonths:mo, savedMonths:N-mo, savedInt:totalInterest-totalInt, newTotalInt:totalInt };
  },[prepayAmt,prepayMo,emi,P,r,N,totalInterest]);

  const emiPages = Math.ceil(emiSchedule.length/ROWS_PER_PAGE);
  const fpPages  = Math.ceil(fpSchedule.length/ROWS_PER_PAGE);

  // Shared table style
  const TH = {padding:"8px 10px",fontWeight:700,fontSize:10};
  const TD = {padding:"7px 10px",fontSize:11};

  const SchedTable = ({schedule, fyData, totalInt, totalPay, label, color}) => {
    const [pg, setPg] = useState(0);
    const pages = Math.ceil(schedule.length/ROWS_PER_PAGE);
    const visible = schedView==="monthly"
      ? schedule.slice(pg*ROWS_PER_PAGE,(pg+1)*ROWS_PER_PAGE)
      : fyData;

    return (
      <div style={{...g.card, borderTop:"4px solid "+color, marginBottom:14}}>
        <div style={{fontWeight:800,color:color,fontSize:13,marginBottom:8}}>{label}</div>
        <div style={{overflowX:"auto"}}>
          {schedView==="monthly" ? (
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
              <thead>
                <tr style={{background:C.dark,color:"#fff"}}>
                  <th style={{...TH,textAlign:"left"}}>Month</th>
                  <th style={{...TH,textAlign:"right"}}>Payment (₹)</th>
                  <th style={{...TH,textAlign:"right",color:"#93c5fd"}}>Principal (₹)</th>
                  <th style={{...TH,textAlign:"right",color:"#fca5a5"}}>Interest (₹)</th>
                  <th style={{...TH,textAlign:"right"}}>Balance (₹)</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((row,i)=>(
                  <tr key={row.month} style={{background:i%2===0?C.white:"#f9fafb",borderBottom:"1px solid "+C.border}}>
                    <td style={{...TD,fontWeight:600,color:C.dark}}>
                      {row.label}
                      <span style={{fontSize:9,color:C.muted,display:"block"}}>Mo {row.month} • {row.fy}</span>
                    </td>
                    <td style={{...TD,textAlign:"right",fontWeight:600}}>{fmt(Math.round(row.payment))}</td>
                    <td style={{...TD,textAlign:"right",color:C.primary,fontWeight:600}}>{fmt(Math.round(row.principal))}</td>
                    <td style={{...TD,textAlign:"right",color:"#ef4444",fontWeight:600}}>{fmt(Math.round(row.interest))}</td>
                    <td style={{...TD,textAlign:"right",color:C.muted}}>{fmtL(Math.round(row.balance))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
              <thead>
                <tr style={{background:C.dark,color:"#fff"}}>
                  <th style={{...TH,textAlign:"left"}}>Financial Year</th>
                  <th style={{...TH,textAlign:"right"}}>Months</th>
                  <th style={{...TH,textAlign:"right"}}>Total Paid (₹)</th>
                  <th style={{...TH,textAlign:"right",color:"#93c5fd"}}>Principal (₹)</th>
                  <th style={{...TH,textAlign:"right",color:"#fca5a5"}}>Interest (₹)</th>
                  <th style={{...TH,textAlign:"right"}}>Balance (₹)</th>
                </tr>
              </thead>
              <tbody>
                {fyData.map((fy,i)=>(
                  <tr key={fy.fy} style={{background:i%2===0?C.white:"#f9fafb",borderBottom:"1px solid "+C.border}}>
                    <td style={{...TD,fontWeight:700,color:C.dark}}>{fy.fy}</td>
                    <td style={{...TD,textAlign:"right",color:C.muted}}>{fy.months}</td>
                    <td style={{...TD,textAlign:"right",fontWeight:600}}>{fmtL(Math.round(fy.payment))}</td>
                    <td style={{...TD,textAlign:"right",color:C.primary,fontWeight:600}}>{fmtL(Math.round(fy.principal))}</td>
                    <td style={{...TD,textAlign:"right",color:"#ef4444",fontWeight:600}}>{fmtL(Math.round(fy.interest))}</td>
                    <td style={{...TD,textAlign:"right",color:C.muted}}>{fmtL(Math.round(fy.balance))}</td>
                  </tr>
                ))}
                <tr style={{background:"#f0f4ff",fontWeight:800,borderTop:"2px solid "+C.dark}}>
                  <td style={{...TD}}>Total</td>
                  <td style={{...TD,textAlign:"right",color:C.muted}}>{N}</td>
                  <td style={{...TD,textAlign:"right"}}>{fmtL(Math.round(totalPay))}</td>
                  <td style={{...TD,textAlign:"right",color:C.primary}}>{fmtL(P)}</td>
                  <td style={{...TD,textAlign:"right",color:"#ef4444"}}>{fmtL(Math.round(totalInt))}</td>
                  <td style={{...TD,textAlign:"right",color:C.muted}}>—</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
        {schedView==="monthly" && pages>1 && (
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:10,gap:6,flexWrap:"wrap"}}>
            <button onClick={()=>setPg(p=>Math.max(0,p-1))} disabled={pg===0}
              style={{padding:"6px 14px",borderRadius:8,border:"1px solid "+C.border,background:pg===0?"#f3f4f6":C.primary,color:pg===0?C.muted:"#fff",cursor:pg===0?"default":"pointer",fontWeight:600,fontSize:12}}>
              Prev
            </button>
            <span style={{fontSize:11,color:C.muted}}>Page {pg+1} of {pages}</span>
            <button onClick={()=>setPg(p=>Math.min(pages-1,p+1))} disabled={pg===pages-1}
              style={{padding:"6px 14px",borderRadius:8,border:"1px solid "+C.border,background:pg===pages-1?"#f3f4f6":C.primary,color:pg===pages-1?C.muted:"#fff",cursor:pg===pages-1?"default":"pointer",fontWeight:600,fontSize:12}}>
              Next
            </button>
          </div>
        )}
      </div>
    );
  };

  return(
    <div>
      <div style={g.adSlot}>Advertisement</div>
      <h1 style={g.cardTitle}>🏦 EMI Calculator</h1>
      <p style={g.cardSub}>EMI Method vs Fixed Principal • FY-wise Schedule • Prepayment Savings</p>

      <div style={g.card}>
        <div style={g.fld}>
          <label style={g.lbl}>Loan Amount (₹)</label>
          <input style={g.inp} type="number" placeholder="e.g. 2000000" value={loanAmt} onChange={e=>setLoanAmt(e.target.value)}/>
          <div style={{display:"flex",gap:6,marginTop:6,flexWrap:"wrap"}}>
            {[500000,1000000,2000000,5000000,10000000].map(v=>(
              <button key={v} onClick={()=>setLoanAmt(String(v))}
                style={{padding:"3px 10px",borderRadius:20,border:"1px solid "+C.border,background:C.light,color:C.primary,fontSize:10,fontWeight:600,cursor:"pointer"}}>
                {fmtL(v)}
              </button>
            ))}
          </div>
        </div>
        <div style={g.row3}>
          <div style={g.fld}>
            <label style={g.lbl}>Interest Rate (% p.a.)</label>
            <input style={g.inp} type="number" step="0.1" placeholder="8.5" value={rate} onChange={e=>setRate(e.target.value)}/>
            <div style={{display:"flex",gap:4,marginTop:6,flexWrap:"wrap"}}>
              {["7","8.5","9","10","12","14"].map(v=>(
                <button key={v} onClick={()=>setRate(v)}
                  style={{padding:"3px 7px",borderRadius:20,border:"1px solid "+C.border,background:C.light,color:C.primary,fontSize:10,fontWeight:600,cursor:"pointer"}}>
                  {v}%
                </button>
              ))}
            </div>
          </div>
          <div style={g.fld}>
            <label style={g.lbl}>Tenure</label>
            <div style={{display:"flex",gap:6}}>
              <input style={{...g.inp,flex:1}} type="number" placeholder="20" value={tenure} onChange={e=>setTenure(e.target.value)}/>
              <select style={{...g.sel,width:"auto"}} value={tenureType} onChange={e=>setTenureType(e.target.value)}>
                <option value="years">Yrs</option>
                <option value="months">Mo</option>
              </select>
            </div>
            <div style={{display:"flex",gap:4,marginTop:6,flexWrap:"wrap"}}>
              {["5","10","15","20","25","30"].map(v=>(
                <button key={v} onClick={()=>{setTenure(v);setTenureType("years");}}
                  style={{padding:"3px 7px",borderRadius:20,border:"1px solid "+C.border,background:C.light,color:C.primary,fontSize:10,fontWeight:600,cursor:"pointer"}}>
                  {v}Y
                </button>
              ))}
            </div>
          </div>
          <div style={g.fld}>
            <label style={g.lbl}>Loan Start Month</label>
            <input style={g.inp} type="month" value={startMonth} onChange={e=>{setStartMonth(e.target.value);setSchedPage(0);}}/>
            <div style={{fontSize:10,color:C.muted,marginTop:4}}>
              Ends: {N>0&&startMonth ? getMonthLabel(N) : "—"}
            </div>
          </div>
        </div>
      </div>

      {emi>0&&(
        <div>
          {/* EMI Banner */}
          <div style={{background:"linear-gradient(135deg,"+C.dark+","+C.primary+")",borderRadius:14,padding:18,color:"#fff",marginBottom:14}}>
            <div style={{opacity:0.8,fontSize:12,marginBottom:4}}>Monthly EMI (Reducing Balance)</div>
            <div style={{fontWeight:900,fontSize:32,letterSpacing:"-1px"}}>{fmt(Math.round(emi))}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginTop:14}}>
              {[["Principal",fmtL(P)],["Total Interest",fmtL(totalInterest)],["Total Payment",fmtL(totalPayment)]].map(([k,v])=>(
                <div key={k} style={{background:"rgba(255,255,255,0.1)",borderRadius:10,padding:"10px 12px",textAlign:"center"}}>
                  <div style={{fontSize:10,opacity:0.8,marginBottom:4}}>{k}</div>
                  <div style={{fontWeight:800,fontSize:13}}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div style={{display:"flex",gap:0,marginBottom:12,borderBottom:"2px solid "+C.border,overflowX:"auto"}}>
            {[["summary","📊 Summary"],["schedule","📋 Schedule"],["compare","⚖️ Compare"],["prepayment","💰 Prepayment"]].map(([id,label])=>(
              <button key={id} onClick={()=>{setTab(id);setSchedPage(0);}}
                style={{padding:"9px 12px",border:"none",background:"none",cursor:"pointer",
                  fontSize:11,fontWeight:700,color:tab===id?C.primary:C.muted,
                  borderBottom:"3px solid "+(tab===id?C.primary:"transparent"),marginBottom:-2,whiteSpace:"nowrap"}}>
                {label}
              </button>
            ))}
          </div>

          {/* SUMMARY */}
          {tab==="summary"&&(
            <div>
              <div style={g.card}>
                <div style={{fontWeight:700,color:C.dark,marginBottom:12,fontSize:13}}>📋 Loan Summary</div>
                {[
                  ["Loan Amount",            fmtL(P)],
                  ["Monthly EMI",            fmt(Math.round(emi))],
                  ["Total Interest (EMI)",   fmtL(Math.round(totalInterest))],
                  ["Total Payment (EMI)",    fmtL(Math.round(totalPayment))],
                  ["1st Month FP Payment",   fmt(Math.round(fpFirstEMI))],
                  ["Total Interest (FP)",    fmtL(Math.round(fpTotalInterest))],
                  ["Loan Start",             getMonthLabel(1)+" ("+getFYLabel(1)+")"],
                  ["Loan End",               getMonthLabel(N)],
                  ["Interest % of Total",    ((totalInterest/totalPayment)*100).toFixed(1)+"%"],
                ].map(([k,v])=>(
                  <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid "+C.border,fontSize:13}}>
                    <span style={{color:C.muted}}>{k}</span>
                    <span style={{fontWeight:700,color:C.dark}}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={g.note}>💡 <b>CA Tip:</b> Fixed Principal method saves {fmtL(Math.round(totalInterest-fpTotalInterest))} in interest vs EMI method. Prepaying in FY 1-2 gives the highest savings!</div>
              <div style={g.adSlot}>Advertisement</div>
            </div>
          )}

          {/* SCHEDULE — both tables */}
          {tab==="schedule"&&(
            <div>
              <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12,gap:6}}>
                {[["monthly","Monthly"],["yearly","FY-wise"]].map(([v,l])=>(
                  <button key={v} onClick={()=>{setSchedView(v);setSchedPage(0);}}
                    style={{padding:"6px 16px",borderRadius:20,border:"1.5px solid "+(schedView===v?C.primary:C.border),
                      background:schedView===v?C.primary:C.white,color:schedView===v?"#fff":C.muted,
                      fontSize:11,fontWeight:700,cursor:"pointer"}}>
                    {l}
                  </button>
                ))}
              </div>
              <SchedTable schedule={emiSchedule} fyData={emiFY} totalInt={totalInterest} totalPay={totalPayment} label="📊 EMI Method (Reducing Balance) — Fixed monthly payment" color={C.primary}/>
              <SchedTable schedule={fpSchedule}  fyData={fpFY}  totalInt={fpTotalInterest} totalPay={fpTotalPayment} label="📉 Fixed Principal Method — Reducing monthly payment" color={C.success}/>
              <div style={g.note}>🔵 Principal &nbsp;|&nbsp; 🔴 Interest &nbsp;|&nbsp; FY = April to March (Indian Financial Year)</div>
            </div>
          )}

          {/* COMPARE */}
          {tab==="compare"&&(
            <div>
              <div style={g.row2}>
                <div style={{...g.card,borderTop:"4px solid "+C.primary,marginBottom:0}}>
                  <div style={{fontWeight:800,color:C.primary,fontSize:13,marginBottom:10}}>📊 EMI Method</div>
                  <div style={{fontSize:11,color:C.muted,marginBottom:8}}>Fixed payment every month</div>
                  {[
                    ["Fixed Monthly EMI",  fmt(Math.round(emi))],
                    ["Total Interest",     fmtL(Math.round(totalInterest))],
                    ["Total Payment",      fmtL(Math.round(totalPayment))],
                    ["Loan End",           getMonthLabel(N)],
                  ].map(([k,v])=>(
                    <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid "+C.border,fontSize:12}}>
                      <span style={{color:C.muted}}>{k}</span><span style={{fontWeight:700}}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{...g.card,borderTop:"4px solid "+C.success,marginBottom:0}}>
                  <div style={{fontWeight:800,color:C.success,fontSize:13,marginBottom:10}}>📉 Fixed Principal</div>
                  <div style={{fontSize:11,color:C.muted,marginBottom:8}}>Fixed principal, reducing interest</div>
                  {[
                    ["1st Month Payment",  fmt(Math.round(fpFirstEMI))],
                    ["Last Month Payment", fmt(Math.round(fpLastEMI))],
                    ["Total Interest",     fmtL(Math.round(fpTotalInterest))],
                    ["Total Payment",      fmtL(Math.round(fpTotalPayment))],
                  ].map(([k,v])=>(
                    <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid "+C.border,fontSize:12}}>
                      <span style={{color:C.muted}}>{k}</span><span style={{fontWeight:700}}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{background:"linear-gradient(135deg,"+C.success+",#065f46)",borderRadius:12,padding:16,color:"#fff",marginTop:10,textAlign:"center"}}>
                <div style={{fontSize:12,opacity:0.85,marginBottom:4}}>Fixed Principal saves you</div>
                <div style={{fontWeight:900,fontSize:26}}>{fmtL(Math.round(totalInterest-fpTotalInterest))}</div>
                <div style={{fontSize:13,opacity:0.9,marginTop:4}}>in total interest over the full loan tenure</div>
              </div>
              <div style={{...g.card,marginTop:14}}>
                <div style={{fontWeight:700,color:C.dark,marginBottom:12,fontSize:13}}>📋 FY-wise Interest Comparison</div>
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                    <thead>
                      <tr style={{background:C.dark,color:"#fff"}}>
                        <th style={{padding:"8px 10px",textAlign:"left",fontSize:10}}>Financial Year</th>
                        <th style={{padding:"8px 10px",textAlign:"right",fontSize:10,color:"#93c5fd"}}>EMI Interest</th>
                        <th style={{padding:"8px 10px",textAlign:"right",fontSize:10,color:"#93c5fd"}}>EMI Balance</th>
                        <th style={{padding:"8px 10px",textAlign:"right",fontSize:10,color:"#86efac"}}>FP Interest</th>
                        <th style={{padding:"8px 10px",textAlign:"right",fontSize:10,color:"#86efac"}}>FP Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {emiFY.map((ey,i)=>{
                        const fy=fpFY[i];
                        return(
                          <tr key={ey.fy} style={{background:i%2===0?C.white:"#f9fafb",borderBottom:"1px solid "+C.border}}>
                            <td style={{padding:"7px 10px",fontWeight:700}}>{ey.fy}</td>
                            <td style={{padding:"7px 10px",textAlign:"right",color:"#ef4444"}}>{fmtL(Math.round(ey.interest))}</td>
                            <td style={{padding:"7px 10px",textAlign:"right",color:C.muted}}>{fmtL(Math.round(ey.balance))}</td>
                            <td style={{padding:"7px 10px",textAlign:"right",color:"#16a34a"}}>{fy?fmtL(Math.round(fy.interest)):"—"}</td>
                            <td style={{padding:"7px 10px",textAlign:"right",color:C.muted}}>{fy?fmtL(Math.round(fy.balance)):"—"}</td>
                          </tr>
                        );
                      })}
                      <tr style={{background:"#f0f4ff",fontWeight:800,borderTop:"2px solid "+C.dark}}>
                        <td style={{padding:"8px 10px"}}>Total</td>
                        <td style={{padding:"8px 10px",textAlign:"right",color:"#ef4444"}}>{fmtL(Math.round(totalInterest))}</td>
                        <td style={{padding:"8px 10px",textAlign:"right"}}>—</td>
                        <td style={{padding:"8px 10px",textAlign:"right",color:"#16a34a"}}>{fmtL(Math.round(fpTotalInterest))}</td>
                        <td style={{padding:"8px 10px",textAlign:"right"}}>—</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div style={g.note}>
                💡 <b>Which to choose?</b> EMI Method: same payment every month — easy to budget, most banks default to this. Fixed Principal: higher payments early but saves significant interest — ideal if you can afford higher outflow initially.
              </div>
              <div style={g.adSlot}>Advertisement</div>
            </div>
          )}

          {/* PREPAYMENT */}
          {tab==="prepayment"&&(
            <div>
              <div style={g.card}>
                <div style={{fontWeight:700,color:C.dark,marginBottom:10,fontSize:13}}>💰 Prepayment / Part-Payment Calculator</div>
                <div style={g.row2}>
                  <div style={g.fld}>
                    <label style={g.lbl}>One-time Prepayment Amount (₹)</label>
                    <input style={g.inp} type="number" placeholder="e.g. 200000" value={prepay} onChange={e=>setPrepay(e.target.value)}/>
                    <div style={{display:"flex",gap:4,marginTop:6,flexWrap:"wrap"}}>
                      {[50000,100000,200000,500000].map(v=>(
                        <button key={v} onClick={()=>setPrepay(String(v))}
                          style={{padding:"3px 8px",borderRadius:20,border:"1px solid "+C.border,background:C.light,color:C.primary,fontSize:10,fontWeight:600,cursor:"pointer"}}>
                          {fmtL(v)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={g.fld}>
                    <label style={g.lbl}>Prepay After Month No.</label>
                    <input style={g.inp} type="number" min="1" max={N} placeholder="e.g. 12" value={prepayMonth} onChange={e=>setPrepayMonth(e.target.value)}/>
                    <div style={{fontSize:11,color:C.muted,marginTop:4}}>
                      After: {getMonthLabel(parseInt(prepayMonth)||1)} ({getFYLabel(parseInt(prepayMonth)||1)})
                    </div>
                    <div style={{display:"flex",gap:4,marginTop:6,flexWrap:"wrap"}}>
                      {["6","12","24","36","60"].map(v=>(
                        <button key={v} onClick={()=>setPrepayMonth(v)}
                          style={{padding:"3px 8px",borderRadius:20,border:"1px solid "+C.border,background:C.light,color:C.primary,fontSize:10,fontWeight:600,cursor:"pointer"}}>
                          Mo {v}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                {prepayResult&&(
                  <div>
                    <div style={g.row2}>
                      <div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:12,padding:14}}>
                        <div style={{fontSize:11,color:"#991b1b",fontWeight:700,marginBottom:6}}>Without Prepayment</div>
                        <div style={{fontSize:12,color:C.muted,marginBottom:2}}>Total months</div>
                        <div style={{fontWeight:900,fontSize:18,color:C.dark,marginBottom:4}}>{N}</div>
                        <div style={{fontSize:12,color:C.muted,marginBottom:2}}>Loan closes</div>
                        <div style={{fontWeight:700,fontSize:12,color:C.dark,marginBottom:4}}>{getMonthLabel(N)}</div>
                        <div style={{fontSize:12,color:C.muted,marginBottom:2}}>Total interest</div>
                        <div style={{fontWeight:800,fontSize:14,color:"#ef4444"}}>{fmtL(Math.round(totalInterest))}</div>
                      </div>
                      <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:12,padding:14}}>
                        <div style={{fontSize:11,color:"#15803d",fontWeight:700,marginBottom:6}}>With Prepayment</div>
                        <div style={{fontSize:12,color:C.muted,marginBottom:2}}>Total months</div>
                        <div style={{fontWeight:900,fontSize:18,color:C.dark,marginBottom:4}}>{prepayResult.newMonths}</div>
                        <div style={{fontSize:12,color:C.muted,marginBottom:2}}>Loan closes</div>
                        <div style={{fontWeight:700,fontSize:12,color:C.dark,marginBottom:4}}>{getMonthLabel(prepayResult.newMonths)}</div>
                        <div style={{fontSize:12,color:C.muted,marginBottom:2}}>Total interest</div>
                        <div style={{fontWeight:800,fontSize:14,color:C.success}}>{fmtL(Math.round(prepayResult.newTotalInt))}</div>
                      </div>
                    </div>
                    <div style={{background:"linear-gradient(135deg,"+C.success+",#065f46)",borderRadius:12,padding:16,color:"#fff",marginTop:10,textAlign:"center"}}>
                      <div style={{fontSize:12,opacity:0.85,marginBottom:4}}>By prepaying {fmtL(prepayAmt)} after {getMonthLabel(prepayMo)}</div>
                      <div style={{fontWeight:900,fontSize:24}}>You save {fmtL(Math.abs(Math.round(prepayResult.savedInt)))}</div>
                      <div style={{fontSize:13,opacity:0.9,marginTop:4}}>
                        Loan closes {prepayResult.savedMonths} months earlier
                        {prepayResult.savedMonths>=12?" ("+Math.floor(prepayResult.savedMonths/12)+"Y "+prepayResult.savedMonths%12+"M sooner!)":"!"}
                      </div>
                    </div>
                    <div style={g.note}>💡 <b>CA Tip:</b> Prepaying in FY 1 or 2 saves maximum interest — your outstanding principal is highest in the early years!</div>
                  </div>
                )}
                {!prepay&&(
                  <div style={{fontSize:12,color:C.muted,padding:"14px",background:"#f9fafb",borderRadius:8,textAlign:"center",marginTop:8}}>
                    Enter prepayment amount and month to see your savings
                  </div>
                )}
              </div>
              <div style={g.adSlot}>Advertisement</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── MIS & COSTING ──
function MISCosting(){
  const [tab,setTab]=useState("costing");
  const [prod,setProd]=useState(""), [rm,setRm]=useState(""), [lb,setLb]=useState(""), [oh,setOh]=useState(""), [units,setUnits]=useState("1"), [wastage,setWastage]=useState("5"), [margin,setMargin]=useState("20"), [costResult,setCostResult]=useState(null);
  const [fc,setFc]=useState(""), [vc,setVc]=useState(""), [sp,setSp]=useState(""), [beResult,setBeResult]=useState(null);

  const calcCosting=()=>{
    const rmv=parseFloat(rm)||0,lbv=parseFloat(lb)||0,ohv=parseFloat(oh)||0,u=parseFloat(units)||1,w=parseFloat(wastage)/100,m=parseFloat(margin)/100;
    const direct=(rmv+lbv)/u,waste=direct*w,overPU=ohv/u,cop=direct+waste+overPU,profit=cop*m,sell=cop+profit,gst=sell*0.18,mrp=sell+gst;
    setCostResult({direct,waste,overPU,cop,profit,sell,gst,mrp});
  };
  const calcBE=()=>{
    const fcv=parseFloat(fc)||0,vcv=parseFloat(vc)||0,spv=parseFloat(sp)||0;
    if(spv<=vcv) return alert("Selling price must be greater than variable cost");
    const contrib=spv-vcv,bepU=Math.ceil(fcv/contrib),bepR=bepU*spv,pvR=((contrib/spv)*100).toFixed(1);
    setBeResult({contrib,bepU,bepR,pvR});
  };

  return(
    <div>
      <div style={g.adSlot}>📢 Advertisement</div>
      <h1 style={g.cardTitle}>📊 MIS & Costing Tools</h1>
      <p style={g.cardSub}>Product Costing • Break-Even Analysis — for SMEs & Manufacturers</p>
      <div style={{display:"flex",gap:8,marginBottom:12}}>
        {[["costing","⚙️ Product Costing"],["breakeven","📊 Break-Even Analysis"]].map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)} style={{flex:1,padding:"10px",borderRadius:9,border:`2px solid ${tab===id?C.primary:C.border}`,background:tab===id?C.light:C.white,color:tab===id?C.primary:C.muted,fontWeight:700,cursor:"pointer",fontSize:12}}>{label}</button>
        ))}
      </div>
      {tab==="costing"&&(
        <div style={g.card}>
          <div style={g.fld}><label style={g.lbl}>Product Name</label><input style={g.inp} placeholder="e.g. Steel Chair" value={prod} onChange={e=>setProd(e.target.value)}/></div>
          <div style={g.row2}>
            <div style={g.fld}><label style={g.lbl}>Raw Material Cost (₹)</label><input style={g.inp} type="number" placeholder="5000" value={rm} onChange={e=>setRm(e.target.value)}/></div>
            <div style={g.fld}><label style={g.lbl}>Labour Cost (₹)</label><input style={g.inp} type="number" placeholder="2000" value={lb} onChange={e=>setLb(e.target.value)}/></div>
          </div>
          <div style={g.row2}>
            <div style={g.fld}><label style={g.lbl}>Overhead Cost (₹)</label><input style={g.inp} type="number" placeholder="1000" value={oh} onChange={e=>setOh(e.target.value)}/></div>
            <div style={g.fld}><label style={g.lbl}>No. of Units Produced</label><input style={g.inp} type="number" placeholder="1" value={units} onChange={e=>setUnits(e.target.value)}/></div>
          </div>
          <div style={g.row2}>
            <div style={g.fld}><label style={g.lbl}>Wastage (%)</label><input style={g.inp} type="number" placeholder="5" value={wastage} onChange={e=>setWastage(e.target.value)}/></div>
            <div style={g.fld}><label style={g.lbl}>Desired Profit Margin (%)</label><input style={g.inp} type="number" placeholder="20" value={margin} onChange={e=>setMargin(e.target.value)}/></div>
          </div>
          <button style={g.btn} onClick={calcCosting}>⚙️ Calculate Product Cost</button>
          {costResult&&(
            <div style={g.result}>
              <div style={{opacity:0.8,fontSize:12}}>{prod||"Product"} — Recommended Selling Price (ex-GST)</div>
              <div style={{fontWeight:900,fontSize:24}}>{fmt(costResult.sell)}</div>
              <div style={{opacity:0.8,fontSize:12}}>MRP with 18% GST: {fmt(costResult.mrp)}</div>
              <div style={{height:1,background:"rgba(255,255,255,0.2)",margin:"12px 0"}}/>
              {[["Direct Cost / Unit",fmt(costResult.direct)],["Wastage",fmt(costResult.waste)],["Overhead / Unit",fmt(costResult.overPU)],["Cost of Production",fmt(costResult.cop)],["Your Profit",fmt(costResult.profit)],["GST @18%",fmt(costResult.gst)]].map(([k,v])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"3px 0"}}><span style={{opacity:0.8}}>{k}</span><span style={{fontWeight:700}}>{v}</span></div>
              ))}
            </div>
          )}
        </div>
      )}
      {tab==="breakeven"&&(
        <div style={g.card}>
          <div style={g.fld}><label style={g.lbl}>Total Fixed Costs per Month (₹)</label><input style={g.inp} type="number" placeholder="e.g. 50000" value={fc} onChange={e=>setFc(e.target.value)}/></div>
          <div style={g.row2}>
            <div style={g.fld}><label style={g.lbl}>Variable Cost per Unit (₹)</label><input style={g.inp} type="number" placeholder="e.g. 100" value={vc} onChange={e=>setVc(e.target.value)}/></div>
            <div style={g.fld}><label style={g.lbl}>Selling Price per Unit (₹)</label><input style={g.inp} type="number" placeholder="e.g. 200" value={sp} onChange={e=>setSp(e.target.value)}/></div>
          </div>
          <button style={g.btn} onClick={calcBE}>📊 Calculate Break-Even</button>
          {beResult&&(
            <div style={g.result}>
              <div style={{opacity:0.8,fontSize:12}}>Break-Even Point</div>
              <div style={{fontWeight:900,fontSize:24}}>{beResult.bepU.toLocaleString()} units</div>
              <div style={{opacity:0.8,fontSize:12}}>Revenue required: {fmt(beResult.bepR)}</div>
              <div style={{height:1,background:"rgba(255,255,255,0.2)",margin:"12px 0"}}/>
              {[["Contribution per Unit",fmt(beResult.contrib)],["P/V Ratio",beResult.pvR+"%"]].map(([k,v])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"3px 0"}}><span style={{opacity:0.8}}>{k}</span><span style={{fontWeight:700}}>{v}</span></div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── BLOG ──
function BlogSection(){
  const [filter,setFilter]=useState("All");
  const tags=["All",...new Set(BLOG_POSTS.map(p=>p.tag))];
  const filtered=filter==="All"?BLOG_POSTS:BLOG_POSTS.filter(p=>p.tag===filter);
  return(
    <div>
      <div style={g.adSlot}>📢 Advertisement</div>
      <h1 style={g.cardTitle}>📝 CA Blog</h1>
      <p style={g.cardSub}>Tax Laws • Case Laws • Investment Ideas • GST Updates — Written by CAs</p>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
        {tags.map(t=>(
          <button key={t} onClick={()=>setFilter(t)} style={{padding:"5px 12px",borderRadius:20,border:`1.5px solid ${filter===t?C.primary:C.border}`,background:filter===t?C.primary:C.white,color:filter===t?"#fff":C.muted,fontSize:11,fontWeight:700,cursor:"pointer"}}>{t}</button>
        ))}
      </div>
      {filtered.map(p=>(
        <div key={p.id} style={{...g.card,borderLeft:`4px solid ${(TAG_COLORS[p.tag]||{text:"#1a56db"}).text}`}}>
          <span style={{background:(TAG_COLORS[p.tag]||{bg:"#eff6ff"}).bg,color:(TAG_COLORS[p.tag]||{text:"#1d4ed8"}).text,padding:"3px 10px",borderRadius:20,fontSize:10,fontWeight:700,display:"inline-block",marginBottom:8}}>{p.tag}</span>
          <div style={{fontWeight:800,fontSize:15,color:C.dark,marginBottom:6,lineHeight:1.4}}>{p.title}</div>
          <div style={{fontSize:13,color:C.muted,lineHeight:1.6}}>{p.excerpt}</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:10}}>
            <span style={{fontSize:11,color:C.muted}}>{p.date} • {p.read} read</span>
            <span style={{fontSize:12,fontWeight:700,color:C.primary,cursor:"pointer"}}>Read More →</span>
          </div>
        </div>
      ))}
      <div style={{...g.card,background:`linear-gradient(135deg,${C.dark},${C.primary})`,color:"#fff",textAlign:"center",padding:22}}>
        <div style={{fontSize:28,marginBottom:8}}>📞</div>
        <div style={{fontWeight:800,fontSize:16,marginBottom:4}}>Need CA Consultation?</div>
        <div style={{fontSize:13,opacity:0.85,marginBottom:14}}>Book a 30-minute personalised session for tax planning & investment advice</div>
        <button style={{...g.btnSm,background:"#fff",color:C.dark,fontSize:13,padding:"10px 24px"}}>Book Consultation →</button>
      </div>
      <div style={g.adSlot}>📢 Advertisement — Google AdSense (300×250)</div>
    </div>
  );
}
