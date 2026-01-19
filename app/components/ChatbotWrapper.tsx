'use client'

import useAuth from '@/hooks/useAuth'
import Chatbot from './Chatbot'

export default function ChatbotWrapper() {
  const { isAdmin } = useAuth()

  // Only show chatbot if user is not an admin
  if (isAdmin) {
    return null
  }

  return <Chatbot />
}