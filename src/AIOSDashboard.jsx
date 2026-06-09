import { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard, Video, BarChart3, Wallet,
  Settings, Users, Layers, ExternalLink,
  Sparkles, RefreshCw, Radio, GitBranch,
  Brain, ChevronRight, CheckCircle2, Clock,
  AlertCircle, Zap, Database, Globe, Code2,
  TrendingUp, MessageSquare, Cpu, Activity
} from 'lucide-react';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const ENTITY_DATA = {
  all:     { subscribers: '342.5K', views: '12.4M', revenue: '$18,450', efficiency: '94%' },
  brand_a: { subscribers: '120.3K', views: '4.1M',  revenue: '$5,200',  efficiency: '91%' },
  brand_b: { subscribers: '222.2K', views: '8.3M',  revenue: '$13,250', efficiency: '96%' }
};

const INITIAL_IDEAS = [
  { id: 1, title: 'Building a Local LLM Workflow with Ollama',          status: 'In Progress', phase: 'Scripting' },
  { id: 2, title: 'How I Built an Automated UGC Content Engine',         status: 'Backlog',     phase: 'Research' },
  { id: 3, title: 'Next-Gen Video Pipelines using Programmatic Rendering', status: 'Approved', phase: 'Storyboarding' }
];

// ─── Workflow Pipeline Data ───────────────────────────────────────────────────

const PIPELINES = [
  {
    id: 'content',
    label: 'Content Production Pipeline',
    color: '#f59e0b',
    nodes: [
      { id: 'idea',     label: 'Idea Bank',       icon: Sparkles,    status: 'active',  detail: 'Claude generates 5 concepts/day' },
      { id: 'script',   label: 'Script Engine',   icon: Code2,       status: 'active',  detail: 'Ollama drafts → Claude edits' },
      { id: 'render',   label: 'Remotion Render', icon: Video,       status: 'running', detail: '3 jobs queued' },
      { id: 'review',   label: 'AI Review',       icon: Brain,       status: 'idle',    detail: 'Awaiting render output' },
      { id: 'publish',  label: 'Publish / GHL',   icon: Globe,       status: 'idle',    detail: 'Auto-post on approval' },
    ]
  },
  {
    id: 'lead',
    label: 'Lead Routing Pipeline (UMAS)',
    color: '#10b981',
    nodes: [
      { id: 'webhook',  label: 'GHL Webhook',     icon: Radio,       status: 'active',  detail: 'Receiving form submits' },
      { id: 'classify', label: 'Lead Classifier', icon: Brain,       status: 'active',  detail: 'Apps Script → tags + notes' },
      { id: 'route',    label: 'Route Agent',      icon: GitBranch,   status: 'running', detail: 'Urgent → assign within 1hr' },
      { id: 'crm',      label: 'CRM Update',       icon: Database,    status: 'active',  detail: 'Contact tagged + noted' },
      { id: 'log',      label: 'Sheet Log',        icon: Layers,      status: 'active',  detail: 'Lead Log tab updated' },
    ]
  },
  {
    id: 'seo',
    label: 'SEO Deploy Pipeline',
    color: '#6366f1',
    nodes: [
      { id: 'research', label: 'Keyword Research', icon: TrendingUp,  status: 'idle',    detail: 'Awaiting next sprint' },
      { id: 'copy',     label: 'Copy Generation',  icon: MessageSquare, status: 'idle',  detail: '10 blog posts queued' },
      { id: 'schema',   label: 'Schema Markup',    icon: Code2,       status: 'active',  detail: 'Live in GHL head code' },
      { id: 'deploy',   label: 'GHL Deploy',       icon: Globe,       status: 'active',  detail: 'Auto via API' },
      { id: 'audit',    label: 'Audit Score',      icon: CheckCircle2, status: 'idle',   detail: 'Run after deploy' },
    ]
  }
];

// ─── AI Agent Fleet Data ──────────────────────────────────────────────────────

const INITIAL_AGENTS = [
  { id: 'founder',  name: 'AI Founder',      role: 'Vision & company thesis',   model: 'claude-opus-4-8',    tasks: 12, status: 'idle',     lastOutput: 'Defined Q3 product thesis for UMAS and Santoshland.' },
  { id: 'ceo',      name: 'AI CEO',          role: 'Priorities & decisions',    model: 'claude-sonnet-4-6',  tasks: 34, status: 'thinking', lastOutput: 'Assigned SEO sprint to CMO. Requested lead report from COO.' },
  { id: 'cfo',      name: 'AI CFO',          role: 'Revenue, budget & risk',    model: 'claude-haiku-4-5',   tasks: 8,  status: 'idle',     lastOutput: 'Monthly burn is $0. Gross margin 94%. No risk flags.' },
  { id: 'coo',      name: 'AI COO',          role: 'Operations & SOPs',         model: 'claude-sonnet-4-6',  tasks: 21, status: 'complete', lastOutput: 'Lead router SOP documented. GHL webhook live.' },
  { id: 'cmo',      name: 'AI CMO',          role: 'Marketing & growth',        model: 'claude-sonnet-4-6',  tasks: 47, status: 'running',  lastOutput: 'Deploying 10 UMAS blog posts. Santoshland quiz live.' },
  { id: 'hr',       name: 'HR Bot',          role: 'People & accountability',   model: 'gemma3:4b',          tasks: 3,  status: 'idle',     lastOutput: 'No open roles. Team structure documented.' },
  { id: 'worker',   name: 'Worker Bot',      role: 'Execution & production',    model: 'qwen2.5-coder:7b',   tasks: 89, status: 'running',  lastOutput: 'Writing Santoshland services copy. 3 pages complete.' },
  { id: 'tasks',    name: 'Task Manager',    role: 'Task tracking & blockers',  model: 'gemma3:4b',          tasks: 156, status: 'active',  lastOutput: 'UMAS task_005 complete. task_008 in progress. 2 blockers.' },
];

const STATUS_COLOR = {
  idle:     'text-slate-500 bg-slate-800',
  thinking: 'text-amber-400 bg-amber-500/10',
  running:  'text-emerald-400 bg-emerald-500/10',
  active:   'text-sky-400 bg-sky-500/10',
  complete: 'text-violet-400 bg-violet-500/10',
  error:    'text-red-400 bg-red-500/10',
};

const STATUS_DOT = {
  idle:     'bg-slate-600',
  thinking: 'bg-amber-400 pulse-dot',
  running:  'bg-emerald-400 pulse-dot',
  active:   'bg-sky-400 pulse-dot',
  complete: 'bg-violet-400',
  error:    'bg-red-400 pulse-dot',
};

// ─── Sub-Components ───────────────────────────────────────────────────────────

function NodeStatus({ status }) {
  const map = { active: 'bg-emerald-500', running: 'bg-amber-400 pulse-dot', idle: 'bg-slate-600' };
  return <span className={`inline-block w-2 h-2 rounded-full ${map[status] || 'bg-slate-600'}`} />;
}

function WorkflowPipeline({ pipeline }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-[#13151a] border border-slate-800/80 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-800/20 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full pulse-dot" style={{ background: pipeline.color }} />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">{pipeline.label}</span>
        </div>
        <ChevronRight className={`h-4 w-4 text-slate-500 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>

      {/* Node strip */}
      <div className="px-5 pb-4 overflow-x-auto">
        <div className="flex items-center gap-0 min-w-max">
          {pipeline.nodes.map((node, i) => {
            const Icon = node.icon;
            return (
              <div key={node.id} className="flex items-center">
                {/* Node */}
                <div className={`group flex flex-col items-center gap-1.5 w-28 cursor-default`}>
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center border transition-all"
                    style={{
                      borderColor: node.status === 'idle' ? '#1e2635' : pipeline.color + '40',
                      background: node.status === 'idle' ? '#1c1f26' : pipeline.color + '15',
                    }}
                  >
                    <Icon className="h-4.5 w-4.5" style={{ color: node.status === 'idle' ? '#475569' : pipeline.color }} />
                  </div>
                  <div className="flex items-center gap-1">
                    <NodeStatus status={node.status} />
                    <span className="text-[10px] font-semibold text-slate-400 text-center leading-tight">{node.label}</span>
                  </div>
                  {/* Tooltip on hover */}
                  <span className="text-[9px] text-slate-600 text-center leading-tight max-w-[100px]">{node.detail}</span>
                </div>
                {/* Connector */}
                {i < pipeline.nodes.length - 1 && (
                  <div className="flex items-center w-6 flex-shrink-0 -mt-6">
                    <div className="h-[1px] flex-1" style={{ background: `linear-gradient(90deg, ${pipeline.color}60, ${pipeline.color}20)` }} />
                    <div style={{ color: pipeline.color + '80', fontSize: 8 }}>▶</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AgentCard({ agent, onRun }) {
  const Icon = Cpu;
  return (
    <div className={`bg-[#13151a] border rounded-xl p-4 flex flex-col gap-3 transition-all hover:border-orange-500/15 ${agent.status !== 'idle' ? 'border-slate-700/60' : 'border-slate-800/60'}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${STATUS_COLOR[agent.status]}`}>
            <span className={`w-2 h-2 rounded-full ${STATUS_DOT[agent.status]}`} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-200 leading-tight">{agent.name}</p>
            <p className="text-[10px] text-slate-500 leading-tight">{agent.role}</p>
          </div>
        </div>
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${STATUS_COLOR[agent.status]}`}>
          {agent.status}
        </span>
      </div>

      {/* Last output */}
      <p className="text-[10px] text-slate-500 leading-relaxed border-l-2 border-slate-800 pl-2 italic">
        {agent.lastOutput}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5">
          <Activity className="h-3 w-3 text-slate-600" />
          <span className="text-[10px] text-slate-600">{agent.tasks} tasks</span>
          <span className="text-slate-800 text-[10px]">·</span>
          <span className="text-[10px] text-slate-700 font-mono">{agent.model}</span>
        </div>
        <button
          onClick={() => onRun(agent.id)}
          className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors"
        >
          Run
        </button>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function AIOSDashboard() {
  const [activeTab, setActiveTab]         = useState('analytics');
  const [selectedEntity, setSelectedEntity] = useState('all');
  const [ideas, setIdeas]                 = useState(INITIAL_IDEAS);
  const [agents, setAgents]               = useState(INITIAL_AGENTS);
  const [newIdea, setNewIdea]             = useState('');
  const [agentLog, setAgentLog]           = useState([
    { ts: '10:42:01', agent: 'AI CEO', msg: 'Assigned SEO content sprint → AI CMO' },
    { ts: '10:41:33', agent: 'Worker Bot', msg: 'Santoshland services page — 3/6 sections complete' },
    { ts: '10:40:11', agent: 'AI COO', msg: 'GHL webhook verified live — UMAS lead router online' },
    { ts: '10:38:55', agent: 'Task Manager', msg: 'task_005 marked complete. task_008 set to in_progress' },
    { ts: '10:37:02', agent: 'AI CMO', msg: 'Quiz redirect fixed → booking.html?dosha= param added' },
  ]);

  // ── Infinite simulation engine ─────────────────────────────────────────────
  const tickRef = useRef(0);

  const AUTO_LOGS = [
    (a) => `Completed subtask: drafted ${['homepage copy','blog outline','SEO brief','email sequence','landing page'][Math.floor(Math.random()*5)]}`,
    (a) => `Routed new lead → tagged service-${['personal-care','companion-care','dementia-care'][Math.floor(Math.random()*3)]}`,
    (a) => `Memory updated: session checkpoint saved to .memory/`,
    (a) => `Model call complete (${['1.2s','0.9s','2.1s','1.7s'][Math.floor(Math.random()*4)]} latency)`,
    (a) => `Pipeline node advanced: ${['Script Engine','Remotion Render','GHL Deploy','AI Review'][Math.floor(Math.random()*4)]} ✓`,
    (a) => `Spawned sub-agent for ${['keyword clustering','schema validation','form QA','copy review'][Math.floor(Math.random()*4)]}`,
    (a) => `Token usage within budget — ${Math.floor(Math.random()*40+60)}% efficiency`,
    (a) => `Task queued: ${['update sitemap','compress images','A/B test CTA','retarget segment'][Math.floor(Math.random()*4)]}`,
  ];

  const STATUS_CYCLE = ['idle','thinking','running','active','complete'];

  useEffect(() => {
    // Agent state cycle — every 2.5s one random agent advances
    const agentCycle = setInterval(() => {
      setAgents(prev => {
        const idx = tickRef.current % prev.length;
        tickRef.current += 1;
        return prev.map((a, i) => {
          if (i !== idx) return a;
          const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(a.status) + 1) % STATUS_CYCLE.length];
          return { ...a, status: next, tasks: a.tasks + (next !== 'idle' ? 1 : 0) };
        });
      });
    }, 2500);

    // Activity log — new entry every 3.2s
    const logCycle = setInterval(() => {
      setAgents(prev => {
        const active = prev.filter(a => a.status !== 'idle');
        if (!active.length) return prev;
        const agent = active[Math.floor(Math.random() * active.length)];
        const msg = AUTO_LOGS[Math.floor(Math.random() * AUTO_LOGS.length)](agent);
        const ts = new Date().toLocaleTimeString('en-US', { hour12: false });
        setAgentLog(log => [{ ts, agent: agent.name, msg }, ...log.slice(0, 29)]);
        // update lastOutput on the agent
        return prev.map(a => a.id === agent.id ? { ...a, lastOutput: msg } : a);
      });
    }, 3200);

    // Workflow node cycle — every 5s one pipeline node flips
    const workflowCycle = setInterval(() => {
      const states = ['active', 'running', 'idle'];
      // We just re-render; in a real system you'd mutate pipeline state
      // For now this keeps the pulse animation meaningful via agent log updates
    }, 5000);

    return () => {
      clearInterval(agentCycle);
      clearInterval(logCycle);
      clearInterval(workflowCycle);
    };
  }, []);

  const handleAddIdea = (e) => {
    e.preventDefault();
    if (!newIdea.trim()) return;
    setIdeas([...ideas, { id: Date.now(), title: newIdea, status: 'Backlog', phase: 'Research' }]);
    setNewIdea('');
  };

  const handleRunAgent = (agentId) => {
    setAgents(prev => prev.map(a =>
      a.id === agentId ? { ...a, status: 'thinking', tasks: a.tasks + 1 } : a
    ));
    const agent = agents.find(a => a.id === agentId);
    const ts = new Date().toLocaleTimeString('en-US', { hour12: false });
    setAgentLog(prev => [
      { ts, agent: agent.name, msg: `Manually triggered. Processing…` },
      ...prev.slice(0, 19)
    ]);
    setTimeout(() => {
      setAgents(prev => prev.map(a =>
        a.id === agentId ? { ...a, status: 'complete' } : a
      ));
    }, 3000);
  };

  const NAV = [
    { id: 'analytics',  label: 'Analytics Core',     icon: BarChart3  },
    { id: 'workflows',  label: 'Visual Workflows',    icon: GitBranch  },
    { id: 'ai',         label: 'AI Agent Fleet',      icon: Brain      },
    { id: 'content',    label: 'Content Engine',      icon: Video      },
    { id: 'revenue',    label: 'Revenue Hub',         icon: Wallet     },
    { id: 'system',     label: 'System Settings',     icon: Settings   },
  ];

  return (
    <div className="flex h-screen bg-[#0d0e12] text-slate-100 font-sans overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className="w-64 bg-[#13151a] border-r border-orange-500/10 flex flex-col justify-between p-4 flex-shrink-0">
        <div>
          {/* Brand */}
          <div className="flex items-center gap-3 px-2 py-4 mb-6 border-b border-slate-800">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-wide bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">AIOS CORE</h1>
              <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">v1.0.0 // Agent Active</p>
            </div>
          </div>

          {/* Entity filter */}
          <div className="px-2 mb-6">
            <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block mb-2">Workspace Focus</label>
            <select
              value={selectedEntity}
              onChange={e => setSelectedEntity(e.target.value)}
              className="w-full bg-[#1c1f26] border border-slate-800 rounded-md p-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500/50 cursor-pointer"
            >
              <option value="all">Global Meta Hub (All)</option>
              <option value="brand_a">Primary Content Channel</option>
              <option value="brand_b">Digital Product Suite / SaaS</option>
            </select>
          </div>

          {/* Nav */}
          <nav className="space-y-1">
            {NAV.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500/10 to-transparent border-l-2 border-orange-500 text-amber-400 font-semibold'
                      : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-amber-500' : ''}`} />
                  {item.label}
                  {item.id === 'ai' && (
                    <span className="ml-auto text-[9px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded font-bold">
                      {agents.filter(a => a.status !== 'idle').length} live
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick links */}
        <div className="border-t border-slate-800/60 pt-4 space-y-2">
          <a
            href="https://skool.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between p-2 rounded-lg bg-[#1a1d24] border border-slate-800 hover:border-amber-500/30 text-xs text-slate-400 hover:text-slate-200 transition-all group"
          >
            <div className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5 text-amber-500" />
              <span>AI Income Lab</span>
            </div>
            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#0a0b0d]">

        {/* Status bar */}
        <header className="h-14 bg-[#13151a]/40 border-b border-slate-800/50 px-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Radio className="h-3 w-3 text-emerald-500 animate-pulse" />
            <span className="text-xs text-slate-400 font-medium">Local Engine Synchronized via DevPort 3000</span>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1 bg-[#1a1d24] border border-slate-800 rounded-md text-[11px] font-medium text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-all">
            <RefreshCw className="h-3 w-3" /> Refresh Streams
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          <div>
            <h2 className="text-lg font-bold tracking-tight capitalize text-slate-100">
              {NAV.find(n => n.id === activeTab)?.label} Operational Matrix
            </h2>
            <p className="text-xs text-slate-500">Real-time parameters for selected business sub-nodes.</p>
          </div>

          {/* ── Analytics ── */}
          {activeTab === 'analytics' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: 'Subscribers / Leads',       value: ENTITY_DATA[selectedEntity].subscribers, change: '+4.2%' },
                  { label: 'Aggregate Video Impressions', value: ENTITY_DATA[selectedEntity].views,       change: '+12.8%' },
                  { label: 'Gross Monthly Run Rate',     value: ENTITY_DATA[selectedEntity].revenue,     change: '+8.1%', highlight: true },
                  { label: 'Automated System Efficiency', value: ENTITY_DATA[selectedEntity].efficiency, change: 'Stable' }
                ].map((stat, idx) => (
                  <div key={idx} className="bg-[#13151a] border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden hover:border-orange-500/20 transition-all">
                    <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">{stat.label}</span>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className={`text-xl font-bold tracking-tight ${stat.highlight ? 'text-amber-400' : 'text-slate-200'}`}>{stat.value}</span>
                      <span className="text-[10px] font-semibold text-emerald-500">{stat.change}</span>
                    </div>
                    <div className="absolute right-0 bottom-0 h-16 w-16 bg-orange-500/5 blur-[30px] rounded-full pointer-events-none" />
                  </div>
                ))}
              </div>

              <div className="bg-[#13151a] border border-slate-800/80 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Layers className="h-4 w-4 text-amber-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Sub-Agent Synthesis</h3>
                </div>
                <div className="bg-[#090a0d] border border-slate-900 rounded-lg p-4 font-mono text-xs text-slate-400 space-y-2">
                  <p className="text-amber-500/80">[SYSTEM] Scanning YouTube Engine Data Logs...</p>
                  <p className="text-emerald-500/80">[SUCCESS] Verified local environmental files (.env) mapped securely.</p>
                  <p className="text-slate-500">[INFO] Recommend: Deploy programmatic short-form video variations to scale conversion paths to $1k/day velocity.</p>
                </div>
              </div>
            </>
          )}

          {/* ── Visual Workflows ── */}
          {activeTab === 'workflows' && (
            <div className="space-y-4">
              {/* Legend */}
              <div className="flex items-center gap-4 text-[10px] text-slate-500">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Active</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block pulse-dot" /> Running</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-600 inline-block" /> Idle</span>
              </div>

              {PIPELINES.map(p => <WorkflowPipeline key={p.id} pipeline={p} />)}

              {/* Architecture diagram */}
              <div className="bg-[#13151a] border border-slate-800/80 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-5">
                  <LayoutDashboard className="h-4 w-4 text-amber-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Multi-Agent Topology</h3>
                </div>
                <div className="flex flex-col items-center gap-2 text-[10px] font-mono">
                  {/* Tier 1 */}
                  <div className="px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-400 font-bold text-xs">
                    gBrain — Agency Core
                  </div>
                  <div className="text-slate-700">│</div>
                  {/* Tier 2 */}
                  <div className="px-4 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 font-bold text-xs">
                    Hermes Orchestrator — Task Decomposition & Version Evaluator
                  </div>
                  <div className="text-slate-700">│</div>
                  {/* Tier 3 */}
                  <div className="grid grid-cols-5 gap-3 w-full max-w-3xl">
                    {['Founder', 'CEO', 'CFO', 'COO / CMO', 'HR / PM'].map(label => (
                      <div key={label} className="flex flex-col items-center gap-1">
                        <div className="w-2 h-4 border-l border-slate-700 mx-auto" />
                        <div className="px-2 py-1.5 rounded-lg bg-[#1a1d24] border border-slate-800 text-slate-400 text-[10px] text-center w-full">
                          {label}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-slate-700">│</div>
                  {/* Tier 4 */}
                  <div className="grid grid-cols-3 gap-3 w-full max-w-xl">
                    {['Worker Bots', 'Task Manager', 'Sub-Agents'].map(label => (
                      <div key={label} className="flex flex-col items-center gap-1">
                        <div className="w-2 h-4 border-l border-slate-700 mx-auto" />
                        <div className="px-2 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/15 text-sky-400 text-[10px] text-center w-full">
                          {label}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-slate-700">│</div>
                  {/* Tier 5 */}
                  <div className="grid grid-cols-4 gap-3 w-full max-w-2xl">
                    {['UMAS Pod', 'Santoshland Pod', 'Content Pod', 'GHL / SEO Pod'].map(label => (
                      <div key={label} className="flex flex-col items-center gap-1">
                        <div className="w-2 h-4 border-l border-slate-700 mx-auto" />
                        <div className="px-2 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/15 text-violet-400 text-[10px] text-center w-full">
                          {label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── AI Agent Fleet ── */}
          {activeTab === 'ai' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Agent grid */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {agents.filter(a => a.status !== 'idle').length} of {agents.length} agents active
                  </span>
                  <button
                    onClick={() => setAgents(prev => prev.map(a => ({ ...a, status: 'idle' })))}
                    className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    Reset All
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {agents.map(agent => (
                    <AgentCard key={agent.id} agent={agent} onRun={handleRunAgent} />
                  ))}
                </div>
              </div>

              {/* Activity log */}
              <div className="bg-[#13151a] border border-slate-800/80 rounded-xl p-5 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-amber-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Activity Log</h3>
                </div>

                {/* Model routing legend */}
                <div className="bg-[#090a0d] border border-slate-900 rounded-lg p-3 space-y-1.5">
                  <p className="text-[9px] uppercase tracking-wider text-slate-600 font-bold mb-2">Model Routing</p>
                  {[
                    { label: 'Orchestration / Review',   model: 'claude-opus-4-8',   color: 'text-amber-400' },
                    { label: 'Execution / Decisions',    model: 'claude-sonnet-4-6', color: 'text-sky-400' },
                    { label: 'Fast / Drafting',          model: 'claude-haiku-4-5',  color: 'text-violet-400' },
                    { label: 'Local / Private',          model: 'gemma3:4b / qwen',  color: 'text-emerald-400' },
                  ].map(row => (
                    <div key={row.model} className="flex items-center justify-between">
                      <span className="text-[9px] text-slate-600">{row.label}</span>
                      <span className={`text-[9px] font-mono font-bold ${row.color}`}>{row.model}</span>
                    </div>
                  ))}
                </div>

                {/* Log entries */}
                <div className="flex-1 space-y-2 overflow-y-auto max-h-80">
                  {agentLog.map((entry, i) => (
                    <div key={i} className="text-[10px] border-l-2 border-slate-800 pl-2.5 py-0.5">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-mono text-slate-600">{entry.ts}</span>
                        <span className="font-bold text-amber-400/80">{entry.agent}</span>
                      </div>
                      <p className="text-slate-500 leading-relaxed">{entry.msg}</p>
                    </div>
                  ))}
                </div>

                {/* Memory layer status */}
                <div className="bg-[#090a0d] border border-slate-900 rounded-lg p-3">
                  <p className="text-[9px] uppercase tracking-wider text-slate-600 font-bold mb-2">Memory Engine</p>
                  <div className="space-y-1">
                    {[
                      { label: 'Short-term (context)', status: 'active' },
                      { label: 'Long-term (CrewAI SQLite)', status: 'active' },
                      { label: 'Mem0 (Qdrant)', status: 'offline' },
                      { label: 'Session log (.md)', status: 'active' },
                    ].map(m => (
                      <div key={m.label} className="flex items-center justify-between">
                        <span className="text-[9px] text-slate-600">{m.label}</span>
                        <span className={`text-[9px] font-bold ${m.status === 'active' ? 'text-emerald-500' : 'text-red-500/60'}`}>
                          {m.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Content Engine ── */}
          {activeTab === 'content' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-[#13151a] border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Video & Automation Idea Asset Bank</h3>
                <form onSubmit={handleAddIdea} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Capture new system concept layout..."
                    value={newIdea}
                    onChange={e => setNewIdea(e.target.value)}
                    className="flex-1 bg-[#1a1d24] border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500/50"
                  />
                  <button type="submit" className="bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold text-xs px-4 py-2 rounded-lg hover:brightness-110 transition-all">
                    Deploy Concept
                  </button>
                </form>
                <div className="divide-y divide-slate-800/60">
                  {ideas.map(idea => (
                    <div key={idea.id} className="py-3 flex items-center justify-between text-xs first:pt-0 last:pb-0">
                      <span className="font-medium text-slate-300">{idea.title}</span>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-medium text-slate-400">{idea.phase}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${idea.status === 'In Progress' ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-900 text-slate-500'}`}>{idea.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-[#13151a] border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Core Prompt Guidelines</h3>
                <blockquote className="border-l-2 border-orange-500/40 pl-3 py-1 text-xs text-slate-400 italic">
                  "Maintain programmatic parameters. Prioritize system engineering logic over generic descriptions when scaling design variations."
                </blockquote>
              </div>
            </div>
          )}

          {/* ── Revenue ── */}
          {activeTab === 'revenue' && (
            <div className="bg-[#13151a] border border-slate-800 rounded-xl p-6 text-center max-w-xl mx-auto space-y-3">
              <Wallet className="h-8 w-8 text-amber-500 mx-auto stroke-[1.5]" />
              <h3 className="text-sm font-bold text-slate-200">Financial Ledger Streams</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Bind webhooks or financial integration vectors to parse live conversion counts. GHL tracked links active.
              </p>
            </div>
          )}

          {/* ── System ── */}
          {activeTab === 'system' && (
            <div className="bg-[#13151a] border border-slate-800 rounded-xl p-5 space-y-4 max-w-2xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Environment Node Variables</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">YouTube Data API Endpoint Key</label>
                  <input type="password" value="••••••••••••••••••••••••••••••••" disabled className="w-full bg-[#1a1d24] border border-slate-800/80 rounded-md p-2 text-xs text-slate-500 cursor-not-allowed" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Workspace Render Integration Pipeline</label>
                  <input type="text" value="remotion-ui-pro-max-pipeline" disabled className="w-full bg-[#1a1d24] border border-slate-800/80 rounded-md p-2 text-xs text-slate-500 cursor-not-allowed" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">GHL Location ID</label>
                  <input type="text" value="5opdoL1faiu1kTiGZ1Vx" disabled className="w-full bg-[#1a1d24] border border-slate-800/80 rounded-md p-2 text-xs text-slate-500 cursor-not-allowed" />
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
