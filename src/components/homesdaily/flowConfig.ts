// ─────────────────────────────────────────────────────────────────────────────
//  HomesDaily — Universal Flow Config
// ─────────────────────────────────────────────────────────────────────────────

export interface FlowField {
  id: string;
  type: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  options?: any[];
  sub?: string;
}

export interface FlowStep {
  id: string;
  title: string;
  subtitle?: string;
  privacy?: boolean;
  fields: FlowField[];
}

export interface HeroCapture {
  addressLabel: string;
  addressPlaceholder: string;
  goalLabel: string;
  goalOptions: string[];
  cta: string;
  situations: string[];
  ctaNote: string;
}

export interface Flow {
  id: string;
  label: string;
  dashboardRole: string;
  heroCapture: HeroCapture;
  steps: FlowStep[];
}

export interface Lead {
  id: string;
  flowId: string;
  role: string;
  label: string;
  status: string;
  submittedAt: string;
  contact: Record<string, string>;
  answers: Record<string, Record<string, any>>;
  address: string;
  name: string;
  email: string;
  phone: string;
  summary: string;
}

const CONTACT_STEP: FlowStep = {
  id: "contact",
  title: "How can we reach you?",
  subtitle: "Your info is private. Only shared with verified matches you approve.",
  privacy: true,
  fields: [
    { id:"name",    type:"text",  label:"Full name",      placeholder:"Dolmar Cross",          required:true  },
    { id:"phone",   type:"tel",   label:"Phone number",   placeholder:"(813) 476-8508",        required:true  },
    { id:"email",   type:"email", label:"Email address",  placeholder:"dolmarcross@gmail.com", required:true  },
  ],
};

// ── SELL flow ─────────────────────────────────────────────────
export const SELL_FLOW: Flow = {
  id: "sell",
  label: "Sell",
  dashboardRole: "seller",
  heroCapture: {
    addressLabel: "YOUR PROPERTY ADDRESS",
    addressPlaceholder: "4821 Bay Boulevard, Tampa FL 33611",
    goalLabel: "YOUR GOAL",
    goalOptions: ["Get Cash Offers","List with Agent","Get Home Value","FSBO Guidance"],
    cta: "See My Buyers",
    situations: ["Foreclosure","Inherited Property","Relocating","As-Is Sale"],
    ctaNote: "No Obligation · Private & Secure",
  },
  steps: [
    {
      id: "property",
      title: "Tell us about your property.",
      subtitle: "We use this to match you with buyers already searching in your area.",
      fields: [
        { id:"address",   type:"text",   label:"Property address",     placeholder:"4821 Bay Blvd, Tampa FL 33611", required:true  },
        { id:"type",      type:"select", label:"Property type",
          options:["Single family home","Condo / Townhouse","Multi-family","Land / Lot","Mobile home","Commercial"], required:true },
        { id:"bedrooms",  type:"select", label:"Bedrooms",
          options:["Studio","1","2","3","4","5","6+"], required:true },
        { id:"bathrooms", type:"select", label:"Bathrooms",
          options:["1","1.5","2","2.5","3","3.5","4+"], required:true },
        { id:"sqft",      type:"select", label:"Square footage",
          options:["< 800","800–1,200","1,200–1,800","1,800–2,500","2,500–3,500","3,500–5,000","5,000+"], required:false },
      ],
    },
    {
      id: "situation",
      title: "What's your selling situation?",
      subtitle: "This helps us surface the right buyers and strategies for your timeline.",
      fields: [
        { id:"timeline", type:"radio", label:"When do you need to sell?", required:true,
          options:[
            { value:"asap",      label:"ASAP — I need to sell now",      sub:"Ideal for cash buyers, skip repairs" },
            { value:"1_3months", label:"1–3 months",                     sub:"Standard listing timeline"           },
            { value:"3_6months", label:"3–6 months",                     sub:"Time to prep and stage"              },
            { value:"just_value",label:"Just want to know my value",     sub:"No commitment, free estimate"        },
          ],
        },
        { id:"situation", type:"multiselect", label:"Select any that apply (optional)", required:false,
          options:["Foreclosure / Pre-foreclosure","Inherited property","Divorce","Behind on payments","Needs major repairs","Relocating","Downsizing","Investment property","Other"],
        },
        { id:"asking_price", type:"select", label:"What are you hoping to get?", required:false,
          options:["Open to offers","< $100K","$100K–$200K","$200K–$350K","$350K–$500K","$500K–$750K","$750K–$1M","$1M+"],
        },
      ],
    },
    {
      id: "goal",
      title: "How do you want to sell?",
      subtitle: "We support every path — from cash offers to full-market listings.",
      fields: [{
        id: "sell_method", type:"radio", required:true,
        options:[
          { value:"cash",    label:"Cash Offer",        sub:"Fast close, no showings, no repairs — often 7–21 days" },
          { value:"agent",   label:"List with an Agent",sub:"Full market exposure, highest potential price"          },
          { value:"fsbo",    label:"For Sale By Owner",  sub:"Save on commission, we provide tools + buyer matching" },
          { value:"compare", label:"Show me all options",sub:"I want to compare cash vs. listing side-by-side"       },
        ],
      }],
    },
    {
      id: "property_condition",
      title: "What's the condition of the property?",
      fields: [
        { id:"condition", type:"radio", required:true,
          options:[
            { value:"excellent", label:"Excellent — move-in ready",   sub:"Updated kitchen/baths, no major issues" },
            { value:"good",      label:"Good — minor updates needed",  sub:"Cosmetic work only"                     },
            { value:"fair",      label:"Fair — needs some work",       sub:"Functional but dated"                   },
            { value:"poor",      label:"Needs major work / as-is",     sub:"Investor-ready, priced accordingly"     },
          ],
        },
        { id:"updates", type:"multiselect", label:"Recent updates (check all that apply)", required:false,
          options:["New roof","New HVAC","Updated kitchen","Updated bathrooms","New flooring","Fresh paint","New windows","New appliances"],
        },
      ],
    },
    CONTACT_STEP,
  ],
};

// ── BUY flow ──────────────────────────────────────────────────
export const BUY_FLOW: Flow = {
  id: "buy",
  label: "Buy",
  dashboardRole: "buyer",
  heroCapture: {
    addressLabel: "SEARCH LOCATION",
    addressPlaceholder: "City, zip, or neighborhood",
    goalLabel: "BUYER TYPE",
    goalOptions: ["Primary Home","Investment Property","Vacation Home","Relocating"],
    cta: "Find My Home",
    situations: ["First-time Buyer","Move-Up Buyer","Cash Buyer","Pre-Approved"],
    ctaNote: "Free · No Obligation",
  },
  steps: [
    {
      id: "search_area",
      title: "Where are you looking to buy?",
      fields: [
        { id:"location",     type:"text",   label:"City, zip, or neighborhood", placeholder:"Tampa, FL 33611", required:true },
        { id:"radius",       type:"select", label:"Search radius",
          options:["Within 5 miles","Within 10 miles","Within 25 miles","Open to surrounding areas"], required:false },
        { id:"buyer_type",   type:"radio",  label:"What type of buyer are you?", required:true,
          options:[
            { value:"primary",    label:"Primary Residence",    sub:"My main home" },
            { value:"investment", label:"Investment / Rental",  sub:"Income property" },
            { value:"vacation",   label:"Vacation / Second Home",sub:"Part-time living" },
          ],
        },
      ],
    },
    {
      id: "criteria",
      title: "What are you looking for?",
      fields: [
        { id:"property_type", type:"multiselect", label:"Property types", required:true,
          options:["Single family","Condo","Townhouse","Multi-family","Land","New construction"],
        },
        { id:"bedrooms",  type:"select", label:"Min bedrooms",
          options:["Any","1+","2+","3+","4+","5+"], required:false },
        { id:"bathrooms", type:"select", label:"Min bathrooms",
          options:["Any","1+","2+","3+","4+"], required:false },
        { id:"price_max", type:"select", label:"Max budget",
          options:["Open","Under $150K","$150K–$250K","$250K–$400K","$400K–$600K","$600K–$900K","$900K–$1.5M","$1.5M+"], required:true },
        { id:"features",  type:"multiselect", label:"Must-haves", required:false,
          options:["Pool","Garage","Large yard","New construction","Waterfront","HOA-free","Basement","In-law suite"],
        },
      ],
    },
    {
      id: "financing",
      title: "Have you been pre-approved?",
      fields: [
        { id:"pre_approval", type:"radio", required:true,
          options:[
            { value:"yes",       label:"Yes — pre-approved",     sub:"I have a letter ready" },
            { value:"in_process",label:"In process",             sub:"Working on it now"     },
            { value:"no",        label:"Not yet",                sub:"Need help with this"   },
            { value:"cash",      label:"Paying cash",            sub:"No financing needed"   },
          ],
        },
        { id:"timeline", type:"select", label:"When do you want to move?",
          options:["ASAP","1–3 months","3–6 months","6–12 months","Just browsing"], required:true },
        { id:"agent",    type:"radio",  label:"Are you working with an agent?", required:false,
          options:[{value:"yes",label:"Yes"},{value:"no",label:"No — connect me with one"},{value:"looking",label:"Interviewing agents"}],
        },
      ],
    },
    CONTACT_STEP,
  ],
};

// ── RENT flow ─────────────────────────────────────────────────
export const RENT_FLOW: Flow = {
  id: "rent",
  label: "Rent",
  dashboardRole: "renter",
  heroCapture: {
    addressLabel: "WHERE DO YOU WANT TO LIVE?",
    addressPlaceholder: "Tampa, FL or zip code",
    goalLabel: "I AM A",
    goalOptions: ["Looking to Rent","Listing My Rental","Corporate Housing","Short-term"],
    cta: "Find Rentals",
    situations: ["Pet Friendly","No Credit Check","Month-to-Month","Furnished"],
    ctaNote: "Free to Search",
  },
  steps: [
    {
      id: "search",
      title: "What are you looking for?",
      fields: [
        { id:"location",     type:"text",   label:"City, zip or neighborhood",  placeholder:"Tampa FL 33647", required:true },
        { id:"property_type",type:"multiselect", label:"Type", required:true,
          options:["Apartment","House","Condo","Townhouse","Room / shared","Studio"],
        },
        { id:"bedrooms",  type:"select", label:"Bedrooms",
          options:["Any","Studio","1 BR","2 BR","3 BR","4+ BR"], required:true },
        { id:"budget_max",type:"select", label:"Max monthly rent",
          options:["Open","< $800","$800–$1,200","$1,200–$1,800","$1,800–$2,500","$2,500–$3,500","$3,500+"], required:true },
      ],
    },
    {
      id: "preferences",
      title: "Preferences & requirements.",
      fields: [
        { id:"move_in",   type:"select", label:"Move-in date",
          options:["ASAP","This month","Next month","2–3 months out","3–6 months out"], required:true },
        { id:"lease",     type:"select", label:"Lease term",
          options:["Month-to-month","3–6 months","12 months","18+ months","Flexible"], required:false },
        { id:"must_haves",type:"multiselect", label:"Must-haves", required:false,
          options:["Pets allowed","In-unit laundry","Parking","AC","Dishwasher","Balcony","Gym","Pool","No credit check"],
        },
        { id:"people",    type:"select", label:"How many people?",
          options:["Just me","2 people","3 people","4+ people"], required:false },
      ],
    },
    CONTACT_STEP,
  ],
};

// ── FINANCE flow ──────────────────────────────────────────────
export const FINANCE_FLOW: Flow = {
  id: "finance",
  label: "Finance",
  dashboardRole: "borrower",
  heroCapture: {
    addressLabel: "PROPERTY ADDRESS (IF KNOWN)",
    addressPlaceholder: "Leave blank if still shopping",
    goalLabel: "LOAN TYPE",
    goalOptions: ["Purchase Loan","Refinance","Cash-Out Refi","HELOC","Hard Money"],
    cta: "Get My Rates",
    situations: ["First-time Buyer","VA Loan","FHA Loan","Self-Employed"],
    ctaNote: "Soft credit pull only · Won't affect your score",
  },
  steps: [
    {
      id: "loan_type",
      title: "What type of financing do you need?",
      fields: [{
        id: "loan_type", type:"radio", required:true,
        options:[
          { value:"purchase",   label:"Home Purchase",          sub:"Buying a new home" },
          { value:"refinance",  label:"Rate & Term Refi",       sub:"Lower rate or shorten term" },
          { value:"cashout",    label:"Cash-Out Refinance",     sub:"Access equity for home improvements, debt payoff" },
          { value:"heloc",      label:"HELOC / Home Equity",    sub:"Revolving credit line against your equity" },
          { value:"hardmoney",  label:"Hard Money / Bridge",    sub:"Short-term, asset-based financing for investors" },
          { value:"commercial", label:"Commercial / DSCR",      sub:"Investment and commercial property loans" },
        ],
      }],
    },
    {
      id: "property_info",
      title: "About the property.",
      fields: [
        { id:"address",    type:"text",   label:"Property address (if known)", placeholder:"4821 Bay Blvd, Tampa FL", required:false },
        { id:"prop_type",  type:"select", label:"Property type",
          options:["Primary residence","Second home","Investment / rental","Commercial","Not sure yet"], required:true },
        { id:"est_value",  type:"select", label:"Estimated property value",
          options:["< $100K","$100K–$200K","$200K–$350K","$350K–$500K","$500K–$750K","$750K–$1M","$1M+","Not sure"], required:true },
        { id:"loan_amount",type:"select", label:"Loan amount needed",
          options:["< $80K","$80K–$150K","$150K–$300K","$300K–$500K","$500K–$750K","$750K+"], required:true },
      ],
    },
    {
      id: "borrower_profile",
      title: "A bit about your financial profile.",
      subtitle: "This is a soft inquiry only and will not affect your credit score.",
      fields: [
        { id:"credit_score", type:"radio", required:true,
          options:[
            { value:"760+",    label:"Excellent (760+)",     sub:"Best rates available" },
            { value:"720_759", label:"Very Good (720–759)",  sub:"Near-best rates" },
            { value:"680_719", label:"Good (680–719)",       sub:"Competitive rates" },
            { value:"640_679", label:"Fair (640–679)",       sub:"Some lenders available" },
            { value:"below640",label:"Below 640",            sub:"Specialty programs available" },
            { value:"unsure",  label:"Not sure",             sub:"We'll help you check" },
          ],
        },
        { id:"employment",   type:"select", label:"Employment type",
          options:["W-2 employee","Self-employed","1099 / contractor","Retired","Military / VA","Investor / DSCR"], required:true },
        { id:"down_payment", type:"select", label:"Down payment available",
          options:["0% (VA/USDA)","3–5%","5–10%","10–20%","20%+","50%+ (investor)","Cash"], required:false },
      ],
    },
    CONTACT_STEP,
  ],
};

// ── SERVICE flow ──────────────────────────────────────────────
export const SERVICE_FLOW: Flow = {
  id: "service",
  label: "Services",
  dashboardRole: "homeowner",
  heroCapture: {
    addressLabel: "YOUR PROPERTY",
    addressPlaceholder: "Property address",
    goalLabel: "SERVICE NEEDED",
    goalOptions: ["Plumbing","HVAC","Roofing","Electrical","Cleaning","Handyman"],
    cta: "Find Pros",
    situations: ["Emergency","Licensed Only","Background Checked","Free Estimates"],
    ctaNote: "Free · No Obligation",
  },
  steps: [
    {
      id: "service_type",
      title: "What service do you need?",
      subtitle: "Select a category — we'll match you with the best verified pros near you.",
      fields: [{
        id: "category", type:"radio", required:true,
        options:[
          { value:"plumbing",    label:"Plumbing",       sub:"Leaks, drains, water heater, pipes" },
          { value:"hvac",        label:"HVAC",           sub:"AC repair, heating, new install" },
          { value:"roofing",     label:"Roofing",        sub:"Repair, replacement, inspection" },
          { value:"electrical",  label:"Electrical",     sub:"Outlets, panels, EV chargers" },
          { value:"cleaning",    label:"Cleaning",       sub:"Home, deep clean, move-out" },
          { value:"painting",    label:"Painting",       sub:"Interior, exterior, cabinets" },
          { value:"landscaping", label:"Landscaping",    sub:"Lawn, landscaping, irrigation" },
          { value:"handyman",    label:"Handyman",       sub:"Repairs, assembly, odd jobs" },
          { value:"pest",        label:"Pest Control",   sub:"Bugs, rodents, termites" },
          { value:"other",       label:"Other",          sub:"Tell us what you need" },
        ],
      }],
    },
    {
      id: "details",
      title: "Describe the job.",
      fields: [
        { id:"description", type:"textarea", label:"What needs to be done?", required:true,
          placeholder:"Describe the issue or project in your own words..." },
        { id:"address",     type:"text",     label:"Property address", required:true,
          placeholder:"3218 W San Jose St, Tampa FL 33629" },
        { id:"urgency",     type:"radio",    label:"How soon?", required:true,
          options:[
            { value:"asap",      label:"ASAP — Today/Tomorrow", sub:"Emergency or urgent" },
            { value:"this_week", label:"This Week",             sub:"Within 5 days"       },
            { value:"flexible",  label:"Flexible",              sub:"Open schedule"       },
          ],
        },
      ],
    },
    CONTACT_STEP,
  ],
};

// ── Registry ─────────────────────────────────────────────────
export const ALL_FLOWS: Record<string, Flow> = {
  sell:    SELL_FLOW,
  buy:     BUY_FLOW,
  rent:    RENT_FLOW,
  finance: FINANCE_FLOW,
  service: SERVICE_FLOW,
};

export const FLOW_ORDER = ["sell","buy","rent","finance","service"] as const;

// ── Build lead from wizard answers ───────────────────────────
export function buildLeadFromFlow(flowId: string, answers: Record<string, Record<string, any>>): Lead {
  const flow    = ALL_FLOWS[flowId];
  const contact = findContactAnswers(answers);
  return {
    id:          `${flowId.toUpperCase()}-${Date.now()}`,
    flowId,
    role:        flow.dashboardRole,
    label:       flow.label,
    status:      "new",
    submittedAt: new Date().toISOString(),
    contact,
    answers,
    address:     contact.address || extractAddress(answers) || "Address not provided",
    name:        contact.name    || "Homeowner",
    email:       contact.email   || "",
    phone:       contact.phone   || "",
    summary:     buildSummary(flowId, answers),
  };
}

function findContactAnswers(answers: Record<string, any>): Record<string, string> {
  return answers.contact || {};
}

function extractAddress(answers: Record<string, any>): string {
  for (const step of Object.values(answers)) {
    const s = step as Record<string, any> | null;
    if (s?.address) return s.address;
    if (s?.location) return s.location;
  }
  return "";
}

function buildSummary(flowId: string, answers: Record<string, any>): string {
  const a = answers;
  if (flowId === "sell") {
    const prop = a.property || {};
    const sit  = a.situation || {};
    return `${prop.type||"Property"} · ${sit.timeline||"Flexible timeline"} · ${sit.sell_method||"Method TBD"}`;
  }
  if (flowId === "buy") {
    const c = a.criteria || {};
    return `${c.bedrooms||"Any"} bed · Budget: ${c.price_max||"Open"} · ${a.financing?.timeline||""}`;
  }
  if (flowId === "rent") {
    const s = a.search || {};
    return `${s.bedrooms||"Any"} bed · ${s.budget_max||"Open budget"} · ${a.preferences?.move_in||""}`;
  }
  if (flowId === "finance") {
    const l = a.loan_type || {};
    const b = a.borrower_profile || {};
    return `${l.loan_type||"Loan"} · Credit: ${b.credit_score||"??"} · ${b.employment||""}`;
  }
  if (flowId === "service") {
    const d = a.details || {};
    return `${a.service_type?.category||"Service"} · ${d.urgency||"Flexible"}`;
  }
  return "Request submitted";
}
