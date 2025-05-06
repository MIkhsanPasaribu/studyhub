'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase'

type Note = {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  created_at: string
  updated_at: string
  user_id: string
}

export default function NoteEditor() {
  const [notes, setNotes] = useState<Note[]>([])
  const [activeNote, setActiveNote] = useState<Note | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState('')
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (error) throw error
      if (data) {
        setNotes(data)
        // Extract unique categories
        const uniqueCategories = [...new Set(data.map(note => note.category))]
        setCategories(uniqueCategories)
      }
    } catch (error) {
      console.error('Error fetching notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')

      if (isEditing && activeNote) {
        // Update existing note
        const { error } = await supabase
          .from('notes')
          .update({
            title,
            content,
            category,
            tags: tagArray,
            updated_at: new Date().toISOString()
          })
          .eq('id', activeNote.id)

        if (error) throw error

        setNotes(notes.map(note => 
          note.id === activeNote.id ? 
          { ...note, title, content, category, tags: tagArray, updated_at: new Date().toISOString() } : 
          note
        ))
      } else {
        // Create new note
        const newNote = {
          title,
          content,
          category,
          tags: tagArray,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        const { data, error } = await supabase
          .from('notes')
          .insert([newNote])
          .select()

        if (error) throw error
        if (data) {
          setNotes([data[0], ...notes])
          if (!categories.includes(category) && category) {
            setCategories([...categories, category])
          }
        }
      }

      resetForm()
    } catch (error) {
      console.error('Error saving note:', error)
    }
  }

  const deleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)

      if (error) throw error

      setNotes(notes.filter(note => note.id !== noteId))
      if (activeNote && activeNote.id === noteId) {
        resetForm()
      }
    } catch (error) {
      console.error('Error deleting note:', error)
    }
  }

  const editNote = (note: Note) => {
    setActiveNote(note)
    setTitle(note.title)
    setContent(note.content)
    setCategory(note.category || '')
    setTags(note.tags ? note.tags.join(', ') : '')
    setIsEditing(true)
  }

  const resetForm = () => {
    setActiveNote(null)
    setTitle('')
    setContent('')
    setCategory('')
    setTags('')
    setIsEditing(false)
  }

  const renderMarkdown = (text: string) => {
    // Implementasi sederhana untuk preview markdown
    // Untuk implementasi lengkap, gunakan library seperti marked atau remark
    return text
      .replace(/# (.+)/g, '<h1>$1</h1>')
      .replace(/## (.+)/g, '<h2>$1</h2>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
      .replace(/\n/g, '<br>')
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Catatan</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="editor" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="notes">Daftar Catatan</TabsTrigger>
          </TabsList>
          
          <TabsContent value="editor">
            <form onSubmit={saveNote} className="space-y-4">
              <div>
                <Input
                  placeholder="Judul catatan"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Input
                  placeholder="Kategori (mis: Matematika, Fisika)"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  list="categories"
                />
                <datalist id="categories">
                  {categories.map((cat, index) => (
                    <option key={index} value={cat} />
                  ))}
                </datalist>
              </div>
              
              <div>
                <Input
                  placeholder="Tag (pisahkan dengan koma)"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm mb-2">Konten (Markdown)</p>
                  <Textarea
                    placeholder="Tulis catatan Anda di sini..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[300px]"
                    required
                  />
                </div>
                <div>
                  <p className="text-sm mb-2">Preview</p>
                  <div 
                    className="border rounded p-4 min-h-[300px] overflow-auto"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
                  />
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button type="submit">
                  {isEditing ? 'Update Catatan' : 'Simpan Catatan'}
                </Button>
                {isEditing && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Batal
                  </Button>
                )}
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="notes">
            {loading ? (
              <p>Loading notes...</p>
            ) : (
              <div className="space-y-4">
                {notes.length === 0 ? (
                  <p>Belum ada catatan. Buat catatan baru!</p>
                ) : (
                  <div>
                    <Input 
                      placeholder="Cari catatan..."
                      className="mb-4"
                      onChange={(e) => {
                        // Implementasi pencarian sederhana
                        // Untuk implementasi lengkap, tambahkan state dan logika pencarian
                      }}
                    />
                    
                    {categories.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm mb-2">Filter berdasarkan kategori:</p>
                        <div className="flex flex-wrap gap-2">
                          {categories.map((cat, index) => (
                            <Button 
                              key={index} 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                // Implementasi filter berdasarkan kategori
                                // Untuk implementasi lengkap, tambahkan state dan logika filter
                              }}
                            >
                              {cat}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      {notes.map((note) => (
                        <div key={note.id} className="border rounded p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold">{note.title}</h3>
                            <div className="flex space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => editNote(note)}
                              >
                                Edit
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => deleteNote(note.id)}
                              >
                                Hapus
                              </Button>
                            </div>
                          </div>
                          
                          {note.category && (
                            <p className="text-sm text-gray-500 mb-1">Kategori: {note.category}</p>
                          )}
                          
                          {note.tags && note.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {note.tags.map((tag, index) => (
                                <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          <div 
                            className="mt-2 text-sm"
                            dangerouslySetInnerHTML={{ __html: renderMarkdown(note.content.substring(0, 200) + (note.content.length > 200 ? '...' : '')) }}
                          />
                          
                          <p className="text-xs text-gray-500 mt-2">
                            Diperbarui: {new Date(note.updated_at).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}