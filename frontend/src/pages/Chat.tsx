import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom';
import { socket } from '@/socket';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function Chat() {

  const location = useLocation()
  const { username, topic } = location.state || {}

  const defaultRoom = {
    roomId: "",
    topic: "",
    users: [],
    created_at: ""
  }
  const [message, setMessage] = useState([]);
  const [input, setInput] = useState("")
  const [waiting, setWaiting] = useState(true);
  const [room, setRoom] = useState(defaultRoom);
  const [endMsg, setEndMsg] = useState("")

  useEffect(() => {
    socket.connect();
    console.log(topic);

    socket.emit('join queue', { topic, username })

    socket.on('waiting', ({ topic }) => {
      console.log("start wait");

      setWaiting(true)
    })

    socket.on('room joined', ({ roomId, topic, users, created_at }) => {
      const time = new Date(created_at).toLocaleString()
      setRoom({
        roomId,
        topic,
        users,
        created_at: time
      })
      setWaiting(false);
    })

    socket.on('room ended', ({ reason, by }) => {
      setEndMsg(`${by} has disconnected. Room ended.`)
    })

    const handleMessage = (newMsg: any) => {
      setMessage((prev: any) => [...prev, newMsg]);
    };

    socket.on('message', handleMessage)

    return () => {
      socket.off("message", handleMessage);
      socket.off('waiting')
      socket.off('room joined')
      socket.off('room ended')
      socket.disconnect();
    };
  }, [])

  const sendMessageHandler = (e) => {
    e.preventDefault();
    if (input.length === 0) return;
    socket.emit('message', input)
    setInput("")
  }

  const findNewRoom = () => {
    socket.emit('join queue', { topic, username })
    setMessage([])
    setRoom(defaultRoom)
    setEndMsg("")
  }

  if (waiting) {
    return <div className="h-screen flex items-center justify-center text-lg">
      Waiting for a match…
    </div>
  }

  const otherUser = room?.users?.find((u: any) => u.name !== username)?.name || "Anonymous";
  return (
    <div>
      <div className="min-h-screen md:bg-[url('/ty_bg2_bw.png')] bg-cover bg-center h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-3xl text-slate-200 bg-darkbg h-[600px] border-black flex flex-col shadow-lg rounded-2xl">

          {/* Header */}
          <div className=" px-6">
            <h2 className="text-base font-semibold">{topic} Discussion with <span className='font-bold underline underline-offset-4'>{otherUser}</span></h2>
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>Room Details</AccordionTrigger>
                <AccordionContent>
                  <p>Room Id: {room.roomId}</p>
                  <p>Users: {username}, {otherUser}</p>
                  <p>Created at: {room.created_at}</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Messages */}
          <CardContent className="flex-1 bg-[url('/chat_bg.jpg')] bg-cover bg-center h-screen bg-orange-100 font-inter overflow-y-auto p-6 space-y-4">
            {
              message.length > 0 && message.map((msg, i) => (
                <div
                  className={`flex ${msg.user === username ? "justify-end" : "justify-start"
                    }`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-2 rounded-2xl md:text-base text-sm shadow
                        ${msg.user === username
                        ? "bg-button text-white rounded-br-md"
                        : "bg-verydark text-white rounded-bl-md"
                      }`}
                  >
                    {/* Message text */}
                    <p className="whitespace-pre-wrap break-words">
                      {msg.msg}
                    </p>

                    {/* Timestamp */}
                    <div
                      className={`mt-1 text-[10px] opacity-70 ${msg.user === username ? "text-right" : "text-left"
                        }`}
                    >
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))
            }
            {endMsg && (
              <div className="flex justify-center my-6">
                <div className="px-4 py-2 md:text-sm text-xs text-white bg-red-500 rounded-full shadow-sm">
                  {endMsg}
                  <a onClick={findNewRoom} className='hover:cursor-pointer underline inline mx-2 text-white'>
                    Find new Room?
                  </a>
                </div>

              </div>)
            }

          </CardContent>

          {/* Input */}
          <form onSubmit={sendMessageHandler}>
            <div className="px-4 flex gap-3">
              <Input
                placeholder="Type your message..."
                value={input}
                onChange={(e: any) => setInput(e.target.value)}
                className="flex-1 placeholder:text-slate-200"
              />
              <Button type='submit' className="px-6 bg-normal text-black hover:cursor-pointer hover:bg-button">Send</Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
