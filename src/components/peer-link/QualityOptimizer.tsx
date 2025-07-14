"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Sparkles, Wand2, Loader2, Cpu, Video, Mic } from 'lucide-react';
import { optimizeScreenQuality, type OptimizeScreenQualityOutput } from '@/ai/flows/optimize-screen-quality';
import { useToast } from "@/hooks/use-toast";

interface QualityOptimizerProps {
  currentVideoQuality: string;
  currentAudioQuality: string;
}

export function QualityOptimizer({ currentVideoQuality, currentAudioQuality }: QualityOptimizerProps) {
  const [deviceCapabilities, setDeviceCapabilities] = useState('High-end desktop with powerful GPU');
  const [networkBandwidth, setNetworkBandwidth] = useState('50 Mbps');
  const [result, setResult] = useState<OptimizeScreenQualityOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    setIsLoading(true);
    setResult(null);
    try {
      const output = await optimizeScreenQuality({
        networkBandwidth,
        deviceCapabilities,
        currentVideoQuality,
        currentAudioQuality,
      });
      setResult(output);
    } catch (error) {
      console.error('Error optimizing quality:', error);
      toast({
        variant: "destructive",
        title: "Optimization Failed",
        description: "Could not get suggestions from AI.",
      })
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Sparkles className="mr-2 h-4 w-4" />
          Optimize Quality
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center gap-2">
            <Wand2 className="text-accent" />
            AI Quality Optimizer
          </DialogTitle>
          <DialogDescription>
            Get recommendations to improve your screen sharing experience.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="device" className="text-right">
              Device
            </Label>
            <Select value={deviceCapabilities} onValueChange={setDeviceCapabilities}>
              <SelectTrigger id="device" className="col-span-3">
                <SelectValue placeholder="Select device capability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="High-end desktop with powerful GPU">High-end PC</SelectItem>
                <SelectItem value="Modern laptop with integrated graphics">Modern Laptop</SelectItem>
                <SelectItem value="Low-end or older machine">Older Machine</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="network" className="text-right">
              Network
            </Label>
            <Select value={networkBandwidth} onValueChange={setNetworkBandwidth}>
              <SelectTrigger id="network" className="col-span-3">
                <SelectValue placeholder="Select network speed" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="100 Mbps+ (Fiber)">Fast (100+ Mbps)</SelectItem>
                <SelectItem value="50 Mbps (Cable/Fiber)">Good (50 Mbps)</SelectItem>
                <SelectItem value="10 Mbps (DSL)">Average (10 Mbps)</SelectItem>
                <SelectItem value="5 Mbps (Slow DSL/4G)">Slow (5 Mbps)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {result && (
          <Card className="bg-background/50">
            <CardHeader>
              <CardTitle className="font-headline text-lg text-primary">Optimization Complete</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><Video className="h-4 w-4 text-accent" />Suggested Video</h4>
                <p className="text-foreground">{result.suggestedVideoQuality}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><Mic className="h-4 w-4 text-accent" />Suggested Audio</h4>
                <p className="text-foreground">{result.suggestedAudioQuality}</p>
              </div>
              <Separator />
               <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><Cpu className="h-4 w-4 text-accent" />Reasoning</h4>
                <p className="text-sm text-muted-foreground">{result.reasoning}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isLoading} className="w-full bg-accent hover:bg-accent/90">
            {isLoading ? "Optimizing..." : "Optimize with AI"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
