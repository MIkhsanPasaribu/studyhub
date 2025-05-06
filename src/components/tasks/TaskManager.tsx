// Hapus 'use client' dari sini
import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import TaskManagerClient from '@/components/tasks/TaskManagerClient'
import { Skeleton } from '@/components/ui/skeleton'

export default function TaskManager() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Task Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<TaskManagerSkeleton />}>
          <TaskManagerClient />
        </Suspense>
      </CardContent>
    </Card>
  )
}

function TaskManagerSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-24 w-full" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-10 w-full" />
      <div className="space-y-2">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
  )
}