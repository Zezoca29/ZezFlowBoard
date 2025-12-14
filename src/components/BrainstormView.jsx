import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Star, ArrowRight, Lightbulb, Check } from 'lucide-react';

// IndexedDB Manager para Brainstorming
class BrainstormDBManager {
  constructor() {
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('FlowBoardDB', 2);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('brainstorm')) {
          const store = db.createObjectStore('brainstorm', { keyPath: 'id' });
          store.createIndex('category', 'category', { unique: false });
        }
      };
    });
  }

  async getAllIdeas() {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['brainstorm'], 'readonly');
      const store = tx.objectStore('brainstorm');
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async addIdea(idea) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    const tx = this.db.transaction(['brainstorm'], 'readwrite');
    const store = tx.objectStore('brainstorm');
    return new Promise((resolve, reject) => {
      const request = store.add(idea);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async updateIdea(idea) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    const tx = this.db.transaction(['brainstorm'], 'readwrite');
    const store = tx.objectStore('brainstorm');
    return new Promise((resolve, reject) => {
      const request = store.put(idea);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async deleteIdea(id) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    const tx = this.db.transaction(['brainstorm'], 'readwrite');
    const store = tx.objectStore('brainstorm');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async clearAll() {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    const tx = this.db.transaction(['brainstorm'], 'readwrite');
    const store = tx.objectStore('brainstorm');
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }
}

const brainstormDB = new BrainstormDBManager();

export default function BrainstormCanvas({ onCreateTask }) {
  const [ideas, setIdeas] = useState([]);
  const [newIdeaText, setNewIdeaText] = useState('');
  const [newIdeaDesc, setNewIdeaDesc] = useState('');
  const [selectedColor, setSelectedColor] = useState('purple');
  const [selectedCategory, setSelectedCategory] = useState('Ideias');
  const [draggedIdea, setDraggedIdea] = useState(null);
  const [mode, setMode] = useState('canvas');
  const [createdIdeas, setCreatedIdeas] = useState(new Set());
  const [notification, setNotification] = useState(null);
  const [dbReady, setDbReady] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryValue, setEditingCategoryValue] = useState('');

  const categories = ['Ideias', 'UI/UX', 'Dashboard', 'Features', 'Performance', 'Segurança', 'Outro'];

  // Inicializar DB e carregar ideias
  useEffect(() => {
    const initDB = async () => {
      try {
        await brainstormDB.init();
        const loadedIdeas = await brainstormDB.getAllIdeas();
        
        if (loadedIdeas && loadedIdeas.length > 0) {
          // Carregar ideias salvadas do banco
          setIdeas(loadedIdeas);
        } else {
          // Ideas padrão se DB estiver vazio
          const defaultIdeas = [
            { id: '1', text: 'Implementar modo escuro', description: 'Sistema visual alternativo para ambientes noturnos', x: 100, y: 100, color: 'purple', votes: 3, category: 'UI/UX' },
            { id: '2', text: 'Adicionar gráficos avançados', description: 'Visualizações mais complexas e interativas para análise', x: 300, y: 150, color: 'blue', votes: 5, category: 'Dashboard' },
            { id: '3', text: 'Sistema de notificações', description: 'Alertas em tempo real para eventos importantes', x: 500, y: 100, color: 'pink', votes: 2, category: 'Features' }
          ];
          
          setIdeas(defaultIdeas);
          // Salvar ideias padrão no banco
          for (const idea of defaultIdeas) {
            try {
              await brainstormDB.addIdea(idea);
            } catch (err) {
              // ID duplicada, usar put para atualizar
              await brainstormDB.updateIdea(idea);
            }
          }
        }
        setDbReady(true);
      } catch (error) {
        console.error('Erro ao inicializar DB:', error);
        // Still set dbReady to true so the app can function even without DB
        setDbReady(true);
      }
    };
    initDB();
  }, []);

  // Salvar ideias quando mudam
  useEffect(() => {
    if (!dbReady) return;
    
    const saveIdeas = async () => {
      try {
        // Instead of clearing all and re-adding, we'll update each idea individually
        // This is more efficient and avoids potential race conditions
        for (const idea of ideas) {
          try {
            await brainstormDB.updateIdea(idea);
          } catch (err) {
            // If update fails, try adding (in case it's a new idea not yet in DB)
            await brainstormDB.addIdea(idea);
          }
        }
      } catch (error) {
        console.error('Erro ao salvar ideias:', error);
      }
    };
    
    const timer = setTimeout(saveIdeas, 500);
    return () => clearTimeout(timer);
  }, [ideas, dbReady]);

  const colors = {
    purple: { bg: 'bg-purple-600', text: 'text-white', light: 'bg-purple-500', hover: 'hover:bg-purple-700' },
    blue: { bg: 'bg-blue-600', text: 'text-white', light: 'bg-blue-500', hover: 'hover:bg-blue-700' },
    pink: { bg: 'bg-pink-600', text: 'text-white', light: 'bg-pink-500', hover: 'hover:bg-pink-700' },
    green: { bg: 'bg-green-600', text: 'text-white', light: 'bg-green-500', hover: 'hover:bg-green-700' },
    amber: { bg: 'bg-amber-600', text: 'text-white', light: 'bg-amber-500', hover: 'hover:bg-amber-700' },
    cyan: { bg: 'bg-cyan-600', text: 'text-white', light: 'bg-cyan-500', hover: 'hover:bg-cyan-700' }
  };

  const addIdea = async () => {
    if (newIdeaText.trim()) {
      const newIdea = {
        id: Date.now().toString(),
        text: newIdeaText,
        description: newIdeaDesc,
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100,
        color: selectedColor,
        votes: 0,
        category: selectedCategory
      };
      
      const updatedIdeas = [...ideas, newIdea];
      setIdeas(updatedIdeas);
      
      // Save to DB immediately
      if (dbReady) {
        try {
          await brainstormDB.addIdea(newIdea);
        } catch (error) {
          console.error('Erro ao adicionar ideia:', error);
        }
      }
      
      setNewIdeaText('');
      setNewIdeaDesc('');
    }
  };

  const updateIdeaCategory = async (id, newCategory) => {
    const updatedIdeas = ideas.map(i => i.id === id ? { ...i, category: newCategory } : i);
    setIdeas(updatedIdeas);
    setEditingCategoryId(null);
    
    // Save to DB immediately
    if (dbReady) {
      const idea = updatedIdeas.find(i => i.id === id);
      if (idea) {
        try {
          await brainstormDB.updateIdea(idea);
        } catch (error) {
          console.error('Erro ao atualizar categoria da ideia:', error);
        }
      }
    }
  };

  const deleteIdea = async (id) => {
    const updatedIdeas = ideas.filter(i => i.id !== id);
    setIdeas(updatedIdeas);
    setCreatedIdeas(new Set([...createdIdeas].filter(i => i !== id)));
    
    // Delete from DB immediately
    if (dbReady) {
      try {
        await brainstormDB.deleteIdea(id);
      } catch (error) {
        console.error('Erro ao deletar ideia:', error);
      }
    }
  };

  const voteIdea = async (id) => {
    const updatedIdeas = ideas.map(i => i.id === id ? { ...i, votes: i.votes + 1 } : i);
    setIdeas(updatedIdeas);
    
    // Save to DB immediately
    if (dbReady) {
      const idea = updatedIdeas.find(i => i.id === id);
      if (idea) {
        try {
          await brainstormDB.updateIdea(idea);
        } catch (error) {
          console.error('Erro ao votar na ideia:', error);
        }
      }
    }
  };

  const convertToTask = (idea) => {
    if (onCreateTask) {
      onCreateTask({
        title: idea.text,
        description: idea.description || '',
        tag: idea.category,
        priority: Math.min(100, 50 + (idea.votes * 5)),
        status: 'backlog',
        projectId: 'personal',
        effort: Math.max(1, Math.ceil((idea.votes + 1) / 2))
      });
      setCreatedIdeas(new Set([...createdIdeas, idea.id]));
      
      // Show notification
      setNotification(`✅ Task "${idea.text}" criada no backlog!`);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleDragStart = (idea) => {
    setDraggedIdea(idea);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    if (draggedIdea && mode === 'canvas') {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const updatedIdeas = ideas.map(i => 
        i.id === draggedIdea.id ? { ...i, x, y } : i
      );
      setIdeas(updatedIdeas);
      
      // Save position to DB immediately
      if (dbReady) {
        const idea = updatedIdeas.find(i => i.id === draggedIdea.id);
        if (idea) {
          try {
            await brainstormDB.updateIdea(idea);
          } catch (error) {
            console.error('Erro ao atualizar posição da ideia:', error);
          }
        }
      }
    }
    setDraggedIdea(null);
  };

  const categorizedIdeas = ideas.reduce((acc, idea) => {
    if (!acc[idea.category]) acc[idea.category] = [];
    acc[idea.category].push(idea);
    return acc;
  }, {});

  const sortedByVotes = [...ideas].sort((a, b) => b.votes - a.votes);

  return (
    <>
      {!dbReady ? (
        <div className="h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4 animate-spin">⚡</div>
            <p className="text-white text-lg font-semibold">Carregando Brainstorm...</p>
          </div>
        </div>
      ) : (
        <div className="h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
          {/* Notification Toast */}
          {notification && (
            <div className="fixed top-4 right-4 z-50 animate-pulse">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-lg shadow-lg border border-green-400/50 backdrop-blur-sm flex items-center gap-3 font-semibold">
                <span className="text-2xl">✅</span>
                {notification}
              </div>
            </div>
          )}
          
          {/* Header */}
          <div className="bg-black/40 backdrop-blur-lg border-b border-purple-500/30 p-4 shadow-lg">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
                  <Lightbulb className="w-8 h-8 text-yellow-400" />
                  💭 Brainstorm Canvas
                </h1>
                
                {/* Mode Selector */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setMode('canvas')}
                    className={`px-4 py-2 rounded-lg transition font-semibold ${mode === 'canvas' ? 'bg-purple-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                  >
                    🎨 Canvas
                  </button>
                  <button
                    onClick={() => setMode('voting')}
                    className={`px-4 py-2 rounded-lg transition font-semibold ${mode === 'voting' ? 'bg-purple-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                  >
                    ⭐ Votação
                  </button>
                  <button
                    onClick={() => setMode('categorized')}
                    className={`px-4 py-2 rounded-lg transition font-semibold ${mode === 'categorized' ? 'bg-purple-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                  >
                    📂 Categorias
                  </button>
                </div>
              </div>

              {/* Add Idea Form */}
              <div className="space-y-3">
                <input
                  type="text"
                  value={newIdeaText}
                  onChange={(e) => setNewIdeaText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addIdea()}
                  placeholder="Digite uma nova ideia..."
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                
                <textarea
                  value={newIdeaDesc}
                  onChange={(e) => setNewIdeaDesc(e.target.value)}
                  placeholder="Descrição detalhada (opcional)..."
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows="2"
                />
                
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-white/10 border border-white/20 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat} className="bg-slate-900 text-white">{cat}</option>
                  ))}
                </select>
                
                {/* Color Picker e Botão */}
                <div className="flex gap-3 items-center">
                  <div className="flex gap-2">
                    {Object.keys(colors).map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-10 h-10 rounded-full transition transform hover:scale-110 ${colors[color].light} ${selectedColor === color ? 'ring-4 ring-white shadow-lg' : 'opacity-70 hover:opacity-100'}`}
                        title={color}
                      />
                    ))}
                  </div>

                  <button
                    onClick={addIdea}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition flex items-center gap-2 font-semibold ml-auto"
                  >
                    <Plus className="w-5 h-5" />
                    Adicionar Ideia
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-hidden">
            {mode === 'canvas' && (
          <div
            className="w-full h-full relative bg-gradient-to-br from-slate-800/50 to-purple-900/50"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {/* Grid Background */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'radial-gradient(circle, #a78bfa 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }} />

            {/* Ideas */}
            {ideas.map(idea => (
              <div
                key={idea.id}
                draggable
                onDragStart={() => handleDragStart(idea)}
                className={`absolute ${colors[idea.color].bg} shadow-xl rounded-lg p-5 cursor-move transition hover:scale-105 hover:shadow-2xl border-2 border-white/20 backdrop-blur-sm ${createdIdeas.has(idea.id) ? 'opacity-60' : ''}`}
                style={{
                  left: `${idea.x}px`,
                  top: `${idea.y}px`,
                  width: '240px',
                  minHeight: '140px'
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  {editingCategoryId === idea.id ? (
                    <select
                      value={editingCategoryValue}
                      onChange={(e) => updateIdeaCategory(idea.id, e.target.value)}
                      onBlur={() => setEditingCategoryId(null)}
                      autoFocus
                      className="text-xs px-2 py-1 rounded bg-white/20 text-white border border-white/50"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat} className="bg-slate-900 text-white">{cat}</option>
                      ))}
                    </select>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingCategoryId(idea.id);
                        setEditingCategoryValue(idea.category);
                      }}
                      className="text-xs font-bold text-white/80 bg-white/10 px-2 py-1 rounded hover:bg-white/20 transition cursor-pointer"
                      title="Clique para editar categoria"
                    >
                      {idea.category}
                    </button>
                  )}
                  <div className="flex gap-1">
                    {createdIdeas.has(idea.id) && (
                      <div className="text-green-300 bg-green-500/20 px-2 py-1 rounded" title="Convertida para Task">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                    <button
                      onClick={() => deleteIdea(idea.id)}
                      className="text-red-200 hover:text-red-100 transition bg-red-500/20 hover:bg-red-500/40 p-1 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-white font-semibold mb-2 leading-tight text-sm">{idea.text}</p>
                {idea.description && (
                  <p className="text-white/70 text-xs mb-3 leading-tight line-clamp-3">{idea.description}</p>
                )}
                
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => voteIdea(idea.id)}
                    className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition text-white text-xs font-semibold"
                  >
                    <Star className="w-4 h-4" fill="currentColor" />
                    <span>{idea.votes}</span>
                  </button>
                  
                  <button 
                    onClick={() => convertToTask(idea)}
                    className={`text-white text-xs font-semibold px-2 py-1 rounded transition ${createdIdeas.has(idea.id) ? 'bg-green-500/30' : 'bg-white/20 hover:bg-white/30'}`}
                    title={createdIdeas.has(idea.id) ? 'Task já criada' : 'Converter para Task'}
                  >
                    {createdIdeas.has(idea.id) ? '✓ Task' : '→ Task'}
                  </button>
                </div>
              </div>
            ))}

            {/* Instructions */}
            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-purple-500/50 max-w-xs">
              <h3 className="font-bold text-purple-300 mb-2">💡 Como usar:</h3>
              <ul className="text-xs text-white/70 space-y-1">
                <li>• Arraste os post-its pelo canvas</li>
                <li>• Vote nas melhores ideias ⭐</li>
                <li>• Converta em tasks com 1 clique</li>
                <li>• Escolha cores para organizar</li>
                <li>• Clique na categoria para editar</li>
                <li>• Adicione descrições detalhadas</li>
              </ul>
            </div>
          </div>
            )}

            {mode === 'voting' && (
          <div className="p-8 overflow-y-auto h-full bg-gradient-to-br from-slate-900 to-slate-800">
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 backdrop-blur-lg rounded-xl p-6 border border-purple-500/50 mb-6">
                <h2 className="text-3xl font-bold text-white mb-2">🏆 Ranking de Ideias</h2>
                <p className="text-white/70">Vote nas melhores ideias para priorizá-las!</p>
              </div>

              {sortedByVotes.map((idea, index) => (
                <div
                  key={idea.id}
                  className={`${colors[idea.color].bg} backdrop-blur-lg rounded-xl p-6 border-2 border-white/20 hover:border-white/40 transition shadow-lg hover:shadow-xl ${createdIdeas.has(idea.id) ? 'opacity-70' : ''}`}
                >
                  <div className="flex items-center gap-6">
                    {/* Rank */}
                    <div className="flex-shrink-0">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl text-white ${
                        index === 0 ? 'bg-yellow-500/40 border-2 border-yellow-400 shadow-lg' :
                        index === 1 ? 'bg-gray-400/40 border-2 border-gray-300' :
                        index === 2 ? 'bg-orange-500/40 border-2 border-orange-400' :
                        'bg-purple-500/40 border-2 border-purple-300'
                      }`}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-lg text-white mb-2">{idea.text}</h3>
                          {idea.description && (
                            <p className="text-white/70 text-sm mb-2 leading-tight">{idea.description}</p>
                          )}
                          <div className="flex gap-2">
                            <span className={`${colors[idea.color].light} text-white px-3 py-1 rounded-full text-xs font-semibold`}>
                              {idea.category}
                            </span>
                            {createdIdeas.has(idea.id) && (
                              <span className="bg-green-500/40 text-green-200 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                <Check className="w-3 h-3" /> Task criada
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Votes */}
                    <div className="flex flex-col items-center gap-3">
                      <button
                        onClick={() => voteIdea(idea.id)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition shadow-md hover:shadow-lg flex items-center gap-2"
                      >
                        <Star className="w-5 h-5" fill="currentColor" />
                        <span className="text-2xl">{idea.votes}</span>
                      </button>
                      <span className="text-xs text-white/60">votos</span>
                    </div>

                    {/* Convert to Task */}
                    <button 
                      onClick={() => convertToTask(idea)}
                      className={`font-semibold px-4 py-2 rounded-lg transition flex items-center gap-2 ${createdIdeas.has(idea.id) ? 'bg-green-500/40 text-green-200' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}
                    >
                      <ArrowRight className="w-4 h-4" />
                      {createdIdeas.has(idea.id) ? 'Task' : 'Task'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
            )}

            {mode === 'categorized' && (
          <div className="p-8 overflow-y-auto h-full bg-gradient-to-br from-slate-900 to-slate-800">
            <div className="max-w-7xl mx-auto">
              <div className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 backdrop-blur-lg rounded-xl p-6 border border-purple-500/50 mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">📂 Ideias por Categoria</h2>
                <p className="text-white/70">Organize suas ideias em grupos temáticos</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(categorizedIdeas).map(([category, categoryIdeas]) => (
                  <div key={category} className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-lg rounded-xl p-6 border-2 border-purple-500/50 hover:border-purple-400/70 transition">
                    <h3 className="font-bold text-xl text-white mb-4 flex items-center justify-between">
                      <span>📌 {category}</span>
                      <span className="bg-purple-500/60 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {categoryIdeas.length}
                      </span>
                    </h3>
                    
                    <div className="space-y-3">
                      {categoryIdeas.map(idea => (
                        <div
                          key={idea.id}
                          className={`${colors[idea.color].bg} p-4 rounded-lg shadow-md border-2 border-white/20 hover:border-white/40 transition ${createdIdeas.has(idea.id) ? 'opacity-60' : ''}`}
                        >
                          <p className="font-semibold text-white mb-2 text-sm leading-tight">{idea.text}</p>
                          {idea.description && (
                            <p className="text-white/70 text-xs mb-3 line-clamp-2">{idea.description}</p>
                          )}
                          <div className="flex items-center justify-between gap-2">
                            <button
                              onClick={() => voteIdea(idea.id)}
                              className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition text-white text-xs font-semibold"
                            >
                              <Star className="w-4 h-4" fill="currentColor" />
                              <span>{idea.votes}</span>
                            </button>
                            <button 
                              onClick={() => convertToTask(idea)}
                              className={`text-xs font-semibold px-2 py-1 rounded transition ${createdIdeas.has(idea.id) ? 'bg-green-500/30 text-green-200' : 'bg-white/20 hover:bg-white/30 text-white'}`}
                            >
                              {createdIdeas.has(idea.id) ? '✓' : '→'}
                            </button>
                            <button
                              onClick={() => deleteIdea(idea.id)}
                              className="text-red-200 hover:text-red-100 transition bg-red-500/20 hover:bg-red-500/40 p-1 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
            )}
          </div>

          {/* Footer Stats */}
          <div className="bg-black/40 backdrop-blur-lg border-t border-purple-500/30 p-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-white/70">
              <div className="flex gap-6 font-semibold">
                <span className="text-white">💡 {ideas.length} ideias</span>
                <span className="text-white">⭐ {ideas.reduce((sum, i) => sum + i.votes, 0)} votos</span>
                <span className="text-white">🎯 {createdIdeas.size} tasks criadas</span>
                {sortedByVotes[0] && <span>🏆 Top: {sortedByVotes[0]?.text.slice(0, 25)}...</span>}
              </div>
              <button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 transition font-semibold">
                📊 Exportar Sessão
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}