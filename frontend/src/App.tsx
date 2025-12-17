import { useEffect, useState } from 'react';
import { Button } from './components/ui/button'
import { socket } from './socket';
import Home from './../pages/Home';

function App() {

  const [input, setInput] = useState("")
  const [msg, setMsg] = useState([])

  const submitHandler = (e: any) => {
    e.preventDefault();
    console.log(input);
    socket.emit('chat message', input)
  }

  useEffect(() => {
    socket.on("chat history", (history) => {
      setMsg(history);
    });

    socket.on("chat message", (newMsg) => {
      setMsg(prev => [...prev, newMsg]);
    });

    // cleanup
    return () => {
      socket.off("chat history");
      socket.off("chat message");
    };
  }, []);

  return (
    <div className='bg-[#F3E9DC] font-Agbalumo'>
      <Home />
    </div>
  )
}

export default App
