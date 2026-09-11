'use client'
import { useState, useEffect, useMemo, Suspense, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Menu, X, User, History, Settings, LogOut, Home, Tag, 
  LayoutGrid, Camera, Mail, Phone, Building2, MessageCircle, Search, Clock, ChevronRight, Heart 
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { toast } from 'sonner'

const SUPABASE_PROJECT_ID = 'zuvvlonpnghxxozfmbbf';
const STORAGE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/coupons/`;

const getImageUrl = (path: string) => {
  if (!path) return 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc';
  if (path.startsWith('http')) return path;
  return `${STORAGE_URL}${path}`;
};

// --- COMPONENTE DE ESTRELAS ---
function StarRating({ rating = 0, total = 0, interactive = false, onRate }: { 
  rating?: number; 
  total?: number; 
  interactive?: boolean;
  onRate?: (val: number) => void 
}) {
  const safeRating = Number(rating) || 0;
  return (
    <div className="flex items-center gap-1">
      <div className="flex text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            disabled={!interactive}
            onClick={(e) => { e.stopPropagation(); onRate && onRate(star); }}
            className={`${interactive ? 'hover:scale-125 transition-transform' : 'cursor-default'}`}
          >
            {star <= Math.round(safeRating) ? '★' : '☆'}
          </button>
        ))}
      </div>
      <span className="text-[10px] font-bold text-slate-400 ml-1">({total})</span>
    </div>
  )
}

function VitrineContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // ESTADOS DE DADOS
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [categories, setCategories] = useState<any[]>([])
  const [coupons, setCoupons] = useState<any[]>([])
  const [partners, setPartners] = useState<any[]>([])
  
  // ESTADOS DE INTERAÇÃO
  const [userFavorites, setUserFavorites] = useState<string[]>([])
  const [userHistory, setUserHistory] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'all' | 'favorites' | 'history'>('all')

  // ESTADOS DE INTERFACE
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null)
  const [activeUsageId, setActiveUsageId] = useState<string | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isSearchVisible, setIsSearchVisible] = useState(false)

  const featuredSlides = useMemo(() => coupons.filter(c => c.slide_image_url).slice(0, 5), [coupons]);
  const recentCoupons = useMemo(() => [...coupons].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 6), [coupons]);

  // --- BUSCA DE DADOS ---
  async function fetchCoupons() {
    const { data } = await supabase.from('coupons')
      .select(`*, categories(name), partners(*), coupon_ratings(rating)`)
      .eq('status', 'active')
    
    if (data) {
      const formatted = data.map(c => {
        const ratings = c.coupon_ratings || []
        const avg = ratings.length > 0 ? ratings.reduce((acc: number, curr: any) => acc + curr.rating, 0) / ratings.length : 0
        return { ...c, avgRating: avg, totalRatings: ratings.length }
      })
      setCoupons(formatted)
    }
  }

  async function fetchUserData(userId: string) {
    const [favs, hist] = await Promise.all([
      supabase.from('coupon_favorites').select('coupon_id').eq('user_id', userId),
      supabase.from('coupon_usages').select('coupon_id').eq('user_id', userId)
    ])
    if (favs.data) setUserFavorites(favs.data.map(f => f.coupon_id))
    if (hist.data) setUserHistory(hist.data.map(h => h.coupon_id))
  }

  // --- FUNÇÕES DE INTERAÇÃO ---
  async function toggleFavorite(couponId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error("Faça login para favoritar!"); return; }

    if (userFavorites.includes(couponId)) {
      await supabase.from('coupon_favorites').delete().eq('user_id', user.id).eq('coupon_id', couponId)
      setUserFavorites(prev => prev.filter(id => id !== couponId))
      toast.info('Removido dos favoritos')
    } else {
      await supabase.from('coupon_favorites').insert([{ user_id: user.id, coupon_id: couponId }])
      setUserFavorites(prev => [...prev, couponId])
      toast.success('Adicionado aos favoritos!')
    }
  }

  async function recordUsage(couponId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data, error } = await supabase
      .from('coupon_usages')
      .upsert([{ user_id: user.id, coupon_id: couponId }], { onConflict: 'user_id,coupon_id' })
      .select('id')
      .single()

    if (error) {
      console.error('Erro ao registrar uso do cupom:', error.message)
      return
    }

    setActiveUsageId(data.id)
    if (!userHistory.includes(couponId)) setUserHistory(prev => [...prev, couponId])
  }

  async function handleRate(couponId: string, value: number) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('coupon_ratings').upsert([{ user_id: user.id, coupon_id: couponId, rating: value }])
    if (!error) {
      toast.success('Avaliação enviada!')
      fetchCoupons()
    }
  }

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserName(user.user_metadata.full_name || 'Usuário')
      
      await Promise.all([
        supabase.from('categories').select('*').order('name').then(({data}) => setCategories(data || [])),
        supabase.from('partners').select('*').limit(20).then(({data}) => setPartners(data || [])),
        fetchCoupons(),
        fetchUserData(user.id)
      ])
      setLoading(false)
    }
    init()
  }, []);

  // --- FILTRAGEM DINÂMICA ---
  const filteredCoupons = coupons.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         c.partners?.nome_estabelecimento?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (viewMode === 'favorites') return userFavorites.includes(c.id) && matchesSearch;
    if (viewMode === 'history') return userHistory.includes(c.id) && matchesSearch;
    
    const matchesCategory = selectedCategory ? c.category_id === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* HEADER */}
      <header className="bg-white border-b sticky top-0 z-[100] shadow-sm">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <img src="https://deazcupons.com.br/dashboard/assets/images/logo-dark.svg" className="h-8 md:h-9 cursor-pointer" onClick={() => {setViewMode('all'); setSelectedCategory(null)}} />
          
          <nav className="hidden lg:flex items-center gap-8 font-bold text-sm text-slate-600">
          
            <button onClick={() => setViewMode('all')} className={`flex items-center gap-2 ${viewMode === 'all' ? 'text-[#00B9F2]' : ''}`}><Home size={18}/> Home</button>
            <button onClick={() => router.push('/vitrine/#coupon-list')} className="flex items-center gap-2"><LayoutGrid size={18}/> Cupons</button>
            <button onClick={() => router.push('/vitrine/categorias')} className="flex items-center gap-2"><LayoutGrid size={18}/> Categorias</button>
            <button onClick={() => router.push('/vitrine/parceiros')} className="flex items-center gap-2"><Building2 size={18}/> Parceiros</button>
          
          </nav>

          <div className="flex items-center gap-2">
            <button className="md:hidden p-2 text-slate-600" onClick={() => setIsSearchVisible(!isSearchVisible)}><Search size={24}/></button>
            
            <div className="hidden lg:relative lg:block ml-4 border-l pl-4 group">
              <button className="flex items-center gap-3 cursor-pointer" onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
                <div className="w-10 h-10 bg-[#00B9F2] rounded-full flex items-center justify-center text-white font-bold">{userName[0]}</div>
                <span className="font-bold text-sm text-slate-700">{userName.split(' ')[0]}</span>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded-2xl shadow-xl p-2 opacity-0 group-hover:opacity-100 transition-all pointer-events-none group-hover:pointer-events-auto">
                <button onClick={() => router.push('/vitrine/perfil')} className="w-full text-left px-4 py-2 hover:bg-slate-50 rounded-lg text-sm flex items-center gap-2 font-bold text-slate-700"><Settings size={16}/> Perfil</button>
                <div onClick={() => {setViewMode('favorites'); setIsMobileMenuOpen(false)}} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl"><Heart size={20}/> Favoritos</div>
                <div onClick={() => {setViewMode('history'); setIsMobileMenuOpen(false)}} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl"><History size={20}/> Histórico</div>
                <button onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} className="w-full text-left px-4 py-2 hover:bg-red-50 rounded-lg text-sm flex items-center gap-2 font-bold text-red-500"><LogOut size={16}/> Sair</button>
              </div>
            </div>

            <button className="lg:hidden p-2 ml-2" onClick={() => setIsMobileMenuOpen(true)}><Menu size={28}/></button>
          </div>
        </div>
      </header>

      {/* MENU MOBILE */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-black/60 z-[200] backdrop-blur-sm" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed top-0 right-0 bottom-0 w-[280px] bg-white z-[210] p-6 shadow-2xl">
              <div className="flex justify-between mb-8"><img src="https://deazcupons.com.br/dashboard/assets/images/logo-dark.svg" className="h-6" /><button onClick={() => setIsMobileMenuOpen(false)}><X size={24}/></button></div>
              <div className="space-y-4 font-bold text-slate-700">
                <div onClick={() => {setViewMode('all'); setIsMobileMenuOpen(false)}} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl"><Home size={20}/> Home</div>
                <div onClick={() => {setViewMode('favorites'); setIsMobileMenuOpen(false)}} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl"><Heart size={20}/> Favoritos</div>
                <div onClick={() => {setViewMode('history'); setIsMobileMenuOpen(false)}} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl"><History size={20}/> Histórico</div>
                <div onClick={() => router.push('/vitrine/perfil')} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl"><User size={20}/> Editar Perfil</div>
                <hr />
                <div className="flex items-center gap-3 p-3 text-red-500" onClick={() => supabase.auth.signOut().then(() => router.push('/login'))}><LogOut size={20}/> Sair</div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="container mx-auto px-4 flex-grow py-8">
        {/* Banner - Só na Home */}
        {viewMode === 'all' && (
           <section className="mb-12 rounded-[20px] overflow-hidden h-[300px] md:h-[400px] relative bg-slate-200 shadow-lg">
             {featuredSlides.length > 0 ? (
               <div className="w-full h-full relative">
                 <img src={getImageUrl(featuredSlides[currentSlide].slide_image_url)} className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 p-8 flex flex-col justify-end">
                   <h2 className="text-white text-2xl md:text-4xl font-black mb-4 tracking-tighter italic">{featuredSlides[currentSlide].title}</h2>
                   <button onClick={() => {setSelectedCoupon(featuredSlides[currentSlide]); recordUsage(featuredSlides[currentSlide].id)}} className="bg-[#00B9F2] text-white px-8 py-3 rounded-full font-bold w-fit shadow-lg">Resgatar Agora</button>
                 </div>
               </div>
             ) : <div className="h-full flex items-center justify-center text-slate-400">Carregando...</div>}
           </section>
        )}

        <div className="flex flex-col lg:flex-row gap-8 mt-4">
          <div id="coupon-list" className="flex-grow lg:w-3/4">
            <h3 className="text-xl font-black italic mb-6 tracking-tighter uppercase text-slate-800">
              {viewMode === 'all' ? 'Cupons Recomendados' : viewMode === 'favorites' ? 'Meus Favoritos' : 'Histórico de Uso'}
            </h3>

            {filteredCoupons.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredCoupons.map(coupon => (
                  <div key={coupon.id} onClick={() => {setSelectedCoupon(coupon); recordUsage(coupon.id)}} className="bg-white rounded-[24px] overflow-hidden border hover:shadow-lg transition-all cursor-pointer group relative">
                    <div className="h-32 overflow-hidden relative">
                      <img src={getImageUrl(coupon.image_url)} className="w-full h-full object-cover group-hover:scale-110 transition-duration-500" />
                      <button onClick={(e) => { e.stopPropagation(); toggleFavorite(coupon.id); }} className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur rounded-full shadow-sm z-10">
                        <Heart size={16} className={userFavorites.includes(coupon.id) ? 'fill-red-500 text-red-500' : 'text-slate-400'} />
                      </button>
                    </div>
                    <div className="p-4">
                      <StarRating rating={coupon.avgRating} total={coupon.totalRatings} />
                      <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">{coupon.partners?.nome_estabelecimento}</p>
                      <h4 className="font-bold text-slate-800 text-sm leading-tight line-clamp-2 h-10">{coupon.title}</h4>
                      <div className="mt-3 pt-3 border-t border-dashed flex items-center justify-between font-black text-[#00B9F2] text-xs">
                         {coupon.alphanumeric_code}
                         <ChevronRight size={16} className="text-slate-300" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-slate-200">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  {viewMode === 'favorites' ? <Heart size={40}/> : <History size={40}/>}
                </div>
                <h4 className="text-xl font-bold text-slate-400 uppercase">Vazio por aqui.</h4>
                <p className="text-slate-400 text-sm">Explore a vitrine para encontrar novos cupons!</p>
              </div>
            )}
          </div>

          {/* SIDEBAR COM PARCEIROS E CTA */}
          <aside className="lg:w-1/4 space-y-8 mt-12">

              <div className="bg-[#F2F0EF] p-6 rounded-3xl border border-[#B5C7EB] shadow-sm">
              <h4 className="font-black text-sm uppercase tracking-widest border-b pb-3 mb-4 italic">Cupons Recentes</h4>
              <div className="space-y-4">
                {recentCoupons.map(c => (
                  <div key={c.id} onClick={() => {setSelectedCoupon(c); recordUsage(c.id)}} className="flex items-center gap-3 cursor-pointer hover:bg-white p-2 rounded-xl transition-all group">
                    <div className="bg-[#00B9F2]/10 p-2 rounded-lg text-[#00B9F2] group-hover:bg-[#00B9F2] group-hover:text-white"><Tag size={16}/></div>
                    <p className="text-xs font-bold text-slate-700 line-clamp-1">{c.title}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#F2F0EF] p-6 rounded-3xl border border-[#B5C7EB] shadow-sm">
              <h4 className="font-black text-sm uppercase tracking-widest border-b pb-3 mb-4 italic">Nossos Parceiros</h4>
              <div className="grid grid-cols-2 gap-4">
                {partners.slice(0, 6).map(p => (
                  <div key={p.id} className="text-center group">
                    <div className="w-full aspect-square bg-white rounded-2xl mb-1 flex items-center justify-center p-2 border group-hover:border-[#00B9F2] transition-all overflow-hidden shadow-sm">
                      <img src={p.logo_url || 'https://via.placeholder.com/150'} className="max-h-full max-w-full object-contain" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 truncate block">{p.nome_estabelecimento}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 bg-gradient-to-br from-[#00B9F2] to-[#0089b6] p-5 rounded-[24px] text-white relative overflow-hidden shadow-lg group">
                <Building2 className="absolute -right-4 -top-4 opacity-10 rotate-12" size={80} />
                <div className="relative z-10 text-center">
                  <h5 className="font-black text-xs uppercase mb-1">Sua loja aqui?</h5>
                  <p className="text-[10px] opacity-90 mb-4">Aumente suas vendas.</p>
                  <button onClick={() => router.push('/portal')} className="w-full bg-white text-[#00B9F2] py-2 rounded-xl font-black text-[10px] uppercase group-hover:scale-105 transition-all">Seja Parceiro</button>
                </div>
              </div>
            </div>
            <div className="bg-slate-100 p-6 rounded-3xl border border-dashed border-slate-300 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Dúvidas ou Suporte?</p>
              <a 
                href="https://wa.me/5531996899744" 
                className="text-xs font-black text-slate-700 flex items-center justify-center gap-2 hover:text-[#00B9F2]"
              >
                <MessageCircle size={16} /> Central de Ajuda
              </a>
            </div>
          </aside>
        </div>
      </main>

      {/* <footer className="bg-[#1e1e1e] text-slate-400 py-12 px-4 mt-auto">
    <div className="container mx-auto">
      <div className="flex flex-wrap gap-4 text-[13px] mb-8 font-medium">
        {['Termos de utilização', 'Política de privacidade', 'Política de Cookies', 'Quero ser um parceiro', 'Sobre nós', 'Mídia Kit', 'Contato'].map(link => (
          <a key={link} href="#" className="hover:text-white transition-colors">{link}</a>
        ))}
      </div>
      <p className="text-xs">De AZ Cupons © 2020 - Designed by <span className="text-[#00B9F2] font-bold uppercase">De AZ Cupons</span></p>
    </div>
  </footer> */}

  <footer className="bg-slate-900 text-white py-16">
    <div className="container mx-auto px-4">
      {/* flex-col e items-center garantem o alinhamento vertical centralizado */}
      <div className="flex flex-col items-center text-center space-y-8">
        
        <img src="https://deazcupons.com.br/dashboard/assets/images/logo-white.svg" alt="De AZ" className="h-12" />
        
        <nav className="flex flex-col md:flex-row items-center gap-6 text-slate-400 font-medium">
          <a href="/politica-de-privacidade" className="hover:text-[#00B9F2] transition-colors">Política de privacidade</a>
          <a href="/politica-de-cookies" className="hover:text-[#00B9F2] transition-colors">Política de Cookies</a>
          <a href="/portal#precos" className="hover:text-[#00B9F2] transition-colors">Preços</a>
          <a href="/portal#cadastro" className="hover:text-[#00B9F2] transition-colors">Torne-se um parceiro</a>
          <a href="/termos-de-uso" className="hover:text-[#00B9F2] transition-colors">Termos de Uso</a>
        </nav>

        <div className="flex gap-6">
          <a href="#" className="p-3 bg-slate-800 rounded-full hover:bg-[#00B9F2] transition-all"><Camera size={20}/></a>
          <a href="#" className="p-3 bg-slate-800 rounded-full hover:bg-[#00B9F2] transition-all"><Mail size={20}/></a>
          <a href="#" className="p-3 bg-slate-800 rounded-full hover:bg-[#00B9F2] transition-all"><Phone size={20}/></a>
        </div>

        <div className="pt-8 border-t border-slate-800 w-full text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} De AZ Cupons. Todos os direitos reservados. - Designed by <span className="text-[#00B9F2] font-bold uppercase">De AZ Cupons</span></p>
        </div>
      </div>
    </div>
  </footer>

      {/* MODAL DETALHES */}
      <AnimatePresence>
        {selectedCoupon && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => {setSelectedCoupon(null); setActiveUsageId(null)}} className="fixed inset-0 bg-black/80 z-[300] backdrop-blur-sm" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="fixed bottom-0 left-0 right-0 bg-white z-[310] rounded-t-[40px] max-h-[95vh] overflow-y-auto p-6 md:p-10 shadow-2xl">
              <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <img src={getImageUrl(selectedCoupon.image_url)} className="w-full h-64 object-cover rounded-[32px] mb-6 shadow-lg" />
                  <h2 className="text-3xl font-black italic mb-2 uppercase">{selectedCoupon.title}</h2>
                  <div className="bg-slate-50 p-4 rounded-2xl mb-4 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Avalie este desconto:</p>
                    <StarRating interactive rating={selectedCoupon.avgRating} total={selectedCoupon.totalRatings} onRate={(v) => handleRate(selectedCoupon.id, v)} />
                  </div>
                  <p className="text-[#00B9F2] font-bold mb-4">{selectedCoupon.partners?.nome_estabelecimento}</p>
                  <p className="text-slate-600 text-sm leading-relaxed">{selectedCoupon.long_description}</p>
                </div>
                <div className="flex-1 flex flex-col items-center bg-slate-50 rounded-[40px] p-8 border">
                  <QRCodeSVG value={activeUsageId || ''} size={150} />
                  <div className="w-full border-2 border-dashed border-[#00B9F2] p-4 rounded-2xl text-center my-6 bg-white">
                    <span className="text-2xl font-black tracking-widest break-all">{activeUsageId || 'Gerando...'}</span>
                  </div>
                  <a href={`https://wa.me/${selectedCoupon.partners?.whatsapp || selectedCoupon.whatsapp_number}`} className="w-full bg-[#25D366] text-white py-4 rounded-2xl font-black flex justify-center gap-3 items-center shadow-lg"><MessageCircle size={24}/> WhatsApp</a>
                  <button onClick={() => {setSelectedCoupon(null); setActiveUsageId(null)}} className="mt-6 text-slate-400 font-bold uppercase text-[10px]">Fechar</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando Vitrine...</div>}>
      <VitrineContent />
    </Suspense>
  )
}

function NavLink({ label, icon, onClick }: { label: string; icon: ReactNode; onClick: () => void }) {
  return <button onClick={onClick} className="flex items-center gap-2 transition-colors hover:text-[#00B9F2]">{icon} {label}</button>
}