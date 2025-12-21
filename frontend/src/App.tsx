import Home from './pages/Home';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Chat from './pages/Chat';

function App() {

  return (
    <BrowserRouter>
      <div className='bg-brownbg font-inter'>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/chat' element={<Chat />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
