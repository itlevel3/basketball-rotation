"use client"

// ... [Previous imports remain the same] ...
const RotationScheduler = () => {
  // ... [Previous state declarations remain the same] ...
  const [gameTimeRemaining, setGameTimeRemaining] = useState(null);

  useEffect(() => {
    let timer;
    if (isTimerRunning && timeRemaining !== null) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            const audio = new Audio('/api/placeholder/audio');
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const newSchedule = calculateSchedule();
    setSchedule(newSchedule);
    setTimeRemaining(180); // 3 minutes for rotation
    setGameTimeRemaining(getTotalGameTime() * 60); // Total game time in seconds
    setCurrentRotationIndex(0);
    setIsTimerRunning(false);
  };

  // Add this right after the Alert component in the render:
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
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
          <div 
            className="bg-blue-600 h-4 rounded-full transition-all duration-1000"
            style={{ 
              width: `${((schedule.schedule.length - (currentRotationIndex + 1)) / schedule.schedule.length) * 100}%`
            }}
          />
        </div>

        {/* Rotation Timer */}
        <div className="flex flex-col items-center">
          <div className="text-sm text-gray-600">Current Rotation Time</div>
          <div className="text-3xl font-bold">
            {timeRemaining !== null ? formatTime(timeRemaining) : '--:--'}
          </div>
          <div className="flex justify-center gap-2 mt-2">
            <button
              onClick={toggleTimer}
              className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 flex items-center gap-2"
            >
              {isTimerRunning ? 
                <><Pause className="h-6 w-6" /> Pause</> : 
                <><Play className="h-6 w-6" /> Start</>
              }
            </button>
            <button
              onClick={resetTimer}
              className="bg-gray-600 text-white p-2 rounded hover:bg-gray-700 flex items-center gap-2"
            >
              <RotateCcw className="h-6 w-6" /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* In the rotation schedule, update the rotation display: */}
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
              {/* Add rotation number badge */}
              <div className="absolute top-2 right-2 bg-gray-200 text-gray-700 rounded-full px-2 py-1 text-sm">
                Rotation {i + 1}
              </div>
              
              {/* Rest of the rotation content remains the same */}
              ...
            </div>
          ))}
        </div>
      </div>
    </div>
  )}
