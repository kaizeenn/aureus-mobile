import React from 'react';
import { Category } from '@/types';
import Header from '@/components/Header';
import BottomNav, { NavTab } from '@/components/BottomNav';
import CategoryManager from '@/components/CategoryManager';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CategoriesPageProps {
  categories: Category[];
  onAddCategory: (category: Category) => void;
  onDeleteCategory: (id: string) => void;
  onBack: () => void;
}

const CategoriesPage: React.FC<CategoriesPageProps> = ({
  categories,
  onAddCategory,
  onDeleteCategory,
  onBack,
}) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0" />
      </div>

      {/* Persistent Header */}
      <div className="relative z-10">
        <Header />
      </div>

      {/* Main Content - with bottom nav spacing */}
      <main className="pb-nav custom-scrollbar relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-6 py-6">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <Button
              onClick={onBack}
              variant="ghost"
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Button>
            <h2 className="text-lg font-semibold">Kelola Kategori</h2>
          </div>

          {/* Categories Section */}
          <div className="rounded-lg border bg-card p-4 space-y-4">
            <CategoryManager
              categories={categories}
              onAddCategory={onAddCategory}
              onDeleteCategory={onDeleteCategory}
            />
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab="more" onTabChange={() => {}} />
    </div>
  );
};

export default CategoriesPage;
