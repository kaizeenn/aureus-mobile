import React, { useState } from 'react';
import { Wallet, Transaction } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Plus, Trash2, Edit2, CreditCard, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface AccountManagerProps {
  wallets: Wallet[];
  selectedWalletId: string | null;
  onAddWallet: (wallet: Wallet) => void;
  onDeleteWallet: (id: string) => void;
  onSelectWallet: (id: string) => void;
  transactions?: Transaction[];
}

const WALLET_COLORS = [
  '#B85C5C', '#3A8B7E', '#B8A350', '#6BA89B', '#B37575',
  '#7D6B99', '#A88FA8', '#7CA8C8', '#A88A8A', '#356B99'
];

const WALLET_ICONS = ['💵', '💳', '🏦', '🏧', '💰', '💎', '🤑', '💸'];

const AccountManager: React.FC<AccountManagerProps> = ({
  wallets,
  selectedWalletId,
  onAddWallet,
  onDeleteWallet,
  onSelectWallet,
  transactions = [],
}) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'bank' as 'cash' | 'bank' | 'digital',
    color: WALLET_COLORS[0],
    icon: WALLET_ICONS[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Nama akun wajib diisi',
      });
      return;
    }

    const newWallet: Wallet = {
      id: `wallet-${Date.now()}`,
      name: formData.name,
      type: formData.type,
      balance: 0,
      currency: 'IDR',
      color: formData.color,
      icon: formData.icon,
      createdAt: new Date().toISOString(),
    };

    onAddWallet(newWallet);
    setFormData({
      name: '',
      type: 'bank',
      color: WALLET_COLORS[0],
      icon: WALLET_ICONS[0],
    });
    setOpen(false);

    toast({
      title: 'Berhasil',
      description: `Akun ${newWallet.name} telah ditambahkan`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Akun Saya
          </h2>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Tambah Akun
            </Button>
          </DialogTrigger>
        </div>

        {/* Wallet List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {wallets.map((wallet) => {
            const walletTransactions = transactions
              .filter(t => t.walletId === wallet.id || t.fromWalletId === wallet.id || t.toWalletId === wallet.id)
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 3);
            
            return (
              <Collapsible key={wallet.id} className="rounded-2xl overflow-hidden border border-border/60">
                <div
                  onClick={() => onSelectWallet(wallet.id)}
                  className="p-4 cursor-pointer transition-colors"
                  style={{ backgroundColor: wallet.color }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 flex-1 text-white">
                      <span className="text-2xl">{wallet.icon}</span>
                      <div>
                        <p className="font-semibold text-sm">{wallet.name}</p>
                        <p className="text-xs text-white/80">{wallet.id?.slice(0, 4)} {wallet.id?.slice(4, 8)} {wallet.id?.slice(8, 12)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-white">
                      <p className="text-sm font-semibold">Rp{wallet.balance.toLocaleString('id-ID')}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteWallet(wallet.id);
                          toast({
                            title: 'Berhasil',
                            description: `Akun ${wallet.name} telah dihapus`,
                          });
                        }}
                        className="h-6 w-6 p-0 text-white/80 hover:text-white hover:bg-white/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {wallet.balance < 0 && (
                    <p className="text-xs text-red-200 mt-2">⚠️ Saldo negatif</p>
                  )}
                </div>

                {walletTransactions.length > 0 && (
                  <CollapsibleTrigger className="flex w-full items-center justify-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-widest bg-muted/30 text-muted-foreground">
                    Aktivitas Terakhir
                    <ChevronDown className="h-3 w-3" />
                  </CollapsibleTrigger>
                )}

                <CollapsibleContent className="px-4 pb-4">
                  <div className="rounded-2xl overflow-hidden border border-border/60">
                    <div
                      className="px-4 py-3 text-sm font-semibold"
                      style={{ backgroundColor: wallet.color, color: '#fff' }}
                    >
                      Aktivitas Terakhir
                    </div>
                    <div className="bg-muted/20 p-3 space-y-3 text-sm max-h-60 overflow-y-auto">
                      {walletTransactions.map((trans) => {
                        const isExpense = trans.type === 'expense';
                        const isIncome = trans.type === 'income';
                        return (
                          <div key={trans.id} className="flex items-center justify-between">
                            <div className="min-w-0 pr-3">
                              <p className="text-sm font-medium truncate text-foreground/90">
                                {trans.description || trans.category}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(trans.date).toLocaleDateString('id-ID', {
                                  day: '2-digit',
                                  month: 'short',
                                })}
                              </p>
                            </div>
                            <span className={`text-sm font-semibold ${
                              isExpense ? 'text-red-500' : isIncome ? 'text-green-500' : 'text-blue-500'
                            }`}>
                              {isExpense ? '-' : '+'}Rp{trans.amount.toLocaleString('id-ID')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </div>

      {/* Add Account Dialog */}
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Tambah Akun Baru</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wallet-name">Nama Akun</Label>
              <Input
                id="wallet-name"
                placeholder="e.g., BCA Utama"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="wallet-type">Tipe Akun</Label>
              <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                <SelectTrigger id="wallet-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Tunai</SelectItem>
                  <SelectItem value="bank">Bank</SelectItem>
                  <SelectItem value="digital">Dompet Digital</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="grid grid-cols-4 gap-2">
                {WALLET_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon })}
                    className={`p-2 text-2xl rounded border-2 transition-all ${
                      formData.icon === icon ? 'border-primary bg-primary/10' : 'border-border'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

              <div className="space-y-2">
              <Label>Warna</Label>
              <div className="grid grid-cols-5 gap-2">
                {WALLET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`h-8 rounded border-2 transition-all flex items-center justify-center ${
                      formData.color === color ? 'border-foreground ring-2 ring-offset-2 ring-primary/50' : 'border-border'
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    {formData.color === color && (
                      <span className="text-[10px] font-bold text-foreground/80">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

          <Button type="submit" className="w-full">
            Tambah Akun
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AccountManager;
