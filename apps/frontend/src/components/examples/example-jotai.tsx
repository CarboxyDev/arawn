'use client';

import { useAtom } from 'jotai';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { counterAtom, userPreferenceAtom } from '@/store/atoms';

export function ExampleJotai() {
  const [count, setCount] = useAtom(counterAtom);
  const [preferences, setPreferences] = useAtom(userPreferenceAtom);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-4 rounded-lg border p-6">
        <h3 className="text-lg font-semibold">Counter Example</h3>
        <div className="flex items-center gap-4">
          <Button onClick={() => setCount((c) => c - 1)} variant="outline">
            Decrement
          </Button>
          <span className="w-16 text-center text-2xl font-bold">{count}</span>
          <Button onClick={() => setCount((c) => c + 1)}>Increment</Button>
        </div>
        <Button onClick={() => setCount(0)} variant="secondary" size="sm">
          Reset
        </Button>
      </div>

      <div className="space-y-4 rounded-lg border p-6">
        <h3 className="text-lg font-semibold">User Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="sidebar-collapsed" className="cursor-pointer">
              Sidebar Collapsed
            </Label>
            <Switch
              id="sidebar-collapsed"
              checked={preferences.sidebarCollapsed}
              onCheckedChange={(checked) =>
                setPreferences((prev) => ({
                  ...prev,
                  sidebarCollapsed: checked,
                }))
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="notifications" className="cursor-pointer">
              Notifications Enabled
            </Label>
            <Switch
              id="notifications"
              checked={preferences.notificationsEnabled}
              onCheckedChange={(checked) =>
                setPreferences((prev) => ({
                  ...prev,
                  notificationsEnabled: checked,
                }))
              }
            />
          </div>
        </div>
        <div className="bg-muted mt-4 rounded-md p-4">
          <p className="text-sm font-medium">Current State:</p>
          <pre className="mt-2 text-xs">
            {JSON.stringify(preferences, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
