import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4" data-testid="not-found-page">
      <Card className="w-full max-w-md mx-auto text-center" data-testid="not-found-card">
        <CardHeader>
          <div className="text-6xl font-bold text-red-500 mb-4" data-testid="not-found-404">404</div>
          <CardTitle className="text-2xl font-semibold mb-2" data-testid="not-found-title">
            Page Not Found
          </CardTitle>
          <p className="text-muted-foreground" data-testid="not-found-message">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={() => navigate('/')} 
              className="flex-1"
              data-testid="return-to-home-button"
            >
              <Home className="w-4 h-4 mr-2" />
              Return to Home
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
              className="flex-1"
              data-testid="go-back-button"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            <p data-testid="not-found-help">
              If you believe this is an error, please contact support.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
