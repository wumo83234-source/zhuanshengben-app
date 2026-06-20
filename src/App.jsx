import {
  BookOpen,
  Brain,
  CalendarDays,
  Check,
  ChevronLeft,
  Database,
  Eraser,
  FileUp,
  GraduationCap,
  Home,
  Layers,
  PenLine,
  RotateCcw,
  RotateCw,
  Save,
  Sparkles,
  Star,
  Target,
  TabletSmartphone,
  Trash2,
  UserRound,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const DB_NAME = "zsb-assistant-db";
const DB_VERSION = 1;
const STORE_NAME = "app-state";
const STATE_KEY = "main";

const initialState = {
  tasks: [
    { id: "T01", time: "08:00", title: "英语核心词 30 个", tag: "英语", status: "done", fixed: false },
    { id: "T02", time: "09:00", title: "直播兼职时段锁定", tag: "避让", status: "done", fixed: true },
    { id: "T03", time: "11:20", title: "极限等价无穷小适用边界", tag: "高数", status: "active", fixed: false },
    { id: "T04", time: "14:30", title: "极限换元变式 5 题", tag: "刷题", status: "todo", fixed: false },
    { id: "T05", time: "18:00", title: "晚间兼职时段锁定", tag: "避让", status: "todo", fixed: true },
  ],
  knowledge: [
    {
      id: "M001",
      subject: "高数",
      module: "极限",
      title: "等价无穷小替换",
      level: "C",
      priority: "S",
      wrongCount: 5,
      weak: "严重",
      mistake: "变量趋近非 0 常数时，直接套 sinx≈x，遗漏换元前提。",
    },
    {
      id: "M002",
      subject: "高数",
      module: "连续",
      title: "闭区间零点定理",
      level: "B",
      priority: "A",
      wrongCount: 1,
      weak: "正常",
      mistake: "混淆零点存在和介值定理的使用条件。",
    },
    {
      id: "E001",
      subject: "英语",
      module: "语法",
      title: "非谓语主动被动判断",
      level: "C",
      priority: "S",
      wrongCount: 4,
      weak: "中等",
      mistake: "未先找逻辑主语，凭中文语感直接翻译。",
    },
  ],
  wrongQuestions: [
    {
      id: "W01",
      title: "lim(x→π) sin(x)/(x-π)",
      source: "AI诊断",
      reason: "第一步把 sin(x) 当作 x 处理，但 x 趋近 π，不满足等价替换前提。",
      image: "",
      createdAt: "2026-06-20",
    },
  ],
  library: [
    { id: "P01", title: "2025 河南数学押题卷.pdf", tag: "高数 · 极限", status: "已解析" },
    { id: "P02", title: "非谓语作状语手写笔记.png", tag: "英语 · 语法", status: "已解析" },
  ],
};

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function loadState() {
  if (!("indexedDB" in window)) return null;
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).get(STATE_KEY);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

async function saveState(state) {
  if (!("indexedDB" in window)) return;
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(state, STATE_KEY);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

function App() {
  const [appState, setAppState] = useState(initialState);
  const [activeTab, setActiveTab] = useState("home");
  const [deviceMode, setDeviceMode] = useState("phone");
  const [toast, setToast] = useState("");
  const [quizType, setQuizType] = useState("考点专练");
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [rating, setRating] = useState(4);
  const [guessed, setGuessed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    loadState()
      .then((saved) => {
        if (saved) setAppState({ ...initialState, ...saved });
      })
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveState(appState).catch(() => {});
  }, [appState, hydrated]);

  const showToast = useCallback((message) => {
    setToast(message);
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => setToast(""), 2400);
  }, []);

  const startQuiz = useCallback(
    (type) => {
      setQuizType(type);
      setAnalysisOpen(false);
      setActiveTab("quiz");
      window.setTimeout(() => window.dispatchEvent(new Event("resize")), 80);
      showToast("已开启手写草稿记录");
    },
    [showToast],
  );

  const toggleTask = useCallback((id) => {
    setAppState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === id ? { ...task, status: task.status === "done" ? "todo" : "done" } : task,
      ),
    }));
  }, []);

  const uploadMaterial = useCallback(() => {
    setAppState((prev) => ({
      ...prev,
      library: [
        {
          id: `P${Date.now()}`,
          title: `上传讲义_${new Date().toLocaleDateString("zh-CN")}.pdf`,
          tag: "高数 · 极限换元",
          status: "已解析",
        },
        ...prev.library,
      ],
    }));
    showToast("资料已上传并完成考点贴标");
  }, [showToast]);

  const saveWrongQuestion = useCallback(
    (image) => {
      setAppState((prev) => ({
        ...prev,
        knowledge: prev.knowledge.map((item) =>
          item.id === "M001"
            ? { ...item, level: "D", weak: "严重", wrongCount: item.wrongCount + 1 }
            : item,
        ),
        wrongQuestions: [
          {
            id: `W${Date.now()}`,
            title: "lim(x→π) sin(x)/(x-π)",
            source: guessed ? "靠蒙回流" : rating <= 2 ? "低自评回流" : "AI诊断",
            reason: "第一步误用 sin(x)≈x，未先把变量换到趋近 0 的场景。",
            image,
            createdAt: new Date().toLocaleDateString("zh-CN"),
          },
          ...prev.wrongQuestions,
        ],
      }));
      setModalOpen(false);
      setActiveTab("wrong");
      showToast("已归入错题本，并保存当前手写草稿");
    },
    [guessed, rating, showToast],
  );

  const navItems = useMemo(
    () => [
      { id: "home", label: "首页", icon: Home },
      { id: "practice", label: "练习", icon: PenLine },
      { id: "knowledge", label: "考点", icon: BookOpen },
      { id: "wrong", label: "错题", icon: Brain },
      { id: "profile", label: "我的", icon: UserRound },
    ],
    [],
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_12%_14%,rgba(234,200,209,.35),transparent_24%),radial-gradient(circle_at_82%_0%,rgba(192,207,230,.4),transparent_26%),linear-gradient(135deg,#fbfcfb,#eef3ef)] text-charcoal">
      <div className="mx-auto w-full max-w-7xl px-4 py-5 lg:px-8">
        <header className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-sage-400 text-white shadow-panel">
              <GraduationCap size={24} />
            </div>
            <div>
              <h1 className="text-lg font-black leading-tight">河南专升本上岸助手</h1>
              <p className="text-xs font-bold text-sage-600">PWA · 手写诊断 · 错题回流</p>
            </div>
          </div>
          <div className="flex rounded-full border border-sage-200 bg-white/80 p-1 shadow-panel backdrop-blur">
            <ModeButton active={deviceMode === "phone"} onClick={() => setDeviceMode("phone")}>
              手机
            </ModeButton>
            <ModeButton active={deviceMode === "tablet"} onClick={() => setDeviceMode("tablet")}>
              iPad
            </ModeButton>
          </div>
        </header>

        <main className="grid gap-6 lg:grid-cols-[390px_1fr]">
          <aside className="hidden rounded-[28px] bg-sage-400 p-8 text-white shadow-device lg:block">
            <p className="mb-16 text-xs font-black uppercase tracking-[.22em] opacity-80">
              IndexedDB + PWA + AI API Ready
            </p>
            <h2 className="max-w-[300px] text-4xl font-black leading-tight">
              先上线一个能用的学习闭环
            </h2>
            <p className="mt-5 max-w-[300px] text-sm font-semibold leading-7 text-white/80">
              计划、手写、诊断、错题、资料库都先在本地持久化，后续再接 Cloudflare Worker 与 AI/OCR 接口。
            </p>
            <div className="mt-10 grid gap-3">
              <Capability icon={Database} title="本地数据" text="IndexedDB 自动保存练习状态" />
              <Capability icon={TabletSmartphone} title="PWA 外壳" text="可部署到 Cloudflare Pages" />
              <Capability icon={Sparkles} title="AI 入口" text="诊断流程已留 API 接入位置" />
            </div>
          </aside>

          <section className="flex justify-center">
            <div
              className={`relative flex w-full flex-col overflow-hidden bg-white shadow-device transition-all duration-300 ${
                deviceMode === "tablet"
                  ? "max-w-[900px] rounded-[34px] border-[12px] border-sage-100"
                  : "max-w-[430px] rounded-[42px] border-[10px] border-sage-100"
              }`}
            >
              <div className="flex items-center justify-between border-b border-sage-100 px-5 pb-3 pt-5">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[.18em] text-sage-500">
                    {deviceMode === "tablet" ? "iPad Split View" : "Tablet Ready"}
                  </p>
                  <h3 className="text-base font-black">{pageTitle(activeTab)}</h3>
                </div>
                <span className="rounded-full bg-roseAccent/25 px-3 py-1 text-xs font-black text-[#7a5b63]">
                  76%
                </span>
              </div>

              <div className="h-[680px] overflow-y-auto px-5 py-5 lg:h-[710px]">
                {activeTab === "home" && (
                  <HomePage tasks={appState.tasks} onToggleTask={toggleTask} onStartQuiz={startQuiz} />
                )}
                {activeTab === "practice" && <PracticePage onStartQuiz={startQuiz} />}
                {activeTab === "knowledge" && (
                  <KnowledgePage knowledge={appState.knowledge} onStartQuiz={startQuiz} />
                )}
                {activeTab === "wrong" && <WrongPage wrongQuestions={appState.wrongQuestions} />}
                {activeTab === "profile" && (
                  <ProfilePage library={appState.library} onUpload={uploadMaterial} />
                )}
                {activeTab === "quiz" && (
                  <QuizPage
                    deviceMode={deviceMode}
                    guessed={guessed}
                    quizType={quizType}
                    rating={rating}
                    onBack={() => setActiveTab("practice")}
                    onChangeGuessed={setGuessed}
                    onChangeRating={setRating}
                    onOpenDiagnosis={() => setModalOpen(true)}
                    onSubmit={() => {
                      setAnalysisOpen(true);
                      showToast("答案已核对，可开始思路诊断");
                    }}
                    analysisOpen={analysisOpen}
                    onSaveWrong={saveWrongQuestion}
                  />
                )}
              </div>

              {activeTab !== "quiz" && (
                <nav className="absolute bottom-5 left-5 right-5 rounded-full bg-charcoal px-3 py-2 shadow-xl">
                  <div className="grid grid-cols-5">
                    {navItems.map((item) => (
                      <button
                        key={item.id}
                        className={`grid place-items-center gap-0.5 rounded-full py-2 text-[10px] font-black transition ${
                          activeTab === item.id ? "text-sage-300" : "text-white/55"
                        }`}
                        onClick={() => setActiveTab(item.id)}
                        aria-label={item.label}
                      >
                        <item.icon size={19} />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </nav>
              )}
            </div>
          </section>
        </main>
      </div>

      <DiagnosisModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={() => window.dispatchEvent(new CustomEvent("save-current-strokes"))}
      />

      <div
        className={`fixed left-1/2 top-6 z-50 -translate-x-1/2 rounded-full bg-charcoal px-5 py-3 text-xs font-bold text-white shadow-xl transition ${
          toast ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
        }`}
      >
        {toast || "提示"}
      </div>
    </div>
  );
}

function ModeButton({ active, children, onClick }) {
  return (
    <button
      className={`h-9 rounded-full px-4 text-xs font-black transition ${
        active ? "bg-white text-charcoal shadow" : "text-sage-600"
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function Capability({ icon: Icon, title, text }) {
  return (
    <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
      <div className="mb-2 flex items-center gap-2">
        <Icon size={18} />
        <h3 className="text-sm font-black">{title}</h3>
      </div>
      <p className="text-xs font-semibold leading-5 text-white/75">{text}</p>
    </div>
  );
}

function HomePage({ tasks, onToggleTask, onStartQuiz }) {
  return (
    <div className="space-y-5 pb-24">
      <HeroCard onStartQuiz={() => onStartQuiz("今日纠偏")} />
      <div className="grid grid-cols-2 gap-3">
        <Metric label="剩余考点" value="78" />
        <Metric label="本周学习" value="43h" />
      </div>
      <section className="rounded-[24px] border border-roseAccent/30 bg-roseAccent/15 p-4">
        <p className="text-sm font-bold leading-6 text-[#7a5b63]">
          今日提示：极限求导错误较多，建议做 1 道等价变形，提交手写过程给 AI 诊断。
        </p>
      </section>
      <SectionTitle icon={CalendarDays} title="避让型复习大纲" action="已避让直播兼职" />
      <div className="space-y-3">
        {tasks.map((task) => (
          <button
            key={task.id}
            className="flex w-full items-center gap-3 rounded-[20px] border border-sage-100 bg-softGray p-4 text-left"
            onClick={() => onToggleTask(task.id)}
          >
            <span
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                task.status === "done" ? "bg-sage-400 text-white" : "bg-white text-sage-500"
              }`}
            >
              {task.status === "done" ? <Check size={17} /> : <Target size={17} />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-black text-sage-600">{task.time} · {task.tag}</span>
              <span className="block truncate text-sm font-black">{task.title}</span>
            </span>
            {task.fixed && <span className="rounded-full bg-charcoal px-2 py-1 text-[10px] font-black text-white">锁定</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

function PracticePage({ onStartQuiz }) {
  return (
    <div className="space-y-5 pb-24">
      <section className="rounded-[28px] border border-white/80 bg-gradient-to-br from-sage-100 to-iceAccent/60 p-5">
        <p className="mb-2 text-[11px] font-black uppercase tracking-[.16em] text-sage-600">Practice Loop</p>
        <h2 className="text-xl font-black">高数 / 英语高频专练</h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-sage-700">
          做题时同步保存手写草稿，提交后进入 AI 诊断和错题回流。
        </p>
      </section>
      <div className="grid grid-cols-2 gap-3">
        <PracticeButton icon={PenLine} title="真题特训" text="上传试题优先" onClick={() => onStartQuiz("真题特训")} />
        <PracticeButton icon={Brain} title="思路纠错" text="主观路径纠偏" onClick={() => onStartQuiz("思路纠错")} />
      </div>
      <section className="rounded-[24px] border border-sage-100 bg-softGray p-5">
        <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black text-sage-600">AI 推荐</span>
        <h3 className="mt-4 text-base font-black">手写极限变式专练 2 道</h3>
        <p className="mt-2 text-sm font-semibold leading-6 text-sage-700">
          重点检查“变量趋近非零常数时能否直接代换”的思维边界。
        </p>
        <button
          className="mt-4 h-11 w-full rounded-full bg-sage-400 text-sm font-black text-white shadow-panel"
          onClick={() => onStartQuiz("考点专练")}
        >
          开始练习
        </button>
      </section>
    </div>
  );
}

function KnowledgePage({ knowledge, onStartQuiz }) {
  return (
    <div className="space-y-4 pb-24">
      <SectionTitle icon={BookOpen} title="考点库" action="按薄弱度排序" />
      {knowledge.map((item) => (
        <article key={item.id} className="rounded-[24px] border border-sage-100 bg-white p-5 shadow-panel">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-black text-sage-600">{item.subject} · {item.module} · 优先级 {item.priority}</p>
              <h3 className="mt-1 text-base font-black">{item.title}</h3>
            </div>
            <span className="rounded-full bg-softGray px-3 py-1 text-xs font-black">掌握 {item.level}</span>
          </div>
          <p className="mt-3 rounded-2xl bg-softGray p-3 text-xs font-bold leading-5 text-sage-700">
            常见误区：{item.mistake}
          </p>
          <div className="mt-4 flex items-center justify-between border-t border-sage-100 pt-4">
            <span className="text-xs font-black text-[#7a5b63]">错题 {item.wrongCount} 次 · {item.weak}</span>
            <button className="rounded-full bg-charcoal px-4 py-2 text-xs font-black text-white" onClick={() => onStartQuiz("考点变式")}>
              开始练
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

function WrongPage({ wrongQuestions }) {
  return (
    <div className="space-y-4 pb-24">
      <SectionTitle icon={Brain} title="思路错题本" action={`${wrongQuestions.length} 条记录`} />
      {wrongQuestions.map((item) => (
        <article key={item.id} className="rounded-[24px] border border-sage-100 bg-white p-4 shadow-panel">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full bg-roseAccent/20 px-3 py-1 text-[11px] font-black text-[#7a5b63]">{item.source}</span>
            <span className="text-[11px] font-bold text-sage-500">{item.createdAt}</span>
          </div>
          <h3 className="mt-3 text-sm font-black">{item.title}</h3>
          <p className="mt-2 text-xs font-semibold leading-5 text-sage-700">{item.reason}</p>
          {item.image ? (
            <img className="mt-3 max-h-36 w-full rounded-2xl border border-dashed border-sage-200 bg-[#fbfdfb] object-contain" src={item.image} alt="手写草稿" />
          ) : (
            <div className="mt-3 rounded-2xl border border-dashed border-sage-200 bg-[#fbfdfb] p-4 text-center text-xs font-bold text-sage-500">
              手写草稿将在诊断后自动归档
            </div>
          )}
        </article>
      ))}
    </div>
  );
}

function ProfilePage({ library, onUpload }) {
  return (
    <div className="space-y-5 pb-24">
      <section className="rounded-[28px] border border-sage-100 bg-white p-5 shadow-panel">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-sage-100 text-sage-700">
            <UserRound size={30} />
          </div>
          <div>
            <h2 className="text-lg font-black">Jacob 的上岸档案</h2>
            <p className="text-sm font-bold text-sage-600">高数优先 · 晚间兼职避让 · 本地已同步</p>
          </div>
        </div>
      </section>
      <button className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-charcoal text-sm font-black text-white" onClick={onUpload}>
        <FileUp size={18} />
        上传资料并解析
      </button>
      <SectionTitle icon={Layers} title="资料库" action="OCR mock" />
      <div className="space-y-3">
        {library.map((item) => (
          <article key={item.id} className="flex items-center justify-between gap-3 rounded-[20px] border border-sage-100 bg-softGray p-4">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-black">{item.title}</h3>
              <p className="text-xs font-bold text-sage-600">{item.tag}</p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black text-sage-600">{item.status}</span>
          </article>
        ))}
      </div>
    </div>
  );
}

function QuizPage({
  analysisOpen,
  deviceMode,
  guessed,
  onBack,
  onChangeGuessed,
  onChangeRating,
  onOpenDiagnosis,
  onSaveWrong,
  onSubmit,
  quizType,
  rating,
}) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [pages, setPages] = useState([{ strokes: [], undone: [] }, { strokes: [], undone: [] }]);
  const [pageIndex, setPageIndex] = useState(0);
  const [brush, setBrush] = useState({ color: "#1b1b1b", size: 2, eraser: false });
  const currentStroke = useRef(null);
  const drawing = useRef(false);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    pages[pageIndex].strokes.forEach((stroke) => drawStroke(ctx, stroke));
  }, [pageIndex, pages]);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctxRef.current = ctx;
    redraw();
  }, [redraw]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [resizeCanvas]);

  useEffect(() => {
    const handler = () => {
      const canvas = canvasRef.current;
      onSaveWrong(canvas ? canvas.toDataURL("image/png") : "");
    };
    window.addEventListener("save-current-strokes", handler);
    return () => window.removeEventListener("save-current-strokes", handler);
  }, [onSaveWrong]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  const updatePage = useCallback((updater) => {
    setPages((prev) => prev.map((page, index) => (index === pageIndex ? updater(page) : page)));
  }, [pageIndex]);

  const pointerPoint = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const beginDraw = (event) => {
    event.preventDefault();
    drawing.current = true;
    canvasRef.current.setPointerCapture(event.pointerId);
    currentStroke.current = {
      color: brush.color,
      size: brush.eraser ? Math.max(14, brush.size * 3) : brush.size,
      eraser: brush.eraser,
      points: [pointerPoint(event)],
    };
  };

  const moveDraw = (event) => {
    if (!drawing.current || !currentStroke.current) return;
    event.preventDefault();
    currentStroke.current.points.push(pointerPoint(event));
    redraw();
    drawStroke(ctxRef.current, currentStroke.current);
  };

  const endDraw = (event) => {
    if (!drawing.current || !currentStroke.current) return;
    event.preventDefault();
    const stroke = currentStroke.current;
    updatePage((page) => ({ strokes: [...page.strokes, stroke], undone: [] }));
    currentStroke.current = null;
    drawing.current = false;
  };

  const undo = () => {
    updatePage((page) => {
      const strokes = [...page.strokes];
      const stroke = strokes.pop();
      return stroke ? { strokes, undone: [...page.undone, stroke] } : page;
    });
  };

  const redo = () => {
    updatePage((page) => {
      const undone = [...page.undone];
      const stroke = undone.pop();
      return stroke ? { strokes: [...page.strokes, stroke], undone } : page;
    });
  };

  const clear = () => updatePage(() => ({ strokes: [], undone: [] }));

  return (
    <div className="pb-4">
      <div className="mb-4 flex items-center justify-between border-b border-sage-100 pb-3">
        <button className="flex items-center gap-1 text-xs font-black text-sage-600" onClick={onBack}>
          <ChevronLeft size={16} /> 返回
        </button>
        <span className="rounded-full bg-sage-400 px-3 py-1 text-[11px] font-black text-white">{quizType}</span>
      </div>

      <div className={`grid gap-4 ${deviceMode === "tablet" ? "lg:grid-cols-[.9fr_1.1fr]" : ""}`}>
        <section className="space-y-4">
          <article className="rounded-[24px] border border-sage-100 bg-white p-5">
            <div className="mb-3 flex justify-between text-[11px] font-black text-sage-600">
              <span>高等数学求极限题</span>
              <span>建议 180 秒</span>
            </div>
            <p className="text-base font-black leading-7">
              计算极限：lim(x → π) sin(x) / (x - π)
            </p>
          </article>

          <article className="rounded-[24px] border border-sage-100 bg-softGray p-4">
            <label className="text-xs font-black text-sage-600">最终答案</label>
            <input
              className="mt-2 h-11 w-full rounded-2xl border border-sage-100 bg-white px-3 text-sm font-bold outline-none"
              placeholder="例如：-1"
            />
            <div className="mt-4 flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-xs font-black text-sage-700">
                <input checked={guessed} onChange={(event) => onChangeGuessed(event.target.checked)} type="checkbox" />
                靠蒙 / 不确定
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => onChangeRating(star)} aria-label={`自评${star}星`}>
                    <Star className={star <= rating ? "fill-sage-400 text-sage-400" : "text-sage-200"} size={18} />
                  </button>
                ))}
              </div>
            </div>
          </article>

          {analysisOpen && (
            <article className="rounded-[24px] border border-roseAccent/40 bg-roseAccent/15 p-4">
              <h3 className="text-sm font-black text-[#7a5b63]">OCR 拟真核对</h3>
              <p className="mt-2 text-xs font-bold leading-5 text-[#7a5b63]">
                OCR 识别：lim(x→π) sin(x)/(x-π)。标准答案为 -1，建议继续诊断第一步换元边界。
              </p>
            </article>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button className="h-11 rounded-full bg-sage-400 text-sm font-black text-white" onClick={onSubmit}>
              提交答案
            </button>
            <button className="h-11 rounded-full bg-charcoal text-sm font-black text-white" onClick={onOpenDiagnosis}>
              AI 诊断
            </button>
          </div>
        </section>

        <section className="rounded-[24px] border border-sage-100 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-black">智能手写草稿区</h3>
            <div className="flex rounded-full bg-softGray p-1 text-[10px] font-black">
              {[0, 1].map((idx) => (
                <button
                  key={idx}
                  className={`rounded-full px-3 py-1 ${pageIndex === idx ? "bg-white shadow" : "text-sage-600"}`}
                  onClick={() => setPageIndex(idx)}
                >
                  Page {idx + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-3 flex flex-wrap items-center gap-2 rounded-2xl bg-softGray p-2">
            {["#1b1b1b", "#eac8d1", "#c0cfe6"].map((color) => (
              <button
                key={color}
                className={`h-6 w-6 rounded-full border-2 border-white ${brush.color === color && !brush.eraser ? "ring-2 ring-sage-400" : ""}`}
                style={{ backgroundColor: color }}
                onClick={() => setBrush((prev) => ({ ...prev, color, eraser: false }))}
                aria-label="切换画笔颜色"
              />
            ))}
            {[2, 5, 8].map((size) => (
              <button
                key={size}
                className={`rounded-full px-3 py-1 text-[11px] font-black ${brush.size === size ? "bg-white text-sage-700 shadow" : "text-sage-600"}`}
                onClick={() => setBrush((prev) => ({ ...prev, size }))}
              >
                {size === 2 ? "细" : size === 5 ? "中" : "粗"}
              </button>
            ))}
            <IconButton active={brush.eraser} icon={Eraser} label="橡皮" onClick={() => setBrush((prev) => ({ ...prev, eraser: !prev.eraser }))} />
            <IconButton icon={RotateCcw} label="撤销" onClick={undo} />
            <IconButton icon={RotateCw} label="重做" onClick={redo} />
            <IconButton icon={Trash2} label="清空" onClick={clear} />
          </div>

          <canvas
            ref={canvasRef}
            className="h-64 w-full touch-none rounded-2xl border border-sage-100 bg-[#fbfdfb]"
            onPointerCancel={endDraw}
            onPointerDown={beginDraw}
            onPointerMove={moveDraw}
            onPointerUp={endDraw}
          />
        </section>
      </div>
    </div>
  );
}

function DiagnosisModal({ open, onClose, onConfirm }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-charcoal/45 px-4 backdrop-blur-sm">
      <section className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-device">
        <div className="mb-4 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-sage-100 text-sage-700">
            <Brain size={22} />
          </div>
          <div>
            <h2 className="text-lg font-black">AI 思路诊断</h2>
            <p className="text-xs font-bold text-sage-600">Mock API，后续可接 Cloudflare Worker</p>
          </div>
        </div>
        <div className="space-y-3 text-sm font-semibold leading-6 text-sage-700">
          <p><strong className="text-charcoal">错误起点：</strong>在 x→π 时直接套用 sin(x)≈x。</p>
          <p><strong className="text-charcoal">原因：</strong>等价无穷小替换需要变量趋近 0，本题应先换元。</p>
          <p><strong className="text-charcoal">正确路径：</strong>令 t=x-π，原式变为 lim(t→0) -sin(t)/t = -1。</p>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button className="h-11 rounded-full bg-softGray text-sm font-black text-sage-700" onClick={onClose}>
            稍后处理
          </button>
          <button className="flex h-11 items-center justify-center gap-2 rounded-full bg-charcoal text-sm font-black text-white" onClick={onConfirm}>
            <Save size={17} /> 归入错题
          </button>
        </div>
      </section>
    </div>
  );
}

function HeroCard({ onStartQuiz }) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-white/80 bg-gradient-to-br from-sage-100 to-[#ebf0eb] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-black text-sage-600">SAGE SYSTEM</span>
          <h2 className="mt-4 text-xl font-black leading-tight">手写诊断全面覆盖</h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-sage-700">
            写下高数步骤，AI 定位第一处思维偏斜，并把草稿回流进错题本。
          </p>
        </div>
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-white text-sage-600 shadow-panel">
          <PenLine size={26} />
        </div>
      </div>
      <button className="mt-5 h-11 w-full rounded-full bg-charcoal text-sm font-black text-white" onClick={onStartQuiz}>
        做一道诊断题
      </button>
    </section>
  );
}

function Metric({ label, value }) {
  return (
    <article className="rounded-[22px] border border-sage-100 bg-softGray p-4">
      <p className="text-[11px] font-black uppercase tracking-[.12em] text-sage-600">{label}</p>
      <strong className="mt-1 block text-2xl font-black">{value}</strong>
    </article>
  );
}

function SectionTitle({ icon: Icon, title, action }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Icon size={17} className="text-sage-600" />
        <h2 className="text-sm font-black">{title}</h2>
      </div>
      <span className="text-[11px] font-black text-sage-500">{action}</span>
    </div>
  );
}

function PracticeButton({ icon: Icon, title, text, onClick }) {
  return (
    <button className="rounded-[22px] border border-sage-100 bg-white p-4 text-left shadow-panel" onClick={onClick}>
      <div className="grid h-9 w-9 place-items-center rounded-full bg-sage-100 text-sage-700">
        <Icon size={18} />
      </div>
      <h3 className="mt-4 text-sm font-black">{title}</h3>
      <p className="mt-1 text-xs font-bold text-sage-600">{text}</p>
    </button>
  );
}

function IconButton({ active, icon: Icon, label, onClick }) {
  return (
    <button
      className={`flex h-8 items-center gap-1 rounded-full px-3 text-[11px] font-black ${
        active ? "bg-sage-100 text-sage-700" : "bg-white text-sage-600"
      }`}
      onClick={onClick}
      title={label}
      type="button"
    >
      <Icon size={14} />
      <span>{label}</span>
    </button>
  );
}

function drawStroke(ctx, stroke) {
  if (!ctx || stroke.points.length < 1) return;
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = stroke.size;
  ctx.strokeStyle = stroke.eraser ? "#fbfdfb" : stroke.color;
  ctx.beginPath();
  ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
  for (let i = 1; i < stroke.points.length; i += 1) {
    const previous = stroke.points[i - 1];
    const point = stroke.points[i];
    ctx.quadraticCurveTo(previous.x, previous.y, (previous.x + point.x) / 2, (previous.y + point.y) / 2);
  }
  ctx.stroke();
  ctx.restore();
}

function pageTitle(tab) {
  return {
    home: "今日计划",
    practice: "专项练习",
    knowledge: "考点库",
    wrong: "错题本",
    profile: "我的档案",
    quiz: "手写作答",
  }[tab];
}

export default App;
