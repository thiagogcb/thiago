import React, { useEffect, useState } from 'react'

export default function App() {
  const [ordens, setOrdens] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ordens') || '[]') }
    catch { return [] }
  })
  const [cliente, setCliente] = useState('')
  const [equipamento, setEquipamento] = useState('')

  useEffect(() => {
    localStorage.setItem('ordens', JSON.stringify(ordens))
  }, [ordens])

  function salvar() {
    if (!cliente || !equipamento) return
    setOrdens(prev => [
      { id: Date.now(), cliente, equipamento, status: 'Recebido' },
      ...prev
    ])
    setCliente('')
    setEquipamento('')
  }

  return (
    <div style={{ fontFamily:'Arial', padding:20, maxWidth:900, margin:'0 auto' }}>
      <h1>Bancada OS</h1>
      <p>Ordens persistentes</p>

      <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' }}>
        <input value={cliente} onChange={e=>setCliente(e.target.value)} placeholder="Cliente" />
        <input value={equipamento} onChange={e=>setEquipamento(e.target.value)} placeholder="Equipamento" />
        <button onClick={salvar}>Nova OS</button>
      </div>

      {ordens.map(item => (
        <div key={item.id} style={{ border:'1px solid #ddd', padding:12, marginBottom:10 }}>
          #{item.id} — {item.cliente} — {item.equipamento} — {item.status}
        </div>
      ))}
    </div>
  )
}
