import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ShoppingBag, Database, Activity } from 'lucide-react';
import TerminalCard from '../components/TerminalCard';
import NeonButton from '../components/NeonButton';
import GlitchText from '../components/GlitchText';
import { useGame } from '../context/GameContext';
import { motion as Motion, animate, useMotionValue } from 'framer-motion';
import MeteorShower from '../components/MeteorShower';

const Dashboard = () => {
  const navigate = useNavigate();
  const { gameState, setAnaDialogue } = useGame();
  const pointsMV = useMotionValue(0);
  const tokensMV = useMotionValue(0);
  const [pointsDisplay, setPointsDisplay] = useState(0);
  const [tokensDisplay, setTokensDisplay] = useState(0);

  useEffect(() => {
    setAnaDialogue("Dashboard accessed. Choose your mission protocol.");
  }, [setAnaDialogue]);

  useEffect(() => {
    const stopPoints = animate(pointsMV, gameState.points ?? 0, { duration: 0.6, ease: 'easeOut' });
    const stopTokens = animate(tokensMV, gameState.tokens ?? 0, { duration: 0.6, ease: 'easeOut' });
    const unsubPoints = pointsMV.on('change', v => setPointsDisplay(Math.round(v)));
    const unsubTokens = tokensMV.on('change', v => setTokensDisplay(Math.round(v)));
    return () => {
      stopPoints.stop();
      stopTokens.stop();
      unsubPoints();
      unsubTokens();
    };
  }, [gameState.points, gameState.tokens, pointsMV, tokensMV]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 140, damping: 16 } }
  };

  return (
    <Motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex-1 p-6 md:p-12 space-y-8"
    >
      <MeteorShower />
      <Motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-gray-400 font-mono text-sm">CURRENT SESSION</h2>
          <GlitchText text={gameState.teamId ? `TEAM ${gameState.teamId}` : "UNKNOWN TEAM"} size="small" />
        </div>
        <div className="flex gap-6 text-right">
          <div>
            <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-neon-cyan font-bold text-xl">
              {pointsDisplay}
            </Motion.div>
            <div className="text-xs text-gray-400">POINTS</div>
          </div>
          <div>
            <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-neon-gold font-bold text-xl">
              {tokensDisplay}
            </Motion.div>
            <div className="text-xs text-gray-400">TOKENS</div>
          </div>
        </div>
      </Motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Motion.div variants={itemVariants} className="md:col-span-1">
          <Motion.div whileHover={{ scale: 1.01 }}>
            <TerminalCard title="DATA FRAGMENTS" className="h-full">
              <div className="space-y-4">
                {gameState.fragments.length === 0 ? (
                  <Motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8 text-gray-500 font-mono text-sm border border-dashed border-gray-700 p-4"
                  >
                    NO FRAGMENTS ACQUIRED
                  </Motion.div>
                ) : (
                  gameState.fragments.map((frag, idx) => (
                    <Motion.div 
                      key={idx} 
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center gap-2 text-neon-green text-sm font-mono"
                    >
                      <Database size={16} />
                      <span>{frag.toUpperCase()} FRAGMENT</span>
                    </Motion.div>
                  ))
                )}
              </div>
            </TerminalCard>
          </Motion.div>
        </Motion.div>

        <Motion.div variants={itemVariants} className="md:col-span-1 space-y-4">
          <Motion.div variants={itemVariants}>
            <NeonButton 
              className="w-full flex items-center justify-between group"
              onClick={() => navigate('/round1')}
            >
              <span>ROUND 1: FIREWALL</span>
              <Shield className="group-hover:text-white transition-colors" size={20} />
            </NeonButton>
          </Motion.div>
          
          <Motion.div variants={itemVariants}>
            <NeonButton 
              className="w-full flex items-center justify-between group"
              variant="secondary"
              onClick={() => navigate('/round2')}
            >
              <span>ROUND 2: MARKETPLACE</span>
              <ShoppingBag className="group-hover:text-white transition-colors" size={20} />
            </NeonButton>
          </Motion.div>

          <Motion.div variants={itemVariants}>
            <NeonButton 
              className="w-full flex items-center justify-between group"
              variant="danger"
              onClick={() => navigate('/round3')}
            >
              <span>ROUND 3: ANOMALY</span>
              <Activity className="group-hover:text-white transition-colors" size={20} />
            </NeonButton>
          </Motion.div>
        </Motion.div>

        <Motion.div variants={itemVariants} className="md:col-span-1">
          <Motion.div whileHover={{ scale: 1.01 }}>
            <TerminalCard title="SYSTEM STATUS" headerColor="gold">
              <div className="space-y-4 font-mono text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">CONNECTION</span>
                  <span className="text-neon-green">STABLE</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">SECURITY</span>
                  <span className="text-neon-cyan">{gameState.securityLevel}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">LATENCY</span>
                  <span className="text-neon-gold">12ms</span>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden">
                    <Motion.div 
                      initial={{ width: "0%" }}
                      animate={{ width: "75%" }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="bg-neon-cyan h-full"
                    />
                  </div>
                  <div className="flex justify-between text-xs mt-1 text-gray-500">
                    <span>SYSTEM LOAD</span>
                    <span>75%</span>
                  </div>
                </div>
              </div>
            </TerminalCard>
          </Motion.div>
        </Motion.div>
      </div>
    </Motion.div>
  );
};

export default Dashboard;
