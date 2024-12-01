"use client"

import { useState, useEffect } from 'react';
import { AlertCircle, ArrowRightLeft, Play, Pause, RotateCcw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const RotationScheduler = () => {
  const [players, setPlayers] = useState('');
  const [playersOnCourt, setPlayersOnCourt] = useState(5);
  const [gameTime, setGameTime] = useState(36);
  const [schedule, setSchedule] = useState(null);
  const [starters, setStarters] = useState([]);
  // Timer states
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentRotationIndex, setCurrentRotationIndex] = useState(0);

  useEffect(() => {
    let timer;
    if (isTimerRunning && timeRemaining !== null) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Play notification sound when it's time to substitute
            const audio = new Audio('/api/placeholder/audio');
            audio.play().catch(() => {}); // Ignore errors if audio fails
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, timeRemaining]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    if (timeRemaining === 0) {
      // Move to next rotation if timer finished
      if (currentRotationIndex < schedule.schedule.length - 1) {
        setCurrentRotationIndex(prev => prev + 1);
        setTimeRemaining(180); // 3 minutes in seconds
      }
    }
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setTimeRemaining(180);
    setIsTimerRunning(false);
  };

  const handleStarterToggle = (playerName) => {
    setStarters(prev => {
      const isStarter = prev.includes(playerName);
      if (isStarter) {
        return prev.filter(p => p !== playerName);
      }
      if (prev.length < playersOnCourt) {
        return [...prev, playerName];
      }
      return prev;
    });
  };

  const calculateSchedule = () => {
    const playerList = players.split('\n').filter(p => p.trim());
    if (playerList.length < playersOnCourt) {
      return null;
    }

    // Start with designated starters
    let currentPlayers = [...starters];
    // Fill remaining spots with non-starters
    const nonStarters = playerList.filter(p => !starters.includes(p));
    while (currentPlayers.length < playersOnCourt) {
      currentPlayers.push(nonStarters[currentPlayers.length - starters.length]);
    }

    const minutesPerPlayer = Math.floor((gameTime * playersOnCourt) / playerList.length);
    const rotationInterval = 3;
    const periods = Math.ceil(gameTime / rotationInterval);
    
    let rotationSchedule = [];
    
    for (let period = 0; period < periods; period++) {
      const timeLeft = gameTime - (period * rotationInterval);
      const nextPlayers = playerList.slice(
        ((period + 1) * playersOnCourt) % playerList.length,
        (((period + 1) * playersOnCourt) % playerList.length) + playersOnCourt
      ).slice(0, playersOnCourt);
      
      while (nextPlayers.length < playersOnCourt) {
        nextPlayers.push(playerList[nextPlayers.length % playerList.length]);
      }
      
      const substitutions = [];
      for (let i = 0; i < playersOnCourt; i++) {
        if (currentPlayers[i] !== nextPlayers[i]) {
          substitutions.push({
            out: currentPlayers[i],
            in: nextPlayers[i]
          });
        }
      }
      
      rotationSchedule.push({
        time: timeLeft,
        currentPlayers: [...currentPlayers],
        substitutions
      });
      
      currentPlayers = [...nextPlayers];
    }

    return {
      minutesPerPlayer,
      schedule: rotationSchedule
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newSchedule = calculateSchedule();
    setSchedule(newSchedule);
    setTimeRemaining(180); // 3 minutes in seconds
    setCurrentRotationIndex(0);
    setIsTimerRunning(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Basketball Rotation Scheduler</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div>
          <label className="block font-medium mb-2">
            Enter Player Names (one per line):
          </label>
          <textarea 
            value={players}
            onChange={(e) => setPlayers(e.target.value)}
            className="w-full h-32 p-2 border rounded"
            placeholder="John Smith&#10;Jane Doe&#10;..."
          />
        </div>

        {players.split('\n').filter(p => p.trim()).length > 0 && (
          <div>
            <label className="block font-medium mb-2">
              Select Starters ({starters.length}/{playersOnCourt}):
            </label>
            <div className="grid grid-cols-2 gap-2">
              {players.split('\n').filter(p => p.trim()).map((player, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleStarterToggle(player)}
                  className={`p-2 rounded text-left ${
                    starters.includes(player)
                      ? 'bg-blue-100 border-blue-500 border'
                      : 'bg-gray-50 border-gray-200 border'
                  }`}
                >
                  {player}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div>
          <label className="block font-medium mb-2">
            Players on Court:
          </label>
          <select 
            value={playersOnCourt}
            onChange={(e) => setPlayersOnCourt(Number(e.target.value))}
            className="w-full p-2 border rounded"
          >
            <option value={5}>5</option>
            <option value={6}>6</option>
          </select>
        </div>
        
        <div>
          <label className="block font-medium mb-2">
            Game Time (minutes):
          </label>
          <input 
            type="number"
            value={gameTime}
            onChange={(e) => setGameTime(Number(e.target.value))}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <button 
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded font-medium hover:bg-blue-700"
        >
          Generate Schedule
        </button>
      </form>

      {schedule && (
        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Playing Time</AlertTitle>
            <AlertDescription>
              Each player will get approximately {schedule.minutesPerPlayer} minutes of game time
            </AlertDescription>
          </Alert>

          {/* Timer Section */}
          <div className="border rounded p-4 bg-gray-50">
            <div className="text-3xl font-bold text-center mb-2">
              {timeRemaining !== null ? formatTime(timeRemaining) : '--:--'}
            </div>
            <div className="flex justify-center gap-2">
              <button
                onClick={toggleTimer}
                className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
              >
                {isTimerRunning ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </button>
              <button
                onClick={resetTimer}
                className="bg-gray-600 text-white p-2 rounded hover:bg-gray-700"
              >
                <RotateCcw className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="border rounded overflow-hidden">
            <div className="bg-gray-100 p-3 font-medium">
              Rotation Schedule
            </div>
            <div className="divide-y">
              {schedule.schedule.map((rotation, i) => (
                <div key={i} className={`p-3 ${i === currentRotationIndex ? 'bg-blue-50' : ''}`}>
                  <div className="font-medium text-lg mb-2">
                    {rotation.time}:00
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-2">Currently Playing:</div>
                    <div className="grid grid-cols-2 gap-2">
                      {rotation.currentPlayers.map((player, j) => (
                        <div key={j} className="bg-gray-50 p-2 rounded">
                          {player} {starters.includes(player) && '⭐'}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {rotation.substitutions.length > 0 && (
                    <div>
                      <div className="text-sm text-gray-600 mb-2">Make these substitutions:</div>
                      <div className="space-y-2">
                        {rotation.substitutions.map((sub, j) => (
                          <div key={j} className="flex items-center gap-2 bg-blue-50 p-2 rounded">
                            <div className="font-medium text-red-600">
                              {sub.out} {starters.includes(sub.out) && '⭐'}
                            </div>
                            <ArrowRightLeft className="h-4 w-4" />
                            <div className="font-medium text-green-600">
                              {sub.in} {starters.includes(sub.in) && '⭐'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RotationScheduler;
