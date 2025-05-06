'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import { saveAs } from 'file-saver'
import { utils, write } from 'xlsx'

// Registrasi komponen Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

type PomodoroSession = {
  id: string
  start_time: string
  end_time: string
  duration: number
  mode: string
  is_completed: boolean
  user_id: string
  category: string
}

type TaskCompletion = {
  date: string
  completed: number
  total: number
}

type CategoryDistribution = {
  category: string
  minutes: number
  percentage: number
}

type TimeRange = 'daily' | 'weekly' | 'monthly'

export default function AnalyticsDashboard() {
  const [pomodoroSessions, setPomodoroSessions] = useState<PomodoroSession[]>([])
  const [taskCompletions, setTaskCompletions] = useState<TaskCompletion[]>([])
  const [categoryDistribution, setCategoryDistribution] = useState<CategoryDistribution[]>([])
  const [timeRange, setTimeRange] = useState<TimeRange>('weekly')
  const [totalFocusTime, setTotalFocusTime] = useState(0)
  const [averageDailyFocus, setAverageDailyFocus] = useState(0)
  const [mostProductiveDay, setMostProductiveDay] = useState('')
  const [completionRate, setCompletionRate] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Menentukan rentang tanggal berdasarkan timeRange
      const now = new Date()
      let startDate = new Date()
      
      if (timeRange === 'daily') {
        startDate.setHours(0, 0, 0, 0)
      } else if (timeRange === 'weekly') {
        startDate.setDate(now.getDate() - 7)
      } else if (timeRange === 'monthly') {
        startDate.setMonth(now.getMonth() - 1)
      }

      // Fetch pomodoro sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('pomodoro_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('start_time', startDate.toISOString())
        .order('start_time', { ascending: false })

      if (sessionsError) throw sessionsError

      // Fetch tasks untuk analisis penyelesaian tugas
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)

      if (tasksError) throw tasksError

      // Proses data untuk analitik
      if (sessionsData) {
        setPomodoroSessions(sessionsData)
        processAnalyticsData(sessionsData, tasksData || [])
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const processAnalyticsData = (sessions: PomodoroSession[], tasks: any[]) => {
    // Hitung total waktu fokus
    const totalMinutes = sessions.reduce((total, session) => {
      return total + (session.duration || 0)
    }, 0)
    setTotalFocusTime(totalMinutes)

    // Hitung rata-rata fokus harian
    const daysInRange = timeRange === 'daily' ? 1 : timeRange === 'weekly' ? 7 : 30
    setAverageDailyFocus(Math.round(totalMinutes / daysInRange))

    // Distribusi berdasarkan kategori
    const categoryMap = new Map<string, number>()
    sessions.forEach(session => {
      const category = session.category || 'Uncategorized'
      const current = categoryMap.get(category) || 0
      categoryMap.set(category, current + (session.duration || 0))
    })

    const distribution: CategoryDistribution[] = []
    categoryMap.forEach((minutes, category) => {
      distribution.push({
        category,
        minutes,
        percentage: Math.round((minutes / totalMinutes) * 100) || 0
      })
    })
    setCategoryDistribution(distribution.sort((a, b) => b.minutes - a.minutes))

    // Analisis hari paling produktif
    const dayMap = new Map<string, number>()
    sessions.forEach(session => {
      const date = new Date(session.start_time).toLocaleDateString('id-ID', { weekday: 'long' })
      const current = dayMap.get(date) || 0
      dayMap.set(date, current + (session.duration || 0))
    })

    let maxDay = ''
    let maxMinutes = 0
    dayMap.forEach((minutes, day) => {
      if (minutes > maxMinutes) {
        maxMinutes = minutes
        maxDay = day
      }
    })
    setMostProductiveDay(maxDay || 'Belum ada data')

    // Tren penyelesaian tugas
    const completionData: TaskCompletion[] = []
    const dateMap = new Map<string, { completed: number, total: number }>()

    // Inisialisasi data untuk setiap hari dalam rentang
    const dateIterator = new Date(startDate)
    while (dateIterator <= now) {
      const dateStr = dateIterator.toISOString().split('T')[0]
      dateMap.set(dateStr, { completed: 0, total: 0 })
      dateIterator.setDate(dateIterator.getDate() + 1)
    }

    // Hitung tugas selesai per hari
    tasks.forEach(task => {
      const createdDate = new Date(task.created_at).toISOString().split('T')[0]
      if (dateMap.has(createdDate)) {
        const data = dateMap.get(createdDate)!
        data.total += 1
        if (task.completed) {
          data.completed += 1
        }
        dateMap.set(createdDate, data)
      }
    })

    dateMap.forEach((data, date) => {
      completionData.push({
        date,
        completed: data.completed,
        total: data.total
      })
    })

    setTaskCompletions(completionData.sort((a, b) => a.date.localeCompare(b.date)))

    // Hitung tingkat penyelesaian tugas keseluruhan
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(task => task.completed).length
    setCompletionRate(totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0)
  }

  const formatMinutes = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}j ${mins}m`
  }

  // Implementasi ekspor data ke CSV
  const exportToCSV = () => {
    // Buat workbook dan worksheet
    const wb = utils.book_new()
    
    // Data fokus waktu
    const focusTimeData = pomodoroSessions.map(session => ({
      Tanggal: new Date(session.start_time).toLocaleDateString('id-ID'),
      'Waktu Mulai': new Date(session.start_time).toLocaleTimeString('id-ID'),
      'Waktu Selesai': new Date(session.end_time).toLocaleTimeString('id-ID'),
      'Durasi (menit)': session.duration,
      Mode: session.mode,
      Kategori: session.category || 'Uncategorized',
      Status: session.is_completed ? 'Selesai' : 'Tidak Selesai'
    }))
    
    // Buat worksheet untuk fokus waktu
    const wsFocus = utils.json_to_sheet(focusTimeData)
    utils.book_append_sheet(wb, wsFocus, 'Waktu Fokus')
    
    // Data penyelesaian tugas
    const taskCompletionData = taskCompletions.map(data => ({
      Tanggal: data.date,
      'Tugas Selesai': data.completed,
      'Total Tugas': data.total,
      'Persentase': data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
    }))
    
    // Buat worksheet untuk penyelesaian tugas
    const wsTask = utils.json_to_sheet(taskCompletionData)
    utils.book_append_sheet(wb, wsTask, 'Penyelesaian Tugas')
    
    // Ekspor ke file
    const wbout = write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([wbout], { type: 'application/octet-stream' })
    saveAs(blob, `studyhub-analytics-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const handleExportData = () => {
    exportToCSV()
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Dashboard Analitik Belajar</CardTitle>
        <div className="flex items-center space-x-2">
          <Select
            value={timeRange}
            onValueChange={(value) => setTimeRange(value as TimeRange)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Pilih Rentang Waktu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Harian</SelectItem>
              <SelectItem value="weekly">Mingguan</SelectItem>
              <SelectItem value="monthly">Bulanan</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportData}>Ekspor Data</Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">Memuat data analitik...</div>
        ) : (
          <div className="space-y-6">
            {/* Ringkasan Statistik */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Waktu Fokus</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatMinutes(totalFocusTime)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Rata-rata Harian</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatMinutes(averageDailyFocus)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Hari Paling Produktif</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mostProductiveDay}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Tingkat Penyelesaian Tugas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completionRate}%</div>
                </CardContent>
              </Card>
            </div>

            {/* Tab untuk berbagai visualisasi */}
            <Tabs defaultValue="focus">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="focus">Waktu Fokus</TabsTrigger>
                <TabsTrigger value="categories">Distribusi Kategori</TabsTrigger>
                <TabsTrigger value="tasks">Penyelesaian Tugas</TabsTrigger>
              </TabsList>

              <TabsContent value="focus" className="space-y-4">
                <div className="h-[300px] border rounded-md p-4">
                  {taskCompletions.length > 0 ? (
                    <Line
                      data={{
                        labels: taskCompletions.map(data => new Date(data.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' })),
                        datasets: [
                          {
                            label: 'Waktu Fokus (menit)',
                            data: taskCompletions.map((_, index) => {
                              // Hitung total waktu fokus per hari
                              const date = taskCompletions[index].date;
                              const sessionsForDay = pomodoroSessions.filter(session => 
                                new Date(session.start_time).toISOString().split('T')[0] === date
                              );
                              return sessionsForDay.reduce((total, session) => total + (session.duration || 0), 0);
                            }),
                            borderColor: 'rgb(53, 162, 235)',
                            backgroundColor: 'rgba(53, 162, 235, 0.5)',
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top' as const,
                          },
                          title: {
                            display: true,
                            text: 'Waktu Fokus Harian',
                          },
                        }
                      }}
                    />
                  ) : (
                    <div className="flex flex-col h-full justify-center items-center">
                      <p className="text-center text-muted-foreground">
                        Belum ada data waktu fokus untuk ditampilkan.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="categories" className="space-y-4">
                <div className="h-[300px] border rounded-md p-4">
                  {categoryDistribution.length > 0 ? (
                    <div className="space-y-2">
                      {categoryDistribution.map((item) => (
                        <div key={item.category} className="space-y-1">
                          <div className="flex justify-between">
                            <span>{item.category}</span>
                            <span>{formatMinutes(item.minutes)} ({item.percentage}%)</span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col h-full justify-center items-center">
                      <p className="text-center text-muted-foreground">
                        Belum ada data kategori untuk ditampilkan.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="tasks" className="space-y-4">
                <div className="h-[300px] border rounded-md p-4">
                  {taskCompletions.length > 0 ? (
                    <Bar
                      data={{
                        labels: taskCompletions.map(data => new Date(data.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' })),
                        datasets: [
                          {
                            label: 'Tugas Selesai',
                            data: taskCompletions.map(data => data.completed),
                            backgroundColor: 'rgba(75, 192, 192, 0.5)',
                          },
                          {
                            label: 'Total Tugas',
                            data: taskCompletions.map(data => data.total),
                            backgroundColor: 'rgba(153, 102, 255, 0.5)',
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top' as const,
                          },
                          title: {
                            display: true,
                            text: 'Penyelesaian Tugas Harian',
                          },
                        }
                      }}
                    />
                  ) : (
                    <div className="flex flex-col h-full justify-center items-center">
                      <p className="text-center text-muted-foreground">
                        Belum ada data penyelesaian tugas untuk ditampilkan.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {/* Prediksi Produktivitas */}
            <Card>
              <CardHeader>
                <CardTitle>Prediksi Produktivitas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Berdasarkan pola belajar Anda, waktu fokus terbaik adalah pada hari {mostProductiveDay}.
                  Kami menyarankan untuk menjadwalkan tugas-tugas penting pada hari tersebut.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  )
}