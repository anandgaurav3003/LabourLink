import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect, useRef } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Loader2, Send, User, MessageCircle, Calendar, Clock } from "lucide-react";

// Message form schema
const messageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty"),
});

type MessageFormValues = z.infer<typeof messageSchema>;

export default function Messages() {
  const { userId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeUserId, setActiveUserId] = useState<number | null>(userId ? parseInt(userId) : null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Fetch user's conversations
  const { data: conversations, isLoading: isConversationsLoading } = useQuery({
    queryKey: ["/api/messages/conversations"],
  });
  
  // Fetch messages for active conversation
  const { data: messages, isLoading: isMessagesLoading } = useQuery({
    queryKey: [`/api/messages/${activeUserId}`],
    enabled: !!activeUserId,
  });
  
  // Fetch active user details
  const { data: activeUser, isLoading: isActiveUserLoading } = useQuery({
    queryKey: [`/api/users/${activeUserId}`],
    enabled: !!activeUserId,
  });
  
  // Message form
  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
    },
  });
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { toUserId: number; content: string }) => {
      const res = await apiRequest("POST", "/api/messages", data);
      return await res.json();
    },
    onSuccess: () => {
      form.reset();
      queryClient.invalidateQueries({ queryKey: [`/api/messages/${activeUserId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });
      
      // Scroll to bottom after message is sent
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send message",
        description: error.message || "An error occurred while sending the message",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (values: MessageFormValues) => {
    if (!activeUserId || !values.content.trim()) return;
    
    sendMessageMutation.mutate({
      toUserId: activeUserId,
      content: values.content,
    });
  };
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Messages</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Conversation List */}
          <div className="md:col-span-1">
            <Card className="h-[calc(100vh-220px)] flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Conversations</CardTitle>
                <CardDescription>
                  Your message history
                </CardDescription>
              </CardHeader>
              <div className="overflow-y-auto flex-grow">
                {isConversationsLoading ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : conversations && conversations.length > 0 ? (
                  <div className="divide-y">
                    {conversations.map((conversation: any) => (
                      <div
                        key={conversation.otherUser.id}
                        className={`p-4 cursor-pointer hover:bg-gray-50 ${
                          activeUserId === conversation.otherUser.id ? "bg-blue-50" : ""
                        }`}
                        onClick={() => setActiveUserId(conversation.otherUser.id)}
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden mr-3">
                            {conversation.otherUser.avatar ? (
                              <img
                                src={conversation.otherUser.avatar}
                                alt={conversation.otherUser.fullName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">
                              {conversation.otherUser.fullName}
                            </h4>
                            <p className="text-sm text-gray-500 truncate">
                              {conversation.lastMessage.content}
                            </p>
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(conversation.lastMessage.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <MessageCircle className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">No conversations yet</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
          
          {/* Message Area */}
          <div className="md:col-span-3">
            <Card className="h-[calc(100vh-220px)] flex flex-col">
              {activeUserId ? (
                <>
                  <CardHeader className="pb-2 border-b">
                    {isActiveUserLoading ? (
                      <div className="flex items-center">
                        <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
                        <CardTitle className="text-lg">Loading...</CardTitle>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden mr-3">
                          {activeUser?.avatar ? (
                            <img
                              src={activeUser.avatar}
                              alt={activeUser.fullName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{activeUser?.fullName}</CardTitle>
                          <CardDescription>{activeUser?.userType === "worker" ? activeUser?.title : "Employer"}</CardDescription>
                        </div>
                      </div>
                    )}
                  </CardHeader>
                  
                  <div className="flex-grow overflow-y-auto p-4">
                    {isMessagesLoading ? (
                      <div className="flex justify-center py-6">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : messages && messages.length > 0 ? (
                      <div className="space-y-4">
                        {messages.map((message: any) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.fromUserId === user.id ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                message.fromUserId === user.id
                                  ? "bg-primary text-white rounded-br-none"
                                  : "bg-gray-100 text-gray-800 rounded-bl-none"
                              }`}
                            >
                              <p className="break-words">{message.content}</p>
                              <div
                                className={`text-xs mt-1 flex items-center ${
                                  message.fromUserId === user.id
                                    ? "text-blue-100 justify-end"
                                    : "text-gray-500"
                                }`}
                              >
                                <Clock className="h-3 w-3 inline mr-1" />
                                {new Date(message.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <MessageCircle className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                          <p className="text-gray-500">No messages yet</p>
                          <p className="text-gray-400 text-sm">Send a message to start the conversation</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 border-t">
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-end gap-2">
                        <FormField
                          control={form.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Textarea
                                  placeholder="Type your message..."
                                  className="min-h-[60px] resize-none"
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <Button 
                          type="submit" 
                          className="h-[60px] w-[60px]"
                          disabled={sendMessageMutation.isPending}
                        >
                          {sendMessageMutation.isPending ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Send className="h-5 w-5" />
                          )}
                        </Button>
                      </form>
                    </Form>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center max-w-md px-4">
                    <MessageCircle className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Your Messages</h3>
                    <p className="text-gray-600 mb-6">
                      Select a conversation from the sidebar or start a new conversation with a worker or employer.
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
