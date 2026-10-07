// An original hardware illustration, not a workshop/customer photograph.
function CircuitBoard() {
  return <svg className="board-art" viewBox="0 0 420 270" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="pcb-surface" x2="420" y2="270" gradientUnits="userSpaceOnUse"><stop stopColor="#193b38" /><stop offset="1" stopColor="#081c20" /></linearGradient>
      <pattern id="pcb-grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M0 12h12V0M12 24V12h12" stroke="#567d6a" strokeWidth=".5" opacity=".35" /><circle cx="12" cy="12" r="1" fill="#9fba87" /></pattern>
      <linearGradient id="battery-surface" y2="1"><stop stopColor="#1d2630" /><stop offset="1" stopColor="#080d13" /></linearGradient>
    </defs>
    <rect x="4" y="4" width="412" height="262" rx="13" fill="url(#pcb-surface)" stroke="#8bb3a0" />
    <rect x="6" y="6" width="408" height="258" rx="12" fill="url(#pcb-grid)" />
    {[24,43,62,81].map((y,i)=><path key={y} d={'M20 '+y+'h45l18 '+(20+i*4)+'h70v'+(35-i*5)+'h50'} stroke="#bcac6e" strokeWidth="1" opacity=".6" />)}
    {[275,286,297,308,319].map(x=><path key={x} d={'M'+x+' 28v66l-24 24v30h-32'} stroke="#a4b58b" strokeWidth="1" opacity=".6" />)}
    <path d="M128 82h45v60h80v31h123M68 115v48h96v36M210 31v44h26M355 50v105h35v65" stroke="#96beaa" strokeWidth="1.4" />
    <rect x="31" y="188" width="326" height="60" rx="4" fill="url(#battery-surface)" stroke="#66737c" />
    <path d="M139 191v54m109-54v54" stroke="#333f49" />
    <path d="M46 204h59m-59 7h37m-37 7h49" stroke="#5a6a75" strokeWidth="2" />
    <text x="263" y="224" fill="#667883" fontSize="10" fontFamily="monospace">Li-ion</text>
    <rect x="173" y="25" width="70" height="20" rx="2" fill="#0e151e" stroke="#81908a" />
    {Array.from({length:8},(_,i)=><rect key={i} x={179+i*8} y="30" width="5" height="9" fill="#8a9e82" />)}
    {[16,113,320,398].map((x,i)=><g key={x}><circle cx={x} cy={i%2 ? 170:16} r="5" fill="#8d9f95" /><circle cx={x} cy={i%2 ? 170:16} r="2" fill="#172824" /></g>)}
    {Array.from({length:14},(_,i)=><g key={i} transform={'translate('+(171+(i%7)*13)+' '+(157+Math.floor(i/7)*12)+')'}><rect width="8" height="5" rx="1" fill="#aca17b" /><path d="M0 1v3M8 1v3" stroke="#e6d8b8" /></g>)}
    <rect x="386" y="87" width="25" height="57" rx="3" fill="#65717e" /><path d="M390 94h18m-18 8h18m-18 8h18m-18 8h18m-18 8h18" stroke="#182029" strokeWidth="3" />
    <path d="M92 43h36v20h63v21" stroke="#b3a283" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M92 43h36v20h63v21" stroke="#e1bf8c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}
const keyRows = [
  'esc 1 2 3 4 5 6 7 8 9 0 − + ⌫',
  'tab Q W E R T Y U I O P [ ] |',
  'caps A S D F G H J K L ; : enter',
  'shift Z X C V B N M , . / ↑ shift',
  'ctrl fn ⌘ alt space alt ctrl ← ↓ →',
].map(row=>row.split(' '));

export default function LaptopScene() {
  return <div className="device-viewport" aria-hidden="true">
    <div className="scene-ambient"><span /><span /></div>
    <svg className="scene-grid" viewBox="0 0 700 620" fill="none"><ellipse cx="350" cy="400" rx="290" ry="110" /><ellipse cx="350" cy="400" rx="220" ry="84" /><path d="M60 400h580M350 260v280M145 325l410 150M145 475l410-150" /></svg>
    <div className="device-scale">
      <div className="device-shadow" data-scene-part="shadow" />
      <div className="laptop-world" data-scene-part="world">
        <div className="laptop-cover" data-scene-part="cover"><div className="cover-vents" /><span className="cover-screw cover-screw--a" /><span className="cover-screw cover-screw--b" /></div>
        <div className="laptop-board" data-scene-part="board">
          <CircuitBoard />
          <div className="laptop-cpu" data-scene-part="cpu"><div><i /><span>CPU</span></div><span className="cpu-pins" /></div>
          <div className="laptop-ssd" data-scene-part="ssd"><i /><span>NVMe<br /><b>SSD</b></span><em /><em /><em /><span className="ssd-contacts" /></div>
          <div className="laptop-fan" data-scene-part="fan"><div className="fan-rotor" data-scene-part="rotor">{Array.from({length:11},(_,i)=><i key={i} style={{transform:'rotate('+i*360/11+'deg)'}} />)}<span /></div></div>
          <div className="diagnosis-signal" data-scene-part="signal" />
        </div>
        <div className="laptop-deck" data-scene-part="deck">
          <div className="deck-speakers deck-speakers--left" /><div className="deck-speakers deck-speakers--right" />
          <div className="laptop-keyboard">{keyRows.map((row,i)=><div className="key-row" key={i}>{row.map((key,k)=><span className={key==='space'?'key-space':''} key={k}>{key==='space'?'':key}</span>)}</div>)}</div>
          <div className="laptop-trackpad" /><div className="deck-ports" /><div className="deck-light" />
        </div>
        <div className="laptop-lid" data-scene-part="lid">
          <div className="laptop-camera" />
          <div className="laptop-display">
            <div className="screen-off" data-scene-part="off">
              <svg viewBox="0 0 100 100" fill="none"><path d="M50 18v29M30 26a32 32 0 1 0 40 0" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>
              <span>Что случилось?</span><small>PRIME IT поможет разобраться</small>
            </div>
            <div className="screen-on" data-scene-part="on"><div className="screen-wallpaper" /><span className="screen-wordmark">PRIME <b>IT</b></span><svg viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="29" /><path d="m18 32 10 10 19-21" /></svg><strong>Снова в работе.</strong><span className="screen-ready">РЕМОНТ / ПРОВЕРКА / ВЫДАЧА</span></div>
            <div className="screen-reflection" />
          </div>
          <span className="lid-wordmark">PRIME IT</span>
        </div>
        <div className="device-scan" data-scene-part="scan" />
      </div>
    </div>
    <div className="component-labels" data-scene-part="labels"><span className="label-cooling">Охлаждение<i /></span><span className="label-chip"><i /> Компоненты</span></div>
  </div>;
}
