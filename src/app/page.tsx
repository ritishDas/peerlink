import { PeerLink } from '@/components/peer-link/PeerLink';

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-background text-foreground flex items-center justify-center p-4">
      <PeerLink />
    </main>
  );
}
