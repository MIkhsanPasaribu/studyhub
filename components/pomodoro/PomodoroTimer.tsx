'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type TimerMode = {
  name: string
  workTime: number
  breakTime: number
}

const timerModes: TimerMode[] = [
  { name: 'Default', workTime: 25, breakTime: 5 },
  { name: 'Long', workTime: 45, breakTime: 15 },
  { name: 'Custom', workTime: 30, breakTime: 10 },
]

export default function PomodoroTimer() {
  const [activeMode, setActiveMode] = useState<TimerMode>(timerModes[0])
  const [isWorking, setIsWorking] = useState(true)
  const [isActive, setIsActive] = useState(false)
  const [time, setTime] = useState(activeMode.workTime * 60)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1)
      }, 1000)
    } else if (isActive && time === 0) {
      // Switch between work and break
      setIsWorking(!isWorking)
      setTime(isWorking ? activeMode.breakTime * 60 : activeMode.workTime * 60)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, time, isWorking, activeMode])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleModeChange = (mode: TimerMode) => {
    setActiveMode(mode)
    setTime(isWorking ? mode.workTime * 60 : mode.breakTime * 60)
    setIsActive(false)
  }

  const toggleTimer = () => {
    setIsActive(!isActive)
  }

  const resetTimer = () => {
    setIsActive(false)
    setIsWorking(true)
    setTime(activeMode.workTime * 60)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Pomodoro Timer</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={timerModes[0].name} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            {timerModes.map((mode) => (
              <TabsTrigger
                key={mode.name}
                value={mode.name}
                onClick={() => handleModeChange(mode)}
              >
                {mode.name}
              </TabsTrigger>
            ))}
          </TabsList>
          {timerModes.map((mode) => (
            <TabsContent key={mode.name} value={mode.name}>
              <div className="text-center">
                <div className="text-4xl font-bold my-8">{formatTime(time)}</div>
                <div className="text-lg mb-4">
                  {isWorking ? 'Fokus!' : 'Istirahat!'}
                </div>
                <div className="flex justify-center space-x-4">
                  <Button onClick={toggleTimer}>
                    {isActive ? 'Pause' : 'Start'}
                  </Button>
                  <Button variant="outline" onClick={resetTimer}>
                    Reset
                  </Button>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}