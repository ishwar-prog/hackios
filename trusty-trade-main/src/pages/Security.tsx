import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, Lock, Smartphone, Key, 
  AlertTriangle, CheckCircle2, Eye, EyeOff,
  Clock, MapPin, Monitor
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Security = () => {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const securityFeatures = [
    {
      icon: Shield,
      title: 'Escrow Protection',
      description: 'Your payments are held securely until you verify your purchase',
      status: 'active',
      action: 'Learn More'
    },
    {
      icon: Lock,
      title: 'Two-Factor Authentication',
      description: 'Add an extra layer of security to your account',
      status: twoFactorEnabled ? 'active' : 'inactive',
      action: twoFactorEnabled ? 'Disable' : 'Enable'
    },
    {
      icon: Key,
      title: 'Strong Password',
      description: 'Your password meets our security requirements',
      status: 'active',
      action: 'Change Password'
    },
    {
      icon: Smartphone,
      title: 'Device Management',
      description: 'Monitor and manage devices that access your account',
      status: 'active',
      action: 'Manage Devices'
    },
  ];

  const recentActivity = [
    {
      action: 'Login',
      device: 'Chrome on Windows',
      location: 'San Francisco, CA',
      time: '2 minutes ago',
      status: 'success'
    },
    {
      action: 'Password Changed',
      device: 'Mobile App',
      location: 'San Francisco, CA',
      time: '3 days ago',
      status: 'success'
    },
    {
      action: 'Failed Login Attempt',
      device: 'Unknown Device',
      location: 'New York, NY',
      time: '1 week ago',
      status: 'warning'
    },
    {
      action: 'Account Verification',
      device: 'Chrome on Mac',
      location: 'San Francisco, CA',
      time: '2 weeks ago',
      status: 'success'
    },
  ];

  const connectedDevices = [
    {
      name: 'Chrome on Windows',
      type: 'Desktop',
      location: 'San Francisco, CA',
      lastActive: 'Active now',
      current: true
    },
    {
      name: 'ReBoxed Mobile App',
      type: 'Mobile',
      location: 'San Francisco, CA',
      lastActive: '2 hours ago',
      current: false
    },
    {
      name: 'Safari on iPhone',
      type: 'Mobile',
      location: 'San Francisco, CA',
      lastActive: '1 day ago',
      current: false
    },
  ];

  const handleToggle2FA = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    toast({
      title: twoFactorEnabled ? "2FA Disabled" : "2FA Enabled",
      description: twoFactorEnabled 
        ? "Two-factor authentication has been disabled for your account."
        : "Two-factor authentication has been enabled for your account.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success/10 text-success border-success/20';
      case 'inactive': return 'bg-warning/10 text-warning border-warning/20';
      case 'warning': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'Login': return Monitor;
      case 'Password Changed': return Key;
      case 'Failed Login Attempt': return AlertTriangle;
      case 'Account Verification': return CheckCircle2;
      default: return Shield;
    }
  };

  return (
    <Layout showTrustBanner={false}>
      <div className="container py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Security Center</h1>
          <p className="text-muted-foreground">
            Manage your account security settings and monitor account activity
          </p>
        </div>

        {/* Security Score */}
        <div className="bg-gradient-to-r from-primary/10 to-success/10 rounded-xl border border-primary/20 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Security Score: 85/100</h2>
              <p className="text-muted-foreground">Your account security is strong, but can be improved</p>
            </div>
            <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center">
              <Shield className="h-10 w-10 text-primary" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-muted rounded-full h-3">
              <div className="bg-gradient-trust h-3 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Security Features */}
          <div className="space-y-6">
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-xl font-semibold text-foreground mb-6">Security Features</h3>
              <div className="space-y-4">
                {securityFeatures.map((feature) => (
                  <div key={feature.title} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <feature.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{feature.title}</p>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={getStatusColor(feature.status)}>
                        {feature.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={feature.title === 'Two-Factor Authentication' ? handleToggle2FA : undefined}
                      >
                        {feature.action}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Password Settings */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-xl font-semibold text-foreground mb-6">Password Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value="••••••••••••"
                      readOnly
                      className="w-full px-3 py-2 border border-border rounded-lg bg-muted text-foreground"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1">Change Password</Button>
                  <Button variant="outline" className="flex-1">Reset Password</Button>
                </div>
              </div>
            </div>
          </div>

          {/* Activity & Devices */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-foreground">Recent Activity</h3>
                <Button variant="ghost" size="sm">View All</Button>
              </div>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => {
                  const Icon = getActivityIcon(activity.action);
                  return (
                    <div key={index} className="flex items-start gap-4 p-3 bg-secondary rounded-lg">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        activity.status === 'success' ? 'bg-success/10' : 'bg-warning/10'
                      }`}>
                        <Icon className={`h-4 w-4 ${
                          activity.status === 'success' ? 'text-success' : 'text-warning'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground text-sm">{activity.action}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Monitor className="h-3 w-3" />
                          <span>{activity.device}</span>
                          <span>•</span>
                          <MapPin className="h-3 w-3" />
                          <span>{activity.location}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Clock className="h-3 w-3" />
                          <span>{activity.time}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Connected Devices */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-xl font-semibold text-foreground mb-6">Connected Devices</h3>
              <div className="space-y-4">
                {connectedDevices.map((device, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {device.type === 'Mobile' ? (
                          <Smartphone className="h-5 w-5 text-primary" />
                        ) : (
                          <Monitor className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground text-sm">{device.name}</p>
                          {device.current && (
                            <Badge className="bg-success/10 text-success border-success/20 text-xs">
                              Current
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{device.location}</span>
                          <span>•</span>
                          <span>{device.lastActive}</span>
                        </div>
                      </div>
                    </div>
                    {!device.current && (
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Security Tips */}
        <div className="mt-8 bg-primary/5 border border-primary/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Security Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
              <div>
                <p className="font-medium text-foreground text-sm">Use a strong, unique password</p>
                <p className="text-xs text-muted-foreground">Combine letters, numbers, and symbols</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
              <div>
                <p className="font-medium text-foreground text-sm">Enable two-factor authentication</p>
                <p className="text-xs text-muted-foreground">Add an extra layer of protection</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
              <div>
                <p className="font-medium text-foreground text-sm">Monitor account activity</p>
                <p className="text-xs text-muted-foreground">Check for suspicious logins regularly</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
              <div>
                <p className="font-medium text-foreground text-sm">Keep devices secure</p>
                <p className="text-xs text-muted-foreground">Log out from shared or public devices</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Security;