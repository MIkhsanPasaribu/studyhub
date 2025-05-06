'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { supabase } from '@/lib/supabase'

// Perbarui tipe Task untuk mendukung fitur tambahan
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

// Tambahkan state untuk fitur tambahan
const [taskDescription, setTaskDescription] = useState('')
const [taskDueDate, setTaskDueDate] = useState('')
const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium')
const [taskCategory, setTaskCategory] = useState('')
const [searchQuery, setSearchQuery] = useState('')
const [filterCompleted, setFilterCompleted] = useState<boolean | null>(null)
const [filterPriority, setFilterPriority] = useState<'low' | 'medium' | 'high' | null>(null)

// Modifikasi addTask untuk mendukung fitur tambahan
const addTask = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!newTaskTitle.trim()) return

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const newTask = {
      title: newTaskTitle,
      description: taskDescription,
      completed: false,
      due_date: taskDueDate || null,
      priority: taskPriority,
      category: taskCategory || null,
      user_id: user.id,
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert([newTask])
      .select()

    if (error) throw error
    if (data) {
      setTasks([data[0], ...tasks])
      resetForm()
    }
  } catch (error) {
    console.error('Error adding task:', error)
  }
}

// Fungsi untuk reset form
const resetForm = () => {
  setNewTaskTitle('')
  setTaskDescription('')
  setTaskDueDate('')
  setTaskPriority('medium')
  setTaskCategory('')
}

// Fungsi untuk filter dan pencarian
const filteredTasks = tasks.filter(task => {
  // Filter berdasarkan status penyelesaian
  if (filterCompleted !== null && task.completed !== filterCompleted) return false
  
  // Filter berdasarkan prioritas
  if (filterPriority !== null && task.priority !== filterPriority) return false
  
  // Pencarian berdasarkan judul atau deskripsi
  if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
      !task.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
    return false
  }
  
  return true
})

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      if (data) setTasks(data)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleTaskCompletion = async (taskId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: !completed })
        .eq('id', taskId)

      if (error) throw error

      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, completed: !completed } : task
      ))
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) throw error

      setTasks(tasks.filter(task => task.id !== taskId))
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  // Perbarui UI untuk mendukung fitur tambahan
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Task Management</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={addTask} className="space-y-4">
          <Input
            placeholder="Judul tugas..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            required
          />
          <Textarea
            placeholder="Deskripsi tugas (opsional)..."
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm">Tenggat Waktu</label>
              <Input
                type="date"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm">Prioritas</label>
              <Select value={taskPriority} onValueChange={(value) => setTaskPriority(value as 'low' | 'medium' | 'high')}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih prioritas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Rendah</SelectItem>
                  <SelectItem value="medium">Sedang</SelectItem>
                  <SelectItem value="high">Tinggi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm">Kategori</label>
              <Input
                placeholder="Kategori..."
                value={taskCategory}
                onChange={(e) => setTaskCategory(e.target.value)}
              />
            </div>
          </div>
          <Button type="submit" className="w-full">Tambah Tugas</Button>
        </form>

        <div className="mt-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Cari tugas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="md:w-1/3"
            />
            <Select value={filterCompleted === null ? '' : filterCompleted.toString()} 
                   onValueChange={(value) => setFilterCompleted(value === '' ? null : value === 'true')}>
              <SelectTrigger className="md:w-1/3">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Semua Status</SelectItem>
                <SelectItem value="true">Selesai</SelectItem>
                <SelectItem value="false">Belum Selesai</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority || ''} 
                   onValueChange={(value) => setFilterPriority(value === '' ? null : value as 'low' | 'medium' | 'high')}>
              <SelectTrigger className="md:w-1/3">
                <SelectValue placeholder="Filter prioritas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Semua Prioritas</SelectItem>
                <SelectItem value="low">Rendah</SelectItem>
                <SelectItem value="medium">Sedang</SelectItem>
                <SelectItem value="high">Tinggi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <p>Loading tasks...</p>
          ) : (
            <div className="space-y-2">
              {filteredTasks.length === 0 ? (
                <p>Tidak ada tugas yang sesuai dengan filter.</p>
              ) : (
                filteredTasks.map((task) => (
                  <div key={task.id} className={`flex items-center justify-between p-3 border rounded ${task.priority === 'high' ? 'border-red-300' : task.priority === 'medium' ? 'border-yellow-300' : 'border-green-300'}`}>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleTaskCompletion(task.id, task.completed)}
                      />
                      <div>
                        <span className={task.completed ? 'line-through text-gray-500' : 'font-medium'}>
                          {task.title}
                        </span>
                        {task.description && (
                          <p className="text-sm text-gray-500">{task.description}</p>
                        )}
                        <div className="flex space-x-2 text-xs mt-1">
                          {task.due_date && (
                            <span className={`${new Date(task.due_date) < new Date() && !task.completed ? 'text-red-500' : 'text-gray-500'}`}>
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
                        onClick={() => deleteTask(task.id)}
                      >
                        Hapus
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}