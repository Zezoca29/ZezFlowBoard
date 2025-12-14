import React, { useState } from 'react';
import { X, Plus, Trash2, Edit2, TrendingUp, AlertTriangle, Zap, Users, Target } from 'lucide-react';

/**
 * CardAnalysisTools - Ferramentas de análise integradas para cada card do fluxograma
 * SWOT, FMEA, Espinha de Peixe, Brainstorming, Análise de Fraquezas
 */
export default function CardAnalysisTools({ taskId, cardTitle, onSave, darkMode }) {
  const [activeAnalysis, setActiveAnalysis] = useState(null);
  const [analysisData, setAnalysisData] = useState({
    swot: { strengths: [], weaknesses: [], opportunities: [], threats: [] },
    fmea: [], // Failure Mode and Effects Analysis
    fishbone: { mainEffect: '', categories: {} }, // Ishikawa
    brainstorm: [],
    weaknessAnalysis: { current: [], improvements: [] }
  });

  // ===== SWOT =====
  function SWOTAnalysis() {
    const [newItem, setNewItem] = useState({ type: 'strengths', text: '' });

    const addItem = () => {
      if (newItem.text.trim()) {
        setAnalysisData(prev => ({
          ...prev,
          swot: {
            ...prev.swot,
            [newItem.type]: [...prev.swot[newItem.type], { id: Date.now().toString(), text: newItem.text }]
          }
        }));
        setNewItem({ type: 'strengths', text: '' });
      }
    };

    const removeItem = (type, id) => {
      setAnalysisData(prev => ({
        ...prev,
        swot: {
          ...prev.swot,
          [type]: prev.swot[type].filter(item => item.id !== id)
        }
      }));
    };

    const swotCategories = [
      { key: 'strengths', label: 'Forças 💪', color: 'bg-green-600', items: analysisData.swot.strengths },
      { key: 'weaknesses', label: 'Fraquezas ⚠️', color: 'bg-red-600', items: analysisData.swot.weaknesses },
      { key: 'opportunities', label: 'Oportunidades 🎯', color: 'bg-blue-600', items: analysisData.swot.opportunities },
      { key: 'threats', label: 'Ameaças 🚨', color: 'bg-orange-600', items: analysisData.swot.threats }
    ];

    return (
      <div className="space-y-4">
        {/* Input Nova Item */}
        <div className={`${darkMode ? 'bg-white/10' : 'bg-white/40'} p-4 rounded-lg border ${darkMode ? 'border-white/20' : 'border-white/40'}`}>
          <div className="flex gap-2 mb-2">
            <select
              value={newItem.type}
              onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
              className={`flex-1 ${darkMode ? 'bg-white/10 border-white/20 text-white' : 'bg-white/40 border-white/40 text-slate-900'} border rounded px-3 py-2 text-sm`}
            >
              <option value="strengths">Forças 💪</option>
              <option value="weaknesses">Fraquezas ⚠️</option>
              <option value="opportunities">Oportunidades 🎯</option>
              <option value="threats">Ameaças 🚨</option>
            </select>
            <input
              type="text"
              value={newItem.text}
              onChange={(e) => setNewItem({ ...newItem, text: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && addItem()}
              placeholder="Digite o item..."
              className={`flex-1 ${darkMode ? 'bg-white/10 border-white/20 text-white placeholder-white/50' : 'bg-white/40 border-white/40 text-slate-900 placeholder-slate-600'} border rounded px-3 py-2 text-sm`}
            />
            <button
              onClick={addItem}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
        </div>

        {/* Grid de SWOT */}
        <div className="grid grid-cols-2 gap-4">
          {swotCategories.map(category => (
            <div key={category.key} className={`${category.color} rounded-lg p-4 border-2 border-white/20`}>
              <h3 className="font-bold text-white mb-3 text-lg">{category.label}</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {category.items.length === 0 ? (
                  <div className="text-white/60 text-sm italic">Nenhum item</div>
                ) : (
                  category.items.map(item => (
                    <div key={item.id} className="flex items-center justify-between bg-white/20 p-2 rounded gap-2">
                      <span className="text-white text-sm flex-1">{item.text}</span>
                      <button
                        onClick={() => removeItem(category.key, item.id)}
                        className="text-white hover:bg-white/30 p-1 rounded transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ===== FMEA (Failure Mode and Effects Analysis) =====
  function FMEAAnalysis() {
    const [newFmea, setNewFmea] = useState({
      failure: '',
      effect: '',
      severity: 5,
      occurrence: 5,
      detection: 5
    });

    const addFmea = () => {
      if (newFmea.failure.trim() && newFmea.effect.trim()) {
        const rpn = newFmea.severity * newFmea.occurrence * newFmea.detection;
        setAnalysisData(prev => ({
          ...prev,
          fmea: [...prev.fmea, { id: Date.now().toString(), ...newFmea, rpn }]
        }));
        setNewFmea({
          failure: '',
          effect: '',
          severity: 5,
          occurrence: 5,
          detection: 5
        });
      }
    };

    const removeFmea = (id) => {
      setAnalysisData(prev => ({
        ...prev,
        fmea: prev.fmea.filter(item => item.id !== id)
      }));
    };

    const sortedFmea = [...analysisData.fmea].sort((a, b) => b.rpn - a.rpn);

    return (
      <div className="space-y-4">
        {/* Input Nova FMEA */}
        <div className={`${darkMode ? 'bg-white/10' : 'bg-white/40'} p-4 rounded-lg border ${darkMode ? 'border-white/20' : 'border-white/40'} space-y-3`}>
          <input
            type="text"
            value={newFmea.failure}
            onChange={(e) => setNewFmea({ ...newFmea, failure: e.target.value })}
            placeholder="Modo de falha..."
            className={`w-full ${darkMode ? 'bg-white/10 border-white/20 text-white placeholder-white/50' : 'bg-white/40 border-white/40 text-slate-900 placeholder-slate-600'} border rounded px-3 py-2 text-sm`}
          />
          <input
            type="text"
            value={newFmea.effect}
            onChange={(e) => setNewFmea({ ...newFmea, effect: e.target.value })}
            placeholder="Efeito da falha..."
            className={`w-full ${darkMode ? 'bg-white/10 border-white/20 text-white placeholder-white/50' : 'bg-white/40 border-white/40 text-slate-900 placeholder-slate-600'} border rounded px-3 py-2 text-sm`}
          />
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-semibold block mb-1">Severidade</label>
              <input
                type="range"
                min="1"
                max="10"
                value={newFmea.severity}
                onChange={(e) => setNewFmea({ ...newFmea, severity: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="text-center text-xs mt-1">{newFmea.severity}</div>
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">Ocorrência</label>
              <input
                type="range"
                min="1"
                max="10"
                value={newFmea.occurrence}
                onChange={(e) => setNewFmea({ ...newFmea, occurrence: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="text-center text-xs mt-1">{newFmea.occurrence}</div>
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">Detecção</label>
              <input
                type="range"
                min="1"
                max="10"
                value={newFmea.detection}
                onChange={(e) => setNewFmea({ ...newFmea, detection: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="text-center text-xs mt-1">{newFmea.detection}</div>
            </div>
          </div>
          <button
            onClick={addFmea}
            className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition font-semibold"
          >
            <Plus className="w-4 h-4 inline mr-1" />
            Adicionar FMEA
          </button>
        </div>

        {/* Lista de FMEA */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {sortedFmea.length === 0 ? (
            <div className={`text-center py-4 ${darkMode ? 'text-white/60' : 'text-slate-600'}`}>Nenhuma FMEA adicionada</div>
          ) : (
            sortedFmea.map(fmea => (
              <div key={fmea.id} className={`${darkMode ? 'bg-white/10' : 'bg-white/40'} p-3 rounded-lg border-l-4 ${fmea.rpn > 125 ? 'border-red-500' : fmea.rpn > 75 ? 'border-orange-500' : 'border-yellow-500'}`}>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{fmea.failure}</div>
                    <div className={`text-xs ${darkMode ? 'text-white/70' : 'text-slate-700'}`}>{fmea.effect}</div>
                  </div>
                  <div className="text-center">
                    <div className={`font-bold text-lg ${fmea.rpn > 125 ? 'text-red-500' : fmea.rpn > 75 ? 'text-orange-500' : 'text-yellow-500'}`}>
                      {fmea.rpn}
                    </div>
                    <div className="text-xs">RPN</div>
                  </div>
                  <button
                    onClick={() => removeFmea(fmea.id)}
                    className="text-red-500 hover:bg-red-500/20 p-1 rounded transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-2 text-xs">
                  <span className={`${darkMode ? 'bg-white/10' : 'bg-white/30'} px-2 py-1 rounded`}>S:{fmea.severity}</span>
                  <span className={`${darkMode ? 'bg-white/10' : 'bg-white/30'} px-2 py-1 rounded`}>O:{fmea.occurrence}</span>
                  <span className={`${darkMode ? 'bg-white/10' : 'bg-white/30'} px-2 py-1 rounded`}>D:{fmea.detection}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // ===== Espinha de Peixe (Fishbone) =====
  function FishboneAnalysis() {
    const [newCause, setNewCause] = useState({ category: 'Pessoas', text: '' });
    const [editing, setEditing] = useState(null);

    const defaultCategories = {
      'Pessoas': [],
      'Método': [],
      'Máquina': [],
      'Material': [],
      'Medida': [],
      'Meio-ambiente': []
    };

    const categories = {
      ...defaultCategories,
      ...analysisData.fishbone.categories
    };

    const addCause = () => {
      if (newCause.text.trim()) {
        setAnalysisData(prev => ({
          ...prev,
          fishbone: {
            ...prev.fishbone,
            categories: {
              ...prev.fishbone.categories,
              [newCause.category]: [
                ...(prev.fishbone.categories[newCause.category] || []),
                { id: Date.now().toString(), text: newCause.text }
              ]
            }
          }
        }));
        setNewCause({ category: 'Pessoas', text: '' });
      }
    };

    const removeCause = (category, id) => {
      setAnalysisData(prev => ({
        ...prev,
        fishbone: {
          ...prev.fishbone,
          categories: {
            ...prev.fishbone.categories,
            [category]: prev.fishbone.categories[category].filter(c => c.id !== id)
          }
        }
      }));
    };

    return (
      <div className="space-y-4">
        {/* Efeito Principal */}
        <div className={`${darkMode ? 'bg-white/10' : 'bg-white/40'} p-4 rounded-lg border ${darkMode ? 'border-white/20' : 'border-white/40'}`}>
          <label className="text-sm font-semibold block mb-2">Efeito Principal (Cabeça)</label>
          <input
            type="text"
            value={analysisData.fishbone.mainEffect}
            onChange={(e) => setAnalysisData(prev => ({
              ...prev,
              fishbone: { ...prev.fishbone, mainEffect: e.target.value }
            }))}
            placeholder="Digite o problema principal..."
            className={`w-full ${darkMode ? 'bg-white/10 border-white/20 text-white placeholder-white/50' : 'bg-white/40 border-white/40 text-slate-900 placeholder-slate-600'} border rounded px-3 py-2`}
          />
        </div>

        {/* Nova Causa */}
        <div className={`${darkMode ? 'bg-white/10' : 'bg-white/40'} p-4 rounded-lg border ${darkMode ? 'border-white/20' : 'border-white/40'}`}>
          <div className="flex gap-2 mb-2">
            <select
              value={newCause.category}
              onChange={(e) => setNewCause({ ...newCause, category: e.target.value })}
              className={`flex-1 ${darkMode ? 'bg-white/10 border-white/20 text-white' : 'bg-white/40 border-white/40 text-slate-900'} border rounded px-3 py-2 text-sm`}
            >
              {Object.keys(defaultCategories).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input
              type="text"
              value={newCause.text}
              onChange={(e) => setNewCause({ ...newCause, text: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && addCause()}
              placeholder="Digite a causa..."
              className={`flex-1 ${darkMode ? 'bg-white/10 border-white/20 text-white placeholder-white/50' : 'bg-white/40 border-white/40 text-slate-900 placeholder-slate-600'} border rounded px-3 py-2 text-sm`}
            />
            <button
              onClick={addCause}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Categorias */}
        <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
          {Object.entries(categories).map(([category, causes]) => (
            <div key={category} className={`${darkMode ? 'bg-white/10' : 'bg-white/40'} p-3 rounded-lg border ${darkMode ? 'border-white/20' : 'border-white/40'}`}>
              <h4 className="font-bold text-sm mb-2">{category} 🎯</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {causes.length === 0 ? (
                  <div className={`text-xs ${darkMode ? 'text-white/60' : 'text-slate-600'}`}>-</div>
                ) : (
                  causes.map(cause => (
                    <div key={cause.id} className="flex justify-between items-center text-xs gap-1">
                      <span className={`flex-1 ${darkMode ? 'text-white/90' : 'text-slate-900'}`}>{cause.text}</span>
                      <button
                        onClick={() => removeCause(category, cause.id)}
                        className="text-red-500 hover:bg-red-500/20 p-0.5 rounded transition flex-shrink-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ===== Brainstorming =====
  function BrainstormingAnalysis() {
    const [newIdea, setNewIdea] = useState('');
    const [selectedColor, setSelectedColor] = useState('yellow');

    const colors = {
      yellow: 'bg-yellow-500',
      pink: 'bg-pink-500',
      blue: 'bg-blue-500',
      green: 'bg-green-500'
    };

    const addIdea = () => {
      if (newIdea.trim()) {
        setAnalysisData(prev => ({
          ...prev,
          brainstorm: [
            ...prev.brainstorm,
            { id: Date.now().toString(), text: newIdea, color: selectedColor, votes: 0 }
          ]
        }));
        setNewIdea('');
      }
    };

    const removeIdea = (id) => {
      setAnalysisData(prev => ({
        ...prev,
        brainstorm: prev.brainstorm.filter(idea => idea.id !== id)
      }));
    };

    const voteIdea = (id) => {
      setAnalysisData(prev => ({
        ...prev,
        brainstorm: prev.brainstorm.map(idea =>
          idea.id === id ? { ...idea, votes: idea.votes + 1 } : idea
        )
      }));
    };

    const sortedIdeas = [...analysisData.brainstorm].sort((a, b) => b.votes - a.votes);

    return (
      <div className="space-y-4">
        {/* Input Nova Ideia */}
        <div className={`${darkMode ? 'bg-white/10' : 'bg-white/40'} p-4 rounded-lg border ${darkMode ? 'border-white/20' : 'border-white/40'}`}>
          <div className="flex gap-2 mb-2 flex-wrap">
            {Object.entries(colors).map(([color, bgClass]) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-8 h-8 rounded-full border-2 transition ${bgClass} ${selectedColor === color ? 'border-white scale-110' : 'border-white/50'}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newIdea}
              onChange={(e) => setNewIdea(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addIdea()}
              placeholder="Digite uma nova ideia..."
              className={`flex-1 ${darkMode ? 'bg-white/10 border-white/20 text-white placeholder-white/50' : 'bg-white/40 border-white/40 text-slate-900 placeholder-slate-600'} border rounded px-3 py-2`}
            />
            <button
              onClick={addIdea}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Lista de Ideias */}
        <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
          {sortedIdeas.length === 0 ? (
            <div className={`col-span-2 text-center py-4 ${darkMode ? 'text-white/60' : 'text-slate-600'}`}>
              Nenhuma ideia ainda
            </div>
          ) : (
            sortedIdeas.map(idea => (
              <div key={idea.id} className={`${colors[idea.color]} p-3 rounded-lg shadow-lg`}>
                <p className="text-white text-sm font-semibold mb-2 line-clamp-2">{idea.text}</p>
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => voteIdea(idea.id)}
                    className={`${darkMode ? 'bg-white/20 hover:bg-white/30' : 'bg-white/40 hover:bg-white/60'} text-white px-2 py-1 rounded text-xs font-bold transition`}
                  >
                    ⭐ {idea.votes}
                  </button>
                  <button
                    onClick={() => removeIdea(idea.id)}
                    className="text-white hover:bg-white/30 p-1 rounded transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // ===== Análise de Fraquezas =====
  function WeaknessAnalysis() {
    const [newWeakness, setNewWeakness] = useState('');
    const [newImprovement, setNewImprovement] = useState('');

    const addWeakness = () => {
      if (newWeakness.trim()) {
        setAnalysisData(prev => ({
          ...prev,
          weaknessAnalysis: {
            ...prev.weaknessAnalysis,
            current: [...prev.weaknessAnalysis.current, { id: Date.now().toString(), text: newWeakness }]
          }
        }));
        setNewWeakness('');
      }
    };

    const addImprovement = () => {
      if (newImprovement.trim()) {
        setAnalysisData(prev => ({
          ...prev,
          weaknessAnalysis: {
            ...prev.weaknessAnalysis,
            improvements: [...prev.weaknessAnalysis.improvements, { id: Date.now().toString(), text: newImprovement }]
          }
        }));
        setNewImprovement('');
      }
    };

    const removeWeakness = (id) => {
      setAnalysisData(prev => ({
        ...prev,
        weaknessAnalysis: {
          ...prev.weaknessAnalysis,
          current: prev.weaknessAnalysis.current.filter(w => w.id !== id)
        }
      }));
    };

    const removeImprovement = (id) => {
      setAnalysisData(prev => ({
        ...prev,
        weaknessAnalysis: {
          ...prev.weaknessAnalysis,
          improvements: prev.weaknessAnalysis.improvements.filter(i => i.id !== id)
        }
      }));
    };

    return (
      <div className="grid grid-cols-2 gap-4">
        {/* Fraquezas Atuais */}
        <div className="space-y-3">
          <h3 className="font-bold text-lg flex items-center gap-2">⚠️ Fraquezas Atuais</h3>
          <div className={`${darkMode ? 'bg-white/10' : 'bg-white/40'} p-3 rounded-lg border ${darkMode ? 'border-white/20' : 'border-white/40'}`}>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newWeakness}
                onChange={(e) => setNewWeakness(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addWeakness()}
                placeholder="Digite a fraqueza..."
                className={`flex-1 ${darkMode ? 'bg-white/10 border-white/20 text-white placeholder-white/50' : 'bg-white/40 border-white/40 text-slate-900 placeholder-slate-600'} border rounded px-3 py-2 text-sm`}
              />
              <button
                onClick={addWeakness}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {analysisData.weaknessAnalysis.current.length === 0 ? (
              <div className={`text-sm ${darkMode ? 'text-white/60' : 'text-slate-600'}`}>Nenhuma fraqueza</div>
            ) : (
              analysisData.weaknessAnalysis.current.map(weakness => (
                <div key={weakness.id} className="bg-red-500/20 p-2 rounded flex justify-between items-start gap-2">
                  <span className="text-sm flex-1">{weakness.text}</span>
                  <button
                    onClick={() => removeWeakness(weakness.id)}
                    className="text-red-500 hover:bg-red-500/30 p-1 rounded transition flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Melhorias */}
        <div className="space-y-3">
          <h3 className="font-bold text-lg flex items-center gap-2">✅ Plano de Melhoria</h3>
          <div className={`${darkMode ? 'bg-white/10' : 'bg-white/40'} p-3 rounded-lg border ${darkMode ? 'border-white/20' : 'border-white/40'}`}>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newImprovement}
                onChange={(e) => setNewImprovement(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addImprovement()}
                placeholder="Digite a melhoria..."
                className={`flex-1 ${darkMode ? 'bg-white/10 border-white/20 text-white placeholder-white/50' : 'bg-white/40 border-white/40 text-slate-900 placeholder-slate-600'} border rounded px-3 py-2 text-sm`}
              />
              <button
                onClick={addImprovement}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {analysisData.weaknessAnalysis.improvements.length === 0 ? (
              <div className={`text-sm ${darkMode ? 'text-white/60' : 'text-slate-600'}`}>Nenhuma melhoria</div>
            ) : (
              analysisData.weaknessAnalysis.improvements.map(improvement => (
                <div key={improvement.id} className="bg-green-500/20 p-2 rounded flex justify-between items-start gap-2">
                  <span className="text-sm flex-1">{improvement.text}</span>
                  <button
                    onClick={() => removeImprovement(improvement.id)}
                    className="text-green-500 hover:bg-green-500/30 p-1 rounded transition flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  const analysisTools = [
    { id: 'swot', name: 'SWOT', icon: '🎯', component: SWOTAnalysis },
    { id: 'fmea', name: 'FMEA', icon: '⚠️', component: FMEAAnalysis },
    { id: 'fishbone', name: 'Espinha de Peixe', icon: '🐟', component: FishboneAnalysis },
    { id: 'brainstorm', name: 'Brainstorming', icon: '💡', component: BrainstormingAnalysis },
    { id: 'weakness', name: 'Fraquezas', icon: '📊', component: WeaknessAnalysis }
  ];

  const CurrentComponent = activeAnalysis
    ? analysisTools.find(tool => tool.id === activeAnalysis)?.component
    : null;

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className={`${darkMode ? 'bg-gradient-to-r from-purple-900 to-pink-900 border-b border-white/10' : 'bg-gradient-to-r from-purple-500 to-pink-500 border-b border-white/40'} px-6 py-4 flex items-center justify-between flex-shrink-0`}>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          🔍 Análises do Card: {cardTitle}
        </h2>
      </div>

      {/* Tabs de Análises */}
      {!activeAnalysis && (
        <div className={`${darkMode ? 'bg-white/5 border-b border-white/10' : 'bg-white/30 border-b border-white/40'} p-4 flex gap-2 flex-wrap`}>
          {analysisTools.map(tool => (
            <button
              key={tool.id}
              onClick={() => setActiveAnalysis(tool.id)}
              className={`px-4 py-2 rounded-lg transition font-semibold flex items-center gap-2 ${
                activeAnalysis === tool.id
                  ? 'bg-purple-600 text-white'
                  : (darkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-white/40 hover:bg-white/60 text-slate-900')
              }`}
            >
              <span className="text-lg">{tool.icon}</span>
              {tool.name}
            </button>
          ))}
        </div>
      )}

      {/* Conteúdo da Análise */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeAnalysis && CurrentComponent ? (
          <div>
            {/* Voltar */}
            <button
              onClick={() => setActiveAnalysis(null)}
              className={`mb-4 px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-white/40 hover:bg-white/60'
              }`}
            >
              ← Voltar
            </button>

            {/* Conteúdo */}
            <CurrentComponent />
          </div>
        ) : (
          <div className={`text-center py-12 ${darkMode ? 'text-white/60' : 'text-slate-600'}`}>
            <div className="text-6xl mb-4">🔧</div>
            <p className="text-lg font-semibold mb-2">Selecione uma ferramenta de análise</p>
            <p className="text-sm">Use as ferramentas acima para mapear análises neste card</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={`${darkMode ? 'bg-black/30 border-t border-white/10' : 'bg-white/40 border-t border-white/40'} p-4 flex gap-3 flex-shrink-0`}>
        <button
          onClick={() => onSave(analysisData)}
          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 rounded-lg transition"
        >
          💾 Salvar Análises
        </button>
      </div>
    </div>
  );
}
