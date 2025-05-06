'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { supabase } from '@/lib/supabase'
import { useState } from 'react'

type Task = {
  id: string
  title: string
  description?: string
  completed: boolean
  created_at: string
  due_date?: string
  priority: 'low' | 'medium' | 'high'
  category?: string
  user_id: string
  parent_id?: string
}

type TaskItemProps = {
  task: Task
}

export default function TaskItem({ task }: TaskItemProps) {
  const [completed, setCompleted] = useState(task.completed)
  
  const toggleTaskCompletion = async () => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: !completed })
        .eq('id', task.id)

      if (error) throw error
      setCompleted(!completed)
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const deleteTask = async () => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', task.id)

      if (error) throw error
      
      // Refresh halaman atau gunakan context untuk update state
      window.location.reload()
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  return (
    <div className={`flex items-center justify-between p-3 border rounded ${task.priority === 'high' ? 'border-red-300' : task.priority === 'medium' ? 'border-yellow-300' : 'border-green-300'}`}>
      <div className="flex items-center space-x-2">
        <Checkbox
          checked={completed}
          onCheckedChange={toggleTaskCompletion}
        />
        <div>
          <span className={completed ? 'line-through text-gray-500' : 'font-medium'}>
            {task.title}
          </span>
          {task.description && (
            <p className="text-sm text-gray-500">{task.description}</p>
          )}
          <div className="flex space-x-2 text-xs mt-1">
            {task.due_date && (
              <span className={`${new Date(task.due_date) < new Date() && !completed ? 'text-red-500' : 'text-gray-500'}`}>
                Tenggat: {new Date(task.due_date).toLocaleDateString('id-ID')}
              </span>
            )}
            {task.category && (
              <span className="text-blue-500">#{task.category}</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={deleteTask}
        >
          Hapus
        </Button>
      </div>
    </div>
  )
}