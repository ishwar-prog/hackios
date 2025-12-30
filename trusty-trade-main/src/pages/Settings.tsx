import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings as SettingsIcon, Bell, Globe, Palette, 
  Shield, CreditCard, User, Mail, Smartphone,
  Moon, Sun, Monitor, Check
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { toast } = useToast();
  const [theme, setTheme] = useState('system');
  const [language, setLanguage] = useState('en');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    marketing: false
  });

  const settingsCategories = [
    {
      icon: User,
      title: 'Account',
      description: 'Manage your personal information',
      items: [
        { label: 'Personal Information', description: 'Update your name, email, and phone', action: 'Edit' },
        { label: 'Email Preferences', description: 'Choose what emails you receive', action: 'Manage' },
        { label: 'Privacy Settings', description: 'Control your data and visibility', action: 'Configure' },
      ]
    },
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Control how you receive updates',
      items: [
        { label: 'Order Updates', description: 'Get notified about order status changes', action: 'Configure' },
        { label: 'Security Alerts', description: 'Important security notifications', action: 'Configure' },
        { label: 'Marketing', description: 'Promotional emails and offers', action: 'Configure' },
      ]
    },
    {
      icon: CreditCard,
      title: 'Payment',
      description: 'Manage payment methods and billing',
      items: [
        { label: 'Payment Methods', description: 'Add or remove payment options', action: 'Manage' },
        { label: 'Billing History', description: 'View past transactions', action: 'View' },
        { label: 'Auto-pay Settings', description: 'Configure automatic payments', action: 'Setup' },
      ]
    },
    {
      icon: Shield,
      title: 'Security',
      description: 'Keep your account secure',
      items: [
        { label: 'Two-Factor Authentication', description: 'Add extra security to your account', action: 'Enable' },
        { label: 'Login Activity', description: 'Monitor account access', action: 'View' },
        { label: 'Connected Apps', description: 'Manage third-party access', action: 'Review' },
      ]
    }
  ];

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor }
  ];

  const languageOptions = [
    { value: 'en', label: 'English', flag: '🇺🇸' },
    { value: 'es', label: 'Español', flag: '🇪🇸' },
    { value: 'fr', label: 'Français', flag: '🇫🇷' },
    { value: 'de', label: 'Deutsch', flag: '🇩🇪' }
  ];

  const handleNotificationToggle = (type: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
    toast({
      title: "Settings Updated",
      description: `${type} notifications ${notifications[type] ? 'disabled' : 'enabled'}`,
    });
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    toast({
      title: "Theme Updated",
      description: `Theme changed to ${newTheme}`,
    });
  };

  return (
    <Layout showTrustBanner={false}>
      <div className="container py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences and application settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-8">
            {/* Appearance */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Palette className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Appearance</h3>
                  <p className="text-sm text-muted-foreground">Customize how the app looks</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-foreground mb-3 block">Theme</label>
                  <div className="grid grid-cols-3 gap-3">
                    {themeOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleThemeChange(option.value)}
                        className={`p-4 rounded-lg border transition-all ${
                          theme === option.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/30'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <option.icon className={`h-5 w-5 ${
                            theme === option.value ? 'text-primary' : 'text-muted-foreground'
                          }`} />
                          <span className={`text-sm font-medium ${
                            theme === option.value ? 'text-primary' : 'text-foreground'
                          }`}>
                            {option.label}
                          </span>
                          {theme === option.value && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-3 block">Language</label>
                  <div className="grid grid-cols-2 gap-3">
                    {languageOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setLanguage(option.value)}
                        className={`p-3 rounded-lg border transition-all flex items-center gap-3 ${
                          language === option.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/30'
                        }`}
                      >
                        <span className="text-lg">{option.flag}</span>
                        <span className={`font-medium ${
                          language === option.value ? 'text-primary' : 'text-foreground'
                        }`}>
                          {option.label}
                        </span>
                        {language === option.value && (
                          <Check className="h-4 w-4 text-primary ml-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Notification Preferences</h3>
                  <p className="text-sm text-muted-foreground">Choose how you want to be notified</p>
                </div>
              </div>

              <div className="space-y-4">
                {Object.entries(notifications).map(([key, enabled]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        {key === 'email' && <Mail className="h-4 w-4 text-primary" />}
                        {key === 'push' && <Bell className="h-4 w-4 text-primary" />}
                        {key === 'sms' && <Smartphone className="h-4 w-4 text-primary" />}
                        {key === 'marketing' && <Globe className="h-4 w-4 text-primary" />}
                      </div>
                      <div>
                        <p className="font-medium text-foreground capitalize">{key} Notifications</p>
                        <p className="text-sm text-muted-foreground">
                          {key === 'email' && 'Receive notifications via email'}
                          {key === 'push' && 'Browser and mobile push notifications'}
                          {key === 'sms' && 'Text message notifications'}
                          {key === 'marketing' && 'Promotional content and offers'}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant={enabled ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleNotificationToggle(key as keyof typeof notifications)}
                    >
                      {enabled ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Settings Categories */}
          <div className="space-y-6">
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Quick Settings</h3>
              <div className="space-y-4">
                {settingsCategories.map((category) => (
                  <div key={category.title} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <category.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{category.title}</p>
                        <p className="text-xs text-muted-foreground">{category.description}</p>
                      </div>
                    </div>
                    <div className="ml-11 space-y-2">
                      {category.items.map((item) => (
                        <div key={item.label} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{item.label}</span>
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                            {item.action}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Account Status */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Account Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Verification Status</span>
                  <Badge className="bg-success/10 text-success border-success/20">
                    Verified
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Account Type</span>
                  <Badge variant="outline">Premium</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Member Since</span>
                  <span className="text-sm text-foreground">Jan 2024</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Trust Score</span>
                  <span className="text-sm font-medium text-success">98/100</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-8 bg-destructive/5 border border-destructive/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Danger Zone</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Export Account Data</p>
                <p className="text-sm text-muted-foreground">Download all your account data</p>
              </div>
              <Button variant="outline">Export Data</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Deactivate Account</p>
                <p className="text-sm text-muted-foreground">Temporarily disable your account</p>
              </div>
              <Button variant="outline">Deactivate</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-destructive">Delete Account</p>
                <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
              </div>
              <Button variant="destructive">Delete Account</Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;