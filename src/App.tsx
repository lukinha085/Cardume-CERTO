/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Waves,
  Heart,
  Users,
  Send,
  Calendar,
  Layers,
  Check,
  CheckCircle,
  Clock,
  ArrowRight,
  Plus,
  AlertTriangle,
  Smile,
  X,
  Zap,
  Bell,
  Settings,
  MoreHorizontal,
  PlusCircle,
  Paperclip,
  Activity,
  ChevronRight,
  Lock,
  Mail,
  Compass,
  SmilePlus,
  Battery,
  ShieldCheck,
  Award,
  HelpCircle
} from "lucide-react";

import { Task, Message, TeamHealth, Member, TaskPriority, TaskColumn } from "./types";
import { SAMPLE_MEMBERS, INITIAL_TASKS, INITIAL_MESSAGES, INITIAL_TEAM_HEALTH } from "./data";

export default function App() {
  // Navigation State: 'landing' | 'login' | 'workspace'
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'workspace'>('landing');
  
  // Workspace Tab State: 'board' | 'insights' | 'members'
  const [activeTab, setActiveTab] = useState<'board' | 'insights' | 'members'>('board');
  
  // Data States
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("cardume_tasks");
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem("cardume_messages");
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  const [teamHealth, setTeamHealth] = useState<TeamHealth>(() => {
    const saved = localStorage.getItem("cardume_team_health");
    return saved ? JSON.parse(saved) : INITIAL_TEAM_HEALTH;
  });

  // User details
  const currentUser = SAMPLE_MEMBERS.find(m => m.id === "m4") || SAMPLE_MEMBERS[3];
  const [loginEmail, setLoginEmail] = useState("seu@email.com");
  const [loginPassword, setLoginPassword] = useState("password");
  
  // UI Interactions
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newMessageText, setNewMessageText] = useState("");
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  
  // New Task Form States
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>("MÉDIA");
  const [newTaskAssignees, setNewTaskAssignees] = useState<string[]>(["m4"]);
  const [newTaskEffort, setNewTaskEffort] = useState("4 Ciclos");
  const [newTaskChecklistItems, setNewTaskChecklistItems] = useState<string>("");

  // AI states
  const [aiAnalyzingTask, setAiAnalyzingTask] = useState<string | null>(null);
  const [aiAnalyzingHealth, setAiAnalyzingHealth] = useState(false);
  const [taskAiAnalysisResult, setTaskAiAnalysisResult] = useState<any | null>(null);
  const [currentNotification, setCurrentNotification] = useState<string | null>(null);
  const [isSimulatedResponse, setIsSimulatedResponse] = useState<boolean>(false);

  // Persistence triggers
  useEffect(() => {
    localStorage.setItem("cardume_tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("cardume_messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("cardume_team_health", JSON.stringify(teamHealth));
  }, [teamHealth]);

  // Handle single task selection mapping
  const openTaskDetail = (task: Task) => {
    setSelectedTask(task);
    setTaskAiAnalysisResult(null); // Clear previous dynamic analysis
  };

  // Toast helper
  const showNotification = (text: string) => {
    setCurrentNotification(text);
    setTimeout(() => {
      setCurrentNotification(null);
    }, 4500);
  };

  // Add a task
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const checklistTextArray = newTaskChecklistItems
      .split("\n")
      .filter(item => item.trim() !== "")
      .map((item, idx) => ({
        id: `c_new_${Date.now()}_${idx}`,
        text: item.trim(),
        completed: false
      }));

    const newTask: Task = {
      id: `task_${Date.now()}`,
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim() || "Sem descrição adicional de contexto.",
      priority: newTaskPriority,
      column: "todo",
      assignees: newTaskAssignees.length > 0 ? newTaskAssignees : ["m4"],
      effort: newTaskEffort || "4 Ciclos",
      statusText: "Criado agora",
      progress: 0,
      checklist: checklistTextArray,
      insight: null
    };

    setTasks(prev => [newTask, ...prev]);
    setIsNewTaskModalOpen(false);
    
    // Clear form
    setNewTaskTitle("");
    setNewTaskDesc("");
    setNewTaskPriority("MÉDIA");
    setNewTaskAssignees(["m4"]);
    setNewTaskEffort("4 Ciclos");
    setNewTaskChecklistItems("");

    showNotification(`Nova esfera de "${newTask.title}" adicionada em Para Fazer!`);
  };

  // Post new comment in discussion
  const handlePostMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !selectedTask) return;

    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      taskId: selectedTask.id,
      senderId: currentUser.id,
      senderName: "Elena (Você)",
      senderAvatar: currentUser.avatar,
      content: newMessageText.trim(),
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    };

    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setNewMessageText("");

    // Simulate system response matching task actions
    setTimeout(() => {
      if (newMessageText.toLowerCase().includes("ajuda") || newMessageText.toLowerCase().includes("sobrecarga")) {
        const systemMsg: Message = {
          id: `msg_sys_${Date.now()}`,
          taskId: selectedTask.id,
          senderId: "system",
          senderName: "Cardume",
          senderAvatar: "system",
          content: "Sinalizador do Cardume: Foi detectada uma solicitação de apoio. Outros membros do ecossistema foram notificados discretamente.",
          timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
          isSystem: true
        };
        setMessages(prev => [...prev, systemMsg]);
      }
    }, 1000);
  };

  // Toggle checklist item
  const toggleChecklistItem = (taskId: string, itemId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const updatedChecklist = t.checklist.map(item => 
          item.id === itemId ? { ...item, completed: !item.completed } : item
        );
        const completedCount = updatedChecklist.filter(i => i.completed).length;
        const total = updatedChecklist.length;
        const progress = total > 0 ? Math.round((completedCount / total) * 100) : 0;
        
        const updatedTask = {
          ...t,
          checklist: updatedChecklist,
          progress
        };
        
        if (selectedTask && selectedTask.id === taskId) {
          setSelectedTask(updatedTask);
        }
        return updatedTask;
      }
      return t;
    }));
  };

  // Move task column
  const moveTaskColumn = (taskId: string, newCol: TaskColumn) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const updated = {
          ...t,
          column: newCol,
          priority: newCol === "done" ? "CONCLUÍDO" as TaskPriority : t.priority === "CONCLUÍDO" ? "MÉDIA" as TaskPriority : t.priority,
          statusText: newCol === "done" ? "Concluído agora" : newCol === "inprogress" ? "AO VIVO" : "Para Fazer"
        };
        if (selectedTask && selectedTask.id === taskId) {
          setSelectedTask(updated);
        }
        showNotification(`Card "${t.title}" nadou para a coluna ${newCol === 'todo' ? 'Para Fazer' : newCol === 'inprogress' ? 'Em Desenvolvimento' : 'Feito'}.`);
        return updated;
      }
      return t;
    }));
  };

  // Trigger server-side AI dynamic analysis for a task conversation
  const analyzeTaskConversation = async (task: Task) => {
    try {
      setAiAnalyzingTask(task.id);
      const taskMessages = messages.filter(m => m.taskId === task.id);

      const response = await fetch("/api/analyze-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskTitle: task.title,
          taskDescription: task.description,
          messages: taskMessages
        })
      });

      const data = await response.json();
      setIsSimulatedResponse(!!data.isSimulated);

      if (data.analysis) {
        setTaskAiAnalysisResult(data.analysis);
        
        // Update task insight inline to persist
        const summary = data.analysis.overallSummary || task.insight;
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, insight: summary } : t));
        setSelectedTask(prev => prev?.id === task.id ? { ...prev, insight: summary } : prev);

        showNotification("Análise empática recalculada com sucesso pelo Cardume AI!");
      }
    } catch (e: any) {
      console.error(e);
      showNotification("Não foi possível conectar ao servidor. Carregando dados reflexivos offline.");
    } finally {
      setAiAnalyzingTask(null);
    }
  };

  // Trigger server-side AI Team Health general analysis
  const analyzeOverallTeamHealth = async () => {
    try {
      setAiAnalyzingHealth(true);
      const response = await fetch("/api/analyze-team-health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasks: tasks,
          messages: messages
        })
      });

      const data = await response.json();
      setIsSimulatedResponse(!!data.isSimulated);

      if (data.health) {
        setTeamHealth(data.health);
        showNotification("Sintonizador central completo! Os Sinais de Cuidado foram redefinidos.");
      }
    } catch (e: any) {
      console.error(e);
      showNotification("Pulsar offline estabelecido devido a reveses de conexão.");
    } finally {
      setAiAnalyzingHealth(false);
    }
  };

  // Trigger a collective wellness break intervention
  const triggerWellnessBreak = () => {
    showNotification("📅 Pausa Coletiva Agendada! Um lembrete sutil de 15 minutos para respiração e café foi compartilhado com o time.");
    setTeamHealth(prev => ({
      ...prev,
      climate: "Respirando",
      rechargeTime: "Pausa Ativa",
      empathyLevel: Math.min(100, prev.empathyLevel + 5)
    }));
  };

  return (
    <div className="min-h-screen bg-[#00161c] text-[#cce7ef] flex flex-col font-sans relative overflow-x-hidden">
      
      {/* Dynamic Background Glass Bubble accents */}
      <div className="fixed inset-0 z-[-1] pointer-events-none opacity-30 mix-blend-screen scale-110">
        <div className="absolute top-1/4 left-1/12 w-64 h-64 rounded-full bg-[#00dce5]/10 blur-[120px] animate-float" />
        <div className="absolute bottom-1/3 right-1/10 w-96 h-96 rounded-full bg-[#8ef5e1]/10 blur-[160px] animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-10 right-1/4 w-48 h-48 rounded-full bg-[#006c71]/15 blur-[90px] animate-float" style={{ animationDelay: "4s" }} />
      </div>

      {/* Global Toast Notification */}
      {currentNotification && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#0b2e35]/95 max-w-lg w-[90%] md:w-auto px-6 py-4 rounded-2xl border border-[#00f5ff]/30 text-white shadow-[0_8px_32px_0_rgba(0,245,255,0.25)] z-[100] flex items-center gap-3 backdrop-blur-md text-sm animate-bounce">
          <Sparkles className="text-[#00f5ff] shrink-0 animate-pulse" size={20} />
          <span>{currentNotification}</span>
        </div>
      )}

      {/* ========================================================
          1. LANDING VIEW
          ======================================================== */}
      {currentView === 'landing' && (
        <div className="flex-1 flex flex-col pt-32 pb-16 items-center">
          
          {/* Top Header */}
          <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[92%] max-w-7xl rounded-full bg-[#072329]/60 backdrop-blur-xl border border-[#3a494a]/35 shadow-[0_8px_32px_0_rgba(0,0,0,0.45)] px-8 py-3.5 flex justify-between items-center z-50 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00dce5] to-[#89f0dc] flex items-center justify-center text-[#001115]">
                <Waves size={16} className="animate-pulse" />
              </div>
              <span className="font-display font-bold text-xl text-[#63f7ff] tracking-tight">Cardume</span>
            </div>
            <button 
              onClick={() => setCurrentView('login')}
              className="text-[#63f7ff] hover:text-white bg-[#00f5ff]/10 hover:bg-[#00f5ff]/20 border border-[#00f5ff]/20 hover:scale-105 px-5 py-2 rounded-full font-label text-sm transition-all duration-300 flex items-center gap-2 cursor-pointer"
            >
              Acesse o Cardume
              <ArrowRight size={14} />
            </button>
          </header>

          {/* Main Hero Container */}
          <main className="max-w-4xl w-full px-6 flex flex-col items-center justify-center text-center mt-8">
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00f5ff]/5 border border-[#00f5ff]/10 text-xs text-[#00dce5] mb-6 tracking-wide uppercase font-label">
              <Zap size={10} className="animate-spin" />
              Gestão Coletiva de Projetos Sem Vigilância
            </div>

            <h1 className="font-display text-4xl sm:text-6xl text-[#e9feff] font-extrabold max-w-3xl mb-6 tracking-tight leading-[1.1] filter drop-shadow-[0_0_20px_rgba(0,245,255,0.25)]">
              Sincronia e Cuidado em cada Fluxo
            </h1>
            
            <p className="text-lg sm:text-xl text-[#b9caca] max-w-2xl mb-12 leading-relaxed">
              Cardume é um assistente que ajuda seu time a enxergar as dinâmicas do projeto através de uma lente de cuidado coletivo. Sem vigilância. Sem métricas individuais. Apenas espelhos e sugestões baseadas em um código ético transparente.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-24">
              <button 
                onClick={() => setCurrentView('login')}
                className="font-label text-base bg-gradient-to-r from-[#4ad8cc] to-[#00f5ff] text-[#00373d] font-bold px-10 py-5 rounded-full shadow-[0_0_25px_0_rgba(0,245,255,0.4)] hover:scale-105 hover:shadow-[0_0_35px_0_rgba(0,245,255,0.6)] focus:outline-none focus:ring-4 focus:ring-[#00f5ff]/50 flex items-center justify-center transition-all duration-500 ease-out cursor-pointer"
              >
                Acesse o Cardume
                <ArrowRight size={18} className="ml-2" />
              </button>
            </div>

            {/* Bento Grid: Core Ethics Cards */}
            <section className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-28">
              
              {/* Card 1 */}
              <div className="bg-[#031f25]/40 backdrop-blur-md rounded-3xl p-8 glass-glow border border-[#3a494a]/30 flex flex-col items-start text-left hover:scale-[1.02] hover:bg-[#072329]/40 transition-all duration-500 ease-out animate-float">
                <div className="w-14 h-14 rounded-full bg-[#294e58] text-[#98bfca] flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(0,180,180,0.25)]">
                  <Waves className="text-[#00f5ff]" size={26} />
                </div>
                <h3 className="font-display text-xl font-bold text-[#63f7ff] mb-3">Reciprocidade</h3>
                <p className="text-[#b9caca] text-sm leading-relaxed">
                  Ninguém é um mero recurso mecânico. Tratamos cada indivíduo como parte de um ecossistema precioso, promovendo trocas justas, partilhas e sincronicidade.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-[#031f25]/40 backdrop-blur-md rounded-3xl p-8 glass-glow border border-[#3a494a]/30 flex flex-col items-start text-left hover:scale-[1.02] hover:bg-[#072329]/40 transition-all duration-500 ease-out animate-float" style={{ animationDelay: "1.5s" }}>
                <div className="w-14 h-14 rounded-full bg-[#132e34] text-[#63f7ff] flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(0,245,255,0.2)]">
                  <Compass className="text-[#00f5ff]" size={26} />
                </div>
                <h3 className="font-display text-xl font-bold text-[#63f7ff] mb-3">Transparência</h3>
                <p className="text-[#b9caca] text-sm leading-relaxed">
                  Você sempre sabe por que sugerimos algo. Nossos algoritmos operam à luz do dia, sem caixas pretas ocultas, de forma que o time sempre sinta orgulho no alinhamento.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-[#031f25]/40 backdrop-blur-md rounded-3xl p-8 glass-glow border border-[#3a494a]/30 flex flex-col items-start text-left hover:scale-[1.02] hover:bg-[#072329]/40 transition-all duration-500 ease-out animate-float" style={{ animationDelay: "3s" }}>
                <div className="w-14 h-14 rounded-full bg-[#1f383f] text-[#8ef5e1] flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(142,245,225,0.2)]">
                  <Heart className="text-[#00f5ff]" size={26} />
                </div>
                <h3 className="font-display text-xl font-bold text-[#63f7ff] mb-3">Cuidado Coletivo</h3>
                <p className="text-[#b9caca] text-sm leading-relaxed">
                  Dados são consentidos e agregados de forma ética. Respeitamos tempos de silêncio e espaço profundo de foco, substituindo a vigilância de desempenho pelo suporte humano.
                </p>
              </div>
            </section>

            {/* Testimonials section */}
            <section className="w-full max-w-5xl mb-12">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#63f7ff] text-center mb-10 drop-shadow-[0_0_14px_rgba(0,245,255,0.15)]">
                O que as equipes dizem
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                <div className="bg-[#001115]/60 backdrop-blur-md rounded-2xl p-8 border border-[#3a494a]/40 text-left glass-glow hover:bg-[#001115]/80 transition-colors duration-300">
                  <p className="text-[#cce7ef] text-base italic mb-6 leading-relaxed">
                    "O Cardume não tenta medir nossa velocidade como se fôssemos robôs em esteira. Ele nos mostra de forma transparente como a maré do projeto está fluindo e nos ajuda a ajustar as velas, priorizando a nossa paz de espírito e saúde mental."
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#1f383f] flex items-center justify-center border border-[#3a494a]/50 text-[#00f5ff]">
                      <Smile size={18} />
                    </div>
                    <div>
                      <p className="font-label text-sm font-bold text-[#00dce5]">Sarah</p>
                      <p className="font-label text-[11px] text-[#4a7a82]">Líder de Design, Agência Sincronia</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#001115]/60 backdrop-blur-md rounded-2xl p-8 border border-[#3a494a]/40 text-left glass-glow hover:bg-[#001115]/80 transition-colors duration-300">
                  <p className="text-[#cce7ef] text-base italic mb-6 leading-relaxed">
                    "Finalmente uma inteligência de projeto que não me faz sentir microgerenciado. A abordagem de monitorar as sinergias das mensagens sem expor métricas individuais mudou inteiramente nossa cultura no trabalho com corais."
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#1f383f] flex items-center justify-center border border-[#3a494a]/50 text-[#00f5ff]">
                      <SmilePlus size={18} />
                    </div>
                    <div>
                      <p className="font-label text-sm font-bold text-[#00dce5]">Marcus</p>
                      <p className="font-label text-[11px] text-[#4a7a82]">Engenheiro Sênior, TechFlow Inc.</p>
                    </div>
                  </div>
                </div>

              </div>
            </section>

          </main>

          {/* Footer Component */}
          <footer className="w-full py-12 mt-16 border-t border-[#3a494a]/30 max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="font-display font-medium text-sm text-[#4a7a82]">© 2026 Cardume — Sincronicidade Ética</span>
            </div>
            
            <ul className="flex items-center gap-6">
              <li><a href="#" className="font-label text-xs text-[#b9caca] hover:text-[#00f5ff] transition-colors">Privacidade</a></li>
              <li><a href="#" className="font-label text-xs text-[#b9caca] hover:text-[#00f5ff] transition-colors">Termos de Uso</a></li>
              <li><a href="#" className="font-label text-xs text-[#b9caca] hover:text-[#00f5ff] transition-colors">Manifesto de Cuidado</a></li>
            </ul>
          </footer>

        </div>
      )}


      {/* ========================================================
          2. LOGIN VIEW
          ======================================================== */}
      {currentView === 'login' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
          
          <button 
            onClick={() => setCurrentView('landing')}
            className="absolute top-8 left-8 text-[#b9caca] hover:text-[#00f5ff] flex items-center gap-2 text-sm font-label transition-colors"
          >
            ← Voltar
          </button>

          {/* Login Card */}
          <div className="bg-[#031f25]/75 backdrop-blur-2xl rounded-[32px] p-8 md:p-12 border border-[#00f5ff]/15 max-w-[460px] w-full shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] z-10 hover:scale-[1.01] transition-transform duration-700 ease-out">
            
            {/* Logo */}
            <div className="mb-10 text-center">
              <div className="w-14 h-14 bg-[#132e34] rounded-full flex items-center justify-center mb-4 mx-auto shadow-inner border border-[#00f5ff]/20 animate-pulse">
                <Waves className="text-[#00f5ff]" size={24} />
              </div>
              <h1 className="font-display text-4xl text-[#63f7ff] font-extrabold tracking-tight mb-2">Cardume</h1>
              <p className="font-label text-xs text-[#b9caca] max-w-[280px] mx-auto leading-relaxed">
                Sincronia ética e bem-estar coletivo no fluxo submarino de projetos.
              </p>
            </div>

            {/* Inputs Form */}
            <form onSubmit={(e) => {
              e.preventDefault();
              setCurrentView('workspace');
              showNotification("Sincronizado! Bem-vindo de volta ao ecossistema Cardume.");
            }} className="space-y-5">
              
              <div className="space-y-2">
                <label className="font-label text-xs text-[#b9caca] pl-1 font-semibold block" htmlFor="email">
                  E-mail corporativo
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4a7a82]">
                    <Mail size={16} />
                  </span>
                  <input 
                    className="w-full bg-[#001115]/80 border border-[#3a494a]/60 rounded-full py-4 pl-12 pr-6 text-white text-sm placeholder-[#4a7a82] focus:border-[#00f5ff] focus:ring-1 focus:ring-[#00f5ff] outline-none transition-all"
                    id="email" 
                    placeholder="seu@empresa.com" 
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2 col-span-12">
                <label className="font-label text-xs text-[#b9caca] pl-1 block font-semibold" htmlFor="password">
                  Sua senha
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4a7a82]">
                    <Lock size={16} />
                  </span>
                  <input 
                    className="w-full bg-[#001115]/80 border border-[#3a494a]/60 rounded-full py-4 pl-12 pr-6 text-white text-sm placeholder-[#4a7a82] focus:border-[#00f5ff] focus:ring-1 focus:ring-[#00f5ff] outline-none transition-all"
                    id="password" 
                    placeholder="••••••••" 
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* Forgot link */}
              <div className="flex justify-end pt-1">
                <a href="#" className="font-label text-xs text-[#00f5ff] hover:text-[#8ef5e1] hover:underline transition-all">
                  Esqueceu sua senha?
                </a>
              </div>

              {/* Action Button */}
              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-[#4ad8cc] to-[#00f5ff] hover:from-[#00f5ff] hover:to-[#4ad8cc] text-[#00373d] py-4 rounded-full font-display font-bold text-sm tracking-wide shadow-lg hover:shadow-[0_0_20px_rgba(0,245,255,0.4)] flex items-center justify-center gap-2 hover:scale-[1.02] transition-all duration-300 cursor-pointer"
              >
                <span>Entrar no Workspace</span>
                <ArrowRight size={16} />
              </button>

            </form>

            <div className="mt-10 pt-6 border-t border-[#3a494a]/30 text-center">
              <p className="font-label text-[11px] text-[#b9caca] leading-relaxed">
                Ao acessar, você concorda com o <br />
                <a href="#" className="text-[#00f5ff] border-b border-[#00f5ff]/20 hover:border-[#00f5ff] font-bold pb-0.5 transition-all">
                  Código de Ética do Ecossistema
                </a>.
              </p>
            </div>

          </div>

          <div className="mt-8 flex justify-center items-center gap-6 opacity-30">
            <div className="h-[1px] w-12 bg-[#3a494a]" />
            <span className="font-mono text-xs text-[#4a7a82]">CARDUME BIOMIMÉTICA</span>
            <div className="h-[1px] w-12 bg-[#3a494a]" />
          </div>

        </div>
      )}


      {/* ========================================================
          3. MAIN WORKSPACE / APP SHELL (BOARD, INSIGHTS & MEMBERS)
          ======================================================== */}
      {currentView === 'workspace' && (
        <div className="flex-1 flex flex-col md:flex-row pt-20">
          
          {/* Top Header Navigation Bar */}
          <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 md:px-12 h-20 bg-[#00161c]/60 backdrop-blur-xl border-b border-[#3a494a]/30 shadow-sm">
            <div className="flex items-center gap-8">
              <span className="font-display font-extrabold text-2xl text-[#63f7ff] filter drop-shadow-[0_0_10px_rgba(0,245,255,0.35)]">
                Cardume
              </span>
              
              <nav className="hidden md:flex items-center gap-6 ml-4">
                <button 
                  onClick={() => { setActiveTab('board'); }}
                  className={`font-label text-sm pb-1 border-b-2 font-medium transition-all cursor-pointer ${activeTab === 'board' ? 'text-[#00dce5] border-[#00dce5]' : 'text-[#b9caca] border-transparent hover:text-white'}`}
                >
                  Overview do Board
                </button>
                <button 
                  onClick={() => { setActiveTab('insights'); }}
                  className={`font-label text-sm pb-1 border-b-2 font-medium transition-all cursor-pointer ${activeTab === 'insights' ? 'text-[#00dce5] border-[#00dce5]' : 'text-[#b9caca] border-transparent hover:text-white'}`}
                >
                  Saúde do Time
                </button>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => showNotification("Nenhuma notificação emergencial no momento. Clima calmo.")}
                className="relative p-2.5 rounded-full hover:bg-white/5 text-[#b9caca] hover:text-[#00f5ff] transition-colors relative"
              >
                <Bell size={18} />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#00f5ff] rounded-full animate-ping" />
              </button>
              
              <button 
                onClick={() => showNotification("Configurações do ecossistema controladas centralizadamente pelo Código de Ética.")}
                className="p-2.5 rounded-full hover:bg-white/5 text-[#b9caca] hover:text-[#00f5ff] transition-colors"
              >
                <Settings size={18} />
              </button>

              <div 
                onClick={() => setCurrentView('landing')}
                title="Sair / Desconectar"
                className="w-10 h-10 rounded-full border border-[#00f5ff]/35 overflow-hidden shadow-inner cursor-pointer hover:border-[#00f5ff] transition-all"
              >
                <img 
                  alt="User avatar placeholder" 
                  className="w-full h-full object-cover" 
                  src={currentUser.avatar}
                />
              </div>
            </div>
          </header>

          {/* Leftside Desktop Navigation Rail */}
          <aside className="fixed left-0 top-20 bottom-0 text-left w-64 bg-[#031f25]/30 backdrop-blur-xl border-r border-[#3a494a]/20 shadow-lg p-6 flex-col justify-between hidden md:flex z-40">
            <div className="w-full space-y-8">
              
              <div className="flex items-center gap-3 px-1 py-3 bg-[#00f5ff]/5 border border-[#00f5ff]/10 rounded-2xl">
                <div className="w-8 h-8 rounded-xl bg-[#00dce5]/20 flex items-center justify-center text-[#00f5ff]">
                  <Activity size={16} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xs text-[#63f7ff]">Projeto Exemplo</h3>
                  <p className="font-label text-[10px] text-[#4a7a82] tracking-wider uppercase font-medium">Collective Growth</p>
                </div>
              </div>

              {/* Sidebar items */}
              <nav className="flex flex-col gap-2">
                
                <button 
                  onClick={() => setActiveTab('board')}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-label text-sm transition-all text-left cursor-pointer ${activeTab === 'board' ? 'bg-[#294e58]/50 text-[#e9feff] font-bold border border-[#00f5ff]/15' : 'text-[#b9caca] hover:bg-white/5 hover:text-white'}`}
                >
                  <Layers size={16} />
                  <span>Espaço Kanban</span>
                </button>

                <button 
                  onClick={() => setActiveTab('insights')}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-label text-sm transition-all text-left cursor-pointer ${activeTab === 'insights' ? 'bg-[#294e58]/50 text-[#e9feff] font-bold border border-[#00f5ff]/15' : 'text-[#b9caca] hover:bg-white/5 hover:text-white'}`}
                >
                  <Heart size={16} />
                  <span>Saúde Coletiva</span>
                </button>

                <button 
                  onClick={() => setActiveTab('members')}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-label text-sm transition-all text-left cursor-pointer ${activeTab === 'members' ? 'bg-[#294e58]/50 text-[#e9feff] font-bold border border-[#00f5ff]/15' : 'text-[#b9caca] hover:bg-white/5 hover:text-white'}`}
                >
                  <Users size={16} />
                  <span>Sintonizados ({SAMPLE_MEMBERS.length})</span>
                </button>

              </nav>

            </div>

            {/* Bottom load indicators */}
            <div className="p-4 rounded-2xl bg-[#1f383f]/20 border border-[#3a494a]/20">
              <span className="text-[11px] font-label text-[#b9caca] block mb-2 font-bold">Carga do Ecossistema</span>
              <div className="h-2 w-full bg-[#001115] rounded-full overflow-hidden">
                <div 
                  style={{ width: `${65 - (tasks.filter(t => t.column === 'done').length * 8)}%` }}
                  className="h-full bg-gradient-to-r from-[#4ad8cc] to-[#00f5ff] transition-all duration-1000 shadow-[0_0_8px_rgba(0,245,255,0.6)]" 
                />
              </div>
              <p className="text-[10px] text-[#4a7a82] mt-2 block leading-relaxed">
                Estabilidade saudável. Força de maré está equilibrada.
              </p>
            </div>

          </aside>

          {/* Core Content canvas */}
          <main className="flex-1 md:ml-64 p-6 md:p-10 min-h-screen pb-24 text-left">
            
            {/* Tab Section Wrapper */}
            <div className="max-w-7xl mx-auto">
              
              {/* HEADER BANNER FOR KANBAN: High synergy alert */}
              {activeTab === 'board' && (
                <div className="p-4 rounded-3xl bg-[#132e34]/50 border border-[#00dce5]/20 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 glass-glow">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#00dce5]/10 flex items-center justify-center">
                      <Sparkles className="text-[#00f5ff] animate-pulse" size={18} />
                    </div>
                    <p className="text-sm text-[#b9caca] leading-relaxed text-left">
                      <strong className="text-white">Alta sincronicidade coletiva:</strong> {teamHealth.collectiveSymmetry}% das atividades seguem em harmonia com nosso Código de Ética e cuidado. No microgerenciamento.
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => setActiveTab('insights')}
                    className="font-label text-xs font-bold text-[#00f5ff] bg-[#00f5ff]/10 hover:bg-[#00f5ff]/20 px-4 py-2.5 rounded-xl border border-[#00f5ff]/20 hover:scale-105 transition-all whitespace-nowrap cursor-pointer"
                  >
                    Ver Saúde Coletiva
                  </button>
                </div>
              )}


              {/* ========================================================
                  TAB 3A: KANBAN BOARD
                  ======================================================== */}
              {activeTab === 'board' && (
                <div>
                  
                  {/* Top Row Section */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
                    <div>
                      <h1 className="font-display font-extrabold text-4xl text-white tracking-tight">KANBAN</h1>
                      <p className="text-[#b9caca] text-sm mt-1">
                        Fluxo de cuidado com sincronia viva do ecossistema.
                      </p>
                    </div>

                    {/* Members inline avatar stack */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#4a7a82] font-label font-bold uppercase">Membros conectados:</span>
                      <div className="flex -space-x-2">
                        {SAMPLE_MEMBERS.map((m, idx) => (
                          <img 
                            key={m.id} 
                            src={m.avatar} 
                            alt={m.name} 
                            title={`${m.name} - ${m.role}`} 
                            className="w-9 h-9 rounded-full border-2 border-[#00161c] object-cover"
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Columns Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* COLUMN: PARA FAZER */}
                    <div className="bg-[#031f25]/20 rounded-3xl p-4 min-h-[650px] border border-[#3a494a]/15 flex flex-col">
                      <div className="flex justify-between items-center px-2 py-3 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#8ef5e1]" />
                          <h3 className="font-label font-bold text-xs uppercase tracking-wider text-[#b9caca]">Para Fazer</h3>
                          <span className="bg-[#1f383f]/60 text-xs px-2.5 py-0.5 rounded-full text-[#00f5ff]">
                            {tasks.filter(t => t.column === 'todo').length}
                          </span>
                        </div>
                        
                        <button 
                          onClick={() => setIsNewTaskModalOpen(true)}
                          className="text-[#00f5ff] hover:scale-110 transition-transform cursor-pointer"
                          title="Inserir Nova Esfera de Cuidado"
                        >
                          <PlusCircle size={18} />
                        </button>
                      </div>

                      {/* Click to Create Task Bubble template */}
                      <button 
                        onClick={() => setIsNewTaskModalOpen(true)}
                        className="group flex items-center justify-center gap-2 w-full py-3.5 border border-dashed border-[#00f5ff]/15 hover:border-[#00f5ff]/40 rounded-2xl mb-4 hover:bg-[#00f5ff]/5 transition-all text-[#b9caca] hover:text-[#e9feff] text-xs font-semibold font-label cursor-pointer"
                      >
                        <Plus size={14} className="group-hover:rotate-90 transition-transform" />
                        <span>Novo Cuidado</span>
                      </button>

                      {/* List Cards */}
                      <div className="space-y-4 flex-1">
                        {tasks.filter(t => t.column === 'todo').map(task => (
                          <div 
                            key={task.id}
                            onClick={() => openTaskDetail(task)}
                            className="bg-[#072329]/50 hover:bg-[#0f343c]/60 p-5 rounded-2xl border border-[#3a494a]/25 hover:border-[#00f5ff]/20 shadow-md transition-all duration-300 transform hover:-translate-y-1 cursor-pointer relative group glass-glow glow-hover"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <span className={`text-[10px] font-bold font-label tracking-wide px-2.5 py-0.5 rounded-full uppercase ${task.priority === 'CRÍTICA' ? 'bg-[#93000a]/50 text-red-100' : task.priority === 'MÉDIA' ? 'bg-[#294e58]/40 text-[#00f5ff]' : 'bg-[#1f383f]/40 text-[#cce7ef]'}`}>
                                {task.priority}
                              </span>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveTaskColumn(task.id, 'inprogress');
                                  }}
                                  title="Estudar / Mover para Em Fluxo"
                                  className="p-1 rounded bg-[#001115] text-[#00f5ff] hover:bg-[#00f5ff]/20 text-[10px]"
                                >
                                  Nadar →
                                </button>
                              </div>
                            </div>
                            
                            <h4 className="font-display font-semibold text-sm text-[#e9feff] tracking-tight hover:text-[#00f5ff] transition-colors leading-snug mb-4">
                              {task.title}
                            </h4>

                            <div className="flex justify-between items-center bg-[#001115]/30 p-2 rounded-xl border border-white/5">
                              <div className="flex -space-x-1.5">
                                {task.assignees.map(mid => {
                                  const mm = SAMPLE_MEMBERS.find(m => m.id === mid);
                                  return mm ? (
                                    <img 
                                      key={mid} 
                                      src={mm.avatar} 
                                      alt={mm.name} 
                                      title={mm.name}
                                      className="w-5.5 h-5.5 rounded-full border border-[#072329] object-cover" 
                                    />
                                  ) : null;
                                })}
                              </div>

                              <div className="flex items-center gap-1.5 text-[10px] text-[#4a7a82]">
                                <Clock size={11} />
                                <span>{task.effort}</span>
                              </div>
                            </div>
                          </div>
                        ))}

                        {tasks.filter(t => t.column === 'todo').length === 0 && (
                          <div className="p-8 text-center text-xs text-[#4a7a82] border border-dashed border-[#3a494a]/10 rounded-2xl mt-4">
                            Sem tarefas pendentes.
                          </div>
                        )}
                      </div>

                    </div>


                    {/* COLUMN: EM DESENVOLVIMENTO */}
                    <div className="bg-[#031f25]/20 rounded-3xl p-4 min-h-[650px] border border-[#3a494a]/15 flex flex-col">
                      <div className="flex justify-between items-center px-2 py-3 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#00f5ff] shadow-[0_0_8px_rgba(0,245,255,0.8)]" />
                          <h3 className="font-label font-bold text-xs uppercase tracking-wider text-[#b9caca]">Em Desenvolvimento</h3>
                          <span className="bg-[#00f5ff]/10 text-xs px-2.5 py-0.5 rounded-full text-[#63f7ff]">
                            {tasks.filter(t => t.column === 'inprogress').length}
                          </span>
                        </div>
                        
                        <button 
                          onClick={() => {
                            setNewTaskPriority("MÉDIA");
                            setIsNewTaskModalOpen(true);
                          }}
                          className="text-[#00f5ff] hover:scale-110 transition-transform cursor-pointer"
                        >
                          <PlusCircle size={18} />
                        </button>
                      </div>

                      <div className="space-y-4 flex-1">
                        {tasks.filter(t => t.column === 'inprogress').map(task => (
                          <div 
                            key={task.id}
                            onClick={() => openTaskDetail(task)}
                            className="bg-[#072329]/50 hover:bg-[#0f343c]/60 p-5 rounded-2xl border-l-[3px] border-l-[#00f5ff] border-t border-b border-r border-[#3a494a]/25 hover:border-[#00f5ff]/20 shadow-md transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group glass-glow"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <span className={`text-[10px] font-bold font-label tracking-wide px-2.5 py-0.5 rounded-full uppercase ${task.priority === 'CRÍTICA' ? 'bg-[#93000a]/60 text-red-100' : 'bg-[#132e34]/60 text-[#00f5ff]'}`}>
                                {task.priority}
                              </span>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveTaskColumn(task.id, 'done');
                                  }}
                                  title="Marcar como Concluído / Feito"
                                  className="p-1 rounded bg-[#001115] text-[#8ef5e1] hover:bg-[#00f5ff]/25 text-[10px]"
                                >
                                  Terminar ✓
                                </button>
                              </div>
                            </div>

                            <h4 className="font-display font-semibold text-sm text-[#e9feff] tracking-tight hover:text-[#00f5ff] transition-colors leading-snug mb-4">
                              {task.title}
                            </h4>

                            {/* Progress bar visual indicator */}
                            {task.progress > 0 && (
                              <div className="mb-4">
                                <div className="flex justify-between text-[10px] text-[#4a7a82] mb-1">
                                  <span>Progresso do Fluxo</span>
                                  <span>{task.progress}%</span>
                                </div>
                                <div className="h-1 w-full bg-[#001115] rounded-full overflow-hidden">
                                  <div style={{ width: `${task.progress}%` }} className="h-full bg-[#00f5ff] rounded-full" />
                                </div>
                              </div>
                            )}

                            <div className="flex justify-between items-center bg-[#001115]/30 p-2 rounded-xl border border-white/5">
                              <div className="flex -space-x-1.5">
                                {task.assignees.map(mid => {
                                  const mm = SAMPLE_MEMBERS.find(m => m.id === mid);
                                  return mm ? (
                                    <img 
                                      key={mid} 
                                      src={mm.avatar} 
                                      alt={mm.name} 
                                      title={mm.name}
                                      className="w-5.5 h-5.5 rounded-full border border-[#072329] object-cover" 
                                    />
                                  ) : null;
                                })}
                              </div>

                              <div className="flex items-center gap-1 bg-[#00f5ff]/10 text-[#00f5ff] px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-widest animate-pulse">
                                <Waves size={8} />
                                <span>AO VIVO</span>
                              </div>
                            </div>
                          </div>
                        ))}

                        {tasks.filter(t => t.column === 'inprogress').length === 0 && (
                          <div className="p-8 text-center text-xs text-[#4a7a82] border border-dashed border-[#3a494a]/10 rounded-2xl mt-4">
                            Nenhum cuidado ativo sendo cultivado em fluxo de desenvolvimento.
                          </div>
                        )}
                      </div>

                    </div>


                    {/* COLUMN: FEITO */}
                    <div className="bg-[#031f25]/20 rounded-3xl p-4 min-h-[650px] border border-[#3a494a]/15 flex flex-col">
                      <div className="flex justify-between items-center px-2 py-3 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#69f5e8]" />
                          <h3 className="font-label font-bold text-xs uppercase tracking-wider text-[#b9caca]">Feito</h3>
                          <span className="bg-[#1f383f]/60 text-[#8ef5e1] text-xs px-2.5 py-0.5 rounded-full">
                            {tasks.filter(t => t.column === 'done').length}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-4 flex-1">
                        {tasks.filter(t => t.column === 'done').map(task => (
                          <div 
                            key={task.id}
                            onClick={() => openTaskDetail(task)}
                            className="bg-[#072329]/30 hover:bg-[#072329]/50 p-5 rounded-2xl border border-[#00f5ff]/10 hover:border-[#00f5ff]/25 opacity-70 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-300 cursor-pointer relative glass-glow"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <span className="text-[9px] font-bold font-label tracking-wide text-[#69f5e8] px-2 py-0.5 bg-[#00f5ff]/5 border border-[#00f5ff]/15 rounded-full uppercase">
                                CONCLUÍDO
                              </span>
                              <CheckCircle className="text-[#69f5e8] shrink-0" size={15} />
                            </div>

                            <h4 className="font-display font-semibold text-sm text-[#b9caca] tracking-tight line-through leading-snug mb-4">
                              {task.title}
                            </h4>

                            <div className="flex justify-between items-center bg-[#001115]/30 p-2 rounded-xl border border-white/5">
                              <div className="flex -space-x-1.5">
                                {task.assignees.map(mid => {
                                  const mm = SAMPLE_MEMBERS.find(m => m.id === mid);
                                  return mm ? (
                                    <img 
                                      key={mid} 
                                      src={mm.avatar} 
                                      alt={mm.name} 
                                      title={mm.name}
                                      className="w-5.5 h-5.5 rounded-full border border-[#072329] object-cover" 
                                    />
                                  ) : null;
                                })}
                              </div>

                              <span className="text-[10px] text-[#4a7a82] italic font-medium">
                                {task.statusText}
                              </span>
                            </div>
                          </div>
                        ))}

                        {tasks.filter(t => t.column === 'done').length === 0 && (
                          <div className="p-8 text-center text-xs text-[#4a7a82] border border-dashed border-[#3a494a]/10 rounded-2xl mt-4">
                            Caminhos concluídos surgem com a consolidação reflexiva.
                          </div>
                        )}
                      </div>

                    </div>

                  </div>

                </div>
              )}


              {/* ========================================================
                  TAB 3B: REFLECTIVE INSIGHTS / HEALTH CLINICAL PANEL
                  ======================================================== */}
              {activeTab === 'insights' && (
                <div className="space-y-8">
                  
                  {/* Title Row */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                    <div>
                      <h1 className="font-display font-extrabold text-4xl text-white tracking-tight">SAÚDE DO TIME</h1>
                      <p className="text-[#b9caca] text-sm mt-1 max-w-xl">
                        Um espelho para observar o pulsar da nossa colaboração sob as lentes da harmonia, transparência e gentileza operacional.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 bg-[#132e34] border border-[#00f5ff]/20 px-5 py-2.5 rounded-full shadow-[0_0_12px_rgba(0,245,255,0.15)]">
                      <span className="w-3 h-3 rounded-full bg-[#00f5ff] animate-ping" />
                      <span className="font-label text-xs uppercase tracking-wide text-white font-bold">
                        Fluxo Coletivo: {teamHealth.climate}
                      </span>
                    </div>
                  </div>

                  {/* Core Grid Panel */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                    {/* Left: Wave Rhythm visual display */}
                    <div className="md:col-span-8 bg-[#031f25]/30 rounded-[32px] p-8 border border-[#33555d]/20 relative overflow-hidden flex flex-col justify-between min-h-[460px] glass-glow">
                      
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-display text-xl font-bold text-white">Ritmo de Sincronicidade</h3>
                          <Waves className="text-[#00f5ff] animate-pulse" size={24} />
                        </div>
                        <p className="text-[#b9caca] text-sm leading-relaxed max-w-md">
                          Representação contínua de picos de comunicação mútua. O fluxo é focado no respeito ao distanciamento saudável.
                        </p>
                      </div>

                      {/* Biomimetic visual wavy graph columns */}
                      <div className="h-64 flex items-end gap-2.5 py-6 mt-4 border-b border-[#3a494a]/30">
                        <div className="flex-1 bg-[#00f5ff]/15 rounded-t-full h-[55%] animate-pulse" />
                        <div className="flex-1 bg-[#00f5ff]/35 rounded-t-full h-[80%] animate-pulse" style={{ animationDelay: "0.5s" }} />
                        <div className="flex-1 bg-[#00f5ff]/60 rounded-t-full h-[65%] animate-pulse" style={{ animationDelay: "1s" }} />
                        <div className="flex-1 bg-[#00f5ff]/40 rounded-t-full h-[90%] animate-pulse" style={{ animationDelay: "1.5s" }} />
                        <div className="flex-1 bg-[#00f5ff]/20 rounded-t-full h-[50%] animate-pulse" style={{ animationDelay: "2s" }} />
                        <div className="flex-1 bg-[#01fcf2]/25 rounded-t-full h-[72%] animate-pulse" style={{ animationDelay: "2.5s" }} />
                        <div className="flex-1 bg-[#00f5ff]/50 rounded-t-full h-[78%] animate-pulse" style={{ animationDelay: "3s" }} />
                        <div className="flex-1 bg-[#00f5ff]/15 rounded-t-full h-[38%] animate-pulse" style={{ animationDelay: "3.5s" }} />
                      </div>

                      <div className="flex gap-6 text-xs text-[#b9caca] font-label font-medium pt-3 justify-center sm:justify-start">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#00f5ff]" />
                          <span>Período da Manhã (Forte)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#00f5ff]/20" />
                          <span>Período da Tarde (Suave)</span>
                        </div>
                      </div>

                    </div>

                    {/* Right: Space Focus Preservation percentage */}
                    <div className="md:col-span-4 bg-[#031f25]/30 rounded-[32px] p-8 border border-[#33555d]/10 flex flex-col justify-between text-center glass-glow">
                      
                      <div className="flex flex-col items-center">
                        <div className="w-14 h-14 rounded-full bg-[#00f5ff]/5 flex items-center justify-center mb-4 border border-[#00f5ff]/15">
                          <Clock className="text-[#00f5ff]" size={24} />
                        </div>
                        
                        <h3 className="font-display text-lg font-bold text-white mb-1">Preservação de Foco</h3>
                        <p className="text-[#b9caca] text-xs leading-relaxed">
                          Percentual de tempo protegido e livre de distração no dia.
                        </p>
                      </div>

                      {/* Bubble visual representation */}
                      <div className="relative flex items-center justify-center h-48 py-4">
                        <div className="w-32 h-32 rounded-full border-2 border-[#00f5ff]/20 flex items-center justify-center animate-pulse">
                          <div className="w-24 h-24 rounded-full bg-[#00f5ff]/10 flex items-center justify-center font-display font-extrabold text-3xl text-[#00f5ff]">
                            82%
                          </div>
                        </div>
                        <div className="absolute top-2 left-12 w-3.5 h-3.5 rounded-full bg-[#00f5ff]/40 animate-float" />
                        <div className="absolute bottom-8 right-12 w-5 h-5 rounded-full bg-[#00f5ff]/10 animate-float" style={{ animationDelay: "2s" }} />
                      </div>

                      <p className="text-xs text-[#4a7a82] italic leading-relaxed">
                        "Silêncio produtivo é uma forma sublime de cuidado mútuo."
                      </p>

                    </div>


                    {/* Bottom Full Row: Primary care advice generated by AI */}
                    <div className="md:col-span-12 bg-[#031f25]/40 rounded-[36px] p-8 border border-[#00f5ff]/20 relative overflow-hidden glass-glow">
                      
                      <div className="flex flex-col lg:flex-row items-center gap-8 text-left">
                        
                        <div className="w-20 h-20 shrink-0 rounded-full bg-[#072329] border border-[#00f5ff]/20 flex items-center justify-center relative shadow-[0_0_15px_rgba(0,245,255,0.1)]">
                          <Sparkles className="text-[#00f5ff]" size={32} />
                        </div>

                        <div className="flex-1 space-y-4">
                          
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                              <h4 className="font-display text-xl font-bold text-white tracking-tight">
                                Sinais de Cuidado do Cardume AI
                              </h4>
                              <p className="text-xs text-[#b9caca] mt-1 pr-1 border-r border-[#3a494a] inline">
                                Baseado em {tasks.length} esferas e mensagens coletivas
                              </p>
                              {isSimulatedResponse && (
                                <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded ml-2 border border-amber-500/20 font-mono">
                                  SIMULADO
                                </span>
                              )}
                            </div>

                            <div className="flex gap-2">
                              {/* Trigger Dynamic team insight */}
                              <button
                                onClick={analyzeOverallTeamHealth}
                                disabled={aiAnalyzingHealth}
                                className="px-5 py-2.5 rounded-xl bg-[#00f5ff]/10 hover:bg-[#00f5ff]/20 text-[#00f5ff] font-label text-xs font-bold border border-[#00f5ff]/25 flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50 cursor-pointer"
                              >
                                {aiAnalyzingHealth ? "Sintonizando..." : "Analisar via Gemini"}
                              </button>
                            </div>
                          </div>

                          <div className="p-5 rounded-2xl bg-[#072329]/60 border border-[#00f5ff]/10">
                            <p className="font-display font-medium text-sm md:text-base text-white leading-relaxed">
                              {aiAnalyzingHealth ? (
                                <span className="flex items-center gap-3 animate-pulse">
                                  <Waves className="animate-spin text-[#00f5ff]" />
                                  Examinando discussões ativas, checklists coletados, cargas e sinais de desalinhamento sob regras éticas...
                                </span>
                              ) : (
                                teamHealth.careSignals
                              )}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-3 pt-2">
                            <button 
                              onClick={triggerWellnessBreak}
                              className="px-5 py-3 rounded-full bg-gradient-to-r from-[#4ad8cc] to-[#00f5ff] text-[#00373d] shadow-[0_0_12px_rgba(0,245,255,0.25)] font-label font-bold text-xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
                            >
                              Agendar Pausa Coletiva
                            </button>
                          </div>

                        </div>

                      </div>

                    </div>

                    {/* Mini card row summarizing indexes */}
                    <div className="md:col-span-4 bg-[#031f25]/20 p-5 rounded-2xl border border-white/5 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#294e58]/30 flex items-center justify-center text-[#98bfca]">
                        <Smile className="text-[#00f5ff]" size={20} />
                      </div>
                      <div>
                        <span className="text-[10px] block text-[#4a7a82] font-semibold font-label">Clima do Time</span>
                        <strong className="text-sm font-display text-white block">{teamHealth.climate}</strong>
                      </div>
                    </div>

                    <div className="md:col-span-4 bg-[#031f25]/20 p-5 rounded-2xl border border-white/5 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#294e58]/30 flex items-center justify-center text-[#00f5ff]">
                        <Battery className="text-[#00f5ff]" size={20} />
                      </div>
                      <div>
                        <span className="text-[10px] block text-[#4a7a82] font-semibold font-label">Tempo de Recarga</span>
                        <strong className="text-sm font-display text-white block">{teamHealth.rechargeTime}</strong>
                      </div>
                    </div>

                    <div className="md:col-span-4 bg-[#031f25]/20 p-5 rounded-2xl border border-white/5 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#294e58]/30 flex items-center justify-center text-[#8ef5e1]">
                        <ShieldCheck className="text-[#00f5ff]" size={20} />
                      </div>
                      <div>
                        <span className="text-[10px] block text-[#4a7a82] font-semibold font-label">Alinhamento Mental</span>
                        <strong className="text-sm font-display text-white block">{teamHealth.mentalAlignment}</strong>
                      </div>
                    </div>

                  </div>

                </div>
              )}


              {/* ========================================================
                  TAB 3C: MEMBERS LIST & ROLES
                  ======================================================== */}
              {activeTab === 'members' && (
                <div className="space-y-6">
                  <div>
                    <h1 className="font-display font-extrabold text-4xl text-white tracking-tight">MEMBROS DO ECOSSISTEMA</h1>
                    <p className="text-[#b9caca] text-sm mt-1">
                      Time de exploração focado na harmonia e no trabalho sustentável de imersão de águas profundas.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {SAMPLE_MEMBERS.map(m => (
                      <div 
                        key={m.id}
                        className="bg-[#031f25]/30 p-6 rounded-3xl border border-[#3a494a]/20 flex flex-col items-center text-center glass-glow hover:-translate-y-1 transition-transform"
                      >
                        <div className="w-20 h-20 rounded-full border-2 border-[#00f5ff]/30 overflow-hidden mb-4 shadow-lg">
                          <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" />
                        </div>
                        
                        <h4 className="font-display text-base font-bold text-white mb-1">{m.name}</h4>
                        <span className="font-label text-xs text-[#00dce5] bg-[#00f5ff]/5 px-3 py-1 rounded-full border border-[#00f5ff]/10 mb-4 inline-block">
                          {m.role}
                        </span>
                        
                        <p className="text-xs text-[#4a7a82]">{m.company}</p>

                        <div className="flex items-center gap-1.5 mt-4 text-[10px] text-[#69f5e8] bg-[#69f5e8]/10 px-3 py-1 rounded-full border border-[#69f5e8]/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#69f5e8] animate-pulse" />
                          <span>Sintonizado</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-8 text-center bg-[#072329]/20 rounded-3xl border border-[#3a494a]/10 max-w-2xl mx-auto mt-6">
                    <h4 className="font-display text-sm font-bold text-[#e9feff] mb-2">Manifesto Ético das Nossas Pessoas</h4>
                    <p className="text-xs text-[#b9caca] leading-relaxed">
                      "Não geramos ranques de desempenho, números de pushes, gráficos de velocidade ou logs individuais que comparem companheiros de jornada. Nossa única métrica é o cuidado compartilhado e a sincronia saudável dos nossos oceanos."
                    </p>
                  </div>
                </div>
              )}

            </div>

          </main>

          {/* Bottom Mobiles Nav Bar */}
          <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#001115]/90 border-t border-[#3a494a]/30 flex justify-around items-center h-16 z-50 backdrop-blur-xl">
            <button 
              onClick={() => { setActiveTab('board'); }}
              className={`flex flex-col items-center gap-1 ${activeTab === 'board' ? 'text-[#00f5ff] font-bold' : 'text-[#4a7a82]'}`}
            >
              <Layers size={18} />
              <span className="text-[9px]">Sincronia</span>
            </button>
            <button 
              onClick={() => { setActiveTab('insights'); }}
              className={`flex flex-col items-center gap-1 ${activeTab === 'insights' ? 'text-[#00f5ff] font-bold' : 'text-[#4a7a82]'}`}
            >
              <Heart size={18} />
              <span className="text-[9px]">Saúde</span>
            </button>
            <button 
              onClick={() => {
                setNewTaskPriority("MÉDIA");
                setIsNewTaskModalOpen(true);
              }}
              className="bg-[#00f5ff] text-[#00373d] w-12 h-12 -mt-6 rounded-full flex items-center justify-center shadow-lg cursor-pointer"
            >
              <Plus size={20} />
            </button>
            <button 
              onClick={() => { setActiveTab('members'); }}
              className={`flex flex-col items-center gap-1 ${activeTab === 'members' ? 'text-[#00f5ff] font-bold' : 'text-[#4a7a82]'}`}
            >
              <Users size={18} />
              <span className="text-[9px]">Sintonizados</span>
            </button>
          </nav>

        </div>
      )}


      {/* ========================================================
          4. TASK DETAIL MODAL INTERACTIVE PORTAL (matches Screenshot 4)
          ======================================================== */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-[#001115]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#031f25]/95 rounded-[32px] border border-[#00f5ff]/20 max-w-6xl w-full h-[90vh] md:h-[82vh] overflow-hidden flex flex-col md:flex-row relative shadow-2xl glass-glow">
            
            {/* Close trigger */}
            <button 
              onClick={() => setSelectedTask(null)}
              className="absolute top-6 right-6 z-[60] w-10 h-10 rounded-full bg-[#072329] border border-[#3a494a]/35 flex items-center justify-center text-[#b9caca] hover:text-[#00f5ff] hover:scale-105 transition-all cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* LEFT SIDE: Task description context & specifications (60%) */}
            <section className="flex-1 p-6 md:p-10 overflow-y-auto w-full md:w-3/5 border-b md:border-b-0 md:border-r border-[#3a494a]/25 text-left flex flex-col justify-between">
              <div>
                {/* Priority and estimation labels */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className={`text-[10px] font-bold tracking-wider px-3 py-1 rounded-full uppercase ${selectedTask.priority === 'CRÍTICA' ? 'bg-[#93000a]/50 text-red-100' : 'bg-[#00f5ff]/10 text-[#00f5ff] border border-[#00f5ff]/20'}`}>
                    Prioridade {selectedTask.priority}
                  </span>
                  
                  <span className="text-xs text-[#b9caca] font-label font-medium flex items-center gap-1.5">
                    <Calendar size={13} />
                    <span>Estágio: {selectedTask.statusText}</span>
                  </span>
                </div>

                <h2 className="font-display font-extrabold text-2xl md:text-3xl text-white mb-6 leading-tight">
                  {selectedTask.title}
                </h2>

                {/* Assigned members stack */}
                <div className="flex items-center gap-4 mb-8">
                  <span className="text-xs text-[#4a7a82] font-label font-bold uppercase">Time Co-criador:</span>
                  <div className="flex -space-x-1.5">
                    {selectedTask.assignees.map(mid => {
                      const mm = SAMPLE_MEMBERS.find(m => m.id === mid);
                      return mm ? (
                        <div key={mid} className="relative group">
                          <img 
                            src={mm.avatar} 
                            alt={mm.name} 
                            title={`${mm.name} - ${mm.role}`}
                            className="w-8 h-8 rounded-full border-2 border-[#031f25] object-cover hover:scale-110 transition-transform duration-200" 
                          />
                        </div>
                      ) : null;
                    })}
                  </div>
                  
                  <div className="h-4 w-px bg-[#3a494a]/40" />
                  <span className="text-[#b9caca] text-xs font-label">
                    Total: {selectedTask.effort}
                  </span>
                </div>

                {/* Detailed body context blocks */}
                <div className="space-y-6">
                  
                  <div>
                    <h4 className="font-label text-xs uppercase font-bold text-[#00dce5] tracking-wider mb-2">
                      Missão & Contexto
                    </h4>
                    <p className="text-[#s] text-[#b9caca] text-sm leading-relaxed bg-[#072329]/40 p-4 rounded-2xl border border-white/5">
                      {selectedTask.description}
                    </p>
                  </div>

                  {/* Flow progress indicators */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    <div className="bg-[#001115]/40 p-4 rounded-2xl border border-[#3a494a]/15 text-left">
                      <span className="text-xs text-[#4a7a82] block mb-1">Status do Fluxo</span>
                      <div className="flex items-center justify-between text-white font-bold text-sm">
                        <span>{selectedTask.progress}% Concluído</span>
                        {selectedTask.progress === 100 ? (
                          <CheckCircle className="text-[#69f5e8]" size={14} />
                        ) : (
                          <Waves className="text-[#00f5ff] animate-pulse" size={14} />
                        )}
                      </div>
                      <div className="h-2 w-full bg-[#001115] rounded-full overflow-hidden mt-3 liquid-shimmer">
                        <div 
                          style={{ width: `${selectedTask.progress}%` }} 
                          className="h-full bg-gradient-to-r from-[#4ad8cc] to-[#00f5ff] rounded-full shadow-[0_0_8px_rgba(0,245,255,0.6)] transition-all duration-500" 
                        />
                      </div>
                    </div>

                    <div className="bg-[#001115]/40 p-4 rounded-2xl border border-[#3a494a]/15 flex flex-col justify-center">
                      <span className="text-xs text-[#4a7a82] block mb-1">Recarga Coletiva Estimada</span>
                      <span className="text-sm text-[#00f5ff] font-bold block flex items-center gap-1.5">
                        <Clock size={14} />
                        {selectedTask.effort}
                      </span>
                    </div>

                  </div>

                  {/* Checklist of co-creation */}
                  <div>
                    <h4 className="font-label text-xs uppercase font-bold text-[#00dce5] tracking-wider mb-3">
                      Checklist de Co-criação
                    </h4>
                    
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedTask.checklist.map(item => (
                        <div 
                          key={item.id}
                          onClick={() => toggleChecklistItem(selectedTask.id, item.id)}
                          className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#001115]/20 hover:bg-[#001115]/40 border border-[#3a494a]/15 cursor-pointer transition-all"
                        >
                          <div className={`w-5.5 h-5.5 rounded border flex items-center justify-center transition-all ${item.completed ? 'bg-[#00f5ff]/20 border-[#00f5ff] text-[#00f5ff]' : 'border-[#4a7a82] hover:border-[#00f5ff]'}`}>
                            {item.completed && <Check size={12} />}
                          </div>
                          
                          <span className={`text-xs text-[#cce7ef] font-medium transition-all ${item.completed ? 'line-through text-[#4a7a82]' : ''}`}>
                            {item.text}
                          </span>
                        </div>
                      ))}

                      {selectedTask.checklist.length === 0 && (
                        <p className="text-xs text-[#4a7a82] italic">Nenhum checklist de co-criação cadastrado.</p>
                      )}
                    </div>
                  </div>

                </div>

              </div>

              {/* DYNAMIC CARDUME INSIGHT (matches detail screenshot) */}
              <div className="mt-8 p-6 rounded-2xl bg-[#00f5ff]/5 border border-[#00f5ff]/25 backdrop-blur-md relative overflow-hidden glass-glow">
                
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-[#00f5ff]/15 flex items-center justify-center text-[#00f5ff] animate-pulse">
                    <Sparkles size={16} />
                  </div>
                  
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <h5 className="font-label text-xs font-bold text-[#00f5ff] uppercase tracking-wider">
                        Espelho do Cardume AI
                      </h5>
                      <button
                        onClick={() => analyzeTaskConversation(selectedTask)}
                        disabled={!!aiAnalyzingTask}
                        className="text-[10px] text-[#00f5ff] bg-[#00f5ff]/10 hover:bg-[#00f5ff]/20 border border-[#00f5ff]/20 rounded-full px-3 py-1 font-bold font-label tracking-wide hover:scale-105 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {aiAnalyzingTask ? "Analisando..." : "Sintonizar IA"}
                      </button>
                    </div>

                    <div className="text-xs text-white leading-relaxed space-y-2">
                      {aiAnalyzingTask ? (
                        <p className="animate-pulse flex items-center gap-2 text-[#b9caca]">
                          <Waves size={12} className="animate-spin text-[#00f5ff]" />
                          Refletindo sobre as mensagens trocadas abaixo à luz de sentimentos, sinais de fadiga e bem-estar...
                        </p>
                      ) : taskAiAnalysisResult ? (
                        <div className="space-y-4">
                          <p className="border-b border-[#00f5ff]/10 pb-2 text-[#00dce5] italic font-medium">
                            "{taskAiAnalysisResult.overallSummary}"
                          </p>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                            <div>
                              <strong className="text-[#8ef5e1] block mb-1">🌟 Sinais Positivos:</strong>
                              <ul className="list-disc pl-3 text-[11px] space-y-1 text-[#b9caca]">
                                {taskAiAnalysisResult.positiveSignals.map((s: string, idx: number) => (
                                  <li key={idx}>{s}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <strong className="text-red-300 block mb-1">⚖️ Sobrecarga / Fricções:</strong>
                              <ul className="list-disc pl-3 text-[11px] space-y-1 text-[#b9caca]">
                                {(taskAiAnalysisResult.overloadSigns || []).concat(taskAiAnalysisResult.potentialTensions || []).map((s: string, idx: number) => (
                                  <li key={idx}>{s}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-[#00f5ff]/10">
                            <strong className="text-[#00f5ff] block mb-1">🌱 Prescrição de Bem-estar Coletivo:</strong>
                            <ul className="list-disc pl-3 text-[11px] space-y-1 text-[#b9caca]">
                              {taskAiAnalysisResult.improvementSuggestions.map((s: string, idx: number) => (
                                <li key={idx}>{s}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[#b9caca] leading-relaxed">
                          {selectedTask.insight || "Nesta esfera de ajuda, as discussões ainda não foram sintonizadas. Clique em 'Sintonizar IA' para solicitar um exame empático do bem-estar do time do Cardume."}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

              </div>

            </section>

            {/* RIGHT SIDE: Dedicated Task Discussion Thread (40%) */}
            <section className="bg-[#001115]/40 flex-[0.7] flex flex-col h-full w-full md:w-2/5 justify-between">
              
              {/* Thread Header title */}
              <div className="p-5 border-b border-[#3a494a]/25 flex items-center justify-between text-left">
                <h3 className="font-label text-xs uppercase tracking-wide font-bold text-white">
                  Círculo de Discussão
                </h3>
                <div className="flex items-center gap-1.5 text-[11px] text-[#00f5ff] font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#00f5ff] animate-pulse shadow-[0_0_6px_rgba(0,245,255,0.7)]" />
                  <span>{messages.filter(m => m.taskId === selectedTask.id).length} mensagens</span>
                </div>
              </div>

              {/* Chat Flow Scroll Zone */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar text-left flex flex-col">
                
                {messages.filter(m => m.taskId === selectedTask.id).map(msg => {
                  if (msg.isSystem) {
                    return (
                      <div key={msg.id} className="flex justify-center my-2 animate-pulse">
                        <div className="bg-[#132e34] border border-[#00dce5]/10 px-4 py-1.5 rounded-full text-[10px] text-[#00f5ff] font-medium font-mono text-center">
                          {msg.content}
                        </div>
                      </div>
                    );
                  }

                  const isOwn = msg.senderId === currentUser.id;

                  return (
                    <div key={msg.id} className={`flex gap-3 max-w-[85%] ${isOwn ? 'self-end flex-row-reverse' : 'self-start'}`}>
                      <img 
                        src={msg.senderAvatar} 
                        alt={msg.senderName} 
                        className="w-8 h-8 rounded-full shrink-0 border border-white/5 object-cover" 
                      />
                      
                      <div className={`space-y-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold font-label text-[#8ef5e1]">
                            {msg.senderName}
                          </span>
                          <span className="text-[9px] text-[#4a7a82] font-semibold">
                            {msg.timestamp}
                          </span>
                        </div>

                        <div className={`p-4 rounded-3xl rounded-tl-none font-sans text-xs text-[#cce7ef] shadow-sm tracking-wide leading-relaxed ${isOwn ? 'bg-[#294e58]/40 border border-[#00f5ff]/20' : 'bg-[#1f383f]/30'}`}>
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {messages.filter(m => m.taskId === selectedTask.id).length === 0 && (
                  <div className="my-auto text-center text-[#4a7a82] px-6">
                    <Waves className="mx-auto mb-3 text-[#4a7a82]/40 animate-pulse" size={32} />
                    <p className="text-xs">O silêncio reina na lagoa. Diga algo acolhedor ou peça ajuda para iniciar a sincronia.</p>
                  </div>
                )}

              </div>

              {/* Chat Input Bar form */}
              <form onSubmit={handlePostMessage} className="p-4 bg-[#031f25]/70 border-t border-[#3a494a]/25">
                <div className="relative group">
                  <textarea
                    rows={2}
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    className="w-full bg-[#001115]/60 border border-[#3a494a]/40 rounded-2xl p-4 pr-12 text-xs focus:ring-1 focus:ring-[#00f5ff] focus:border-transparent outline-none transition-all placeholder-[#4a7a82] text-white resize-none"
                    placeholder="Escreva uma reflexão ou apoio..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handlePostMessage(e);
                      }
                    }}
                  />
                  
                  <button 
                    type="submit"
                    className="absolute right-4 bottom-4 text-[#00f5ff] hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                  >
                    <Send size={16} />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-2.5 px-1.5">
                  <div className="flex gap-3 text-[#4a7a82]">
                    <button type="button" onClick={() => setNewMessageText(prev => prev + " 🤝")} className="hover:text-[#00f5ff]">
                      <Smile size={16} />
                    </button>
                    <button type="button" onClick={() => showNotification("Anexos são processados eticamente sob o manifesto.")} className="hover:text-[#00f5ff]">
                      <Paperclip size={15} />
                    </button>
                  </div>
                  
                  <span className="text-[9px] text-[#4a7a82]">Escreva com carinho. Markdown permitido.</span>
                </div>
              </form>

            </section>

          </div>
        </div>
      )}


      {/* ========================================================
          5. NOVO CUIDADO TASK CREATION DIALOG MODAL (matches design specs)
          ======================================================== */}
      {isNewTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#001115]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#031f25]/95 rounded-[32px] border border-[#00f5ff]/20 max-w-lg w-full overflow-hidden p-8 relative shadow-2xl glass-glow text-left">
            
            <button 
              onClick={() => setIsNewTaskModalOpen(false)}
              className="absolute top-6 right-6 w-9 h-9 rounded-full bg-[#072329] border border-[#3a494a]/30 flex items-center justify-center text-[#b9caca] hover:text-[#00f5ff] hover:scale-105 transition-all cursor-pointer"
            >
              <X size={16} />
            </button>

            <h2 className="font-display font-extrabold text-2xl text-white mb-2">Esferizar Novo Cuidado</h2>
            <p className="text-xs text-[#b9caca] mb-6 leading-relaxed">
              Propague uma nova tarefa/esfera de cuidado focado de forma colaborativa e ética no ecossistema submarino.
            </p>

            <form onSubmit={handleCreateTask} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-xs text-[#4a7a82] font-bold font-label block">Título da Atividade</label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: Refinar Manifesto de Design"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full bg-[#001115]/60 border border-[#3a494a]/40 rounded-full py-3.5 px-5 text-sm focus:ring-1 focus:ring-[#00f5ff] focus:border-[#00f5ff] outline-none text-white placeholder-[#33555d]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-[#4a7a82] font-bold font-label block">Contexto & Missão Humana</label>
                <textarea
                  rows={2}
                  placeholder="Qual o propósito de bem-estar dessa esfera de cuidado?"
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  className="w-full bg-[#001115]/60 border border-[#3a494a]/40 rounded-2xl py-3 px-5 text-xs focus:ring-1 focus:ring-[#00f5ff] focus:border-[#00f5ff] outline-none text-white placeholder-[#33555d] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                
                <div className="space-y-1.5">
                  <label className="text-xs text-[#4a7a82] font-bold font-label block">Prioridade</label>
                  <select 
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
                    className="w-full bg-[#001115] border border-[#3a494a]/40 rounded-full py-3 px-4 text-xs font-semibold focus:ring-1 focus:ring-[#00f5ff] text-[#00f5ff]"
                  >
                    <option value="BAIXA">BAIXA</option>
                    <option value="MÉDIA">MÉDIA</option>
                    <option value="CRÍTICA">CRÍTICA</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-[#4a7a82] font-bold font-label block">Esforço Estimado</label>
                  <input 
                    type="text"
                    placeholder="Ex: 6-8 Ciclos"
                    value={newTaskEffort}
                    onChange={(e) => setNewTaskEffort(e.target.value)}
                    className="w-full bg-[#001115]/60 border border-[#3a494a]/40 rounded-full py-3 px-5 text-xs focus:ring-1 focus:ring-[#00f5ff] text-white"
                  />
                </div>

              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-[#4a7a82] font-bold font-label block">Membros Designados</label>
                <div className="flex gap-2 flex-wrap pt-1">
                  {SAMPLE_MEMBERS.map(m => {
                    const isSelected = newTaskAssignees.includes(m.id);
                    return (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => {
                          if (isSelected) {
                            setNewTaskAssignees(prev => prev.filter(id => id !== m.id));
                          } else {
                            setNewTaskAssignees(prev => [...prev, m.id]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all flex items-center gap-2 cursor-pointer ${isSelected ? 'bg-[#00f5ff]/15 border-[#00f5ff] text-[#00f5ff]' : 'bg-[#001115]/40 border-[#3a494a]/30 text-[#4a7a82]'}`}
                      >
                        <img src={m.avatar} alt={m.name} className="w-4.5 h-4.5 rounded-full object-cover" />
                        <span>{m.name.split(" ")[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-[#4a7a82] font-bold font-label block">
                  Checklist Inicial (Um item por linha)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Definir paleta de cores&#10;Revisar contraste no Figma"
                  value={newTaskChecklistItems}
                  onChange={(e) => setNewTaskChecklistItems(e.target.value)}
                  className="w-full bg-[#001115]/60 border border-[#3a494a]/40 rounded-2xl py-3 px-5 text-xs text-white placeholder-[#2b4c53] resize-none focus:ring-1 focus:ring-[#00f5ff]"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-[#4ad8cc] to-[#00f5ff] text-[#00373d] py-4 rounded-full font-display font-extrabold text-sm tracking-wide shadow-lg hover:shadow-[0_0_15px_rgba(0,245,255,0.3)] hover:scale-[1.02] flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer pt-3"
              >
                <span>Propagar Cuidado</span>
                <Check size={16} />
              </button>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
