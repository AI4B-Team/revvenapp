import { useState, useReducer } from "react";
import {
  Tag, Search, Home, DollarSign, Wrench, Bell, Sparkles,
  ChevronRight, CheckCircle, MapPin, Clock, ArrowRight,
  Zap, Shield, Users, FileText, Star, TrendingUp,
  BarChart2, MessageSquare, X, Plus, Eye
} from "lucide-react";
import FlowWizard from "./FlowWizard.jsx";
import { ALL_FLOWS, FLOW_ORDER } from "./flowConfig.js";

const C = {
  ink:"#0d1117", inkMid:"#161c26",
  teal:"#1a6b5a", tealM:"#2d9b7f", tealL:"#4ab89a",
  tealXL:"#eaf4f0", tealXXL:"#f3faf8",
  cream:"#fafaf9", creamD:"#f0ede8", creamDD:"#e3ddd4",
  gold:"#c9a84c", goldM:"#e8c96d", goldXL:"#fdf8ed",
  steel:"#8a94a6", steelL:"#b0b8c8",
  border:"rgba(13,17,23,0.09)", borderM:"rgba(13,17,23,0.15)",
  white:"#ffffff",
  red:"#d94f3d",
  amber:"#c07c1a",
  green:"#4a9e5c",
  blue:"#3b7fc4",
};

function dataReducer(state, action) {
  switch (action.type) {
    case "ADD_LEAD":
      return {
        ...state,
        leads: [...state.leads, action.payload],
        [action.payload.flowId + "_leads"]: [
          ...(state[action.payload.flowId + "_leads"] || []),
          action.payload,
        ],
      };
    default:
      return state;
  }
}

const initialData = {
  leads:[],
  sell_leads:[], buy_leads:[], rent_leads:[],
  finance_leads:[], service_leads:[],
};

const TAB_META = {
  sell:    { icon:<Tag size={14}/>,        color:C.teal  },
  buy:     { icon:<Search size={14}/>,     color:C.blue  },
  rent:    { icon:<Home size={14}/>,       color:"#6b5ca5"},
  finance: { icon:<DollarSign size={14}/>, color:C.gold  },
  service: { icon:<Wrench size={14}/>,     color:C.teal  },
};

const HERO_HEADLINES = {
  sell:    { top:"YOUR HOME SOLD.",        italic:"Your Buyer Is Already Here.",    sub:"Thousands of verified buyers are already waiting. Competing offers in 24 hours. Zero guesswork." },
  buy:     { top:"YOUR PERFECT HOME.",     italic:"Already Waiting For You.",       sub:"AI matches you to listings before they hit the public market. First access wins." },
  rent:    { top:"YOUR NEXT HOME.",        italic:"No Agents. No Spam. No Delays.", sub:"Curated rentals from verified landlords. Move in faster." },
  finance: { top:"YOUR BEST RATE.",        italic:"50+ Lenders Competing For You.", sub:"Compare real rate quotes in 5 minutes. No hard credit pull. No obligation." },
  service: { top:"YOUR PRO. FOUND.",       italic:"Background-Checked. Guaranteed.",sub:"AI matches you to the highest-rated, verified professional in your area. Quotes in hours." },
};

const HERO_BGS = {
  sell:    "url('https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1400&q=80') center/cover",
  buy:     "url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1400&q=80') center/cover",
  rent:    "url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1400&q=80') center/cover",
  finance: "url('https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=1400&q=80') center/cover",
  service: "url('https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1400&q=80') center/cover",
};

function HeroWidget({ onStart, activeTab, setActiveTab }) {
  const [address, setAddress] = useState("");
  const [goal, setGoal]       = useState("");
  const flow    = ALL_FLOWS[activeTab];
  const capture = flow.heroCapture;
  const ac      = TAB_META[activeTab]?.color || C.teal;

  const handleCTA = () => {
    onStart(activeTab, { address: address.trim(), goal });
  };

  return (
    <div style={{
      background:"rgba(255,255,255,.97)",
      backdropFilter:"blur(16px)",
      borderRadius:22,
      boxShadow:"0 24px 80px rgba(0,0,0,.18), 0 2px 12px rgba(0,0,0,.08)",
      overflow:"hidden",
      maxWidth:860, width:"100%",
      margin:"0 auto",
    }}>
      <div style={{display:"flex",borderBottom:`1px solid ${C.border}`,overflowX:"auto"}}>
        {FLOW_ORDER.map(fid => {
          const meta = TAB_META[fid];
          const fl   = ALL_FLOWS[fid];
          const sel  = activeTab === fid;
          return (
            <button key={fid} onClick={() => setActiveTab(fid)} style={{
              flex:1, minWidth:100,
              padding:".82rem .75rem",
              display:"flex",alignItems:"center",justifyContent:"center",gap:5,
              background:"transparent", border:"none",
              borderBottom:`2.5px solid ${sel?ac:"transparent"}`,
              fontSize:".8rem", fontWeight:sel?700:500,
              color:sel?ac:C.steel,
              cursor:"pointer", transition:"all .15s",
              whiteSpace:"nowrap",
            }}>
              <span style={{color:sel?ac:C.steelL}}>{meta.icon}</span>
              {fl.label}
            </button>
          );
        })}
      </div>

      <div style={{padding:"1.4rem 1.75rem 1rem"}}>
        <div style={{
          display:"grid",
          gridTemplateColumns:"1fr auto auto",
          gap:".75rem", alignItems:"end",
        }}>
          <div>
            <label style={{
              display:"block",fontSize:".6rem",fontWeight:800,
              textTransform:"uppercase",letterSpacing:1,
              color:C.steelL,marginBottom:6,
            }}>{capture.addressLabel}</label>
            <div style={{
              display:"flex",alignItems:"center",gap:8,
              padding:".72rem 1rem",
              background:C.creamD,border:`1.5px solid ${C.border}`,
              borderRadius:11,transition:"border-color .15s",
            }}
            onFocusCapture={e=>e.currentTarget.style.borderColor=ac}
            onBlurCapture={e=>e.currentTarget.style.borderColor=C.border}>
              <MapPin size={14} color={C.steelL} style={{flexShrink:0}}/>
              <input value={address} placeholder={capture.addressPlaceholder}
                onChange={e=>setAddress(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&handleCTA()}
                style={{
                  flex:1,border:"none",background:"transparent",
                  fontSize:".88rem",fontFamily:"'DM Sans',sans-serif",
                  color:C.ink,outline:"none",
                }}/>
            </div>
          </div>

          <div>
            <label style={{
              display:"block",fontSize:".6rem",fontWeight:800,
              textTransform:"uppercase",letterSpacing:1,
              color:C.steelL,marginBottom:6,
            }}>{capture.goalLabel}</label>
            <select value={goal} onChange={e=>setGoal(e.target.value)}
              style={{
                height:46,padding:"0 2rem 0 .85rem",
                background:C.creamD,border:`1.5px solid ${C.border}`,
                borderRadius:11,fontSize:".84rem",
                fontFamily:"'DM Sans',sans-serif",
                color:goal?C.ink:C.steelL,
                outline:"none",cursor:"pointer",
                appearance:"none",
                backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='7' viewBox='0 0 11 7'%3E%3Cpath d='M1 1l4.5 4.5L10 1' stroke='%238a94a6' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")",
                backgroundRepeat:"no-repeat",
                backgroundPosition:"right 10px center",
                minWidth:165,
              }}>
              <option value="" disabled>Select…</option>
              {capture.goalOptions.map(o=><option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          <button onClick={handleCTA} style={{
            height:46,padding:"0 1.5rem",
            background:`linear-gradient(135deg,${ac},${C.tealM})`,
            border:"none",borderRadius:11,
            fontSize:".88rem",fontWeight:700,color:"white",
            cursor:"pointer",display:"flex",alignItems:"center",gap:6,
            whiteSpace:"nowrap",transition:"opacity .15s",
          }}
          onMouseEnter={e=>e.currentTarget.style.opacity=".9"}
          onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
            <Zap size={14}/>{capture.cta}
          </button>
        </div>

        <div style={{
          display:"flex",alignItems:"center",gap:".5rem",
          marginTop:".85rem",flexWrap:"wrap",
        }}>
          <span style={{fontSize:".72rem",color:C.steelL,fontWeight:600}}>Situations:</span>
          {capture.situations.map(s=>(
            <button key={s} onClick={()=>setGoal(s)} style={{
              padding:".28rem .72rem",
              background:goal===s?`${ac}14`:C.white,
              border:`1.5px solid ${goal===s?ac:C.border}`,
              borderRadius:50,fontSize:".72rem",
              fontWeight:goal===s?700:500,
              color:goal===s?ac:C.ink,
              cursor:"pointer",transition:"all .15s",
            }}>{s}</button>
          ))}
        </div>

        <p style={{fontSize:".65rem",color:C.steelL,textAlign:"center",marginTop:".75rem"}}>
          {capture.ctaNote}
        </p>
      </div>
    </div>
  );
}

function DashboardLeadCard({ lead, index }) {
  const [open, setOpen] = useState(false);
  const ac = TAB_META[lead.flowId]?.color || C.teal;

  return (
    <div style={{
      background:C.white,border:`1.5px solid ${C.border}`,
      borderRadius:14,overflow:"hidden",
      animation:`fadeUp .2s ${index*.04}s both`,
    }}>
      <div style={{padding:"1rem 1.25rem"}}>
        <div style={{display:"flex",alignItems:"flex-start",
          justifyContent:"space-between",gap:"1rem",flexWrap:"wrap"}}>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:4}}>
              <span style={{
                background:`${ac}14`,color:ac,
                border:`1px solid ${ac}33`,
                borderRadius:5,padding:".05rem .45rem",
                fontSize:".6rem",fontWeight:800,
                letterSpacing:.4,textTransform:"uppercase",
              }}>{lead.label}</span>
              <span style={{
                background:C.tealXL,color:C.teal,
                border:`1px solid ${C.teal}33`,
                borderRadius:5,padding:".05rem .42rem",
                fontSize:".6rem",fontWeight:800,
              }}>NEW</span>
            </div>
            <div style={{fontWeight:700,fontSize:".9rem",color:C.ink,marginBottom:2}}>
              {lead.contact?.name||"Homeowner"}
            </div>
            <div style={{fontSize:".73rem",color:C.steel}}>{lead.summary}</div>
            {lead.address && (
              <div style={{fontSize:".7rem",color:C.steel,marginTop:2,
                display:"flex",alignItems:"center",gap:3}}>
                <MapPin size={9} style={{flexShrink:0}}/>{lead.address}
              </div>
            )}
          </div>
          <button onClick={()=>setOpen(o=>!o)} style={{
            padding:".4rem .78rem",
            background:C.creamD,border:`1px solid ${C.border}`,
            borderRadius:8,fontSize:".72rem",fontWeight:600,
            color:C.steel,cursor:"pointer",
            display:"flex",alignItems:"center",gap:4,flexShrink:0,
          }}>
            <Eye size={11}/>{open?"Hide":"View Details"}
          </button>
        </div>
      </div>

      {open && (
        <div style={{
          borderTop:`1px solid ${C.border}`,
          padding:"1rem 1.25rem",background:C.cream,
          animation:"fadeUp .18s ease",
        }}>
          <div style={{fontSize:".58rem",fontWeight:800,textTransform:"uppercase",
            letterSpacing:1,color:C.steelL,marginBottom:".6rem"}}>Full Submission</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:".3rem .85rem",marginBottom:".75rem"}}>
            {[["ID",lead.id],["Name",lead.contact?.name],["Email",lead.contact?.email],
              ["Phone",lead.contact?.phone],["Submitted",new Date(lead.submittedAt).toLocaleTimeString()]
            ].filter(([,v])=>v).map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",
                padding:".2rem 0",borderBottom:`1px solid ${C.border}`,fontSize:".71rem"}}>
                <span style={{color:C.steelL}}>{k}</span>
                <span style={{fontWeight:600,color:C.ink,maxWidth:200,
                  overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",textAlign:"right"}}>{v}</span>
              </div>
            ))}
          </div>
          {Object.entries(lead.answers).filter(([k])=>k!=="contact").map(([stepId,stepData])=>(
            <div key={stepId} style={{marginBottom:".65rem"}}>
              <div style={{fontSize:".57rem",fontWeight:800,textTransform:"uppercase",
                letterSpacing:.8,color:C.steelL,marginBottom:".35rem"}}>
                {stepId.replace(/_/g," ")}
              </div>
              {Object.entries(stepData||{}).filter(([,v])=>v).map(([k,v])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",
                  padding:".18rem 0",borderBottom:`1px solid ${C.border}`,fontSize:".7rem"}}>
                  <span style={{color:C.steelL,textTransform:"capitalize"}}>{k.replace(/_/g," ")}</span>
                  <span style={{fontWeight:600,color:C.ink,textAlign:"right",maxWidth:260}}>
                    {Array.isArray(v)?v.join(", "):v}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Dashboard({ data, onNewRequest }) {
  const [activeRole, setActiveRole] = useState("all");
  const allLeads = data.leads;
  const roles    = ["all",...[...new Set(allLeads.map(l=>l.flowId))]];
  const filtered = activeRole === "all" ? allLeads : allLeads.filter(l=>l.flowId===activeRole);
  const latest   = allLeads[allLeads.length-1];

  return (
    <div style={{minHeight:"100vh",background:C.cream,fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        *{box-sizing:border-box;margin:0;padding:0;}
        button{font-family:'DM Sans',sans-serif;cursor:pointer;}
      `}</style>

      <nav style={{
        background:C.ink,padding:".85rem 2rem",
        display:"flex",alignItems:"center",gap:"1.5rem",
        position:"sticky",top:0,zIndex:50,
      }}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{
            width:30,height:30,borderRadius:7,
            background:`linear-gradient(135deg,${C.teal},${C.tealM})`,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontFamily:"'Playfair Display',serif",color:"white",fontWeight:900,
          }}>H</div>
          <span style={{fontFamily:"'Playfair Display',serif",
            fontSize:".9rem",fontWeight:700,color:"white"}}>HomesDaily</span>
        </div>
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:".75rem"}}>
          <div style={{position:"relative"}}>
            <Bell size={16} color="rgba(255,255,255,.5)"/>
            {allLeads.length>0&&(
              <div style={{
                position:"absolute",top:-5,right:-5,
                width:14,height:14,borderRadius:"50%",
                background:C.red,color:"white",
                fontSize:".48rem",fontWeight:800,
                display:"flex",alignItems:"center",justifyContent:"center",
              }}>{allLeads.length}</div>
            )}
          </div>
          <div style={{
            width:30,height:30,borderRadius:"50%",
            background:`linear-gradient(135deg,${C.teal},${C.tealM})`,
            display:"flex",alignItems:"center",justifyContent:"center",
            color:"white",fontSize:".72rem",fontWeight:700,
          }}>{latest?.contact?.name?.[0]||"U"}</div>
        </div>
      </nav>

      <div style={{maxWidth:1000,margin:"0 auto",padding:"2rem 1.5rem 3rem"}}>
        <div style={{marginBottom:"1.75rem",animation:"fadeUp .25s ease"}}>
          <div style={{fontSize:".58rem",fontWeight:900,textTransform:"uppercase",
            letterSpacing:1.2,color:C.teal,marginBottom:5}}>My Dashboard</div>
          <h1 style={{fontFamily:"'Playfair Display',serif",
            fontSize:"1.6rem",fontWeight:700,color:C.ink,marginBottom:4}}>
            Welcome back, {latest?.contact?.name?.split(" ")[0]||"there"} 👋
          </h1>
          <p style={{fontSize:".8rem",color:C.steel}}>
            {allLeads.length} submission{allLeads.length!==1?"s":""} · Synced in real time
          </p>
        </div>

        <div style={{
          display:"grid",gridTemplateColumns:"repeat(4,1fr)",
          gap:".75rem",marginBottom:"1.5rem",
        }}>
          {[
            {l:"Total",v:allLeads.length,c:C.teal,i:<FileText size={14}/>},
            {l:"Sell",v:data.sell_leads.length,c:C.teal,i:<Tag size={14}/>},
            {l:"Buy / Rent",v:data.buy_leads.length+data.rent_leads.length,c:C.blue,i:<Home size={14}/>},
            {l:"Finance / Service",v:data.finance_leads.length+data.service_leads.length,c:C.gold,i:<DollarSign size={14}/>},
          ].map((s,i)=>(
            <div key={s.l} style={{
              background:C.white,border:`1.5px solid ${C.border}`,
              borderRadius:12,padding:".9rem 1.1rem",
              display:"flex",alignItems:"center",gap:10,
              animation:`fadeUp .2s ${i*.04}s both`,
            }}>
              <div style={{
                width:34,height:34,borderRadius:9,
                background:`${s.c}12`,color:s.c,
                display:"flex",alignItems:"center",justifyContent:"center",
                flexShrink:0,
              }}>{s.i}</div>
              <div>
                <div style={{fontFamily:"'Playfair Display',serif",
                  fontSize:"1.15rem",fontWeight:700,color:C.ink,lineHeight:1}}>{s.v}</div>
                <div style={{fontSize:".55rem",fontWeight:700,textTransform:"uppercase",
                  letterSpacing:.5,color:C.steelL,marginTop:2}}>{s.l}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{display:"flex",gap:".4rem",marginBottom:"1.1rem",flexWrap:"wrap"}}>
          {roles.map(r=>(
            <button key={r} onClick={()=>setActiveRole(r)} style={{
              padding:".38rem .82rem",
              background:activeRole===r?C.ink:C.white,
              border:`1.5px solid ${activeRole===r?C.ink:C.border}`,
              borderRadius:8,fontSize:".74rem",fontWeight:700,
              color:activeRole===r?"white":C.steel,
              display:"flex",alignItems:"center",gap:5,
            }}>
              {r==="all"?"All":ALL_FLOWS[r]?.label||r}
              <span style={{
                background:activeRole===r?"rgba(255,255,255,.2)":C.creamD,
                borderRadius:4,padding:".02rem .32rem",
                fontSize:".6rem",fontWeight:800,
                color:activeRole===r?"white":C.steelL,
              }}>{r==="all"?allLeads.length:allLeads.filter(l=>l.flowId===r).length}</span>
            </button>
          ))}
        </div>

        {filtered.length===0 ? (
          <div style={{
            background:C.white,border:`1.5px solid ${C.border}`,
            borderRadius:14,padding:"2.5rem",
            textAlign:"center",color:C.steelL,fontSize:".84rem",
          }}>No submissions yet in this category.</div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:".75rem"}}>
            {[...filtered].reverse().map((lead,i)=>(
              <DashboardLeadCard key={lead.id} lead={lead} index={i}/>
            ))}
          </div>
        )}

        <button onClick={onNewRequest} style={{
          marginTop:"1.5rem",
          display:"flex",alignItems:"center",gap:7,
          padding:".78rem 1.5rem",
          background:`linear-gradient(135deg,${C.teal},${C.tealM})`,
          border:"none",borderRadius:12,
          fontSize:".84rem",fontWeight:700,color:"white",
        }}>
          <Plus size={14}/>Start a New Request
        </button>
      </div>
    </div>
  );
}

function HeroPage({ activeTab, setActiveTab, onStart }) {
  const hl = HERO_HEADLINES[activeTab]||HERO_HEADLINES.sell;
  const bg = HERO_BGS[activeTab]||HERO_BGS.sell;

  return (
    <div style={{minHeight:"100vh",fontFamily:"'DM Sans',sans-serif",position:"relative"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes bgFade{from{opacity:0}to{opacity:1}}
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,.3);border-radius:4px}
        input::placeholder{color:${C.steelL}}
        select option{color:${C.ink}}
        button{font-family:'DM Sans',sans-serif;cursor:pointer;}
        a{text-decoration:none;}
      `}</style>

      <div key={activeTab} style={{
        position:"absolute",inset:0,
        background:`linear-gradient(180deg,rgba(5,10,20,.5) 0%,rgba(5,10,20,.72) 55%,rgba(5,10,20,.88) 100%), ${bg}`,
        transition:"all .4s ease",animation:"bgFade .4s ease",zIndex:0,
      }}/>

      <nav style={{
        position:"relative",zIndex:10,
        padding:".9rem 2.5rem",
        display:"flex",alignItems:"center",gap:"2rem",
      }}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <div style={{
            width:36,height:36,borderRadius:9,
            background:`linear-gradient(135deg,${C.teal},${C.tealM})`,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontFamily:"'Playfair Display',serif",color:"white",fontWeight:900,fontSize:"1rem",
          }}>H</div>
          <span style={{fontFamily:"'Playfair Display',serif",
            fontSize:"1.1rem",fontWeight:700,color:"white"}}>HomesDaily</span>
        </div>
        <div style={{display:"flex",gap:0,marginLeft:".5rem"}}>
          {["Buy","Rent","Sell","Finance","Service"].map(l=>{
            const fid=l.toLowerCase();
            const sel=activeTab===fid;
            return (
              <button key={l} onClick={()=>setActiveTab(fid)} style={{
                padding:".4rem .9rem",background:"transparent",border:"none",
                borderBottom:`2px solid ${sel?"white":"transparent"}`,
                fontSize:".84rem",fontWeight:sel?700:400,
                color:sel?"white":"rgba(255,255,255,.55)",
                cursor:"pointer",transition:"all .15s",
              }}>{l}</button>
            );
          })}
        </div>
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:".85rem"}}>
          <Sparkles size={18} color="rgba(255,255,255,.5)"/>
          <div style={{
            width:30,height:30,borderRadius:"50%",
            background:"rgba(255,255,255,.15)",
            border:"1.5px solid rgba(255,255,255,.2)",
            display:"flex",alignItems:"center",justifyContent:"center",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="rgba(255,255,255,.6)" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
        </div>
      </nav>

      <div style={{
        position:"relative",zIndex:10,
        display:"flex",flexDirection:"column",
        alignItems:"center",justifyContent:"center",
        padding:"3rem 1.5rem 4.5rem",
        minHeight:"calc(100vh - 60px)",
      }}>
        <div style={{
          display:"inline-flex",alignItems:"center",gap:7,
          padding:".4rem 1rem",
          background:"rgba(255,255,255,.12)",
          border:"1px solid rgba(255,255,255,.22)",
          backdropFilter:"blur(8px)",
          borderRadius:50,marginBottom:"1.75rem",
          fontSize:".68rem",fontWeight:700,
          color:"rgba(255,255,255,.85)",letterSpacing:.5,
          animation:"fadeUp .3s ease",
        }}>
          <span style={{
            width:6,height:6,borderRadius:"50%",
            background:C.teal,display:"inline-block",
            animation:"pulse 2s infinite",
          }}/>
          THE PLATFORM ZILLOW COULDN'T BUILD
        </div>

        <h1 style={{
          textAlign:"center",maxWidth:820,margin:"0 auto .6rem",
          animation:"fadeUp .35s ease",
        }}>
          <span style={{
            display:"block",
            fontFamily:"'Playfair Display',serif",
            fontSize:"clamp(2.8rem,7vw,5rem)",
            fontWeight:900,color:"white",
            lineHeight:1.0,letterSpacing:"-1px",
          }}>{hl.top}</span>
          <span style={{
            display:"block",
            fontFamily:"'Playfair Display',serif",
            fontSize:"clamp(2.2rem,5.5vw,4.2rem)",
            fontWeight:900,fontStyle:"italic",
            color:C.goldM,lineHeight:1.05,letterSpacing:"-.5px",
          }}>{hl.italic}</span>
        </h1>

        <p style={{
          fontSize:"clamp(.9rem,1.8vw,1.05rem)",
          color:"rgba(255,255,255,.65)",lineHeight:1.75,
          maxWidth:620,textAlign:"center",
          margin:"0 auto 2.25rem",
          animation:"fadeUp .42s ease",
        }}>{hl.sub}</p>

        <div style={{width:"100%",maxWidth:860,animation:"fadeUp .5s ease"}}>
          <HeroWidget
            onStart={onStart}
            activeTab={activeTab}
            setActiveTab={setActiveTab}/>
        </div>
      </div>
    </div>
  );
}

export default function HomesDailyApp() {
  const [data, dispatch]    = useReducer(dataReducer, initialData);
  const [page, setPage]     = useState("home");
  const [activeTab, setActiveTab] = useState("sell");
  const [wizardFlow, setFlow]     = useState("sell");
  const [prefill, setPrefill]     = useState({});

  const handleStart = (flowId, captureData) => {
    setFlow(flowId);
    setPrefill(captureData);
    setPage("wizard");
  };

  const handleComplete = (lead) => {
    dispatch({ type:"ADD_LEAD", payload:lead });
    setPage("dashboard");
  };

  if (page === "dashboard") {
    return <Dashboard data={data} onNewRequest={()=>setPage("home")}/>;
  }
  if (page === "wizard") {
    return (
      <FlowWizard
        flowId={wizardFlow}
        prefill={prefill}
        onComplete={handleComplete}
        onBack={()=>setPage("home")}/>
    );
  }
  return (
    <HeroPage
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onStart={handleStart}/>
  );
}
