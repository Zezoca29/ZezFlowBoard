import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Calendar, Zap, BarChart3, CheckCircle2, Circle, ChevronDown, ChevronUp, Download, Upload, GitBranch, Sun, Moon, Search, X, AlertTriangle, Bell, Filter, Lightbulb } from 'lucide-react';
import BrainstormView from './components/BrainstormView';

// IndexedDB Manager
const DB_NAME = 'FlowBoardDB';
const DB_VERSION = 2;

class IndexedDBManager {
  constructor() {
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        if (!db.objectStoreNames.contains('tasks')) {
          const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
          taskStore.createIndex('status', 'status', { unique: false });
          taskStore.createIndex('projectId', 'projectId', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('projects')) {
          db.createObjectStore('projects', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };
    });
  }

  async addTask(task) {
    const tx = this.db.transaction(['tasks'], 'readwrite');
    const store = tx.objectStore('tasks');
    await store.add(task);
    return tx.complete;
  }

  async updateTask(task) {
    const tx = this.db.transaction(['tasks'], 'readwrite');
    const store = tx.objectStore('tasks');
    await store.put(task);
    return tx.complete;
  }

  async deleteTask(id) {
    const tx = this.db.transaction(['tasks'], 'readwrite');
    const store = tx.objectStore('tasks');
    await store.delete(id);
    return tx.complete;
  }

  async getAllTasks() {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['tasks'], 'readonly');
      const store = tx.objectStore('tasks');
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async addProject(project) {
    const tx = this.db.transaction(['projects'], 'readwrite');
    const store = tx.objectStore('projects');
    await store.add(project);
    return tx.complete;
  }

  async updateProject(project) {
    const tx = this.db.transaction(['projects'], 'readwrite');
    const store = tx.objectStore('projects');
    await store.put(project);
    return tx.complete;
  }

  async getAllProjects() {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['projects'], 'readonly');
      const store = tx.objectStore('projects');
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async saveSetting(key, value) {
    if (!this.db) {
      console.warn('IndexedDB not initialized for saveSetting');
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      try {
        const tx = this.db.transaction(['settings'], 'readwrite');
        const store = tx.objectStore('settings');
        store.put({ key, value });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      } catch (error) {
        console.warn('Error saving setting:', error);
        resolve(); // Don't reject, just resolve with warning
      }
    });
  }

  async getSetting(key) {
    if (!this.db) {
      return undefined;
    }
    return new Promise((resolve, reject) => {
      try {
        const tx = this.db.transaction(['settings'], 'readonly');
        const store = tx.objectStore('settings');
        const request = store.get(key);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result?.value);
      } catch (error) {
        console.warn('Error getting setting:', error);
        resolve(undefined);
      }
    });
  }
}

const dbManager = new IndexedDBManager();

// Utilidades
const generateId = () => Date.now() + Math.random().toString(36).substr(2, 9);

const calculateImpact = (task) => {
  if (!task.dueDate) return task.priority;
  const today = new Date();
  const due = new Date(task.dueDate);
  const daysRemaining = Math.max(1, Math.ceil((due - today) / (1000 * 60 * 60 * 24)));
  return Math.round((task.priority * (task.effort || 1)) / daysRemaining);
};

const isTaskOverdue = (task) => {
  if (!task.dueDate || task.status === 'done') return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(task.dueDate);
  due.setHours(0, 0, 0, 0);
  return due < today;
};

const getPriorityColor = (priority) => {
  if (priority >= 80) return 'bg-red-500';
  if (priority >= 60) return 'bg-orange-500';
  if (priority >= 40) return 'bg-yellow-500';
  return 'bg-green-500';
};

// Templates de projetos
const PROJECT_TEMPLATES = [
  {
    name: 'Desenvolvimento Web',
    icon: '🌐',
    description: 'Setup, Design, Frontend, Backend, QA, Deploy',
    tasks: [
      { title: 'Setup do Projeto', status: 'backlog', priority: 80, effort: 2 },
      { title: 'Design UI/UX', status: 'backlog', priority: 70, effort: 8 },
      { title: 'Desenvolvimento Frontend', status: 'backlog', priority: 75, effort: 16 },
      { title: 'Desenvolvimento Backend', status: 'backlog', priority: 75, effort: 16 },
      { title: 'QA e Testes', status: 'backlog', priority: 60, effort: 8 },
      { title: 'Deploy em Produção', status: 'backlog', priority: 80, effort: 4 }
    ]
  },
  {
    name: 'Campanha de Marketing',
    icon: '📢',
    description: 'Pesquisa, Personas, Conteúdo, Ads, Analytics',
    tasks: [
      { title: 'Pesquisa de Mercado', status: 'backlog', priority: 70, effort: 6 },
      { title: 'Definição de Personas', status: 'backlog', priority: 70, effort: 4 },
      { title: 'Criação de Conteúdo', status: 'backlog', priority: 75, effort: 10 },
      { title: 'Setup de Ads', status: 'backlog', priority: 80, effort: 8 },
      { title: 'Análise de Resultados', status: 'backlog', priority: 60, effort: 4 }
    ]
  },
  {
    name: 'Aplicativo Mobile',
    icon: '📱',
    description: 'Arquitetura, Design, Features, API, Testes, Publicação',
    tasks: [
      { title: 'Definição de Arquitetura', status: 'backlog', priority: 85, effort: 4 },
      { title: 'Design da Interface', status: 'backlog', priority: 70, effort: 8 },
      { title: 'Implementação de Features', status: 'backlog', priority: 75, effort: 20 },
      { title: 'Desenvolvimento da API', status: 'backlog', priority: 80, effort: 12 },
      { title: 'Testes Automatizados', status: 'backlog', priority: 65, effort: 8 },
      { title: 'Publicação nas Lojas', status: 'backlog', priority: 90, effort: 4 }
    ]
  }
];

// Componente Principal
export default function FlowBoard() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState('all');
  const [view, setView] = useState('kanban'); // kanban, dashboard, programmer, brainstorm
  const [showNewTask, setShowNewTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [dbReady, setDbReady] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);
  const [automationsEnabled, setAutomationsEnabled] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showFlowEditor, setShowFlowEditor] = useState(false);
  const [editingFlowTask, setEditingFlowTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Filtros
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterOverdue, setFilterOverdue] = useState(false);

  // Inicializar DB
  useEffect(() => {
    dbManager.init().then(async () => {
      const loadedTasks = await dbManager.getAllTasks();
      const loadedProjects = await dbManager.getAllProjects();
      const savedDarkMode = await dbManager.getSetting('darkMode');
      const savedAutomations = await dbManager.getSetting('automationsEnabled');
      
      if (savedDarkMode !== undefined) setDarkMode(savedDarkMode);
      if (savedAutomations !== undefined) setAutomationsEnabled(savedAutomations);
      
      if (loadedProjects.length === 0) {
        const defaultProjects = [
          { id: 'personal', name: 'Pessoal', color: 'blue' },
          { id: 'work', name: 'Trabalho', color: 'purple' },
          { id: 'study', name: 'Estudos', color: 'green' }
        ];
        
        for (const proj of defaultProjects) {
          await dbManager.addProject(proj);
        }
        
        setProjects(defaultProjects);
      } else {
        setProjects(loadedProjects);
      }
      
      setTasks(loadedTasks);
      setDbReady(true);
    });
  }, []);

  // Salvar preferência de tema
  useEffect(() => {
    if (dbReady) {
      dbManager.saveSetting('darkMode', darkMode).catch(() => {});
    }
  }, [darkMode, dbReady]);

  // Salvar preferência de automações
  useEffect(() => {
    if (dbReady) {
      dbManager.saveSetting('automationsEnabled', automationsEnabled).catch(() => {});
    }
  }, [automationsEnabled, dbReady]);

  // Sistema de automações - detector de atrasadas
  useEffect(() => {
    if (!automationsEnabled) return;

    const checkOverdue = () => {
      const overdueTasks = tasks.filter(t => isTaskOverdue(t));
      setNotificationCount(overdueTasks.length);
    };

    checkOverdue();
    const interval = setInterval(checkOverdue, 60000); // Verificar a cada minuto
    return () => clearInterval(interval);
  }, [tasks, automationsEnabled]);

  const addTask = async (taskData) => {
    const newTask = {
      id: generateId(),
      ...taskData,
      createdAt: new Date().toISOString(),
      subtasks: [],
      flowData: null
    };
    
    await dbManager.addTask(newTask);
    setTasks([...tasks, newTask]);
    setShowNewTask(false);
  };

  const addTaskFromTemplate = async (templateTasks, templateName) => {
    const projectData = {
      id: generateId(),
      name: templateName,
      color: 'purple'
    };

    await dbManager.addProject(projectData);
    setProjects([...projects, projectData]);

    const newTasks = templateTasks.map(t => ({
      id: generateId(),
      ...t,
      tag: templateName,
      projectId: projectData.id,
      createdAt: new Date().toISOString(),
      subtasks: [],
      flowData: null
    }));

    for (const task of newTasks) {
      await dbManager.addTask(task);
    }

    setTasks([...tasks, ...newTasks]);
    setShowTemplates(false);
  };

  const updateTask = async (updatedTask) => {
    await dbManager.updateTask(updatedTask);
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    setEditingTask(null);
  };

  const deleteTask = async (id) => {
    const task = tasks.find(t => t.id === id);
    setTaskToDelete(task);
  };

  const confirmDeleteTask = async (id) => {
    await dbManager.deleteTask(id);
    setTasks(tasks.filter(t => t.id !== id));
    setTaskToDelete(null);
  };

  const moveTask = async (taskId, newStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const updatedTask = { ...task, status: newStatus };
      await updateTask(updatedTask);
    }
  };

  const toggleSubtask = async (taskId, subtaskIndex) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const updatedSubtasks = [...task.subtasks];
      updatedSubtasks[subtaskIndex] = {
        ...updatedSubtasks[subtaskIndex],
        completed: !updatedSubtasks[subtaskIndex].completed
      };
      await updateTask({ ...task, subtasks: updatedSubtasks });
    }
  };

  const exportData = () => {
    const data = { tasks, projects };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flowboard-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target.result);
          for (const task of data.tasks) {
            await dbManager.addTask(task);
          }
          const loadedTasks = await dbManager.getAllTasks();
          setTasks(loadedTasks);
        } catch (error) {
          alert('Erro ao importar dados');
        }
      };
      reader.readAsText(file);
    }
  };

  // Aplicar filtros
  let filteredTasks = currentProject === 'all' 
    ? tasks 
    : tasks.filter(t => t.projectId === currentProject);

  if (searchText.trim()) {
    const search = searchText.toLowerCase();
    filteredTasks = filteredTasks.filter(t => 
      t.title.toLowerCase().includes(search) || 
      (t.description && t.description.toLowerCase().includes(search)) ||
      (t.tag && t.tag.toLowerCase().includes(search))
    );
  }

  if (filterStatus) {
    filteredTasks = filteredTasks.filter(t => t.status === filterStatus);
  }

  if (filterPriority) {
    if (filterPriority === 'alta') {
      filteredTasks = filteredTasks.filter(t => t.priority >= 80);
    } else if (filterPriority === 'média') {
      filteredTasks = filteredTasks.filter(t => t.priority >= 60 && t.priority < 80);
    } else if (filterPriority === 'baixa') {
      filteredTasks = filteredTasks.filter(t => t.priority < 60);
    }
  }

  if (filterOverdue) {
    filteredTasks = filteredTasks.filter(t => isTaskOverdue(t));
  }

  const hasActiveFilters = searchText.trim() || filterStatus || filterPriority || filterOverdue;

  const stats = {
    total: filteredTasks.length,
    backlog: filteredTasks.filter(t => t.status === 'backlog').length,
    progress: filteredTasks.filter(t => t.status === 'progress').length,
    review: filteredTasks.filter(t => t.status === 'review').length,
    done: filteredTasks.filter(t => t.status === 'done').length,
    completion: filteredTasks.length > 0 
      ? Math.round((filteredTasks.filter(t => t.status === 'done').length / filteredTasks.length) * 100)
      : 0
  };

  if (!dbReady) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' : 'bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50'} flex items-center justify-center`}>
        <div className={`${darkMode ? 'text-white' : 'text-slate-900'} text-2xl animate-pulse`}>Inicializando FlowBoard...</div>
      </div>
    );
  }

  return (
    <div className={`h-screen w-screen overflow-hidden ${darkMode ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white' : 'bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50 text-slate-900'} flex flex-col`}>
      {/* Header */}
      <header className={`${darkMode ? 'bg-black/30' : 'bg-white/40'} backdrop-blur-lg border-b ${darkMode ? 'border-white/10' : 'border-white/40'} p-4 flex-shrink-0 z-40`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h1 className={`text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent`}>
                ⚡ FlowBoard
              </h1>
              {/* Menu Desktop */}
              <div className="hidden min-[1293px]:flex gap-2">
                <button
                  onClick={() => setView('kanban')}
                  className={`px-4 py-2 rounded-lg transition ${view === 'kanban' ? (darkMode ? 'bg-purple-600' : 'bg-purple-500') : (darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-white/30 hover:bg-white/40')}`}
                >
                  Kanban
                </button>
                <button
                  onClick={() => setView('dashboard')}
                  className={`px-4 py-2 rounded-lg transition ${view === 'dashboard' ? (darkMode ? 'bg-purple-600' : 'bg-purple-500') : (darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-white/30 hover:bg-white/40')}`}
                >
                  <BarChart3 className="w-5 h-5 inline mr-1" />
                  Dashboard
                </button>
                <button
                  onClick={() => setView('programmer')}
                  className={`px-4 py-2 rounded-lg transition ${view === 'programmer' ? (darkMode ? 'bg-purple-600' : 'bg-purple-500') : (darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-white/30 hover:bg-white/40')}`}
                >
                  Programador
                </button>
                <button
                  onClick={() => setView('brainstorm')}
                  className={`px-4 py-2 rounded-lg transition ${view === 'brainstorm' ? (darkMode ? 'bg-purple-600' : 'bg-purple-500') : (darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-white/30 hover:bg-white/40')}`}
                >
                  <Lightbulb className="w-5 h-5 inline mr-1" />
                  Brainstorm
                </button>
              </div>
              
              {/* Menu Mobile */}
              <div className="min-[1293px]:hidden relative">
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className={`px-4 py-2 rounded-lg transition ${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-white/30 hover:bg-white/40'}`}
                  title="Menu"
                >
                  ☰ Menu
                </button>
                
                {/* Menu Dropdown Mobile */}
                {showMobileMenu && (
                  <div className={`absolute top-full left-0 mt-2 ${darkMode ? 'bg-slate-800 border-white/20' : 'bg-white border-slate-200'} border rounded-lg shadow-2xl z-50 min-w-[200px]`}>
                    <button
                      onClick={() => {
                        setView('kanban');
                        setShowMobileMenu(false);
                      }}
                      className={`w-full text-left px-4 py-3 transition border-b ${darkMode ? 'border-white/10 hover:bg-white/10' : 'border-slate-200 hover:bg-slate-100'} ${view === 'kanban' ? (darkMode ? 'bg-purple-600/30' : 'bg-purple-100') : ''}`}
                    >
                      📊 Kanban
                    </button>
                    <button
                      onClick={() => {
                        setView('dashboard');
                        setShowMobileMenu(false);
                      }}
                      className={`w-full text-left px-4 py-3 transition border-b ${darkMode ? 'border-white/10 hover:bg-white/10' : 'border-slate-200 hover:bg-slate-100'} ${view === 'dashboard' ? (darkMode ? 'bg-purple-600/30' : 'bg-purple-100') : ''}`}
                    >
                      📈 Dashboard
                    </button>
                    <button
                      onClick={() => {
                        setView('programmer');
                        setShowMobileMenu(false);
                      }}
                      className={`w-full text-left px-4 py-3 transition ${darkMode ? 'hover:bg-white/10' : 'hover:bg-slate-100'} ${view === 'programmer' ? (darkMode ? 'bg-purple-600/30' : 'bg-purple-100') : ''}`}
                    >
                      👨‍💻 Programador
                    </button>
                    <button
                      onClick={() => {
                        setView('brainstorm');
                        setShowMobileMenu(false);
                      }}
                      className={`w-full text-left px-4 py-3 transition ${darkMode ? 'hover:bg-white/10' : 'hover:bg-slate-100'} ${view === 'brainstorm' ? (darkMode ? 'bg-purple-600/30' : 'bg-purple-100') : ''}`}
                    >
                      💡 Brainstorm
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Notificações */}
              <div className="relative">
                <button className={`p-2 ${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-white/30 hover:bg-white/40'} rounded-lg transition relative`}>
                  <Bell className="w-5 h-5" />
                  {notificationCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {notificationCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Toggle Automações */}
              <button
                onClick={() => setAutomationsEnabled(!automationsEnabled)}
                className={`p-2 ${automationsEnabled ? 'bg-yellow-500/20 text-yellow-400' : (darkMode ? 'bg-white/10' : 'bg-white/30')} rounded-lg transition`}
                title={automationsEnabled ? 'Automações ativas' : 'Automações inativas'}
              >
                <Zap className="w-5 h-5" />
              </button>

              {/* Toggle Tema */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 ${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-white/30 hover:bg-white/40'} rounded-lg transition`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Filtros - Responsivo */}
          <div className={`flex flex-col gap-3 ${darkMode ? 'bg-white/5' : 'bg-white/20'} p-2 md:p-3 rounded-lg`}>
            {/* Linha 1: Busca + Botões */}
            <div className={`flex items-center gap-2 w-full flex-wrap md:flex-nowrap`}>
              {/* Input de Busca */}
              <div className={`flex items-center gap-2 flex-1 min-w-[200px] ${darkMode ? 'bg-white/10' : 'bg-white/40'} rounded px-2 md:px-3 py-1 md:py-2`}>
                <Search className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className={`bg-transparent outline-none flex-1 text-xs md:text-base ${darkMode ? 'text-white placeholder-white/50' : 'text-slate-900 placeholder-slate-600'}`}
                />
              </div>

              {/* Status Filter - Mobile Hidden */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`hidden sm:block bg-purple-600 hover:bg-purple-700 text-white border border-purple-700 rounded px-2 md:px-3 py-1 md:py-2 transition text-xs md:text-sm`}
              >
                <option value="">Status</option>
                <option value="backlog">Backlog</option>
                <option value="progress">Em Progresso</option>
                <option value="review">Revisão</option>
                <option value="done">Concluído</option>
              </select>

              {/* Priority Filter - Mobile Hidden */}
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className={`hidden sm:block bg-purple-600 hover:bg-purple-700 text-white border border-purple-700 rounded px-2 md:px-3 py-1 md:py-2 transition text-xs md:text-sm`}
              >
                <option value="">Prioridade</option>
                <option value="alta">Alta</option>
                <option value="média">Média</option>
                <option value="baixa">Baixa</option>
              </select>

              {/* Templates - Mobile Hidden */}
              <button 
                onClick={() => setShowTemplates(true)}
                className={`hidden md:flex px-2 md:px-4 py-1 md:py-2 rounded-lg transition text-xs md:text-sm whitespace-nowrap ${darkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'}`}
              >
                📋
              </button>

              {/* Export - Mobile Hidden */}
              <button 
                onClick={exportData} 
                className={`hidden md:block p-1 md:p-2 ${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-white/30 hover:bg-white/40'} rounded-lg transition`}
              >
                <Download className="w-3 h-3 md:w-5 md:h-5" />
              </button>

              {/* Nova Task - Sempre visível */}
              <button
                onClick={() => setShowNewTask(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 px-2 md:px-4 py-1 md:py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition flex items-center gap-1 text-xs md:text-base whitespace-nowrap"
              >
                <Plus className="w-3 h-3 md:w-5 md:h-5" />
                <span className="hidden sm:inline">Nova</span>
              </button>
            </div>

            {/* Linha 2: Filtros Adicionais - Mobile Expandível */}
            <div className={`flex flex-wrap gap-2 items-center md:gap-2 ${showMobileFilters ? 'block' : 'hidden md:flex'}`}>
              {/* Atrasadas - Mobile sem label */}
              <label className={`flex items-center gap-1 px-2 md:px-3 py-1 md:py-2 ${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-white/40 hover:bg-white/50'} rounded cursor-pointer transition text-xs md:text-sm`}>
                <input
                  type="checkbox"
                  checked={filterOverdue}
                  onChange={(e) => setFilterOverdue(e.target.checked)}
                />
                <span className="hidden sm:inline">Atrasadas</span>
              </label>

              {/* Project Filter */}
              <select
                value={currentProject}
                onChange={(e) => setCurrentProject(e.target.value)}
                className={`bg-purple-600 hover:bg-purple-700 text-white border border-purple-700 rounded px-2 md:px-3 py-1 md:py-2 transition text-xs md:text-sm`}
              >
                <option value="all">Todos</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>

              {/* Limpar Filtros */}
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    setSearchText('');
                    setFilterStatus('');
                    setFilterPriority('');
                    setFilterOverdue(false);
                  }}
                  className={`flex items-center gap-1 px-2 md:px-3 py-1 md:py-2 ${darkMode ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' : 'bg-red-300/40 hover:bg-red-300/60 text-red-700'} rounded transition text-xs md:text-sm`}
                >
                  <X className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Limpar</span>
                </button>
              )}

              {/* Upload */}
              <label className={`p-1 md:p-2 ${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-white/30 hover:bg-white/40'} rounded-lg transition cursor-pointer hidden md:block`}>
                <Upload className="w-3 h-3 md:w-5 md:h-5" />
                <input type="file" accept=".json" onChange={importData} className="hidden" />
              </label>

              {/* Mobile Filter Toggle */}
              <button 
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className={`md:hidden p-1 md:p-2 ${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-white/30 hover:bg-white/40'} rounded-lg transition ml-auto`}
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Views - Full Screen Card */}
      <main className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <div className={`${darkMode ? 'bg-slate-900 border-white/20' : 'bg-white border-white/40'} border rounded-3xl w-full h-full overflow-hidden flex flex-col shadow-2xl animate-expand-panel`}>
          {/* Content Area with scroll */}
          <div className="flex-1 overflow-y-auto min-[1293px]:overflow-x-hidden max-[1292px]:overflow-x-auto p-6">
            <div className="animate-slide-in-content">
              {view === 'dashboard' && <DashboardView stats={stats} tasks={filteredTasks} darkMode={darkMode} />}
              {view === 'kanban' && (
                <KanbanView 
                  tasks={filteredTasks} 
                  moveTask={moveTask} 
                  updateTask={updateTask}
                  deleteTask={deleteTask}
                  toggleSubtask={toggleSubtask}
                  setEditingTask={setEditingTask}
                  darkMode={darkMode}
                  onEditFlow={(task) => {
                    setShowFlowEditor(true);
                    setEditingFlowTask(task);
                  }}
                />
              )}
              {view === 'programmer' && (
                <ProgrammerView 
                  tasks={filteredTasks} 
                  updateTask={updateTask}
                  deleteTask={deleteTask}
                  darkMode={darkMode}
                />
              )}
              {view === 'brainstorm' && (
                <BrainstormView 
                  onCreateTask={(taskData) => {
                    addTask({
                      ...taskData,
                      status: 'backlog'
                    });
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {showNewTask && (
        <TaskModal
          onClose={() => setShowNewTask(false)}
          onSave={addTask}
          projects={projects}
          darkMode={darkMode}
        />
      )}
      
      {editingTask && (
        <TaskModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={updateTask}
          projects={projects}
          darkMode={darkMode}
        />
      )}

      {showTemplates && (
        <TemplateModal
          onClose={() => setShowTemplates(false)}
          onSelectTemplate={addTaskFromTemplate}
          darkMode={darkMode}
        />
      )}

      {showFlowEditor && editingFlowTask && (
        <FlowEditorModal
          task={editingFlowTask}
          onClose={() => {
            setShowFlowEditor(false);
            setEditingFlowTask(null);
          }}
          onSave={(flowData) => {
            updateTask({ ...editingFlowTask, flowData });
            setShowFlowEditor(false);
            setEditingFlowTask(null);
          }}
          darkMode={darkMode}
        />
      )}

      {taskToDelete && (
        <DeleteConfirmModal
          task={taskToDelete}
          onConfirm={() => confirmDeleteTask(taskToDelete.id)}
          onCancel={() => setTaskToDelete(null)}
          darkMode={darkMode}
        />
      )}
    </div>
  );
}

// Dashboard View
function DashboardView({ stats, tasks, darkMode }) {
  const highPriorityTasks = tasks
    .filter(t => t.status !== 'done')
    .map(t => ({ ...t, impact: calculateImpact(t) }))
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 5);

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard title="Total" value={stats.total} color="purple" darkMode={darkMode} />
        <StatCard title="Backlog" value={stats.backlog} color="gray" darkMode={darkMode} />
        <StatCard title="Em Progresso" value={stats.progress} color="blue" darkMode={darkMode} />
        <StatCard title="Revisão" value={stats.review} color="yellow" darkMode={darkMode} />
        <StatCard title="Concluído" value={stats.done} color="green" darkMode={darkMode} />
      </div>

      <div className={`${darkMode ? 'bg-white/10' : 'bg-white/40'} backdrop-blur-lg rounded-2xl p-6 border ${darkMode ? 'border-white/20' : 'border-white/60'}`}>
        <h3 className="text-xl font-bold mb-4">Taxa de Conclusão</h3>
        <div className="flex items-center gap-4">
          <div className={`flex-1 ${darkMode ? 'bg-white/5' : 'bg-white/30'} rounded-full h-8 overflow-hidden`}>
            <div 
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-full transition-all duration-500 flex items-center justify-center text-sm font-bold text-white"
              style={{ width: `${stats.completion}%` }}
            >
              {stats.completion > 10 && `${stats.completion}%`}
            </div>
          </div>
          <span className="text-3xl font-bold">{stats.completion}%</span>
        </div>
      </div>

      <div className={`${darkMode ? 'bg-white/10' : 'bg-white/40'} backdrop-blur-lg rounded-2xl p-6 border ${darkMode ? 'border-white/20' : 'border-white/60'}`}>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Zap className="w-6 h-6 text-yellow-400" />
          Top 5 - Maior Impacto
        </h3>
        <div className="space-y-3">
          {highPriorityTasks.map((task, idx) => (
            <div key={task.id} className={`flex items-center gap-4 ${darkMode ? 'bg-white/5' : 'bg-white/30'} p-4 rounded-lg`}>
              <div className="text-2xl font-bold text-purple-400">#{idx + 1}</div>
              <div className="flex-1">
                <div className="font-semibold">{task.title}</div>
                <div className={`text-sm ${darkMode ? 'text-white/60' : 'text-slate-700'}`}>{task.tag}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-yellow-400">{task.impact}</div>
                <div className={`text-xs ${darkMode ? 'text-white/60' : 'text-slate-700'}`}>impacto</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color, darkMode }) {
  const colors = {
    purple: 'from-purple-600 to-purple-800',
    gray: 'from-gray-600 to-gray-800',
    blue: 'from-blue-600 to-blue-800',
    yellow: 'from-yellow-600 to-yellow-800',
    green: 'from-green-600 to-green-800'
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-2xl p-6 border ${darkMode ? 'border-white/20' : 'border-white/40'}`}>
      <div className={`${darkMode ? 'text-white/80' : 'text-white'} text-sm mb-2`}>{title}</div>
      <div className="text-4xl font-bold text-white">{value}</div>
    </div>
  );
}

// Kanban View
function KanbanView({ tasks, moveTask, updateTask, deleteTask, toggleSubtask, setEditingTask, darkMode, onEditFlow }) {
  const columns = [
    { id: 'backlog', title: 'Backlog', color: 'gray' },
    { id: 'progress', title: 'Em Progresso', color: 'blue' },
    { id: 'review', title: 'Revisão', color: 'yellow' },
    { id: 'done', title: 'Concluído', color: 'green' }
  ];

  return (
    <div className="w-full h-full">
      <div className="min-[1293px]:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-max max-[1292px]:flex max-[1292px]:gap-4 max-[1292px]:pb-4">
        {columns.map(column => (
          <div key={column.id} className="max-[1292px]:flex-shrink-0 max-[1292px]:w-96">
            <KanbanColumn
              column={column}
              tasks={tasks.filter(t => t.status === column.id)}
              moveTask={moveTask}
              updateTask={updateTask}
              deleteTask={deleteTask}
              toggleSubtask={toggleSubtask}
              setEditingTask={setEditingTask}
              darkMode={darkMode}
              onEditFlow={onEditFlow}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function KanbanColumn({ column, tasks, moveTask, updateTask, deleteTask, toggleSubtask, setEditingTask, darkMode, onEditFlow }) {
  const [draggedOver, setDraggedOver] = useState(false);

  return (
    <div 
      className={`${darkMode ? 'bg-white/5' : 'bg-white/30'} backdrop-blur-lg rounded-2xl p-4 border-2 transition ${
        draggedOver ? (darkMode ? 'border-purple-500 bg-white/10' : 'border-purple-500 bg-white/40') : (darkMode ? 'border-white/10' : 'border-white/30')
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDraggedOver(true);
      }}
      onDragLeave={() => setDraggedOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDraggedOver(false);
        const taskId = e.dataTransfer.getData('taskId');
        moveTask(taskId, column.id);
      }}
    >
      <h3 className={`font-bold text-lg mb-4 flex items-center justify-between`}>
        <span>{column.title}</span>
        <span className={`${darkMode ? 'bg-white/10' : 'bg-white/40'} px-2 py-1 rounded-full text-sm`}>{tasks.length}</span>
      </h3>
      
      <div className="space-y-3">
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            updateTask={updateTask}
            deleteTask={deleteTask}
            toggleSubtask={toggleSubtask}
            setEditingTask={setEditingTask}
            darkMode={darkMode}
            onEditFlow={onEditFlow}
          />
        ))}
      </div>
    </div>
  );
}

function TaskCard({ task, updateTask, deleteTask, toggleSubtask, setEditingTask, darkMode, onEditFlow }) {
  const [expanded, setExpanded] = useState(false);
  const [showSubtaskInput, setShowSubtaskInput] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');

  const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;
  const isOverdue = isTaskOverdue(task);

  const addSubtask = () => {
    if (newSubtask.trim()) {
      const updatedTask = {
        ...task,
        subtasks: [...(task.subtasks || []), { text: newSubtask, completed: false }]
      };
      updateTask(updatedTask);
      setNewSubtask('');
      setShowSubtaskInput(false);
    }
  };

  return (
    <>
      <div
        draggable
        onDragStart={(e) => e.dataTransfer.setData('taskId', task.id)}
        className={`${darkMode ? 'bg-white/10 border-white/20 hover:border-purple-500' : 'bg-white/40 border-white/40 hover:border-purple-400'} backdrop-blur-lg rounded-xl p-4 border transition cursor-move ${isOverdue ? 'ring-2 ring-red-500' : ''}`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)} inline-block`} />
              <span className="font-semibold">{task.title}</span>
              {isOverdue && <AlertTriangle className="w-4 h-4 text-red-500" />}
            </div>
            {isOverdue && <span className="text-xs text-red-500 font-bold">ATRASADA</span>}
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => onEditFlow(task)}
              className={`p-1 ${darkMode ? 'hover:bg-white/10' : 'hover:bg-white/30'} rounded`}
              title="Editor de Fluxograma"
            >
              <GitBranch className="w-4 h-4" />
            </button>
            <button
              onClick={() => setEditingTask(task)}
              className={`p-1 ${darkMode ? 'hover:bg-white/10' : 'hover:bg-white/30'} rounded`}
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => deleteTask(task.id)}
              className={`p-1 ${darkMode ? 'hover:bg-red-500/20' : 'hover:bg-red-300/40'} rounded`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className={`p-1 ${darkMode ? 'hover:bg-white/10' : 'hover:bg-white/30'} rounded`}
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {task.description && (
          <p className={`text-sm ${darkMode ? 'text-white/70' : 'text-slate-700'} mb-2`}>{task.description}</p>
        )}

        <div className={`flex items-center gap-2 text-xs ${darkMode ? 'text-white/60' : 'text-slate-700'} mb-2`}>
          {task.tag && <span className={`${darkMode ? 'bg-white/10' : 'bg-white/40'} px-2 py-1 rounded`}>{task.tag}</span>}
          {task.dueDate && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(task.dueDate).toLocaleDateString('pt-BR')}
            </span>
          )}
          {task.effort && (
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {task.effort}h
            </span>
          )}
        </div>

        {totalSubtasks > 0 && (
          <div className="mb-2">
            <div className={`flex items-center justify-between text-xs mb-1 ${darkMode ? 'text-white/60' : 'text-slate-700'}`}>
              <span>{completedSubtasks}/{totalSubtasks} subtasks</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className={`${darkMode ? 'bg-white/5' : 'bg-white/30'} rounded-full h-2 overflow-hidden`}>
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {expanded && (
          <div className={`mt-3 pt-3 ${darkMode ? 'border-t border-white/10' : 'border-t border-white/30'} space-y-2`}>
            {task.subtasks?.map((subtask, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <button
                  onClick={() => toggleSubtask(task.id, idx)}
                  className="flex-shrink-0"
                >
                  {subtask.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <Circle className={`w-4 h-4 ${darkMode ? 'text-white/40' : 'text-slate-400'}`} />
                  )}
                </button>
                <span className={subtask.completed ? (darkMode ? 'line-through text-white/50' : 'line-through text-slate-600') : ''}>
                  {subtask.text}
                </span>
              </div>
            ))}

            {showSubtaskInput ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSubtask()}
                  placeholder="Nova subtask..."
                  className={`flex-1 ${darkMode ? 'bg-white/5 border-white/20 text-white' : 'bg-white/30 border-white/40 text-slate-900'} border rounded px-2 py-1 text-sm`}
                  autoFocus
                />
                <button onClick={addSubtask} className="text-green-500">✓</button>
                <button onClick={() => setShowSubtaskInput(false)} className="text-red-500">✕</button>
              </div>
            ) : (
              <button
                onClick={() => setShowSubtaskInput(true)}
                className={`text-xs flex items-center gap-1 ${darkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'}`}
              >
                <Plus className="w-3 h-3" />
                Adicionar subtask
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// Programmer View
function ProgrammerView({ tasks, updateTask, deleteTask, darkMode }) {
  const sortedTasks = [...tasks]
    .filter(t => t.status !== 'done')
    .sort((a, b) => calculateImpact(b) - calculateImpact(a));

  return (
    <div className="space-y-3 max-w-5xl mx-auto w-full">
      <div className={`${darkMode ? 'bg-white/10 border-white/20' : 'bg-white/40 border-white/40'} backdrop-blur-lg rounded-xl p-4 border`}>
        <h3 className="text-lg font-bold mb-2">Atalhos</h3>
        <p className={`text-sm ${darkMode ? 'text-white/70' : 'text-slate-700'}`}>
          <kbd className={`${darkMode ? 'bg-white/10' : 'bg-white/40'} px-2 py-1 rounded`}>C</kbd> = Marcar como concluída
        </p>
      </div>

      {sortedTasks.map((task, idx) => (
        <div
          key={task.id}
          className={`${darkMode ? 'bg-white/10 border-white/20 hover:border-purple-500' : 'bg-white/40 border-white/40 hover:border-purple-400'} backdrop-blur-lg rounded-xl p-4 border transition ${isTaskOverdue(task) ? 'ring-2 ring-red-500' : ''}`}
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === 'c' || e.key === 'C') {
              updateTask({ ...task, status: 'done' });
            }
          }}
        >
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold text-purple-400">#{idx + 1}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`} />
                <span className="font-semibold text-lg">{task.title}</span>
                {isTaskOverdue(task) && <AlertTriangle className="w-4 h-4 text-red-500" />}
                {task.tag && <span className={`${darkMode ? 'bg-white/10' : 'bg-white/40'} px-2 py-1 rounded text-xs`}>{task.tag}</span>}
              </div>
              {isTaskOverdue(task) && <span className="text-xs text-red-500 font-bold">ATRASADA</span>}
              {task.description && (
                <p className={`text-sm ${darkMode ? 'text-white/70' : 'text-slate-700'}`}>{task.description}</p>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-yellow-400">{calculateImpact(task)}</div>
              <div className={`text-xs ${darkMode ? 'text-white/60' : 'text-slate-700'}`}>impacto</div>
            </div>
            <button
              onClick={() => deleteTask(task.id)}
              className={`p-2 ${darkMode ? 'hover:bg-red-500/20' : 'hover:bg-red-300/40'} rounded`}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Task Modal
function TaskModal({ task, onClose, onSave, projects, darkMode }) {
  const [formData, setFormData] = useState(task || {
    title: '',
    description: '',
    priority: 50,
    effort: 1,
    dueDate: '',
    tag: '',
    projectId: projects[0]?.id || '',
    status: 'backlog'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title.trim()) {
      onSave(formData);
    }
  };

  return (
    <div className={`fixed inset-0 ${darkMode ? 'bg-black/50' : 'bg-black/30'} backdrop-blur-sm flex items-center justify-center p-4 z-50`}>
      <div className={`${darkMode ? 'bg-slate-900 border-white/20' : 'bg-slate-100 border-white/60'} border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col`}>
        {/* Header com título */}
        <div className={`${darkMode ? 'bg-gradient-to-r from-purple-900 to-pink-900 border-b border-white/10' : 'bg-gradient-to-r from-purple-500 to-pink-500 border-b border-white/40'} px-6 py-4 flex items-center justify-between`}>
          <h2 className="text-2xl font-bold text-white">
            {task ? '✏️ Editar Task' : '➕ Nova Task'}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Conteúdo com scroll */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Título *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full ${darkMode ? 'bg-white/10 border-white/20 text-white placeholder-white/50' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-600'} border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500`}
              placeholder="Digite o título da task"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`w-full h-24 ${darkMode ? 'bg-white/10 border-white/20 text-white placeholder-white/50' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-600'} border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500`}
              placeholder="Digite a descrição da task"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Prioridade (0-100)</label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className={`text-sm mt-1 ${darkMode ? 'text-white/60' : 'text-slate-600'}`}>{formData.priority}</div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Esforço (horas)</label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={formData.effort}
                onChange={(e) => setFormData({ ...formData, effort: parseFloat(e.target.value) })}
                className={`w-full ${darkMode ? 'bg-white/10 border-white/20 text-white' : 'bg-white border-slate-300 text-slate-900'} border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Data de Vencimento</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className={`w-full ${darkMode ? 'bg-white/10 border-white/20 text-white' : 'bg-white border-slate-300 text-slate-900'} border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tag</label>
              <input
                type="text"
                value={formData.tag}
                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                className={`w-full ${darkMode ? 'bg-white/10 border-white/20 text-white placeholder-white/50' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-600'} border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                placeholder="ex: frontend, backend"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Projeto</label>
              <select
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                className={`w-full bg-purple-600 hover:bg-purple-700 text-white border border-purple-700 rounded-lg px-4 py-2 transition focus:outline-none focus:ring-2 focus:ring-purple-500`}
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className={`w-full bg-purple-600 hover:bg-purple-700 text-white border border-purple-700 rounded-lg px-4 py-2 transition focus:outline-none focus:ring-2 focus:ring-purple-500`}
              >
                <option value="backlog">Backlog</option>
                <option value="progress">Em Progresso</option>
                <option value="review">Revisão</option>
                <option value="done">Concluído</option>
              </select>
            </div>
          </div>
        </form>

        {/* Footer com botões */}
        <div className={`border-t ${darkMode ? 'border-white/10 bg-white/5' : 'border-slate-300 bg-slate-50'} px-6 py-4 flex gap-4`}>
          <button
            type="submit"
            onClick={handleSubmit}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg py-2 font-semibold transition text-white"
          >
            {task ? 'Atualizar' : 'Criar'} Task
          </button>
          <button
            type="button"
            onClick={onClose}
            className={`flex-1 ${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-300 hover:bg-slate-400'} rounded-lg py-2 font-semibold transition`}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// Flow Editor Modal
// FlowEditorModal - Centro Operacional do Projeto
function FlowEditorModal({ task, onClose, onSave, darkMode }) {
  const [projectTitle, setProjectTitle] = useState(task.title);
  const [editingTitle, setEditingTitle] = useState(false);
  const [projectStatus, setProjectStatus] = useState(task.flowData?.status || 'planejamento');
  
  const [nodes, setNodes] = useState(task.flowData?.nodes || [
    { id: '1', label: 'Início', status: 'todo' },
    { id: '2', label: 'Etapa 1', status: 'todo' }
  ]);
  const [connections, setConnections] = useState(task.flowData?.connections || [
    { from: '1', to: '2' }
  ]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [editingNodeId, setEditingNodeId] = useState(null);
  const [editingLabel, setEditingLabel] = useState('');

  const currentNode = nodes.find(n => n.id === selectedNode);

  const addNode = () => {
    const lastNode = nodes[nodes.length - 1];
    const newNode = {
      id: Date.now().toString(),
      label: `Etapa ${nodes.length}`,
      status: 'todo'
    };
    const newNodes = [...nodes, newNode];
    const newConnections = [...connections, { from: lastNode.id, to: newNode.id }];
    setNodes(newNodes);
    setConnections(newConnections);
    setSelectedNode(newNode.id);
  };

  const deleteNode = (id) => {
    if (id === '1') return;
    const newNodes = nodes.filter(n => n.id !== id);
    const newConnections = connections.filter(c => c.from !== id && c.to !== id);
    setNodes(newNodes);
    setConnections(newConnections);
    setSelectedNode(null);
  };

  const startEditingNode = (node) => {
    setEditingNodeId(node.id);
    setEditingLabel(node.label);
  };

  const saveNodeLabel = () => {
    if (editingLabel.trim()) {
      setNodes(nodes.map(n => n.id === editingNodeId ? { ...n, label: editingLabel } : n));
    }
    setEditingNodeId(null);
    setEditingLabel('');
  };

  const updateNodeStatus = (id, status) => {
    setNodes(nodes.map(n => n.id === id ? { ...n, status } : n));
  };

  const moveNode = (id, direction) => {
    const currentIndex = nodes.findIndex(n => n.id === id);
    if (direction === 'up' && currentIndex > 1) {
      const newNodes = [...nodes];
      [newNodes[currentIndex], newNodes[currentIndex - 1]] = [newNodes[currentIndex - 1], newNodes[currentIndex]];
      setNodes(newNodes);
    } else if (direction === 'down' && currentIndex < nodes.length - 1) {
      const newNodes = [...nodes];
      [newNodes[currentIndex], newNodes[currentIndex + 1]] = [newNodes[currentIndex + 1], newNodes[currentIndex]];
      setNodes(newNodes);
    }
  };

  const getNodeColor = (status) => {
    switch(status) {
      case 'done': return darkMode ? 'border-green-400 bg-green-600/80' : 'border-green-500 bg-green-500/80';
      case 'doing': return darkMode ? 'border-blue-400 bg-blue-600/80' : 'border-blue-500 bg-blue-500/80';
      default: return darkMode ? 'border-purple-500 bg-purple-900/60' : 'border-purple-400 bg-purple-400/60';
    }
  };

  const saveProject = () => {
    onSave({ 
      nodes, 
      connections, 
      status: projectStatus,
      lastActivity: new Date().toISOString()
    });
  };

  // Calcular posições em linha
  const nodeWidth = 180;
  const nodeHeight = 80;
  const horizontalSpacing = 220;
  const verticalCenter = 150;

  const completedSteps = nodes.filter(n => n.status === 'done').length;
  const progressPercentage = Math.round((completedSteps / nodes.length) * 100);

  return (
    <div className={`fixed inset-0 ${darkMode ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' : 'bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50'} flex flex-col z-50`}>
      {/* Header - Identidade do Projeto */}
      <div className={`${darkMode ? 'bg-black/30' : 'bg-white/40'} backdrop-blur-lg border-b ${darkMode ? 'border-white/10' : 'border-white/40'} px-6 py-4 flex items-center justify-between flex-shrink-0`}>
        <div className="flex-1">
          {editingTitle ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') setEditingTitle(false);
                }}
                onBlur={() => setEditingTitle(false)}
                className={`text-3xl font-bold bg-transparent border-b-2 ${darkMode ? 'border-purple-400 text-white' : 'border-purple-600 text-slate-900'} outline-none px-2`}
                autoFocus
              />
            </div>
          ) : (
            <h2 
              onClick={() => setEditingTitle(true)}
              className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition"
            >
              📁 {projectTitle}
            </h2>
          )}
          
          <div className="flex items-center gap-4 mt-2">
            <select
              value={projectStatus}
              onChange={(e) => setProjectStatus(e.target.value)}
              className={`text-sm ${darkMode ? 'bg-white/10 text-white border-white/20' : 'bg-white text-slate-900 border-slate-300'} border rounded px-3 py-1 font-medium`}
            >
              <option value="planejamento">🔵 Planejamento</option>
              <option value="ativo">🟢 Ativo</option>
              <option value="pausado">🟡 Pausado</option>
              <option value="concluido">✅ Concluído</option>
            </select>
            
            <span className={`text-sm ${darkMode ? 'text-white/70' : 'text-slate-700'}`}>
              {completedSteps}/{nodes.length} etapas • {progressPercentage}%
            </span>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className={`p-2 rounded-lg transition ${darkMode ? 'hover:bg-white/20' : 'hover:bg-white/40'}`}
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Content Area - Visão Operacional */}
      <div className="flex-1 overflow-hidden flex">
        {/* Canvas - Linha de Execução */}
        <div className="flex-1 overflow-auto relative p-8">
          {/* SVG para conexões */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ background: 'transparent' }}>
            {connections.map((conn, idx) => {
              const fromIndex = nodes.findIndex(n => n.id === conn.from);
              const toIndex = nodes.findIndex(n => n.id === conn.to);
              if (fromIndex === -1 || toIndex === -1) return null;

              const x1 = 32 + fromIndex * horizontalSpacing + nodeWidth / 2;
              const y1 = verticalCenter + nodeHeight / 2;
              const x2 = 32 + toIndex * horizontalSpacing + nodeWidth / 2;
              const y2 = verticalCenter + nodeHeight / 2;

              return (
                <g key={idx}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={darkMode ? '#a78bfa' : '#9333ea'}
                    strokeWidth="3"
                    markerEnd="url(#arrowhead)"
                  />
                </g>
              );
            })}
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill={darkMode ? '#a78bfa' : '#9333ea'} />
              </marker>
            </defs>
          </svg>

          {/* Nós - Etapas do Projeto */}
          <div className="relative" style={{ minHeight: '400px', minWidth: `${nodes.length * horizontalSpacing + 100}px` }}>
            {nodes.map((node, index) => {
              const nodeClasses = selectedNode === node.id
                ? `${darkMode ? 'border-yellow-400 bg-yellow-600/80' : 'border-yellow-500 bg-yellow-500/80'} shadow-lg scale-105`
                : `${getNodeColor(node.status)} hover:scale-105`;
              
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node.id)}
                  className={`absolute rounded-xl transition cursor-pointer flex items-center justify-center border-2 ${nodeClasses}`}
                  style={{
                    left: `${32 + index * horizontalSpacing}px`,
                    top: `${verticalCenter}px`,
                    width: `${nodeWidth}px`,
                    height: `${nodeHeight}px`,
                    zIndex: selectedNode === node.id ? 10 : 1
                  }}
                >
                  {editingNodeId === node.id ? (
                    <div className="flex items-center gap-2 w-full px-3">
                      <input
                        type="text"
                        value={editingLabel}
                        onChange={(e) => setEditingLabel(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && saveNodeLabel()}
                        className={`flex-1 px-2 py-1 rounded text-sm font-semibold ${darkMode ? 'bg-white/20 text-white' : 'bg-white/60 text-slate-900'}`}
                        autoFocus
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          saveNodeLabel();
                        }}
                        className="text-green-400 hover:text-green-300"
                      >
                        ✓
                      </button>
                    </div>
                  ) : (
                    <div className="text-center px-2 w-full">
                      <div
                        className="text-white font-semibold text-sm cursor-default hover:underline"
                        onDoubleClick={() => startEditingNode(node)}
                      >
                        {node.label}
                      </div>
                      <div className="text-xs text-white/70 mt-1">
                        {node.status === 'done' && '✅ Concluída'}
                        {node.status === 'doing' && '⚡ Em progresso'}
                        {node.status === 'todo' && '📋 Planejada'}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar - Ações do Projeto */}
        <div className={`${darkMode ? 'bg-white/5 border-l border-white/10' : 'bg-white/30 border-l border-white/40'} w-80 p-6 overflow-y-auto flex flex-col gap-6`}>
          <div>
            <h3 className="text-lg font-bold mb-4">⚙️ Ações do Projeto</h3>
            <div className="space-y-2">
              <button
                onClick={addNode}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Nova Etapa
              </button>
              
              <button
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
              >
                🤖 Sugerir Próximo Passo
              </button>
              
              <button
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2"
              >
                📎 Anexar Arquivo
              </button>
              
              <button
                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2"
              >
                🏷️ Gerenciar Tags
              </button>
            </div>
          </div>

          {selectedNode && currentNode && (
            <div className={`rounded-lg p-4 ${darkMode ? 'bg-white/10 border border-white/20' : 'bg-white/40 border border-white/40'}`}>
              <h4 className="font-bold mb-3 flex items-center gap-2">
                🧩 Etapa Selecionada
              </h4>
              <p className="font-semibold mb-3">{currentNode.label}</p>
              
              <div className="space-y-2 mb-4">
                <label className="text-xs font-medium block">Status da Etapa</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateNodeStatus(selectedNode, 'todo')}
                    className={`flex-1 py-2 rounded text-xs font-bold transition ${currentNode.status === 'todo' ? 'bg-purple-600 text-white' : (darkMode ? 'bg-white/10 text-white/70' : 'bg-white/30 text-slate-700')}`}
                  >
                    📋 Pendente
                  </button>
                  <button
                    onClick={() => updateNodeStatus(selectedNode, 'doing')}
                    className={`flex-1 py-2 rounded text-xs font-bold transition ${currentNode.status === 'doing' ? 'bg-blue-600 text-white' : (darkMode ? 'bg-white/10 text-white/70' : 'bg-white/30 text-slate-700')}`}
                  >
                    ⚡ Fazendo
                  </button>
                  <button
                    onClick={() => updateNodeStatus(selectedNode, 'done')}
                    className={`flex-1 py-2 rounded text-xs font-bold transition ${currentNode.status === 'done' ? 'bg-green-600 text-white' : (darkMode ? 'bg-white/10 text-white/70' : 'bg-white/30 text-slate-700')}`}
                  >
                    ✅ Pronto
                  </button>
                </div>
              </div>

              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 font-semibold transition flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />
                Criar Tarefa Vinculada
              </button>

              {selectedNode !== '1' && (
                <button
                  onClick={() => deleteNode(selectedNode)}
                  className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition"
                >
                  🗑️ Deletar Etapa
                </button>
              )}
            </div>
          )}

          <div>
            <h3 className="text-lg font-bold mb-4">📋 Etapas do Projeto ({nodes.length})</h3>
            <div className={`space-y-2 ${darkMode ? 'bg-white/10' : 'bg-white/40'} rounded-lg p-3 max-h-96 overflow-y-auto`}>
              {nodes.map((node, index) => {
                const isSelected = selectedNode === node.id;
                const itemClasses = isSelected
                  ? `${darkMode ? 'bg-yellow-600/80 shadow-lg' : 'bg-yellow-500/80 shadow-lg'}`
                  : `${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-white/40 hover:bg-white/60'}`;
                
                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNode(node.id)}
                    className={`p-3 rounded-lg cursor-pointer transition ${itemClasses}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1">
                        <span className="font-semibold text-sm">{index + 1}. {node.label}</span>
                        <div className="text-xs mt-1 opacity-70">
                          {node.status === 'done' && '✅ Concluída'}
                          {node.status === 'doing' && '⚡ Em progresso'}
                          {node.status === 'todo' && '📋 Planejada'}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {index > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveNode(node.id, 'up');
                            }}
                            className="text-xs p-1 hover:bg-white/20 rounded"
                            title="Mover para cima"
                          >
                            ↑
                          </button>
                        )}
                        {index < nodes.length - 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveNode(node.id, 'down');
                            }}
                            className="text-xs p-1 hover:bg-white/20 rounded"
                            title="Mover para baixo"
                          >
                            ↓
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={`${darkMode ? 'bg-white/10' : 'bg-white/40'} rounded-lg p-4`}>
            <h4 className="font-bold mb-2">📊 Progresso Geral</h4>
            <div className={`${darkMode ? 'bg-white/5' : 'bg-white/30'} rounded-full h-4 overflow-hidden mb-2`}>
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="text-center font-bold text-lg">{progressPercentage}%</div>
          </div>

          <div className={`text-xs ${darkMode ? 'text-white/60' : 'text-slate-700'} space-y-2`}>
            <p><strong>💡 Dicas:</strong></p>
            <p>• Clique duplo no bloco para editar o nome</p>
            <p>• Use os botões ↑↓ para reordenar etapas</p>
            <p>• Clique na etapa para ver opções</p>
            <p>• Altere o status para acompanhar progresso</p>
          </div>
        </div>
      </div>

      {/* Footer com botões de ação */}
      <div className={`${darkMode ? 'bg-black/30 border-t border-white/10' : 'bg-white/40 border-t border-white/40'} backdrop-blur-lg px-6 py-4 flex gap-4 flex-shrink-0`}>
        <button
          onClick={saveProject}
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-lg transition shadow-lg flex items-center justify-center gap-2"
        >
          💾 Salvar Projeto
        </button>
        <button
          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 rounded-lg transition shadow-lg flex items-center justify-center gap-2"
        >
          📂 Abrir Projeto Completo
        </button>
        <button
          onClick={onClose}
          className={`px-6 ${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-white/40 hover:bg-white/60'} font-bold py-3 rounded-lg transition flex items-center justify-center gap-2`}
        >
          ✕ Fechar
        </button>
      </div>
    </div>
  );
}

// Template Modal
// Template Modal
function TemplateModal({ onClose, onSelectTemplate, darkMode }) {
  return (
    <div className={`fixed inset-0 ${darkMode ? 'bg-black/50' : 'bg-black/30'} backdrop-blur-sm flex items-center justify-center p-4 z-50`}>
      <div className={`${darkMode ? 'bg-slate-900 border-white/20' : 'bg-slate-100 border-white/60'} border rounded-2xl w-full max-w-3xl overflow-hidden flex flex-col`}>
        {/* Header */}
        <div className={`${darkMode ? 'bg-gradient-to-r from-purple-900 to-pink-900 border-b border-white/10' : 'bg-gradient-to-r from-purple-500 to-pink-500 border-b border-white/40'} px-6 py-4 flex items-center justify-between`}>
          <h2 className="text-2xl font-bold text-white">📋 Selecione um Template</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {PROJECT_TEMPLATES.map((template, idx) => (
              <div
                key={idx}
                onClick={() => onSelectTemplate(template.tasks, template.name)}
                className={`${darkMode ? 'bg-white/10 border-white/20 hover:bg-white/20 cursor-pointer' : 'bg-white border-slate-300 hover:bg-slate-50 cursor-pointer'} border rounded-xl p-6 transition`}
              >
                <div className="text-4xl mb-2">{template.icon}</div>
                <h3 className="font-bold text-lg mb-2">{template.name}</h3>
                <p className={`text-sm ${darkMode ? 'text-white/70' : 'text-slate-700'} mb-3`}>
                  {template.description}
                </p>
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded font-semibold transition">
                  Usar Template
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className={`border-t ${darkMode ? 'border-white/10 bg-white/5' : 'border-slate-300 bg-slate-50'} px-6 py-4`}>
          <button
            onClick={onClose}
            className={`w-full ${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-300 hover:bg-slate-400'} rounded-lg py-2 font-semibold transition`}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// Delete Confirmation Modal
function DeleteConfirmModal({ task, onConfirm, onCancel, darkMode }) {
  return (
    <div className={`fixed inset-0 ${darkMode ? 'bg-black/50' : 'bg-black/30'} backdrop-blur-sm flex items-center justify-center p-4 z-50`}>
      <div className={`${darkMode ? 'bg-slate-800 border-white/20' : 'bg-white border-slate-200'} rounded-2xl border p-6 max-w-sm w-full shadow-2xl`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-red-500/20 p-3 rounded-full">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <h2 className="text-xl font-bold">Deletar Tarefa?</h2>
        </div>
        
        <p className={`${darkMode ? 'text-white/70' : 'text-slate-700'} mb-2`}>
          Tem certeza que deseja deletar a tarefa:
        </p>
        
        <div className={`${darkMode ? 'bg-white/10' : 'bg-slate-100'} rounded-lg p-3 mb-6 border ${darkMode ? 'border-white/20' : 'border-slate-200'}`}>
          <p className="font-semibold">{task.title}</p>
          {task.description && (
            <p className={`text-sm ${darkMode ? 'text-white/60' : 'text-slate-600'} mt-1`}>{task.description}</p>
          )}
        </div>
        
        <p className={`text-sm ${darkMode ? 'text-red-400/80' : 'text-red-600'} mb-6 font-semibold`}>
          ⚠️ Esta ação é irreversível!
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className={`flex-1 ${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-200 hover:bg-slate-300'} rounded-lg py-2 font-semibold transition`}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-lg py-2 font-semibold transition"
          >
            Deletar
          </button>
        </div>
      </div>
    </div>
  );
}