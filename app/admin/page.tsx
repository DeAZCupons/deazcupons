'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Users, Store, Ticket, DollarSign, ArrowUpRight, Clock } from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPartners: 0,
    totalCoupons: 0,
    monthlyRevenue: 0,
  })
  const [recentCoupons, setRecentCoupons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expiringPartners, setExpiringPartners] = useState<any[]>([])

  // Função auxiliar para extrair nome do parceiro (resolve o erro de Array do TS)
  const getPartnerName = (partners: any) => {
    if (Array.isArray(partners)) return partners[0]?.nome_estabelecimento || 'N/A';
    return partners?.nome_estabelecimento || 'N/A';
  }

  async function checkExpiringCoupons() {
    const today = new Date().toISOString().split('T')[0]
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const limitDate = threeDaysFromNow.toISOString().split('T')[0]

    const { data: expiringSoon } = await supabase
      .from('coupons')
      .select('id, title, alphanumeric_code, expires_at, partners(nome_estabelecimento)')
      .lte('expires_at', limitDate)
      .gte('expires_at', today)

    if (expiringSoon && expiringSoon.length > 0) {
      for (const coupon of expiringSoon) {
        const { data: existing } = await supabase
          .from('notifications')
          .select('id')
          .ilike('message', `%${coupon.alphanumeric_code}%`)
          .eq('is_read', false)
          .maybeSingle()

        if (!existing) {
          // CORREÇÃO LINHA 52: Usando a função auxiliar para evitar erro de Array
          const partnerName = getPartnerName(coupon.partners);
          
          await supabase.from('notifications').insert([{
            title: 'Cupom a Vencer!',
            message: `O cupom ${coupon.alphanumeric_code} (${coupon.title}) do parceiro ${partnerName} vence em ${new Date(coupon.expires_at).toLocaleDateString('pt-BR')}.`,
            type: 'coupon',
            link: '/admin/coupons/expiring'
          }])
        }
      }
    }
  }

  useEffect(() => {
    fetchDashboardData();
    checkExpiringCoupons();
  }, [])

  async function fetchDashboardData() {
    setLoading(true)
    try {
      const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true })
      const { count: partnersCount } = await supabase.from('partners').select('*', { count: 'exact', head: true })
      const { count: couponsCount } = await supabase.from('coupons').select('*', { count: 'exact', head: true })

      const { data: revenueData } = await supabase.from('partners').select('plans(monthly_price)')
      const totalRevenue = revenueData?.reduce((acc, curr: any) => {
        const price = Array.isArray(curr.plans) ? curr.plans[0]?.monthly_price : curr.plans?.monthly_price;
        return acc + (price || 0)
      }, 0)

      const { data: lastCoupons } = await supabase
        .from('coupons')
        .select('*, partners(nome_estabelecimento)')
        .order('created_at', { ascending: false })
        .limit(5)

      const today = new Date().toISOString().split('T')[0]
      const limitDate = new Date();
      limitDate.setDate(limitDate.getDate() + 5);
      const limitDateStr = limitDate.toISOString().split('T')[0]

      const { data: expiring } = await supabase
        .from('partners')
        .select('nome_estabelecimento, data_fim_plano, status_pagamento')
        .lte('data_fim_plano', limitDateStr)
        .gte('data_fim_plano', today)
        .eq('status_pagamento', 'Ativo')

      setStats({
        totalUsers: usersCount || 0,
        totalPartners: partnersCount || 0,
        totalCoupons: couponsCount || 0,
        monthlyRevenue: totalRevenue || 0,
      })
      
      if (lastCoupons) setRecentCoupons(lastCoupons)
      if (expiring) setExpiringPartners(expiring)

    } catch (error) {
      console.error("Erro ao carregar dashboard:", error)
    } finally {
      setLoading(false)
    }
  }

  const cards = [
    { label: 'Usuários Totais', value: stats.totalUsers, icon: <Users size={24}/>, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Parceiros Ativos', value: stats.totalPartners, icon: <Store size={24}/>, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Cupons no Sistema', value: stats.totalCoupons, icon: <Ticket size={24}/>, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Receita Mensal', value: `R$ ${stats.monthlyRevenue.toFixed(2)}`, icon: <DollarSign size={24}/>, color: 'text-orange-600', bg: 'bg-orange-50' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#101828]">Visão Geral</h1>
        <p className="text-sm text-[#7B8490]">Bem-vindo ao painel de controle do De AZ Cupons.</p>
      </div>
     
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.label} className="bg-white p-6 rounded-sm shadow-sm border border-[#E9EDF1] flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#7B8490] uppercase mb-1">{card.label}</p>
              <h3 className="text-2xl font-bold text-[#101828]">{loading ? '...' : card.value}</h3>
            </div>
            <div className={`p-3 rounded-full ${card.bg} ${card.color}`}>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-sm shadow-sm border border-[#E9EDF1]">
          <div className="p-6 border-b flex justify-between items-center">
            <h3 className="font-bold text-[#101828]">Cupons Adicionados Recentemente</h3>
            <Link href="/admin/coupons" className="text-xs text-blue-600 font-bold hover:underline">Ver todos</Link>
          </div>
          <div className="p-6">
            <table className="w-full text-left text-sm">
              <thead className="text-[#7B8490] border-b">
                <tr>
                  <th className="pb-3 font-medium">Cupom</th>
                  <th className="pb-3 font-medium">Parceiro</th>
                  <th className="pb-3 font-medium text-right">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentCoupons.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 font-medium text-[#101828]">{c.title}</td>
                    {/* CORREÇÃO NA LISTAGEM TAMBÉM */}
                    <td className="py-3 text-[#475467]">{getPartnerName(c.partners)}</td>
                    <td className="py-3 text-right text-[#7B8490]">
                      {new Date(c.created_at).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Card de Atalhos Rápidos */}
        <div className="bg-white rounded-sm shadow-sm border border-[#E9EDF1] p-6">
          <h3 className="font-bold text-[#101828] mb-4">Ações Rápidas</h3>
          <div className="space-y-3">
            <Link href="/admin/partners/new" className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 transition-colors group">
              <span className="text-sm font-medium text-[#475467]">Cadastrar Novo Cliente</span>
              <ArrowUpRight size={16} className="text-gray-400 group-hover:text-blue-600" />
            </Link>
            <Link href="/admin/coupons/new" className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 transition-colors group">
              <span className="text-sm font-medium text-[#475467]">Criar Novo Cupom</span>
              <ArrowUpRight size={16} className="text-gray-400 group-hover:text-blue-600" />
            </Link>
            <Link href="/admin/coupons/expiring" className="flex items-center justify-between p-3 border rounded border-orange-100 bg-orange-50/30 hover:bg-orange-50 transition-colors group">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-orange-500" />
                <span className="text-sm font-medium text-orange-700">Ver Cupons a Vencer</span>
              </div>
              <ArrowUpRight size={16} className="text-orange-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}