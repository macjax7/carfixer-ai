
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const HomePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-carfix-600 p-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold">CarFix AI</h1>
          </div>
          
          <div>
            {user ? (
              <Link to="/chat">
                <Button>Go to Chat</Button>
              </Link>
            ) : (
              <div className="flex gap-2">
                <Link to="/login">
                  <Button variant="outline">Log in</Button>
                </Link>
                <Link to="/register">
                  <Button>Sign up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6">
            Your AI-Powered Automotive Assistant
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8">
            Get instant answers about car repairs, diagnostic codes, and maintenance from your personalized automotive expert.
          </p>
          
          <div className="flex justify-center">
            <Link to={user ? "/chat" : "/register"}>
              <Button size="lg" className="bg-carfix-600 hover:bg-carfix-700">
                {user ? "Start Chatting" : "Get Started"}
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
