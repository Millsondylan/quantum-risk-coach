import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Upload, Database, Trash2, FileText, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { localDatabase } from '@/lib/localStorage';

const DataManagement: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const data = await localDatabase.exportData();
      
      // Create a downloadable file
      const blob = new Blob([JSON.stringify(data, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quantum-risk-coach-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Data exported successfully!', {
        description: 'Your data has been saved to your device.',
      });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data', {
        description: 'Please try again.',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Validate the data structure
      if (!data.version || !data.exportDate) {
        throw new Error('Invalid backup file format');
      }
      
      // Confirm with user before importing
      const confirmed = window.confirm(
        'This will replace all your current data. Are you sure you want to continue?'
      );
      
      if (!confirmed) {
        return;
      }
      
      await localDatabase.importData(data);
      
      toast.success('Data imported successfully!', {
        description: 'Your data has been restored from the backup.',
      });
      
      // Reload the page to reflect changes
      window.location.reload();
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import data', {
        description: 'Please check that the file is a valid backup.',
      });
    } finally {
      setIsImporting(false);
      // Reset the file input
      event.target.value = '';
    }
  };

  const handleClearAllData = async () => {
    const confirmed = window.confirm(
      'This will permanently delete ALL your data including portfolios, trades, accounts, and settings. This action cannot be undone. Are you absolutely sure?'
    );
    
    if (!confirmed) return;
    
    setIsClearing(true);
    try {
      await localDatabase.clearAllData();
      
      toast.success('All data cleared successfully!', {
        description: 'Your device storage has been reset.',
      });
      
      // Reload the page
      window.location.reload();
    } catch (error) {
      console.error('Clear data error:', error);
      toast.error('Failed to clear data', {
        description: 'Please try again.',
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Data Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage your local data - all information is stored securely on your device
        </p>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Privacy First:</strong> All your data is stored locally on your device. 
          No data is ever sent to external servers, ensuring complete privacy and security.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Export Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Data
            </CardTitle>
            <CardDescription>
              Create a backup of all your data including portfolios, trades, accounts, and settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleExportData} 
              disabled={isExporting}
              className="w-full"
            >
              {isExporting ? (
                <>
                  <FileText className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export Backup
                </>
              )}
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Downloads a JSON file with all your data that you can save for backup purposes.
            </p>
          </CardContent>
        </Card>

        {/* Import Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import Data
            </CardTitle>
            <CardDescription>
              Restore your data from a previously created backup file.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
                id="import-file"
                disabled={isImporting}
              />
              <label htmlFor="import-file">
                <Button 
                  asChild
                  disabled={isImporting}
                  className="w-full"
                >
                  <span>
                    {isImporting ? (
                      <>
                        <FileText className="h-4 w-4 mr-2 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Backup File
                      </>
                    )}
                  </span>
                </Button>
              </label>
              <p className="text-sm text-muted-foreground">
                Select a backup file to restore your data. This will replace all current data.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clear All Data */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Clear All Data
          </CardTitle>
          <CardDescription className="text-destructive/80">
            Permanently delete all your data from this device.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="destructive" 
            onClick={handleClearAllData}
            disabled={isClearing}
            className="w-full"
          >
            {isClearing ? (
              <>
                <Trash2 className="h-4 w-4 mr-2 animate-spin" />
                Clearing...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Data
              </>
            )}
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            <strong>Warning:</strong> This action cannot be undone. Make sure you have a backup first.
          </p>
        </CardContent>
      </Card>

      {/* Data Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Storage Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Storage Type:</span>
              <span className="font-medium">
                {typeof window !== 'undefined' && 'indexedDB' in window 
                  ? 'IndexedDB (Web)' 
                  : 'SQLite (Mobile)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Data Location:</span>
              <span className="font-medium">Local Device Only</span>
            </div>
            <div className="flex justify-between">
              <span>Encryption:</span>
              <span className="font-medium">
                {typeof window !== 'undefined' && 'indexedDB' in window 
                  ? 'Browser Security' 
                  : 'SQLCipher Encrypted'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Sync:</span>
              <span className="font-medium">Manual Export/Import</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataManagement; 