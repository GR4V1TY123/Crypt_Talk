import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brownbg px-4">
      <Card className="w-full max-w-lg border-8 border-black shadow-xl shadow-verydark">
        <CardContent className="p-10 space-y-8">
          {/* App Name */}
          <div className="text-center space-y-3">
            <h1 className="text-7xl text-primary font-bangers tracking-wide">Tech_Yap</h1>
            <p className="text-lg leading-relaxed">Connect and chat with your community</p>
          </div>

          {/* Form */}
          <div className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-foreground sr-only">
                Your name
              </label>
              <Input
                id="name"
                placeholder="Enter your name"
                className="h-12 rounded-xl border-input bg-background text-base placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl bg-button hover:bg-verydark text-primary-foreground text-base font-medium shadow-sm transition-colors"
            >
              Join Voice Chat
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
