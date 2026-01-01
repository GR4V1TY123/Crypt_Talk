import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
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
import { Download, LogOut, RefreshCcw } from 'lucide-react';
import LoadingPage from './LoadingPage';
import { useCookies } from 'react-cookie';
import useDownload from '@/hooks/useDownload';
import Editor from '@/components/Editor';
import { ChevronLeft, ChevronRight } from "lucide-react";


interface Message {
  id?: string;
  user: string;
  name?: string;
  msg: string;
  created_at: string | Date | number;
}

type RoomUser = {
  id: string;
  name: string;
} | undefined;

type Room = {
  roomId: string;
  topic: string;
  users: RoomUser[];
  created_at?: string;
  ideAccess?: string;
  ideValue?: string;
  requester?: string | null
};


export default function Chat() {


  const lastSentRef = useRef<string>("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate()

  const [cookies, setCookie] = useCookies(["username", "topic"]);

  const username = cookies.username;
  const topic = cookies.topic;

  const defaultRoom: Room = {
    roomId: "",
    topic: "",
    users: [],
    created_at: undefined
  }
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("")
  const [waiting, setWaiting] = useState(true);
  const [room, setRoom] = useState<Room | null>(defaultRoom);
  const [endMsg, setEndMsg] = useState("")
  const [code, setCode] = useState<string>("// write code here")

  const otherUser: RoomUser = room?.users?.find((u: RoomUser) => u?.name !== username);
  const currentUser: RoomUser = room?.users?.find((u: RoomUser) => u?.name === username);

  useEffect(() => {
    if (!username || !topic) {
      navigate('/');
    }
  }, [username, topic, navigate]);

  useEffect(() => {
    socket.connect();
    console.log(topic);

    socket.emit('join queue', { topic, username })

    socket.on('waiting', () => {
      console.log("start wait");

      setWaiting(true)
    })

    socket.on('room joined', ({ roomId, topic, users, created_at, ideAccess, ideValue, requester }) => {
      const time = new Date(created_at).toLocaleString()
      setRoom({
        roomId,
        topic,
        users,
        created_at: time,
        ideAccess,
        ideValue,
        requester
      })
      setWaiting(false);
    })

    socket.on('room ended', ({ by }) => {
      setEndMsg(`${by} has disconnected. Room ended.`)
    })

    const handleMessage = (newMsg: any) => {
      setMessages((prev: any) => [...prev, newMsg]);
    };

    socket.on('message', handleMessage)

    socket.on('write ide', (code: string) => {
      setCode(code);
    })

    return () => {
      socket.off("message", handleMessage);
      socket.off('waiting')
      socket.off('room joined')
      socket.off('room ended')
      socket.disconnect();
    };
  }, [])

  useEffect(() => {
    if (!currentUser || !room) return;
    if (currentUser.id !== room.ideAccess) return;
    if (code === lastSentRef.current) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      socket.emit("write ide", code);
      lastSentRef.current = code;
    }, 800);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [code, currentUser?.id, room?.ideAccess]);


  const handleCodeChange = (code: string) => {
    if (currentUser?.id !== room?.ideAccess) return;
    setCode(code);
  };

  const sendMessageHandler = (e: any) => {
    e.preventDefault();
    if (input.length === 0) return;
    socket.emit('message', input)
    setInput("")
  }

  const findNewRoom = () => {
    setWaiting(true)
    setMessages([])
    setRoom(defaultRoom)
    setEndMsg("")

    socket.disconnect();
    socket.connect()
    socket.emit('join queue', { topic, username })
  }

  const handleDownload = async () => {
    useDownload({ messages, username, room })
  }

  if (waiting) {
    return <LoadingPage />
  }

  return (
    <div>
      <div className="min-h-screen flex flex-col md:flex-row items-center justify-center gap-6 p-4">
        <Editor
          className="order-2 md:order-1 w-full md:max-w-1/4 h-full rounded-xl"
          code={code}
          handleCodeChange={handleCodeChange}
          ideAccess={room?.ideAccess}
          userId={currentUser?.id}
          requester={room?.requester}
        />

        <Card className="relative order-1 md:order-2 w-full max-w-3xl text-slate-200 bg-darkbg h-162.5 border-black flex flex-col shadow-lg shadow-button rounded-2xl">

          {/* Header */}
          <div className=" px-6">
            <div className="flex items-center justify-between gap-4">
              {/* Title */}
              <h2 className="text-base font-semibold text-white">
                {topic} Discussion with{" "}
                <span className="font-bold underline underline-offset-4">
                  {otherUser?.name}
                </span>
              </h2>

              {/* Actions */}
              <div className="flex items-center gap-4">
                <button
                  onClick={handleDownload}
                  className="p-2 rounded-full bg-white hover:cursor-pointer hover:bg-green-50 transition"
                >
                  <Download className="h-5 w-5 text-green-700" />
                </button>

                <button onClick={() => navigate('/')} className="p-2 rounded-full hover:cursor-pointer bg-red-50 transition">
                  <LogOut className="h-5 w-5 text-red-500" />
                </button>

                <button onClick={findNewRoom} className="p-2 rounded-full hover:cursor-pointer bg-blue-50 transition">
                  <RefreshCcw className="h-5 w-5 text-blue-500" />
                </button>
              </div>
            </div>

            {/* Room Info */}
            <div className="mt-3">
              <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-sm text-white">
                    Room Details
                  </AccordionTrigger>

                  <AccordionContent>
                    <div className="mt-2 space-y-1 text-sm text-white">
                      <p>
                        <span className="font-medium">Room ID:</span> {room?.roomId}
                      </p>
                      <p>
                        <span className="font-medium">Users:</span> {currentUser?.name}, {otherUser?.name}
                      </p>
                      <p>
                        <span className="font-medium">Created:</span>{" "}
                        {room?.created_at
                          ? new Date(room.created_at).toLocaleString()
                          : "Unknown"}
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>

          {/* Messages */}
          <CardContent className="flex-1 bg-[url('/chat_bg.jpg')] bg-cover bg-center h-screen bg-orange-100 font-inter overflow-y-auto p-6 space-y-3">
            {
              messages.length > 0 && messages.map((msg, i) => {
                const isMe = msg.user === currentUser?.name;

                return (
                  <div
                    key={i}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"} mb-2`}
                  >
                    {/* Sender name (only for other user) */}
                    {!isMe && (
                      <span className="text-[11px] text-black mb-1 ml-1">
                        {msg.user}
                      </span>
                    )}

                    <div
                      className={`max-w-[70%] px-4 py-1 rounded-2xl md:text-base text-sm shadow
            ${isMe
                          ? "bg-button text-white rounded-br-md"
                          : "bg-verydark text-white rounded-bl-md"
                        }`}
                    >
                      {/* Message text */}
                      <p className="whitespace-pre-wrap wrap-break-words">
                        {msg.msg}
                      </p>

                      {/* Timestamp */}
                      <div
                        className={`pb-1 text-[9px] opacity-70 ${isMe ? "text-right" : "text-left"}`}
                      >
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                );
              })
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
