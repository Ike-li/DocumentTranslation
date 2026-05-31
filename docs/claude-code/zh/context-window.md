> ## 文档索引
> 在此获取完整文档索引：https://code.claude.com/docs/llms.txt
> 使用此文件发现所有可用页面，然后再进一步探索。

# 探索上下文窗口

> 一个交互式模拟，展示 Claude Code 的上下文窗口在会话中如何填充。了解哪些内容自动加载、每次文件读取的代价，以及规则和钩子何时触发。

export const ContextWindow = () => {
  const MAX = 200000;
  const STARTUP_END = 0.2;
  {}
  const EVENTS = useMemo(() => [{}, {
    t: 0.015,
    kind: 'auto',
    label: '系统提示词',
    tokens: 4200,
    color: '#6B6964',
    vis: 'hidden',
    desc: '关于行为、工具使用和响应格式的核心指令。始终首先加载。你永远不会看到它。',
    link: null
  }, {
    t: 0.035,
    kind: 'auto',
    label: '自动记忆 (MEMORY.md)',
    tokens: 680,
    color: '#E8A45C',
    vis: 'hidden',
    desc: "Claude 在之前的会话中给自己记的笔记：它学到的构建命令、发现的模式、需要避免的错误。前 200 行或 25KB（以先到者为准）会被加载到对话上下文中。",
    link: '/zh/memory#auto-memory'
  }, {
    t: 0.06,
    kind: 'auto',
    label: '环境信息',
    tokens: 280,
    color: '#6B6964',
    vis: 'hidden',
    desc: '工作目录、平台、shell、操作系统版本，以及是否是 git 仓库。Git 分支、状态和最近提交作为单独的块在系统提示词的最末尾加载。',
    link: null
  }, {
    t: 0.08,
    kind: 'auto',
    label: 'MCP 工具（延迟加载）',
    tokens: 120,
    color: '#9B7BC4',
    vis: 'hidden',
    desc: '列出 MCP 工具名称，让 Claude 知道有哪些可用。默认情况下，完整 schema 保持延迟加载状态，Claude 在任务需要时通过工具搜索按需加载特定 schema。设置 `ENABLE_TOOL_SEARCH=auto` 可在 schema 占上下文窗口 10% 以内时预先加载，设置 `ENABLE_TOOL_SEARCH=false` 可加载全部。',
    link: '/zh/mcp#scale-with-mcp-tool-search'
  }, {
    t: 0.1,
    kind: 'auto',
    label: '技能描述',
    tokens: 450,
    color: '#D4A843',
    vis: 'hidden',
    noSurviveCompact: true,
    desc: '可用技能的单行描述，让 Claude 知道可以调用什么。完整技能内容仅在 Claude 实际使用时才加载。设置了 `disable-model-invocation: true` 的技能不在此列表中，它们完全不会进入上下文，直到你用 `/name` 调用它们。与其他启动内容不同，此列表在 `/compact` 后不会重新注入，只有你实际调用的技能才会被保留。',
    link: '/zh/skills'
  }, {
    t: 0.12,
    kind: 'auto',
    label: '~/.claude/CLAUDE.md',
    tokens: 320,
    color: '#6A9BCC',
    vis: 'hidden',
    desc: '你的全局偏好设置。适用于每个项目。在每次对话开始时与项目指令一起加载。',
    link: '/zh/memory#choose-where-to-put-claude-md-files'
  }, {
    t: 0.14,
    kind: 'auto',
    label: '项目 CLAUDE.md',
    tokens: 1800,
    color: '#6A9BCC',
    vis: 'hidden',
    desc: '项目约定、构建命令、架构说明。你能创建的最重要的文件。位于项目根目录，因此整个团队都会获得相同的指令。',
    tip: '保持在 200 行以内。将参考内容移到技能或路径作用域规则中，这样只在需要时才加载。',
    link: '/zh/memory'
  }, {}, {
    t: 0.22,
    kind: 'user',
    label: '你的提示词',
    tokens: 45,
    color: '#558A42',
    vis: 'full',
    desc: '"修复 token 刷新后用户收到 401 的认证 bug"',
    link: null
  }, {}, {
    t: 0.28,
    kind: 'claude',
    label: '读取 src/api/auth.ts',
    tokens: 2400,
    color: '#8A8880',
    vis: 'brief',
    desc: '主要认证文件。你在终端中看到"读取 auth.ts"，但 2,400 个 token 的文件内容只有 Claude 能看到。',
    tip: '文件读取主导上下文使用。在提示词中具体描述（"修复 auth.ts 中的 bug"）让 Claude 读取更少的文件。对于研究密集型任务，使用子代理。',
    link: null
  }, {
    t: 0.32,
    kind: 'claude',
    label: '读取 src/lib/tokens.ts',
    tokens: 1100,
    color: '#8A8880',
    vis: 'brief',
    desc: '追踪导入到 token 模块。在终端中显示为一行。',
    link: null
  }, {
    t: 0.35,
    kind: 'auto',
    label: '规则：api-conventions.md',
    tokens: 380,
    color: '#4A9B8E',
    vis: 'brief',
    desc: '`.claude/rules/` 中的此规则有一个匹配 `src/api/**` 的 `paths:` 模式。当 Claude 读取该目录中的文件时自动加载。你在终端中看到"已加载 .claude/rules/api-conventions.md"，但看不到规则内容。',
    link: '/zh/memory#path-specific-rules'
  }, {
    t: 0.38,
    kind: 'claude',
    label: '读取 middleware.ts',
    tokens: 1800,
    color: '#8A8880',
    vis: 'brief',
    desc: '更深入地追踪认证流程。',
    link: null
  }, {
    t: 0.41,
    kind: 'claude',
    label: '读取 auth.test.ts',
    tokens: 1600,
    color: '#8A8880',
    vis: 'brief',
    desc: '检查现有测试中的预期行为。',
    link: null
  }, {
    t: 0.44,
    kind: 'auto',
    label: '规则：testing.md',
    tokens: 290,
    color: '#4A9B8E',
    vis: 'brief',
    desc: '另一个路径作用域规则，匹配 `*.test.ts` 文件。当 Claude 读取 auth.test.ts 时触发。显示为一行"已加载"通知。',
    link: '/zh/memory#path-specific-rules'
  }, {
    t: 0.47,
    kind: 'claude',
    label: '搜索 "refreshToken"',
    tokens: 600,
    color: '#A09E96',
    vis: 'brief',
    desc: '整个代码库的搜索结果。你看到命令已运行，而不是完整输出。',
    link: null
  }, {}, {
    t: 0.53,
    kind: 'claude',
    label: 'Claude 的分析',
    tokens: 800,
    color: '#D97757',
    vis: 'full',
    desc: '解释 bug：token 在轮换过程中过早失效。此文本出现在你的终端中。',
    link: null
  }, {
    t: 0.57,
    kind: 'claude',
    label: '编辑 auth.ts',
    tokens: 400,
    color: '#D97757',
    vis: 'full',
    desc: '修复 token 轮换顺序。diff 出现在你的终端中。',
    link: null
  }, {
    t: 0.59,
    kind: 'hook',
    label: '钩子：prettier',
    tokens: 120,
    color: '#B8860B',
    vis: 'hidden',
    desc: '`settings.json` 中的 PostToolUse 钩子在每次文件编辑后运行 prettier，并通过 `hookSpecificOutput.additionalContext` 回报。该字段会进入 Claude 的上下文。退出码 0 的普通 stdout 不会。它仅写入调试日志。',
    tip: '输出带有 `additionalContext` 的 JSON 以向 Claude 发送信息。对于 PostToolUse 钩子，退出码 2 会将 stderr 作为错误显示，但由于工具已运行，无法阻止。保持输出简洁，因为它会未经截断地进入上下文。',
    link: '/zh/hooks-guide'
  }, {
    t: 0.62,
    kind: 'claude',
    label: '编辑 auth.test.ts',
    tokens: 600,
    color: '#D97757',
    vis: 'full',
    desc: '为修复添加回归测试。diff 出现在你的终端中。',
    link: null
  }, {
    t: 0.64,
    kind: 'hook',
    label: '钩子：prettier',
    tokens: 100,
    color: '#B8860B',
    vis: 'hidden',
    desc: '同一个钩子再次为测试文件触发。每个匹配的工具事件都会触发它。',
    link: '/zh/hooks-guide'
  }, {
    t: 0.67,
    kind: 'claude',
    label: 'npm test 输出',
    tokens: 1200,
    color: '#A09E96',
    vis: 'brief',
    desc: '运行测试套件。你看到"正在运行 npm test..."和通过数量，而不是完整的 1,200 个 token 的输出。',
    link: null
  }, {
    t: 0.70,
    kind: 'claude',
    label: '总结',
    tokens: 400,
    color: '#D97757',
    vis: 'full',
    desc: '"已修复 token 轮换。添加了回归测试。所有测试通过。"',
    link: null
  }, {}, {
    t: 0.72,
    kind: 'user',
    label: '你的后续提问',
    tokens: 40,
    color: '#558A42',
    vis: 'full',
    desc: '"用子代理研究会话超时处理，然后修复它"',
    tip: '后续提问添加到同一个上下文中。将研究委托给子代理可将大量文件读取保持在你的主窗口之外。',
    link: null
  }, {
    t: 0.79,
    kind: 'claude',
    label: '生成研究子代理',
    tokens: 80,
    color: '#D97757',
    vis: 'brief',
    desc: "Claude 将研究委托给一个拥有全新独立上下文窗口的子代理。它加载 CLAUDE.md 以及相同的 MCP 和技能配置，但不包含你的对话历史或主会话的自动记忆。",
    link: '/zh/sub-agents'
  }, {
    t: 0.795,
    kind: 'sub',
    label: '系统提示词',
    tokens: 0,
    subTokens: 900,
    color: '#6B6964',
    vis: 'hidden',
    desc: "子代理获得自己的系统提示词，比主会话的更短。对于通用代理，它是一个简短的提示词加上环境详情。主会话的自动记忆不包含在内。如果自定义代理的 frontmatter 中有 memory:，它会在这里加载自己独立的 MEMORY.md。",
    link: '/zh/sub-agents#enable-persistent-memory'
  }, {
    t: 0.80,
    kind: 'sub',
    label: '项目 CLAUDE.md（独立副本）',
    tokens: 0,
    subTokens: 1800,
    color: '#6A9BCC',
    vis: 'hidden',
    desc: "子代理也会加载 CLAUDE.md。相同的文件，相同的内容，但它计入子代理的上下文，而不是你的。内置的 Explore 和 Plan 代理会跳过此步骤以获得更小的上下文。",
    link: '/zh/sub-agents'
  }, {
    t: 0.805,
    kind: 'sub',
    label: 'MCP 工具 + 技能',
    tokens: 0,
    subTokens: 970,
    color: '#9B7BC4',
    vis: 'hidden',
    desc: "子代理可以访问相同的 MCP 服务器和技能。它获得父代理的大部分工具，减去几个在嵌套上下文中不适用的工具，包括计划模式控制、后台任务工具，以及默认情况下 Agent 工具本身以防止递归。",
    link: '/zh/sub-agents'
  }, {
    t: 0.81,
    kind: 'sub',
    label: '来自主代理的任务提示词',
    tokens: 0,
    subTokens: 120,
    color: '#558A42',
    vis: 'hidden',
    desc: "子代理收到的不是用户提示词，而是 Claude 为它编写的任务：'研究此代码库中的会话超时处理。'",
    link: '/zh/sub-agents'
  }, {
    t: 0.82,
    kind: 'sub',
    label: '读取 session.ts',
    tokens: 0,
    subTokens: 2200,
    color: '#8A8880',
    vis: 'hidden',
    desc: "现在子代理开始工作。此文件读取填充的是子代理的上下文，而不是你的。",
    link: '/zh/sub-agents'
  }, {
    t: 0.825,
    kind: 'sub',
    label: '读取 timeouts.ts',
    tokens: 0,
    subTokens: 800,
    color: '#8A8880',
    vis: 'hidden',
    desc: "子代理独立上下文中的另一个文件读取。",
    link: '/zh/sub-agents'
  }, {
    t: 0.83,
    kind: 'sub',
    label: '读取 config/*.ts',
    tokens: 0,
    subTokens: 3100,
    color: '#8A8880',
    vis: 'hidden',
    desc: "子代理可以根据需要读取任意数量的文件。这些都不会影响你的主上下文。",
    link: '/zh/sub-agents'
  }, {
    t: 0.85,
    kind: 'claude',
    label: '子代理返回摘要',
    tokens: 420,
    color: '#D97757',
    vis: 'brief',
    desc: "只有子代理的最终文本响应返回到你的上下文，外加一个包含 token 计数和持续时间的小型元数据尾部。子代理读取了 6,100 个 token 的文件。你得到了 420 个 token 的结果。这就是上下文节省。",
    link: '/zh/sub-agents'
  }, {
    t: 0.86,
    kind: 'claude',
    label: 'Claude 的响应',
    tokens: 1200,
    color: '#D97757',
    vis: 'full',
    desc: '会话超时的分析和修复。此文本出现在你的终端中。',
    link: null
  }, {}, {
    t: 0.875,
    kind: 'user',
    label: '!git status',
    tokens: 180,
    color: '#558A42',
    vis: 'full',
    desc: "你使用 ! 前缀运行 shell 命令查看 Claude 修改了哪些文件。命令及其输出都作为你的消息的一部分进入上下文。适用于让 Claude 基于命令输出而无需 Claude 运行它。",
    link: '/zh/interactive-mode#bash-mode-with-prefix'
  }, {
    t: 0.89,
    kind: 'user',
    label: '/commit-push',
    tokens: 620,
    color: '#558A42',
    vis: 'brief',
    desc: '你调用了一个设置了 `disable-model-invocation: true` 的技能。它的描述在启动时不在技能索引中，因此直到此刻才消耗零上下文。现在完整技能内容加载，Claude 按照其指令暂存、提交和推送你的更改。',
    tip: '对有副作用的技能（如提交、部署或发送消息）设置 `disable-model-invocation: true`。它们完全不会进入上下文，直到你需要它们。',
    link: '/zh/skills#control-who-invokes-a-skill'
  }, {}, {
    t: 0.93,
    kind: 'compact',
    label: '/compact',
    tokens: 0,
    color: '#D97757',
    vis: 'brief',
    desc: '用结构化摘要替换对话。你看到"对话已压缩"消息。压缩过程不出现在你的终端中。',
    link: '/zh/how-claude-code-works#the-context-window'
  }].filter(e => e.t !== undefined), []);
  const VIS_META = {
    hidden: {
      label: '在终端中不可见',
      sub: '此内容不出现在你的终端中。'
    },
    brief: {
      label: '在终端中显示为一行',
      sub: '你看到简短提及，而不是完整内容。'
    },
    full: {
      label: '在终端中完整显示',
      sub: '实际内容出现在你的终端中。'
    }
  };
  {}
  const GATES = [{
    at: 0.18,
    kind: 'prompt',
    text: '修复 token 刷新后用户收到 401 的认证 bug',
    resumeTo: 0.22
  }, {
    at: 0.705,
    kind: 'prompt',
    text: '用子代理研究会话超时处理，然后修复它',
    resumeTo: 0.72
  }, {
    at: 0.865,
    kind: 'bang',
    text: '!git status',
    resumeTo: 0.875
  }, {
    at: 0.88,
    kind: 'slash',
    text: '/commit-push',
    resumeTo: 0.89
  }, {
    at: 0.90,
    kind: 'compact',
    text: '/compact',
    resumeTo: 1
  }];
  const KIND_META = {
    auto: {
      badge: 'auto',
      detail: '自动加载',
      badgeBg: 'rgba(94,93,89,0.15)',
      badgeColor: '#8A8880'
    },
    user: {
      badge: 'you',
      detail: '你输入的',
      badgeBg: 'rgba(85,138,66,0.15)',
      badgeColor: '#6BA656'
    },
    claude: {
      badge: 'claude',
      detail: 'Claude 的工作',
      badgeBg: 'rgba(217,119,87,0.12)',
      badgeColor: '#D97757'
    },
    hook: {
      badge: 'hook',
      detail: '钩子（自动）',
      badgeBg: 'rgba(184,134,11,0.15)',
      badgeColor: '#CCA020'
    },
    compact: {
      badge: 'compact',
      detail: '压缩',
      badgeBg: 'rgba(217,119,87,0.12)',
      badgeColor: '#D97757'
    },
    sub: {
      badge: '子代理',
      detail: '在子代理的上下文中',
      badgeBg: 'rgba(155,123,196,0.12)',
      badgeColor: '#9B7BC4'
    }
  };
  const LEGEND = [{
    c: '#6B6964',
    l: '系统'
  }, {
    c: '#6A9BCC',
    l: 'CLAUDE.md'
  }, {
    c: '#E8A45C',
    l: '记忆'
  }, {
    c: '#D4A843',
    l: '技能'
  }, {
    c: '#9B7BC4',
    l: 'MCP'
  }, {
    c: '#4A9B8E',
    l: '规则'
  }, {
    c: '#558A42',
    l: '你'
  }, {
    c: '#8A8880',
    l: '文件'
  }, {
    c: '#A09E96',
    l: '输出'
  }, {
    c: '#D97757',
    l: 'Claude'
  }, {
    c: '#B8860B',
    l: '钩子'
  }];
  const fmt = n => n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K' : n + '';
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [hovIdx, setHovIdx] = useState(null);
  const [selIdx, setSelIdx] = useState(null);
  const [hovCat, setHovCat] = useState(null);
  const [gatesPassed, setGatesPassed] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const lastRef = useRef(null);
  const scrollRef = useRef(null);
  const detailRef = useRef(null);
  useEffect(() => setMounted(true), []);
  const activeGate = GATES.find((g, i) => i >= gatesPassed && time >= g.at && time < g.resumeTo);
  useEffect(() => {
    if (!playing) return;
    let raf;
    let stopped = false;
    const tick = ts => {
      if (stopped) return;
      if (!lastRef.current) lastRef.current = ts;
      const dt = (ts - lastRef.current) / 1000;
      lastRef.current = ts;
      setTime(prev => {
        const next = prev + dt * 0.032;
        const gate = GATES.find((g, i) => i >= gatesPassed && next >= g.at && prev < g.resumeTo);
        if (gate) {
          stopped = true;
          setPlaying(false);
          return gate.at;
        }
        if (next >= 1) {
          stopped = true;
          setPlaying(false);
          return 1;
        }
        return next;
      });
      if (!stopped) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      lastRef.current = null;
    };
  }, [playing, gatesPassed]);
  const sendPrompt = () => {
    if (!activeGate) return;
    const isCompact = activeGate.kind === 'compact';
    setGatesPassed(n => n + 1);
    setTime(activeGate.resumeTo);
    setSelIdx(null);
    setHovIdx(null);
    if (!isCompact) setPlaying(true);
  };
  const visibleCount = EVENTS.filter(e => e.t <= time).length;
  const preCompactVisible = useMemo(() => EVENTS.slice(0, visibleCount), [EVENTS, visibleCount]);
  const compactGateIdx = GATES.length - 1;
  const isCompacted = gatesPassed > compactGateIdx && preCompactVisible.some(e => e.kind === 'compact');
  const {visible, preCompactTotal} = useMemo(() => {
    const nonCompact = preCompactVisible.filter(e => e.kind !== 'compact');
    if (!isCompacted) {
      return {
        visible: preCompactVisible,
        preCompactTotal: 0
      };
    }
    {}
    const autoLoads = nonCompact.filter(e => e.kind === 'auto' && e.t < STARTUP_END && !e.noSurviveCompact);
    const summarized = nonCompact.filter(e => e.t >= STARTUP_END && e.kind !== 'sub');
    const sumTokens = summarized.reduce((s, e) => s + e.tokens, 0);
    const summaryBlock = {
      t: STARTUP_END,
      kind: 'compact',
      label: '对话摘要',
      tokens: Math.round(sumTokens * 0.12),
      color: '#A09E96',
      vis: 'hidden',
      desc: `全部 ${summarized.length} 个对话事件被压缩为一个结构化摘要。摘要保留：你的请求和意图、关键技术概念、已检查或修改的文件及重要代码片段、错误及其修复方式、待办任务和当前工作。它替换了逐字对话：完整的工具输出和中间推理已消失。Claude 仍然可以引用之前的工作，但不会有它之前读取的确切代码。`,
      link: '/zh/how-claude-code-works#the-context-window'
    };
    return {
      visible: [...autoLoads, summaryBlock],
      preCompactTotal: nonCompact.reduce((s, e) => s + e.tokens, 0)
    };
  }, [preCompactVisible, isCompacted]);
  const {blocks, totalTokens} = useMemo(() => {
    const bl = visible.map((e, visIdx) => ({
      ...e,
      id: e.label + e.t,
      visIdx
    })).filter(e => e.tokens > 0 || e.label === '对话摘要');
    return {
      blocks: bl,
      totalTokens: bl.reduce((s, b) => s + b.tokens, 0)
    };
  }, [visible]);
  const subTotal = useMemo(() => visible.filter(e => e.kind === 'sub').reduce((s, e) => s + (e.subTokens || 0), 0), [visible]);
  useEffect(() => {
    if (!scrollRef.current) return;
    if (isCompacted) scrollRef.current.scrollTo({
      top: 0,
      behavior: 'smooth'
    }); else if (playing || activeGate) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [visible.length, !!activeGate, isCompacted]);
  const rootRef = useRef(null);
  const keyStateRef = useRef({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  keyStateRef.current = {
    time,
    activeGate,
    sendPrompt,
    hasInteracted
  };
  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);
  const toggleFullscreen = () => {
    if (!rootRef.current) return;
    if (document.fullscreenElement) document.exitFullscreen(); else rootRef.current.requestFullscreen().catch(() => {});
  };
  useEffect(() => {
    const onKey = e => {
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'BUTTON' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable) return;
      if (!rootRef.current) return;
      const rect = rootRef.current.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return;
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      if (e.code === 'Space') {
        const {time: t, activeGate: g, sendPrompt: send, hasInteracted: hi} = keyStateRef.current;
        if (!hi) return;
        e.preventDefault();
        if (t === 0) setPlaying(true); else if (g) send(); else if (t >= 1) {
          setTime(0);
          setGatesPassed(0);
          setSelIdx(null);
          setHovIdx(null);
          setPlaying(true);
        } else setPlaying(p => !p);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  const pct = totalTokens / MAX * 100;
  const barColor = pct > 75 ? '#D97757' : pct > 50 ? '#B8860B' : '#558A42';
  const activeIdx = selIdx !== null ? selIdx : hovIdx;
  const hovEvent = activeIdx !== null ? visible[activeIdx] : null;
  useEffect(() => {
    if (detailRef.current) detailRef.current.scrollTop = 0;
  }, [hovEvent]);
  const focusT = hovEvent ? hovEvent.t : time;
  const takeaway = isCompacted ? '压缩用结构化摘要替换对话。系统提示词、CLAUDE.md、记忆和 MCP 工具自动重新加载。技能列表是唯一的例外，只有你实际调用的技能才会被保留。' : focusT < STARTUP_END ? '在你输入之前就加载了很多内容。CLAUDE.md、记忆、技能和 MCP 工具在你的第一个提示词之前就已在上下文中。' : focusT < 0.28 ? '你的提示词与已加载的内容相比非常小。Claude 的大部分上下文是项目知识，而不是你说的话。' : focusT < 0.50 ? 'Claude 读取的每个文件都会增长上下文。路径作用域规则随匹配文件自动加载。' : focusT < 0.71 ? '钩子在工具事件上自动触发。输出通过 additionalContext JSON 到达 Claude。退出码 2 将 stderr 显示给 Claude。退出码 0 的普通 stdout 进入调试日志，而不是对话记录。' : focusT < 0.79 ? '后续提问在同一个上下文上继续构建。之前的所有内容仍然存在。' : focusT < 0.87 ? '子代理在自己独立的上下文窗口中工作。它的文件读取不会影响你的上下文。只有最终摘要返回。' : focusT < 0.88 ? 'Bang 命令在你的 shell 中运行，并将输出添加到你的下一条消息中。适用于让 Claude 基于命令结果而无需 Claude 运行它们。' : focusT < 0.90 ? '用户专用技能在你调用之前完全不会进入上下文。启动时的技能索引只列出 Claude 可以自己调用的技能。' : '/compact 总结对话以释放空间，同时保留关键信息。在实际会话中，当上下文开始影响性能或在进行新的长任务之前运行它。';
  const terminalView = isCompacted ? '"对话已压缩"消息。压缩过程无声进行。' : focusT < STARTUP_END ? '输入框，等待你的第一条消息。在你输入之前，上面的所有内容都无声加载。' : focusT < 0.28 ? '你的提示词。Claude 尚未开始工作。' : focusT < 0.52 ? '你的提示词和"正在读取文件..."。规则显示为一行"已加载"通知，而不是其内容。' : focusT < 0.72 ? 'Claude 的响应和文件 diff。钩子无声触发。npm test 等工具输出显示为简短摘要，而不是完整内容。' : focusT < 0.79 ? '你的后续提示词。' : focusT < 0.86 ? '简短通知显示子代理正在工作，然后是其结果。你看不到子代理的各个文件读取。' : focusT < 0.90 ? 'Claude 的响应、你的 git status 输出和 commit-push 技能运行。' : '你的完整对话。/compact 可用。';
  const mono = 'var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)';
  const renderWithCode = s => s.split('`').map((part, i) => i % 2 === 1 ? <code key={i} style={{
    fontFamily: mono,
    fontSize: '0.92em',
    background: 'var(--cw-track)',
    padding: '1px 4px',
    borderRadius: 3
  }}>{part}</code> : part);
  if (!mounted) return null;
  return <>
    <div className="cw-mobile-fallback">
      此交互式时间线在较大屏幕上效果最佳。请参阅<a href="#what-the-timeline-shows" style={{
    color: '#D97757'
  }}>下方的书面分解</a>了解相同概念。
    </div>
    <div className="cw-root" ref={rootRef} onClickCapture={() => setHasInteracted(true)} style={isFullscreen ? {
    height: '100vh',
    borderRadius: 0,
    display: 'flex',
    flexDirection: 'column'
  } : {}}>
      <style>{`
        .cw-root {
          --cw-bg: #FAFAF8;
          --cw-text: #1A1918;
          --cw-text-2: #3D3C38;
          --cw-text-3: #5E5D59;
          --cw-text-dim: #6E6C64;
          --cw-text-faint: #8A8880;
          --cw-surface: rgba(0,0,0,0.025);
          --cw-surface-2: rgba(0,0,0,0.04);
          --cw-border: rgba(0,0,0,0.08);
          --cw-track: rgba(0,0,0,0.04);
          --cw-hover: rgba(0,0,0,0.04);
          --cw-rail: rgba(0,0,0,0.08);
          --cw-scrollbar: rgba(0,0,0,0.22);
          background: var(--cw-bg);
          border-radius: 12px;
          overflow: hidden;
          font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, sans-serif);
          color: var(--cw-text);
          border: 1px solid var(--cw-border);
        }
        .dark .cw-root {
          --cw-bg: #111110;
          --cw-text: #E8E6DC;
          --cw-text-2: #B8B6AE;
          --cw-text-3: #9C9A92;
          --cw-text-dim: #8A8880;
          --cw-text-faint: #6E6C64;
          --cw-surface: rgba(255,255,255,0.02);
          --cw-surface-2: rgba(255,255,255,0.015);
          --cw-border: rgba(255,255,255,0.06);
          --cw-track: rgba(255,255,255,0.03);
          --cw-hover: rgba(255,255,255,0.04);
          --cw-rail: rgba(255,255,255,0.04);
          --cw-scrollbar: rgba(255,255,255,0.18);
        }
        .cw-scroll::-webkit-scrollbar { width: 6px; }
        .cw-scroll::-webkit-scrollbar-track { background: transparent; }
        .cw-scroll::-webkit-scrollbar-thumb { background: var(--cw-scrollbar); border-radius: 3px; }
        @keyframes cw-blink { 50% { opacity: 0; } }
        @keyframes cw-fadein { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        .cw-compacted-row { animation: cw-fadein 0.3s ease-out backwards; }
        .cw-mobile-fallback { display: none; padding: 14px 16px; border-radius: 8px; font-size: 14px; border: 1px solid rgba(0,0,0,0.1); background: rgba(0,0,0,0.03); }
        .dark .cw-mobile-fallback { border-color: rgba(255,255,255,0.15); background: rgba(255,255,255,0.04); }
        @media (max-width: 700px) {
          .cw-root { display: none !important; }
          .cw-mobile-fallback { display: block; }
        }
      `}</style>

      {}
      <div style={{
    padding: '16px 20px 12px',
    display: 'flex',
    alignItems: 'flex-end',
    gap: 24
  }}>
        <div style={{
    flex: 1,
    minWidth: 0
  }}>
          <div style={{
    fontSize: 18,
    fontWeight: 600,
    letterSpacing: -0.3,
    lineHeight: 1
  }}>
            探索上下文窗口
          </div>
          <div style={{
    fontSize: 14,
    color: 'var(--cw-text-dim)',
    marginTop: 4
  }}>
            模拟会话展示什么进入上下文及其代价
          </div>
        </div>
        <div style={{
    textAlign: 'right',
    flexShrink: 0
  }}>
          <div style={{
    fontFamily: mono,
    fontSize: 20,
    fontWeight: 600,
    color: barColor,
    letterSpacing: -0.5,
    lineHeight: 1
  }}>
            ~{fmt(totalTokens)}<span style={{
    fontSize: 15,
    fontWeight: 500,
    marginLeft: 4
  }}>tokens</span>
          </div>
          <div style={{
    fontFamily: mono,
    fontSize: 13,
    color: 'var(--cw-text-dim)',
    marginTop: 2
  }} title="Token 计数为示意性数据。实际值因你的 CLAUDE.md 大小、MCP 服务器和文件长度而异。">
            / {fmt(MAX)} · 示意性数据
          </div>
        </div>
      </div>

      {}
      <div style={{
    padding: '0 20px'
  }}>
        <div style={{
    height: 4,
    borderRadius: 2,
    background: 'var(--cw-track)',
    overflow: 'hidden',
    marginBottom: 6
  }}>
          <div style={{
    width: pct + '%',
    height: '100%',
    background: barColor,
    transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s'
  }} />
        </div>
        <div style={{
    height: 28,
    borderRadius: 5,
    background: 'var(--cw-track)',
    border: '1px solid var(--cw-border)',
    overflow: 'hidden',
    display: 'flex'
  }}>
          {blocks.map((b, i) => {
    const w = Math.max(b.tokens / MAX * 100, 0.15);
    const isHov = b.visIdx === activeIdx;
    const catMatch = hovCat && b.color === hovCat;
    const dimmed = hovCat ? !catMatch : activeIdx !== null && !isHov;
    return <div key={b.id} onMouseEnter={() => setHovIdx(b.visIdx)} onMouseLeave={() => setHovIdx(null)} onClick={() => setSelIdx(selIdx === b.visIdx ? null : b.visIdx)} style={{
      width: w + '%',
      height: '100%',
      background: b.color,
      opacity: isHov || catMatch ? 1 : dimmed ? 0.25 : 0.65,
      borderRight: i < blocks.length - 1 ? '0.5px solid var(--cw-border)' : 'none',
      transition: 'opacity 0.15s',
      cursor: 'pointer'
    }} />;
  })}
        </div>
        <div style={{
    display: 'flex',
    gap: 12,
    marginTop: 6,
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  }}>
          <div style={{
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap'
  }}>
            {LEGEND.map(x => {
    const active = hovCat === x.c;
    return <div key={x.l} onMouseEnter={() => setHovCat(x.c)} onMouseLeave={() => setHovCat(null)} style={{
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      padding: '2px 6px',
      borderRadius: 4,
      cursor: 'pointer',
      background: active ? 'var(--cw-hover)' : 'transparent',
      transition: 'background 0.1s'
    }}>
                  <div style={{
      width: 6,
      height: 6,
      borderRadius: 1.5,
      background: x.c,
      opacity: active ? 1 : 0.7
    }} />
                  <span style={{
      fontSize: 12,
      color: active ? 'var(--cw-text)' : 'var(--cw-text-dim)'
    }}>{x.l}</span>
                </div>;
  })}
          </div>
          <div style={{
    display: 'flex',
    gap: 6,
    alignItems: 'center',
    fontSize: 12,
    color: 'var(--cw-text-dim)'
  }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#558A42" strokeWidth="2.5">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
            </svg>
            <span>= 出现在你的终端中</span>
          </div>
        </div>
      </div>

      {}
      <div style={{
    display: 'flex',
    padding: '14px 20px 0',
    gap: 16,
    height: isFullscreen ? 'calc(100vh - 240px)' : 420
  }}>

        {}
        <div ref={scrollRef} className="cw-scroll" style={{
    flex: 1,
    minWidth: 0,
    overflowY: 'auto',
    paddingRight: 8,
    scrollBehavior: 'smooth'
  }}>
          {visible.length === 0 && !playing && <div style={{
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16
  }}>
              <div style={{
    fontFamily: mono,
    fontSize: 16,
    color: 'var(--cw-text-dim)',
    display: 'flex',
    alignItems: 'center',
    gap: 8
  }}>
                <span style={{
    color: 'var(--cw-text-faint)'
  }}>$</span>
                <span>claude</span>
                <span style={{
    display: 'inline-block',
    width: 8,
    height: 16,
    background: 'var(--cw-text-dim)',
    opacity: 0.5,
    animation: 'cw-blink 1s step-end infinite'
  }} />
              </div>
              <button onClick={() => setPlaying(true)} style={{
    padding: '10px 20px',
    borderRadius: 8,
    border: '1px solid rgba(217,119,87,0.3)',
    background: 'rgba(217,119,87,0.08)',
    color: '#D97757',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 8
  }}>
                <span>▶</span>
                <span>开始会话</span>
              </button>
              <div style={{
    fontSize: 13,
    color: 'var(--cw-text-faint)',
    maxWidth: 280,
    textAlign: 'center',
    lineHeight: 1.5
  }}>
                观察什么加载到上下文中，从你运行 <code style={{
    fontFamily: mono
  }}>claude</code> 开始到完整对话。
              </div>
            </div>}
          {isCompacted && <div style={{
    marginBottom: 10,
    padding: '10px 12px',
    borderRadius: 6,
    background: 'rgba(217,119,87,0.05)',
    border: '1px solid rgba(217,119,87,0.15)'
  }}>
              <div style={{
    fontSize: 13,
    fontWeight: 600,
    color: '#D97757',
    marginBottom: 3
  }}>
                /compact 之后
              </div>
              <div style={{
    fontSize: 13,
    color: 'var(--cw-text-3)',
    lineHeight: 1.5,
    fontFamily: mono
  }}>
                {fmt(preCompactTotal)} → {fmt(totalTokens)} tokens · 释放了 {fmt(preCompactTotal - totalTokens)}
              </div>
              <div style={{
    fontSize: 13,
    color: 'var(--cw-text-dim)',
    lineHeight: 1.5,
    marginTop: 4
  }}>
                这是上下文中剩余的内容：启动内容（位于消息历史之外，压缩后重新加载），加上整个对话的结构化摘要。技能描述不会重新加载。
              </div>
            </div>}
          {time > 0 && visible.length > 0 && <div style={{
    fontSize: 12,
    fontWeight: 700,
    color: 'var(--cw-text-faint)',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
    paddingLeft: 28
  }}>
              {isCompacted ? '压缩后重新加载' : '在你输入之前'}
            </div>}

          {time > 0 && visible.map((evt, i) => {
    const meta = KIND_META[evt.kind];
    const isHov = hovIdx === i;
    const prevKind = i > 0 ? visible[i - 1].kind : null;
    const isSub = evt.kind === 'sub';
    const enteringSubagent = isSub && prevKind !== 'sub';
    const leavingSubagent = prevKind === 'sub' && !isSub;
    let showPhase = null;
    if (evt.kind === 'user' && prevKind !== 'user') showPhase = '你'; else if (evt.kind === 'claude' && prevKind === 'user') showPhase = 'Claude 工作中'; else if (evt.label === '对话摘要') showPhase = '由 /compact 压缩';
    const isNewRow = isCompacted && !(evt.kind === 'auto' && evt.t < STARTUP_END);
    return <div key={evt.label + evt.t} className={isNewRow ? 'cw-compacted-row' : ''} style={isNewRow ? {
      animationDelay: `${i * 60}ms`
    } : {}}>
                {showPhase && <div style={{
      fontSize: 12,
      fontWeight: 700,
      color: 'var(--cw-text-faint)',
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      marginTop: 14,
      marginBottom: 6,
      paddingLeft: 28
    }}>
                    {showPhase}
                  </div>}
                {enteringSubagent && <div style={{
      marginLeft: 28,
      marginTop: 6,
      marginBottom: 2,
      paddingLeft: 10,
      borderLeft: '2px solid rgba(155,123,196,0.4)',
      fontSize: 12,
      fontWeight: 600,
      color: '#9B7BC4',
      textTransform: 'uppercase',
      letterSpacing: 0.5
    }}>
                    子代理的独立上下文窗口
                  </div>}
                {leavingSubagent && <div style={{
      marginLeft: 28,
      marginBottom: 6,
      paddingLeft: 10,
      paddingBottom: 6,
      borderLeft: '2px solid rgba(155,123,196,0.4)',
      fontSize: 12,
      color: 'var(--cw-text-dim)',
      fontFamily: mono
    }}>
                    ↓ {fmt(subTotal)} tokens 留在子代理的上下文中 · 只有摘要返回
                  </div>}
                <div onMouseEnter={() => setHovIdx(i)} onMouseLeave={() => setHovIdx(null)} onClick={() => setSelIdx(selIdx === i ? null : i)} style={{
      display: 'flex',
      alignItems: 'flex-start',
      borderRadius: 6,
      cursor: 'pointer',
      background: selIdx === i || isHov ? 'var(--cw-hover)' : 'transparent',
      outline: selIdx === i ? '1px solid rgba(217,119,87,0.4)' : 'none',
      opacity: hovCat && evt.color !== hovCat ? 0.35 : 1,
      transition: 'background 0.1s, opacity 0.15s',
      marginLeft: isSub ? 28 : 0,
      paddingLeft: isSub ? 10 : 0,
      borderLeft: isSub ? '2px solid rgba(155,123,196,0.4)' : 'none'
    }}>
                  <div style={{
      width: 28,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: 8,
      flexShrink: 0
    }}>
                    <div style={{
      width: evt.kind === 'user' || evt.kind === 'compact' ? 10 : 7,
      height: evt.kind === 'user' || evt.kind === 'compact' ? 10 : 7,
      borderRadius: '50%',
      background: evt.color,
      opacity: isHov ? 1 : 0.6,
      transition: 'opacity 0.15s',
      boxShadow: isHov ? `0 0 8px ${evt.color}40` : 'none'
    }} />
                    {i < visible.length - 1 && <div style={{
      width: 1.5,
      flex: 1,
      background: 'var(--cw-rail)',
      marginTop: 2,
      minHeight: 6
    }} />}
                  </div>
                  <div style={{
      flex: 1,
      minWidth: 0,
      padding: '5px 10px 5px 4px',
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }}>
                    <span style={{
      fontSize: 12,
      fontWeight: 600,
      padding: '1px 5px',
      borderRadius: 3,
      background: meta.badgeBg,
      color: meta.badgeColor,
      flexShrink: 0,
      fontFamily: mono
    }}>
                      {meta.badge}
                    </span>
                    <span style={{
      fontSize: 15,
      fontFamily: mono,
      color: isHov ? 'var(--cw-text)' : evt.kind === 'user' ? '#558A42' : evt.kind === 'auto' ? 'var(--cw-text-dim)' : 'var(--cw-text-2)',
      flex: 1,
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      fontWeight: evt.kind === 'user' ? 550 : 400
    }}>
                      {evt.label}
                    </span>
                    {evt.tokens > 0 && <span style={{
      fontSize: 12,
      fontFamily: mono,
      color: 'var(--cw-text-faint)',
      flexShrink: 0
    }}>
                        +{fmt(evt.tokens)}
                      </span>}
                    {evt.subTokens > 0 && <span style={{
      fontSize: 12,
      fontFamily: mono,
      color: '#9B7BC4',
      flexShrink: 0,
      opacity: 0.6
    }}>
                        +{fmt(evt.subTokens)}
                      </span>}
                    {evt.tokens > 0 && <div style={{
      width: 50,
      height: 5,
      borderRadius: 2,
      background: 'var(--cw-track)',
      flexShrink: 0,
      overflow: 'hidden'
    }}>
                        <div style={{
      width: Math.min(evt.tokens / 5000 * 100, 100) + '%',
      height: '100%',
      background: evt.color,
      opacity: isHov ? 0.8 : 0.4,
      transition: 'opacity 0.15s'
    }} />
                      </div>}
                    <span style={{
      width: 14,
      flexShrink: 0,
      display: 'flex',
      justifyContent: 'center'
    }} title={VIS_META[evt.vis].label}>
                      {evt.vis !== 'hidden' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={evt.vis === 'full' ? '#558A42' : 'currentColor'} style={{
      color: 'var(--cw-text-faint)',
      opacity: evt.vis === 'full' ? 1 : 0.5
    }} strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                        </svg>}
                    </span>
                  </div>
                </div>
              </div>;
  })}

          {activeGate && (activeGate.kind === 'prompt' || activeGate.kind === 'bang' || activeGate.kind === 'slash') && <div style={{
    paddingLeft: 28,
    marginTop: 12,
    paddingRight: 8
  }}>
              <div style={{
    fontSize: 11,
    fontWeight: 600,
    color: '#6BA656',
    fontFamily: mono,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
    paddingLeft: 2
  }}>
                你在终端中输入
              </div>
              <div style={{
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    padding: '10px 12px',
    borderRadius: 6,
    background: 'rgba(85,138,66,0.06)',
    border: '1px solid rgba(85,138,66,0.2)'
  }}>
                <span style={{
    color: '#558A42',
    fontSize: 15,
    fontFamily: mono,
    flexShrink: 0
  }}>❯</span>
                <span style={{
    fontSize: 15,
    fontFamily: mono,
    color: 'var(--cw-text-2)',
    flex: 1,
    lineHeight: 1.5
  }}>
                  {activeGate.text}
                  <span style={{
    display: 'inline-block',
    width: 7,
    height: 13,
    marginLeft: 2,
    background: '#558A42',
    opacity: 0.5,
    verticalAlign: 'middle',
    animation: 'cw-blink 1s step-end infinite'
  }} />
                </span>
                <button onClick={sendPrompt} style={{
    padding: '5px 12px',
    borderRadius: 5,
    border: 'none',
    background: '#558A42',
    color: '#fff',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    flexShrink: 0
  }}>
                  {activeGate.kind === 'prompt' ? '发送 ↵' : '运行 ↵'}
                </button>
              </div>
            </div>}
          {activeGate && activeGate.kind === 'compact' && <div style={{
    paddingLeft: 28,
    marginTop: 12,
    paddingRight: 8
  }}>
              <div style={{
    padding: '12px 14px',
    borderRadius: 6,
    background: 'rgba(217,119,87,0.06)',
    border: '1px solid rgba(217,119,87,0.25)'
  }}>
                <div style={{
    fontSize: 13,
    color: 'var(--cw-text-3)',
    marginBottom: 8,
    lineHeight: 1.5
  }}>
                  上下文已达到 <span style={{
    fontFamily: mono,
    fontWeight: 600,
    color: barColor
  }}>{fmt(totalTokens)} tokens</span>。
                  运行 <code style={{
    fontFamily: mono,
    background: 'var(--cw-track)',
    padding: '1px 4px',
    borderRadius: 3
  }}>/compact</code> 来
                  总结较早的交流并释放空间以进行更多工作。
                </div>
                <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: 8
  }}>
                  <span style={{
    color: '#D97757',
    fontSize: 15,
    fontFamily: mono
  }}>❯</span>
                  <span style={{
    fontSize: 15,
    fontFamily: mono,
    color: 'var(--cw-text-2)',
    flex: 1
  }}>
                    {activeGate.text}
                  </span>
                  <button onClick={sendPrompt} style={{
    padding: '5px 12px',
    borderRadius: 5,
    border: 'none',
    background: '#D97757',
    color: '#fff',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    flexShrink: 0
  }}>
                    运行 ↵
                  </button>
                </div>
              </div>
            </div>}
        </div>

        {}
        <div style={{
    width: 300,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column'
  }}>
          <div ref={detailRef} className="cw-scroll" style={{
    padding: '14px 16px',
    borderRadius: 10,
    background: 'var(--cw-surface)',
    border: '1px solid var(--cw-border)',
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 10
  }}>
            {hovEvent ? <div>
                <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8
  }}>
                  <div style={{
    width: 10,
    height: 10,
    borderRadius: 3,
    background: hovEvent.color,
    opacity: 0.8
  }} />
                  <span style={{
    fontSize: 16,
    fontWeight: 600
  }}>{hovEvent.label}</span>
                </div>
                <div style={{
    display: 'flex',
    width: 'fit-content',
    padding: '3px 8px',
    borderRadius: 4,
    marginBottom: 8,
    background: KIND_META[hovEvent.kind].badgeBg
  }}>
                  <span style={{
    fontSize: 12,
    fontWeight: 600,
    color: KIND_META[hovEvent.kind].badgeColor
                  }}>
                    {KIND_META[hovEvent.kind].detail}
                  </span>
                </div>
                {hovEvent.tokens > 0 && <div style={{
    fontSize: 14,
    fontFamily: mono,
    color: 'var(--cw-text-dim)',
    marginBottom: 6
  }}>
                    {fmt(hovEvent.tokens)} tokens
                  </div>}
                {hovEvent.subTokens > 0 && <div style={{
    fontSize: 14,
    fontFamily: mono,
    color: '#9B7BC4',
    marginBottom: 6
  }}>
                    {fmt(hovEvent.subTokens)} tokens 在子代理的上下文中
                  </div>}
                <p style={{
    fontSize: 15,
    color: 'var(--cw-text-3)',
    lineHeight: 1.55,
    margin: 0
  }}>
                  {renderWithCode(hovEvent.desc)}
                </p>
                <div style={{
    marginTop: 10,
    padding: '8px 10px',
    borderRadius: 6,
    background: hovEvent.vis === 'full' ? 'rgba(85,138,66,0.08)' : 'var(--cw-surface-2)',
    border: '1px solid ' + (hovEvent.vis === 'full' ? 'rgba(85,138,66,0.2)' : 'var(--cw-border)')
  }}>
                  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3
  }}>
                    <span style={{
    fontSize: 13,
    color: hovEvent.vis === 'full' ? '#558A42' : 'var(--cw-text-dim)'
                  }}>
                      {hovEvent.vis === 'full' ? '●' : hovEvent.vis === 'brief' ? '◐' : '○'}
                    </span>
                    <span style={{
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--cw-text-2)'
                  }}>
                      {VIS_META[hovEvent.vis].label}
                    </span>
                  </div>
                  <div style={{
    fontSize: 13,
    color: 'var(--cw-text-dim)',
    lineHeight: 1.4
                  }}>
                    {VIS_META[hovEvent.vis].sub}
                  </div>
                </div>
                {hovEvent.tip && <div style={{
    marginTop: 10,
    padding: '8px 10px',
    borderRadius: 6,
    background: 'rgba(85,138,66,0.06)',
    border: '1px solid rgba(85,138,66,0.15)'
                  }}>
                    <div style={{
    fontSize: 12,
    fontWeight: 600,
    color: '#558A42',
    marginBottom: 3,
    display: 'flex',
    alignItems: 'center',
    gap: 4
                  }}>
                      <span>💡</span> 节省上下文
                    </div>
                    <div style={{
    fontSize: 13,
    color: 'var(--cw-text-3)',
    lineHeight: 1.5
                  }}>
                      {renderWithCode(hovEvent.tip)}
                    </div>
                  </div>}
                {hovEvent.link && <a href={hovEvent.link} style={{
    display: 'inline-block',
    marginTop: 10,
    fontSize: 13,
    color: '#D97757',
    textDecoration: 'none',
    borderBottom: '1px solid rgba(217,119,87,0.3)'
                  }}>
                    了解更多 →
                  </a>}
              </div> : <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: 4,
    padding: '12px 0 4px'
              }}>
                <div style={{
    fontSize: 22,
    opacity: 0.2
                }}>👁</div>
                <div style={{
    fontSize: 14,
    fontWeight: 500,
    color: 'var(--cw-text-dim)'
                }}>悬停或点击任何事件</div>
                <div style={{
    fontSize: 12,
    color: 'var(--cw-text-faint)',
    lineHeight: 1.4,
    maxWidth: 200
                }}>
                  悬停预览。点击固定以便滚动查看。
                </div>
              </div>}

            <div style={{
    padding: '10px 12px',
    borderRadius: 8,
    background: 'rgba(217,119,87,0.05)',
    border: '1px solid rgba(217,119,87,0.12)'
  }}>
              <div style={{
    fontSize: 11,
    fontWeight: 700,
    color: '#D97757',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3
  }}>
                关键要点
              </div>
              <div style={{
    fontSize: 13,
    color: 'var(--cw-text-3)',
    lineHeight: 1.5
              }}>
                {takeaway}
              </div>
            </div>

            <div style={{
    padding: '10px 12px',
    borderRadius: 8,
    background: 'var(--cw-surface-2)',
    border: '1px solid var(--cw-border)'
  }}>
              <div style={{
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--cw-text-dim)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3
              }}>
                在你的终端中看到
              </div>
              <div style={{
    fontSize: 13,
    color: 'var(--cw-text-3)',
    lineHeight: 1.5
              }}>
                {terminalView}
              </div>
            </div>
          </div>
        </div>
      </div>

      {}
      <div style={{
    padding: '10px 20px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: 10
  }}>
        <button aria-label={time >= 1 ? '重新开始' : activeGate ? '继续' : playing ? '暂停' : '播放'} onClick={() => {
    if (time >= 1) {
      setTime(0);
      setGatesPassed(0);
      setSelIdx(null);
      setHovIdx(null);
      setPlaying(true);
    } else if (activeGate) sendPrompt(); else setPlaying(!playing);
  }} style={{
    width: 30,
    height: 30,
    borderRadius: 6,
    border: 'none',
    background: 'rgba(217,119,87,0.1)',
    color: '#D97757',
    cursor: 'pointer',
    fontSize: 15,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }}>
          {time >= 1 ? '↺' : playing ? '⏸' : '▶'}
        </button>
        <div style={{
    flex: 1,
    height: 3,
    borderRadius: 2,
    background: 'var(--cw-track)',
    overflow: 'hidden'
  }}>
          <div style={{
    width: time * 100 + '%',
    height: '100%',
    background: '#D97757',
    transition: 'width 0.1s linear'
          }} />
        </div>
        <span style={{
    fontSize: 12,
    fontFamily: mono,
    color: 'var(--cw-text-faint)',
    minWidth: 30
  }}>
          {Math.round(time * 100)}%
        </span>
        <button onClick={toggleFullscreen} aria-label={isFullscreen ? '退出全屏' : '进入全屏'} title={isFullscreen ? '退出全屏' : '全屏'} style={{
    width: 28,
    height: 28,
    borderRadius: 6,
    border: '1px solid var(--cw-border)',
    background: 'var(--cw-surface)',
    color: 'var(--cw-text-dim)',
    cursor: 'pointer',
    fontSize: 15,
    flexShrink: 0,
    marginLeft: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }}>
          {isFullscreen ? '⤡' : '⛶'}
        </button>
      </div>
    </div>
    </>;
};

Claude Code 的上下文窗口包含 Claude 关于你的会话所知道的一切：你的指令、它读取的文件、它自己的响应，以及永远不会出现在你终端中的内容。下面的时间线逐步展示什么加载以及何时加载。请参阅[书面分解](#时间线展示的内容)以列表形式了解相同内容。

<ContextWindow />

## 时间线展示的内容

该会话通过一个具有代表性的 token 计数的真实流程来演示：

* **在你输入之前**：CLAUDE.md、自动记忆、MCP 工具名称和技能描述都已加载到上下文中。你自己的设置可能会在此处添加更多内容，如[输出样式](/zh/output-styles)或 [`--append-system-prompt`](/zh/cli-reference) 的文本，它们都以相同方式进入系统提示词。
* **当 Claude 工作时**：每个文件读取都会增加上下文，[路径作用域规则](/zh/memory#path-specific-rules)随匹配文件自动加载，[PostToolUse 钩子](/zh/hooks-guide)在每次编辑后触发。
* **后续提示词**：[子代理](/zh/sub-agents)在自己独立的上下文窗口中处理研究，因此大量文件读取保持在你的上下文之外。只有摘要和小型元数据尾部返回。
* **最后**：`/compact` 用结构化摘要替换对话。大多数启动内容自动重新加载；下表显示每个机制的情况。

## 压缩后保留的内容

当长会话压缩时，Claude Code 总结对话历史以适应上下文窗口。你的指令的命运取决于它们的加载方式：

| 机制                                 | 压缩后                                                                            |
| :---------------------------------------- | :------------------------------------------------------------------------------------------ |
| 系统提示词和输出样式            | 不变；不属于消息历史                                                      |
| 项目根目录 CLAUDE.md 和无作用域规则 | 从磁盘重新注入                                                                       |
| 自动记忆                               | 从磁盘重新注入                                                                       |
| 带有 `paths:` frontmatter 的规则           | 丢失，直到再次读取匹配文件                                                    |
| 子目录中的嵌套 CLAUDE.md        | 丢失，直到再次读取该子目录中的文件                                        |
| 已调用的技能正文                      | 重新注入，每个技能上限 5,000 tokens，总计上限 25,000 tokens；最旧的优先丢弃 |
| 钩子                                     | 不适用；钩子作为代码运行，而非上下文                                              |

路径作用域规则和嵌套 CLAUDE.md 文件在触发文件被读取时加载到消息历史中，因此压缩会将它们与其他所有内容一起总结掉。它们在 Claude 下次读取匹配文件时重新加载。如果规则必须在压缩后保留，请删除 `paths:` frontmatter 或将其移至项目根目录的 CLAUDE.md。

技能正文在压缩后重新注入，但大型技能会被截断以适应每个技能的上限，一旦超过总预算，最旧的已调用技能会被丢弃。截断保留文件的开头，因此将最重要的指令放在 `SKILL.md` 的顶部附近。

## 检查你自己的会话

该可视化使用具有代表性的数字。要随时查看你的实际上下文使用情况，请运行 `/context` 获取按类别划分的实时分解和优化建议。运行 `/memory` 检查启动时加载了哪些 CLAUDE.md 和自动记忆文件。

## 相关资源

有关时间线中展示的功能的更深入介绍，请参阅以下页面：

* [扩展 Claude Code](/zh/features-overview)：何时使用 CLAUDE.md vs 技能 vs 规则 vs 钩子 vs MCP
* [存储指令和记忆](/zh/memory)：CLAUDE.md 层次结构和自动记忆
* [子代理](/zh/sub-agents)：将研究委托给独立的上下文窗口
* [最佳实践](/zh/best-practices)：将上下文作为主要约束进行管理
* [提示词缓存](/zh/prompt-caching)：哪些操作会使缓存前缀失效
* [减少 token 使用](/zh/costs#reduce-token-usage)：保持低上下文使用量的策略
