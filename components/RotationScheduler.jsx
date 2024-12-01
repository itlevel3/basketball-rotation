"use client"

// ... [Previous imports remain the same] ...

const calculatePlayerMinutes = (schedule) => {
  const playerMinutes = {};
  
  schedule.forEach(rotation => {
    rotation.currentPlayers.forEach(player => {
      if (!playerMinutes[player]) {
        playerMinutes[player] = 0;
      }
      playerMinutes[player] += 3; // 3-minute rotations
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
  // ... [Previous state and functions remain the same, remove audio play code] ...

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* ... [Previous JSX remains the same until timer controls] ... */}

      {schedule && (
        <div className="space-y-4">
          {/* Game Progress Section */}
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
                {timeRemaining !== null ? formatTime(timeRemaining) : '--:--'}
              </div>
              <div className="flex items-center gap-8">
                <button
                  onClick={toggleTimer}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
                >
                  {isTimerRunning ? 
                    <><Pause className="h-6 w-6" /> Pause</> : 
                    <><Play className="h-6 w-6" /> Start</>
                  }
                </button>
                <button
                  onClick={resetTimer}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 flex items-center gap-2"
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

          {/* Rotation Schedule remains the same */}
          ...
        </div>
      )}
    </div>
  );
};

export default RotationScheduler;
