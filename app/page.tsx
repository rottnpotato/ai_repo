"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header/Navigation */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">Amperly AI</h1>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-foreground/80 hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-foreground/80 hover:text-foreground transition-colors">
              How It Works
            </Link>
            <Link href="#pricing" className="text-foreground/80 hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="#testimonials" className="text-foreground/80 hover:text-foreground transition-colors">
              Testimonials
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" className="text-foreground/80 hover:text-foreground">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-primary text-white hover:bg-primary/90">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-6">
              Automate support with AI that grows your business
            </h1>
            <p className="text-lg text-foreground/80 mb-8">
              Convert leads, resolve queries, and boost sales & support all on autopilot with our powerful AI assistant.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-primary text-white hover:bg-primary/90 text-lg py-6 px-8">
                Get Started
              </Button>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 text-lg py-6 px-8">
                Learn More
              </Button>
            </div>
            <div className="mt-8 flex items-center">
              <span className="text-sm font-medium text-foreground/60">Trusted by 500+ businesses</span>
              <div className="ml-4 flex space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-6 h-6 rounded-full bg-foreground/10"></div>
                ))}
              </div>
            </div>
          </div>
          <div className="relative h-[400px] md:h-[500px]">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 rounded-2xl overflow-hidden flex items-center justify-center">
              <div className="w-[80%] h-[80%] bg-white rounded-xl shadow-lg flex flex-col">
                <div className="p-4 border-b border-border">
                  <div className="w-24 h-6 bg-foreground/10 rounded"></div>
                </div>
                <div className="flex-1 p-4 flex flex-col gap-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex-shrink-0"></div>
                      <div>
                        <div className="w-40 h-4 bg-foreground/10 rounded mb-1"></div>
                        <div className="w-60 h-3 bg-foreground/5 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Powerful AI Features</h2>
            <p className="text-foreground/70 max-w-2xl mx-auto">
              Our platform comes with everything you need to automate customer interactions and grow your business.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "24/7 Availability",
                description: "Never miss a customer inquiry with round-the-clock automated responses.",
              },
              {
                title: "Smart Lead Filtering",
                description: "Automatically qualify and prioritize leads based on their potential value.",
              },
              {
                title: "Seamless Integrations",
                description: "Connect with your existing tools and CRM systems for a unified workflow.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-lg shadow-sm border border-border"
              >
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <div className="w-6 h-6 bg-primary rounded-full"></div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-foreground/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to transform your customer experience?</h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-8">
            Join thousands of businesses already using Amperly AI to automate their customer interactions and grow their revenue.
          </p>
          <Button className="bg-white text-primary hover:bg-white/90 text-lg py-6 px-8">
            Start Your Free Trial
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <h1 className="text-xl font-bold">Amperly AI</h1>
              </div>
              <p className="text-white/70 max-w-xs">
                Automating customer interactions with powerful AI to help businesses grow.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-semibold mb-4">Product</h3>
                <ul className="space-y-2">
                  {["Features", "Pricing", "Integrations", "FAQ"].map((item) => (
                    <li key={item}>
                      <Link href="#" className="text-white/70 hover:text-white transition-colors">
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Company</h3>
                <ul className="space-y-2">
                  {["About", "Blog", "Careers", "Contact"].map((item) => (
                    <li key={item}>
                      <Link href="#" className="text-white/70 hover:text-white transition-colors">
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Legal</h3>
                <ul className="space-y-2">
                  {["Terms", "Privacy", "Cookies", "Licenses"].map((item) => (
                    <li key={item}>
                      <Link href="#" className="text-white/70 hover:text-white transition-colors">
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-white/60 text-sm">
            &copy; {new Date().getFullYear()} Amperly AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
