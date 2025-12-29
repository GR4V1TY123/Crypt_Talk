import Home from './pages/Home';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Chat from './pages/Chat';
import { CookiesProvider } from 'react-cookie';

function App() {

  return (
    <BrowserRouter>
    <CookiesProvider defaultSetOptions={{ path: '/' }}>
      <div className="bg-brownbg font-inter  md:bg-[url('/ty_bg2_bw.png')] bg-cover bg-center h-screen">
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/chat' element={<Chat />} />
        </Routes>
      </div>
      </CookiesProvider>
    </BrowserRouter>
  )
}

export default App
