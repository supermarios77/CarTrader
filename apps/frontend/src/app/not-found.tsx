import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-[20px] border border-[#e5e5e5] p-8 shadow-[0_2px_10px_rgba(0,0,0,0.03)] text-center">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full bg-[#10b981]/10 flex items-center justify-center">
            <Search className="w-10 h-10 text-[#10b981]" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-[#111] mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-[#111] mb-2">
          Page Not Found
        </h2>
        
        <p className="text-[#666] mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button className="bg-[#111] text-white hover:bg-[#222] flex items-center gap-2">
              <Home className="w-4 h-4" />
              Go Home
            </Button>
          </Link>
          
          <Link href="/vehicles">
            <Button
              variant="outline"
              className="w-full sm:w-auto border-[#e5e5e5] text-[#111] hover:bg-[#fafafa] flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Browse Cars
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

