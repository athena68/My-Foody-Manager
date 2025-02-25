export interface Location {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  tags: string[]
  rating: number
  notes: string
  photos: string[]
  visit_history: VisitHistory[]
  user_id: string
  created_at: string
}

export interface VisitHistory {
  date: string
  notes: string
}

export interface User {
  id: string
  name: string
  email: string
  avatar_url?: string
}

