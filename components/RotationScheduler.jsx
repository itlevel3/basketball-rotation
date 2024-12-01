"use client"

import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, ArrowRightLeft } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const calculatePlayerMinutes = (schedule) => {
  const playerMinutes = {};
  
  schedule.forEach(rotation => {
    rotation.currentPlayers.forEach(player => {
      if (!playerMinutes[player]) {
        playerMinutes[player] = 0;
      }
      playerMinutes[player] += 3;
    });
  });

  return Object.entries(playerMinutes)
    .map(([name, minutes]) => ({ 
      name, 
      minutes,
      rotations: Math.round(minutes / 3)
    }))
    .sort((a, b) => b.minutes - a.minutes);
};

const RotationScheduler = () => {
  const [players, setPlayers] = useState('');
  const [playersOnCourt, setPlayersOnCourt] = useState(5);
  const [periodType, setPeriodType] = useState('quarters');
  const [periodLength, setPeriodLength] = useState(10);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [gameTimeRemaining, setGameTimeRemaining] = useState(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentRotationIndex, setCurrentRotationIndex] = useState(0);
  const [schedule, setSchedule] = useState(null);
  const [starters, setStarters] = useState([]);

  useEffect(() => {
    let timer;
    if (isTimerRunning && timeRemaining !== null) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            const audio = new Audio('/notification.mp3');
            audio.play().catch(() => {});
            return 0;
          }
          return prev - 1;
        });

        setGameTimeRemaining(prev => {
          if (prev <= 1) return 0;
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, timeRemaining]);

  const formatTime = (seconds) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalGameTime = () => {
    return periodType === 'quarters' ? periodLength * 4 : periodLength * 2;
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

    let currentPlayers = [...starters];
    const nonStarters = playerList.filter(p => !starters.includes(p));
    while (currentPlayers.length < playersOnCourt) {
      currentPlayers.push(nonStarters[currentPlayers.length - starters.length]);
    }

    const totalGameTime = getTotalGameTime();
    const minutesPerPlayer = Math.floor((totalGameTime * playersOnCourt) / playerList.length);
    const rotationInterval = 3;
    const periods = Math.ceil(totalGameTime / rotationInterval);
    
    let rotationSchedule = [];
    
    for (let period = 0; period < periods; period++) {
      const timeLeft = totalGameTime - (period * rotationInterval);
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
        substitutions,
        isPeriodStart: timeLeft % periodLength === 0
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
    setTimeRemaining(180);
    setGameTimeRemaining(getTotalGameTime() * 60);
    setCurrentRotationIndex(0);
    setIsTimerRunning(false);
  };

  const formatPeriodLabel = (timeInMinutes) => {
    const period = periodType === 'quarters' 
      ? `Q${Math.ceil((getTotalGameTime() - timeInMinutes + 1) / periodLength)}`
      : `H${Math.ceil((getTotalGameTime() - timeInMinutes + 1) / periodLength)}`;
    const timeInPeriod = timeInMinutes % periodLength || periodLength;
    return `${period} - ${timeInPeriod}:00`;
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Basketball Rotation Scheduler</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div>
          <label className="block font-medium mb-2">Game Format:</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <select
                value={periodType}
                onChange={(e) => setPeriodType(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="quarters">Quarters</option>
                <option value="halves">Halves</option>
              </select>
            </div>
            <div>
              <input
                type="number"
                value={periodLength}
                onChange={(e) => setPeriodLength(Number(e.target.value))}
                className="w-full p-2 border rounded"
                placeholder="Minutes per period"
              />
            </div>
          </div>
        </div>

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
            <AlertTitle>Playing Time</AlertTitle>
            <AlertDescription>
              Each player will get approximately {schedule.minutesPerPlayer} minutes of game time
            </AlertDescription>
          </Alert>

          <div className="border rounded p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <div className="text-lg font-semibold">
                Overall Game Time: {formatTime(gameTimeRemaining)}
              </div>
              <div className="text-lg font-semibold">
                Rotation {currentRotationIndex + 1} of {schedule.schedule.length}
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
              <div 
                className="bg-blue-600 h-4 rounded-full transition-all duration-1000"
                style={{ 
                  width: `${((schedule.schedule.length - (currentRotationIndex + 1)) / schedule.schedule.length) * 100}%`
                }}
              />
            </div>

            <div className="flex flex-col items-center">
              <div className="text-sm text-gray-600">Current Rotation Time</div>
              <div className="text-3xl font-bold mb-4">
                {formatTime(timeRemaining)}
              </div>
              <div className="flex justify-between w-full px-8">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
                >
                  {isTimerRunning ? 
                    <><Pause className="h-6 w-6" /> Pause</> : 
                    <><Play className="h-6 w-6" /> Start</>
                  }
                </button>
                <button
                  onClick={() => {
                    setTimeRemaining(180);
                    setIsTimerRunning(false);
                  }}
                  className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700 flex items-center gap-2"
                >
                  <RotateCcw className="h-6 w-6" /> Reset Rotation
                </button>
              </div>
            </div>
          </div>

          {/* Player Minutes Summary */}
          <div className="border rounded overflow-hidden">
            <div className="bg-gray-100 p-3 font-medium">
              Player Minutes Summary
            </div>
            <div className="p-3">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Player</th>
                    <th className="text-center py-2">Rotations</th>
                    <th className="text-right py-2">Minutes</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {calculatePlayerMinutes(schedule.schedule).map((player) => (
                    <tr key={player.name}>
                      <td className="py-2">
                        {player.name} {starters.includes(player.name) && '⭐'}
                      </td>
                      <td className="text-center py-2">{player.rotations}</td>
                      <td className="text-right py-2">{player.minutes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border rounded overflow-hidden">
            <div className="bg-gray-100 p-3 font-medium flex justify-between items-center">
              <span>Rotation Schedule</span>
              <span className="text-sm text-gray-600">
                Current: Rotation {currentRotationIndex + 1}/{schedule.schedule.length}
              </span>
            </div>
            <div className="divide-y">
              {schedule.schedule.map((rotation, i) => (
                <div 
                  key={i} 
                  className={`p-3 relative ${
                    rotation.isPeriodStart ? 'bg-yellow-50' : ''
                  } ${
                    i === currentRotationIndex ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="absolute top-2 right-2 bg-gray-200 text-gray-700 rounded-full px-2 py-1 text-sm">
                    Rotation {i + 1}
                  </div>
                  
                  <div className="font-medium text-lg mb-2">
                    {formatPeriodLabel(rotation.time)}
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
