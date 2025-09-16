// pages/index.tsx
import { useState, useEffect, useRef } from 'react'
import { FiSearch, FiMoreVertical, FiPaperclip, FiSmile, FiMic, FiSend, FiPhone, FiVideo, FiInfo, FiArrowLeft } from 'react-icons/fi'
import { IoMdCheckmark, IoMdCheckmarkDone } from 'react-icons/io'
import { BsThreeDots } from 'react-icons/bs'

interface Message {
  id: string
  text: string
  senderId: string
  receiverId: string
  timestamp: string
}

interface User {
  id: string
  name: string
  avatar: string
  isOnline?: boolean
  lastSeen?: string
}

interface Database {
  users: User[]
  messages: Message[]
}

export default function Home({ darkMode, setDarkMode }: { darkMode: boolean; setDarkMode: (value: boolean) => void }) {
  const [users, setUsers] = useState<User[]>([])
  const [activeUser, setActiveUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch data from GitHub
  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`https://raw.githubusercontent.com/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/main/user.json`)
      if (!response.ok) throw new Error('Failed to fetch data')
      
      const data: Database = await response.json()
      setUsers(data.users)
      setMessages(data.messages)
      
      // Set current user (first user in the list)
      if (data.users.length > 0) {
        setCurrentUser(data.users[0])
      }
      
      setLoading(false)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load data. Please try again later.')
      setLoading(false)
    }
  }

  // Save data to GitHub (simulated)
  const saveData = async (updatedData: Database) => {
    // In a real app, you would use GitHub API with authentication to update the file
    // For this demo, we'll just update the local state
    console.log('Saving data to GitHub (simulated):', updatedData)
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Update local state
    setUsers(updatedData.users)
    setMessages(updatedData.messages)
  }

  useEffect(() => {
    fetchData()
    
    // Check if mobile
    setIsMobile(window.innerWidth < 768)
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (activeUser && currentUser) {
      // Filter messages between current user and active user
      const filteredMessages = messages.filter(
        msg => 
          (msg.senderId === currentUser.id && msg.receiverId === activeUser.id) ||
          (msg.senderId === activeUser.id && msg.receiverId === currentUser.id)
      )
      setMessages(filteredMessages)
    }
  }, [activeUser, currentUser, messages])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (newMessage.trim() && activeUser && currentUser) {
      const newMsg: Message = {
        id: Date.now().toString(),
        text: newMessage,
        senderId: currentUser.id,
        receiverId: activeUser.id,
        timestamp: new Date().toISOString()
      }
      
      // Create updated data
      const updatedData: Database = {
        users: users,
        messages: [...messages, newMsg]
      }
      
      // Save to GitHub (simulated)
      await saveData(updatedData)
      
      setNewMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) && user.id !== currentUser?.id
  )

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (date.toDateString() === today.toDateString()) {
      return 'Hari ini'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Kemarin'
    } else {
      return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })
    }
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <p className={`mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Memuat data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className="text-center p-6 rounded-lg bg-red-100 dark:bg-red-900 max-w-md">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Error</h3>
          <p className="mt-2 text-red-600 dark:text-red-300">{error}</p>
          <button 
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
      {/* Sidebar */}
      <div className={`w-full md:w-80 flex flex-col border-r ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} ${isMobile && showChat ? 'hidden' : 'flex'}`}>
        {/* Header */}
        <div className={`p-4 flex items-center justify-between ${darkMode ? 'bg-gray-900' : 'bg-green-600'}`}>
          <div className="flex items-center space-x-3">
            {currentUser && (
              <img src={currentUser.avatar} alt="My Avatar" className="w-10 h-10 rounded-full" />
            )}
            <h1 className="text-white font-semibold">WhatsApp</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-white hover:text-gray-200 transition-colors">
              <FiSearch size={20} />
            </button>
            <button className="text-white hover:text-gray-200 transition-colors">
              <BsThreeDots size={20} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className={`p-2 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <div className={`flex items-center px-3 py-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
            <FiSearch className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder="Cari atau mulai chat baru"
              className={`ml-2 flex-1 outline-none text-sm ${darkMode ? 'bg-transparent text-white placeholder-gray-400' : 'bg-gray-100 text-gray-700 placeholder-gray-500'}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className={`flex items-center p-3 hover:${darkMode ? 'bg-gray-700' : 'bg-gray-100'} cursor-pointer transition-colors ${activeUser?.id === user.id ? (darkMode ? 'bg-gray-700' : 'bg-gray-200') : ''}`}
              onClick={() => {
                setActiveUser(user)
                if (isMobile) setShowChat(true)
              }}
            >
              <div className="relative">
                <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full" />
                {user.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                )}
              </div>
              <div className="ml-3 flex-1">
                <div className="flex justify-between items-baseline">
                  <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user.name}</h3>
                  {user.lastSeen && (
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formatTime(user.lastSeen)}
                    </span>
                  )}
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {user.isOnline ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${isMobile && !showChat ? 'hidden' : 'flex'}`}>
        {activeUser ? (
          <>
            {/* Chat Header */}
            <div className={`flex items-center justify-between p-3 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center">
                {isMobile && (
                  <button 
                    className="mr-3 text-gray-600 dark:text-gray-400"
                    onClick={() => setShowChat(false)}
                  >
                    <FiArrowLeft size={24} />
                  </button>
                )}
                <div className="relative">
                  <img src={activeUser.avatar} alt={activeUser.name} className="w-10 h-10 rounded-full" />
                  {activeUser.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                  )}
                </div>
                <div className="ml-3">
                  <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{activeUser.name}</h3>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {activeUser.isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>
                  <FiPhone size={20} />
                </button>
                <button className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>
                  <FiVideo size={20} />
                </button>
                <button className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>
                  <FiSearch size={20} />
                </button>
                <button className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>
                  <FiMoreVertical size={20} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className={`flex-1 overflow-y-auto p-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Belum ada pesan. Mulai chat sekarang!</p>
                </div>
              ) : (
                messages.map((message, index, array) => {
                  const showDate = index === 0 || 
                    formatDate(message.timestamp) !== formatDate(array[index - 1].timestamp)
                  
                  return (
                    <div key={message.id}>
                      {showDate && (
                        <div className="flex justify-center my-4">
                          <span className={`text-xs px-3 py-1 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-600'}`}>
                            {formatDate(message.timestamp)}
                          </span>
                        </div>
                      )}
                      <div className={`flex ${message.senderId === currentUser?.id ? 'justify-end' : 'justify-start'} mb-2`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${message.senderId === currentUser?.id ? (darkMode ? 'bg-green-700' : 'bg-green-500 text-white') : (darkMode ? 'bg-gray-800' : 'bg-white')}`}>
                          <p className="text-sm">{message.text}</p>
                          <div className={`flex items-center justify-end mt-1 space-x-1 ${message.senderId === currentUser?.id ? (darkMode ? 'text-green-300' : 'text-green-100') : (darkMode ? 'text-gray-500' : 'text-gray-400')}`}>
                            <span className="text-xs">{formatTime(message.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className={`p-3 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center space-x-2">
                <button className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>
                  <FiSmile size={24} />
                </button>
                <button className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>
                  <FiPaperclip size={24} />
                </button>
                <div className={`flex-1 px-4 py-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <textarea
                    className={`w-full outline-none resize-none text-sm ${darkMode ? 'bg-transparent text-white placeholder-gray-400' : 'bg-gray-100 text-gray-700 placeholder-gray-500'}`}
                    placeholder="Ketik pesan"
                    rows={1}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                </div>
                {newMessage.trim() ? (
                  <button 
                    className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors"
                    onClick={handleSendMessage}
                  >
                    <FiSend size={20} />
                  </button>
                ) : (
                  <button className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>
                    <FiMic size={24} />
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className={`flex-1 flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
            <div className="text-center">
              <img src="https://picsum.photos/seed/whatsapp/200/200" alt="WhatsApp" className="w-32 h-32 mx-auto mb-4 opacity-50" />
              <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>WhatsApp Web</h3>
              <p className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Kirim dan terima pesan tanpa perlu menyimpan ponsel Anda.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
