import React, { useState } from 'react';
import { Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Plus, Trash2, Tags } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CategoryManagerProps {
  categories: Category[];
  onAddCategory: (category: Category) => void;
  onDeleteCategory: (id: string) => void;
  inline?: boolean;
}

const CATEGORY_COLORS = [
  '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181',
  '#AA96DA', '#FCBAD3', '#A8D8EA', '#FFB6B9', '#D4A5A5'
];

const CATEGORY_ICONS = [
  '🍔', '🚗', '🛍️', '📱', '⚕️', '🎮', '📚', '🏠', '📞', '🎓',
  '✈️', '🎬', '📖', '⚽', '🎵', '🍕', '☕', '🎪', '🏋️', '🧳'
];

const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  onAddCategory,
  onDeleteCategory,
  inline = false,
}) => {
  const [open, setOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    color: CATEGORY_COLORS[0],
    icon: CATEGORY_ICONS[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Nama kategori wajib diisi',
      });
      return;
    }

    // Check if category already exists
    if (categories.some((c) => c.name.toLowerCase() === formData.name.toLowerCase())) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Kategori ini sudah ada',
      });
      return;
    }

    const newCategory: Category = {
      id: `category-${Date.now()}`,
      name: formData.name,
      type: formData.type,
      color: formData.color,
      icon: formData.icon,
      isCustom: true,
      createdAt: new Date().toISOString(),
    };

    onAddCategory(newCategory);
    setFormData({
      name: '',
      type: 'expense',
      color: CATEGORY_COLORS[0],
      icon: CATEGORY_ICONS[0],
    });
    setAddDialogOpen(false);
    if (!inline) {
      setOpen(false);
    }

    toast({
      title: 'Berhasil',
      description: `Kategori ${newCategory.name} telah ditambahkan`,
    });
  };

  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const incomeCategories = categories.filter((c) => c.type === 'income');

  const content = (
    <div className="w-full flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">Kelola Kategori</h3>
          <p className="text-xs text-muted-foreground">Atur kategori pemasukan dan pengeluaran</p>
        </div>
        <Button
          type="button"
          size="sm"
          className="h-8 text-sm gap-2 rounded-full px-3"
          onClick={() => setAddDialogOpen(true)}
        >
          <Plus className="h-3 w-3" />
          Baru
        </Button>
      </div>
      <Tabs defaultValue="all" className="w-full flex flex-col flex-1 overflow-hidden">
        <TabsList className="grid w-full grid-cols-3 flex-shrink-0 bg-muted/40 p-1 rounded-full">
            <TabsTrigger value="all">Semua</TabsTrigger>
            <TabsTrigger value="expense">Pengeluaran</TabsTrigger>
            <TabsTrigger value="income">Pemasukan</TabsTrigger>
          </TabsList>

          {/* All Categories */}
          <TabsContent value="all" className="space-y-2 overflow-y-auto flex-1 scrollbar-hide">
            {categories.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Belum ada kategori. Tambahkan kategori baru untuk memulai.
              </p>
            ) : (
              <div className="space-y-2">
                {categories.map((category) => (
                    <div
                      key={category.id}
                    className="flex items-center justify-between rounded-lg border border-border/60 bg-card/60 px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                      <span className="text-base">{category.icon}</span>
                        <div>
                          <p className="font-medium text-sm">{category.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {category.type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
                          </p>
                        </div>
                      </div>
                      {category.isCustom && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            onDeleteCategory(category.id);
                            toast({
                              title: 'Berhasil',
                              description: `Kategori ${category.name} telah dihapus`,
                            });
                          }}
                        className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Expense Categories */}
          <TabsContent value="expense" className="space-y-2 overflow-y-auto flex-1 scrollbar-hide">
            <div className="space-y-2">
              {expenseCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-card/60 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{category.icon}</span>
                    <div>
                      <p className="font-medium text-sm">{category.name}</p>
                      <p className="text-xs text-muted-foreground">{category.isCustom ? 'Custom' : 'Default'}</p>
                    </div>
                  </div>
                  {category.isCustom && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onDeleteCategory(category.id);
                        toast({
                          title: 'Berhasil',
                          description: `Kategori ${category.name} telah dihapus`,
                        });
                      }}
                      className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Income Categories */}
          <TabsContent value="income" className="space-y-2 overflow-y-auto flex-1 scrollbar-hide">
            <div className="space-y-2">
              {incomeCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-card/60 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{category.icon}</span>
                    <div>
                      <p className="font-medium text-sm">{category.name}</p>
                      <p className="text-xs text-muted-foreground">{category.isCustom ? 'Custom' : 'Default'}</p>
                    </div>
                  </div>
                  {category.isCustom && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onDeleteCategory(category.id);
                        toast({
                          title: 'Berhasil',
                          description: `Kategori ${category.name} telah dihapus`,
                        });
                      }}
                      className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Tambah Kategori Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3 max-h-[60vh] overflow-y-auto scrollbar-hide pr-2">
            <div className="space-y-1">
              <Label htmlFor="category-name" className="text-xs">Nama Kategori</Label>
              <Input
                id="category-name"
                placeholder="e.g., Olahraga"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-8 text-sm"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="category-type" className="text-xs">Tipe</Label>
              <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                <SelectTrigger id="category-type" className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Pengeluaran</SelectItem>
                  <SelectItem value="income">Pemasukan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Icon</Label>
              <div className="grid grid-cols-5 gap-1">
                {CATEGORY_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon })}
                    className={`p-1 text-sm rounded border transition-all ${
                      formData.icon === icon ? 'border-primary bg-primary/10 border-2' : 'border-border border'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Warna</Label>
              <div className="grid grid-cols-5 gap-1">
                {CATEGORY_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`h-6 rounded border transition-all ${
                      formData.color === color ? 'border-foreground border-2' : 'border-border border'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1 h-8 text-sm" size="sm">
                <Plus className="h-3 w-3 mr-1" />
                Simpan
              </Button>
              <Button type="button" variant="outline" className="h-8 text-sm" size="sm" onClick={() => setAddDialogOpen(false)}>
                Batal
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );

  if (inline) {
    return content;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full gap-2">
          <Tags className="h-4 w-4" />
          Kelola Kategori
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Kelola Kategori</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};

export default CategoryManager;
