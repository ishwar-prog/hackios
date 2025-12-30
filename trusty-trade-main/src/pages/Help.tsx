import { useState, useRef, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, MessageCircle, Phone, Mail, 
  Shield, Package, CreditCard, Users,
  ChevronRight, ChevronDown,
  CheckCircle2, AlertCircle, Send
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: Date;
}

const supportResponses = [
  "Thanks for reaching out! How can I assist you today?",
  "I understand your concern. Let me help you with that.",
  "Our escrow system ensures your payment is protected until you verify the product.",
  "You can track your order from the Orders page in your account.",
  "Is there anything else I can help you with?",
  "I'll escalate this to our specialist team. They'll get back to you shortly.",
];

const supportPhoneNumbers = [
  { label: 'General Support', number: '+919876543210' },
  { label: 'Escrow & Payments', number: '+919876543211' },
  { label: 'Order Issues', number: '+919876543212' },
];

const SUPPORT_EMAIL = 'support@reboxed.in';
const EMAIL_SUBJECT = 'Support Request - ReBoxed';

const Help = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', text: 'Hello! Welcome to ReBoxed support. How can I help you today?', sender: 'support', timestamp: new Date() }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const responseIndexRef = useRef(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    setTimeout(() => {
      const supportMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: supportResponses[responseIndexRef.current % supportResponses.length],
        sender: 'support',
        timestamp: new Date(),
      };
      responseIndexRef.current++;
      setMessages(prev => [...prev, supportMessage]);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const categories = [
    { icon: Shield, title: 'Escrow & Safety', description: 'How escrow protection works', articles: 12 },
    { icon: Package, title: 'Orders & Shipping', description: 'Track orders and delivery', articles: 8 },
    { icon: CreditCard, title: 'Payments & Refunds', description: 'Payment methods and refunds', articles: 6 },
    { icon: Users, title: 'Account & Profile', description: 'Manage your account settings', articles: 5 },
  ];

  const faqs = [
    { id: '1', question: 'How does escrow protection work?', answer: 'Escrow protection holds your payment securely until you verify the product. The seller only receives payment after you confirm the item is as described and working properly.', category: 'Escrow & Safety' },
    { id: '2', question: "What happens if the product doesn't match the description?", answer: "If the product doesn't match the description, you can raise a dispute within the verification period. We'll arrange a return pickup and issue a full refund once the item is returned.", category: 'Escrow & Safety' },
    { id: '3', question: 'How long do I have to verify my purchase?', answer: "You have 5 days from delivery to verify your purchase. If you don't respond within this time, payment will be automatically released to the seller.", category: 'Orders & Shipping' },
    { id: '4', question: 'Can I return an item after verification?', answer: 'Once you mark an item as "working" and payment is released, the transaction is complete. Returns are only possible during the verification period or through our dispute process.', category: 'Orders & Shipping' },
    { id: '5', question: 'What payment methods do you accept?', answer: 'We accept all major credit cards, debit cards, PayPal, and bank transfers. All payments are processed securely through our escrow system.', category: 'Payments & Refunds' },
    { id: '6', question: 'How long do refunds take to process?', answer: 'Refunds are processed within 3-5 business days after we receive the returned item. The money will be returned to your original payment method.', category: 'Payments & Refunds' },
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout showTrustBanner={false}>
      <div className="container py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">How can we help you?</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Find answers to common questions or get in touch with our support team
          </p>
          
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search for help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-lg border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Quick Contact */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Live Chat */}
          <div className="p-6 rounded-xl border transition-all hover:shadow-md bg-primary/5 border-primary/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full flex items-center justify-center bg-primary/10">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Live Chat</h3>
                <p className="text-sm text-muted-foreground">Chat with our support team</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Available 24/7</span>
              <Button variant="default" size="sm" onClick={() => setChatOpen(true)}>
                Start Chat
              </Button>
            </div>
          </div>

          {/* Email Support */}
          <div className="p-6 rounded-xl border transition-all hover:shadow-md bg-card border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full flex items-center justify-center bg-muted">
                <Mail className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Email Support</h3>
                <p className="text-sm text-muted-foreground">Send us a detailed message</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Response within 4 hours</span>
              <Button variant="outline" size="sm" asChild>
                <a href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(EMAIL_SUBJECT)}&body=${encodeURIComponent('Hi ReBoxed Support,\n\nI need help with:\n\n')}`}>
                  Send Email
                </a>
              </Button>
            </div>
          </div>

          {/* Phone Support */}
          <div className="p-6 rounded-xl border transition-all hover:shadow-md bg-card border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full flex items-center justify-center bg-muted">
                <Phone className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Phone Support</h3>
                <p className="text-sm text-muted-foreground">Speak with a specialist</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Mon-Fri 9AM-6PM EST</span>
              <Button variant="outline" size="sm" onClick={() => setPhoneModalOpen(true)}>
                Call Now
              </Button>
            </div>
          </div>
        </div>

        {/* Help Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <div 
                key={category.title}
                className="p-6 bg-card rounded-xl border border-border hover:border-primary/30 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <category.icon className="h-6 w-6 text-primary" />
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{category.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
                <Badge variant="outline" className="text-xs">{category.articles} articles</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {filteredFaqs.map((faq) => (
              <div key={faq.id} className="bg-card rounded-xl border border-border overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">{faq.question}</h3>
                    <Badge variant="outline" className="text-xs">{faq.category}</Badge>
                  </div>
                  {expandedFaq === faq.id ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
                {expandedFaq === faq.id && (
                  <div className="px-6 pb-6">
                    <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">System Status</h2>
            <Badge className="bg-success/10 text-success border-success/20">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              All Systems Operational
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <span className="font-medium text-foreground">Escrow System</span>
              </div>
              <span className="text-sm text-success">Operational</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <span className="font-medium text-foreground">Payment Processing</span>
              </div>
              <span className="text-sm text-success">Operational</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-warning" />
                <span className="font-medium text-foreground">Email Notifications</span>
              </div>
              <span className="text-sm text-warning">Delayed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Sheet */}
      <Sheet open={chatOpen} onOpenChange={setChatOpen}>
        <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
          <SheetHeader className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <SheetTitle className="text-left">Support Chat</SheetTitle>
                <p className="text-sm text-muted-foreground">We typically reply instantly</p>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted text-foreground rounded-bl-md'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-4 py-2 border border-border rounded-full bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button 
                size="icon" 
                className="rounded-full shrink-0"
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Phone Numbers Modal */}
      <Dialog open={phoneModalOpen} onOpenChange={setPhoneModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              Call Support
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {supportPhoneNumbers.map((phone) => (
              <a
                key={phone.number}
                href={`tel:${phone.number}`}
                className="flex items-center justify-between p-4 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors group"
              >
                <div>
                  <p className="font-medium text-foreground">{phone.label}</p>
                  <p className="text-sm text-muted-foreground">{phone.number}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Phone className="h-5 w-5 text-primary group-hover:text-primary-foreground" />
                </div>
              </a>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Mon-Fri 9AM-6PM EST • Tap a number to call
          </p>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Help;