import React from 'react';
import { 
  MoreHorizontal, 
  Filter, 
  Settings, 
  Download, 
  Upload, 
  Calendar, 
  Tag,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Edit
} from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger
} from './context-menu';
import { Button } from './button';
import { useToast } from '@/hooks/use-toast';

type ContextMenuActionsProps = {
  section: 'dashboard' | 'calendar' | 'analytics' | 'trade-history';
};

export const ContextMenuActions: React.FC<ContextMenuActionsProps> = ({ section }) => {
  const { toast } = useToast();

  const handleAction = (action: string) => {
    toast({
      title: `${action} Action`,
      description: `Performing ${action.toLowerCase()} for ${section}`,
      duration: 1500
    });
  };

  const renderMenuItems = () => {
    switch (section) {
      case 'dashboard':
        return (
          <>
            <ContextMenuItem onSelect={() => handleAction('Refresh')}>
              <Download className="mr-2 h-4 w-4" /> Refresh Data
            </ContextMenuItem>
            <ContextMenuItem onSelect={() => handleAction('Customize')}>
              <Settings className="mr-2 h-4 w-4" /> Customize Widgets
            </ContextMenuItem>
          </>
        );
      case 'calendar':
        return (
          <>
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <Filter className="mr-2 h-4 w-4" /> Filter By
              </ContextMenuSubTrigger>
              <ContextMenuSubContent>
                <ContextMenuItem onSelect={() => handleAction('Filter Date')}>
                  <Calendar className="mr-2 h-4 w-4" /> Date Range
                </ContextMenuItem>
                <ContextMenuItem onSelect={() => handleAction('Filter Impact')}>
                  <Tag className="mr-2 h-4 w-4" /> Impact Level
                </ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuSeparator />
            <ContextMenuItem onSelect={() => handleAction('Export')}>
              <Download className="mr-2 h-4 w-4" /> Export Calendar
            </ContextMenuItem>
          </>
        );
      case 'analytics':
        return (
          <>
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <Filter className="mr-2 h-4 w-4" /> Apply Filters
              </ContextMenuSubTrigger>
              <ContextMenuSubContent>
                <ContextMenuItem onSelect={() => handleAction('Filter Strategy')}>
                  <Tag className="mr-2 h-4 w-4" /> By Strategy
                </ContextMenuItem>
                <ContextMenuItem onSelect={() => handleAction('Filter Performance')}>
                  <BarChart3 className="mr-2 h-4 w-4" /> By Performance
                </ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuSeparator />
            <ContextMenuItem onSelect={() => handleAction('Export CSV')}>
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </ContextMenuItem>
          </>
        );
      case 'trade-history':
        return (
          <>
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <Filter className="mr-2 h-4 w-4" /> Filter Trades
              </ContextMenuSubTrigger>
              <ContextMenuSubContent>
                <ContextMenuItem onSelect={() => handleAction('Filter Profitable')}>
                  <TrendingUp className="mr-2 h-4 w-4" /> Profitable Trades
                </ContextMenuItem>
                <ContextMenuItem onSelect={() => handleAction('Filter Losing')}>
                  <TrendingDown className="mr-2 h-4 w-4" /> Losing Trades
                </ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuSeparator />
            <ContextMenuItem onSelect={() => handleAction('Bulk Edit')}>
              <Edit className="mr-2 h-4 w-4" /> Bulk Edit
            </ContextMenuItem>
            <ContextMenuItem onSelect={() => handleAction('Export Trades')}>
              <Download className="mr-2 h-4 w-4" /> Export Trades
            </ContextMenuItem>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        {renderMenuItems()}
      </ContextMenuContent>
    </ContextMenu>
  );
}; 