'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { supabase } from '@/lib/supabase'

type Event = {
  id: string
  title: string
  description: string
  start_date: string
  end_date: string
  is_all_day: boolean
  category: string
  user_id: string
}

type CalendarDay = {
  date: Date
  isCurrentMonth: boolean
  events: Event[]
}

export default function Calendar() {
  const [events, setEvents] = useState<Event[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([])
  const [loading, setLoading] = useState(true)
  const [showEventForm, setShowEventForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  
  // Form state
  const [eventTitle, setEventTitle] = useState('')
  const [eventDescription, setEventDescription] = useState('')
  const [eventStartDate, setEventStartDate] = useState('')
  const [eventEndDate, setEventEndDate] = useState('')
  const [eventIsAllDay, setEventIsAllDay] = useState(false)
  const [eventCategory, setEventCategory] = useState('')
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    generateCalendarDays()
  }, [currentDate, events])

  const fetchEvents = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)

      if (error) throw error
      if (data) setEvents(data)
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    // First day of the month
    const firstDay = new Date(year, month, 1)
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0)
    
    // Day of the week for the first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDay.getDay()
    
    // Total days in the month
    const daysInMonth = lastDay.getDate()
    
    // Calculate days from previous month to show
    const prevMonthDays = firstDayOfWeek
    
    // Calculate days from next month to show (to fill a 6-row calendar)
    const totalCells = 42 // 6 rows x 7 days
    const nextMonthDays = totalCells - daysInMonth - prevMonthDays
    
    const days: CalendarDay[] = []
    
    // Add days from previous month
    const prevMonth = new Date(year, month - 1, 0)
    const prevMonthLastDay = prevMonth.getDate()
    
    for (let i = prevMonthDays - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i)
      days.push({
        date,
        isCurrentMonth: false,
        events: getEventsForDate(date)
      })
    }
    
    // Add days from current month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i)
      days.push({
        date,
        isCurrentMonth: true,
        events: getEventsForDate(date)
      })
    }
    
    // Add days from next month
    for (let i = 1; i <= nextMonthDays; i++) {
      const date = new Date(year, month + 1, i)
      days.push({
        date,
        isCurrentMonth: false,
        events: getEventsForDate(date)
      })
    }
    
    setCalendarDays(days)
  }

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return events.filter(event => {
      const eventStart = event.start_date.split('T')[0]
      const eventEnd = event.end_date ? event.end_date.split('T')[0] : eventStart
      return dateStr >= eventStart && dateStr <= eventEnd
    })
  }

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
  }

  const handleDateClick = (day: CalendarDay) => {
    setSelectedDate(day.date)
    resetEventForm()
    setShowEventForm(true)
  }

  const resetEventForm = () => {
    setEventTitle('')
    setEventDescription('')
    setEventStartDate('')
    setEventEndDate('')
    setEventIsAllDay(false)
    setEventCategory('')
    setEditingEvent(null)
  }

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event)
    setEventTitle(event.title)
    setEventDescription(event.description || '')
    setEventStartDate(event.start_date.split('T')[0])
    setEventEndDate(event.end_date ? event.end_date.split('T')[0] : event.start_date.split('T')[0])
    setEventIsAllDay(event.is_all_day)
    setEventCategory(event.category || '')
    setShowEventForm(true)
  }

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventTitle || !eventStartDate) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const eventData = {
        title: eventTitle,
        description: eventDescription,
        start_date: eventStartDate,
        end_date: eventEndDate || eventStartDate,
        is_all_day: eventIsAllDay,
        category: eventCategory,
        user_id: user.id
      }

      if (editingEvent) {
        // Update existing event
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', editingEvent.id)

        if (error) throw error

        setEvents(events.map(event => 
          event.id === editingEvent.id ? { ...event, ...eventData } : event
        ))
      } else {
        // Create new event
        const { data, error } = await supabase
          .from('events')
          .insert([eventData])
          .select()

        if (error) throw error
        if (data) {
          setEvents([...events, data[0]])
        }
      }

      setShowEventForm(false)
      resetEventForm()
    } catch (error) {
      console.error('Error saving event:', error)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)

      if (error) throw error

      setEvents(events.filter(event => event.id !== eventId))
      setShowEventForm(false)
    } catch (error) {
      console.error('Error deleting event:', error)
    }
  }

  const getDayClass = (day: CalendarDay) => {
    let className = 'h-24 border p-1 relative'
    
    if (!day.isCurrentMonth) {
      className += ' bg-gray-100 text-gray-400'
    }
    
    const today = new Date()
    if (day.date.toDateString() === today.toDateString()) {
      className += ' bg-blue-50'
    }
    
    return className
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Kalender</CardTitle>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => navigateMonth(-1)}>
            &lt;
          </Button>
          <span className="py-2">{formatMonth(currentDate)}</span>
          <Button variant="outline" size="sm" onClick={() => navigateMonth(1)}>
            &gt;
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading calendar...</p>
        ) : (
          <>
            <div className="grid grid-cols-7 gap-0 mb-2">
              {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day, index) => (
                <div key={index} className="text-center font-medium py-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-0">
              {calendarDays.map((day, index) => (
                <div 
                  key={index} 
                  className={getDayClass(day)}
                  onClick={() => handleDateClick(day)}
                >
                  <div className="text-right">{day.date.getDate()}</div>
                  <div className="overflow-y-auto max-h-16">
                    {day.events.slice(0, 2).map((event, eventIndex) => (
                      <div 
                        key={eventIndex} 
                        className={`text-xs p-1 mb-1 rounded truncate ${event.category === 'deadline' ? 'bg-red-100' : 'bg-blue-100'}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditEvent(event)
                        }}
                      >
                        {event.title}
                      </div>
                    ))}
                    {day.events.length > 2 && (
                      <div className="text-xs text-gray-500">+{day.events.length - 2} lainnya</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <Dialog open={showEventForm} onOpenChange={setShowEventForm}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingEvent ? 'Edit Acara' : 'Tambah Acara Baru'}
                  </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSaveEvent} className="space-y-4 mt-4">
                  <div>
                    <Input
                      placeholder="Judul acara"
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Textarea
                      placeholder="Deskripsi (opsional)"
                      value={eventDescription}
                      onChange={(e) => setEventDescription(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm">Tanggal Mulai</label>
                      <Input
                        type="date"
                        value={eventStartDate}
                        onChange={(e) => setEventStartDate(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm">Tanggal Selesai</label>
                      <Input
                        type="date"
                        value={eventEndDate}
                        onChange={(e) => setEventEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="allDay"
                      checked={eventIsAllDay}
                      onChange={(e) => setEventIsAllDay(e.target.checked)}
                    />
                    <label htmlFor="allDay">Sepanjang hari</label>
                  </div>
                  
                  <div>
                    <select
                      className="w-full p-2 border rounded"
                      value={eventCategory}
                      onChange={(e) => setEventCategory(e.target.value)}
                    >
                      <option value="">Pilih kategori</option>
                      <option value="class">Kelas/Kuliah</option>
                      <option value="study">Belajar</option>
                      <option value="deadline">Deadline</option>
                      <option value="exam">Ujian</option>
                      <option value="other">Lainnya</option>
                    </select>
                  </div>
                  
                  <div className="flex justify-between">
                    <div>
                      {editingEvent && (
                        <Button 
                          type="button" 
                          variant="destructive"
                          onClick={() => handleDeleteEvent(editingEvent.id)}
                        >
                          Hapus
                        </Button>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setShowEventForm(false)}
                      >
                        Batal
                      </Button>
                      <Button type="submit">
                        Simpan
                      </Button>
                    </div>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </>
        )}
      </CardContent>
    </Card>
  )
}