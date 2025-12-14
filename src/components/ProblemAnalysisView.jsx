import React, { useState } from 'react';
import { Plus, Trash2, X, ChevronDown, ChevronUp, Download, Edit2 } from 'lucide-react';

export function ProblemAnalysisView({ darkMode, onCreateTask }) {
  const [activeTab, setActiveTab] = useState('swot'); // swot, ishikawa
  
  return (
    <div className="w-full h-full flex flex-col gap-4">
      {/* Header */}
      <div className={`${darkMode ? 'bg-white/10 border-white/20' : 'bg-white/40 border-white/40'} backdrop-blur-lg rounded-2xl p-4 border`}>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          📊 Análise de Problemas
        </h2>
        
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setActiveTab('swot')}
            className={`px-4 py-2 rounded-lg transition font-semibold ${activeTab === 'swot' ? 'bg-purple-600' : (darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-white/30 hover:bg-white/40')}`}
          >
            🎯 SWOT
          </button>
          <button
            onClick={() => setActiveTab('ishikawa')}
            className={`px-4 py-2 rounded-lg transition font-semibold ${activeTab === 'ishikawa' ? 'bg-purple-600' : (darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-white/30 hover:bg-white/40')}`}
          >
            🐠 Espinha de Peixe
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'swot' && <SWOTAnalysis darkMode={darkMode} onCreateTask={onCreateTask} />}
        {activeTab === 'ishikawa' && <IshikawaAnalysis darkMode={darkMode} onCreateTask={onCreateTask} />}
      </div>
    </div>
  );
}

// SWOT Analysis Component
function SWOTAnalysis({ darkMode, onCreateTask }) {
  const [swot, setSWOT] = useState({
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: []
  });

  const [editingField, setEditingField] = useState(null);
  const [newItemText, setNewItemText] = useState('');
  const [autoActions, setAutoActions] = useState([]);

  const quadrants = [
    {
      key: 'strengths',
      title: 'Forças',
      emoji: '💪',
      color: 'green',
      bgColor: 'bg-green-500',
      lightBg: 'bg-green-500/20',
      borderColor: 'border-green-500/50'
    },
    {
      key: 'weaknesses',
      title: 'Fraquezas',
      emoji: '⚠️',
      color: 'red',
      bgColor: 'bg-red-500',
      lightBg: 'bg-red-500/20',
      borderColor: 'border-red-500/50'
    },
    {
      key: 'opportunities',
      title: 'Oportunidades',
      emoji: '🎯',
      color: 'blue',
      bgColor: 'bg-blue-500',
      lightBg: 'bg-blue-500/20',
      borderColor: 'border-blue-500/50'
    },
    {
      key: 'threats',
      title: 'Ameaças',
      emoji: '🚨',
      color: 'orange',
      bgColor: 'bg-orange-500',
      lightBg: 'bg-orange-500/20',
      borderColor: 'border-orange-500/50'
    }
  ];

  const addItem = (quadrantKey) => {
    if (newItemText.trim()) {
      setSWOT({
        ...swot,
        [quadrantKey]: [...swot[quadrantKey], { id: Date.now(), text: newItemText, priority: 5 }]
      });
      setNewItemText('');
      setEditingField(null);
    }
  };

  const deleteItem = (quadrantKey, id) => {
    setSWOT({
      ...swot,
      [quadrantKey]: swot[quadrantKey].filter(item => item.id !== id)
    });
  };

  const updateItemPriority = (quadrantKey, id, priority) => {
    setSWOT({
      ...swot,
      [quadrantKey]: swot[quadrantKey].map(item =>
        item.id === id ? { ...item, priority } : item
      )
    });
  };

  const generateAutoActions = () => {
    const actions = [];
    
    // Usar forças para aproveitar oportunidades
    swot.strengths.forEach((strength, idx) => {
      swot.opportunities.forEach((opp, oppIdx) => {
        actions.push({
          id: `SO-${idx}-${oppIdx}`,
          type: 'SO',
          title: `Potencializar: ${strength.text}`,
          description: `Usar a força "${strength.text}" para aproveitar a oportunidade "${opp.text}"`,
          priority: 80
        });
      });
    });

    // Corrigir fraquezas que enfrentam ameaças
    swot.weaknesses.forEach((weakness, idx) => {
      swot.threats.forEach((threat, thrIdx) => {
        actions.push({
          id: `WT-${idx}-${thrIdx}`,
          type: 'WT',
          title: `Mitigar risco: ${weakness.text}`,
          description: `Eliminar a fraqueza "${weakness.text}" para evitar impacto de "${threat.text}"`,
          priority: 90
        });
      });
    });

    setAutoActions(actions);
  };

  const exportSWOT = () => {
    const data = { swot, autoActions };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `swot-analysis-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const createTaskFromAction = (action) => {
    onCreateTask({
      title: action.title,
      description: action.description,
      priority: action.priority,
      tag: `SWOT-${action.type}`
    });
  };

  return (
    <div className="w-full h-full overflow-auto p-6 space-y-6">
      {/* Grid SWOT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quadrants.map(quad => (
          <div
            key={quad.key}
            className={`${darkMode ? 'bg-white/10 border-white/20' : 'bg-white/40 border-white/40'} backdrop-blur-lg border rounded-xl overflow-hidden`}
          >
            {/* Header */}
            <div className={`${quad.lightBg} p-4 border-b ${quad.borderColor}`}>
              <h3 className="text-xl font-bold flex items-center gap-2">
                <span className="text-2xl">{quad.emoji}</span>
                {quad.title}
              </h3>
              <p className={`text-sm ${darkMode ? 'text-white/60' : 'text-slate-700'} mt-1`}>
                {swot[quad.key].length} itens
              </p>
            </div>

            {/* Items */}
            <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
              {swot[quad.key].map(item => (
                <div
                  key={item.id}
                  className={`${darkMode ? 'bg-white/10 border-white/20' : 'bg-white/30 border-white/40'} border rounded-lg p-3 flex items-start justify-between gap-2`}
                >
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{item.text}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-white/60">Prioridade:</span>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={item.priority}
                        onChange={(e) => updateItemPriority(quad.key, item.id, parseInt(e.target.value))}
                        className="w-20 h-1"
                      />
                      <span className="text-xs font-bold">{item.priority}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteItem(quad.key, item.id)}
                    className={`p-1 rounded transition ${darkMode ? 'hover:bg-red-500/20' : 'hover:bg-red-300/40'}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* Input para novo item */}
              {editingField === quad.key ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    placeholder={`Nova ${quad.title.toLowerCase()}...`}
                    className={`flex-1 ${darkMode ? 'bg-white/10 border-white/20 text-white' : 'bg-white/40 border-white/40 text-slate-900'} border rounded px-2 py-1 text-sm`}
                    autoFocus
                    onKeyPress={(e) => e.key === 'Enter' && addItem(quad.key)}
                  />
                  <button
                    onClick={() => addItem(quad.key)}
                    className="text-green-500 font-bold"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => {
                      setEditingField(null);
                      setNewItemText('');
                    }}
                    className="text-red-500 font-bold"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditingField(quad.key)}
                  className={`w-full text-sm py-2 rounded transition ${quad.bgColor} hover:opacity-80 text-white font-semibold flex items-center justify-center gap-1`}
                >
                  <Plus className="w-4 h-4" />
                  Adicionar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Gerar Ações e Controles */}
      <div className={`${darkMode ? 'bg-white/10 border-white/20' : 'bg-white/40 border-white/40'} backdrop-blur-lg border rounded-xl p-4`}>
        <div className="flex gap-4 items-center">
          <button
            onClick={generateAutoActions}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            ⚡ Gerar Ações Automáticas
          </button>
          <button
            onClick={exportSWOT}
            className={`px-4 py-3 rounded-lg transition ${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-white/30 hover:bg-white/40'}`}
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Ações Geradas */}
      {autoActions.length > 0 && (
        <div className={`${darkMode ? 'bg-white/10 border-white/20' : 'bg-white/40 border-white/40'} backdrop-blur-lg border rounded-xl p-4`}>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            🎬 Ações Recomendadas ({autoActions.length})
          </h3>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {autoActions.map(action => (
              <div
                key={action.id}
                className={`${darkMode ? 'bg-white/10 border-white/20' : 'bg-white/30 border-white/40'} border rounded-lg p-3 flex items-start justify-between gap-3`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold bg-purple-500/50 px-2 py-1 rounded">
                      {action.type}
                    </span>
                    <span className="text-xs font-bold text-yellow-500">
                      ⚡ Prioridade: {action.priority}
                    </span>
                  </div>
                  <h4 className="font-semibold">{action.title}</h4>
                  <p className={`text-sm ${darkMode ? 'text-white/60' : 'text-slate-700'} mt-1`}>
                    {action.description}
                  </p>
                </div>
                <button
                  onClick={() => createTaskFromAction(action)}
                  className="px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded text-white text-sm font-semibold transition"
                >
                  ✓ Criar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Ishikawa (Espinha de Peixe) Component
function IshikawaAnalysis({ darkMode, onCreateTask }) {
  const [problem, setProblem] = useState('Problema Central');
  const [editingProblem, setEditingProblem] = useState(false);
  const [tempProblem, setTempProblem] = useState(problem);

  const [fishbones, setFishbones] = useState({
    machine: { title: 'Máquina', causes: [] },
    material: { title: 'Material', causes: [] },
    method: { title: 'Método', causes: [] },
    manpower: { title: 'Mão de obra', causes: [] },
    environment: { title: 'Meio ambiente', causes: [] },
    measurement: { title: 'Medida', causes: [] }
  });

  const [editingCategory, setEditingCategory] = useState(null);
  const [newCauseText, setNewCauseText] = useState('');

  const colors = {
    machine: 'border-red-500/50 hover:border-red-500',
    material: 'border-orange-500/50 hover:border-orange-500',
    method: 'border-yellow-500/50 hover:border-yellow-500',
    manpower: 'border-green-500/50 hover:border-green-500',
    environment: 'border-blue-500/50 hover:border-blue-500',
    measurement: 'border-purple-500/50 hover:border-purple-500'
  };

  const emojis = {
    machine: '⚙️',
    material: '📦',
    method: '📋',
    manpower: '👥',
    environment: '🌍',
    measurement: '📏'
  };

  const saveProblem = () => {
    setProblem(tempProblem);
    setEditingProblem(false);
  };

  const addCause = (categoryKey) => {
    if (newCauseText.trim()) {
      setFishbones({
        ...fishbones,
        [categoryKey]: {
          ...fishbones[categoryKey],
          causes: [
            ...fishbones[categoryKey].causes,
            { id: Date.now(), text: newCauseText, priority: 5, linked: false }
          ]
        }
      });
      setNewCauseText('');
      setEditingCategory(null);
    }
  };

  const deleteCause = (categoryKey, id) => {
    setFishbones({
      ...fishbones,
      [categoryKey]: {
        ...fishbones[categoryKey],
        causes: fishbones[categoryKey].causes.filter(c => c.id !== id)
      }
    });
  };

  const updateCausePriority = (categoryKey, id, priority) => {
    setFishbones({
      ...fishbones,
      [categoryKey]: {
        ...fishbones[categoryKey],
        causes: fishbones[categoryKey].causes.map(c =>
          c.id === id ? { ...c, priority } : c
        )
      }
    });
  };

  const toggleLinked = (categoryKey, id) => {
    setFishbones({
      ...fishbones,
      [categoryKey]: {
        ...fishbones[categoryKey],
        causes: fishbones[categoryKey].causes.map(c =>
          c.id === id ? { ...c, linked: !c.linked } : c
        )
      }
    });
  };

  const exportIshikawa = () => {
    const data = { problem, fishbones };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ishikawa-analysis-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const createTaskFromCause = (cause, category) => {
    onCreateTask({
      title: `[${category}] ${cause.text}`,
      description: `Causa raiz identificada em "${problem}" - Categoria: ${category}`,
      priority: 50 + (cause.priority * 5),
      tag: `Ishikawa-${category}`
    });
  };

  // Top 5 problemas por prioridade
  const allCauses = Object.entries(fishbones).flatMap(([key, data]) =>
    data.causes.map(c => ({ ...c, category: data.title, categoryKey: key }))
  );
  const topCauses = allCauses.sort((a, b) => b.priority - a.priority).slice(0, 5);

  return (
    <div className="w-full h-full overflow-auto p-6 space-y-6">
      {/* Problema Central */}
      <div className={`${darkMode ? 'bg-white/10 border-white/20' : 'bg-white/40 border-white/40'} backdrop-blur-lg border rounded-xl p-6`}>
        <div className="flex items-center gap-4">
          <div className="text-5xl">🎯</div>
          {editingProblem ? (
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={tempProblem}
                onChange={(e) => setTempProblem(e.target.value)}
                className={`flex-1 ${darkMode ? 'bg-white/10 border-white/20 text-white' : 'bg-white/40 border-white/40 text-slate-900'} border rounded px-3 py-2`}
                autoFocus
              />
              <button
                onClick={saveProblem}
                className="text-green-500 font-bold px-3"
              >
                ✓
              </button>
              <button
                onClick={() => {
                  setEditingProblem(false);
                  setTempProblem(problem);
                }}
                className="text-red-500 font-bold px-3"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{problem}</h2>
              <p className={`text-sm ${darkMode ? 'text-white/60' : 'text-slate-700'} mt-1`}>
                Clique para editar o problema central
              </p>
            </div>
          )}
          <button
            onClick={() => setEditingProblem(!editingProblem)}
            className={`px-4 py-2 rounded-lg transition ${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-white/30 hover:bg-white/40'}`}
          >
            <Edit2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 6Ms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(fishbones).map(([key, data]) => (
          <div
            key={key}
            className={`${darkMode ? 'bg-white/10 border-white/20' : 'bg-white/40 border-white/40'} backdrop-blur-lg border rounded-xl overflow-hidden ${colors[key]}`}
          >
            {/* Header */}
            <div className={`${darkMode ? 'bg-white/5' : 'bg-white/20'} p-4 border-b ${colors[key]}`}>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span className="text-2xl">{emojis[key]}</span>
                {data.title}
              </h3>
              <p className={`text-sm ${darkMode ? 'text-white/60' : 'text-slate-700'} mt-1`}>
                {data.causes.length} causas
              </p>
            </div>

            {/* Causes */}
            <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
              {data.causes.map(cause => (
                <div
                  key={cause.id}
                  className={`${darkMode ? 'bg-white/10 border-white/20' : 'bg-white/30 border-white/40'} border rounded-lg p-2 flex items-start justify-between gap-2`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{cause.text}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs text-white/60">P:</span>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={cause.priority}
                        onChange={(e) => updateCausePriority(key, cause.id, parseInt(e.target.value))}
                        className="w-16 h-1"
                      />
                      <span className="text-xs font-bold">{cause.priority}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => toggleLinked(key, cause.id)}
                      className={`p-1 rounded transition text-xs ${cause.linked ? 'bg-green-500/50' : (darkMode ? 'bg-white/10' : 'bg-white/30')}`}
                      title="Vincular a task"
                    >
                      🔗
                    </button>
                    <button
                      onClick={() => deleteCause(key, cause.id)}
                      className={`p-1 rounded transition ${darkMode ? 'hover:bg-red-500/20' : 'hover:bg-red-300/40'}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Input para nova causa */}
              {editingCategory === key ? (
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={newCauseText}
                    onChange={(e) => setNewCauseText(e.target.value)}
                    placeholder="Nova causa..."
                    className={`flex-1 ${darkMode ? 'bg-white/10 border-white/20 text-white' : 'bg-white/40 border-white/40 text-slate-900'} border rounded px-2 py-1 text-xs`}
                    autoFocus
                    onKeyPress={(e) => e.key === 'Enter' && addCause(key)}
                  />
                  <button
                    onClick={() => addCause(key)}
                    className="text-green-500 font-bold text-xs px-2"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => {
                      setEditingCategory(null);
                      setNewCauseText('');
                    }}
                    className="text-red-500 font-bold text-xs px-2"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditingCategory(key)}
                  className={`w-full text-xs py-2 rounded transition ${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-white/30 hover:bg-white/40'} font-semibold`}
                >
                  <Plus className="w-3 h-3 inline mr-1" />
                  Adicionar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Top Causas */}
      {topCauses.length > 0 && (
        <div className={`${darkMode ? 'bg-white/10 border-white/20' : 'bg-white/40 border-white/40'} backdrop-blur-lg border rounded-xl p-4`}>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            ⭐ Top 5 Causas Raiz por Prioridade
          </h3>
          
          <div className="space-y-2">
            {topCauses.map((cause, idx) => (
              <div
                key={cause.id}
                className={`${darkMode ? 'bg-white/10 border-white/20' : 'bg-white/30 border-white/40'} border rounded-lg p-3 flex items-start justify-between gap-3`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl font-bold text-yellow-500">#{idx + 1}</span>
                    <span className="text-xs font-bold bg-purple-500/50 px-2 py-1 rounded">
                      {cause.category}
                    </span>
                    <span className="text-xs font-bold text-red-500">
                      Prioridade: {cause.priority}/10
                    </span>
                  </div>
                  <p className="font-semibold">{cause.text}</p>
                </div>
                <button
                  onClick={() => createTaskFromCause(cause, cause.category)}
                  className="px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded text-white text-sm font-semibold transition whitespace-nowrap"
                >
                  ✓ Criar Task
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export */}
      <div className={`${darkMode ? 'bg-white/10 border-white/20' : 'bg-white/40 border-white/40'} backdrop-blur-lg border rounded-xl p-4`}>
        <button
          onClick={exportIshikawa}
          className="flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition"
        >
          <Download className="w-5 h-5" />
          Exportar Análise
        </button>
      </div>
    </div>
  );
}
