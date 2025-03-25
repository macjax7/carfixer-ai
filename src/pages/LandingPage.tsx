
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import AIChat from '@/components/AIChat';

const LandingPage: React.FC = () => {
  const { user } = useAuth();

  // If user is authenticated, redirect them to the dedicated chat page
  if (user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 flex justify-center">
          <Link to="/chat">
            <Button size="lg">Go to Chat</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      {/* Chat section at the top for guest users */}
      <section className="w-full flex-1 min-h-[70vh] border-b">
        <AIChat />
      </section>
      
      {/* Marketing content below the chat */}
      <main className="container mx-auto px-4 py-12">
        <section className="py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  CarFix AI - Your Automotive AI Assistant
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Get expert car diagnostics and repair guidance powered by AI. Understand issues, troubleshoot problems, and save on unnecessary repairs.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/login">
                  <Button size="lg" variant="default">Log In</Button>
                </Link>
                <Link to="/signup">
                  <Button size="lg" variant="outline">Sign Up</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-12 md:py-24 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">AI-Powered Diagnostics</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Get instant diagnostics for your vehicle issues using advanced AI that understands OBD-II codes and symptoms.
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Visual Assistance</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Upload images of your car issues and get AI analysis to identify problems and suggest solutions.
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Repair Guidance</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Step-by-step repair instructions tailored to your specific vehicle make and model.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-sm text-gray-500">
            © 2024 CarFix AI. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link className="text-sm text-gray-500 hover:underline" to="/terms">
              Terms of Service
            </Link>
            <Link className="text-sm text-gray-500 hover:underline" to="/privacy">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
