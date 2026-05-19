import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://wailemcevvdtkukqfwbm.supabase.co',
  'sb_publishable_CyOqqovNMQD58_gdHI1O8Q_U-0D6MOl'
)

export default function App() {
  const [aba, setAba] = useState('os')
  const [ordens, setOrdens] = useState(() => JSON.parse(localStorage.getItem('ordens') || '[]'))
  const [clientes, setClientes] = useState(() => JSON.parse(localStorage.getItem('clientes') || '[]'))
  const [cliente, setCliente] = useState('')
  const [equipamento, setEquipamento] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await supabase.from('ordens').select('*').order('id', { ascending:false })
        if (data?.length) setOrdens(data)
      } catch {}
    })()
  }, [])

  useEffect(() => {
    localStorage.setItem('ordens', JSON.stringify(ordens))
    localStorage.setItem('clientes', JSON.stringify(clientes))
  }, [ordens, clientes])

  async function salvar() {
    if (!cliente || !equipamento) return
    const nova = { id: Date.now(), cliente, equipamento, status: 'Recebido' }

    setOrdens(p => [nova, ...p])
    if (!clientes.includes(cliente)) setClientes(p => [...p, cliente])

    try { await supabase.from('ordens').insert([nova]) } catch {}

    setCliente('')
    setEquipamento('')
  }

  const card = (t,v) => <div style={{background:'#fff',padding:20,borderRadius:12,border:'1px solid #ddd',flex:1,minWidth:160}}><div>{t}</div><h2>{v}</h2></div>

  return (
    <div style={{display:'flex',fontFamily:'Arial',minHeight:'100vh',background:'#f3f4f6'}}>
      <aside style={{width:220,background:'#111827',color:'#fff',padding:20}}>
        <h2>Bancada OS</h2>
        {['os','clientes','dashboard'].map(x=><div key={x} onClick={()=>setAba(x)} style={{padding:12,cursor:'pointer',background:aba===x?'#374151':'transparent',borderRadius:8,marginTop:8}}>{x}</div>)}
      </aside>

      <main style={{flex:1,padding:20}}>
        <h1>Painel</h1>

        <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:20}}>
          {card('Ordens', ordens.length)}
          {card('Clientes', clientes.length)}
          {card('Hoje', new Date().toLocaleDateString())}
        </div>

        {aba==='os' && <div>
          <div style={{display:'flex',gap:10,marginBottom:20,flexWrap:'wrap'}}>
            <input value={cliente} onChange={e=>setCliente(e.target.value)} placeholder='Cliente'/>
            <input value={equipamento} onChange={e=>setEquipamento(e.target.value)} placeholder='Equipamento'/>
            <button onClick={salvar}>Nova OS</button>
          </div>

          {ordens.map(o=><div key={o.id} style={{background:'#fff',padding:12,border:'1px solid #ddd',marginBottom:10,borderRadius:8}}>
            #{o.id} — {o.cliente} — {o.equipamento} — {o.status}
          </div>)}
        </div>}

        {aba==='clientes' && <div>
          {clientes.map((c,i)=><div key={i} style={{background:'#fff',padding:12,marginBottom:10,borderRadius:8}}>{c}</div>)}
        </div>}

        {aba==='dashboard' && <div style={{background:'#fff',padding:20,borderRadius:12}}>
          Sincronizado com Supabase.
        </div>}
      </main>
    </div>
  )
}
