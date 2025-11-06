"use client";
import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Gift,
  Edit3,
  Save,
  X,
  Package,
  Search,
  Loader2,
  Calendar,
  Ribbon,
  DollarSign,
  Hash,
  Zap,
  Image as ImageIcon,
  Users,
  Star,
  Clock,
  TrendingUp,
  FileText,
} from "lucide-react";
import { useRouter } from "next/navigation";

type Gift = {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  total_quantity: number;
  available_quantity: number;
  sticker_url?: string | null;
  is_active: boolean;
  ribbon_text?: string | null;
  ribbon_color?: string | null;
  limited_until?: string | null;
  created_at?: string;
};

type ViewMode = "grid" | "list";

type Banner = {
  id: string;
  url: string;
  filename?: string;
};

type ProjectStats = {
  days_operating: number;
  total: {
    gifts_purchased: number;
    stars_spent: number;
    new_users: number;
  };
  today: {
    gifts_purchased: number;
    stars_spent: number;
    new_users: number;
  };
};

const DEFAULT_DESCRIPTION = "Этот подарок скоро будет доступен для улучшения, продажи или выпуска в виде NFT.";

export default function AdminGiftsPage() {
  const router = useRouter();
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Gift>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<number | null>(null);
  const [grantForm, setGrantForm] = useState<{ tg_id: string; gift_id: number | ""; amount: number }>({ tg_id: "", gift_id: "", amount: 1 });
  const [transferForm, setTransferForm] = useState<{ from_tg_id: string; to_tg_id: string; gift_id: number | ""; amount: number }>({ from_tg_id: "", to_tg_id: "", gift_id: "", amount: 1 });
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const [bannerReplacing, setBannerReplacing] = useState(false);
  const [bannerFiles, setBannerFiles] = useState<File[]>([]);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [banners, setBanners] = useState<Banner[]>([]);

  const [projectStats, setProjectStats] = useState<ProjectStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const ribbonColors = {
    blue: { name: "Синяя", class: "bg-blue-500" },
    orange: { name: "Оранжевая", class: "bg-orange-500" },
    red: { name: "Красная", class: "bg-red-500" }
  };

  const gifOptions = [
    { label: "Castle", value: "/images/castle.gif" },
    { label: "Coconut", value: "/images/coconut.gif" },
    { label: "Flamingo", value: "/images/flamingo.gif" },
    { label: "Liberty", value: "/images/liberty.gif" },
    { label: "Ninja", value: "/images/ninja.gif" },
    { label: "Rocket", value: "/images/rocket.gif" },
    { label: "Sunglasses", value: "/images/sunglasses.gif" },
    { label: "Torch", value: "/images/torch.gif" },
  ];
  const [newGiftSticker, setNewGiftSticker] = useState<string>(gifOptions[0]?.value || "");

  async function loadGifts() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/gifts", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      if (!res.ok) throw new Error("Не удалось загрузить подарки");
      const data = await res.json();
      setGifts(data);
    } catch (e: any) {
      setError(e?.message || "Ошибка загрузки");
      console.error("Load error:", e);
    } finally {
      setLoading(false);
    }
  }

  async function loadProjectStats() {
    try {
      setStatsLoading(true);
      const res = await fetch("/api/admin/stats", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      if (!res.ok) throw new Error("Не удалось загрузить статистику");
      const data = await res.json();
      setProjectStats(data);
    } catch (e: any) {
      console.error("Stats load error:", e);
    } finally {
      setStatsLoading(false);
    }
  }

  async function fetchBanners() {
    try {
      const res = await fetch("/api/admin/banners", { cache: "no-store" });
      if (!res.ok) throw new Error("Не удалось загрузить баннеры");
      const data: Banner[] = await res.json();
      setBanners(
        data.map(b => ({
          ...b,
          url: b.url + (b.url.includes("?") ? "&" : "?") + "ts=" + Date.now(),
        }))
      );
    } catch (e) {
      setBanners([]);
    }
  }

  useEffect(() => {
    loadGifts();
    fetchBanners();
    loadProjectStats();
  }, []);

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  const filteredGifts = gifts.filter(gift => {
    const matchesSearch = gift.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         gift.ribbon_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         gift.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && gift.is_active) ||
                         (statusFilter === "inactive" && !gift.is_active);
    return matchesSearch && matchesStatus;
  });

  async function createGift() {
    setCreating(true);
    try {
      const res = await fetch("/api/admin/gifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Новый подарок",
          description: DEFAULT_DESCRIPTION,
          price: 100,
          total_quantity: 1,
          available_quantity: 1,
          is_active: true,
          sticker_url: newGiftSticker || null,
        }),
      });
      if (!res.ok) throw new Error("Ошибка создания");
      await loadGifts();
    } catch (e: any) {
      alert(e?.message || "Ошибка создания подарка");
    } finally {
      setCreating(false);
    }
  }

  async function handleBannerReplace() {
    if (!bannerFiles || bannerFiles.length === 0) {
      alert("Выберите файл(ы) баннера");
      return;
    }
    setBannerUploading(true);
    try {
      const formData = new FormData();
      for (const file of bannerFiles) {
        formData.append("banners", file);
      }
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Ошибка загрузки баннеров");
      setBannerReplacing(false);
      setBannerFiles([]);
      await fetchBanners();
      alert("Баннеры успешно добавлены!");
    } catch (e: any) {
      alert(e?.message || "Ошибка обновления баннера");
    } finally {
      setBannerUploading(false);
    }
  }

  async function deleteBanner(bannerId: string) {
    if (!confirm("Удалить этот баннер?")) return;
    try {
      const res = await fetch(`/api/admin/banners/${bannerId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Ошибка удаления баннера");
      await fetchBanners();
    } catch (e: any) {
      alert(e?.message || "Ошибка удаления баннера");
    }
  }

  function startEdit(gift: Gift) {
    setEditingId(gift.id);
    setEditForm({ ...gift });
    setMobileMenuOpen(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
  }

  async function saveEdit() {
    if (!editingId) return;
    
    try {
      const res = await fetch(`/api/admin/gifts/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error("Ошибка сохранения");
      setEditingId(null);
      setEditForm({});
      await loadGifts();
    } catch (e: any) {
      alert(e?.message || "Ошибка сохранения");
    }
  }

  function updateEditField(field: keyof Gift, value: any) {
    setEditForm(prev => ({ ...prev, [field]: value }));
  }

  async function toggleActive(gift: Gift) {
    try {
      const res = await fetch(`/api/admin/gifts/${gift.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !gift.is_active }),
      });
      if (!res.ok) throw new Error();
      await loadGifts();
      setMobileMenuOpen(null);
    } catch {
      alert("Ошибка обновления статуса");
    }
  }

  async function updateQuantity(gift: Gift, field: "available_quantity" | "total_quantity", value: number) {
    try {
      const res = await fetch(`/api/admin/gifts/${gift.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: Math.max(0, value) }),
      });
      if (!res.ok) throw new Error();
      await loadGifts();
    } catch {
      alert("Ошибка обновления количества");
    }
  }

  async function removeGift(gift: Gift) {
    if (!confirm(`Удалить подарок «${gift.name}»?`)) return;
    try {
      const res = await fetch(`/api/admin/gifts/${gift.id}`, { 
        method: "DELETE" 
      });
      if (!res.ok) throw new Error();
      await loadGifts();
      setMobileMenuOpen(null);
    } catch {
      alert("Ошибка удаления");
    }
  }

  async function grantGift() {
    if (!grantForm.tg_id || !grantForm.gift_id || grantForm.amount <= 0) {
      alert("Заполните tg_id, подарок и количество");
      return;
    }
    setBusyAction("grant");
    try {
      const res = await fetch('/api/admin/grants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tg_id: grantForm.tg_id, gift_id: Number(grantForm.gift_id), amount: Number(grantForm.amount) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Ошибка выдачи');
      await loadGifts();
      alert('Выдано');
    } catch (e: any) {
      alert(e?.message || 'Ошибка выдачи');
    } finally {
      setBusyAction(null);
    }
  }

  async function transferGift() {
    if (!transferForm.from_tg_id || !transferForm.to_tg_id || !transferForm.gift_id || transferForm.amount <= 0) {
      alert("Заполните поля перевода");
      return;
    }
    setBusyAction("transfer");
    try {
      const res = await fetch('/api/admin/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from_tg_id: transferForm.from_tg_id, to_tg_id: transferForm.to_tg_id, gift_id: Number(transferForm.gift_id), amount: Number(transferForm.amount) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Ошибка перевода');
      alert('Переведено');
    } catch (e: any) {
      alert(e?.message || 'Ошибка перевода');
    } finally {
      setBusyAction(null);
    }
  }

  const giftStats = {
    total: gifts.length,
    active: gifts.filter(g => g.is_active).length,
    inactive: gifts.filter(g => !g.is_active).length,
    available: gifts.reduce((sum, g) => sum + g.available_quantity, 0),
    totalValue: gifts.reduce((sum, g) => sum + (g.price * g.available_quantity), 0)
  };

  const SkeletonCard = () => (
    <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          <div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          </div>
        </div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="flex gap-2 mt-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
        </div>
      </div>
    </div>
  );

  const StatsSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen p-4 lg:p-6 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 lg:mb-8">
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="p-2 lg:p-3 bg-white dark:bg-[#1e293b] rounded-xl lg:rounded-2xl shadow-sm border border-blue-100 dark:border-blue-900">
              <Gift className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Управление подарками</h1>
              <p className="text-muted-foreground text-sm lg:text-base">Создавайте и редактируйте подарки</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg border transition-all ${
                  viewMode === "grid" 
                    ? "bg-blue-600 border-blue-600 text-white" 
                    : "bg-white dark:bg-[#1e293b] border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-blue-600"
                }`}
              >
                <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                  <div className={`rounded-sm ${viewMode === "grid" ? "bg-white dark:bg-[#1e293b]" : "bg-gray-400 dark:bg-gray-600"}`}></div>
                  <div className={`rounded-sm ${viewMode === "grid" ? "bg-white dark:bg-[#1e293b]" : "bg-gray-400 dark:bg-gray-600"}`}></div>
                  <div className={`rounded-sm ${viewMode === "grid" ? "bg-white dark:bg-[#1e293b]" : "bg-gray-400 dark:bg-gray-600"}`}></div>
                  <div className={`rounded-sm ${viewMode === "grid" ? "bg-white dark:bg-[#1e293b]" : "bg-gray-400 dark:bg-gray-600"}`}></div>
                </div>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg border transition-all ${
                  viewMode === "list" 
                    ? "bg-blue-600 border-blue-600 text-white" 
                    : "bg-white dark:bg-[#1e293b] border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-blue-600"
                }`}
              >
                <div className="w-4 h-4 flex flex-col gap-0.5">
                  <div className={`h-1 rounded-sm ${viewMode === "list" ? "bg-white dark:bg-[#1e293b]" : "bg-gray-400 dark:bg-gray-600"}`}></div>
                  <div className={`h-1 rounded-sm ${viewMode === "list" ? "bg-white dark:bg-[#1e293b]" : "bg-gray-400 dark:bg-gray-600"}`}></div>
                  <div className={`h-1 rounded-sm ${viewMode === "list" ? "bg-white dark:bg-[#1e293b]" : "bg-gray-400 dark:bg-gray-600"}`}></div>
                </div>
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <select
                value={newGiftSticker}
                onChange={(e) => setNewGiftSticker(e.target.value)}
                className="px-3 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-[#1e293b] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm lg:text-base text-gray-900 dark:text-gray-100"
                title="Выберите GIF"
              >
                {gifOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <img src={newGiftSticker} alt="preview" className="w-10 h-10 rounded-lg object-contain bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700" />
            </div>

            <button
              onClick={createGift}
              disabled={creating}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base"
            >
              {creating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
              )}
              Новый подарок
            </button>

            <button
              onClick={() => setBannerReplacing((v) => !v)}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-black dark:text-gray-900 font-semibold border border-yellow-300 dark:border-yellow-500 shadow transition-all text-sm lg:text-base"
              title="Добавить баннеры"
            >
              <ImageIcon className="w-4 h-4 lg:w-5 lg:h-5" />
              Баннеры
            </button>
            
            <button
              onClick={logout}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold border border-gray-200 dark:border-gray-700 transition-all text-sm lg:text-base"
            >
              Выйти
            </button>
          </div>
        </div>

        {/* Project Statistics */}
        <div className="mb-6 lg:mb-8">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl lg:text-2xl font-bold text-foreground">Статистика проекта</h2>
          </div>
           
          {statsLoading ? (
            <StatsSkeleton />
          ) : projectStats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-xl">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Дней работы</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {projectStats.days_operating}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-50 dark:bg-green-950 rounded-xl">
                    <Gift className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Всего подарков</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {projectStats.total.gifts_purchased.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-xl">
                    <Star className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Всего звезд</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {projectStats.total.stars_spent.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-xl">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Новых пользователей</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {projectStats.total.new_users.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-700 rounded-2xl p-6 text-center">
              <p className="text-red-700 dark:text-red-300">Не удалось загрузить статистику</p>
              <button
                onClick={loadProjectStats}
                className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
              >
                Попробовать снова
              </button>
            </div>
          )}

          {projectStats && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium opacity-90">Подарков сегодня</p>
                    <p className="text-2xl font-bold">{projectStats.today.gifts_purchased.toLocaleString()}</p>
                  </div>
                  <Gift className="w-8 h-8 opacity-90" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium opacity-90">Звезд сегодня</p>
                    <p className="text-2xl font-bold">{projectStats.today.stars_spent.toLocaleString()}</p>
                  </div>
                  <Star className="w-8 h-8 opacity-90" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium opacity-90">Новых пользователей</p>
                    <p className="text-2xl font-bold">{projectStats.today.new_users.toLocaleString()}</p>
                  </div>
                  <Users className="w-8 h-8 opacity-90" />
                </div>
              </div>
            </div>
          )}

          {projectStats?.top_today && (
            <div className="mt-4 bg-white dark:bg-[#1e293b] rounded-2xl p-4 border border-gray-100 dark:border-gray-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center">
                {projectStats.top_today.avatar_url ? (
                  <img src={projectStats.top_today.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm text-gray-600 dark:text-gray-300">{(projectStats.top_today.username || '?').slice(0,2).toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-500 dark:text-gray-400">Лучший за сегодня</div>
                <div className="font-medium text-gray-900 dark:text-gray-100">{projectStats.top_today.username || '—'}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 dark:text-gray-400">Звезды</div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">{projectStats.top_today.stars_spent.toLocaleString()}</div>
              </div>
            </div>
          )}
        </div>

        {/* Banner Management */}
        {bannerReplacing && (
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm border border-yellow-200 dark:border-yellow-700 p-4 mb-6 flex flex-col gap-4">
            <div className="font-semibold text-lg flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-yellow-600" />
              Управление баннерами сайта
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block mb-2 text-sm">
                  Добавить баннеры (PNG или JPEG, можно загружать сразу несколько разными очередями)
                </label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  multiple
                  onChange={e => {
                    if (!e.target.files) {
                      setBannerFiles([]);
                      return;
                    }
                    const newFiles = Array.from(e.target.files);
                    setBannerFiles(prev =>
                      [
                        ...prev, 
                        ...newFiles.filter(
                          nf => !prev.some(pf => pf.name === nf.name && pf.size === nf.size)
                        )
                      ]
                    );
                    e.target.value = "";
                  }}
                  className="block"
                />
                {bannerFiles && bannerFiles.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-2">
                    {bannerFiles.map((file, i) => (
                      <div key={file.name + file.size} className="flex items-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 relative">
                        <span className="text-xs max-w-[150px] truncate">{file.name}</span>
                        <button
                          type="button"
                          className="ml-2 text-red-600 hover:text-red-800"
                          title="Удалить из выбора"
                          onClick={() => {
                            setBannerFiles(prev => prev.filter((_, idx) => idx !== i));
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {banners.length > 0 && (
                <div>
                  <label className="block mb-2 text-sm">Текущие баннеры</label>
                  <div className="flex gap-4 flex-wrap">
                    {banners.map((banner) => (
                      <div key={banner.id} className="relative">
                        <img
                          src={banner.url}
                          alt="Баннер"
                          className="w-48 max-h-32 rounded shadow object-contain border dark:border-gray-700"
                        />
                        <button
                          type="button"
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center z-10"
                          title="Удалить баннер"
                          onClick={() => deleteBanner(banner.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-300 mt-2">
                    Кликните на корзину, чтобы удалить баннер.
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                disabled={!bannerFiles.length || bannerUploading}
                onClick={handleBannerReplace}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-black dark:text-gray-900 font-bold disabled:opacity-50 transition-all"
              >
                {bannerUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                Добавить выбранные баннеры
              </button>
              <button
                onClick={() => {
                  setBannerReplacing(false);
                  setBannerFiles([]);
                }}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-200 font-medium transition-all"
              >
                Отмена
              </button>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-300">
              Загрузите файлы для добавления новых баннеров. Рекомендуемый размер: 1200x300.<br />
              Вы можете выбрать сразу несколько файлов и удалить ненужные из списка до отправки.<br />
              Также можно удалять существующие баннеры.
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-card rounded-2xl p-4 lg:p-6 shadow-sm border border-border mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Поиск по названию, описанию или тексту ленты..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50/50 dark:bg-[#1e293b] transition-all text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50/50 dark:bg-[#1e293b] transition-all text-gray-900 dark:text-gray-100"
              >
                <option value="all">Все статусы</option>
                <option value="active">Активные</option>
                <option value="inactive">Скрытые</option>
              </select>
            </div>
          </div>

          {/* Admin actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-[#1e293b]">
              <div className="font-semibold mb-3">Выдать подарок пользователю</div>
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="tg_id" className="px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1e293b] rounded-lg text-gray-900 dark:text-gray-100" value={grantForm.tg_id} onChange={(e)=>setGrantForm({...grantForm, tg_id: e.target.value})} />
                <select className="px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1e293b] rounded-lg text-gray-900 dark:text-gray-100" value={grantForm.gift_id as any} onChange={(e)=>setGrantForm({...grantForm, gift_id: Number(e.target.value)})}>
                  <option value="">Подарок</option>
                  {gifts.map(g => (<option key={g.id} value={g.id}>{g.name}</option>))}
                </select>
                <input type="number" min={1} placeholder="Кол-во" className="px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1e293b] rounded-lg text-gray-900 dark:text-gray-100" value={grantForm.amount} onChange={(e)=>setGrantForm({...grantForm, amount: Number(e.target.value)})} />
                <button onClick={grantGift} disabled={busyAction==='grant'} className="px-3 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg">{busyAction==='grant'?'...':'Выдать'}</button>
              </div>
            </div>
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-[#1e293b]">
              <div className="font-semibold mb-3">Перевести между пользователями</div>
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="from tg_id" className="px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1e293b] rounded-lg text-gray-900 dark:text-gray-100" value={transferForm.from_tg_id} onChange={(e)=>setTransferForm({...transferForm, from_tg_id: e.target.value})} />
                <input placeholder="to tg_id" className="px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1e293b] rounded-lg text-gray-900 dark:text-gray-100" value={transferForm.to_tg_id} onChange={(e)=>setTransferForm({...transferForm, to_tg_id: e.target.value})} />
                <select className="px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1e293b] rounded-lg text-gray-900 dark:text-gray-100" value={transferForm.gift_id as any} onChange={(e)=>setTransferForm({...transferForm, gift_id: Number(e.target.value)})}>
                  <option value="">Подарок</option>
                  {gifts.map(g => (<option key={g.id} value={g.id}>{g.name}</option>))}
                </select>
                <input type="number" min={1} placeholder="Кол-во" className="px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1e293b] rounded-lg text-gray-900 dark:text-gray-100" value={transferForm.amount} onChange={(e)=>setTransferForm({...transferForm, amount: Number(e.target.value)})} />
                <button onClick={transferGift} disabled={busyAction==='transfer'} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">{busyAction==='transfer'?'...':'Перевести'}</button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-6 mb-6 lg:mb-8">
          <div className="bg-white dark:bg-[#1e293b] rounded-xl lg:rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <Package className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs lg:text-sm font-medium text-muted-foreground">Всего</p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-gray-100">{giftStats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-[#1e293b] rounded-xl lg:rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <Eye className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-400">Активных</p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-gray-100">{giftStats.active}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-[#1e293b] rounded-xl lg:rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 dark:bg-amber-950 rounded-lg">
                <EyeOff className="w-4 h-4 lg:w-5 lg:h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-400">Скрытых</p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-gray-100">{giftStats.inactive}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-[#1e293b] rounded-xl lg:rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <Zap className="w-4 h-4 lg:w-5 lg:h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-400">Доступно</p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-gray-100">{giftStats.available}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-[#1e293b] rounded-xl lg:rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
                <DollarSign className="w-4 h-4 lg:w-5 lg:h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-400">Общая стоимость</p>
                <p className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {giftStats.totalValue.toLocaleString()} звезд
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-700 rounded-2xl p-6 text-red-700 dark:text-red-300 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center">
                <span className="text-red-600 dark:text-red-300 text-sm">!</span>
              </div>
              <p className="font-medium">{error}</p>
            </div>
            <button
              onClick={loadGifts}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
            >
              Попробовать снова
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredGifts.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <Gift className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-300 text-lg font-medium mb-2">Подарки не найдены</p>
            <p className="text-gray-400 dark:text-gray-400 mb-6">
              {searchTerm || statusFilter !== "all" 
                ? "Попробуйте изменить параметры поиска" 
                : "Создайте первый подарок, чтобы начать"}
            </p>
            <button
              onClick={createGift}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
            >
              Создать подарок
            </button>
          </div>
        )}

        {/* Gifts Grid View */}
        {!loading && !error && filteredGifts.length > 0 && viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
            {filteredGifts.map((gift) => (
              <div
                key={gift.id}
                className={`bg-white dark:bg-[#1e293b] rounded-2xl p-5 lg:p-6 shadow-sm border transition-all ${
                  gift.is_active ? 'border-gray-200 dark:border-gray-700' : 'border-gray-200 dark:border-gray-700'
                } hover:shadow-md`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center ${
                      gift.is_active 
                        ? 'bg-gradient-to-br from-gray-100 dark:from-gray-800 to-gray-200 dark:to-gray-900' 
                        : 'bg-gradient-to-br from-gray-100 dark:from-gray-800 to-gray-200 dark:to-gray-900'
                    }`}>
                      <Gift className={`w-5 h-5 lg:w-6 lg:h-6 ${
                        gift.is_active ? 'text-gray-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate text-sm lg:text-base">
                        {editingId === gift.id ? (
                          <input
                            value={editForm.name || ""}
                            onChange={(e) => updateEditField("name", e.target.value)}
                            className="w-full px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-[#1e293b] text-gray-900 dark:text-gray-100"
                            placeholder="Название"
                          />
                        ) : (
                          gift.name
                        )}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">ID: #{gift.id}</p>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <div className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    gift.is_active 
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}>
                    {gift.is_active ? 'Активен' : 'Скрыт'}
                  </div>
                </div>

                {/* Description */}
                {(editingId === gift.id || gift.description) && (
                  <div className="mb-4">
                    {editingId === gift.id ? (
                      <>
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Описание</label>
                        </div>
                        <textarea
                          value={editForm.description || ""}
                          onChange={(e) => updateEditField("description", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-[#1e293b] text-gray-900 dark:text-gray-100 resize-none"
                          placeholder="Описание подарка (отображается в деталях)"
                          rows={3}
                        />
                      </>
                    ) : (
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            {gift.description || DEFAULT_DESCRIPTION}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Price */}
                <div className="mb-4">
                  {editingId === gift.id ? (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <input
                        type="number"
                        value={editForm.price || 0}
                        onChange={(e) => updateEditField("price", Number(e.target.value))}
                        className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-[#1e293b] text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {gift.price.toLocaleString()} звезд
                    </div>
                  )}
                </div>

                {/* Quantity */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Доступно / Всего</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {gift.available_quantity} / {gift.total_quantity}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateQuantity(gift, "available_quantity", gift.available_quantity - 1)}
                      disabled={gift.available_quantity <= 0}
                      className="flex-1 px-3 py-2 bg-red-50 dark:bg-red-900 hover:bg-red-100 dark:hover:bg-red-800 text-red-600 dark:text-red-300 rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
                    >
                      -1
                    </button>
                    <button
                      onClick={() => updateQuantity(gift, "available_quantity", gift.available_quantity + 1)}
                      className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg transition-colors text-sm font-medium"
                    >
                      +1
                    </button>
                  </div>

                  {editingId === gift.id && (
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <input
                        type="number"
                        value={editForm.total_quantity || 0}
                        onChange={(e) => updateEditField("total_quantity", Number(e.target.value))}
                        className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-[#1e293b] text-gray-900 dark:text-gray-100"
                        placeholder="Всего"
                      />
                    </div>
                  )}
                </div>

                {/* Ribbon and Limited Time */}
                {(gift.ribbon_text || gift.ribbon_color || gift.limited_until) && (
                  <div className="space-y-2 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    {gift.ribbon_text && (
                      <div className="flex items-center gap-2">
                        <Ribbon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-200">{gift.ribbon_text}</span>
                      </div>
                    )}
                    
                    {gift.ribbon_color && (
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${ribbonColors[gift.ribbon_color as keyof typeof ribbonColors]?.class}`}></div>
                        <span className="text-sm text-gray-700 dark:text-gray-200">
                          {ribbonColors[gift.ribbon_color as keyof typeof ribbonColors]?.name}
                        </span>
                      </div>
                    )}
                    
                    {gift.limited_until && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-200">
                          до {new Date(gift.limited_until).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Edit Form Fields */}
                {editingId === gift.id && (
                  <div className="space-y-3 mb-4">
                    <input
                      value={editForm.ribbon_text || ""}
                      onChange={(e) => updateEditField("ribbon_text", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-[#1e293b] text-gray-900 dark:text-gray-100"
                      placeholder="Текст ленты"
                    />
                    
                    <div className="flex gap-2">
                      <select
                        value={editForm.ribbon_color || ""}
                        onChange={(e) => updateEditField("ribbon_color", e.target.value || null)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-[#1e293b] text-gray-900 dark:text-gray-100"
                      >
                        <option value="">Цвет ленты</option>
                        {Object.entries(ribbonColors).map(([value, config]) => (
                          <option key={value} value={value}>{config.name}</option>
                        ))}
                      </select>
                      
                      <input
                        type="datetime-local"
                        value={editForm.limited_until ? new Date(editForm.limited_until).toISOString().slice(0, 16) : ""}
                        onChange={(e) => updateEditField("limited_until", e.target.value ? new Date(e.target.value).toISOString() : null)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-[#1e293b] text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                  {editingId === gift.id ? (
                    <>
                      <button
                        onClick={saveEdit}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition-colors text-sm font-medium"
                      >
                        <Save className="w-4 h-4" />
                        Сохранить
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        <X className="w-4 h-4" />
                        Отмена
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(gift)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        <Edit3 className="w-4 h-4" />
                        Редакт.
                      </button>
                      <button
                        onClick={() => toggleActive(gift)}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                          gift.is_active
                            ? "bg-amber-600 hover:bg-amber-700 text-white"
                            : "bg-gray-300 hover:bg-gray-400 text-gray-800"
                        }`}
                      >
                        {gift.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {gift.is_active ? "Скрыть" : "Вкл."}
                      </button>
                      <button
                        onClick={() => removeGift(gift)}
                        className="flex items-center justify-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List View */}
        {!loading && !error && filteredGifts.length > 0 && viewMode === "list" && (
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Подарок
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Цена
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Количество
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Статус
                    </th>
                    <th className="px-4 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredGifts.map((gift) => (
                    <tr key={gift.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            gift.is_active 
                              ? 'bg-gray-100 dark:bg-gray-800' 
                              : 'bg-gray-100 dark:bg-gray-800'
                          }`}>
                            <Gift className={`w-5 h-5 ${
                              gift.is_active ? 'text-gray-600' : 'text-gray-600'
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{gift.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">ID: #{gift.id}</p>
                            {gift.description && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 max-w-xs truncate" title={gift.description}>
                                {gift.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-4 py-4">
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {gift.price.toLocaleString()} звезд
                        </div>
                      </td>
                      
                      <td className="px-4 py-4">
                        <div className="space-y-2">
                          <div className="text-sm text-gray-900 dark:text-gray-100">
                            {gift.available_quantity} / {gift.total_quantity}
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => updateQuantity(gift, "available_quantity", gift.available_quantity - 1)}
                              disabled={gift.available_quantity <= 0}
                              className="w-6 h-6 flex items-center justify-center bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300 rounded text-xs disabled:opacity-50"
                            >
                              -1
                            </button>
                            <button
                              onClick={() => updateQuantity(gift, "available_quantity", gift.available_quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded text-xs"
                            >
                              +1
                            </button>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-4 py-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          gift.is_active
                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                        }`}>
                          {gift.is_active ? 'Активен' : 'Скрыт'}
                        </span>
                      </td>
                      
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => startEdit(gift)}
                            className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                          >
                            <Edit3 className="w-3 h-3" />
                            Ред.
                          </button>
                          <button
                            onClick={() => toggleActive(gift)}
                            className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors text-sm ${
                              gift.is_active
                                ? "bg-amber-600 hover:bg-amber-700 text-white"
                                : "bg-gray-300 hover:bg-gray-400 text-gray-800"
                            }`}
                          >
                            {gift.is_active ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                          <button
                            onClick={() => removeGift(gift)}
                            className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );

}