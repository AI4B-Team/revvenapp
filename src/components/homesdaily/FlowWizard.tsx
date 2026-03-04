import { useState, useRef } from "react";
import {
  ArrowLeft, ChevronRight, Check, Shield, AlertCircle,
  CheckCircle, Home, Tag, Search, DollarSign, Wrench,
  MapPin, Clock, Zap, Users, FileText
} from "lucide-react";
import { ALL_FLOWS, buildLeadFromFlow } from "./flowConfig.js";

const C = {
  ink:"#0d1117", inkMid:"#161c26",
  teal:"#1a6b5a", tealM:"#2d9b7f", tealL:"#4ab89a",
  tealXL:"#eaf4f0", tealXXL:"#f3faf8",
  cream:"#fafaf9", creamD:"#f0ede8", creamDD:"#e3ddd4",
  gold:"#c9a84c", goldM:"#e8c96d", goldXL:"#fdf8ed",
  steel:"#8a94a6", steelL:"#b0b8c8",
  border:"rgba(13,17,23,0.09)", borderM:"rgba(13,17,23,0.15)",
  white:"#ffffff",
  red:"#d94f3d", redXL:"#fdf2f0",
  amber:"#c07c1a", amberXL:"#fef8ed",
  green:"#4a9e5c", greenXL:"#eef6eb",
};

const FLOW_COLORS = {
  sell:    { primary:C.teal,  light:C.tealXL,  icon:<Tag size={15}/>,        bg:"url('https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=900&q=75') center/cover" },
  buy:     { primary:"#2d6fa8",light:"#eff5fd", icon:<Home size={15}/>,       bg:"url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&q=75') center/cover" },
  rent:    { primary:"#6b5ca5",light:"#f3f0fb", icon:<Search size={15}/>,     bg:"url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&q=75') center/cover" },
  finance: { primary:C.gold,  light:C.goldXL,  icon:<DollarSign size={15}/>, bg:"url('https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=900&q=75') center/cover" },
  service: { primary:C.teal,  light:C.tealXL,  icon:<Wrench size={15}/>,     bg:"url('https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=900&q=75') center/cover" },
};

const FLOW_LEFT_COPY = {
  sell:    { h:"Your Home Sold.",    sub:"Thousands of verified buyers are already waiting. Competing offers in 24 hours. Zero guesswork." },
  buy:     { h:"Your Perfect Home.", sub:"AI matches you to homes before they hit the market. Search smarter, move faster." },
  rent:    { h:"Your New Place.",    sub:"Curated listings from verified landlords. No ghost listings. No spam." },
  finance: { h:"Your Best Rate.",    sub:"Compare real offers from 50+ lenders in under 5 minutes. No hard credit pull." },
  service: { h:"Your Pro. Found.",   sub:"Top-rated, background-checked professionals in your area. Quotes in hours, not days." },
};

// ── Shared field components ───────────────────────────────────
function FieldRadio({ field, value, onChange, accentColor }) {
  const ac = accentColor || C.teal;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:".52rem" }}>
      {field.options.map(opt => {
        const val = typeof opt === "string" ? opt : opt.value;
        const lbl = typeof opt === "string" ? opt : opt.label;
        const sub = typeof opt === "object"  ? opt.sub : null;
        const sel = value === val;
        return (
          <div key={val} onClick={() => onChange(val)} style={{
            display:"flex", alignItems:"center", gap:12,
            padding:".82rem 1rem",
            background:sel?`${ac}12`:C.white,
            border:`2px solid ${sel?ac:C.border}`,
            borderRadius:11, cursor:"pointer", transition:"all .15s",
          }}
          onMouseEnter={e=>!sel&&(e.currentTarget.style.borderColor=C.steelL)}
          onMouseLeave={e=>!sel&&(e.currentTarget.style.borderColor=C.border)}>
            <div style={{
              width:19, height:19, borderRadius:"50%", flexShrink:0,
              border:`2px solid ${sel?ac:C.steelL}`,
              background:sel?ac:C.white, transition:"all .15s",
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              {sel && <div style={{width:7,height:7,borderRadius:"50%",background:"white"}}/>}
            </div>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:".84rem",color:sel?ac:C.ink}}>{lbl}</div>
              {sub && <div style={{fontSize:".69rem",color:C.steel,marginTop:1}}>{sub}</div>}
            </div>
            {sel && <Check size={14} color={ac} strokeWidth={3}/>}
          </div>
        );
      })}
    </div>
  );
}

function FieldMultiselect({ field, value = [], onChange, accentColor }) {
  const ac = accentColor || C.teal;
  const toggle = opt => {
    const v = Array.isArray(value) ? value : [];
    onChange(v.includes(opt) ? v.filter(x => x !== opt) : [...v, opt]);
  };
  return (
    <div style={{ display:"flex", flexWrap:"wrap", gap:".45rem" }}>
      {field.options.map(opt => {
        const sel = Array.isArray(value) && value.includes(opt);
        return (
          <button key={opt} onClick={() => toggle(opt)} style={{
            padding:".48rem .9rem",
            background:sel?ac:C.white,
            border:`2px solid ${sel?ac:C.border}`,
            borderRadius:50, fontSize:".76rem",
            fontWeight:sel?700:500,
            color:sel?"white":C.ink,
            cursor:"pointer", transition:"all .15s",
            display:"flex", alignItems:"center", gap:4,
          }}
          onMouseEnter={e=>{if(!sel){e.currentTarget.style.borderColor=ac;e.currentTarget.style.color=ac;}}}
          onMouseLeave={e=>{if(!sel){e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.ink;}}}>
            {sel && <Check size={10} strokeWidth={3}/>}{opt}
          </button>
        );
      })}
    </div>
  );
}

function FieldSelect({ field, value, onChange }) {
  return (
    <div>
      {field.label && (
        <label style={{display:"block",fontSize:".62rem",fontWeight:700,
          textTransform:"uppercase",letterSpacing:.8,color:C.steelL,marginBottom:5}}>
          {field.label}{field.required&&<span style={{color:C.red,marginLeft:2}}>*</span>}
        </label>
      )}
      <select value={value||""} onChange={e=>onChange(e.target.value)}
        style={{
          width:"100%", padding:".72rem .95rem",
          background:C.white, border:`1.5px solid ${C.border}`,
          borderRadius:10, fontSize:".84rem",
          fontFamily:"'DM Sans',sans-serif",
          color:value?C.ink:C.steelL,
          outline:"none", cursor:"pointer",
          appearance:"none",
          backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='7' viewBox='0 0 11 7'%3E%3Cpath d='M1 1l4.5 4.5L10 1' stroke='%238a94a6' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
          backgroundRepeat:"no-repeat",
          backgroundPosition:"right 12px center",
        }}>
        <option value="" disabled>Select…</option>
        {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function FieldText({ field, value, onChange }) {
  return (
    <div>
      {field.label && (
        <label style={{display:"block",fontSize:".62rem",fontWeight:700,
          textTransform:"uppercase",letterSpacing:.8,color:C.steelL,marginBottom:5}}>
          {field.label}{field.required&&<span style={{color:C.red,marginLeft:2}}>*</span>}
        </label>
      )}
      <input type={field.type==="email"?"email":field.type==="tel"?"tel":"text"}
        value={value||""} placeholder={field.placeholder||""}
        onChange={e=>onChange(e.target.value)}
        onFocus={e=>e.target.style.borderColor=C.teal}
        onBlur={e=>e.target.style.borderColor=C.border}
        style={{
          width:"100%", padding:".72rem .95rem",
          background:C.white, border:`1.5px solid ${C.border}`,
          borderRadius:10, fontSize:".84rem",
          fontFamily:"'DM Sans',sans-serif", color:C.ink,
          outline:"none", transition:"border-color .15s",
        }}/>
    </div>
  );
}

function FieldTextarea({ field, value, onChange }) {
  return (
    <div>
      {field.label && (
        <label style={{display:"block",fontSize:".62rem",fontWeight:700,
          textTransform:"uppercase",letterSpacing:.8,color:C.steelL,marginBottom:5}}>
          {field.label}{field.required&&<span style={{color:C.red,marginLeft:2}}>*</span>}
        </label>
      )}
      <textarea value={value||""} rows={4} placeholder={field.placeholder||""}
        onChange={e=>onChange(e.target.value)}
        onFocus={e=>e.target.style.borderColor=C.teal}
        onBlur={e=>e.target.style.borderColor=C.border}
        style={{
          width:"100%", padding:".72rem .95rem",
          background:C.white, border:`1.5px solid ${C.border}`,
          borderRadius:10, fontSize:".84rem", lineHeight:1.65,
          fontFamily:"'DM Sans',sans-serif", color:C.ink,
          outline:"none", resize:"vertical", transition:"border-color .15s",
        }}/>
    </div>
  );
}

function RenderField({ field, stepAnswers, onChange, accentColor }) {
  const val = stepAnswers?.[field.id];
  const set = v => onChange(field.id, v);
  if (field.type === "radio")       return <FieldRadio       field={field} value={val} onChange={set} accentColor={accentColor}/>;
  if (field.type === "multiselect") return <FieldMultiselect field={field} value={val} onChange={set} accentColor={accentColor}/>;
  if (field.type === "select")      return <FieldSelect      field={field} value={val} onChange={set}/>;
  if (field.type === "textarea")    return <FieldTextarea    field={field} value={val} onChange={set}/>;
  return <FieldText field={field} value={val} onChange={set}/>;
}

// ── Contact step ──────────────────────────────────────────────
function ContactStep({ step, answers, onChange }) {
  return (
    <div>
      {step.fields.map(field => (
        <div key={field.id} style={{marginBottom:".9rem"}}>
          <label style={{display:"block",fontSize:".84rem",fontWeight:700,color:C.ink,marginBottom:5}}>
            {field.label}<span style={{color:C.red,marginLeft:2}}>*</span>
          </label>
          <RenderField field={field} stepAnswers={answers} onChange={onChange}/>
        </div>
      ))}
      <div style={{
        display:"flex", alignItems:"flex-start", gap:9,
        padding:".8rem .95rem", marginTop:".5rem",
        background:C.tealXXL, border:`1.5px solid ${C.teal}22`, borderRadius:11,
      }}>
        <Shield size={13} color={C.teal} style={{flexShrink:0,marginTop:2}}/>
        <p style={{fontSize:".71rem",color:C.teal,lineHeight:1.7}}>
          Your contact information is never publicly displayed.
          It is only shared when you approve a verified match request.
        </p>
      </div>
    </div>
  );
}

// ── Confirmation screen ───────────────────────────────────────
function ConfirmScreen({ lead, flowColor, onGoToDashboard, onNewRequest }) {
  const NEXT_STEPS = {
    sell:    ["Your listing profile is being built","Verified buyers in your area are being matched","Expect your first buyer inquiry within 24 hours","Review all offers in your Seller Dashboard"],
    buy:     ["Your buy criteria have been saved","Matching listings are being surfaced now","Your agent match queue is ready to review","Set up alerts for new matches in your dashboard"],
    rent:    ["Your rental search is saved","Matching listings are loading into your dashboard","Landlords will be able to send you inquiries","You can message any landlord directly"],
    finance: ["Your loan profile has been submitted","Lenders are reviewing your criteria now","Expect rate quotes within 1–4 hours","Compare all offers side-by-side in your dashboard"],
    service: ["Your service request is live","Matching pros in your area have been alerted","Expect your first quote within 2 hours","Review all quotes in your Service Dashboard"],
  };
  const steps = NEXT_STEPS[lead.flowId] || NEXT_STEPS.sell;
  const ac = flowColor.primary;

  return (
    <div style={{animation:"fadeUp .3s ease"}}>
      {/* Success banner */}
      <div style={{
        background:`linear-gradient(135deg,${ac},${C.tealM})`,
        borderRadius:"14px 14px 0 0",
        margin:"-1.75rem -2rem 1.5rem",
        padding:"2rem 1.75rem",
        textAlign:"center",
      }}>
        <div style={{
          width:52,height:52,borderRadius:14,
          background:"rgba(255,255,255,.18)",
          display:"flex",alignItems:"center",justifyContent:"center",
          margin:"0 auto .85rem",
        }}>
          <CheckCircle size={26} color="white" strokeWidth={2}/>
        </div>
        <h2 style={{
          fontFamily:"'Playfair Display',serif",
          fontSize:"1.35rem",fontWeight:700,
          color:"white",marginBottom:".35rem",
        }}>You're in the Queue!</h2>
        <p style={{fontSize:".78rem",color:"rgba(255,255,255,.7)",lineHeight:1.6}}>
          Reference #{lead.id}
        </p>
      </div>

      {/* Summary card */}
      <div style={{
        background:C.creamD,borderRadius:12,
        padding:".9rem 1.05rem",marginBottom:"1.15rem",
      }}>
        <div style={{fontSize:".57rem",fontWeight:800,textTransform:"uppercase",
          letterSpacing:1,color:C.steelL,marginBottom:".45rem"}}>Your Submission</div>
        <div style={{fontWeight:700,fontSize:".88rem",color:C.ink,marginBottom:3}}>{lead.contact?.name||"Homeowner"}</div>
        <div style={{fontSize:".74rem",color:C.steel}}>{lead.summary}</div>
        {lead.address && (
          <div style={{fontSize:".72rem",color:C.steel,marginTop:3,
            display:"flex",alignItems:"center",gap:4}}>
            <MapPin size={10}/>{lead.address}
          </div>
        )}
      </div>

      {/* Next steps */}
      <div style={{
        background:C.inkMid,borderRadius:13,
        padding:"1rem 1.15rem",marginBottom:"1.15rem",
      }}>
        <div style={{fontSize:".57rem",fontWeight:800,textTransform:"uppercase",
          letterSpacing:1,color:"rgba(255,255,255,.3)",marginBottom:".6rem"}}>
          What happens next
        </div>
        {steps.map((s,i)=>(
          <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,
            marginBottom:".45rem",fontSize:".76rem"}}>
            <div style={{
              width:19,height:19,borderRadius:5,flexShrink:0,
              background:`${ac}30`,color:C.tealL,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:".6rem",fontWeight:800,marginTop:1,
            }}>{i+1}</div>
            <div style={{color:"rgba(255,255,255,.6)",lineHeight:1.6}}>{s}</div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{display:"flex",flexDirection:"column",gap:".55rem"}}>
        <button onClick={onGoToDashboard} style={{
          width:"100%",padding:".75rem",
          background:`linear-gradient(135deg,${ac},${C.tealM})`,
          border:"none",borderRadius:11,
          fontSize:".86rem",fontWeight:700,color:"white",
          cursor:"pointer",display:"flex",
          alignItems:"center",justifyContent:"center",gap:6,
        }}>
          <Home size={14}/>Open My Dashboard
        </button>
        <button onClick={onNewRequest} style={{
          width:"100%",padding:".68rem",
          background:C.white,border:`1.5px solid ${C.border}`,
          borderRadius:11,fontSize:".82rem",fontWeight:600,
          color:C.ink,cursor:"pointer",
        }}>Start Another Request</button>
      </div>
    </div>
  );
}

// ── Main wizard ───────────────────────────────────────────────
export default function FlowWizard({
  flowId       = "sell",
  prefill      = {},   // { address, goal } from hero capture
  onComplete,          // (lead) => void
  onBack,              // () => void
}) {
  const flow        = ALL_FLOWS[flowId];
  const flowColor   = FLOW_COLORS[flowId] || FLOW_COLORS.sell;
  const leftCopy    = FLOW_LEFT_COPY[flowId] || FLOW_LEFT_COPY.sell;
  const totalSteps  = flow.steps.length;

  const [stepIdx,   setStepIdx]  = useState(0);
  const [answers,   setAnswers]  = useState(() => {
    // Pre-seed with hero capture data
    const seed = {};
    if (prefill.address) {
      seed.property  = { address: prefill.address };
      seed.details   = { address: prefill.address };
      seed.search    = { location: prefill.address };
    }
    return seed;
  });
  const [errors,    setErrors]   = useState([]);
  const [submitted, setSubmit]   = useState(false);
  const [lead,      setLead]     = useState(null);
  const scrollRef = useRef(null);

  const currentStep  = flow.steps[stepIdx];
  const stepAnswers  = answers[currentStep.id] || {};
  const isLast       = stepIdx === totalSteps - 1;
  const progress     = Math.round((stepIdx / totalSteps) * 100);
  const ac           = flowColor.primary;

  const setField = (fieldId, value) => {
    setAnswers(a => ({
      ...a,
      [currentStep.id]: { ...a[currentStep.id], [fieldId]: value },
    }));
    if (errors.includes(fieldId)) setErrors(e => e.filter(x => x !== fieldId));
  };

  const validate = () => {
    const errs = [];
    currentStep.fields?.forEach(f => {
      if (!f.required) return;
      const v = stepAnswers[f.id];
      if (!v || (Array.isArray(v) && v.length === 0) || v === "") errs.push(f.id);
    });
    return errs;
  };

  const handleNext = () => {
    const errs = validate();
    if (errs.length) { setErrors(errs); return; }
    setErrors([]);
    if (isLast) {
      const built = buildLeadFromFlow(flowId, answers);
      setLead(built);
      setSubmit(true);
      onComplete?.(built);
    } else {
      setStepIdx(i => i + 1);
      scrollRef.current?.scrollTo({ top:0, behavior:"smooth" });
    }
  };

  const handleBack = () => {
    if (stepIdx === 0) onBack?.();
    else setStepIdx(i => i - 1);
  };

  return (
    <div style={{
      display:"flex", minHeight:"100vh",
      fontFamily:"'DM Sans',sans-serif",
      background:C.cream,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:${C.steelL};border-radius:4px}
        input::placeholder,textarea::placeholder{color:${C.steelL}}
        select option{color:${C.ink}}
        button{font-family:'DM Sans',sans-serif;cursor:pointer;}
      `}</style>

      {/* Left image panel */}
      <div style={{
        width:"42%",flexShrink:0,
        position:"relative",overflow:"hidden",
        display:"flex",flexDirection:"column",justifyContent:"flex-end",
        background:`linear-gradient(180deg,rgba(0,0,0,.12) 0%,rgba(0,0,0,.65) 100%), ${flowColor.bg}`,
      }}>
        {/* Logo */}
        <div style={{
          position:"absolute",top:28,left:28,
          display:"flex",alignItems:"center",gap:9,
        }}>
          <div style={{
            width:32,height:32,borderRadius:8,
            background:`linear-gradient(135deg,${C.teal},${C.tealM})`,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontFamily:"'Playfair Display',serif",
            color:"white",fontWeight:900,fontSize:".88rem",
          }}>H</div>
          <span style={{fontFamily:"'Playfair Display',serif",
            fontSize:".95rem",fontWeight:700,color:"white"}}>HomesDaily</span>
        </div>

        {/* Progress dots */}
        <div style={{
          position:"absolute",bottom:120,left:28,
          display:"flex",gap:5,
        }}>
          {Array.from({length:totalSteps}).map((_,i)=>(
            <div key={i} style={{
              width:i===stepIdx?20:i<stepIdx?20:6,
              height:6,borderRadius:3,
              background:i<stepIdx?C.tealL:i===stepIdx?"white":"rgba(255,255,255,.3)",
              transition:"all .3s",
            }}/>
          ))}
        </div>

        {/* Bottom copy */}
        <div style={{padding:"0 2rem 2.5rem"}}>
          <h2 style={{
            fontFamily:"'Playfair Display',serif",
            fontSize:"1.8rem",fontWeight:900,
            color:"white",lineHeight:1.12,marginBottom:".6rem",
          }}>
            {submitted ? "Submitted!" : leftCopy.h}
          </h2>
          <p style={{fontSize:".78rem",color:"rgba(255,255,255,.6)",lineHeight:1.7}}>
            {submitted
              ? "Your dashboard is ready. Everything you submitted is waiting for you."
              : leftCopy.sub}
          </p>
          <div style={{display:"flex",gap:".55rem",marginTop:"1rem",flexWrap:"wrap"}}>
            {["Free to Use","AI-Powered","Privacy Protected"].map(b=>(
              <div key={b} style={{
                display:"flex",alignItems:"center",gap:4,
                padding:".28rem .65rem",
                background:"rgba(255,255,255,.1)",
                borderRadius:6,fontSize:".63rem",
                fontWeight:700,color:"rgba(255,255,255,.8)",
              }}>
                <CheckCircle size={9} color={C.tealL}/>{b}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div style={{flex:1,display:"flex",flexDirection:"column",background:C.white,overflow:"hidden"}}>
        {/* Header bar */}
        <div style={{
          display:"flex",alignItems:"center",justifyContent:"space-between",
          padding:"1.15rem 2rem",borderBottom:`1px solid ${C.border}`,flexShrink:0,
        }}>
          <div style={{
            fontSize:".78rem",fontWeight:700,color:ac,
            display:"flex",alignItems:"center",gap:5,
          }}>
            {flowColor.icon} {flow.label}
          </div>
          {!submitted ? (
            <div style={{fontSize:".76rem",color:C.steelL,display:"flex",alignItems:"center",gap:5}}>
              <span style={{fontWeight:700,color:C.ink}}>Step {stepIdx+1} of {totalSteps}</span>
              <span>|</span>
              ~{Math.ceil((totalSteps - stepIdx) * 13)} seconds
            </div>
          ) : (
            <div style={{fontSize:".76rem",color:C.green,fontWeight:700,
              display:"flex",alignItems:"center",gap:5}}>
              <CheckCircle size={13}/>Submitted
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div style={{height:3,background:C.creamD,flexShrink:0}}>
          <div style={{
            height:"100%",
            width:submitted?"100%":`${progress}%`,
            background:`linear-gradient(90deg,${ac},${C.tealM})`,
            borderRadius:2,transition:"width .4s ease",
          }}/>
        </div>

        {/* Scrollable content */}
        <div ref={scrollRef} style={{flex:1,overflowY:"auto",padding:"1.75rem 2rem"}}>
          {submitted && lead ? (
            <ConfirmScreen
              lead={lead}
              flowColor={flowColor}
              onGoToDashboard={() => onComplete?.(lead, "dashboard")}
              onNewRequest={() => { setSubmit(false); setStepIdx(0); setAnswers({}); setLead(null); }}/>
          ) : (
            <div key={stepIdx} style={{animation:"fadeUp .2s ease"}}>
              {/* Step heading */}
              <h2 style={{
                fontFamily:"'Playfair Display',serif",
                fontSize:"1.4rem",fontWeight:700,
                color:C.ink,marginBottom:".38rem",lineHeight:1.2,
              }}>{currentStep.title}</h2>
              {currentStep.subtitle && (
                <p style={{fontSize:".78rem",color:C.steel,lineHeight:1.65,marginBottom:"1.35rem"}}>
                  {currentStep.subtitle}
                </p>
              )}
              {!currentStep.subtitle && <div style={{marginBottom:"1.25rem"}}/>}

              {/* Fields */}
              {currentStep.id === "contact" ? (
                <ContactStep step={currentStep} answers={stepAnswers} onChange={setField}/>
              ) : (
                currentStep.fields?.map((field, fi) => (
                  <div key={field.id} style={{marginBottom:"1.15rem"}}>
                    {field.label && (field.type==="radio"||field.type==="multiselect") && (
                      <label style={{display:"block",fontSize:".8rem",fontWeight:700,
                        color:C.ink,marginBottom:8}}>
                        {field.label}
                        {field.required&&<span style={{color:C.red,marginLeft:2}}>*</span>}
                      </label>
                    )}
                    <RenderField
                      field={field}
                      stepAnswers={stepAnswers}
                      onChange={setField}
                      accentColor={ac}/>
                    {errors.includes(field.id) && (
                      <div style={{display:"flex",alignItems:"center",gap:4,
                        fontSize:".68rem",color:C.red,marginTop:5}}>
                        <AlertCircle size={10}/>Required — please make a selection
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Nav buttons */}
        {!submitted && (
          <div style={{
            display:"flex",alignItems:"center",justifyContent:"space-between",
            padding:"1rem 2rem",
            borderTop:`1px solid ${C.border}`,
            background:C.white,flexShrink:0,
          }}>
            <button onClick={handleBack} style={{
              display:"flex",alignItems:"center",gap:6,
              padding:".62rem 1.15rem",
              background:C.white,border:`1.5px solid ${C.border}`,
              borderRadius:10,fontSize:".82rem",
              fontWeight:600,color:C.ink,
              transition:"all .15s",
            }}
            onMouseEnter={e=>e.currentTarget.style.borderColor=C.steelL}
            onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
              <ArrowLeft size={13}/> Back
            </button>
            <button onClick={handleNext} style={{
              display:"flex",alignItems:"center",gap:6,
              padding:".7rem 1.85rem",
              background:`linear-gradient(135deg,${ac},${C.tealM})`,
              border:"none",borderRadius:10,
              fontSize:".88rem",fontWeight:700,color:"white",
              minWidth:155,justifyContent:"center",
              transition:"opacity .15s",
            }}
            onMouseEnter={e=>e.currentTarget.style.opacity=".9"}
            onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
              {isLast?"Submit":"Continue"}
              <ChevronRight size={14}/>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
