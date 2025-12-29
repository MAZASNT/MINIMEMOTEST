import React, { useState, useEffect, useRef } from 'react';
import { AppState, TarotCard, SpreadDefinition, DeckTheme, JournalEntry } from './types';
import { MAJOR_ARCANA, SPREADS, DECK_THEMES } from './constants';
import { analyzeQuestion, getTarotInterpretation } from './services/geminiService';
import StarField from './components/StarField';
import { Card } from './components/Card';
import { Sparkles, ArrowRight, RefreshCw, Wand2, Book, Settings, Save, Upload, X, ChevronRight, LayoutGrid } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const TOTAL_CARDS_IN_DECK = 78;

const App: React.FC = () => {
  // --- STATE ---
  const [state, setState] = useState<AppState>(AppState.WELCOME);
  const [question, setQuestion] = useState('');
  const [keywords, setKeywords] = useState<string>('');
  
  // Deck & Spread State
  const [deck, setDeck] = useState<any[]>([]);
  const [selectedSpread, setSelectedSpread] = useState<SpreadDefinition>(SPREADS[1]); // Default to 3-card
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [drawnCards, setDrawnCards] = useState<TarotCard[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  
  // Reading State
  const [readingText, setReadingText] = useState('');
  const [isLoadingReading, setIsLoadingReading] = useState(false);
  
  // User Settings & Data
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [currentTheme, setCurrentTheme] = useState<DeckTheme>(DECK_THEMES[0]);
  const [userNote, setUserNote] = useState('');
  const [hasSaved, setHasSaved] = useState(false);

  // Refs
  const readingEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- INITIALIZATION & EFFECTS ---

  useEffect(() => {
    // Initialize Visual Deck
    setDeck(Array.from({ length: 22 }, (_, i) => i)); 
    
    // Load Journal from LocalStorage
    const savedJournal = localStorage.getItem('tarot_journal');
    if (savedJournal) {
        try {
            setJournal(JSON.parse(savedJournal));
        } catch (e) {
            console.error("Failed to parse journal");
        }
    }
  }, []);

  useEffect(() => {
    if (state === AppState.READING) {
        readingEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [readingText, state]);

  // --- HANDLERS: FLOW ---

  const handleStartAnalysis = async () => {
    if (!question.trim()) return;
    setState(AppState.ANALYZING);
    
    const analysis = await analyzeQuestion(question);
    setKeywords(analysis);
    
    setTimeout(() => {
        setState(AppState.SPREAD_SELECTION);
    }, 1500);
  };

  const confirmSpread = (spread: SpreadDefinition) => {
      setSelectedSpread(spread);
      setState(AppState.SHUFFLING);
  };

  const finishShuffling = () => {
      setState(AppState.CUTTING);
  };

  const handleCut = () => {
      setState(AppState.SELECTING);
  };

  const handleSelectCard = (index: number) => {
    if (selectedIndices.includes(index)) return;
    if (selectedIndices.length >= selectedSpread.cardCount) return;

    const newSelection = [...selectedIndices, index];
    setSelectedIndices(newSelection);

    if (newSelection.length === selectedSpread.cardCount) {
      setTimeout(() => {
        prepareDraw();
        setState(AppState.REVEALING);
      }, 800);
    }
  };

  const prepareDraw = () => {
      // Randomly select cards from Major Arcana
      // Ensure no duplicates
      const shuffled = [...MAJOR_ARCANA].sort(() => 0.5 - Math.random());
      const chosen = shuffled.slice(0, selectedSpread.cardCount).map(card => ({
          ...card,
          isReversed: Math.random() > 0.7 // 30% chance of reversal
      }));
      setDrawnCards(chosen as TarotCard[]);
  };

  const handleReveal = (index: number) => {
    // Only allow sequential reveal or clicking the next hidden card
    if (index !== revealedCount) return; 
    setRevealedCount(prev => prev + 1);
  };

  useEffect(() => {
      if (revealedCount === selectedSpread.cardCount && state === AppState.REVEALING) {
          generateReading();
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealedCount, state]);

  const generateReading = async () => {
      setState(AppState.READING);
      setIsLoadingReading(true);
      try {
          const cardsForPrompt = drawnCards.map((card, idx) => ({
              positionName: selectedSpread.positions[idx].name,
              positionDesc: selectedSpread.positions[idx].description,
              card: card
          }));

          const stream = await getTarotInterpretation(question, selectedSpread.name, cardsForPrompt);
          
          setIsLoadingReading(false);
          
          for await (const chunk of stream) {
              const text = chunk.text;
              if (text) {
                 setReadingText(prev => prev + text);
              }
          }
      } catch (e) {
          console.error(e);
          setReadingText("宇宙连接中断，请稍后重试...");
          setIsLoadingReading(false);
      }
  };

  const saveToJournal = () => {
      if (hasSaved) return;
      
      const newEntry: JournalEntry = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          question,
          spreadName: selectedSpread.name,
          cards: drawnCards.map((card, idx) => ({
              positionName: selectedSpread.positions[idx].name,
              card
          })),
          interpretation: readingText,
          userNotes: userNote
      };

      const updatedJournal = [newEntry, ...journal];
      setJournal(updatedJournal);
      localStorage.setItem('tarot_journal', JSON.stringify(updatedJournal));
      setHasSaved(true);
  };

  const reset = () => {
      setState(AppState.WELCOME);
      setQuestion('');
      setSelectedIndices([]);
      setDrawnCards([]);
      setRevealedCount(0);
      setReadingText('');
      setKeywords('');
      setUserNote('');
      setHasSaved(false);
  };

  // --- HANDLERS: SETTINGS ---

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              const base64 = reader.result as string;
              // Create a custom theme
              const customTheme: DeckTheme = {
                  id: 'custom',
                  name: '自定义牌背',
                  backImage: base64,
                  frontStyle: 'classic'
              };
              setCurrentTheme(customTheme);
          };
          reader.readAsDataURL(file);
      }
  };

  // --- RENDER HELPERS ---

  // Calculate layout style based on spread coordinates
  const getCardStyle = (index: number): React.CSSProperties => {
      if (state === AppState.REVEALING || state === AppState.READING) {
          const pos = selectedSpread.positions[index];
          // Determine scale and position logic based on spread type
          // Celtic cross needs specific absolute positioning
          const isCeltic = selectedSpread.id === 'celtic_cross';
          
          // Base unit size
          const unitX = 110; 
          const unitY = 160; 
          
          // Center screen
          // For simple grids (1 or 3 cards), we might just use flexbox in the parent,
          // but for unified logic let's use transforms if it's complex.
          
          if (isCeltic) {
             return {
                 position: 'absolute',
                 left: '50%',
                 top: '50%',
                 transform: `translate(calc(-50% + ${pos.x * (unitX/2)}px), calc(-50% + ${pos.y * (unitY/2)}px)) rotate(${pos.rotation || 0}deg)`,
                 zIndex: index
             };
          }
      }
      return {};
  };


  return (
    <div className="min-h-screen text-slate-100 font-sans overflow-x-hidden selection:bg-purple-500 selection:text-white pb-20">
      <StarField />
      
      {/* Header */}
      <header className="fixed top-0 left-0 w-full p-4 flex justify-between items-center z-50 bg-gradient-to-b from-slate-950 via-slate-900/80 to-transparent backdrop-blur-sm">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => state === AppState.WELCOME && window.location.reload()}>
            <Sparkles className="text-amber-400" />
            <h1 className="text-xl md:text-2xl font-serif text-amber-100 tracking-wider">宇宙低语</h1>
        </div>
        <div className="flex items-center gap-4">
            <button onClick={() => setShowHistory(true)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-300" title="占卜日记">
                <Book size={20} />
            </button>
            <button onClick={() => setShowSettings(true)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-300" title="设置">
                <Settings size={20} />
            </button>
            {state !== AppState.WELCOME && (
                <button onClick={reset} className="text-xs text-slate-400 hover:text-white flex items-center gap-1 border border-white/20 px-3 py-1.5 rounded-full">
                    <RefreshCw size={14} /> 重置
                </button>
            )}
        </div>
      </header>

      <main className="container mx-auto px-4 min-h-screen flex flex-col items-center justify-center pt-24 pb-10 relative">
        
        {/* STEP 1: WELCOME */}
        {state === AppState.WELCOME && (
          <div className="max-w-md w-full animate-in fade-in zoom-in duration-700">
            <div className="bg-slate-900/60 backdrop-blur-md p-8 rounded-2xl border border-indigo-500/30 shadow-2xl text-center">
              <h2 className="text-3xl font-serif mb-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-purple-300">
                心中的困惑是什么？
              </h2>
              <p className="text-slate-400 mb-6 text-sm">集中精神，向宇宙发出你的提问。</p>
              
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="我的事业接下来会有什么发展？..."
                className="w-full bg-slate-800/80 border border-slate-600 rounded-lg p-4 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all resize-none h-32 mb-6 placeholder:text-slate-600"
              />
              
              <button
                onClick={handleStartAnalysis}
                disabled={!question.trim()}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg font-serif tracking-widest text-lg font-bold hover:from-indigo-500 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)]"
              >
                开始占卜
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: ANALYZING */}
        {state === AppState.ANALYZING && (
             <div className="flex flex-col items-center justify-center animate-in fade-in duration-1000">
                 <div className="relative">
                    <div className="w-24 h-24 border-4 border-indigo-500/30 rounded-full animate-spin border-t-amber-400"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Wand2 className="text-purple-300 animate-pulse" size={32} />
                    </div>
                 </div>
                 <h3 className="mt-8 text-xl font-serif text-amber-100">正在连结宇宙能量...</h3>
                 <p className="mt-2 text-slate-400 text-sm">解析问题核心</p>
             </div>
        )}

        {/* STEP 2.5: SPREAD SELECTION */}
        {state === AppState.SPREAD_SELECTION && (
            <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-10 duration-700">
                <div className="text-center mb-10">
                    <h3 className="text-2xl font-serif text-amber-100 mb-2">选择你的牌阵</h3>
                    <p className="text-slate-400">关键词: {keywords}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {SPREADS.map(spread => (
                        <div 
                            key={spread.id}
                            onClick={() => confirmSpread(spread)}
                            className="bg-slate-800/50 border border-slate-700 hover:border-amber-500/50 p-6 rounded-xl cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl group"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <LayoutGrid className="text-indigo-400 group-hover:text-amber-400" />
                                <span className="text-xs bg-slate-900 px-2 py-1 rounded text-slate-400">{spread.cardCount} 张牌</span>
                            </div>
                            <h4 className="text-lg font-bold text-slate-200 mb-2 group-hover:text-amber-200">{spread.name}</h4>
                            <p className="text-sm text-slate-400 leading-relaxed">{spread.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* STEP 3: SHUFFLING */}
        {state === AppState.SHUFFLING && (
            <div className="flex flex-col items-center w-full max-w-2xl">
                <div className="mb-8 text-center animate-in slide-in-from-bottom duration-700">
                    <h3 className="text-2xl font-bold text-white mb-2">正在洗牌</h3>
                    <p className="text-slate-400">请保持专注...</p>
                </div>
                
                <div className="relative w-full h-64 flex justify-center items-center">
                    {[1,2,3,4,5].map((i) => (
                        <div key={i} className="absolute transition-all duration-300 animate-pulse" 
                             style={{
                                 transform: `translateX(${Math.sin(Date.now() / 200 + i) * 100}px) rotate(${Math.cos(Date.now() / 300 + i) * 45}deg)`,
                                 zIndex: i
                             }}>
                             <Card isFlipped={false} theme={currentTheme} className="shadow-2xl" />
                        </div>
                    ))}
                </div>

                <button 
                    onClick={finishShuffling}
                    className="mt-12 px-8 py-3 border border-amber-500/50 rounded-full text-amber-100 hover:bg-amber-500/10 transition-colors uppercase tracking-widest text-sm"
                >
                    停止洗牌
                </button>
            </div>
        )}

        {/* STEP 4: CUTTING */}
        {state === AppState.CUTTING && (
            <div className="flex flex-col items-center text-center animate-in fade-in duration-500">
                <h3 className="text-2xl font-serif text-amber-100 mb-8">切牌</h3>
                <div 
                    className="group relative cursor-pointer w-40 h-64"
                    onClick={handleCut}
                >
                    <div className="absolute inset-0 bg-indigo-500/20 blur-xl group-hover:bg-indigo-400/30 transition-all duration-500 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-full h-full transform -translate-y-2 translate-x-2"><Card isFlipped={false} theme={currentTheme} /></div>
                    <div className="absolute top-0 left-0 w-full h-full transform -translate-y-1 translate-x-1"><Card isFlipped={false} theme={currentTheme} /></div>
                    <div className="absolute top-0 left-0 w-full h-full group-hover:-translate-y-4 transition-transform duration-300"><Card isFlipped={false} theme={currentTheme} /></div>
                    
                    <div className="absolute -right-20 top-1/2 flex items-center text-slate-400 group-hover:text-amber-300 transition-colors whitespace-nowrap">
                        <ArrowRight className="mr-2" /> 点击切牌
                    </div>
                </div>
            </div>
        )}

        {/* STEP 5: SELECTING */}
        {state === AppState.SELECTING && (
            <div className="w-full flex flex-col items-center animate-in fade-in duration-700">
                <h3 className="text-xl font-serif text-amber-100 mb-8">
                    凭直觉选取 {selectedSpread.cardCount - selectedIndices.length} 张牌
                </h3>
                
                <div className="flex flex-wrap justify-center gap-1 sm:gap-2 max-w-5xl mx-auto perspective-1000">
                    {deck.map((_, index) => (
                        <div 
                            key={index}
                            onClick={() => handleSelectCard(index)}
                            className={`
                                relative w-8 h-24 sm:w-12 sm:h-32 rounded-md border border-slate-700 bg-indigo-950 cursor-pointer shadow-lg hover:-translate-y-4 hover:bg-indigo-900 transition-all duration-300
                                ${selectedIndices.includes(index) ? 'opacity-0 pointer-events-none' : 'opacity-100'}
                            `}
                            style={{
                                transform: `rotate(${(index - 11) * 2}deg) translateY(${Math.abs(index - 11) * 2}px)`,
                                zIndex: index
                            }}
                        >
                            <div 
                                className="w-full h-full rounded-md"
                                style={{ background: currentTheme.backColor }}
                            ></div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* STEP 6 & 7: REVEALING & READING */}
        {(state === AppState.REVEALING || state === AppState.READING) && (
            <div className="w-full flex flex-col items-center">
                
                {/* Board Area */}
                <div className={`relative w-full max-w-5xl h-[600px] mb-12 flex items-center justify-center transition-all duration-1000 ${selectedSpread.id === 'celtic_cross' ? '' : 'flex-wrap gap-4 md:gap-8'}`}>
                    {drawnCards.map((card, idx) => {
                        const isRevealed = idx < revealedCount;
                        const positionInfo = selectedSpread.positions[idx];
                        
                        // Layout Logic
                        const isCeltic = selectedSpread.id === 'celtic_cross';
                        
                        return (
                            <div 
                                key={idx} 
                                style={isCeltic ? getCardStyle(idx) : {}}
                                className={`flex flex-col items-center group transition-all duration-700 z-${idx} ${!isCeltic ? 'mx-2' : ''}`}
                            >
                                <div className={`mb-2 text-center transition-opacity duration-500 ${isRevealed ? 'opacity-100' : 'opacity-0'}`}>
                                    <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700">
                                        {positionInfo.name}
                                    </span>
                                </div>
                                <Card 
                                    card={card} 
                                    isFlipped={isRevealed} 
                                    onClick={() => handleReveal(idx)}
                                    theme={currentTheme}
                                    className={`${!isRevealed && idx === revealedCount ? 'animate-bounce ring-2 ring-amber-400/50' : ''}`}
                                />
                            </div>
                        );
                    })}
                </div>

                {state === AppState.READING && (
                    <div className="w-full max-w-3xl bg-slate-900/80 border border-slate-700 p-8 rounded-2xl shadow-2xl animate-in slide-in-from-bottom duration-1000 z-50">
                        {isLoadingReading && !readingText && (
                             <div className="flex items-center justify-center space-x-2 text-purple-300 mb-4">
                                <Sparkles className="animate-spin" />
                                <span className="font-serif">星辰正在汇聚指引...</span>
                             </div>
                        )}
                        
                        <div className="prose prose-invert prose-p:text-slate-300 prose-headings:text-amber-100 prose-strong:text-amber-200 prose-li:text-slate-300 max-w-none font-serif leading-relaxed">
                            <ReactMarkdown>{readingText}</ReactMarkdown>
                        </div>
                        
                        <div ref={readingEndRef} />

                        {!isLoadingReading && readingText && (
                            <div className="mt-8 pt-8 border-t border-slate-700">
                                <div className="mb-6">
                                    <label className="block text-sm text-slate-400 mb-2">你的心得笔记:</label>
                                    <textarea 
                                        value={userNote}
                                        onChange={(e) => setUserNote(e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-600 rounded p-3 text-sm text-white focus:border-amber-500 outline-none"
                                        placeholder="记录下此刻的感悟..."
                                        rows={3}
                                    />
                                </div>
                                <div className="flex justify-between items-center">
                                    <button 
                                        onClick={saveToJournal} 
                                        disabled={hasSaved}
                                        className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all ${hasSaved ? 'bg-green-600/20 text-green-400' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
                                    >
                                        <Save size={16} /> {hasSaved ? '已保存' : '保存到日记'}
                                    </button>
                                    <button onClick={reset} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-full text-sm transition-colors text-slate-300">
                                        新的提问
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        )}

      </main>

      {/* --- MODALS --- */}

      {/* History Modal */}
      {showHistory && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl h-[80vh] rounded-2xl flex flex-col shadow-2xl">
                  <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                      <h2 className="text-xl font-serif text-amber-100">占卜日记</h2>
                      <button onClick={() => setShowHistory(false)}><X className="text-slate-400 hover:text-white" /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      {journal.length === 0 ? (
                          <div className="text-center text-slate-500 py-10">暂无记录</div>
                      ) : (
                          journal.map(entry => (
                              <div key={entry.id} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 hover:border-indigo-500/50 transition-colors">
                                  <div className="flex justify-between text-xs text-slate-400 mb-2">
                                      <span>{new Date(entry.timestamp).toLocaleString()}</span>
                                      <span className="bg-indigo-900/50 px-2 py-0.5 rounded text-indigo-300">{entry.spreadName}</span>
                                  </div>
                                  <h4 className="font-bold text-slate-200 mb-2">{entry.question}</h4>
                                  <div className="flex gap-2 overflow-x-auto pb-2 mb-2">
                                      {entry.cards.map((c, i) => (
                                          <div key={i} className="flex-shrink-0 text-xs bg-slate-900 px-2 py-1 rounded border border-slate-700">
                                              <span className="text-slate-500 mr-1">{c.positionName}:</span>
                                              <span className={c.card.isReversed ? 'text-red-400' : 'text-amber-200'}>
                                                  {c.card.name_cn} {c.card.isReversed && '(逆)'}
                                              </span>
                                          </div>
                                      ))}
                                  </div>
                                  {entry.userNotes && (
                                      <div className="text-sm text-slate-400 italic border-l-2 border-slate-600 pl-2 mt-2">
                                          "{entry.userNotes}"
                                      </div>
                                  )}
                                  <details className="mt-2 text-sm text-slate-300">
                                      <summary className="cursor-pointer text-indigo-400 hover:text-indigo-300 text-xs mb-2 list-none flex items-center gap-1">
                                          查看详细解读 <ChevronRight size={12} />
                                      </summary>
                                      <div className="p-3 bg-slate-900/50 rounded mt-2 max-h-40 overflow-y-auto whitespace-pre-line text-xs">
                                          {entry.interpretation}
                                      </div>
                                  </details>
                              </div>
                          ))
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl">
                  <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-serif text-amber-100">个性化设置</h2>
                      <button onClick={() => setShowSettings(false)}><X className="text-slate-400 hover:text-white" /></button>
                  </div>
                  
                  <div className="space-y-6">
                      <div>
                          <label className="block text-sm font-bold text-slate-300 mb-3">选择牌背主题</label>
                          <div className="grid grid-cols-3 gap-3">
                              {DECK_THEMES.map(theme => (
                                  <div 
                                    key={theme.id}
                                    onClick={() => setCurrentTheme(theme)}
                                    className={`cursor-pointer rounded-lg p-1 border-2 transition-all ${currentTheme.id === theme.id ? 'border-amber-500' : 'border-transparent hover:border-slate-600'}`}
                                  >
                                      <div 
                                        className="w-full aspect-[2/3] rounded bg-slate-800 shadow-inner"
                                        style={{ background: theme.backColor }}
                                      ></div>
                                      <p className="text-center text-xs mt-2 text-slate-400">{theme.name}</p>
                                  </div>
                              ))}
                          </div>
                      </div>

                      <div className="pt-4 border-t border-slate-700">
                          <label className="block text-sm font-bold text-slate-300 mb-3">上传自定义牌背</label>
                          <div className="flex items-center gap-4">
                              <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="flex-1 flex items-center justify-center gap-2 py-3 border border-dashed border-slate-500 rounded-lg hover:bg-slate-800 transition-colors text-slate-400"
                              >
                                  <Upload size={16} /> 选择图片
                              </button>
                              <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleImageUpload}
                              />
                          </div>
                          {currentTheme.id === 'custom' && currentTheme.backImage && (
                              <div className="mt-3 text-xs text-green-400 flex items-center gap-1">
                                  <Sparkles size={12} /> 已应用自定义图片
                              </div>
                          )}
                      </div>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default App;
