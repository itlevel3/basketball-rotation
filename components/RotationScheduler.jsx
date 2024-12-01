"use client"

import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const RotationScheduler = () => {
  const [players, setPlayers] = useState('');
  const [playersOnCourt, setPlayersOnCourt] = useState(5);
  const [gameTime, setGameTime] = useState(36);
  const [schedule, setSchedule] = useState(null);

  const calculateSchedule = () => {
    const playerList = players.split('\n').filter(p => p.trim());
    if (playerList.length < playersOnCourt) {
      return null;
    }

    const minutesPerPlayer = Math.floor((gameTime * playersOnCourt) / playerList.length);
    const rotationInterval = 3; // 3-minute rotations
    const periods = Math.ceil(gameTime / rotationInterval);
    
    let rotationSchedule = [];
    for (let period = 0; period < periods; period++) {
      const timeLeft = gameTime - (period * rotationInterval);
      const onCourt = playerList.slice(
        (period * playersOnCourt) % playerList.length,
        ((period * playersOnCourt) % playerList.length) + playersOnCourt
      );
      
      // If we don't have enough players, wrap around to the start
      while (onCourt.length < playersOnCourt) {
        onCourt.push(playerList[onCourt.length % playerList.length]);
      }
      
      rotationSchedule.push({
        time: timeLeft,
        players: onCourt
      });
    }

    return {
      minutesPerPlayer,
      schedule: rotationSchedule
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSchedule(calculateSchedule());
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

          <div className="border rounded overflow-hidden">
            <div className="bg-gray-100 p-3 font-medium">
              Rotation Schedule
            </div>
            <div className="divide-y">
              {schedule.schedule.map((rotation, i) => (
                <div key={i} className="p-3">
                  <div className="font-medium text-lg mb-2">
                    {rotation.time}:00
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {rotation.players.map((player, j) => (
                      <div key={j} className="bg-gray-50 p-2 rounded">
                        {player}
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
  );
};

export default RotationScheduler;
