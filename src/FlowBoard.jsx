import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Calendar, Zap, BarChart3, CheckCircle2, Circle, ChevronDown, ChevronUp, Download, Upload } from 'lucide-react';

// IndexedDB Manager
const DB_NAME = 'FlowBoardDB';
const DB_VERSION = 1;

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

  async getAllProjects() {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['projects'], 'readonly');
      const store = tx.objectStore('projects');
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
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

const getPriorityColor = (priority) => {
  if (priority >= 80) return 'bg-red-500';
  if (priority >= 60) return 'bg-orange-500';
  if (priority >= 40) return 'bg-yellow-500';
  return 'bg-green-500';
};

// Componente Principal
export default function FlowBoard() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState('all');
  const [view, setView] = useState('kanban'); // kanban, dashboard, programmer
  const [showNewTask, setShowNewTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [dbReady, setDbReady] = useState(false);

  // Inicializar DB
  useEffect(() => {
    dbManager.init().then(async () => {
      const loadedTasks = await dbManager.getAllTasks();
      const loadedProjects = await dbManager.getAllProjects();
      
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

  const updateTask = async (updatedTask) => {
    await dbManager.updateTask(updatedTask);
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    setEditingTask(null);
  };

  const deleteTask = async (id) => {
    await dbManager.deleteTask(id);
    setTasks(tasks.filter(t => t.id !== id));
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

  const filteredTasks = currentProject === 'all' 
    ? tasks 
    : tasks.filter(t => t.projectId === currentProject);

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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl animate-pulse">Inicializando FlowBoard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-lg border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              ⚡ FlowBoard Offline
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => setView('kanban')}
                className={`px-4 py-2 rounded-lg transition ${view === 'kanban' ? 'bg-purple-600' : 'bg-white/10 hover:bg-white/20'}`}
              >
                Kanban
              </button>
              <button
                onClick={() => setView('dashboard')}
                className={`px-4 py-2 rounded-lg transition ${view === 'dashboard' ? 'bg-purple-600' : 'bg-white/10 hover:bg-white/20'}`}
              >
                <BarChart3 className="w-5 h-5 inline mr-1" />
                Dashboard
              </button>
              <button
                onClick={() => setView('programmer')}
                className={`px-4 py-2 rounded-lg transition ${view === 'programmer' ? 'bg-purple-600' : 'bg-white/10 hover:bg-white/20'}`}
              >
                Programador
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={currentProject}
              onChange={(e) => setCurrentProject(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2"
            >
              <option value="all">Todos os Projetos</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            
            <button onClick={exportData} className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition">
              <Download className="w-5 h-5" />
            </button>
            
            <label className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition cursor-pointer">
              <Upload className="w-5 h-5" />
              <input type="file" accept=".json" onChange={importData} className="hidden" />
            </label>
            
            <button
              onClick={() => setShowNewTask(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nova Task
            </button>
          </div>
        </div>
      </header>

      {/* Views */}
      <main className="max-w-7xl mx-auto p-6">
        {view === 'dashboard' && <DashboardView stats={stats} tasks={filteredTasks} />}
        {view === 'kanban' && (
          <KanbanView 
            tasks={filteredTasks} 
            moveTask={moveTask} 
            updateTask={updateTask}
            deleteTask={deleteTask}
            toggleSubtask={toggleSubtask}
            setEditingTask={setEditingTask}
          />
        )}
        {view === 'programmer' && (
          <ProgrammerView 
            tasks={filteredTasks} 
            updateTask={updateTask}
            deleteTask={deleteTask}
          />
        )}
      </main>

      {/* Modals */}
      {showNewTask && (
        <TaskModal
          onClose={() => setShowNewTask(false)}
          onSave={addTask}
          projects={projects}
        />
      )}
      
      {editingTask && (
        <TaskModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={updateTask}
          projects={projects}
        />
      )}
    </div>
  );
}

// Dashboard View
function DashboardView({ stats, tasks }) {
  const highPriorityTasks = tasks
    .filter(t => t.status !== 'done')
    .map(t => ({ ...t, impact: calculateImpact(t) }))
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard title="Total" value={stats.total} color="purple" />
        <StatCard title="Backlog" value={stats.backlog} color="gray" />
        <StatCard title="Em Progresso" value={stats.progress} color="blue" />
        <StatCard title="Revisão" value={stats.review} color="yellow" />
        <StatCard title="Concluído" value={stats.done} color="green" />
      </div>

      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold mb-4">Taxa de Conclusão</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-white/5 rounded-full h-8 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-full transition-all duration-500 flex items-center justify-center text-sm font-bold"
              style={{ width: `${stats.completion}%` }}
            >
              {stats.completion > 10 && `${stats.completion}%`}
            </div>
          </div>
          <span className="text-3xl font-bold">{stats.completion}%</span>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Zap className="w-6 h-6 text-yellow-400" />
          Top 5 - Maior Impacto
        </h3>
        <div className="space-y-3">
          {highPriorityTasks.map((task, idx) => (
            <div key={task.id} className="flex items-center gap-4 bg-white/5 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">#{idx + 1}</div>
              <div className="flex-1">
                <div className="font-semibold">{task.title}</div>
                <div className="text-sm text-white/60">{task.tag}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-yellow-400">{task.impact}</div>
                <div className="text-xs text-white/60">impacto</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color }) {
  const colors = {
    purple: 'from-purple-600 to-purple-800',
    gray: 'from-gray-600 to-gray-800',
    blue: 'from-blue-600 to-blue-800',
    yellow: 'from-yellow-600 to-yellow-800',
    green: 'from-green-600 to-green-800'
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-2xl p-6 border border-white/20`}>
      <div className="text-white/80 text-sm mb-2">{title}</div>
      <div className="text-4xl font-bold">{value}</div>
    </div>
  );
}

// Kanban View
function KanbanView({ tasks, moveTask, updateTask, deleteTask, toggleSubtask, setEditingTask }) {
  const columns = [
    { id: 'backlog', title: 'Backlog', color: 'gray' },
    { id: 'progress', title: 'Em Progresso', color: 'blue' },
    { id: 'review', title: 'Revisão', color: 'yellow' },
    { id: 'done', title: 'Concluído', color: 'green' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {columns.map(column => (
        <KanbanColumn
          key={column.id}
          column={column}
          tasks={tasks.filter(t => t.status === column.id)}
          moveTask={moveTask}
          updateTask={updateTask}
          deleteTask={deleteTask}
          toggleSubtask={toggleSubtask}
          setEditingTask={setEditingTask}
        />
      ))}
    </div>
  );
}

function KanbanColumn({ column, tasks, moveTask, updateTask, deleteTask, toggleSubtask, setEditingTask }) {
  const [draggedOver, setDraggedOver] = useState(false);

  return (
    <div 
      className={`bg-white/5 backdrop-blur-lg rounded-2xl p-4 border-2 transition ${
        draggedOver ? 'border-purple-500 bg-white/10' : 'border-white/10'
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
      <h3 className="font-bold text-lg mb-4 flex items-center justify-between">
        <span>{column.title}</span>
        <span className="bg-white/10 px-2 py-1 rounded-full text-sm">{tasks.length}</span>
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
          />
        ))}
      </div>
    </div>
  );
}

function TaskCard({ task, updateTask, deleteTask, toggleSubtask, setEditingTask }) {
  const [expanded, setExpanded] = useState(false);
  const [showSubtaskInput, setShowSubtaskInput] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');

  const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

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
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData('taskId', task.id)}
      className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 hover:border-purple-500 transition cursor-move"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)} inline-block mr-2`} />
          <span className="font-semibold">{task.title}</span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setEditingTask(task)}
            className="p-1 hover:bg-white/10 rounded"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => deleteTask(task.id)}
            className="p-1 hover:bg-red-500/20 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 hover:bg-white/10 rounded"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-sm text-white/70 mb-2">{task.description}</p>
      )}

      <div className="flex items-center gap-2 text-xs text-white/60 mb-2">
        {task.tag && <span className="bg-white/10 px-2 py-1 rounded">{task.tag}</span>}
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
          <div className="flex items-center justify-between text-xs mb-1">
            <span>{completedSubtasks}/{totalSubtasks} subtasks</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="bg-white/5 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {expanded && (
        <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
          {task.subtasks?.map((subtask, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm">
              <button
                onClick={() => toggleSubtask(task.id, idx)}
                className="flex-shrink-0"
              >
                {subtask.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <Circle className="w-4 h-4 text-white/40" />
                )}
              </button>
              <span className={subtask.completed ? 'line-through text-white/50' : ''}>
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
                className="flex-1 bg-white/5 border border-white/20 rounded px-2 py-1 text-sm"
                autoFocus
              />
              <button onClick={addSubtask} className="text-green-500">✓</button>
              <button onClick={() => setShowSubtaskInput(false)} className="text-red-500">✕</button>
            </div>
          ) : (
            <button
              onClick={() => setShowSubtaskInput(true)}
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              Adicionar subtask
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Programmer View
function ProgrammerView({ tasks, updateTask, deleteTask }) {
  const sortedTasks = [...tasks]
    .filter(t => t.status !== 'done')
    .sort((a, b) => calculateImpact(b) - calculateImpact(a));

  return (
    <div className="space-y-3">
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
        <h3 className="text-lg font-bold mb-2">Atalhos</h3>
        <p className="text-sm text-white/70">
          <kbd className="bg-white/10 px-2 py-1 rounded">C</kbd> = Marcar como concluída
        </p>
      </div>

      {sortedTasks.map((task, idx) => (
        <div
          key={task.id}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 hover:border-purple-500 transition"
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
                {task.tag && <span className="bg-white/10 px-2 py-1 rounded text-xs">{task.tag}</span>}
              </div>
              {task.description && (
                <p className="text-sm text-white/70">{task.description}</p>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-yellow-400">{calculateImpact(task)}</div>
              <div className="text-xs text-white/60">impacto</div>
            </div>
            <button
              onClick={() => deleteTask(task.id)}
              className="p-2 hover:bg-red-500/20 rounded"
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
function TaskModal({ task, onClose, onSave, projects }) {
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-white/20 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">
          {task ? 'Editar Task' : 'Nova Task'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Título *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
              placeholder="Digite o título da task"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 h-24 text-white placeholder-white/50"
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
              <div className="text-sm text-white/60 mt-1">{formData.priority}</div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Esforço (horas)</label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={formData.effort}
                onChange={(e) => setFormData({ ...formData, effort: parseFloat(e.target.value) })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
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
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tag</label>
              <input
                type="text"
                value={formData.tag}
                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
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
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
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
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
              >
                <option value="backlog">Backlog</option>
                <option value="progress">Em Progresso</option>
                <option value="review">Revisão</option>
                <option value="done">Concluído</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-white/10">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg py-2 font-semibold transition"
            >
              {task ? 'Atualizar' : 'Criar'} Task
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/10 hover:bg-white/20 rounded-lg py-2 font-semibold transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
