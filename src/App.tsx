import { Route, Routes } from 'react-router-dom'
import Welcome from './pages/Welcome'
import CreateRoom from './pages/CreateRoom'
import JoinRoom from './pages/JoinRoom'
import ChatRoom from './pages/ChatRoom'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/create" element={<CreateRoom />} />
      <Route path="/join" element={<JoinRoom />} />
      <Route path="/room/:code" element={<ChatRoom />} />
    </Routes>
  )
}
