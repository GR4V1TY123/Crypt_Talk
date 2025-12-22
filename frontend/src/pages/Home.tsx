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
import { Dot } from 'lucide-react';

export default function Home() {

  const navigate = useNavigate();

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
    const fetchStats = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/stats`);
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
    {
      val: "PROJECT",
      name: "Project",
      desc: "Discuss, build, or debug projects together",
    },
    {
      val: "SYSTEM_DESIGN",
      name: "System Design",
      desc: "Low-level & high-level system design interviews",
    },
    {
      val: "COLLABORATION",
      name: "Collaboration",
      desc: "Find your perfect project workbuddy",
    },
  ];

  const handleSubmit = (e: any) => {
    e.preventDefault();
    console.log(topic);

    navigate(`chat/`, {
      state: {
        username, topic
      }
    })
  }

  return (
    <div className="min-h-screen md:bg-[url('/ty_bg2_bw.png')] bg-cover bg-center h-screen flex items-center justify-center px-4">
      {stats && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-white border rounded-xl px-4 py-2 shadow text-sm text-gray-600 space-y-1">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span>Online: {stats.activeUsers}</span>
            </div>
          </div>
        </div>
      )}
      <Card className="w-full max-w-lg border-4 border-black shadow-lg shadow-verydark">
        <CardContent className="p-10 space-y-8">
          {/* App Name */}
          <div className="text-center space-y-3 mb-16">
            <h1 className="text-8xl font-bangers text-darkbg tracking-wide">Tech_Yap</h1>
            <p className="text-lg leading-relaxed tracking-wide">Connect and chat with anonymous developers</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-10">
              <div className="space-y-3">
                <label htmlFor="name" className="text-sm font-medium text-button">
                  Your username
                </label>
                <Input
                  id="name"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12 font-sans rounded-xl border-input bg-background font-semibold focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0"
                />
              </div>
              <span className="text-sm font-medium text-button">Topic: </span>
              {/* Topics */}
              <ToggleGroup
                type="single"
                variant="outline"
                spacing={4}
                className="flex-wrap justify-center"
                value={topic}
                onValueChange={(val) => val && setTopic(val)}
              >
                {topics.map((t) => (
                  <ToggleGroupItem
                    key={t.val}
                    value={t.val}
                    className="text-base relative"
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2 cursor-pointer">
                            <span
                              className={`h-2 w-2 rounded-full ${stats.queue[t.val] > 0 ? "bg-green-500 animate-pulse" : "bg-gray-300"
                                }`}
                            />

                            <span className="text-sm">
                              {t.name} ({stats.queue[t.val] ?? 0})
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p className="max-w-xs text-sm">{t.desc}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>

              <Button
                type="submit"
                className="w-full text-xl items-center h-12 rounded-xl bg-button hover:bg-verydark text-primary-foreground font-medium shadow-sm transition-colors hover:cursor-pointer"
              >
                Join Chat
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
