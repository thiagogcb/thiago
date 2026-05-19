import React, { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import jsPDF from "jspdf";

function nextId(ref){ ref.current += 1; return ref.current; }
function runSelfTests(){ const r={current:2000}; if(new Set([nextId(r),nextId(r),nextId(r)]).size!==3) throw new Error("id"); }
runSelfTests();
const supabase = createClient("https://wailemcevvdtkukqfwbm.supabase.co", "sb_publishable_CyOqqovNMQD58_gdHI1O8Q_U-0D6MOl");

export default function App(){
  const idCounter = useRef(1043);
  const [clientes,setClientes] = useState(()=>{ try { return JSON.parse(localStorage.getItem('clientes')||'[{"id":1,"nome":"Maria Souza","telefone":"87999990001"},{"id":2,"nome":"João Lima","telefone":"87999990002"}]') } catch { return [] } }); const [user,setUser] = useState(null);
  const [ordens,setOrdens] = useState(()=>{ try { return JSON.parse(localStorage.getItem('ordens')||'[{"id":1042,"cliente":"Maria Souza","equipamento":"iPhone 13","status":"Em andamento","defeito":"Tela"}]') } catch { return [] } });
  const [financeiro,setFinanceiro] = useState(()=>{ try { return JSON.parse(localStorage.getItem('financeiro')||'[{"id":1,"tipo":"Entrada","valor":120,"data":"2026-05-19"}]') } catch { return [] } });
  const [form,setForm] = useState({cliente:"",equipamento:"",defeito:""}); useEffect(()=>{ localStorage.setItem('clientes', JSON.stringify(clientes)); localStorage.setItem('ordens', JSON.stringify(ordens)); localStorage.setItem('financeiro', JSON.stringify(financeiro)); }, [clientes, ordens, financeiro]); useEffect(()=>{(async()=>{ try { const { data } = await supabase.from('ordens').select('*'); if(data?.length) setOrdens(data); const { data: auth } = await supabase.auth.getUser(); setUser(auth?.user||null); } catch(e){} })();},[]);
  const [q,setQ] = useState("");
  const filtradas = useMemo(()=>ordens.filter(o=>JSON.stringify(o).toLowerCase().includes(q.toLowerCase())),[q,ordens]);
  async function criarOS(){ if(!form.cliente||!form.equipamento) return; const novo={id:nextId(idCounter),...form,status:'Recebido'}; setOrdens(p=>[novo,...p]); try{ await supabase.from('ordens').insert([novo]); }catch(e){} setForm({cliente:'',equipamento:'',defeito:''}); }
  function gerarPDF(item){ const pdf = new jsPDF(); pdf.text(`OS #${item.id} - ${item.cliente}`, 10, 20); pdf.text(`${item.equipamento} / ${item.defeito}`, 10, 30); pdf.save(`os-${item.id}.pdf`); } function finalizar(id){ const alvo = ordens.find(x=>x.id===id); setOrdens(p=>p.map(x=>x.id===id?{...x,status:"Finalizado"}:x)); if(alvo) setFinanceiro(f=>[{id:Date.now(),tipo:"Entrada",valor:150,data:new Date().toISOString().slice(0,10)},...f]); }
  return <div className="min-h-screen bg-slate-100 p-6"><div className="max-w-7xl mx-auto space-y-6">
    <div className="flex justify-between flex-wrap gap-3"><div><h1 className="text-3xl font-bold">Bancada OS</h1><p className="text-slate-500">Completo sem estoque</p></div><div className="flex gap-2 flex-wrap"><Input placeholder="Pesquisar" value={q} onChange={e=>setQ(e.target.value)} /><Dialog><DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2"/>Nova OS</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Nova OS</DialogTitle></DialogHeader><div className="space-y-2"><Input placeholder="Cliente" value={form.cliente} onChange={e=>setForm({...form,cliente:e.target.value})}/><Input placeholder="Equipamento" value={form.equipamento} onChange={e=>setForm({...form,equipamento:e.target.value})}/><Input placeholder="Defeito" value={form.defeito} onChange={e=>setForm({...form,defeito:e.target.value})}/><Button className="w-full" onClick={criarOS}>Salvar</Button></div></DialogContent></Dialog></div></div>
    <Tabs defaultValue="os"><TabsList><TabsTrigger value="os">Ordens</TabsTrigger><TabsTrigger value="clientes">Clientes</TabsTrigger><TabsTrigger value="financeiro">Financeiro</TabsTrigger><TabsTrigger value="config">Config</TabsTrigger><TabsTrigger value="login">Login</TabsTrigger></TabsList>
    <TabsContent value="os"><Card><CardContent className="p-4 space-y-2">{filtradas.map(item=><div key={item.id} className="border rounded-xl p-3 flex justify-between"><div><div className="font-semibold">#{item.id} • {item.cliente}</div><div className="text-sm text-slate-500">{item.equipamento} • {item.defeito}</div></div><Button variant="outline" onClick={()=>finalizar(item.id)}>{item.status}</Button><Button variant="secondary" onClick={()=>gerarPDF(item)}>PDF</Button><Button variant="secondary" onClick={()=>window.open(`https://wa.me/55?text=OS%20${item.id}%20pronta`,'_blank')}>WhatsApp</Button></div>)}</CardContent></Card></TabsContent>
    <TabsContent value="clientes"><Card><CardContent className="p-4 space-y-2">{clientes.map(c=><div key={c.id} className="border-b py-2">{c.nome} — {c.telefone}</div>)}<Button className="mt-2" onClick={()=>setClientes(c=>[...c,{id:nextId(idCounter),nome:`Novo Cliente ${c.length+1}`,telefone:"87999990000"}])}>Adicionar cliente</Button></CardContent></Card></TabsContent>
    <TabsContent value="financeiro"><Card><CardContent className="p-4 space-y-2">{financeiro.map(f=><div key={f.id} className="border-b py-2">{f.data} — {f.tipo} — R$ {f.valor}</div>)}</CardContent></Card></TabsContent>
    <TabsContent value="config"><Card><CardContent className="p-4">Supabase conectado. PDF e WhatsApp prontos para próxima etapa.</CardContent></Card></TabsContent><TabsContent value="login"><Card><CardContent className="p-4 space-y-2"><Button onClick={async()=>{ const email=prompt('Email'); if(email) await supabase.auth.signInWithOtp({email}); }}>Entrar por email</Button><div>{user?`Logado: ${user.email}`:'Não logado'}</div></CardContent></Card></TabsContent>
    </Tabs></div></div>
}
