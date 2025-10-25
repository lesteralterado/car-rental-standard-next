'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MessageCircle, X, Send } from 'lucide-react'

interface Message {
  id: number
  text: string
  sender: 'user' | 'bot'
}

const responses: Record<string, string> = {
  booking: "To book a car, select your preferred vehicle, choose dates, and complete the payment. You can do this directly on our website!",
  price: "Our prices start from ₱500 per day. Check our featured cars section for current rates and promotions.",
  location: "We have pickup locations in Manila, Cebu, and Davao. You can choose your preferred location during booking.",
  insurance: "All our rentals include basic insurance coverage. Additional coverage options are available for extra peace of mind.",
  support: "Our 24/7 support team is here to help! Contact us anytime for assistance.",
  default: "I'm here to help with your car rental questions. Ask me about booking, prices, locations, or support!"
}

const getBotResponse = (userMessage: string): string => {
  const lowerMessage = userMessage.toLowerCase()
  for (const [keyword, response] of Object.entries(responses)) {
    if (keyword !== 'default' && lowerMessage.includes(keyword)) {
      return response
    }
  }
  return responses.default
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hi! I'm your car rental assistant. How can I help you today?", sender: 'bot' }
  ])
  const [inputValue, setInputValue] = useState('')

  const handleSend = () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user'
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: messages.length + 2,
        text: getBotResponse(inputValue),
        sender: 'bot'
      }
      setMessages(prev => [...prev, botResponse])
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend()
    }
  }

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="icon"
          className="rounded-full w-12 h-12 shadow-lg"
        >
          {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        </Button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-80 max-w-sm">
          <Card className="p-4 shadow-xl border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Car Rental Assistant</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="w-6 h-6"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Messages */}
            <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-2 rounded-lg text-sm ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white ml-8'
                      : 'bg-gray-100 text-gray-800 mr-8'
                  }`}
                >
                  {message.text}
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your question..."
                className="flex-1"
              />
              <Button onClick={handleSend} size="icon" disabled={!inputValue.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}