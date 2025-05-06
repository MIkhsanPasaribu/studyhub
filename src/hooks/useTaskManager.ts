'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

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

export function useTaskManager() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [loading, setLoading] = useState(true)
  
  // State untuk fitur tambahan
  const [taskDescription, setTaskDescription] = useState('')
  const [taskDueDate, setTaskDueDate] = useState('')
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [taskCategory, setTaskCategory] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCompleted, setFilterCompleted] = useState<boolean | null>(null)
  const [filterPriority, setFilterPriority] = useState<'low' | 'medium' | 'high' | null>(null)

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

  const resetForm = () => {
    setNewTaskTitle('')
    setTaskDescription('')
    setTaskDueDate('')
    setTaskPriority('medium')
    setTaskCategory('')
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

  // Filter dan pencarian
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

  return {
    tasks,
    setTasks,
    newTaskTitle,
    setNewTaskTitle,
    loading,
    taskDescription,
    setTaskDescription,
    taskDueDate,
    setTaskDueDate,
    taskPriority,
    setTaskPriority,
    taskCategory,
    setTaskCategory,
    searchQuery,
    setSearchQuery,
    filterCompleted,
    setFilterCompleted,
    filterPriority,
    setFilterPriority,
    fetchTasks,
    addTask,
    resetForm,
    toggleTaskCompletion,
    deleteTask,
    filteredTasks
  }
}