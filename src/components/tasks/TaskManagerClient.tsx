/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useTaskManager } from '@/hooks/useTaskManager'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import TaskItem from '@/components/tasks/TaskItem'
import TaskFilters from '@/components/tasks/TaskFilters'

export default function TaskManagerClient() {
  const {
    tasks,
    loading,
    newTaskTitle,
    setNewTaskTitle,
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
    addTask,
    filteredTasks
  } = useTaskManager()

  return (
    <>
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
        <TaskFilters 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterCompleted={filterCompleted}
          setFilterCompleted={setFilterCompleted}
          filterPriority={filterPriority}
          setFilterPriority={setFilterPriority}
        />

        {loading ? (
          <p>Loading tasks...</p>
        ) : (
          <div className="space-y-2">
            {filteredTasks.length === 0 ? (
              <p>Tidak ada tugas yang sesuai dengan filter.</p>
            ) : (
              filteredTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))
            )}
          </div>
        )}
      </div>
    </>
  )
}