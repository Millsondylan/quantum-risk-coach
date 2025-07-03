import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { QuantumPanel } from '@/components/ui/quantum-panel'
import { QuantumLoader } from '@/components/ui/quantum-loader'
import { QuantumChart } from '@/components/ui/quantum-chart'

const QuantumDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0F1A] to-[#1A2233] p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-[#F4F4F4]">Quantum Design System</h1>
        <p className="text-[#B2B2B2] text-lg">Visual Essence & Color System Demo</p>
      </div>

      {/* Buttons */}
      <QuantumPanel variant="default" padding="lg">
        <h2 className="text-2xl font-semibold text-[#F4F4F4] mb-6">Button Components</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[#F4F4F4]">Primary Variants</h3>
            <div className="space-y-3">
              <Button variant="quantum" size="default" className="w-full">
                Quantum Primary
              </Button>
              <Button variant="default" size="default" className="w-full">
                Default Button
              </Button>
              <Button variant="outline" size="default" className="w-full">
                Outline Button
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[#F4F4F4]">Status Variants</h3>
            <div className="space-y-3">
              <Button variant="success" size="default" className="w-full">
                Success Button
              </Button>
              <Button variant="warning" size="default" className="w-full">
                Warning Button
              </Button>
              <Button variant="destructive" size="default" className="w-full">
                Destructive Button
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[#F4F4F4]">Sizes & States</h3>
            <div className="space-y-3">
              <Button variant="quantum" size="sm" className="w-full">
                Small Button
              </Button>
              <Button variant="quantum" size="default" className="w-full">
                Default Size
              </Button>
              <Button variant="quantum" size="lg" className="w-full">
                Large Button
              </Button>
              <Button variant="quantum" size="icon" className="w-11 h-11">
                <span className="text-lg">⚡</span>
              </Button>
            </div>
          </div>
        </div>
      </QuantumPanel>

      {/* Input Fields */}
      <QuantumPanel variant="glass" padding="lg">
        <h2 className="text-2xl font-semibold text-[#F4F4F4] mb-6">Input Components</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[#F4F4F4]">Input Variants</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#B2B2B2] mb-2">Default Input</label>
                <Input variant="default" placeholder="Enter text..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#B2B2B2] mb-2">Quantum Input</label>
                <Input variant="quantum" placeholder="Quantum style..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#B2B2B2] mb-2">Glass Input</label>
                <Input variant="glass" placeholder="Glass effect..." />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[#F4F4F4]">Input States</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#B2B2B2] mb-2">Focused Input</label>
                <Input variant="quantum" placeholder="Click to focus..." autoFocus />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#B2B2B2] mb-2">Disabled Input</label>
                <Input variant="quantum" placeholder="Disabled..." disabled />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#B2B2B2] mb-2">With Value</label>
                <Input variant="quantum" value="Sample text" readOnly />
              </div>
            </div>
          </div>
        </div>
      </QuantumPanel>

      {/* Cards */}
      <QuantumPanel variant="elevated" padding="lg">
        <h2 className="text-2xl font-semibold text-[#F4F4F4] mb-6">Card Components</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card variant="default">
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
              <CardDescription>Standard card styling</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-[#B2B2B2]">Traditional card with solid background and clean borders.</p>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle>Glass Card</CardTitle>
              <CardDescription>Transparent background with blur</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-[#B2B2B2]">A glass-like card with backdrop blur and subtle transparency.</p>
            </CardContent>
          </Card>

          <Card variant="default">
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
              <CardDescription>Standard card styling</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-[#B2B2B2]">Traditional card with solid background and clean borders.</p>
            </CardContent>
          </Card>
        </div>
      </QuantumPanel>

      {/* Loading States */}
      <QuantumPanel variant="glass" padding="lg">
        <h2 className="text-2xl font-semibold text-[#F4F4F4] mb-6">Loading Components</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-medium text-[#F4F4F4]">Pulse Loader</h3>
            <QuantumLoader variant="pulse" size="lg" color="cyan" />
            <p className="text-sm text-[#B2B2B2]">Radial pulse animation</p>
          </div>
          
          <div className="text-center space-y-4">
            <h3 className="text-lg font-medium text-[#F4F4F4]">Spinner Loader</h3>
            <QuantumLoader variant="spinner" size="lg" color="violet" />
            <p className="text-sm text-[#B2B2B2]">Classic spinning animation</p>
          </div>
          
          <div className="text-center space-y-4">
            <h3 className="text-lg font-medium text-[#F4F4F4]">Dots Loader</h3>
            <QuantumLoader variant="dots" size="lg" color="green" />
            <p className="text-sm text-[#B2B2B2]">Bouncing dots sequence</p>
          </div>
        </div>
      </QuantumPanel>

      {/* Chart Container */}
      <QuantumPanel variant="default" padding="lg">
        <h2 className="text-2xl font-semibold text-[#F4F4F4] mb-6">Chart Container</h2>
        <div className="space-y-6">
          <QuantumChart variant="glass" minHeight="lg">
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 border-2 border-[rgba(45,244,255,0.2)] border-t-[#2DF4FF] rounded-full animate-spin mx-auto" />
                <p className="text-[#B2B2B2]">Chart Container Ready</p>
                <p className="text-sm text-[#B2B2B2] opacity-70">Min height: 300px, Responsive width</p>
              </div>
            </div>
          </QuantumChart>

          <QuantumChart variant="elevated" minHeight="md" loading>
            <div className="h-full flex items-center justify-center">
              <p className="text-[#B2B2B2]">This content is hidden while loading</p>
            </div>
          </QuantumChart>
        </div>
      </QuantumPanel>

      {/* Interactive Demo */}
      <QuantumPanel variant="default" padding="lg" glow>
        <h2 className="text-2xl font-semibold text-[#F4F4F4] mb-6">Interactive Demo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[#F4F4F4]">Form Example</h3>
            <div className="space-y-4">
              <Input variant="quantum" placeholder="Enter your name..." />
              <Input variant="quantum" placeholder="Enter your email..." type="email" />
              <Button variant="quantum" className="w-full">
                Submit Form
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[#F4F4F4]">Action Buttons</h3>
            <div className="space-y-3">
              <Button variant="success" className="w-full">
                Save Changes
              </Button>
              <Button variant="outline" className="w-full">
                Cancel
              </Button>
              <Button variant="destructive" className="w-full">
                Delete Item
              </Button>
            </div>
          </div>
        </div>
      </QuantumPanel>
    </div>
  )
}

export default QuantumDemo 