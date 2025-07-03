import React, { useState } from 'react';
import { usePortfolioContext } from '@/contexts/PortfolioContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronDown, Plus, Settings } from 'lucide-react';

export const PortfolioSelector: React.FC = () => {
  const { portfolios, currentPortfolio, createPortfolio, switchPortfolio } = usePortfolioContext();
  const [isNewPortfolioDialogOpen, setIsNewPortfolioDialogOpen] = useState(false);
  const [newPortfolioName, setNewPortfolioName] = useState('');
  const [newPortfolioColor, setNewPortfolioColor] = useState('#007bff');
  const [newPortfolioIcon, setNewPortfolioIcon] = useState('📈');

  const handleCreatePortfolio = async () => {
    if (!newPortfolioName) return;
    
    await createPortfolio({
      name: newPortfolioName,
      color: newPortfolioColor,
      icon: newPortfolioIcon || '📈'
    });
    
    setIsNewPortfolioDialogOpen(false);
    setNewPortfolioName('');
  };

  const iconOptions = ['📈', '📊', '💹', '📉', '💰', '💸', '🏦', '💼', '🔄', '🚀'];

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2 px-3 py-1 h-10 min-w-[180px] justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{currentPortfolio?.icon || '📈'}</span>
              <span className="font-medium truncate max-w-[120px]">{currentPortfolio?.name || 'Select Portfolio'}</span>
            </div>
            <ChevronDown size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[220px]">
          {portfolios.length > 0 ? (
            portfolios.map(portfolio => (
              <DropdownMenuItem 
                key={portfolio.id}
                onClick={() => switchPortfolio(portfolio.id)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <span className="text-xl">{portfolio.icon}</span>
                <span>{portfolio.name}</span>
                {portfolio.id === currentPortfolio?.id && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-blue-500"></span>
                )}
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem disabled>No portfolios available</DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={() => setIsNewPortfolioDialogOpen(true)}
            className="flex items-center gap-2 border-t border-gray-800 mt-1 pt-1"
          >
            <Plus size={16} />
            <span>Create New Portfolio</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isNewPortfolioDialogOpen} onOpenChange={setIsNewPortfolioDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Portfolio</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="portfolioName" className="text-right">
                Name
              </Label>
              <Input
                id="portfolioName"
                value={newPortfolioName}
                onChange={(e) => setNewPortfolioName(e.target.value)}
                className="col-span-3"
                placeholder="My Portfolio"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="portfolioColor" className="text-right">
                Color
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input
                  id="portfolioColor"
                  type="color"
                  value={newPortfolioColor}
                  onChange={(e) => setNewPortfolioColor(e.target.value)}
                  className="w-10 p-0 h-10"
                />
                <span className="text-sm text-muted-foreground">{newPortfolioColor}</span>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Icon
              </Label>
              <div className="col-span-3 flex flex-wrap gap-2">
                {iconOptions.map(icon => (
                  <Button
                    key={icon}
                    type="button"
                    variant={newPortfolioIcon === icon ? 'default' : 'outline'}
                    className="w-10 h-10 p-0 text-xl"
                    onClick={() => setNewPortfolioIcon(icon)}
                  >
                    {icon}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewPortfolioDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePortfolio} disabled={!newPortfolioName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 