// Original, layered hardware illustration. No product specifications or
// workshop photographs are implied by the demonstration computer.
function Fan({ x=0, y=0, r=43 }) {
  return <g transform={'translate('+x+' '+y+')'}>
    <rect x={-r-6} y={-r-6} width={(r+6)*2} height={(r+6)*2} rx="8" fill="#101a24" stroke="#3e505e" />
    <circle r={r} fill="url(#pc-fan-metal)" stroke="#657984" strokeWidth="2" />
    <circle r={r-6} fill="#071018" stroke="#203744" />
    <g className="pc-fan-rotor" data-fan-rotor="">
      {Array.from({length:9},(_,i)=><path key={i} d={'M0 0C'+(-r*.1)+' '+(-r*.65)+' '+(r*.4)+' '+(-r*.8)+' '+(r*.8)+' '+(-r*.42)+'C'+(r*.53)+' '+(-r*.38)+' '+(r*.4)+' '+(-r*.2)+' 0 0'} fill="url(#pc-blade-metal)" stroke="#506776" strokeWidth=".4" transform={'rotate('+i*40+')'} />)}
    </g>
    <circle r={r*.23} fill="url(#pc-hub-metal)" stroke="#82949c" />
    <circle r={r-3} fill="none" stroke="#b5dae3" strokeWidth="1" opacity=".3" />
    {[-1,1].flatMap(a=>[-1,1].map(b=><circle key={a+','+b} cx={a*(r+1)} cy={b*(r+1)} r="2" fill="#8c9ba3" />))}
  </g>;
}
function FanLight({ x=0,y=0,r=43 }) {
  return <g transform={'translate('+x+' '+y+')'}>
    <circle r={r-2} fill="none" stroke="#5ce4be" strokeWidth="9" opacity=".16" />
    <circle r={r-2} fill="none" stroke="url(#pc-rgb)" strokeWidth="4" />
    <circle r={r-7} fill="none" stroke="#bbfff0" strokeWidth=".8" opacity=".7" />
  </g>;
}
function Board() {
  return <g>
    <rect x="18" y="38" width="286" height="308" rx="6" fill="url(#pc-pcb)" stroke="#567368" />
    <rect x="23" y="43" width="276" height="298" rx="4" fill="url(#pc-circuit)" />
    {[57,70,83,96,109,122].map((y,i)=><path key={y} d={'M31 '+y+'h40l'+(28+i*4)+' 22h48v'+(45-i*3)+'h37'} stroke="#819d87" strokeWidth=".8" opacity=".55" />)}
    {[191,201,211,221].map(x=><path key={x} d={'M'+x+' 52v49l-23 23v65h-24'} stroke="#92aca0" strokeWidth=".8" opacity=".65" />)}
    <rect x="29" y="58" width="43" height="105" rx="4" fill="url(#pc-heatsink)" stroke="#506878" />
    {Array.from({length:7},(_,i)=><path key={i} d={'M'+(34+i*5)+' 63v93'} stroke="#80949f" strokeWidth=".7" />)}
    <path d="M32 179h36v59H31M105 70h75" stroke="#526f80" strokeWidth="8" />
    <rect x="116" y="94" width="76" height="76" rx="2" fill="#182b27" stroke="#96a492" strokeWidth="2" />
    <rect x="126" y="104" width="56" height="56" fill="#0a1119" stroke="#778e95" />
    <rect x="85" y="206" width="126" height="27" rx="4" fill="url(#pc-heatsink)" stroke="#546d7a" />
    <path d="M95 214h78m-78 9h102" stroke="#7e969f" strokeWidth=".8" />
    <rect x="243" y="216" width="46" height="54" rx="3" fill="#1b2b37" stroke="#5d7885" />
    <path d="m249 258 25-32m-15 33 21-29" stroke="#7aa4b5" strokeWidth="2" opacity=".6" />
    <rect x="38" y="267" width="247" height="9" rx="2" fill="#192330" stroke="#506570" />
    <rect x="40" y="306" width="245" height="9" rx="2" fill="#192330" stroke="#506570" />
    <text x="96" y="251" fontFamily="monospace" fontSize="10" letterSpacing="2" fill="#779da9">PRIME IT</text>
    {Array.from({length:18},(_,i)=><g key={i} transform={'translate('+(76+(i%9)*17)+' '+(182+Math.floor(i/9)*12)+')'}><rect width="10" height="6" rx="1" fill="#607b6c" /><path d="M0 1v4M10 1v4" stroke="#b4c5b3" /></g>)}
    {[32,286].flatMap(x=>[49,334].map(y=><g key={x+','+y}><circle cx={x} cy={y} r="4" fill="#96a9ad" /><path d={'M'+(x-2)+' '+y+'h4'} stroke="#263b43" /></g>))}
  </g>;
}
export default function GamingPcScene() {
  return <div className="pc-viewport">
    <div className="pc-world" data-scene-part="world"><svg className="pc-art" viewBox="100 16 570 680" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="pc-steel" x1="160" y1="90" x2="601" y2="644" gradientUnits="userSpaceOnUse"><stop stopColor="#6b7f8d" /><stop offset=".22" stopColor="#263746" /><stop offset=".65" stopColor="#0d1923" /><stop offset="1" stopColor="#425969" /></linearGradient>
        <linearGradient id="pc-inner" x1="0" y1="0" x2="320" y2="460" gradientUnits="userSpaceOnUse"><stop stopColor="#233542" /><stop offset=".4" stopColor="#0b161e" /><stop offset="1" stopColor="#152634" /></linearGradient>
        <linearGradient id="pc-front" x2="1" y2=".25"><stop stopColor="#162734" /><stop offset=".5" stopColor="#0a141d" /><stop offset="1" stopColor="#324655" /></linearGradient>
        <linearGradient id="pc-pcb" x2="1" y2="1"><stop stopColor="#1d3230" /><stop offset="1" stopColor="#0b191b" /></linearGradient>
        <pattern id="pc-circuit" width="26" height="26" patternUnits="userSpaceOnUse"><path d="M0 13h13V0M13 26V13h13" stroke="#719489" strokeWidth=".5" opacity=".2" /><circle cx="13" cy="13" r=".8" fill="#96b39d" opacity=".6" /></pattern>
        <pattern id="pc-vents" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.4" fill="#526876" opacity=".4" /></pattern>
        <linearGradient id="pc-heatsink" x2="1" y2=".8"><stop stopColor="#607480" /><stop offset=".45" stopColor="#1c2d3b" /><stop offset="1" stopColor="#3c5260" /></linearGradient>
        <linearGradient id="pc-fan-metal" x2="1" y2="1"><stop stopColor="#5c7887" /><stop offset=".3" stopColor="#1d3341" /><stop offset="1" stopColor="#526a78" /></linearGradient>
        <linearGradient id="pc-blade-metal" x2="1" y2=".7"><stop stopColor="#536e7d" /><stop offset="1" stopColor="#182b38" /></linearGradient>
        <radialGradient id="pc-hub-metal"><stop stopColor="#7b99a8" /><stop offset=".5" stopColor="#324b5b" /><stop offset="1" stopColor="#172e3f" /></radialGradient>
        <linearGradient id="pc-chip-metal" x2="1" y2="1"><stop stopColor="#d6e4e8" /><stop offset=".5" stopColor="#718e9f" /><stop offset="1" stopColor="#bcced4" /></linearGradient>
        <linearGradient id="pc-rgb" x1="-.4" y1="0" x2="1" y2="1"><stop stopColor="#d1fff1" /><stop offset=".3" stopColor="#65e8b1" /><stop offset=".7" stopColor="#66cce3" /><stop offset="1" stopColor="#d6fbff" /></linearGradient>
        <linearGradient id="pc-glass" x1="0" y1="0" x2="320" y2="440" gradientUnits="userSpaceOnUse"><stop stopColor="#a2cadd" stopOpacity=".09" /><stop offset=".4" stopColor="#8dbdcc" stopOpacity=".025" /><stop offset="1" stopColor="#1b3848" stopOpacity=".18" /></linearGradient>
        <radialGradient id="pc-floor"><stop stopColor="#000" stopOpacity=".8" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
        <radialGradient id="pc-aura"><stop stopColor="#44d7ac" stopOpacity=".2" /><stop offset=".55" stopColor="#3d9cbf" stopOpacity=".09" /><stop offset="1" stopColor="#0a141d" stopOpacity="0" /></radialGradient>
        <linearGradient id="pc-reflection"><stop stopColor="#d6f8ff" stopOpacity=".14" /><stop offset="1" stopColor="#d6f8ff" stopOpacity="0" /></linearGradient>
      </defs>
      <ellipse data-scene-part="aura" cx="390" cy="565" rx="335" ry="170" fill="url(#pc-aura)" />
      <ellipse data-scene-part="shadow" cx="396" cy="646" rx="275" ry="40" fill="url(#pc-floor)" />
      <g data-scene-part="chassis" className="pc-component">
        <path d="M160 120 300 50 620 107 480 177Z" fill="url(#pc-steel)" stroke="#758d9a" strokeWidth="2" />
        <path d="M169 120 301 59 607 111 478 168Z" fill="#101e29" stroke="#455d6b" />
        <path d="M160 120v460l320 57 140-70V107l-140 70Z" fill="url(#pc-steel)" stroke="#8fa3af" strokeWidth="1.5" />
        <g transform="matrix(1 .178 0 1 160 120)">
          <rect x="8" y="8" width="306" height="444" rx="3" fill="url(#pc-inner)" stroke="#617988" strokeWidth="2" />
          <rect x="14" y="13" width="294" height="435" fill="#0b1620" />
          <path d="M17 17h286v428H17Z" stroke="#385264" />
          <path d="M26 26h268v371H26Z" stroke="#425b6b" strokeDasharray="2 8" opacity=".55" />
          <path d="M18 18v423M306 18v423M18 365h288" stroke="#8095a3" strokeWidth="2" opacity=".6" />
          <rect x="15" y="365" width="292" height="80" fill="#0b1722" stroke="#3a5364" />
          <path d="M34 379h210m-210 8h225m-225 8h203m-203 8h231" stroke="#334c5e" />
        </g>
        <g transform="matrix(1 -.5 0 1 480 177)">
          <rect x="0" y="0" width="140" height="460" fill="url(#pc-front)" stroke="#647e90" strokeWidth="1.5" />
          <rect x="12" y="16" width="116" height="424" rx="6" fill="#08131c" stroke="#455e70" />
          <rect x="17" y="21" width="106" height="414" rx="4" fill="url(#pc-vents)" />
          <path d="M8 8v443M132 8v443" stroke="#a4b9c4" strokeWidth=".8" opacity=".4" />
          <rect x="45" y="433" width="51" height="9" rx="2" fill="#0a1924" stroke="#567280" />
        </g>
        <path d="m179 588 22 4v15l-22-5Zm294 53 19-10v16l-19 9Zm124-66 16-8v17l-16 8Z" fill="#344b5b" stroke="#607a8a" />
        <path d="M190 98 298 49M310 53l155 28" stroke="#a4bcc7" strokeWidth="1" opacity=".7" />
        <path d="m477 163 16-8 34 6-16 8Z" fill="#526e7e" /><path d="m500 153 16-8" stroke="#a8c5ce" strokeWidth="4" />
      </g>
      <g data-scene-part="board" className="pc-component"><g transform="matrix(1 .178 0 1 160 120)"><Board /></g></g>
      <g data-scene-part="cpu" className="pc-component"><g transform="matrix(1 .178 0 1 160 120)">
        <rect x="124" y="102" width="59" height="59" rx="3" fill="url(#pc-chip-metal)" stroke="#c9e1e5" />
        <path d="M130 108h45v45h-45Z" stroke="#5b7787" /><text x="137" y="133" fontFamily="monospace" fontSize="12" fill="#24414e">CPU</text>
        <path d="M135 142h35" stroke="#738e9c" /><path d="M123 117h-6m6 20h-6m70-20h6m-6 20h6" stroke="#cbd4b2" strokeWidth="2" />
      </g></g>
      <g data-scene-part="ram" className="pc-component"><g transform="matrix(1 .178 0 1 160 120)">
        {[231,248,265,282].map((x,i)=><g key={x}><rect x={x} y="62" width="11" height="114" rx="2" fill="url(#pc-heatsink)" stroke="#8ca2aa" /><rect x={x+2} y="69" width="7" height="81" fill="#152c39" /><path d={'M'+(x+3)+' 79v59'} stroke="#55717f" /><rect x={x} y="60" width="11" height="8" rx="2" fill="#8aadb8" /><path d={'M'+(x+3)+' 164v12'} stroke="#bdae76" strokeWidth="4" /></g>)}
      </g></g>
      <g data-scene-part="gpu" className="pc-component"><g transform="matrix(1 .178 0 1 160 120)">
        <path d="m27 279 26-12h246l-19 13Z" fill="#607682" stroke="#9bb3be" /><path d="m280 280 19-13v77l-19 14Z" fill="#172d3c" stroke="#6a8797" />
        <rect x="27" y="279" width="253" height="79" rx="7" fill="url(#pc-heatsink)" stroke="#95adba" strokeWidth="1.4" />
        <path d="M37 288h231v60H37Z" stroke="#1b3041" strokeWidth="6" />
        {[71,154,236].map(x=><g key={x}><Fan x={x} y={319} r={30} /></g>)}
        <path d="M32 355h242" stroke="#9ed5e3" strokeWidth="2" opacity=".7" />
        <path d="M280 293h12v24h-12" stroke="#aeaf88" strokeWidth="2" />
        <path d="M39 278h227" stroke="#afd9e3" strokeWidth="1" />
      </g></g>
      <g data-scene-part="cooling" className="pc-component">
        <path d="m184 117 120-57 292 51-120 59Z" fill="#132734" stroke="#718c9b" />
        {[284,393,503].map(x=><g key={x} transform={'translate('+x+' '+(x*.178+42)+') rotate(10) scale(1 .52)'}><Fan r={42} /></g>)}
        <g transform="matrix(1 .178 0 1 160 120)">
          <path d="M155 131C244 136 267 61 228 29M165 141C274 151 289 73 246 29" stroke="#02080d" strokeWidth="13" strokeLinecap="round" />
          <path d="M155 131C244 136 267 61 228 29M165 141C274 151 289 73 246 29" stroke="#4b6678" strokeWidth="8" strokeLinecap="round" />
          <path d="M154 129C245 132 264 61 228 29M165 139C270 147 286 73 246 29" stroke="#8dabb8" strokeWidth="1" strokeLinecap="round" opacity=".5" />
          <rect x="127" y="106" width="55" height="56" rx="12" fill="#1a3444" stroke="#aec4cd" />
          <circle cx="154" cy="134" r="20" fill="#0b1925" stroke="#5c8598" strokeWidth="2" />
          <text x="140" y="138" fontFamily="monospace" fontSize="8" letterSpacing="1" fill="#c2dce5">PRIME</text>
          <Fan x={70} y={39} r={26} />
        </g>
        <g transform="matrix(1 -.5 0 1 480 177)">{[90,229,368].map(y=><Fan key={y} x={70} y={y} r={44} />)}</g>
      </g>
      <g data-scene-part="psu" className="pc-component"><g transform="matrix(1 .178 0 1 160 120)">
        <path d="m19 382 22-12h263l-17 13Z" fill="#314e62" stroke="#6b8a9d" />
        <rect x="19" y="382" width="270" height="65" rx="3" fill="url(#pc-front)" stroke="#7291a4" />
        <rect x="30" y="392" width="86" height="43" rx="3" fill="url(#pc-vents)" stroke="#445f6f" />
        <text x="152" y="417" fontFamily="monospace" fontSize="15" letterSpacing="3" fill="#9dbecc">PRIME IT</text>
        <path d="M154 429h112" stroke="#476c80" strokeWidth="1" />
      </g></g>
      <g data-scene-part="ssd" className="pc-component"><g transform="matrix(1 .178 0 1 160 120)">
        <rect x="69" y="184" width="93" height="22" rx="3" fill="#20413b" stroke="#789c89" />
        {[83,102,121].map(x=><rect key={x} x={x} y="188" width="13" height="14" rx="1" fill="#12232e" stroke="#516979" />)}
        <text x="141" y="198" fontFamily="monospace" fontSize="7" fill="#c5d4cf">SSD</text>
        <path d="M72 186v18" stroke="#becfb9" strokeWidth="2" />
      </g></g>
      <g data-scene-part="cables" className="pc-component"><g transform="matrix(1 .178 0 1 160 120)">
        {[-5,0,5].map(x=><path key={x} d={'M'+(299+x)+' 323C'+(329+x)+' 355 '+(289+x)+' 393 '+(260+x)+' 384'} stroke="#071018" strokeWidth="5" strokeLinecap="round" />)}
        <path d="M293 199c31 9 36 140-1 178" stroke="#132935" strokeWidth="7" />
        <path d="M293 199c31 9 36 140-1 178" stroke="#607c89" strokeWidth="1" />
        <path d="M230 354c-12 19-3 24 22 29" stroke="#182e3c" strokeWidth="6" />
        <path d="M230 354c-12 19-3 24 22 29" stroke="#73939f" strokeWidth=".7" />
      </g></g>
      <g data-scene-part="glass" className="pc-component"><g transform="matrix(1 .178 0 1 160 120)">
        <rect x="1" y="1" width="318" height="458" rx="4" fill="url(#pc-glass)" stroke="#a2bfce" strokeWidth="1.2" />
        <path d="M9 9h298v440H9Z" stroke="#415f71" strokeWidth="2" />
        <path d="M13 18 150 10 303 201v107Z" fill="url(#pc-reflection)" />
        <path d="m15 57 127-47 163 200" stroke="#e2f5ff" strokeWidth=".8" opacity=".13" />
        {[12,307].flatMap(x=>[15,446].map(y=><circle key={x+','+y} cx={x} cy={y} r="3.5" fill="#819ca9" stroke="#1d3647" />))}
      </g></g>
      <g data-scene-part="lights" className="pc-lights">
        <g transform="matrix(1 -.5 0 1 480 177)">{[90,229,368].map(y=><FanLight key={y} x={70} y={y} r={44} />)}</g>
        {[284,393,503].map(x=><g key={x} transform={'translate('+x+' '+(x*.178+42)+') rotate(10) scale(1 .52)'}><FanLight r={42} /></g>)}
        <g transform="matrix(1 .178 0 1 160 120)">
          <circle cx="154" cy="134" r="20" stroke="url(#pc-rgb)" strokeWidth="3" />
          {[231,248,265,282].map(x=><rect key={x} x={x} y="60" width="11" height="7" rx="2" fill="url(#pc-rgb)" />)}
          <path d="M32 355h242" stroke="url(#pc-rgb)" strokeWidth="3" />
          <path d="M154 429h112" stroke="#69eac0" strokeWidth="1" />
          <FanLight x={70} y={39} r={26} />
        </g>
        <path d="M484 184v450l130-66" stroke="#83dbe4" strokeWidth="1" opacity=".6" />
        <path d="M173 581 477 635" stroke="#6eedbf" strokeWidth="1.2" opacity=".65" />
      </g>
    </svg></div>
  </div>;
}
