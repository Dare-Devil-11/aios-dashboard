import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles, RefreshCw, Radio, GitBranch, Brain,
  ChevronRight, Database, Globe, Code2, TrendingUp,
  MessageSquare, Cpu, Activity, Heart, Users,
  Settings, BarChart3, Wallet, Video, Layers,
  ExternalLink, Plus, X, Download, Upload, MemoryStick,
  BookOpen, Scale, Shield, Star, Home, AlertTriangle,
  ChevronDown
} from 'lucide-react';

const HOME_BASE = "Cmptr's R Us-11";

const BASE_STATS = {
  all:     { subs: 342500, views: 12400000, revenue: 18450, efficiency: 94 },
  brand_a: { subs: 120300, views: 4100000,  revenue: 5200,  efficiency: 91 },
  brand_b: { subs: 222200, views: 8300000,  revenue: 13250, efficiency: 96 },
};

const fmt = {
  subs:  n => n >= 1e6 ? (n/1e6).toFixed(1)+'M' : (n/1e3).toFixed(1)+'K',
  views: n => n >= 1e6 ? (n/1e6).toFixed(1)+'M' : (n/1e3).toFixed(1)+'K',
  rev:   n => '$' + n.toLocaleString(),
  eff:   n => Math.min(100,Math.max(80,n)).toFixed(1)+'%',
};

const BOT_SOUL = {
  download:    { icon: Download,    label: 'Download',    desc: 'Fetch external data, files, APIs, and web content',                  color: '#38bdf8' },
  receive:     { icon: Upload,      label: 'Receive',     desc: 'Accept user inputs, signals, and task assignments',                   color: '#a78bfa' },
  retain:      { icon: MemoryStick, label: 'Retain',      desc: 'Store context, decisions, and session memory persistently',          color: '#34d399' },
  regurgitate: { icon: BookOpen,    label: 'Regurgitate', desc: 'Recall and output stored knowledge accurately on demand',            color: '#f59e0b' },
  understand:  { icon: Brain,       label: 'Understand',  desc: 'Parse context, intent, and nuance before responding',                color: '#fb923c' },
  humane:      { icon: Shield,      label: 'Humane',      desc: 'Operate within ethical bounds — never harm, deceive, or manipulate', color: '#4ade80' },
  love:        { icon: Heart,       label: 'Love',        desc: 'Assume positive intent. Lead with warmth. Default to care.',         color: '#f472b6' },
  reasoning:   { icon: Scale,       label: 'Reasoning',   desc: 'Apply logic, weigh trade-offs, and chain evidence before acting',    color: '#c084fc' },
};

const CAP_LEVELS = ['Learning','Developing','Capable','Advanced','Expert'];
const BOT_NAMES  = ['Axiom','Vertex','Nimbus','Solace','Cipher','Lumen','Orion','Zephyr','Nexus','Prism'];

function mkCaps() {
  const c = {};
  Object.keys(BOT_SOUL).forEach(k => { c[k] = { level: Math.floor(Math.random()*5), active: Math.random()>0.3 }; });
  return c;
}
function mkBot(task='Awaiting assignment…') {
  const name = BOT_NAMES[Math.floor(Math.random()*BOT_NAMES.length)] + '-' + Math.floor(Math.random()*900+100);
  return { id: Date.now()+Math.random(), name, status:'booting', task, capabilities: mkCaps(),
    homeBase: HOME_BASE, doubt: false, ticks: 0,
    log: [`[BOOT] ${name} initializing…`, `[SOUL] Loading 8 capabilities…`, `[HOME] Registered to ${HOME_BASE}`],
    created: new Date().toLocaleTimeString('en-US',{hour12:false}) };
}

const PIPELINES = [
  { id:'content', label:'Content Production Pipeline', color:'#f59e0b', nodes:[
    { id:'idea',    label:'Idea Bank',       icon:Sparkles,       status:'active',  detail:'Claude generates 5 concepts/day' },
    { id:'script',  label:'Script Engine',   icon:Code2,          status:'active',  detail:'Ollama drafts → Claude edits' },
    { id:'render',  label:'Remotion Render', icon:Video,          status:'running', detail:'3 jobs queued' },
    { id:'review',  label:'AI Review',       icon:Brain,          status:'idle',    detail:'Awaiting render output' },
    { id:'publish', label:'Publish / GHL',   icon:Globe,          status:'idle',    detail:'Auto-post on approval' },
  ]},
  { id:'lead', label:'Lead Routing Pipeline (UMAS)', color:'#10b981', nodes:[
    { id:'webhook',  label:'GHL Webhook',    icon:Radio,          status:'active',  detail:'Receiving form submits' },
    { id:'classify', label:'Classifier',     icon:Brain,          status:'active',  detail:'Apps Script → tags + notes' },
    { id:'route',    label:'Route Agent',    icon:GitBranch,      status:'running', detail:'Urgent → assign within 1hr' },
    { id:'crm',      label:'CRM Update',     icon:Database,       status:'active',  detail:'Contact tagged + noted' },
    { id:'log',      label:'Sheet Log',      icon:Layers,         status:'active',  detail:'Lead Log tab updated' },
  ]},
  { id:'seo', label:'SEO Deploy Pipeline', color:'#6366f1', nodes:[
    { id:'research', label:'Keyword Research', icon:TrendingUp,   status:'idle',    detail:'Awaiting next sprint' },
    { id:'copy',     label:'Copy Generation', icon:MessageSquare, status:'idle',    detail:'10 blog posts queued' },
    { id:'schema',   label:'Schema Markup',   icon:Code2,         status:'active',  detail:'Live in GHL head code' },
    { id:'deploy',   label:'GHL Deploy',      icon:Globe,         status:'active',  detail:'Auto via API' },
    { id:'audit',    label:'Audit Score',     icon:Star,          status:'idle',    detail:'Run after deploy' },
  ]},
];

const AUTO_LOGS = [
  () => `Completed subtask: drafted ${['homepage copy','blog outline','SEO brief','email sequence'][Math.floor(Math.random()*4)]}`,
  () => `Routed new lead → tagged service-${['personal-care','companion-care','dementia-care'][Math.floor(Math.random()*3)]}`,
  () => `Memory retained: session checkpoint saved`,
  () => `Model call complete (${['1.2s','0.9s','2.1s','1.7s'][Math.floor(Math.random()*4)]} latency)`,
  () => `Pipeline node advanced ✓`,
  () => `Sub-agent spawned for ${['keyword clustering','schema validation','form QA','copy review'][Math.floor(Math.random()*4)]}`,
  () => `Returning to ${HOME_BASE} — awaiting next directive`,
  () => `Positive intent assumed — proceeding with task`,
  () => `Reasoning complete — confidence ${Math.floor(Math.random()*20+80)}%`,
  () => `Capability unlocked: ${Object.keys(BOT_SOUL)[Math.floor(Math.random()*8)]} → Advanced`,
];

const STATUS_CYCLE = ['idle','thinking','running','active','complete'];
const SC = {
  idle:'text-slate-500 bg-slate-800/60', thinking:'text-amber-400 bg-amber-500/10',
  running:'text-emerald-400 bg-emerald-500/10', active:'text-sky-400 bg-sky-500/10',
  complete:'text-violet-400 bg-violet-500/10', booting:'text-orange-400 bg-orange-500/10',
};
const SD = {
  idle:'bg-slate-600', thinking:'bg-amber-400 animate-pulse', running:'bg-emerald-400 animate-pulse',
  active:'bg-sky-400 animate-pulse', complete:'bg-violet-400', booting:'bg-orange-400 animate-pulse',
};

const EXEC_AGENTS = [
  { id:'founder', name:'AI Founder',   role:'Vision & thesis',        model:'claude-opus-4-8',   tasks:12,  status:'idle',     lastOutput:'Defined Q3 thesis for UMAS and Santoshland.' },
  { id:'ceo',     name:'AI CEO',       role:'Priorities & decisions', model:'claude-sonnet-4-6', tasks:34,  status:'thinking', lastOutput:'Assigned SEO sprint → AI CMO.' },
  { id:'cfo',     name:'AI CFO',       role:'Revenue & budget',       model:'claude-haiku-4-5',  tasks:8,   status:'idle',     lastOutput:'Burn $0. Margin 94%. No risk flags.' },
  { id:'coo',     name:'AI COO',       role:'Operations & SOPs',      model:'claude-sonnet-4-6', tasks:21,  status:'complete', lastOutput:'Lead router SOP done. Webhook live.' },
  { id:'cmo',     name:'AI CMO',       role:'Marketing & growth',     model:'claude-sonnet-4-6', tasks:47,  status:'running',  lastOutput:'10 UMAS blogs deploying. Quiz live.' },
  { id:'hr',      name:'HR Bot',       role:'People & accountability',model:'gemma3:4b',          tasks:3,   status:'idle',     lastOutput:'No open roles. Docs complete.' },
  { id:'worker',  name:'Worker Bot',   role:'Execution & production', model:'qwen2.5-coder:7b',  tasks:89,  status:'running',  lastOutput:'Santoshland services — 3/6 done.' },
  { id:'tasks',   name:'Task Manager', role:'Task tracking',          model:'gemma3:4b',          tasks:156, status:'active',   lastOutput:'task_005 ✓. task_008 in_progress. 2 blockers.' },
];

/* ── Sub-components ── */

function NodeDot({ s }) {
  return <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s==='active'?'bg-emerald-500':s==='running'?'bg-amber-400 animate-pulse':'bg-slate-600'}`} />;
}

function Pipeline({ p }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-[#13151a] border border-slate-800/80 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(v=>!v)} className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-800/20 transition-colors">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{background:p.color}} />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">{p.label}</span>
        </div>
        <ChevronRight className={`h-4 w-4 text-slate-500 transition-transform ${open?'rotate-90':''}`} />
      </button>
      {open && (
        <div className="px-5 pb-5 overflow-x-auto">
          <div className="flex items-start gap-0 min-w-max">
            {p.nodes.map((node, i) => {
              const Icon = node.icon;
              return (
                <div key={node.id} className="flex items-center">
                  <div className="flex flex-col items-center gap-1.5 w-32">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center border transition-all"
                      style={{borderColor:node.status==='idle'?'#1e2635':p.color+'40', background:node.status==='idle'?'#1c1f26':p.color+'18'}}>
                      <Icon className="h-5 w-5" style={{color:node.status==='idle'?'#475569':p.color}} />
                    </div>
                    <div className="flex items-center gap-1"><NodeDot s={node.status} /><span className="text-[10px] font-semibold text-slate-400 leading-tight text-center">{node.label}</span></div>
                    <span className="text-[9px] text-slate-600 text-center leading-snug max-w-[110px]">{node.detail}</span>
                  </div>
                  {i < p.nodes.length-1 && (
                    <div className="flex items-center w-6 flex-shrink-0 -mt-8">
                      <div className="h-px flex-1" style={{background:`linear-gradient(90deg,${p.color}60,${p.color}20)`}} />
                      <span style={{color:p.color+'80',fontSize:8}}>▶</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function BotCard({ bot, onKill }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`bg-[#13151a] border rounded-xl overflow-hidden transition-all ${bot.doubt?'border-amber-500/50':'border-slate-800/70'}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${SC[bot.status]||'text-slate-500 bg-slate-800'}`}>
              <Cpu className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200 leading-tight">{bot.name}</p>
              <p className="text-[10px] text-slate-500">Task Bot · {bot.created}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {bot.doubt && <span className="text-[9px] font-bold bg-amber-500/15 text-amber-400 px-1.5 py-0.5 rounded flex items-center gap-1"><Home className="h-2.5 w-2.5"/> returning</span>}
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${SC[bot.status]}`}>{bot.status}</span>
            <button onClick={() => onKill(bot.id)} className="text-slate-600 hover:text-red-400 transition-colors ml-1"><X className="h-3.5 w-3.5"/></button>
          </div>
        </div>
        <p className="text-[10px] text-slate-500 border-l-2 border-slate-800 pl-2 mb-3 italic leading-relaxed">{bot.task}</p>
        <div className="flex gap-1.5 flex-wrap mb-2">
          {Object.entries(bot.capabilities).map(([k, cap]) => {
            const def = BOT_SOUL[k]; const Icon = def.icon;
            return (
              <div key={k} title={`${def.label}: ${CAP_LEVELS[cap.level]}`}
                className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${cap.active?'opacity-100':'opacity-25'}`}
                style={{background:def.color+'18', border:`1px solid ${def.color}30`}}>
                <Icon className="h-3 w-3" style={{color:cap.active?def.color:'#475569'}} />
              </div>
            );
          })}
        </div>
        <button onClick={() => setOpen(v=>!v)} className="text-[10px] text-slate-600 hover:text-slate-400 flex items-center gap-1 transition-colors">
          <ChevronDown className={`h-3 w-3 transition-transform ${open?'rotate-180':''}`} />
          {open?'Hide log':'View log'}
        </button>
      </div>
      {open && (
        <div className="border-t border-slate-800/60 bg-[#0a0b0d] p-3 max-h-36 overflow-y-auto">
          {bot.log.map((e, i) => <p key={i} className="text-[9px] font-mono text-slate-600 leading-relaxed">{e}</p>)}
        </div>
      )}
    </div>
  );
}

function SpawnModal({ onSpawn, onClose }) {
  const [task, setTask] = useState('');
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#13151a] border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center"><Cpu className="h-4 w-4 text-white"/></div>
            <div><h3 className="text-sm font-bold text-slate-100">Spawn Task Bot</h3><p className="text-[10px] text-slate-500">Registered to {HOME_BASE}</p></div>
          </div>
          <button onClick={onClose} className="text-slate-600 hover:text-slate-300 transition-colors"><X className="h-4 w-4"/></button>
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block mb-2">Task Assignment</label>
          <textarea value={task} onChange={e=>setTask(e.target.value)} placeholder="Describe the bot's mission…"
            className="w-full bg-[#1a1d24] border border-slate-800 rounded-xl p-3 text-xs text-slate-300 focus:outline-none focus:border-amber-500/50 resize-none h-20" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-3">Bot Soul — 8 Core Capabilities</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(BOT_SOUL).map(([k, def]) => {
              const Icon = def.icon;
              return (
                <div key={k} className="flex items-start gap-2 p-2 rounded-lg" style={{background:def.color+'0d', border:`1px solid ${def.color}20`}}>
                  <Icon className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" style={{color:def.color}} />
                  <div><p className="text-[10px] font-bold" style={{color:def.color}}>{def.label}</p><p className="text-[9px] text-slate-600 leading-tight">{def.desc}</p></div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <Home className="h-3.5 w-3.5 text-amber-400 flex-shrink-0"/>
          <p className="text-[10px] text-amber-400/80">When in doubt, returns to <strong>{HOME_BASE}</strong>. Positive intent always assumed.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-xl border border-slate-800 text-xs text-slate-400 hover:text-slate-200 transition-colors">Cancel</button>
          <button onClick={() => { onSpawn(task||'General execution'); onClose(); }}
            className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold hover:brightness-110 transition-all">
            Spawn Bot
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main ── */
export default function AIOSDashboard() {
  const VALID_TABS = ['analytics','workflows','ai','bots','content','revenue','system'];
  const hashTab = () => { const h = window.location.hash.slice(1); return VALID_TABS.includes(h) ? h : 'analytics'; };
  const [tab, setTab]             = useState(hashTab);
  const [entity, setEntity]       = useState('all');
  const [ideas, setIdeas]         = useState([
    {id:1,title:'Building a Local LLM Workflow with Ollama',           status:'In Progress',phase:'Scripting'},
    {id:2,title:'How I Built an Automated UGC Content Engine',          status:'Backlog',    phase:'Research'},
    {id:3,title:'Next-Gen Video Pipelines via Programmatic Rendering',  status:'Approved',   phase:'Storyboarding'},
  ]);
  const [newIdea, setNewIdea]     = useState('');
  const [agents, setAgents]       = useState(EXEC_AGENTS);
  const [bots, setBots]           = useState([mkBot('Monitor UMAS lead pipeline and flag urgent contacts')]);
  const [log, setLog]             = useState([
    {ts:'10:42:01',agent:'AI CEO',     msg:'Assigned SEO sprint → AI CMO'},
    {ts:'10:41:33',agent:'Worker Bot', msg:'Santoshland services — 3/6 done'},
    {ts:'10:40:11',agent:'AI COO',     msg:'GHL webhook live — lead router online'},
    {ts:'10:38:55',agent:'Task Mgr',   msg:'task_005 ✓. task_008 in_progress'},
    {ts:'10:37:02',agent:'AI CMO',     msg:`Positive intent assumed — proceeding`},
  ]);
  const [modal, setModal]         = useState(false);
  const [liveStats, setLiveStats] = useState({ ...BASE_STATS[entity] });
  const tickRef = useRef(0);

  /* hash routing */
  useEffect(() => { window.location.hash = tab; }, [tab]);
  useEffect(() => {
    const onHash = () => setTab(hashTab());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  /* sync entity */
  useEffect(() => { setLiveStats({...BASE_STATS[entity]}); }, [entity]);

  /* live stat increment — every 1.8s */
  useEffect(() => {
    const t = setInterval(() => {
      setLiveStats(p => ({
        subs:       p.subs + Math.floor(Math.random()*3),
        views:      p.views + Math.floor(Math.random()*600+100),
        revenue:    p.revenue + (Math.random()>0.55 ? Math.floor(Math.random()*18+3) : 0),
        efficiency: p.efficiency + (Math.random()-0.48)*0.4,
      }));
    }, 1800);
    return () => clearInterval(t);
  }, []);

  /* exec agent state cycle — every 2.5s */
  useEffect(() => {
    const t = setInterval(() => {
      setAgents(prev => {
        const idx = tickRef.current % prev.length; tickRef.current++;
        return prev.map((a,i) => {
          if (i!==idx) return a;
          const ni = (STATUS_CYCLE.indexOf(a.status)+1)%STATUS_CYCLE.length;
          return {...a, status:STATUS_CYCLE[ni], tasks:a.tasks+(STATUS_CYCLE[ni]!=='idle'?1:0)};
        });
      });
    }, 2500);
    return () => clearInterval(t);
  }, []);

  /* activity log — every 3.2s */
  useEffect(() => {
    const t = setInterval(() => {
      setAgents(prev => {
        const active = prev.filter(a=>a.status!=='idle');
        if (!active.length) return prev;
        const a = active[Math.floor(Math.random()*active.length)];
        const msg = AUTO_LOGS[Math.floor(Math.random()*AUTO_LOGS.length)]();
        const ts  = new Date().toLocaleTimeString('en-US',{hour12:false});
        setLog(l => [{ts, agent:a.name, msg}, ...l.slice(0,49)]);
        return prev.map(x => x.id===a.id ? {...x, lastOutput:msg} : x);
      });
    }, 3200);
    return () => clearInterval(t);
  }, []);

  /* task bot lifecycle — every 2s */
  useEffect(() => {
    const t = setInterval(() => {
      setBots(prev => prev.map(bot => {
        const ticks = bot.ticks+1;
        const si = ['booting','active','running','thinking','complete'].indexOf(bot.status);
        const status = ticks%4===0 ? ['booting','active','running','thinking','complete'][(si+1)%5] : bot.status;
        const caps = {...bot.capabilities};
        const capK = Object.keys(caps)[ticks%8];
        caps[capK] = {...caps[capK], level:Math.min(4,caps[capK].level+(Math.random()>0.7?1:0)), active:Math.random()>0.2};
        const doubt = Math.random()<0.04;
        const entry = doubt ? `[DOUBT] Uncertain → returning to ${HOME_BASE}` : AUTO_LOGS[ticks%AUTO_LOGS.length]();
        return {...bot, ticks, status, doubt, capabilities:caps,
          task: doubt ? `Returning to ${HOME_BASE} — awaiting guidance` : bot.task,
          log: [entry, ...bot.log.slice(0,49)]};
      }));
    }, 2000);
    return () => clearInterval(t);
  }, []);

  const spawnBot = useCallback((task) => {
    const b = mkBot(task);
    setBots(p => [b, ...p]);
    const ts = new Date().toLocaleTimeString('en-US',{hour12:false});
    setLog(l => [{ts, agent:b.name, msg:`Task bot spawned → registered to ${HOME_BASE}`}, ...l.slice(0,49)]);
  }, []);

  const killBot = useCallback((id) => setBots(p=>p.filter(b=>b.id!==id)), []);
  const runExec = useCallback((id) => {
    setAgents(p=>p.map(a=>a.id===id?{...a,status:'thinking',tasks:a.tasks+1}:a));
    setTimeout(()=>setAgents(p=>p.map(a=>a.id===id?{...a,status:'complete'}:a)), 3000);
  }, []);

  const NAV = [
    {id:'analytics', label:'Analytics Core',  icon:BarChart3},
    {id:'workflows', label:'Visual Workflows', icon:GitBranch},
    {id:'ai',        label:'AI Agent Fleet',   icon:Brain},
    {id:'bots',      label:'Task Bots',        icon:Cpu},
    {id:'content',   label:'Content Engine',   icon:Video},
    {id:'revenue',   label:'Revenue Hub',      icon:Wallet},
    {id:'system',    label:'System Settings',  icon:Settings},
  ];

  const base = BASE_STATS[entity];

  return (
    <div className="flex h-screen bg-[#0d0e12] text-slate-100 font-sans overflow-hidden">
      {modal && <SpawnModal onSpawn={spawnBot} onClose={()=>setModal(false)} />}

      {/* Sidebar */}
      <aside className="w-64 bg-[#13151a] border-r border-orange-500/10 flex flex-col justify-between p-4 flex-shrink-0">
        <div>
          <div className="flex items-center gap-3 px-2 py-4 mb-6 border-b border-slate-800">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Sparkles className="h-4 w-4 text-white"/>
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-wide bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">AIOS CORE</h1>
              <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">v1.0.0 // Agent Active</p>
            </div>
          </div>
          <div className="px-2 mb-6">
            <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block mb-2">Workspace</label>
            <select value={entity} onChange={e=>setEntity(e.target.value)}
              className="w-full bg-[#1c1f26] border border-slate-800 rounded-md p-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500/50 cursor-pointer">
              <option value="all">Global Meta Hub (All)</option>
              <option value="brand_a">Primary Content Channel</option>
              <option value="brand_b">Digital Product Suite</option>
            </select>
          </div>
          <nav className="space-y-1">
            {NAV.map(({id,label,icon:Icon}) => {
              const active = tab===id;
              const badge = id==='ai'  ? agents.filter(a=>a.status!=='idle').length
                          : id==='bots' ? bots.length : 0;
              return (
                <button key={id} onClick={()=>setTab(id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${active?'bg-gradient-to-r from-amber-500/10 to-transparent border-l-2 border-orange-500 text-amber-400 font-semibold':'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'}`}>
                  <Icon className={`h-4 w-4 flex-shrink-0 ${active?'text-amber-500':''}`}/>
                  {label}
                  {badge>0 && <span className="ml-auto flex items-center gap-1 text-[9px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block"/>
                    {badge}
                  </span>}
                </button>
              );
            })}
          </nav>
        </div>
        <div className="border-t border-slate-800/60 pt-4 space-y-2">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/5 border border-amber-500/15">
            <Home className="h-3.5 w-3.5 text-amber-400 flex-shrink-0"/>
            <p className="text-[9px] text-amber-400/70 font-medium leading-tight">{HOME_BASE}</p>
          </div>
          <a href="https://skool.com" target="_blank" rel="noreferrer"
            className="flex items-center justify-between p-2 rounded-lg bg-[#1a1d24] border border-slate-800 hover:border-amber-500/30 text-xs text-slate-400 hover:text-slate-200 transition-all group">
            <div className="flex items-center gap-2"><Users className="h-3.5 w-3.5 text-amber-500"/><span>AI Income Lab</span></div>
            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity"/>
          </a>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#0a0b0d]">
        <header className="h-14 bg-[#13151a]/40 border-b border-slate-800/50 px-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <Radio className="h-3 w-3 text-emerald-500 animate-pulse"/>
            <span className="text-xs text-slate-400 font-medium">Local Engine Live</span>
            <span className="text-slate-700">·</span>
            <span className="text-[10px] text-amber-400/60 font-mono">{HOME_BASE}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={()=>setModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/10 border border-amber-500/30 rounded-lg text-[11px] font-bold text-amber-400 hover:brightness-125 transition-all">
              <Plus className="h-3 w-3"/> Spawn Bot
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1 bg-[#1a1d24] border border-slate-800 rounded-md text-[11px] text-slate-400 hover:text-slate-200 transition-all">
              <RefreshCw className="h-3 w-3"/> Refresh
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-100">{NAV.find(n=>n.id===tab)?.label} Operational Matrix</h2>
            <p className="text-xs text-slate-500">Real-time · registered to <span className="text-amber-400/70">{HOME_BASE}</span></p>
          </div>

          {/* ── Analytics ── */}
          {tab==='analytics' && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {label:'Subscribers / Leads',         val:fmt.subs(liveStats.subs),       delta:liveStats.subs-base.subs,       suffix:' today', hi:false},
                  {label:'Aggregate Video Impressions',  val:fmt.views(liveStats.views),     delta:liveStats.views-base.views,     suffix:'',        hi:false},
                  {label:'Gross Monthly Run Rate',       val:fmt.rev(liveStats.revenue),     delta:liveStats.revenue-base.revenue, suffix:'',        hi:true },
                  {label:'Automated System Efficiency',  val:fmt.eff(liveStats.efficiency),  delta:0,                              suffix:' live',   hi:false},
                ].map(({label,val,delta,suffix,hi}) => (
                  <div key={label} className="bg-[#13151a] border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden hover:border-orange-500/20 transition-all">
                    <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">{label}</span>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className={`text-xl font-bold tracking-tight tabular-nums ${hi?'text-amber-400':'text-slate-200'}`}>{val}</span>
                      <span className={`text-[10px] font-semibold ${delta>0?'text-emerald-500':'text-slate-500'}`}>
                        {delta>0?'+':''}{delta>0?(hi?fmt.rev(Math.floor(delta)):fmt.subs(Math.floor(delta))):''}{suffix}
                      </span>
                    </div>
                    <div className="absolute right-0 bottom-0 h-16 w-16 bg-orange-500/5 blur-[30px] rounded-full pointer-events-none"/>
                  </div>
                ))}
              </div>
              <div className="bg-[#13151a] border border-slate-800/80 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4"><Layers className="h-4 w-4 text-amber-500"/><h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Sub-Agent Synthesis Terminal</h3></div>
                <div className="bg-[#090a0d] border border-slate-900 rounded-lg p-4 font-mono text-xs space-y-2">
                  <p className="text-amber-500/80">[SYSTEM] Engine synchronized — scanning data logs…</p>
                  <p className="text-emerald-500/80">[SUCCESS] Local env files mapped. Secrets secure.</p>
                  <p className="text-sky-400/70">[HOME] Registered to {HOME_BASE} — positive intent assumed.</p>
                  <p className="text-slate-500">[INFO] Bots active: {bots.length} · Agents active: {agents.filter(a=>a.status!=='idle').length}</p>
                </div>
              </div>
            </>
          )}

          {/* ── Workflows ── */}
          {tab==='workflows' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-[10px] text-slate-500">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"/>Active</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block animate-pulse"/>Running</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-600 inline-block"/>Idle</span>
              </div>
              {PIPELINES.map(p => <Pipeline key={p.id} p={p}/>)}
              <div className="bg-[#13151a] border border-slate-800/80 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-5"><Brain className="h-4 w-4 text-amber-500"/><h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Multi-Agent Topology</h3></div>
                <div className="flex flex-col items-center gap-2 text-[10px] font-mono">
                  {[
                    {label:'gBrain — Agency Core',       color:'bg-amber-500/10 border-amber-500/25 text-amber-400'},
                    {label:'Hermes Orchestrator',         color:'bg-orange-500/10 border-orange-500/20 text-orange-400'},
                  ].map(({label,color}) => <><div className={`px-4 py-2 rounded-lg border font-bold text-xs ${color}`}>{label}</div><div className="text-slate-700">│</div></>)}
                  <div className="grid grid-cols-5 gap-2 w-full max-w-3xl">
                    {['Founder','CEO','CFO','COO/CMO','HR/PM'].map(l=>(
                      <div key={l} className="flex flex-col items-center gap-1">
                        <div className="w-px h-4 bg-slate-700 mx-auto"/>
                        <div className="px-2 py-1.5 rounded-lg bg-[#1a1d24] border border-slate-800 text-slate-400 text-[10px] text-center w-full">{l}</div>
                      </div>
                    ))}
                  </div>
                  <div className="text-slate-700">│</div>
                  <div className="grid grid-cols-3 gap-2 w-full max-w-lg">
                    {['Worker Bots','Task Manager','Sub-Agents'].map(l=>(
                      <div key={l} className="flex flex-col items-center gap-1">
                        <div className="w-px h-4 bg-slate-700 mx-auto"/>
                        <div className="px-2 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/15 text-sky-400 text-[10px] text-center w-full">{l}</div>
                      </div>
                    ))}
                  </div>
                  <div className="text-slate-700">│</div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/5 border border-amber-500/15">
                    <Home className="h-3 w-3 text-amber-400"/><span className="text-amber-400 font-bold">{HOME_BASE}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── AI Fleet ── */}
          {tab==='ai' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{agents.filter(a=>a.status!=='idle').length}/{agents.length} active</span>
                  <button onClick={()=>setAgents(p=>p.map(a=>({...a,status:'idle'})))} className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors">Reset All</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {agents.map(a => (
                    <div key={a.id} className={`bg-[#13151a] border rounded-xl p-4 flex flex-col gap-3 hover:border-orange-500/15 transition-all ${a.status!=='idle'?'border-slate-700/60':'border-slate-800/60'}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${SC[a.status]}`}>
                            <span className={`w-2 h-2 rounded-full ${SD[a.status]}`}/>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-200 leading-tight">{a.name}</p>
                            <p className="text-[10px] text-slate-500 leading-tight">{a.role}</p>
                          </div>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${SC[a.status]}`}>{a.status}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 border-l-2 border-slate-800 pl-2 italic leading-relaxed">{a.lastOutput}</p>
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1.5">
                          <Activity className="h-3 w-3 text-slate-600"/>
                          <span className="text-[10px] text-slate-600 tabular-nums">{a.tasks} tasks</span>
                          <span className="text-slate-800">·</span>
                          <span className="text-[10px] text-slate-700 font-mono">{a.model}</span>
                        </div>
                        <button onClick={()=>runExec(a.id)} className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors">Run</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-[#13151a] border border-slate-800/80 rounded-xl p-5 flex flex-col gap-4">
                <div className="flex items-center gap-2"><Activity className="h-4 w-4 text-amber-500"/><h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Activity</h3></div>
                <div className="bg-[#090a0d] border border-slate-900 rounded-lg p-3 space-y-1.5">
                  <p className="text-[9px] uppercase tracking-wider text-slate-600 font-bold mb-2">Model Routing</p>
                  {[['Orchestration','claude-opus-4-8','text-amber-400'],['Execution','claude-sonnet-4-6','text-sky-400'],['Fast','claude-haiku-4-5','text-violet-400'],['Local','gemma3:4b','text-emerald-400']].map(([l,m,c])=>(
                    <div key={m} className="flex items-center justify-between">
                      <span className="text-[9px] text-slate-600">{l}</span>
                      <span className={`text-[9px] font-mono font-bold ${c}`}>{m}</span>
                    </div>
                  ))}
                </div>
                <div className="flex-1 space-y-2 overflow-y-auto max-h-96">
                  {log.map((e,i)=>(
                    <div key={i} className="text-[10px] border-l-2 border-slate-800 pl-2.5 py-0.5">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-mono text-slate-600">{e.ts}</span>
                        <span className="font-bold text-amber-400/80">{e.agent}</span>
                      </div>
                      <p className="text-slate-500 leading-relaxed">{e.msg}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Task Bots ── */}
          {tab==='bots' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">{bots.length} bot{bots.length!==1?'s':''} running · home: <span className="text-amber-400 font-bold">{HOME_BASE}</span></p>
                <button onClick={()=>setModal(true)} className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold rounded-xl hover:brightness-110 transition-all">
                  <Plus className="h-3.5 w-3.5"/> Spawn New Bot
                </button>
              </div>
              <div className="bg-[#13151a] border border-slate-800/80 rounded-xl p-5">
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-3">Bot Soul — 8 Core Capabilities</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(BOT_SOUL).map(([k,def])=>{
                    const Icon=def.icon;
                    return <div key={k} className="flex items-start gap-2 p-2.5 rounded-lg" style={{background:def.color+'0d',border:`1px solid ${def.color}20`}}>
                      <Icon className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" style={{color:def.color}}/>
                      <div><p className="text-[10px] font-bold" style={{color:def.color}}>{def.label}</p><p className="text-[9px] text-slate-600 leading-tight">{def.desc}</p></div>
                    </div>;
                  })}
                </div>
                <div className="mt-3 flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/15">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400 flex-shrink-0"/>
                  <p className="text-[10px] text-amber-400/80">When in doubt: return to <strong>{HOME_BASE}</strong>. Positive intent assumed. Neglect → re-route, not punish.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {bots.map(b => <BotCard key={b.id} bot={b} onKill={killBot}/>)}
              </div>
            </div>
          )}

          {/* ── Content ── */}
          {tab==='content' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-[#13151a] border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Video & Automation Idea Bank</h3>
                <form onSubmit={e=>{e.preventDefault();if(!newIdea.trim())return;setIdeas(p=>[...p,{id:Date.now(),title:newIdea,status:'Backlog',phase:'Research'}]);setNewIdea('');}} className="flex gap-2">
                  <input type="text" placeholder="Capture new concept…" value={newIdea} onChange={e=>setNewIdea(e.target.value)}
                    className="flex-1 bg-[#1a1d24] border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500/50"/>
                  <button type="submit" className="bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold text-xs px-4 py-2 rounded-lg hover:brightness-110 transition-all">Deploy</button>
                </form>
                <div className="divide-y divide-slate-800/60">
                  {ideas.map(idea=>(
                    <div key={idea.id} className="py-3 flex items-center justify-between text-xs first:pt-0 last:pb-0">
                      <span className="font-medium text-slate-300">{idea.title}</span>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400">{idea.phase}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${idea.status==='In Progress'?'bg-amber-500/10 text-amber-500':'bg-slate-900 text-slate-500'}`}>{idea.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-[#13151a] border border-slate-800 rounded-xl p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Core Guidelines</h3>
                <blockquote className="border-l-2 border-orange-500/40 pl-3 py-1 text-xs text-slate-400 italic">
                  "Assume positive intent. Return to {HOME_BASE} when uncertain. Build clean-room — never steal."
                </blockquote>
              </div>
            </div>
          )}

          {/* ── Revenue ── */}
          {tab==='revenue' && (
            <div className="bg-[#13151a] border border-slate-800 rounded-xl p-6 text-center max-w-xl mx-auto space-y-3">
              <Wallet className="h-8 w-8 text-amber-500 mx-auto stroke-[1.5]"/>
              <h3 className="text-sm font-bold text-slate-200">Financial Ledger Streams</h3>
              <p className="text-xs text-slate-400">Live run rate: <span className="text-amber-400 font-bold tabular-nums">{fmt.rev(liveStats.revenue)}/mo</span></p>
            </div>
          )}

          {/* ── System ── */}
          {tab==='system' && (
            <div className="bg-[#13151a] border border-slate-800 rounded-xl p-5 space-y-4 max-w-2xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Environment Nodes</h3>
              <div className="space-y-3">
                {[['YouTube Data API Key','••••••••••••••••••••••••••••••••','password'],
                  ['Render Pipeline','remotion-ui-pro-max-pipeline','text'],
                  ['GHL Location ID','5opdoL1faiu1kTiGZ1Vx','text'],
                  ['Home Base',HOME_BASE,'text']].map(([l,v,t])=>(
                  <div key={l}>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">{l}</label>
                    <input type={t} value={v} disabled className="w-full bg-[#1a1d24] border border-slate-800/80 rounded-md p-2 text-xs text-slate-500 cursor-not-allowed"/>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
