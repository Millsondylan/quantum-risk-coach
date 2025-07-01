import React from 'react';
import MT4Connection from '../components/MT4Connection';

interface MT4ConnectionPageProps {
  platform?: string;
}

const MT4ConnectionPage: React.FC<MT4ConnectionPageProps> = ({ platform = "MT4/MT5" }) => {
  const getPlatformInfo = (platform: string) => {
    switch (platform) {
      case "MT5":
        return {
          title: "Connect MT5",
          description: "Connect your MetaTrader 5 account to start receiving real-time data and AI insights"
        };
      case "cTrader":
        return {
          title: "Connect cTrader",
          description: "Connect your cTrader account to start receiving real-time data and AI insights"
        };
      case "TradingView":
        return {
          title: "Connect TradingView",
          description: "Connect your TradingView account to start receiving real-time data and AI insights"
        };
      default:
        return {
          title: "Connect MT4/MT5",
          description: "Connect your MetaTrader account to start receiving real-time data and AI insights"
        };
    }
  };

  const platformInfo = getPlatformInfo(platform);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900">
      <main className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">{platformInfo.title}</h1>
          <p className="text-slate-400">{platformInfo.description}</p>
        </div>
        <MT4Connection platform={platform} />
      </main>
    </div>
  );
};

export default MT4ConnectionPage;
