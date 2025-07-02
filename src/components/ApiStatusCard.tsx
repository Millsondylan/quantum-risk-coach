import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { realDataService } from '@/lib/realDataService';
import { AIStreamService } from '@/lib/aiStreamService';
import { toast } from 'sonner';

interface ApiResult {
  id: string;
  name: string;
  ok: boolean | null; // null = loading
}

const ApiStatusCard: React.FC = () => {
  const [apis, setApis] = useState<ApiResult[]>([
    { id: 'coingecko', name: 'CoinGecko', ok: null },
    { id: 'finnhub', name: 'Finnhub', ok: null },
    { id: 'exchangerate', name: 'ExchangeRate', ok: null },
    { id: 'news', name: 'NewsAPI', ok: null },
    { id: 'openai', name: 'OpenAI', ok: null },
    { id: 'groq', name: 'Groq', ok: null },
    { id: 'gemini', name: 'Gemini', ok: null }
  ]);

  const fetchStatus = async () => {
    try {
      setApis(prev => prev.map(a => ({ ...a, ok: null })));
      const priceResults = await realDataService.healthCheck();
      const aiService = new AIStreamService({});
      const aiResults = await aiService.healthCheck();

      setApis(prev => prev.map(api => {
        if (api.id in priceResults) return { ...api, ok: priceResults[api.id] };
        if (api.id in aiResults) return { ...api, ok: aiResults[api.id] };
        return api;
      }));

      const failing = [...Object.entries(priceResults), ...Object.entries(aiResults)]
        .filter(([_, ok]) => !ok);
      if (failing.length) {
        toast.error(`${failing.length} API${failing.length > 1 ? 's' : ''} offline`);
      } else {
        toast.success('All APIs connected');
      }
    } catch (error) {
      toast.error('API health check failed');
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const getIcon = (ok: boolean | null) => {
    if (ok === null) return <AlertTriangle className="w-4 h-4 text-yellow-400 animate-pulse" />;
    if (ok) return <CheckCircle2 className="w-4 h-4 text-green-400" />;
    return <XCircle className="w-4 h-4 text-red-400" />;
  };

  return (
    <Card className="holo-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm">API Status</CardTitle>
        <Button size="sm" variant="ghost" onClick={fetchStatus} className="p-1">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2 text-sm">
        {apis.map(api => (
          <div key={api.id} className="flex items-center gap-2">
            {getIcon(api.ok)}
            <span className="text-slate-300">{api.name}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ApiStatusCard; 