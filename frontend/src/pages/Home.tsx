import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { useCookies } from 'react-cookie';
import { CloudSync, DownloadCloud, HatGlasses } from "lucide-react";


export default function Home() {

  const navigate = useNavigate();
  const [userCookie, setUserCookie] = useCookies(['username']);
  const [topicCookie, setTopicCookie] = useCookies(['topic']);

  const [username, setUsername] = useState(`Anonymous_${Math.round(Math.random() * 1000000)}`);
  const [topic, setTopic] = useState("GENERAL");


  const [stats, setStats] = useState({
    activeUsers: 0,
    totalRooms: 0,
    queue: {
      DSA: 0,
      SYSTEM_DESIGN: 0,
      GENERAL: 0,
      COLLABORATION: 0,
      PROJECT: 0
    }
  })

  useEffect(() => {
    if (userCookie.username) {
      setUsername(userCookie.username)
    }
    if (topicCookie.topic) {
      setTopic(topicCookie.topic)
    }
    const fetchStats = async () => {
      try {
        const response = await fetch(`http://crypt-talk.up.railway.app/api/stats`);
        const data = await response.json();
        if (response.ok) setStats(data)
        console.log(data);

      } catch (error) {
        console.log(error);
      }
    }
    fetchStats();
    const id = setInterval(fetchStats, 5000);
    return () => clearInterval(id);
  }, [])


  const topics = [
    {
      val: "GENERAL",
      name: "General",
      desc: "Technical discussion, doubts, or just chill",
    },
    {
      val: "DSA",
      name: "DSA",
      desc: "Data Structures & Algorithms, interviews, problem solving",
    },
    // {
    //   val: "PROJECT",
    //   name: "Project",
    //   desc: "Discuss, build, or debug projects together",
    // },
    // {
    //   val: "SYSTEM_DESIGN",
    //   name: "System Design",
    //   desc: "Low-level & high-level system design interviews",
    // },
    // {
    //   val: "COLLABORATION",
    //   name: "Collaboration",
    //   desc: "Find your perfect project workbuddy",
    // },
  ];

  const handleSubmit = (e: any) => {
    e.preventDefault();
    console.log(topic);
    setUserCookie('username', username, { path: '/', maxAge: 3600 });
    setTopicCookie('topic', topic, { path: '/', maxAge: 3600 });

    navigate(`chat/`, {
      state: {
        username, topic
      }
    })
  }

  return (
    <div className="min-h-screen ">
      {/* Stats Badge */}
      {stats && (
        <div className="fixed top-6 right-6 z-50">
          <div className="bg-white border-2 border-black rounded-lg px-3 py-2 shadow-md">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm font-medium">{stats.activeUsers} online</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen">
          {/* Left Side - Hero + Form */}
          <div className="space-y-8">
            <div className="space-y-4">
              <img
                src="tech_chat.png"
                alt="Normal chat image"
                className="w-100 h-auto"
              />
              <h1 className="text-7xl lg:text-8xl font-bangers text-darkbg tracking-tight leading-none">
                Crypt_Talk
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Anonymous chat for developers. Connect instantly, discuss code, share ideas.
              </p>
            </div>


          </div>
          <Card className="w-full border-4 border-black shadow-lg">
            <CardContent className="p-8 space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-darkbg">Join Chat</h2>
                <p className="text-sm text-gray-600">Connect with anonymous developers</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-semibold text-button">
                      Your username
                    </label>
                    <Input
                      id="name"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="h-11 font-sans rounded-lg border-2 border-input bg-background font-semibold focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0"
                    />
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-semibold text-button">Select Topic</span>
                    <ToggleGroup
                      type="single"
                      variant="outline"
                      spacing={3}
                      className="flex-wrap justify-start"
                      value={topic}
                      onValueChange={(val) => val && setTopic(val)}
                    >
                      {topics.map((t) => (
                        <ToggleGroupItem
                          key={t.val}
                          value={t.val}
                          className="text-sm relative"
                        >
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-2 cursor-pointer">
                                  <span
                                    className={`h-2 w-2 rounded-full ${stats.queue[t.val as keyof typeof stats.queue] > 0
                                      ? "bg-green-500"
                                      : "bg-gray-300"
                                      }`}
                                  />
                                  <span className="text-xs font-medium">
                                    {t.name} ({stats.queue[t.val as keyof typeof stats.queue] ?? 0})
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p className="max-w-xs text-xs">{t.desc}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </div>

                  <Button
                    type="submit"
                    className="w-full text-lg items-center h-11 rounded-lg bg-button hover:bg-verydark text-primary-foreground font-semibold shadow-md"
                  >
                    Join Chat →
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Features + Video Section */}
        <div className="grid lg:grid-cols-2 gap-12 py-16">
          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-5 bg-white border-2 border-black rounded-lg">
              <div className="h-12 w-12 rounded-lg border-2 border-black bg-white flex items-center justify-center shrink-0">
                <span className="text-2xl"><HatGlasses/></span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-darkbg mb-1">Anonymous</h3>
                <p className="text-sm text-gray-600">Anonymous, real-time developer-to-developer conversations focused on problem solving and peer learning</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-5 bg-white border-2 border-black rounded-lg">
              <div className="h-12 w-12 rounded-lg border-2 border-black bg-white flex items-center justify-center shrink-0">
                <span className="text-2xl"><CloudSync/></span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-darkbg mb-1">Live Code Editor</h3>
                <p className="text-sm text-gray-600">Collaborative live code editor with controlled edit access, request/grant flow, and instant sync</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-5 bg-white border-2 border-black rounded-lg">
              <div className="h-12 w-12 rounded-lg border-2 border-black bg-white flex items-center justify-center shrink-0">
                <span className="text-2xl"><DownloadCloud/></span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-darkbg mb-1">Download your Session</h3>
                <p className="text-sm text-gray-600">Export the full conversation and shared code so nothing valuable gets lost after the session ends.</p>
              </div>
            </div>
          </div>

          {/* Video */}
          <div className="flex items-center justify-center">
            <div className="w-full">
              <div className="aspect-video bg-gray-100 border-4 border-black rounded-lg flex items-center justify-center">
                <span className="text-gray-400 font-semibold text-lg">Demo Video</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-8 text-center border-t-2 border-black">
          <div className="flex items-center justify-center gap-4 text-sm text-gray-600 font-medium">
            <span>© 2026 Crypt_Talk</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
