import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Calendar, Ticket, Clock, RefreshCcw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Transaction } from '@/pages/Index';

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  startDate: string; // ISO string
  cycleDays: number; // e.g., 30
  nextPaymentDate: string; // ISO string
  color: string;
}

interface SubscriptionManagerProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
}

const COLORS = [
  'bg-red-200 text-red-800',
  'bg-blue-200 text-blue-800',
  'bg-green-200 text-green-800',
  'bg-yellow-200 text-yellow-800',
  'bg-purple-200 text-purple-800',
  'bg-pink-200 text-pink-800',
];

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ onAddTransaction }) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newSub, setNewSub] = useState({ 
    name: '', 
    amount: '', 
    cycleDays: '30',
    startDate: new Date().toISOString().split('T')[0],
    createTransactionNow: true 
  });

  // Load subscriptions
  useEffect(() => {
    const saved = localStorage.getItem('subscriptions');
    if (saved) {
      setSubscriptions(JSON.parse(saved));
    }
  }, []);

  // Save subscriptions
  useEffect(() => {
    localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
  }, [subscriptions]);

  // Check for renewals on mount and when subscriptions change
  useEffect(() => {
    checkRenewals();
  }, [subscriptions]);

  const checkRenewals = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let updated = false;
    const newSubscriptions = subscriptions.map(sub => {
      let nextDate = new Date(sub.nextPaymentDate);
      nextDate.setHours(0, 0, 0, 0);

      // If the payment date has passed or is today
      if (today >= nextDate) {
        // Create Expense
        onAddTransaction({
          type: 'expense',
          amount: sub.amount,
          category: 'Langganan',
          description: `Perpanjangan: ${sub.name}`,
          date: new Date().toISOString()
        });

        toast({
          title: "Langganan Diperpanjang",
          description: `Tagihan ${sub.name} telah dicatat otomatis.`,
        });

        // Calculate next payment date
        // Add cycleDays to the *current* nextDate to keep schedule
        const nextNextDate = new Date(nextDate);
        nextNextDate.setDate(nextNextDate.getDate() + sub.cycleDays);
        
        updated = true;
        return {
          ...sub,
          nextPaymentDate: nextNextDate.toISOString()
        };
      }
      return sub;
    });

    if (updated) {
      setSubscriptions(newSubscriptions);
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSub.name || !newSub.amount || !newSub.cycleDays || !newSub.startDate) return;

    const start = new Date(newSub.startDate);
    // Calculate first "next payment". 
    // If "Create Transaction Now" is checked, the NEXT payment is start + cycle.
    // If NOT checked, the NEXT payment is the start date itself (assuming it hasn't happened yet? or user wants to track from future).
    // Actually, usually "Start Date" implies the subscription starts now.
    
    let nextPayment = new Date(start);
    
    if (newSub.createTransactionNow) {
       // Create immediate expense
       onAddTransaction({
         type: 'expense',
         amount: Number(newSub.amount),
         category: 'Langganan',
         description: `Langganan Baru: ${newSub.name}`,
         date: new Date().toISOString() // Record as today's expense
       });
       // Next payment is one cycle away
       nextPayment.setDate(nextPayment.getDate() + Number(newSub.cycleDays));
    } else {
       // First payment is on the start date (user might be adding a future sub)
       // Or user added a past sub but didn't want to record the past transaction
       // Let's assume nextPayment is the start date provided.
       // Note: checkRenewals will immediately catch it if it's today or past.
       nextPayment = start;
    }

    const sub: Subscription = {
      id: Date.now().toString(),
      name: newSub.name,
      amount: Number(newSub.amount),
      startDate: newSub.startDate,
      cycleDays: Number(newSub.cycleDays),
      nextPaymentDate: nextPayment.toISOString(),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };

    setSubscriptions([...subscriptions, sub]);
    setNewSub({ 
      name: '', 
      amount: '', 
      cycleDays: '30', 
      startDate: new Date().toISOString().split('T')[0],
      createTransactionNow: true 
    });
    setIsAdding(false);
    toast({ title: "Berhasil", description: "Langganan aktif dilacak!" });
  };

  const deleteSub = (id: string) => {
    if (confirm('Hapus tracking langganan ini?')) {
      setSubscriptions(subscriptions.filter(s => s.id !== id));
    }
  };

  const getDaysLeft = (nextPayment: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(nextPayment);
    target.setHours(0, 0, 0, 0);
    
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getProgress = (startDate: string, nextPayment: string, cycleDays: number) => {
      // We need to find the "current cycle start". 
      // Simplified: nextPayment - cycleDays
      const end = new Date(nextPayment).getTime();
      const start = end - (cycleDays * 24 * 60 * 60 * 1000);
      const now = new Date().getTime();
      
      const total = end - start;
      const current = now - start;
      const percent = (current / total) * 100;
      return Math.min(100, Math.max(0, percent));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-xl font-bold font-display flex items-center gap-2">
            <Ticket className="h-6 w-6 text-primary" />
            Langganan Aktif
          </h2>
          <p className="text-xs text-muted-foreground">Otomatis catat pengeluaran saat jatuh tempo.</p>
        </div>
        
        <Button onClick={() => setIsAdding(!isAdding)} size="sm" className="gap-2">
          <Plus className="h-4 w-4" /> Baru
        </Button>
      </div>

      {isAdding && (
        <Card className="animate-in slide-in-from-top-4 border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-sm">Mulai Langganan</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nama Layanan</Label>
                  <Input 
                    placeholder="Netflix, Spotify..." 
                    value={newSub.name}
                    onChange={e => setNewSub({...newSub, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Biaya (Rp)</Label>
                  <Input 
                    type="number" 
                    placeholder="50000" 
                    value={newSub.amount}
                    onChange={e => setNewSub({...newSub, amount: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label>Mulai Tanggal</Label>
                    <Input 
                      type="date"
                      value={newSub.startDate}
                      onChange={e => setNewSub({...newSub, startDate: e.target.value})}
                      required
                    />
                 </div>
                 <div className="space-y-2">
                    <Label>Durasi (Hari)</Label>
                    <Input 
                      type="number" 
                      placeholder="30" 
                      value={newSub.cycleDays}
                      onChange={e => setNewSub({...newSub, cycleDays: e.target.value})}
                      required
                    />
                 </div>
              </div>

              <div className="flex items-center space-x-2 border p-3 rounded-lg bg-muted/20">
                <Checkbox 
                  id="createNow" 
                  checked={newSub.createTransactionNow}
                  onCheckedChange={(c) => setNewSub({...newSub, createTransactionNow: c as boolean})}
                />
                <Label htmlFor="createNow" className="text-sm font-normal cursor-pointer">
                  Buat transaksi pembayaran pertama sekarang?
                </Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="w-full">Mulai Tracking</Button>
                <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>Batal</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {subscriptions.length === 0 ? (
          <div className="text-center py-12 bg-muted/20 rounded-xl border-2 border-dashed border-muted">
            <RefreshCcw className="h-12 w-12 mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-muted-foreground">Tidak ada langganan aktif.</p>
          </div>
        ) : (
          subscriptions.map(sub => {
            const daysLeft = getDaysLeft(sub.nextPaymentDate);
            const progress = getProgress(sub.startDate, sub.nextPaymentDate, sub.cycleDays);
            
            return (
              <div key={sub.id} className="relative group">
                <div className="bg-card border border-primary/20 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                  <div className="p-4 flex flex-col gap-4">
                    
                    {/* Header */}
                    <div className="flex justify-between items-start gap-4">
                       <div className="flex items-center gap-3 flex-1 min-w-0">
                          {/* Date Box instead of Logo */}
                          <div className="flex flex-col items-center justify-center bg-muted/30 border border-primary/10 rounded-lg h-12 w-12 shrink-0">
                            <span className="text-[10px] font-bold uppercase text-muted-foreground leading-none">
                              {new Date(sub.startDate).toLocaleDateString('id-ID', { month: 'short' })}
                            </span>
                            <span className="text-lg font-black leading-none">
                              {new Date(sub.startDate).getDate()}
                            </span>
                          </div>

                          <div className="min-w-0">
                             <h3 className="font-bold text-base truncate">{sub.name}</h3>
                             <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {sub.cycleDays} Hari / Siklus
                             </p>
                          </div>
                       </div>
                       
                       <div className="flex flex-col items-end gap-1">
                          <span className="font-mono font-bold text-sm sm:text-base">Rp {sub.amount.toLocaleString()}</span>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            onClick={() => deleteSub(sub.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                       </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                       <div className="flex justify-between text-xs font-medium">
                          <span className={daysLeft <= 3 ? "text-destructive" : "text-muted-foreground"}>
                             {daysLeft <= 0 ? "Hari ini!" : `${daysLeft} Hari lagi`}
                          </span>
                          <span className="text-muted-foreground/50">
                             {new Date(sub.nextPaymentDate).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}
                          </span>
                       </div>
                       <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                          <div 
                             className={`h-full transition-all duration-500 rounded-full ${daysLeft <= 3 ? 'bg-destructive' : 'bg-primary'}`}
                             style={{ width: `${progress}%` }}
                          ></div>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SubscriptionManager;