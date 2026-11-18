import { useState } from 'react'
import { Eye, EyeOff, Focus, House, Info, Layers3, Maximize2, Ruler, Tag } from 'lucide-react'
import HouseScene from './HouseScene'

function Toggle({ active, onClick, icon: Icon, children }) {
  return <button className={`control ${active ? 'active' : ''}`} onClick={onClick} aria-pressed={active}>
    <Icon size={16} />{children}
  </button>
}

export default function App() {
  const [roofVisible, setRoofVisible] = useState(true)
  const [cutaway, setCutaway] = useState(false)
  const [labelsVisible, setLabelsVisible] = useState(true)
  const [width, setWidth] = useState(32)
  const [depth, setDepth] = useState(26)
  const [showDetails, setShowDetails] = useState(false)

  return <main className="app-shell">
    <div className="scene"><HouseScene {...{ roofVisible, cutaway, labelsVisible, width, depth }} /></div>
    <header className="topbar">
      <div className="brand"><span className="brand-mark"><House size={20} /></span><div><b>Kiran Home</b><small>Interactive architectural study</small></div></div>
      <button className="icon-button" onClick={() => document.documentElement.requestFullscreen?.()} title="Full screen"><Maximize2 size={18} /></button>
    </header>

    <aside className="panel">
      <div className="panel-intro"><span className="eyebrow">3D prototype · Version 01</span><h1>Explore the house</h1><p>Drag to orbit, scroll to zoom and right-drag to pan. Use cutaway mode to inspect the room arrangement.</p></div>
      <div className="controls">
        <Toggle active={roofVisible} onClick={() => setRoofVisible(v => !v)} icon={roofVisible ? Eye : EyeOff}>Roof</Toggle>
        <Toggle active={cutaway} onClick={() => setCutaway(v => !v)} icon={Layers3}>Cutaway</Toggle>
        <Toggle active={labelsVisible} onClick={() => setLabelsVisible(v => !v)} icon={Tag}>Labels</Toggle>
      </div>
      <section className="dimensions">
        <div className="section-title"><span><Ruler size={15} /> Provisional footprint</span><small>feet</small></div>
        <div className="dimension-grid">
          <label>Width<input type="number" min="20" max="60" value={width} onChange={e => setWidth(Number(e.target.value) || 32)} /></label>
          <span>×</span>
          <label>Depth<input type="number" min="20" max="60" value={depth} onChange={e => setDepth(Number(e.target.value) || 26)} /></label>
        </div>
        <p className="dimension-note"><Info size={13} /> Geometry follows the supplied HOME.png room plan.</p>
      </section>
      <button className="details-button" onClick={() => setShowDetails(v => !v)}><Focus size={16} />{showDetails ? 'Hide' : 'Show'} model notes</button>
      {showDetails && <div className="notes"><p><b>Included:</b> exact room sequence from HOME.png: kitchen, Bedroom 2, hall, W/BT1/BT2, Bedroom 1, prayer and sit out.</p><p><b>Next:</b> replace provisional values with surveyed dimensions and refine every opening.</p></div>}
    </aside>

    <div className="legend" aria-label="Room colour legend">
      {[['#d3ad79','Hall'],['#9fb990','Kitchen'],['#97abc8','Bedrooms'],['#c69bb3','Prayer / sit-out']].map(([color,label])=><span key={label}><i style={{background:color}} />{label}</span>)}
    </div>
    <div className="gesture-hint">Drag <b>orbit</b> · Scroll <b>zoom</b> · Right-drag <b>pan</b></div>
  </main>
}
