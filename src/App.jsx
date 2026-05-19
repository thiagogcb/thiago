import React, { useState } from 'react';
export default function App(){ const [msg,setMsg]=useState('Sistema carregado'); return <div style={{padding:20,fontFamily:'Arial'}}><h1>Bancada OS</h1><p>{msg}</p><button onClick={()=>setMsg('OK')}>Testar</button></div> }
