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
}) => {
  const [open, setOpen] = useState(false);
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
    setOpen(false);

    toast({
      title: 'Berhasil',
      description: `Kategori ${newCategory.name} telah ditambahkan`,
    });
  };

  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const incomeCategories = categories.filter((c) => c.type === 'income');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full gap-2">
          <Tags className="h-4 w-4" />
          Kelola Kategori
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Kelola Kategori</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Semua</TabsTrigger>
            <TabsTrigger value="expense">Pengeluaran</TabsTrigger>
            <TabsTrigger value="income">Pemasukan</TabsTrigger>
          </TabsList>

          {/* All Categories */}
          <TabsContent value="all" className="space-y-4 max-h-96 overflow-y-auto">
            {categories.filter((c) => c.isCustom).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Tidak ada kategori custom. Tambahkan kategori baru untuk memulai.
              </p>
            ) : (
              <div className="space-y-2">
                {categories
                  .filter((c) => c.isCustom)
                  .map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{category.icon}</span>
                        <div>
                          <p className="font-medium text-sm">{category.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {category.type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
                          </p>
                        </div>
                      </div>
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
                        className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
              </div>
            )}
          </TabsContent>

          {/* Expense Categories */}
          <TabsContent value="expense" className="space-y-4 max-h-96 overflow-y-auto">
            <div className="space-y-2">
              {expenseCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
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
                      className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Income Categories */}
          <TabsContent value="income" className="space-y-4 max-h-96 overflow-y-auto">
            <div className="space-y-2">
              {incomeCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
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
                      className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Add Category Form */}
        <div className="space-y-4 border-t pt-4">
          <h3 className="font-semibold text-sm">Tambah Kategori Baru</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Nama Kategori</Label>
              <Input
                id="category-name"
                placeholder="e.g., Olahraga"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-type">Tipe</Label>
              <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                <SelectTrigger id="category-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Pengeluaran</SelectItem>
                  <SelectItem value="income">Pemasukan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="grid grid-cols-5 gap-2 max-h-32 overflow-y-auto">
                {CATEGORY_ICONS.map((icon) => (
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
                {CATEGORY_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`h-8 rounded border-2 transition-all ${
                      formData.color === color ? 'border-foreground ring-2 ring-offset-2' : 'border-border'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Kategori
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryManager;
