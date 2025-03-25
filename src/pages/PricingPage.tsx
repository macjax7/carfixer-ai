
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Check } from 'lucide-react';
import Header from '@/components/Header';
import { Link } from 'react-router-dom';

const PricingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12 md:py-24">
        <div className="flex flex-col items-center justify-center mb-16 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Simple, Transparent Pricing</h1>
          <p className="mt-4 max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
            Choose the plan that's right for your automotive needs.
            All plans include access to our core AI diagnostic features.
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Basic</CardTitle>
              <div className="mt-4">
                <span className="text-3xl font-bold">$9.99</span>
                <span className="text-gray-500 ml-1">/ month</span>
              </div>
              <CardDescription>For casual drivers looking for basic diagnostic support.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  <span>AI-powered diagnostics</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  <span>OBD-II code interpretations</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  <span>10 AI chat sessions per month</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  <span>Basic repair guidance</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Subscribe</Button>
            </CardFooter>
          </Card>
          
          <Card className="flex flex-col border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Premium</CardTitle>
                <span className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded-full">Popular</span>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-bold">$19.99</span>
                <span className="text-gray-500 ml-1">/ month</span>
              </div>
              <CardDescription>For regular drivers who want comprehensive diagnostic support.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  <span>Everything in Basic</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  <span>Unlimited AI chat sessions</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  <span>Image analysis for visual diagnostics</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  <span>Advanced repair guides</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  <span>Parts identification</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Subscribe</Button>
            </CardFooter>
          </Card>
          
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Pro</CardTitle>
              <div className="mt-4">
                <span className="text-3xl font-bold">$29.99</span>
                <span className="text-gray-500 ml-1">/ month</span>
              </div>
              <CardDescription>For mechanics and automotive enthusiasts who need detailed support.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  <span>Everything in Premium</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  <span>Video analysis</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  <span>Parts marketplace integration</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  <span>Full vehicle history tracking</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Subscribe</Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Not ready to commit?</h2>
          <p className="mb-6 text-gray-500 dark:text-gray-400">
            Try our free demo to experience the power of CarFix AI without a subscription.
          </p>
          <Link to="/chat">
            <Button variant="outline" size="lg">Try Free Demo</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
