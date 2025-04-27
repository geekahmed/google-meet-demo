"use client";

import { Button } from "@/components/ui/button";
import * as React from "react";
import { useCallback, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useConversation } from "@11labs/react";
import { cn } from "@/lib/utils";
import { Mic, MicOff, PhoneOff, MessageSquare } from "lucide-react";


type ConversationMessage = {
  message: string;
  source: 'ai' | 'user';
};

type ConversationRecord = {
  id: string;
  agentId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  transcript?: string;
};

export default function ConvAI() {
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [currentSpeaker, setCurrentSpeaker] = useState<'ai' | 'user' | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  
  const conversation = useConversation({
    onMessage: (props: { message: string; source: 'ai' | 'user' }) => {
      const { message, source } = props;
      setMessages(prev => [...prev, { message, source }]);
      setCurrentSpeaker(source);
    },
    onError: (error: string) => {
      console.error('Conversation error:', error);
    }
  });

  const toggleMute = useCallback(() => {
    if (conversation.status === 'connected') {
      conversation.micMuted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [conversation, isMuted]);

  const createConversation = async () => {
    const id = crypto.randomUUID();
    const startTime = new Date();
    const conversation: ConversationRecord = {
      id,
      agentId: process.env.AGENT_ID || 'default',
      startTime,
    };

    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(conversation),
      });

      if (!response.ok) {
        throw new Error('Failed to create conversation');
      }

      setConversationId(id);
      setStartTime(startTime);
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const updateConversation = async () => {
    if (!conversationId || !startTime) return;

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
    const transcript = messages.map(msg => `${msg.source}: ${msg.message}`).join('\n');

    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endTime,
          duration,
          transcript,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update conversation');
      }
    } catch (error) {
      console.error('Error updating conversation:', error);
    }
  };

  const connectConversation = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const response = await fetch('/api/signed-url', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.error) {
        console.error(data.error);
        return;
      }
      await conversation.startSession({ signedUrl: data.signedUrl });
      await conversation.setVolume({ volume: 0.5 });
      setIsMuted(false);
      await createConversation();
    } catch (error) {
      console.error('Failed to set up conversation:', error);
    }
  }, [conversation]);

  const disconnectConversation = useCallback(async () => {
    await conversation.endSession();
    setCurrentSpeaker(null);
    setIsMuted(false);
    await updateConversation();
    setConversationId(null);
    setStartTime(null);
  }, [conversation, messages]);

  useEffect(() => {
    return () => {
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [audioStream]);

  return (
    <>
      {/* Control Card */}
      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle>Voice Controls</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center space-y-8">
          <div className="text-center">
            <div className="text-2xl font-bold mb-4">
              {conversation.status === 'connected' ? (
                <>
                  {currentSpeaker === 'ai' && (
                    <div className="text-blue-600 animate-pulse">AI is speaking...</div>
                  )}
                  {currentSpeaker === 'user' && (
                    <div className="text-green-600 animate-pulse">You are speaking...</div>
                  )}
                  {!currentSpeaker && (
                    <div className="text-gray-600">Waiting for speech...</div>
                  )}
                </>
              ) : (
                <div className="text-gray-600">Not Connected</div>
              )}
            </div>
            <div className="flex justify-center space-x-4">
              <Button 
                onClick={toggleMute}
                variant={isMuted ? "destructive" : "outline"}
                className="w-12 h-12 rounded-full"
              >
                {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </Button>
              <Button 
                onClick={conversation.status === 'connected' ? disconnectConversation : connectConversation}
                variant={conversation.status === 'connected' ? "destructive" : "default"}
                className="w-12 h-12 rounded-full"
              >
                {conversation.status === 'connected' ? (
                  <PhoneOff className="h-6 w-6" />
                ) : (
                  <MessageSquare className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transcript Card */}
      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle>Conversation Transcript</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.source === 'ai' ? 'justify-start' : 'justify-end'}`}>
                <div className={cn(
                  "rounded-lg p-3 max-w-[70%]",
                  msg.source === 'ai' 
                    ? "bg-blue-100 text-blue-900" 
                    : "bg-green-100 text-green-900"
                )}>
                  {msg.message}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
