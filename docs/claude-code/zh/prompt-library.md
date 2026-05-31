> ## 文档索引
> 获取完整文档索引: https://code.claude.com/docs/llms.txt
> 使用此文件发现所有可用页面，然后再进一步探索。

# 提示词库

> 可复制粘贴到 Claude Code 的提示词，按任务和角色分类。

export const PromptLibrary = ({text = {}, labels = {}, tagLabels = {}, phaseLabels = {}, sourceLabels = {}, catLabels = {}}) => {
  const RAW = useMemo(() => [{
    id: 'get-oriented-in-a',
    sdlc: 'discover',
    cat: 'Onboard',
    startN: 1,
    roles: [],
    prompt: 'give me an overview of this codebase: architecture, key directories, and how the pieces connect',
    nextHref: '/en/memory',
    src: 'workflows'
  }, {
    id: 'explain-unfamiliar-code',
    sdlc: 'discover',
    cat: 'Understand',
    roles: [],
    prompt: 'explain what {path} does and how data flows through it. write it up as {format}',
    slots: {
      path: 'src/scheduler/queue.ts',
      format: 'an HTML page with a diagram, then open it in my browser'
    },
    nextHref: '/en/output-styles',
    src: 'workflows'
  }, {
    id: 'find-where-something-happens',
    sdlc: 'discover',
    cat: 'Understand',
    startN: 2,
    roles: [],
    prompt: 'where do we {behavior}?',
    slots: {
      behavior: 'validate uploaded file types'
    },
    src: 'workflows'
  }, {
    id: 'see-what-depends-on',
    sdlc: 'discover',
    cat: 'Understand',
    roles: [],
    prompt: 'what would break if I deleted {target}?',
    slots: {
      target: 'the retryWithBackoff helper'
    },
    src: 'workflows'
  }, {
    id: 'trace-how-code-evolved',
    sdlc: 'discover',
    cat: 'Understand',
    roles: [],
    prompt: 'look through the commit history of {path} and summarize how it evolved and why',
    slots: {
      path: 'internal/auth/session.go'
    },
    src: 'best-practices'
  }, {
    id: 'scope-a-change-before',
    sdlc: 'discover',
    cat: 'Understand',
    roles: ['pm', 'design'],
    prompt: 'which files would I need to touch to {change}?',
    slots: {
      change: 'add a dark mode toggle to settings'
    },
    src: 'teams'
  }, {
    id: 'ask-the-codebase-a',
    sdlc: 'discover',
    cat: 'Understand',
    roles: ['pm'],
    prompt: 'I am a {role}. walk me through what happens when a user {action}, from the UI down to the result',
    slots: {
      role: 'PM',
      action: 'clicks Export to PDF'
    },
    nextHref: '/en/output-styles',
    src: 'teams'
  }, {
    id: 'plan-a-multi-file',
    sdlc: 'design',
    cat: 'Plan',
    roles: ['pm', 'design'],
    prompt: 'plan how to refactor the {target} to {goal}. list the files you would change, but don\'t edit anything yet',
    slots: {
      target: 'payment module',
      goal: 'support multiple currencies'
    },
    src: 'workflows'
  }, {
    id: 'draft-a-spec-by',
    sdlc: 'design',
    cat: 'Plan',
    roles: ['pm'],
    prompt: 'I want to build {feature}. interview me about implementation, UX, edge cases, and tradeoffs until we have covered everything, then write the spec to SPEC.md',
    slots: {
      feature: 'per-workspace rate limits'
    },
    nextHref: '/en/skills',
    src: 'best-practices'
  }, {
    id: 'turn-a-meeting-into',
    sdlc: 'design',
    cat: 'Plan',
    roles: ['pm'],
    prompt: 'read {input} and write up the action items, then create a {tracker} ticket for each with acceptance criteria',
    slots: {
      input: '@meeting-notes.md',
      tracker: 'Linear'
    },
    needs: 'tracker',
    nextHref: '/en/skills',
    src: 'teams'
  }, {
    id: 'map-edge-cases-before',
    sdlc: 'design',
    cat: 'Plan',
    roles: ['design', 'pm'],
    prompt: 'list the error states, empty states, and edge cases for {feature} that the design needs to cover',
    slots: {
      feature: 'the file upload flow'
    },
    src: 'teams'
  }, {
    id: 'turn-a-mockup-into',
    sdlc: 'design',
    cat: 'Prototype',
    roles: ['design', 'pm', 'marketing'],
    paste: 'mockup',
    prompt: 'here is a mockup. build a working prototype I can click through, matching the layout and states shown',
    src: 'teams'
  }, {
    id: 'implement-from-a-screenshot',
    sdlc: 'design',
    cat: 'Prototype',
    roles: ['design'],
    paste: 'design',
    needs: 'browser',
    prompt: 'implement this design, then take a screenshot of the result, compare it to the original, and fix any differences',
    nextHref: '/en/goal',
    src: 'best-practices'
  }, {
    id: 'follow-an-existing-pattern',
    sdlc: 'build',
    cat: 'Implement',
    roles: [],
    prompt: 'look at how {example} is implemented to understand the pattern, then build {new} the same way',
    slots: {
      example: 'the GitHub webhook handler',
      new: 'a Stripe webhook handler'
    },
    nextHref: '/en/memory',
    src: 'best-practices'
  }, {
    id: 'generate-docs-for-code',
    sdlc: 'build',
    cat: 'Implement',
    roles: ['docs'],
    prompt: 'find {scope} without {format} comments and add them, matching the style already used in the file',
    slots: {
      scope: 'the public functions in src/auth/',
      format: 'JSDoc'
    },
    src: 'workflows'
  }, {
    id: 'add-a-small-well',
    sdlc: 'build',
    cat: 'Implement',
    roles: [],
    prompt: 'add a {endpoint} endpoint that returns {payload}',
    slots: {
      endpoint: '/health',
      payload: 'the app version and uptime'
    },
    src: 'workflows'
  }, {
    id: 'build-a-small-internal',
    sdlc: 'build',
    cat: 'Implement',
    roles: ['pm', 'design', 'marketing', 'docs'],
    prompt: 'create a {tool} using HTML, CSS, and vanilla JavaScript, then open it in my browser',
    slots: {
      tool: 'drag-and-drop Kanban board with three columns'
    },
    src: 'teams'
  }, {
    id: 'work-an-issue-end',
    sdlc: 'build',
    cat: 'Implement',
    roles: [],
    prompt: 'read issue #{issue}, implement the fix, and run the tests',
    slots: {
      issue: '312'
    },
    needs: 'gh',
    src: 'workflows'
  }, {
    id: 'find-and-update-copy',
    sdlc: 'build',
    cat: 'Implement',
    roles: ['design', 'docs', 'marketing'],
    prompt: 'find every place we say "{copy}" or a close variant, show me each one in context, then update them all to "{new}". leave tests and the changelog alone',
    slots: {
      copy: 'Sign up free',
      new: 'Start free trial'
    },
    src: 'teams'
  }, {
    id: 'draft-from-past-examples',
    sdlc: 'build',
    cat: 'Implement',
    roles: ['docs', 'marketing', 'pm'],
    prompt: 'read the {examples} in {folder} to learn the structure and voice, then draft a new one for {topic}',
    slots: {
      examples: 'privacy impact assessments',
      folder: 'legal/pia/',
      topic: 'the new analytics integration'
    },
    nextHref: '/en/skills',
    src: 'legal'
  }, {
    id: 'write-tests-run-them',
    sdlc: 'build',
    cat: 'Test',
    startN: 4,
    roles: [],
    prompt: 'write tests for {path}, run them, and fix any failures',
    slots: {
      path: 'app/parsers/feed.py'
    },
    nextHref: '/en/memory',
    src: 'workflows'
  }, {
    id: 'drive-implementation-from-tests',
    sdlc: 'build',
    cat: 'Test',
    roles: [],
    prompt: 'write tests for {feature} first, then implement it until they pass',
    slots: {
      feature: 'the password reset flow'
    },
    src: 'ebook'
  }, {
    id: 'fill-gaps-from-a',
    sdlc: 'build',
    cat: 'Test',
    roles: [],
    prompt: 'read {report} and add tests for the lowest-covered files until each is above {target}%',
    slots: {
      report: 'coverage/coverage-summary.json',
      target: '80'
    },
    nextHref: '/en/goal',
    src: 'workflows'
  }, {
    id: 'migrate-a-pattern-across',
    sdlc: 'build',
    cat: 'Refactor',
    roles: [],
    prompt: 'migrate everything from {from} to {to}: identify every place that needs to change, then make the changes',
    slots: {
      from: 'the old logging API',
      to: 'the structured logger'
    },
    src: 'workflows'
  }, {
    id: 'port-code-between-languages',
    sdlc: 'build',
    cat: 'Refactor',
    roles: [],
    prompt: 'port {source} to {target}, keeping the same {keep}',
    slots: {
      source: 'this Python module',
      target: 'Rust',
      keep: 'public API and test behavior'
    },
    src: 'teams'
  }, {
    id: 'optimize-against-a-measurable',
    sdlc: 'build',
    cat: 'Refactor',
    roles: ['data'],
    prompt: 'optimize {target} to bring {metric} from {current} down to under {goal}',
    slots: {
      target: 'the search query',
      metric: 'p95 latency',
      current: '2s',
      goal: '500ms'
    },
    nextHref: '/en/goal',
    src: 'ebook'
  }, {
    id: 'fix-a-precise-visual',
    sdlc: 'build',
    cat: 'Refactor',
    roles: ['design'],
    prompt: 'the {element} extends {amount} beyond the {container} on {viewport}. fix it.',
    slots: {
      element: 'login button',
      amount: '20px',
      container: 'card border',
      viewport: 'mobile'
    },
    nextHref: '/en/desktop#preview-your-app',
    src: 'ebook'
  }, {
    id: 'review-your-changes-before',
    sdlc: 'build',
    cat: 'Review',
    startN: 5,
    roles: [],
    prompt: 'review my uncommitted changes and flag anything that looks risky before I commit',
    nextHref: '/en/commands',
    src: 'workflows'
  }, {
    id: 'review-a-pull-request',
    sdlc: 'build',
    cat: 'Review',
    roles: [],
    prompt: 'review PR #{pr} and summarize what changed, then list any concerns',
    slots: {
      pr: '247'
    },
    needs: 'gh',
    nextHref: '/en/code-review',
    src: 'workflows'
  }, {
    id: 'review-infrastructure-changes-before',
    sdlc: 'build',
    cat: 'Review',
    roles: ['security', 'ops'],
    paste: 'plan',
    prompt: 'here is my Terraform plan output. what is this going to do, and is anything here going to cause problems?',
    src: 'teams'
  }, {
    id: 'run-a-security-review',
    sdlc: 'build',
    cat: 'Review',
    roles: ['security'],
    prompt: 'use a subagent to review {path} for security issues and report what it finds',
    slots: {
      path: 'src/api/'
    },
    nextHref: '/en/sub-agents',
    src: 'best-practices'
  }, {
    id: 'review-content-before-sending',
    sdlc: 'build',
    cat: 'Review',
    roles: ['marketing', 'docs'],
    prompt: 'review {file} for {concerns} and list anything I should fix before it goes to {reviewer}',
    slots: {
      file: 'launch-post.md',
      concerns: 'unsupported claims, missing attributions, and brand-guideline issues',
      reviewer: 'legal'
    },
    nextHref: '/en/skills',
    src: 'legal'
  }, {
    id: 'course-correct-a-wrong',
    sdlc: 'build',
    cat: 'Steer',
    roles: [],
    prompt: 'that is not right: {feedback}. try a different approach',
    slots: {
      feedback: 'the function signature needs to stay backward-compatible'
    },
    nextHref: '/en/checkpointing',
    src: 'best-practices'
  }, {
    id: 'narrow-the-scope-of',
    sdlc: 'build',
    cat: 'Steer',
    roles: [],
    prompt: 'that is too much. keep only the changes to {scope} and undo your other edits',
    slots: {
      scope: 'the validation logic in src/forms/'
    },
    src: 'best-practices'
  }, {
    id: 'turn-a-correction-into',
    sdlc: 'build',
    cat: 'Steer',
    roles: [],
    prompt: 'you keep {mistake}. add a rule to CLAUDE.md so this stops happening',
    slots: {
      mistake: 'using default exports when this project uses named exports'
    },
    nextHref: '/en/memory',
    src: 'best-practices'
  }, {
    id: 'resolve-merge-conflicts',
    sdlc: 'ship',
    cat: 'Git',
    roles: [],
    prompt: 'resolve the merge conflicts in this branch and explain what you kept from each side',
    src: 'workflows'
  }, {
    id: 'commit-with-a-generated',
    sdlc: 'ship',
    cat: 'Git',
    roles: [],
    prompt: 'commit these changes with a message that summarizes what I did',
    src: 'workflows'
  }, {
    id: 'open-a-pull-request',
    sdlc: 'ship',
    cat: 'Git',
    roles: [],
    prompt: 'find the {tracker} ticket about {topic} and open a PR that implements it',
    slots: {
      tracker: 'Linear',
      topic: 'the login timeout'
    },
    needs: 'tracker',
    src: 'workflows'
  }, {
    id: 'draft-release-notes-from',
    sdlc: 'ship',
    cat: 'Release',
    roles: ['pm', 'docs', 'marketing'],
    prompt: 'compare {from} to {to} and draft release notes grouped by feature, fix, and breaking change',
    slots: {
      from: 'v2.3.0',
      to: 'v2.4.0'
    },
    nextHref: '/en/skills',
    src: 'workflows'
  }, {
    id: 'write-a-ci-workflow',
    sdlc: 'ship',
    cat: 'Release',
    roles: ['ops'],
    prompt: 'write a GitHub Actions workflow that {steps} on every push to {branch}',
    slots: {
      steps: 'runs the tests and deploys to staging',
      branch: 'main'
    },
    src: 'workflows'
  }, {
    id: 'find-and-fix-a',
    sdlc: 'operate',
    cat: 'Debug',
    startN: 3,
    roles: [],
    prompt: 'the {test} test is failing, find out why and fix it',
    slots: {
      test: 'UserAuth'
    },
    src: 'workflows'
  }, {
    id: 'investigate-a-reported-error',
    sdlc: 'operate',
    cat: 'Debug',
    roles: ['ops'],
    prompt: 'users are seeing {symptom} on {where}. investigate and tell me what is going on',
    slots: {
      symptom: '500 errors',
      where: '/api/settings'
    },
    nextHref: '/en/web-quickstart#pre-fill-sessions',
    src: 'workflows'
  }, {
    id: 'fix-a-build-error',
    sdlc: 'operate',
    cat: 'Debug',
    roles: ['ops'],
    paste: 'error',
    prompt: 'here is a build error. fix the root cause and verify the build succeeds',
    src: 'best-practices'
  }, {
    id: 'investigate-a-production-incident',
    sdlc: 'operate',
    cat: 'Incident',
    roles: ['ops', 'security'],
    prompt: '{symptom}. check the logs, recent deploys, and config changes, then tell me the most likely cause',
    slots: {
      symptom: 'the checkout endpoint started returning 500s an hour ago'
    },
    nextHref: '/en/mcp',
    src: 'workflows'
  }, {
    id: 'diagnose-from-a-console',
    sdlc: 'operate',
    cat: 'Incident',
    roles: ['ops', 'data'],
    paste: 'screenshot',
    prompt: 'here is a screenshot of {console}. walk me through why {resource} is failing and give me the exact commands to fix it',
    slots: {
      console: 'the GCP Kubernetes dashboard',
      resource: 'this pod'
    },
    src: 'teams'
  }, {
    id: 'query-logs-in-plain',
    sdlc: 'operate',
    cat: 'Incident',
    roles: ['security', 'ops', 'data'],
    prompt: 'show me all {events} for {scope} over {timeframe}. write the query, run it, and tell me what stands out',
    slots: {
      events: 'failed logins',
      scope: 'the auth service',
      timeframe: 'the past 24 hours'
    },
    needs: 'db',
    src: 'cybersecurity'
  }, {
    id: 'analyze-a-data-file',
    sdlc: 'operate',
    cat: 'Data',
    roles: ['data', 'pm', 'marketing'],
    paste: 'csv',
    prompt: 'read {file}, summarize the key patterns, and write the results to {output}',
    slots: {
      file: '@reports/q1-signups.csv',
      output: 'an HTML page with charts, then open it in my browser'
    },
    nextHref: '/en/mcp',
    src: 'teams'
  }, {
    id: 'generate-variations-from-performance',
    sdlc: 'operate',
    cat: 'Data',
    roles: ['marketing', 'data'],
    paste: 'csv',
    prompt: 'read {file}, find the underperforming {items}, and generate {n} new variations that stay under {limit} characters',
    slots: {
      file: '@ads-performance.csv',
      items: 'headlines',
      n: '20',
      limit: '90'
    },
    nextHref: '/en/mcp',
    src: 'teams'
  }, {
    id: 'turn-a-recurring-task',
    sdlc: 'operate',
    cat: 'Automate',
    roles: [],
    prompt: 'create a /{name} skill for this project that {steps}',
    slots: {
      name: 'ship',
      steps: 'runs the linter and tests, then drafts a commit message'
    },
    src: 'workflows'
  }, {
    id: 'add-a-hook-for',
    sdlc: 'operate',
    cat: 'Automate',
    roles: [],
    prompt: 'write a hook that {action} after every {event}',
    slots: {
      action: 'runs prettier',
      event: 'edit to a .ts or .tsx file'
    },
    src: 'best-practices'
  }, {
    id: 'connect-a-tool-with',
    sdlc: 'operate',
    cat: 'Automate',
    roles: [],
    prompt: 'set up the {server} MCP server so you can read my {data} directly',
    slots: {
      server: 'Sentry',
      data: 'error reports'
    },
    src: 'workflows'
  }, {
    id: 'capture-what-to-remember',
    sdlc: 'operate',
    cat: 'Automate',
    roles: ['pm', 'docs'],
    prompt: 'summarize what we did this session and suggest what to add to CLAUDE.md',
    src: 'teams'
  }], []);
  const PROMPTS = useMemo(() => {
    if (typeof window !== 'undefined') {
      const rawIds = new Set(RAW.map(p => p.id));
      RAW.forEach(p => {
        if (!text[p.id]) console.warn('[prompt-library] no text[] entry for id:', p.id);
      });
      Object.keys(text).forEach(k => {
        if (!rawIds.has(k)) console.warn('[prompt-library] orphaned text[] key:', k);
      });
    }
    return RAW.map(p => ({
      ...p,
      title: p.id,
      teaches: '',
      ...text[p.id] || ({})
    }));
  }, [RAW, text]);
  const L = labels;
  const TL = k => tagLabels[k] || k;
  const CAT_TAG = useMemo(() => ({
    Onboard: 'understand',
    Understand: 'understand',
    Plan: 'plan',
    Prototype: 'prototype',
    Implement: 'build',
    Test: 'test',
    Refactor: 'refactor',
    Review: 'review',
    Steer: 'steer',
    Git: 'git',
    Release: 'release',
    Debug: 'debug',
    Incident: 'debug',
    Data: 'data',
    Automate: 'automate'
  }), []);
  const TAGS = useMemo(() => ['understand', 'plan', 'prototype', 'build', 'test', 'refactor', 'review', 'steer', 'debug', 'git', 'release', 'data', 'automate', 'pm', 'design', 'docs', 'marketing', 'security', 'ops'], []);
  const tagsOf = p => [CAT_TAG[p.cat], ...p.roles || []];
  const doc = useMemo(() => {
    const p = typeof window !== 'undefined' ? window.location.pathname : '';
    const base = p.startsWith('/docs/') ? '/docs' : '';
    const m = p.slice(base.length).match(/^\/([a-z]{2}(?:-[A-Z]{2})?)\//);
    const locale = m ? m[1] : 'en';
    return href => {
      if (!href || href[0] !== '/' || href[1] === '/') return href;
      return base + (href.startsWith('/en/') ? '/' + locale + href.slice(3) : href);
    };
  }, []);
  const linkify = s => {
    const out = [];
    let last = 0;
    const re = /\[([^\]]+)\]\(([^)]+)\)/g;
    for (let m; m = re.exec(s); ) {
      if (m.index > last) out.push(s.slice(last, m.index));
      out.push(<a key={m.index} href={doc(m[2])}>{m[1]}</a>);
      last = re.lastIndex;
    }
    if (last < s.length) out.push(s.slice(last));
    return out;
  };
  const codeify = s => s.split(/(`[^`]+`)/g).map((part, i) => part[0] === '`' ? <code key={i}>{part.slice(1, -1)}</code> : part);
  const SOURCES = useMemo(() => ({
    'workflows': '/en/common-workflows',
    'teams': 'https://claude.com/blog/how-anthropic-teams-use-claude-code',
    'legal': 'https://claude.com/blog/how-anthropic-uses-claude-legal',
    'cybersecurity': 'https://claude.com/blog/how-anthropic-uses-claude-cybersecurity',
    'best-practices': '/en/best-practices',
    'ebook': 'https://resources.anthropic.com/hubfs/Scaling%20agentic%20coding%20across%20your%20organization.pdf'
  }), []);
  const [mounted, setMounted] = useState(false);
  const [q, setQ] = useState('');
  const [start, setStart] = useState(true);
  const [sel, setSel] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [copied, setCopied] = useState(null);
  const [fills, setFills] = useState({});
  const copyTimer = useRef(null);
  useEffect(() => {
    setMounted(true);
    return () => clearTimeout(copyTimer.current);
  }, []);
  const setFill = (id, key, val) => setFills(f => ({
    ...f,
    [id + '.' + key]: val
  }));
  const fillOf = (p, key) => {
    const v = fills[p.id + '.' + key];
    return v !== undefined ? v : p.slots && p.slots[key] !== undefined ? p.slots[key] : '';
  };
  const assemble = p => p.prompt.replace(/\{(\w+)\}/g, (_, k) => fillOf(p, k) || p.slots && p.slots[k] || k);
  const preview = p => p.prompt.replace(/\{(\w+)\}/g, (_, k) => p.slots && p.slots[k] || k);
  const bodyText = p => preview(p) + ' ' + p.teaches.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') + ' ' + (p.next || '');
  const widthFor = s => (s || '').length + 3 + 'ch';
  const ql = q.trim().toLowerCase();
  const toggleTag = k => {
    setStart(false);
    setSel(s => !ql && s === k ? null : k);
  };
  const clear = () => {
    setStart(false);
    setSel(null);
    setQ('');
  };
  const results = useMemo(() => {
    const list = PROMPTS.filter(p => {
      if (ql) return p.title.toLowerCase().includes(ql) || bodyText(p).toLowerCase().includes(ql);
      if (start) return !!p.startN;
      if (sel) return tagsOf(p).includes(sel);
      return true;
    });
    if (ql) return list;
    if (start) return list.sort((a, b) => a.startN - b.startN);
    if (sel) return list.sort((a, b) => (a.roles || []).length - (b.roles || []).length || (b.sdlc === 'operate') - (a.sdlc === 'operate'));
    return list;
  }, [PROMPTS, ql, start, sel]);
  const matchSnippet = p => {
    if (!ql || p.title.toLowerCase().includes(ql)) return null;
    const txt = bodyText(p);
    const at = txt.toLowerCase().indexOf(ql);
    if (at < 0) return null;
    const lo = Math.max(0, at - 30), hi = Math.min(txt.length, at + ql.length + 50);
    return [lo > 0 ? '…' : '', txt.slice(lo, at), <mark key="m">{txt.slice(at, at + ql.length)}</mark>, txt.slice(at + ql.length, hi), hi < txt.length ? '…' : ''];
  };
  const grouped = useMemo(() => {
    if (start && !q.trim()) return [];
    const g = {};
    for (const p of results) {
      const key = p.sdlc + '|' + p.cat;
      (g[key] = g[key] || ({
        sdlc: p.sdlc,
        cat: p.cat,
        items: []
      })).items.push(p);
    }
    return Object.values(g);
  }, [results, start, q]);
  const copy = async (str, id) => {
    try {
      await navigator.clipboard.writeText(str);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = str;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    clearTimeout(copyTimer.current);
    setCopied(id);
    copyTimer.current = setTimeout(() => setCopied(null), 1600);
  };
  const promptBody = p => {
    if (!p.slots) return <code>{p.prompt}</code>;
    const parts = p.prompt.split(/(\{\w+\})/g);
    return <code>
        {parts.map((part, idx) => {
      const m = part.match(/^\{(\w+)\}$/);
      if (!m) return <span key={idx}>{part}</span>;
      const k = m[1];
      const val = fillOf(p, k);
      return <input key={idx} type="text" className="pl-slot" value={val} placeholder={p.slots[k] || k} aria-label={k} style={{
        width: widthFor(val || p.slots[k])
      }} onChange={e => setFill(p.id, k, e.target.value)} onFocus={e => e.target.select()} onClick={e => e.stopPropagation()} />;
    })}
      </code>;
  };
  const card = p => {
    const open = openId === p.id;
    const srcHref = SOURCES[p.src];
    const srcLabel = sourceLabels[p.src];
    const snip = matchSnippet(p);
    return <div key={p.id} className={'pl-card' + (open ? ' pl-open' : '')}>
        <button type="button" className="pl-head" onClick={() => setOpenId(open ? null : p.id)} aria-expanded={open}>
          <span className="pl-title">{p.title}</span>
          {!!p.startN && <span className="pl-chip">{L.startHere} · {p.startN}</span>}
        </button>
        {snip ? <div className="pl-match">{snip}</div> : <code className="pl-prompt-preview">{preview(p)}</code>}
        {open && <div className="pl-body">
            <div className="pl-label">{p.slots ? L.fillAndCopy : L.copyThis}</div>
            {p.needs && L.needs && L.needs[p.needs] && <div className="pl-hint pl-needs">
                <span className="pl-needs-label">{L.needsLabel}</span> {linkify(L.needs[p.needs])}
              </div>}
            {p.paste && L.paste && L.paste[p.paste] && <div className="pl-hint pl-paste">{L.paste[p.paste]}</div>}
            {p.slots && <div className="pl-hint">
                {L.hintBefore} <span className="pl-hint-chip">{L.hintChip}</span> {L.hintAfter}
              </div>}
            <div className="pl-prompt-box">
              <span className="pl-caret">{'❯'}</span>
              {promptBody(p)}
              <button type="button" className="pl-copy" onClick={() => copy(assemble(p), p.id)}>
                {copied === p.id ? L.copied : L.copy}
              </button>
            </div>
            <div className="pl-label">{L.whyWorks}</div>
            <div className="pl-teaches">{linkify(p.teaches)}</div>
            {p.nextHref && p.next && <div className="pl-next">
                <span className="pl-next-label">{L.makeItStick}</span>
                <a href={doc(p.nextHref)}>{codeify(p.next)} →</a>
              </div>}
            {srcLabel && <div className="pl-src">{L.from} {srcHref ? <a href={doc(srcHref)}>{srcLabel}</a> : srcLabel}</div>}
          </div>}
      </div>;
  };
  const STYLES = useMemo(() => `
.pl {
  --pl-accent: #D97757;
  --pl-accent-bg: rgba(217,119,87,0.07);
  --pl-bg: #fff;
  --pl-surface: #FAFAF7;
  --pl-border: #E8E6DC;
  --pl-border-subtle: rgba(31,30,29,0.08);
  --pl-text: #141413;
  --pl-text-2: #5E5D59;
  --pl-text-3: #73726C;
  --pl-text-4: #9C9A92;
  --pl-mono: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
  font-family: 'Anthropic Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 16px; color: var(--pl-text); margin: 8px 0 32px;
}
.dark .pl {
  --pl-bg: #1f1e1d;
  --pl-surface: #262624;
  --pl-border: #3d3d3a;
  --pl-border-subtle: rgba(240,238,230,0.08);
  --pl-text: #f0eee6;
  --pl-text-2: #bfbdb4;
  --pl-text-3: #91908a;
  --pl-text-4: #73726c;
}
.pl *, .pl *::before, .pl *::after { box-sizing: border-box; }
.pl button { font-family: inherit; cursor: pointer; }
.pl a { color: var(--pl-accent); text-decoration: none; }
.pl a:hover { text-decoration: underline; }

.pl-search {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 18px; background: var(--pl-surface);
  border: 1px solid var(--pl-border); border-radius: 12px;
  margin-bottom: 14px;
}
.pl-search input {
  flex: 1; border: none; outline: none; background: transparent;
  font-size: 16px; color: var(--pl-text);
}
.pl-search input::placeholder { color: var(--pl-text-4); }

.pl-tags { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 18px; }
.pl-tag {
  padding: 7px 14px; border: 1px solid var(--pl-border); background: var(--pl-bg);
  font-size: 14px; color: var(--pl-text-2); border-radius: 999px;
}
.pl-tag:hover { background: var(--pl-surface); }
.pl-tag.pl-on { background: var(--pl-text); border-color: var(--pl-text); color: var(--pl-bg); }
.pl-tag.pl-start { color: var(--pl-accent); font-weight: 500; }
.pl-tag.pl-start.pl-on { background: var(--pl-accent); border-color: var(--pl-accent); color: #fff; }
.pl-tags.pl-dim .pl-tag { opacity: 0.5; }
.pl-tags.pl-dim .pl-tag:hover { opacity: 1; }
.pl-sep { width: 1px; height: 22px; background: var(--pl-border); margin: 0 4px; }
.pl-clear { border: none; background: none; font-size: 13px; color: var(--pl-text-4); padding: 4px 6px; }
.pl-clear:hover { color: var(--pl-text-2); }
.pl-count { margin-left: auto; font-size: 14px; color: var(--pl-text-4); }

.pl-group-h {
  font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--pl-text-4); margin: 24px 0 12px;
}
.pl-group-h .pl-phase { color: var(--pl-text-3); }
.pl-card {
  border: 1px solid var(--pl-border-subtle); border-radius: 10px;
  margin-bottom: 12px; background: var(--pl-bg); overflow: hidden;
  padding: 14px 18px;
}
.pl-card.pl-open { border-color: var(--pl-border); background: var(--pl-surface); }
.pl-head {
  width: 100%; display: flex; align-items: baseline; gap: 12px;
  border: none; background: transparent; text-align: left; padding: 0;
}
.pl-head:focus-visible { outline: 2px solid var(--pl-accent); outline-offset: 2px; border-radius: 6px; }
.pl-title {
  flex: 1; font-size: 17px; font-weight: 500; color: var(--pl-text);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.pl-prompt-preview {
  display: block; font-family: var(--pl-mono); font-size: 13.5px; color: var(--pl-text-3);
  margin-top: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.pl-chip {
  font-size: 11px; letter-spacing: 0.05em; text-transform: uppercase;
  padding: 3px 9px; border-radius: 999px; flex-shrink: 0;
  background: var(--pl-accent-bg); color: var(--pl-accent);
}

.pl-body { margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--pl-border-subtle); }
.pl-label {
  font-size: 11.5px; letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--pl-text-4); margin: 12px 0 8px;
}
.pl-prompt-box {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 16px; background: #141413; color: #f0eee6;
  border-radius: 8px; font-family: var(--pl-mono); font-size: 15px;
}
.pl-caret { color: var(--pl-accent); flex-shrink: 0; }
.pl-prompt-box code { flex: 1; background: none; padding: 0; color: inherit; white-space: pre-wrap; line-height: 1.9; }
.pl-slot {
  font-family: var(--pl-mono); font-size: inherit;
  background: rgba(217,119,87,0.15); color: #f0eee6;
  border: none; border-bottom: 1.5px dashed var(--pl-accent);
  border-radius: 4px 4px 0 0; padding: 2px 6px; margin: 0 1px;
  outline: none; min-width: 6ch; max-width: 100%;
  box-sizing: content-box; cursor: text;
}
.pl-slot:hover { background: rgba(217,119,87,0.22); }
.pl-slot:focus { background: rgba(217,119,87,0.28); border-bottom-style: solid; }
.pl-slot::placeholder { color: rgba(240,238,230,0.4); font-style: italic; }
.pl-hint { font-size: 14px; color: var(--pl-text-3); margin: 0 0 10px; }
.pl-paste { color: var(--pl-text-2); }
.pl-needs { color: var(--pl-text-2); }
.pl-needs-label {
  display: inline-block; font-size: 10.5px; letter-spacing: 0.06em;
  text-transform: uppercase; padding: 2px 7px; margin-right: 6px;
  border-radius: 4px; background: var(--pl-accent-bg); color: var(--pl-accent);
}
.pl-hint-chip {
  font-family: var(--pl-mono); font-size: 0.92em;
  background: var(--pl-accent-bg); color: var(--pl-accent);
  border-bottom: 1.5px dashed var(--pl-accent);
  border-radius: 3px 3px 0 0; padding: 1px 5px;
}
.pl-copy {
  font-size: 12.5px; padding: 6px 12px; border-radius: 6px;
  background: var(--pl-accent); color: #fff; border: none; flex-shrink: 0;
}
.pl-teaches { display: block; font-size: 15.5px; color: var(--pl-text-2); margin: 4px 0 0; line-height: 1.6; }
.pl-match {
  display: block; font-size: 13.5px; color: var(--pl-text-3);
  margin-top: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.pl-match mark { background: var(--pl-accent-bg); color: var(--pl-text); padding: 1px 2px; border-radius: 3px; }
.pl-next {
  display: flex; align-items: baseline; gap: 10px;
  margin: 14px 0 0; padding: 10px 12px;
  background: var(--pl-accent-bg); border-radius: 8px; font-size: 14.5px;
}
.pl-next-label {
  font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--pl-accent); font-weight: 600; flex-shrink: 0;
}
.pl-src { display: block; font-size: 14px; color: var(--pl-text-4); margin: 14px 0 0; }

.pl-show-all {
  display: block; width: 100%; padding: 14px; margin-top: 4px;
  border: 1px dashed var(--pl-border); border-radius: 10px;
  background: transparent; font-size: 15px; color: var(--pl-accent);
  text-align: center;
}
.pl-show-all:hover { background: var(--pl-accent-bg); border-style: solid; }

.pl-empty {
  padding: 32px; text-align: center; color: var(--pl-text-4);
  border: 1px dashed var(--pl-border); border-radius: 10px;
}
`, []);
  if (!mounted) return <div className="pl" style={{
    minHeight: 480
  }} />;
  return <div className="pl">
      <style>{STYLES}</style>

      <div className="pl-search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{
    color: 'var(--pl-text-4)'
  }}>
          <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input type="text" placeholder={L.search} value={q} onChange={e => {
    setQ(e.target.value);
    if (e.target.value) setStart(false);
  }} aria-label={L.search} />
      </div>

      <div className={'pl-tags' + (ql ? ' pl-dim' : '')}>
        <button type="button" className={'pl-tag pl-start' + (!ql && start ? ' pl-on' : '')} onClick={() => {
    setQ('');
    setStart(!start);
    if (!start) setSel(null);
  }}>
          ★ {L.startHere}
        </button>
        <span className="pl-sep" />
        {TAGS.map(k => <button key={k} type="button" aria-pressed={!ql && sel === k} className={'pl-tag' + (!ql && sel === k ? ' pl-on' : '')} onClick={() => {
    setQ('');
    toggleTag(k);
  }}>
            {TL(k)}
          </button>)}
        {(start || sel || q) && <button type="button" className="pl-clear" onClick={clear}>{L.clear}</button>}
        <span className="pl-count">{results.length} {results.length === 1 ? L.prompt : L.prompts}</span>
      </div>

      {results.length === 0 ? <div className="pl-empty">
          {L.noMatch} {ql ? <code>{q}</code> : null} <button type="button" className="pl-clear" onClick={clear}>{L.clear}</button>
        </div> : !ql && start ? <div>
          <div className="pl-group-h">{L.startHereHeader}</div>
          {results.map(card)}
          <button type="button" className="pl-show-all" onClick={clear}>
            {L.showAll && L.showAll.replace('{n}', PROMPTS.length)} →
          </button>
        </div> : grouped.map(g => <div key={g.sdlc + '|' + g.cat}>
            <div className="pl-group-h"><span className="pl-phase">{phaseLabels[g.sdlc] || g.sdlc}</span> · {catLabels[g.cat] || g.cat}</div>
            {g.items.map(card)}
          </div>)}
    </div>;
};

这是一个可复制到 Claude Code 的提示词库。用它来探索你尚未尝试过的工作方式，或在不确定从何开始时使用。

这些提示词收集自 Anthropic 的各种指南，包括[常用工作流](/zh/common-workflows)、[最佳实践](/zh/best-practices)和[Anthropic 团队如何使用 Claude Code](https://claude.com/blog/how-anthropic-teams-use-claude-code)。它们是起点而非脚本。打开任意提示词下的**为什么有效**，了解其背后的模式，以便编写自己的提示词。

export const labels = {
  startHere: "从这里开始",
  startHereHeader: "五个优先尝试的提示词",
  showAll: "显示全部 {n} 个提示词",
  search: "搜索提示词…",
  clear: "清除",
  prompt: "个提示词",
  prompts: "个提示词",
  noMatch: "没有匹配的提示词",
  fillAndCopy: "填写并复制",
  copyThis: "复制此提示词",
  hintBefore: "在",
  hintChip: "高亮",
  hintAfter: "字段中输入自定义内容，然后复制。",
  copy: "复制",
  copied: "已复制",
  whyWorks: "为什么有效",
  makeItStick: "让它持久生效",
  from: "来自",
  paste: {
    mockup: "粘贴、拖入或 @提及你的线框图，然后发送：",
    design: "粘贴、拖入或 @提及你的设计图，然后发送：",
    screenshot: "粘贴、拖入或 @提及你的截图，然后发送：",
    plan: "先将计划输出粘贴到提示词中，然后发送：",
    error: "先将错误输出粘贴到提示词中，然后发送：",
    csv: "将文件拖入提示词，或用 @提及替换下方路径："
  },
  needsLabel: "需要",
  needs: {
    tracker: "将你的问题跟踪器添加为 [claude.ai 连接器](/zh/mcp#use-mcp-servers-from-claude-ai) 或 [MCP 服务器](/zh/mcp)。",
    gh: "已认证 [gh CLI](https://cli.github.com)，或将 GitHub 添加为 [claude.ai 连接器](/zh/mcp#use-mcp-servers-from-claude-ai)。",
    browser: "让 Claude 能够渲染并截图结果。[桌面应用](/zh/desktop#preview-your-app)内置此功能。在终端中，安装 [Chrome 扩展](/zh/chrome) 或 Playwright [MCP](/zh/mcp) 服务器。",
    db: "将你的数据仓库或日志存储添加为 [claude.ai 连接器](/zh/mcp#use-mcp-servers-from-claude-ai) 或 [MCP 服务器](/zh/mcp)。"
  }
};

export const tagLabels = {
  understand: "理解",
  plan: "规划",
  prototype: "原型",
  build: "构建",
  test: "测试",
  refactor: "重构",
  review: "审查",
  steer: "引导",
  debug: "调试",
  git: "Git",
  release: "发布",
  data: "数据",
  automate: "自动化",
  pm: "产品",
  design: "设计",
  docs: "文档",
  marketing: "营销",
  security: "安全",
  ops: "运维"
};

export const phaseLabels = {
  discover: "发现",
  design: "设计",
  build: "构建",
  ship: "发布",
  operate: "运维"
};

export const sourceLabels = {
  workflows: "常用工作流",
  teams: "Anthropic 团队如何使用 Claude Code",
  legal: "Anthropic 如何在法务中使用 Claude",
  cybersecurity: "Anthropic 如何在网络安全中使用 Claude",
  "best-practices": "最佳实践",
  ebook: "规模化智能体编程指南"
};

export const catLabels = {
  Onboard: "入门",
  Understand: "理解",
  Plan: "规划",
  Prototype: "原型",
  Implement: "实现",
  Test: "测试",
  Refactor: "重构",
  Review: "审查",
  Steer: "引导",
  Git: "Git",
  Release: "发布",
  Debug: "调试",
  Incident: "事故",
  Data: "数据",
  Automate: "自动化"
};

export const text = {
  "get-oriented-in-a": {
    title: "快速了解新代码库",
    teaches: "描述你想了解什么，而不是指定要读哪些文件。Claude 会自行探索项目并返回整体架构摘要。",
    next: "运行 `/init` 设置 `CLAUDE.md`，让 Claude 在每次会话中记住这些"
  },
  "explain-unfamiliar-code": {
    title: "解释不熟悉的代码",
    teaches: "指定文件名并说明你想要的回答格式。可以将 HTML 页面替换为图表、要点列表或任何适合你学习方式的格式。",
    next: "设置输出样式，让 Claude 始终以你偏好的格式解释"
  },
  "find-where-something-happens": {
    title: "查找某个行为发生的位置",
    teaches: "按行为而非文件名搜索。即使你不知道文件名或所在目录，搜索仍然有效。"
  },
  "see-what-depends-on": {
    title: "删除前检查影响范围",
    teaches: "在删除任何内容前先询问。调用者和下游影响的列表能告诉你这是一行代码的清理还是需要协调的变更。"
  },
  "trace-how-code-evolved": {
    title: "追溯代码演变过程",
    teaches: "当问题是「为什么」而非「是什么」时，指向提交历史。Claude 会读取你使用的任何版本控制系统的日志和 blame 记录，解释当前实现背后的决策。"
  },
  "scope-a-change-before": {
    title: "开始前评估变更范围",
    teaches: "在将其纳入路线图之前先评估工作量。文件列表能告诉你这是一个组件的变更还是跨多个模块的变更。"
  },
  "ask-the-codebase-a": {
    title: "向代码库提产品问题",
    teaches: "说明你的角色，以便回答以适当的层次呈现。Claude 从源代码解释产品的实际行为，无需你亲自阅读代码。",
    next: "设置输出样式，让 Claude 始终以此层次回答"
  },
  "plan-a-multi-file": {
    title: "在修改代码前规划多文件变更",
    teaches: "添加「暂不编辑」将探索与修改分离，让你在代码变动前看到方案。要使规划优先成为每个提示词的默认行为，按 Shift+Tab 进入[计划模式](/zh/permission-modes#analyze-before-you-edit-with-plan-mode)。"
  },
  "draft-a-spec-by": {
    title: "通过访谈起草需求规格",
    teaches: "要求被访谈而非自己编写规格。Claude 会向你提出结构化问题直到需求完整，然后将结果写入文件。",
    next: "将访谈问题保存为 `/spec` 技能，让每次规格编写方式一致"
  },
  "turn-a-meeting-into": {
    title: "将会议转化为工单",
    teaches: "跳过转录步骤。Claude 从非结构化输入中提取行动项，通过 [MCP](/zh/mcp) 直接写入你的跟踪器，让你审查工单而非转录文本。",
    next: "将此保存为 `/tickets` 技能"
  },
  "map-edge-cases-before": {
    title: "构建前梳理边界情况",
    teaches: "询问缺失的内容而非已有的内容。Claude 会列出正常路径设计容易忽略的错误状态、空状态和边界情况。"
  },
  "turn-a-mockup-into": {
    title: "将线框图转化为可交互原型",
    teaches: "可点击的原型能回答静态线框图无法回答的问题。将可运行的代码交给工程团队，而非在文档中解释交互方式。"
  },
  "implement-from-a-screenshot": {
    title: "根据截图实现并自检",
    teaches: "这为 Claude 提供了验证循环：渲染、与原始图片对比、自动迭代，无需你逐个指出差异。",
    next: "使用 `/goal` 让 Claude 持续迭代直到截图匹配"
  },
  "follow-an-existing-pattern": {
    title: "遵循已有模式",
    teaches: "指向你喜欢的代码。没有参考时，Claude 默认使用通用最佳实践。有了参考，它会匹配你的代码库实际使用的约定。",
    next: "让 Claude 将遵循的模式写入 `CLAUDE.md`，这样未来的会话无需参考也能匹配"
  },
  "add-a-small-well": {
    title: "添加一个小型、定义明确的功能",
    teaches: "说明输入和输出，而非如何构建。Claude 会找到类似代码的位置并将你的代码添加在旁边。"
  },
  "build-a-small-internal": {
    title: "从零构建小型内部工具",
    teaches: "你不需要项目、框架或构建步骤。描述工具并让 Claude 打开它，这样你能立即看到效果。"
  },
  "work-an-issue-end": {
    title: "端到端处理一个问题",
    teaches: "给出问题编号而非摘要。Claude 自己会读完整工单，你忘记提到的需求也会被包含，并在汇报前验证变更。"
  },
  "find-and-update-copy": {
    title: "在代码库中查找并更新文案",
    teaches: "要求查找变体并说明跳过范围。Claude 会找到字面搜索会遗漏的措辞，保留测试夹具和历史记录不变，这样你只需审查用户实际看到的文案。"
  },
  "draft-from-past-examples": {
    title: "从已有示例起草文档",
    teaches: "指向已完成工作的文件夹而非描述你的风格。Claude 从你已发布的文档中学习结构和语气，使初稿读起来像你自己写的。",
    next: "将语气保存为技能，让每次起草都从那里开始"
  },
  "write-tests-run-them": {
    title: "编写测试、运行并修复失败",
    teaches: "一次性要求编写、运行和修复，让 Claude 无需等待指令就能持续迭代。",
    next: "运行 `/init` 让 Claude 自动学习你的测试命令"
  },
  "drive-implementation-from-tests": {
    title: "以测试驱动实现",
    teaches: "测试驱动开发：测试定义完成标准，Claude 持续迭代实现直到测试通过。"
  },
  "fill-gaps-from-a": {
    title: "根据覆盖率报告填补空白",
    teaches: "指向覆盖率报告而非猜测哪些未测试。Claude 读取实际数据并为最需要测试的文件编写测试。",
    next: "将此设为 `/goal`，让 Claude 持续编写测试直到覆盖率达到目标"
  },
  "port-code-between-languages": {
    title: "将代码移植到另一种语言",
    teaches: "说明需要保留什么，而不仅仅是目标语言。指定必须保持不变的 API 或行为，为 Claude 提供移植的验证标准。"
  },
  "generate-docs-for-code": {
    title: "为未文档化的代码生成文档",
    teaches: "指定范围和格式。Claude 找到缺失的部分并匹配文件中已有的注释风格，使新文档与现有文档保持一致。"
  },
  "migrate-a-pattern-across": {
    title: "在整个代码库中迁移模式",
    teaches: "描述旧模式和新模式。让 Claude 先识别每个需要变更的位置，这样调用点会在响应中列出，你可以检查是否有遗漏。"
  },
  "optimize-against-a-measurable": {
    title: "针对可量化目标优化",
    teaches: "说明指标和目标，为 Claude 提供明确的完成标准。",
    next: "将此设为 `/goal`，让 Claude 持续测量和迭代直到达到目标"
  },
  "fix-a-precise-visual": {
    title: "修复精确的视觉 bug",
    teaches: "精确的视觉反馈能得到精确的修复。说明确切的元素、尺寸和视口。",
    next: "添加预览工具，让 Claude 自行截图并验证修复"
  },
  "review-your-changes-before": {
    title: "提交前审查你的变更",
    teaches: "在问题修复成本还低时发现它们。Claude 完整读取变更文件，而非仅看 diff 行，因此能发现快速自查遗漏的问题。",
    next: "运行 `/review` 以一条命令执行相同的检查"
  },
  "review-a-pull-request": {
    title: "审查拉取请求",
    teaches: "Claude 在整个代码库的上下文中审查，而非仅看 diff。它读取变更代码及其调用的内容，因此能发现仅看 diff 会遗漏的问题。",
    next: "通过 Code Review 为每个 PR 启用此功能"
  },
  "review-infrastructure-changes-before": {
    title: "应用前审查基础设施变更",
    teaches: "计划输出密集且难以扫描。粘贴它能让你在应用前获得实际变更的易读摘要。"
  },
  "run-a-security-review": {
    title: "使用子代理进行安全审查",
    teaches: "[子代理](/zh/sub-agents)在自己的上下文窗口中运行审计并汇报摘要，这样冗长的安全审查不会填满你的主会话。内置的通用子代理无需额外设置即可处理此任务。",
    next: "设置专用的安全审查子代理，供整个团队使用"
  },
  "review-content-before-sending": {
    title: "正式审查前发现问题",
    teaches: "在人工花时间之前先过一遍。指定你想检查的关注点，让审查更有针对性，然后修复发现的问题并提交更干净的草稿。",
    next: "将你的审查清单捕获为整个团队可运行的技能"
  },
  "course-correct-a-wrong": {
    title: "纠正错误方向",
    teaches: "指出 Claude 遗漏的约束，而非仅仅说它错了。具体的原因给 Claude 一个明确的约束来满足重试，而不是再次猜测。",
    next: "按两次 `Esc` 打开回溯菜单，恢复代码和对话，让重试从干净的状态开始"
  },
  "narrow-the-scope-of": {
    title: "缩小变更范围",
    teaches: "当方向正确但变更范围过大时，让 Claude 保留部分内容而非回滚所有修改。明确的边界能防止小修复变成重构。"
  },
  "turn-a-correction-into": {
    title: "将纠正转化为规则",
    teaches: "聊天中的纠正不会与团队共享。项目 [CLAUDE.md](/zh/memory) 中的规则在你提交后会被共享，Claude 在每次会话开始时都会读取它。",
    next: "打开 `/memory` 查看 Claude 写了什么"
  },
  "resolve-merge-conflicts": {
    title: "解决合并冲突",
    teaches: "说明你想要的状态，而非保留哪些标记。要求解释原因使合并可审查而非黑盒。"
  },
  "commit-with-a-generated": {
    title: "使用生成的提交信息提交",
    teaches: "让 Claude 从 diff 推导提交信息。它会匹配你仓库已有的提交风格。"
  },
  "open-a-pull-request": {
    title: "从工单打开拉取请求",
    teaches: "跳过跟踪器、编辑器和 GitHub 之间的上下文切换。一条提示词就能读取规格、进行修改并打开 PR。"
  },
  "draft-release-notes-from": {
    title: "从 git 历史起草发布说明",
    teaches: "给出两个参考点和你想要的结构。Claude 读取它们之间的提交日志并起草你可以编辑的变更日志。",
    next: "将此保存为 `/changelog` 技能"
  },
  "write-a-ci-workflow": {
    title: "编写 CI 工作流",
    teaches: "描述何时运行和做什么；YAML 会为你生成，匹配你项目的构建和测试命令。"
  },
  "find-and-fix-a": {
    title: "查找并修复失败的测试",
    teaches: "描述症状；你不需要知道哪个文件有问题。Claude 运行测试查看失败，追踪到源代码并修复它。"
  },
  "investigate-a-reported-error": {
    title: "调查报告的错误",
    teaches: "描述症状和位置；Claude 读取相关代码路径并追踪可能的原因。如果有堆栈跟踪或日志，可以粘贴它们。",
    next: "在你的运维手册中放一个深链接，预填此提示词打开 Claude"
  },
  "fix-a-build-error": {
    title: "从根本上修复构建错误",
    teaches: "要求根本原因和验证，防止仅抑制错误而不修复的表面补丁。"
  },
  "investigate-a-production-incident": {
    title: "调查生产事故",
    teaches: "列出需要关联的证据来源，而非要采取的步骤。Claude 一起读取日志、git 历史和配置来缩小原因范围。",
    next: "通过 MCP 连接 Sentry 或你的日志存储"
  },
  "query-logs-in-plain": {
    title: "用自然语言查询日志",
    teaches: "提问而非编写 SQL。Claude 构建查询，对你连接的日志运行它，并同时显示查询和结果，让你检查运行了什么。"
  },
  "diagnose-from-a-console": {
    title: "从控制台截图诊断",
    teaches: "云控制台展示问题但不提供修复命令。Claude 读取截图并将仪表板转化为要运行的 kubectl、gcloud 或 aws 命令。"
  },
  "analyze-a-data-file": {
    title: "分析数据文件",
    teaches: "一次性问题不需要一次性脚本。指向项目文件夹中的文件，Claude 直接读取它、发现模式并按要求写入输出。",
    next: "通过 MCP 连接数据源而非导出文件"
  },
  "generate-variations-from-performance": {
    title: "从效果数据生成变体",
    teaches: "在开头说明约束，使生成保持在限制内。Claude 读取指标、选择要替换的内容并生成合适的替代方案。",
    next: "通过 MCP 连接广告平台而非导出文件"
  },
  "turn-a-recurring-task": {
    title: "将重复任务转化为技能",
    teaches: "命名一次步骤；作为命令重复使用。Claude 编写一个你团队任何人都能运行的[技能](/zh/skills)。"
  },
  "add-a-hook-for": {
    title: "为重复行为添加钩子",
    teaches: "钩子使行为自动化，而非需要记住去要求。描述触发条件和操作，Claude 编写[钩子](/zh/hooks)配置。"
  },
  "connect-a-tool-with": {
    title: "通过 MCP 连接工具",
    teaches: "连接一次数据源，而非每次会话都粘贴数据。[MCP](/zh/mcp) 设置完成后，当你询问时 Claude 会直接从工具读取。"
  },
  "capture-what-to-remember": {
    title: "捕获下次需要记住的内容",
    teaches: "在忘记之前询问。Claude 知道这次会话中它需要弄清楚什么，并建议 [CLAUDE.md](/zh/memory) 条目，让下次会话从该上下文开始。"
  }
};

<PromptLibrary text={text} labels={labels} tagLabels={tagLabels} phaseLabels={phaseLabels} sourceLabels={sourceLabels} catLabels={catLabels} />

## 什么让这些提示词有效

上面的提示词有一些共同模式。识别这些模式有助于你将这里的任何提示词调整为适合自己的任务。

**描述结果，而非步骤。** 说出你想要什么，让 Claude 自己找文件。以下提示词无需指定任何文件路径就能工作。

```text
add rate limiting to the public API and make sure existing tests still pass
```

**给它检查自己工作的方法。** 在同一条提示词中要求运行、测试、比较或验证，让 Claude 持续迭代而非一次尝试后就停止。

```text
write the migration, run it against the dev database, and confirm the schema matches
```

**指向参考。** 指定要匹配的现有文件、测试或模式，使新代码与已有代码保持一致。

```text
add a settings page that follows the same layout as the profile page
```

**说明可量化的目标。** 当目标是性能或覆盖率时，给出指标和阈值，使完成标准明确无误。

```text
get the bundle size under 200KB and show me what you removed
```

**提供素材。** 将错误、日志、截图和计划输出直接粘贴到提示词中，或输入 `@` 引用文件。Claude 读取原始内容而非你的描述。

```text
why is the build failing? @build.log
```

**说明你想要的回答方式。** 指定格式、长度或受众，使解释适合你的使用场景。要使某种格式成为每次回答的默认值，请设置[输出样式](/zh/output-styles)。

```text
explain how the payment retry logic works as an HTML page with a diagram, then open it in my browser
```

有关每种模式的更多信息，请参阅[最佳实践](/zh/best-practices)。

## 来源

这些提示词基于已发布的 Anthropic 资源中的模式。每张卡片都链接到其来源：

* [常用工作流](/zh/common-workflows)：核心任务的分步指南
* [最佳实践](/zh/best-practices)：提示词模式和项目设置
* [Anthropic 团队如何使用 Claude Code](https://claude.com/blog/how-anthropic-teams-use-claude-code)：来自工程、产品、设计和数据团队的实际工作流，包括[法务](https://claude.com/blog/how-anthropic-uses-claude-legal)、[营销](https://claude.com/blog/how-anthropic-uses-claude-marketing)和[网络安全](https://claude.com/blog/how-anthropic-uses-claude-cybersecurity)的深入案例
* [规模化智能体编程指南](https://resources.anthropic.com/hubfs/Scaling%20agentic%20coding%20across%20your%20organization.pdf)：企业采用指南

有关这些模式的视频演示，请参阅 Anthropic Academy 上的免费课程 [Claude Code in Action](https://anthropic.skilljar.com/claude-code-in-action)。

## 相关资源

本页的提示词是起点。一旦某个提示词适合你的项目，下一步就是使其可重复：将其保存为[技能](/zh/skills)，让团队任何人都能作为 `/command` 运行，并将 Claude 学到的约定记录在 [CLAUDE.md](/zh/memory) 中，让每次会话都从该上下文开始，而非让 Claude 重新学习。对于更大或风险更高的变更，[计划模式](/zh/permission-modes#analyze-before-you-edit-with-plan-mode)会在任何编辑发生前向你展示文件列表。

如果你正在团队中推广 Claude Code，请参阅[管理设置](/zh/admin-setup)了解托管设置和策略，以及[成本和用量](/zh/costs)了解此工作在你的计划中如何计费。