"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-amperly-light">
      {/* Header/Navigation */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[#1cbe78] to-[#0183c7] flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">Amperly AI</h1>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#" className="text-foreground/80 hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#s" className="text-foreground/80 hover:text-foreground transition-colors">
              How It Works
            </Link>
            <Link href="#" className="text-foreground/80 hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="#" className="text-foreground/80 hover:text-foreground transition-colors">
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
              <Button className="btn-gradient-amperly">
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
              Supercharge Your WooCommerce Products with AI
            </h1>
            <p className="text-lg text-foreground/80 mb-8">
              Enhance your product listings, boost SEO rankings, and drive more sales with our powerful AI that automatically optimizes WooCommerce product details for maximum visibility and conversion.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/login">
              <Button className="btn-gradient-amperly text-lg py-6 px-8">
                Get Started
              </Button>
            </Link>
              <Button variant="outline" className="border-amperly text-[#1cbe78] hover-bg-amperly text-lg py-6 px-8">
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
            <div className="absolute inset-0 bg-gradient-to-r from-[#e5f8f3]/50 to-[#e1f0ff]/30 rounded-2xl overflow-hidden flex items-center justify-center">
              <div className="w-[80%] h-[80%] bg-white rounded-xl shadow-lg flex flex-col">
                <div className="p-4 border-b border-border">
                  <div className="w-24 h-6 bg-foreground/10 rounded"></div>
                </div>
                <div className="flex-1 p-4 flex flex-col gap-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#e5f8f3] flex-shrink-0"></div>
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
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Powerful AI Features for WooCommerce
            </h2>
            <p className="text-lg text-foreground/70 max-w-3xl mx-auto">
              Our AI assistant integrates seamlessly with your WooCommerce store to automate and enhance your product listings.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-xl border border-border">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#1cbe78]/20 to-[#0183c7]/20 flex items-center justify-center mb-4">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#1cbe78] to-[#0183c7]"></div>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Product Descriptions</h3>
              <p className="text-foreground/70">
                Generate compelling and SEO-optimized product descriptions with a single click, saving hours of copywriting time.
              </p>
            </div>
            <div className="bg-card p-6 rounded-xl border border-border">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#1cbe78]/20 to-[#0183c7]/20 flex items-center justify-center mb-4">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#1cbe78] to-[#0183c7]"></div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Tag Generation</h3>
              <p className="text-foreground/70">
                Automatically create relevant product tags and categories to improve searchability and organization.
              </p>
            </div>
            <div className="bg-card p-6 rounded-xl border border-border">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#1cbe78]/20 to-[#0183c7]/20 flex items-center justify-center mb-4">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#1cbe78] to-[#0183c7]"></div>
              </div>
              <h3 className="text-xl font-semibold mb-2">SEO Optimization</h3>
              <p className="text-foreground/70">
                Enhance your product listings with AI-driven SEO suggestions to boost visibility and organic traffic.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#1cbe78] to-[#0183c7] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to transform your WooCommerce store?</h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-8">
            Join hundreds of WooCommerce store owners already using Amperly AI to optimize their product listings and boost their organic traffic.
          </p>
          <Link href="/login">
          <Button className="bg-white text-[#1cbe78] hover:bg-white/90 text-lg py-6 px-8">
            Start Your Free Trial
          </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[#1cbe78] to-[#0183c7] flex items-center justify-center">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <span className="text-xl font-bold">Amperly AI</span>
              </div>
              <p className="text-gray-400">
                AI-powered content generation for WooCommerce stores. Boost sales with optimized product listings.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Testimonials</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Cookies</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Licenses</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-gray-400 text-center">
            &copy; {new Date().getFullYear()} Amperly AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
