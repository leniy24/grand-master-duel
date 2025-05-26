
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Timer, Users } from 'lucide-react';

const Index = () => {
  const [playerA, setPlayerA] = useState('');
  const [playerB, setPlayerB] = useState('');
  const [selectedTimer, setSelectedTimer] = useState(10);
  const navigate = useNavigate();

  const handleStartGame = () => {
    if (!playerA.trim() || !playerB.trim()) {
      return;
    }

    // Random color assignment
    const isPlayerAWhite = Math.random() < 0.5;
    
    const gameState = {
      playerA: {
        name: playerA.trim(),
        color: isPlayerAWhite ? 'white' : 'black',
        timeLeft: selectedTimer * 60 // Convert to seconds
      },
      playerB: {
        name: playerB.trim(),
        color: isPlayerAWhite ? 'black' : 'white',
        timeLeft: selectedTimer * 60
      },
      currentTurn: 'white'
    };

    // Store in sessionStorage for the game page
    sessionStorage.setItem('chessGameState', JSON.stringify(gameState));
    navigate('/game');
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'2\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
      }} />
      
      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-lg"
        >
          <motion.div variants={itemVariants} className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <Crown className="w-16 h-16 text-yellow-400" />
                <div className="absolute inset-0 animate-pulse bg-yellow-400/20 rounded-full blur-xl" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Chess Master
            </h1>
            <p className="text-gray-400 text-lg">
              Challenge your opponent to a strategic battle
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="backdrop-blur-lg bg-gray-900/60 border-gray-700 shadow-2xl">
              <CardHeader className="text-center">
                <CardTitle className="text-white text-2xl flex items-center justify-center gap-2">
                  <Users className="w-6 h-6" />
                  Setup Game
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="playerA" className="text-gray-200 font-medium">
                      Player A
                    </Label>
                    <Input
                      id="playerA"
                      type="text"
                      placeholder="Enter player name"
                      value={playerA}
                      onChange={(e) => setPlayerA(e.target.value)}
                      className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-400 focus:ring-blue-400/20"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="playerB" className="text-gray-200 font-medium">
                      Player B
                    </Label>
                    <Input
                      id="playerB"
                      type="text"
                      placeholder="Enter player name"
                      value={playerB}
                      onChange={(e) => setPlayerB(e.target.value)}
                      className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-400 focus:ring-blue-400/20"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-gray-200 font-medium flex items-center gap-2">
                    <Timer className="w-4 h-4" />
                    Timer Duration
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant={selectedTimer === 5 ? "default" : "outline"}
                      onClick={() => setSelectedTimer(5)}
                      className={`${
                        selectedTimer === 5
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                          : 'bg-gray-800/50 hover:bg-gray-700 text-gray-200 border-gray-600'
                      } transition-all duration-200`}
                    >
                      5 Minutes
                    </Button>
                    <Button
                      variant={selectedTimer === 10 ? "default" : "outline"}
                      onClick={() => setSelectedTimer(10)}
                      className={`${
                        selectedTimer === 10
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                          : 'bg-gray-800/50 hover:bg-gray-700 text-gray-200 border-gray-600'
                      } transition-all duration-200`}
                    >
                      10 Minutes
                    </Button>
                  </div>
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={handleStartGame}
                    disabled={!playerA.trim() || !playerB.trim()}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Start Game
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="text-center mt-8 text-gray-500"
          >
            <p className="text-sm">
              Players will be randomly assigned white and black pieces
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
