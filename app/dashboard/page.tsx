import { Metadata } from 'next'
import PomodoroTimer from '@/components/pomodoro/PomodoroTimer'
import TaskManager from '@/components/tasks/TaskManager'

export const metadata: Metadata = {
  title: 'Dashboard | StudyHub',
  description: 'StudyHub Dashboard - Aplikasi Belajar Terpadu',
}

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">StudyHub Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <PomodoroTimer />
        </div>
        <div>
          <TaskManager />
        </div>
      </div>
    </div>
  )
}