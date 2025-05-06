'use client'

import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type TaskFiltersProps = {
  searchQuery: string
  setSearchQuery: (value: string) => void
  filterCompleted: boolean | null
  setFilterCompleted: (value: boolean | null) => void
  filterPriority: 'low' | 'medium' | 'high' | null
  setFilterPriority: (value: 'low' | 'medium' | 'high' | null) => void
}

export default function TaskFilters({
  searchQuery,
  setSearchQuery,
  filterCompleted,
  setFilterCompleted,
  filterPriority,
  setFilterPriority
}: TaskFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <Input
        placeholder="Cari tugas..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="md:w-1/3"
      />
      <Select 
        value={filterCompleted === null ? 'all' : filterCompleted.toString()} 
        onValueChange={(value) => setFilterCompleted(value === 'all' ? null : value === 'true')}
      >
        <SelectTrigger className="md:w-1/3">
          <SelectValue placeholder="Filter status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Status</SelectItem>
          <SelectItem value="true">Selesai</SelectItem>
          <SelectItem value="false">Belum Selesai</SelectItem>
        </SelectContent>
      </Select>
      <Select 
        value={filterPriority || 'all'} 
        onValueChange={(value) => setFilterPriority(value === 'all' ? null : value as 'low' | 'medium' | 'high')}
      >
        <SelectTrigger className="md:w-1/3">
          <SelectValue placeholder="Filter prioritas" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Prioritas</SelectItem>
          <SelectItem value="low">Rendah</SelectItem>
          <SelectItem value="medium">Sedang</SelectItem>
          <SelectItem value="high">Tinggi</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}