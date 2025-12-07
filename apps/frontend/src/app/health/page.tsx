import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Health Check - CarTrader',
  robots: 'noindex, nofollow',
};

export default async function HealthPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  
  let backendHealth = { status: 'unknown', timestamp: '', service: '', database: '' };
  let frontendHealth = { status: 'ok', timestamp: new Date().toISOString() };

  try {
    const response = await fetch(`${apiUrl}/health`, {
      cache: 'no-store',
      next: { revalidate: 0 },
    });
    
    if (response.ok) {
      backendHealth = await response.json();
    } else {
      backendHealth = {
        status: 'error',
        timestamp: new Date().toISOString(),
        service: 'cartrader-backend',
        database: 'unknown',
      };
    }
  } catch (error) {
    backendHealth = {
      status: 'error',
      timestamp: new Date().toISOString(),
      service: 'cartrader-backend',
      database: 'disconnected',
    };
  }

  const overallStatus = backendHealth.status === 'ok' && frontendHealth.status === 'ok' 
    ? 'healthy' 
    : 'degraded';

  return (
    <div className="min-h-screen bg-[#fafafa] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-[20px] border border-[#e5e5e5] p-8 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
          <h1 className="text-3xl font-bold text-[#111] mb-6">System Health Check</h1>
          
          <div className="mb-6">
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
              overallStatus === 'healthy' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
            }`}>
              <span className={`w-2 h-2 rounded-full mr-2 ${
                overallStatus === 'healthy' ? 'bg-green-500' : 'bg-yellow-500'
              }`} />
              Overall Status: {overallStatus.toUpperCase()}
            </div>
          </div>

          <div className="space-y-4">
            <div className="border border-[#e5e5e5] rounded-lg p-4">
              <h2 className="font-semibold text-lg mb-2">Frontend</h2>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#666]">Status:</span>
                  <span className="font-medium text-green-600">{frontendHealth.status.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#666]">Timestamp:</span>
                  <span className="font-mono text-xs">{new Date(frontendHealth.timestamp).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="border border-[#e5e5e5] rounded-lg p-4">
              <h2 className="font-semibold text-lg mb-2">Backend</h2>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#666]">Status:</span>
                  <span className={`font-medium ${
                    backendHealth.status === 'ok' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {backendHealth.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#666]">Service:</span>
                  <span>{backendHealth.service || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#666]">Database:</span>
                  <span className={`font-medium ${
                    backendHealth.database === 'connected' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {backendHealth.database.toUpperCase() || 'UNKNOWN'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#666]">Timestamp:</span>
                  <span className="font-mono text-xs">
                    {backendHealth.timestamp ? new Date(backendHealth.timestamp).toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

