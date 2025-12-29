import React from 'react';
import { TarotCard, DeckTheme } from '../types';
import { Sparkles, Moon, Sun, Star, Eye, Feather, Zap, Anchor, Heart, Crown, Shield, Key } from 'lucide-react';

interface CardProps {
  card?: TarotCard;
  isFlipped: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  isSelected?: boolean;
  theme: DeckTheme;
  showDetails?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  card, 
  isFlipped, 
  onClick, 
  className = "", 
  style, 
  isSelected,
  theme,
  showDetails = true
}) => {
  
  // Helper to get an icon based on ID (to make cards visually distinct without images)
  const getCardIcon = (id: number) => {
    const icons = [
      Feather, // Fool
      Zap, // Magician
      Moon, // High Priestess
      Heart, // Empress
      Crown, // Emperor
      Key, // Hierophant
      Heart, // Lovers
      Shield, // Chariot
      Anchor, // Strength
      Eye, // Hermit
      Star, // Wheel
      ScaleIcon, // Justice - custom below
      Anchor, // Hanged Man
      Moon, // Death
      Feather, // Temperance
      Eye, // Devil
      Zap, // Tower
      Star, // Star
      Moon, // Moon
      Sun, // Sun
      Sparkles, // Judgement
      GlobeIcon // World
    ];
    const Icon = icons[id] || Star;
    return <Icon size={48} strokeWidth={1} />;
  };

  const ScaleIcon = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M2 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>;
  
  const GlobeIcon = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>;

  return (
    <div 
      onClick={onClick}
      style={style}
      className={`
        relative w-24 h-40 sm:w-32 sm:h-52 cursor-pointer perspective-1000 transition-all duration-500 transform 
        ${isSelected ? '-translate-y-4 shadow-[0_0_20px_rgba(168,85,247,0.6)]' : ''} 
        ${className}
      `}
    >
      <div className={`relative w-full h-full text-center transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
        
        {/* Card Back */}
        <div 
          className="absolute w-full h-full backface-hidden rounded-lg shadow-xl flex items-center justify-center overflow-hidden border border-white/10"
          style={{ 
             background: theme.backImage ? `url(${theme.backImage}) center/cover no-repeat` : theme.backColor,
          }}
        >
            {!theme.backImage && (
                <>
                    <div className="absolute inset-2 border border-white/20 rounded-md opacity-50"></div>
                    <Sparkles className="text-white/30 w-8 h-8 animate-pulse" />
                </>
            )}
        </div>

        {/* Card Front */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180 rounded-lg border-2 border-amber-500/30 bg-slate-900 shadow-2xl flex flex-col overflow-hidden">
          {card ? (
            <>
                <div className={`h-3/4 flex items-center justify-center relative p-2 overflow-hidden
                    ${theme.frontStyle === 'illustration' ? 'bg-gradient-to-b from-indigo-900 via-purple-900 to-slate-900' : 'bg-slate-800'}
                `}>
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/20 to-transparent"></div>
                    
                    {/* Icon / Illustration */}
                    <div className={`text-amber-100/90 transition-transform duration-700 ${card.isReversed ? 'rotate-180' : ''}`}>
                        {getCardIcon(card.id)}
                    </div>

                    <div className="absolute top-1 left-2 text-[10px] font-serif text-amber-500/50">
                        {card.id === 0 ? '0' : 'X'.repeat(Math.floor(card.id/10)) + ['','I','II','III','IV','V','VI','VII','VIII','IX'][card.id%10]}
                    </div>
                </div>
                
                {showDetails && (
                    <div className="h-1/4 bg-slate-950 flex flex-col items-center justify-center p-1 border-t border-amber-500/20 z-10">
                        <h3 className="text-amber-100 font-serif font-bold text-xs sm:text-sm leading-tight whitespace-nowrap overflow-hidden text-ellipsis px-1 w-full">{card.name_cn}</h3>
                        <p className="text-amber-300/60 text-[8px] uppercase tracking-widest mt-0.5">{card.name}</p>
                        {card.isReversed && <span className="text-red-400 text-[8px] font-bold mt-0.5">(逆位)</span>}
                    </div>
                )}
            </>
          ) : (
             <div className="w-full h-full bg-slate-800" />
          )}
        </div>
      </div>
    </div>
  );
};
