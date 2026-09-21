'use client'
import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { QrCode, Keyboard, CheckCircle2, XCircle, Loader2, ScanLine } from 'lucide-react'

type ResultStatus = 'idle' | 'success' | 'expired' | 'invalid' | 'not_found'

type CouponPreview = {
  id: string
  title: string
  short_description: string | null
}

type ValidationResult = {
  status: ResultStatus
  coupon?: CouponPreview
}

const SCANNER_DIV_ID = 'qr-reader'

// Detecta se o texto lido/digitado é um UUID (id do cupom) em vez do
// código de marketing (alphanumeric_code) — o QR impresso hoje codifica o id.
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default function ValidarCupom() {
  const [partnerId, setPartnerId] = useState<string | null>(null)
  const [loadingPartner, setLoadingPartner] = useState(true)
  const [mode, setMode] = useState<'manual' | 'scanner'>('manual')
  const [code, setCode] = useState('')
  const [validating, setValidating] = useState(false)
  const [result, setResult] = useState<ValidationResult>({ status: 'idle' })
  const scannerRef = useRef<any>(null)

  // Descobre o parceiro logado a partir da sessão atual
  useEffect(() => {
    async function loadPartner() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoadingPartner(false)
        return
      }
      const { data: partner } = await supabase
        .from('partners')
        .select('id')
        .eq('user_id', user.id)
        .single()
      setPartnerId(partner?.id ?? null)
      setLoadingPartner(false)
    }
    loadPartner()
  }, [])

  // Controla o ciclo de vida do leitor de QR Code
  useEffect(() => {
    if (mode !== 'scanner') {
      scannerRef.current?.clear().catch(() => {})
      scannerRef.current = null
      return
    }

    let isMounted = true

    import('html5-qrcode').then(({ Html5QrcodeScanner }) => {
      if (!isMounted) return
      const scanner = new Html5QrcodeScanner(
        SCANNER_DIV_ID,
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      )
      scanner.render(
        (decodedText: string) => {
          const cleanCode = decodedText.trim()
          setCode(cleanCode)
          scanner.pause(true)
          handleValidate(cleanCode)
        },
        () => {} // erro de leitura em um frame específico — ignorado, tenta o próximo
      )
      scannerRef.current = scanner
    })

    return () => {
      isMounted = false
      scannerRef.current?.clear().catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  // Retoma a câmera após o parceiro validar um cupom via scanner e
  // quiser ler o próximo — sem isso a tela fica parada no último frame
  function handleScanAgain() {
    setResult({ status: 'idle' })
    setCode('')
    scannerRef.current?.resume()
  }

  async function handleValidate(rawCode?: string) {
    const codeToValidate = (rawCode ?? code).trim().toUpperCase()

    if (!codeToValidate) {
      toast.error('Digite ou escaneie um código.')
      return
    }
    if (!partnerId) {
      toast.error('Não foi possível identificar seu estabelecimento.')
      return
    }

    setValidating(true)
    setResult({ status: 'idle' })

    try {
      const isUuid = UUID_REGEX.test(codeToValidate)

      // Busca o cupom já restrito ao parceiro logado — um parceiro nunca
      // consegue validar o código de outro estabelecimento, mesmo que o digite.
      // Aceita tanto o id (QR atual) quanto o alphanumeric_code (digitação manual).
      let query = supabase
        .from('coupons')
        .select('id, title, short_description, status, active, expires_at')
        .eq('partner_id', partnerId)

      query = isUuid
        ? query.eq('id', codeToValidate)
        : query.eq('alphanumeric_code', codeToValidate)

      const { data: coupon, error: couponError } = await query.maybeSingle()

      if (couponError) throw couponError

      if (!coupon) {
        setResult({ status: 'not_found' })
        return
      }

      const preview: CouponPreview = {
        id: coupon.id,
        title: coupon.title,
        short_description: coupon.short_description
      }

      const isExpired = new Date(coupon.expires_at) < new Date()
      const isInactive = coupon.status !== 'active' || !coupon.active

      if (isExpired) {
        setResult({ status: 'expired', coupon: preview })
        return
      }
      if (isInactive) {
        setResult({ status: 'invalid', coupon: preview })
        return
      }

      // Registra o resgate. Sem user_id: o código não identifica o cliente,
      // só valida que aquele cupom é daquele parceiro e está dentro da validade.
      const { error: usageError } = await supabase
        .from('coupon_usages')
        .insert([{
          coupon_id: coupon.id,
          partner_id: partnerId,
          used_at: new Date().toISOString(),
          validated_at: new Date().toISOString()
        }])

      if (usageError) throw usageError

      setResult({ status: 'success', coupon: preview })
      toast.success('Cupom validado com sucesso!')
    } catch (error: any) {
      console.error('Erro ao validar cupom:', error)
      toast.error(error.message || 'Erro ao validar cupom')
    } finally {
      setValidating(false)
      setCode('')
    }
  }

  if (loadingPartner) {
    return <div className="p-10 text-center text-slate-500">Carregando...</div>
  }

  if (!partnerId) {
    return (
      <div className="p-10 text-center text-red-500">
        Não foi possível identificar seu estabelecimento. Faça login novamente.
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto my-10 p-6">
      <h1 className="text-xl font-bold text-slate-800 mb-6">Validar Cupom</h1>

      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => setMode('manual')}
          className={`flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors ${
            mode === 'manual' ? 'bg-[#00B9F2] text-white' : 'bg-slate-100 text-slate-600'
          }`}
        >
          <Keyboard size={18} /> Digitar código
        </button>
        <button
          type="button"
          onClick={() => setMode('scanner')}
          className={`flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors ${
            mode === 'scanner' ? 'bg-[#00B9F2] text-white' : 'bg-slate-100 text-slate-600'
          }`}
        >
          <QrCode size={18} /> Ler QR Code
        </button>
      </div>

      {mode === 'manual' && (
        <div className="space-y-3">
          <input
            value={code}
            onChange={e => setCode(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleValidate()}
            placeholder="Ex: 15OFFPRATO"
            className="w-full px-4 py-3 border rounded-xl uppercase outline-[#00B9F2]"
            autoFocus
          />
          <button
            type="button"
            onClick={() => handleValidate()}
            disabled={validating}
            className="w-full py-3 bg-[#00B9F2] text-white rounded-xl font-bold disabled:opacity-60 flex items-center justify-center"
          >
            {validating ? <Loader2 className="animate-spin" size={20} /> : 'Validar Cupom'}
          </button>
        </div>
      )}

      {mode === 'scanner' && (
        <div id={SCANNER_DIV_ID} className="rounded-xl overflow-hidden" />
      )}

      {result.status !== 'idle' && (
        <div
          className={`mt-6 p-4 rounded-xl border flex items-start gap-3 ${
            result.status === 'success'
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}
        >
          {result.status === 'success' ? (
            <CheckCircle2 className="text-green-600 shrink-0" size={24} />
          ) : (
            <XCircle className="text-red-600 shrink-0" size={24} />
          )}
          <div>
            {result.status === 'success' && (
              <>
                <p className="font-bold text-green-800">Cupom válido!</p>
                <p className="text-sm text-green-700">{result.coupon?.title}</p>
              </>
            )}
            {result.status === 'expired' && (
              <>
                <p className="font-bold text-red-800">Cupom expirado</p>
                <p className="text-sm text-red-700">{result.coupon?.title}</p>
              </>
            )}
            {result.status === 'invalid' && (
              <>
                <p className="font-bold text-red-800">Cupom inativo</p>
                <p className="text-sm text-red-700">{result.coupon?.title}</p>
              </>
            )}
            {result.status === 'not_found' && (
              <p className="font-bold text-red-800">
                Código não encontrado para o seu estabelecimento
              </p>
            )}
          </div>
        </div>
      )}

      {/* Só aparece depois de ler um QR — retoma a câmera pro próximo cupom */}
      {mode === 'scanner' && result.status !== 'idle' && (
        <button
          type="button"
          onClick={handleScanAgain}
          className="w-full mt-3 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium flex items-center justify-center gap-2"
        >
          <ScanLine size={18} /> Ler outro cupom
        </button>
      )}
    </div>
  )
}
