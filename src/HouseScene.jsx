import { Html, OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense, useMemo } from 'react'
import * as THREE from 'three'

const ROOM_COLORS = {
  kitchen: '#9fb990', bedroom: '#97abc8', hall: '#d3ad79', accent: '#c69bb3', service: '#9cb8b4'
}

function Box({ position, size, color = '#f4f0e5', roughness = .84, opacity = 1, ...props }) {
  return <mesh position={position} castShadow receiveShadow {...props}>
    <boxGeometry args={size} />
    <meshStandardMaterial color={color} roughness={roughness} transparent={opacity < 1} opacity={opacity} side={THREE.FrontSide} />
  </mesh>
}

function RoomLabel({ children, position, visible }) {
  return <Html position={position} center distanceFactor={20} occlude={false} style={{ display: visible ? 'block' : 'none' }}>
    <span className="room-label">{children}</span>
  </Html>
}

function Window({ position, width = 4.4, height = 4.6, rotation = [0, 0, 0] }) {
  const bars = useMemo(() => width < 2
    ? [-width / 4, width / 4]
    : Array.from({ length: Math.max(4, Math.floor(width / .55)) }, (_, i) => -width / 2 + .35 + i * .55), [width])
  return <group position={position} rotation={rotation}>
    <Box position={[0, 0, 0]} size={[width, height, .16]} color="#304847" opacity={.84} roughness={.18} />
    {bars.map(x => <Box key={x} position={[x, 0, .12]} size={[.07, height + .12, .08]} color="#402b24" />)}
    <Box position={[0, height / 2, 0]} size={[width + .3, .18, .26]} color="#402b24" />
    <Box position={[0, -height / 2, 0]} size={[width + .3, .18, .26]} color="#402b24" />
    <Box position={[-width / 2, 0, 0]} size={[.18, height, .26]} color="#402b24" />
    <Box position={[width / 2, 0, 0]} size={[.18, height, .26]} color="#402b24" />
  </group>
}

function Door({ position, width = 2.6, height = 7.4, rotation = [0, 0, 0], hingeRight = false }) {
  const hingeX = hingeRight ? width / 2 : -width / 2
  const leafX = hingeRight ? -width / 2 : width / 2
  return <group position={position} rotation={rotation}>
    <group position={[hingeX, 0, 0]} rotation={[0, Math.PI / 3, 0]}>
      <Box position={[leafX, height / 2, 0]} size={[width, height, .12]} color="#3a2722" roughness={.58} />
      <Box position={[leafX * 1.7, height * .5, -.1]} size={[.08, .25, .1]} color="#d9b875" />
    </group>
    <Box position={[-width / 2, height / 2, .12]} size={[.16, height + .3, .24]} color="#261b18" />
    <Box position={[width / 2, height / 2, .12]} size={[.16, height + .3, .24]} color="#261b18" />
    <Box position={[0, height, .12]} size={[width + .3, .16, .24]} color="#261b18" />
  </group>
}

function SplitKitchenDoor({ position, width = 2.6, height = 7.4, rotation = [0, 0, 0] }) {
  const half = height / 2
  return <group position={position} rotation={rotation}>
    {[0, 1].map(part => {
      const panelColor = part ? '#76543a' : '#62432f'
      const leafY = part * half + half/2
      return <group key={part}>
        <Box position={[0, leafY, .02]} size={[width-.1, half-.08, .12]} color={panelColor} roughness={.62} />
        <Box position={[0, part*half+.08, .11]} size={[width-.22, .1, .1]} color="#39261c" />
        <Box position={[0, (part+1)*half-.08, .11]} size={[width-.22, .1, .1]} color="#39261c" />
        {[-width/2+.1, width/2-.1].map(x => <Box key={x}
          position={[x, leafY, .11]} size={[.11, half-.13, .12]} color="#39261c" />)}
        <Box position={[0, leafY, .105]} size={[width-.42, half-.42, .035]} color={part ? '#896442' : '#76543b'} roughness={.68} />
        <Box position={[width*.34, leafY, .17]} size={[.08, .18, .07]} color="#cfb078" />
      </group>
    })}
    <Box position={[-width/2, height/2, .1]} size={[.16, height+.2, .24]} color="#261b18" />
    <Box position={[width/2, height/2, .1]} size={[.16, height+.2, .24]} color="#261b18" />
    <Box position={[0, half, .15]} size={[width+.08, .18, .28]} color="#30221b" />
    <Box position={[0, height, .1]} size={[width+.25, .16, .24]} color="#261b18" />
  </group>
}

function KitchenDoorSteps({ position }) {
  return <group>
    {[.915, .61, .305].map((height, i) => <Box key={i}
      position={[position[0]-.405-i*.8, height/2, position[2]]}
      size={[.82, height, 3.6]} color={i%2 ? '#a99d88' : '#b5a991'} />)}
  </group>
}

// Looking in from the front, increasing local X is the right side after the house mirror.
const SITOUT_ENTRANCE = { doorX: 4.55, doorWidth: 4.2, openingX: 4.55, openingWidth: 4.2, z: -6.8 }
const PORCH = { frontWallZ: -13.2, outerZ: -15.6, depth: 2.4 }
// Bedroom 1 extends forward to the edge marked in the reference image.
const BEDROOM1_FRONT_Z = -10.5
const KITCHEN_DOOR_Z = -1.5
const NARROW_FRONT_WINDOW_X = -3.9
const SHADE_Y = 9.55
const SHADE_THICKNESS = .3
const SHADE_UNDERSIDE_Y = SHADE_Y - SHADE_THICKNESS / 2
const ROOF_UNDERSIDE_Y = 11.15

function EntranceGlazing({ x, width }) {
  const height = 7.4
  return <group position={[x, 4.92, SITOUT_ENTRANCE.z]}>
    <Box position={[0, 0, 0]} size={[width, height, .12]} color="#3a5752" roughness={.22} />
    {[-1, 1].map(sign => <group key={sign}>
      <Box position={[sign * width/2, 0, -.1]} size={[.14, height + .2, .3]} color="#38251b" />
      <Box position={[0, sign * height/2, -.1]} size={[width + .14, .16, .3]} color="#38251b" />
    </group>)}
    {Array.from({length: 14}, (_, i) => <Box key={i}
      position={[0, -height/2 + .35 + i * .51, -.19]}
      size={[width, .035, .04]} color="#88928a" />)}
    {[-.25, .25].map(t => <Box key={t} position={[width*t, 0, -.19]}
      size={[.035, height, .04]} color="#88928a" />)}
  </group>
}

function PorchPlant({ position }) {
  return <group position={position}>
    <mesh position={[0, .48, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[.48, .32, .96, 20]} />
      <meshStandardMaterial color="#1c2021" roughness={.65} />
    </mesh>
    <mesh position={[0, .96, 0]}><cylinderGeometry args={[.43, .43, .025, 20]} /><meshStandardMaterial color="#332b20" /></mesh>
    {Array.from({length: 15}, (_, i) => {
      const a = i * 2.4, r = .12 + (i % 3) * .14
      return <group key={i} position={[Math.cos(a)*r, 1.05 + (i % 5)*.16, Math.sin(a)*r]} rotation={[.45, a, .5]}>
        <mesh scale={[.12, .55, .035]} castShadow>
          <sphereGeometry args={[1, 8, 6]} /><meshStandardMaterial color={i % 3 ? '#9aac25' : '#d1c52f'} roughness={.8} />
        </mesh>
      </group>
    })}
  </group>
}

function PorchLight({ position }) {
  return <group position={position}>
    <mesh><cylinderGeometry args={[.48, .48, .12, 24]} /><meshStandardMaterial color="#e8e2cf" /></mesh>
    <mesh position={[0, -.09, 0]} scale={[1, .25, 1]}>
      <sphereGeometry args={[.42, 20, 12]} />
      <meshStandardMaterial color="#fff1ce" emissive="#ffd791" emissiveIntensity={2} />
    </mesh>
    <pointLight position={[0, -.3, 0]} color="#ffdfad" intensity={6} distance={8} decay={2} />
  </group>
}

function TiledPillar({ position }) {
  const width = .9, height = SHADE_UNDERSIDE_Y - 1.22, baseY = 1.22, rows = 32, tileWidth = .42, tileHeight = .25
  const colors = ['#7595a2', '#83a2ae', '#688895', '#7898a5', '#89a7b1', '#6f8f9c', '#a99b7d', '#b49b78']
  return <group position={position}>
    <Box position={[0, baseY + height/2, 0]} size={[width, height, width]} color="#55727e" />
    {Array.from({length: rows}, (_, row) => [0, 1].flatMap(col => {
      const color = colors[(row * 5 + col * 3 + (row % 13 === 6 ? 6 : 0)) % colors.length]
      const y = baseY + tileHeight / 2 + row * (height - tileHeight) / (rows - 1)
      return [
        <Box key={`front-${row}-${col}`} position={[-.225 + col*.45, y, -.457]} size={[tileWidth, tileHeight, .035]} color={color} roughness={.32} />,
        <Box key={`back-${row}-${col}`} position={[-.225 + col*.45, y, .457]} size={[tileWidth, tileHeight, .035]} color={colors[(row * 5 + col * 3 + 2) % colors.length]} roughness={.32} />,
        <Box key={`left-${row}-${col}`} position={[-.457, y, -.225 + col*.45]} size={[.035, tileHeight, tileWidth]} color={colors[(row * 5 + col * 3 + 1) % colors.length]} roughness={.32} />,
        <Box key={`right-${row}-${col}`} position={[.457, y, -.225 + col*.45]} size={[.035, tileHeight, tileWidth]} color={colors[(row * 5 + col * 3 + 4) % colors.length]} roughness={.32} />,
      ]
    }))}
  </group>
}

function SitOutDetails({ roofVisible, cutaway }) {
  // The upper portion marked in the reference stays white; tile remains below it.
  const wallTileLengths = [.82, .62, .9, .74, .88, .7, .94, .8]
  const wallTiles = (key, x, startZ, tileCount, bodyLength) => {
    return Array.from({length: 24}, (_, row) => {
      const lengths = Array.from({length: tileCount}, (_, col) => wallTileLengths[(col + row * 3) % wallTileLengths.length])
      const scale = bodyLength / lengths.reduce((a, b) => a + b, 0)
      let z = startZ
      return Array.from({length: tileCount}, (_, col) => {
        const scaled = lengths[col] * scale
        const center = z + scaled / 2
        z += scaled + .02
        const shades = ['#7595a2', '#83a2ae', '#688895', '#7898a5', '#89a7b1', '#6f8f9c']
        const color = (row * 7 + col * 11) % 29 === 8
          ? (row % 2 ? '#b49b78' : '#a99b7d')
          : shades[(row * 5 + col * 3) % shades.length]
        return <Box key={key + '-' + row + '-' + col}
          position={[x, 1.22 + .14 + row * .3, center]}
          size={[.075, .28, scaled - .012]} color={color}
          opacity={cutaway ? .2 : 1} roughness={.32} />
      })
    })
  }
  const entranceWallTiles = Array.from({length: 24}, (_, row) => {
    const lengths = [wallTileLengths[(row * 3) % 8], wallTileLengths[(row * 3 + 1) % 8]]
    const scale = 1.43 / (lengths[0] + lengths[1])
    let x = -.8
    return lengths.map((length, col) => {
      const scaled = length * scale
      const center = x + scaled / 2
      x += scaled + .02
      const shades = ['#7595a2', '#83a2ae', '#688895', '#7898a5', '#89a7b1', '#6f8f9c']
      const color = (row * 7 + col * 11) % 29 === 8
        ? (row % 2 ? '#b49b78' : '#a99b7d')
        : shades[(row * 5 + col * 3) % shades.length]
      return <Box key={'entrance-wall-' + row + '-' + col}
        position={[center, 1.22 + .14 + row * .3, -7.1]}
        size={[scaled - .012, .28, .075]} color={color}
        opacity={cutaway ? .2 : 1} roughness={.32} />
    })
  })
  // Each tile is one uninterrupted strip from the entrance to the front steps.
  const floorTiles = Array.from({length: 6}, (_, col) => {
    const colors = ['#587984', '#607f89', '#688690', '#54737e', '#71909a', '#5d7c86']
    const stripWidth = 7.825 / 6
    const x = -.825 + (col + .5) * stripWidth
    return <Box key={'floor-tile-'+col} position={[x, 1.235, -11.2]}
      size={[stripWidth - .025, .03, 8.78]} color={colors[col]} roughness={.3} />
  })
  return <group>
    {/* One continuous field of marble-look tiles fills the Sit Out and porch. */}
    <Box position={[3.0875, 1.18, -10]} size={[7.825, .08, 6.4]} color="#a99479" />
    {floorTiles}
    {wallTiles('prayer-wall', -.785, -13.11, 8, 5.89)}
    {/* Tile the marked Bedroom 1 return, stopping at the white band above it. */}
    {wallTiles('bedroom-return', 6.7, BEDROOM1_FRONT_Z + .05, 5, 3.52)}
    {entranceWallTiles}
    <Box position={[-.715, 5.1, -12.1]} size={[.06, .45, .24]} color="#e2ded0" />
    <EntranceGlazing x={1.45} width={1.45} />
    <Box position={[4.55, 8.74, -7.14]} size={[4.8, .22, .18]} color="#38251b" />
    <Box position={[SITOUT_ENTRANCE.doorX, 1.235, -6.8]} size={[SITOUT_ENTRANCE.doorWidth + .16, .03, .6]} color="#9c8a70" />
    <PorchPlant position={[.1, 1.25, -14.95]} />
    <PorchPlant position={[5.4, 1.25, -14.95]} />
    <PorchLight position={[2.95, SHADE_UNDERSIDE_Y - .06, -15.4]} />
    {roofVisible && <PorchLight position={[4.55, 11.06, -9]} />}
  </group>
}

// The terrace perimeter follows the same step as the exterior walls.
const ROOF_EDGES = [
  [[-17.15, -13.65], [7.45, -13.65]],
  [[7.45, -13.65], [7.45, BEDROOM1_FRONT_Z - .45]],
  [[7.45, BEDROOM1_FRONT_Z - .45], [17.15, BEDROOM1_FRONT_Z - .45]],
  [[17.15, BEDROOM1_FRONT_Z - .45], [17.15, 13.65]],
  [[17.15, 13.65], [-17.15, 13.65]],
  [[-17.15, 13.65], [-17.15, -13.65]],
]

function ParapetEdge({ start, end }) {
  const dx = end[0] - start[0], dz = end[1] - start[1]
  const length = Math.hypot(dx, dz)
  const bays = Math.max(1, Math.round(length / 5.6))
  return <group position={[(start[0] + end[0]) / 2, 0, (start[1] + end[1]) / 2]} rotation={[0, -Math.atan2(dz, dx), 0]}>
    <Box position={[0, 12.25, 0]} size={[length, .8, .55]} />
    {[13.05, 13.65].map(y => <Box key={y} position={[0, y, 0]} size={[length, .15, .18]} color="#5b3429" />)}
    {Array.from({ length: bays + 1 }, (_, i) => <Box key={i}
      position={[-length / 2 + .55 + (length - 1.1) * i / bays, 13.35, 0]}
      size={[1.1, 1.4, .55]} />)}
  </group>
}

function Parapet({ roofVisible }) {
  if (!roofVisible) return null
  return <group>
    <Box position={[-5, 11.5, 0]} size={[25, .7, 28]} color="#eeeae1" />
    <Box position={[12.5, 11.5, (BEDROOM1_FRONT_Z - .8 + 14) / 2]} size={[10, .7, 14 - BEDROOM1_FRONT_Z + .8]} color="#eeeae1" />
    <Box position={[-4.85, 11.87, 0]} size={[24.1, .04, 26.8]} color="#63676a" />
    <Box position={[12.05, 11.87, (BEDROOM1_FRONT_Z - .2 + 13.4) / 2]} size={[9.7, .04, 13.4 - BEDROOM1_FRONT_Z + .2]} color="#63676a" />
    {ROOF_EDGES.map(([start, end], i) => <ParapetEdge key={i} start={start} end={end} />)}
  </group>
}

function WindowShade({ cutaway }) {
  // Joined sections follow the exterior walls and the Bedroom 1 step in the plan.
  const sections = [
    [-17.4, -.1, 2, 29.8],           // west side
    [-8.6, -13.95, 15.6, 2.1],      // front of kitchen, Bedroom 2 and Prayer
    [0, 13.85, 32.8, 1.9],          // rear
    [17.4, 1.25, 2, 27.1],          // east side
    [11.55, BEDROOM1_FRONT_Z - .75, 9.7, 2.1], // Bedroom 1 front
    [6.9875, (-13.2 + BEDROOM1_FRONT_Z - 1.8) / 2, .575, BEDROOM1_FRONT_Z - 1.8 + 13.2], // return to the Sit Out canopy
  ]
  return <group>
    {sections.map(([x, z, width, depth], i) => <group key={i}>
      <Box position={[x, SHADE_Y, z]} size={[width, SHADE_THICKNESS, depth]}
        color="#ddd9d0" opacity={cutaway ? .2 : 1} />
      <Box position={[x, SHADE_UNDERSIDE_Y - .025, z]} size={[width, .05, depth]}
        color="#77766f" opacity={cutaway ? .2 : 1} />
    </group>)}
  </group>
}

function RooftopTank({ roofVisible }) {
  if (!roofVisible) return null
  const roofTop = 11.89
  const chimneyHeight = 4.9
  const capThickness = .2
  const tankBottom = roofTop + chimneyHeight + capThickness
  return <group position={[-12.2, 0, 7.7]}>
    {/* The tank rests on the chimney cap, entirely above the raised structure. */}
    <Box position={[0, roofTop + chimneyHeight / 2, 0]} size={[6.8, chimneyHeight, 6.8]} color="#eeeae1" />
    <Box position={[0, tankBottom - capThickness / 2, 0]} size={[7, capThickness, 7]} color="#a5a5a1" />
    <mesh position={[0, tankBottom + 3.35 / 2, 0]} castShadow>
      <cylinderGeometry args={[2.25, 2.25, 3.35, 32]} />
      <meshStandardMaterial color="#171a1b" roughness={.5} />
    </mesh>
    {Array.from({length: 9}, (_, i) => <mesh key={i} position={[0, tankBottom + .3 + i * .32, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
      <torusGeometry args={[2.25, .035, 6, 48]} />
      <meshStandardMaterial color="#25292a" />
    </mesh>)}
    <mesh position={[0, tankBottom + 3.35 + .07, 0]} castShadow>
      <cylinderGeometry args={[.8, .8, .14, 32]} />
      <meshStandardMaterial color="#25292a" roughness={.42} />
    </mesh>
  </group>
}

function House({ roofVisible, cutaway, labelsVisible, width, depth }) {
  const sx = width / 32, sz = depth / 26
  const wallOpacity = cutaway ? .2 : 1
  // Openings are wall voids, with jambs and lintels built around them.
  const openings = {
    'left-stack': [{ at: -2.4 }, { at: 7 }],
    'right-stack-bedroom-1': [{ at: 2.3 }],
    'hall-prayer': [
      { at: -3.8 },
      { at: 1.45, width: 1.45, bottom: 1.14, top: 8.62 },
      { at: SITOUT_ENTRANCE.openingX, width: SITOUT_ENTRANCE.openingWidth, top: 8.65 },
    ],
    north: [
      { at: .25, width: 7.4, bottom: 3.375, top: 8.625 },
      { at: 14.25 },
    ],
    'south-left': [{ at: -11.8, width: 5.1, bottom: 3.375, top: 8.625 }],
    'south-prayer': [{ at: NARROW_FRONT_WINDOW_X, width: 1.4, bottom: 3.625, top: 8.375 }],
    'right-wing-front': [{ at: 11.7, width: 5.6, bottom: 3.375, top: 8.625 }],
    west: [
      { at: -10, width: 4.2, bottom: 3.7, top: 8.3 },
      { at: KITCHEN_DOOR_Z, width: 2.6 },
      { at: 10, width: 4.2, bottom: 3.7, top: 8.3 },
    ],
    'east-bedroom-1': [{ at: 2.5, width: 5, bottom: 3.7, top: 8.3 }],
  }
  const wall = (key, x, z, w, d) => {
    const alongX = w > d, center = alongX ? x : z, length = alongX ? w : d
    const bottom = 1.14, top = 11.15
    const pieces = []
    const add = (a, b, low, high) => {
      if (b <= a || high <= low) return
      pieces.push(<Box key={pieces.length} opacity={wallOpacity}
        position={[alongX ? (a+b)/2 : x, (low+high)/2, alongX ? z : (a+b)/2]}
        size={[alongX ? b-a : w, high-low, alongX ? d : b-a]} />)
    }
    let cursor = center - length/2
    for (const o of [...(openings[key] || [])].sort((a,b) => a.at-b.at)) {
      const start = o.at - (o.width ?? 2.6)/2, end = o.at + (o.width ?? 2.6)/2
      add(cursor, start, bottom, top)
      add(start, end, bottom, o.bottom ?? bottom)
      add(start, end, o.top ?? 8.62, top)
      cursor = end
    }
    add(cursor, center+length/2, bottom, top)
    return <group key={key}>{pieces}</group>
  }
  return <group scale={[-sx, 1, sz]}>
    {/* Black plinth ends at the enclosed footprint. Bounds include exterior wall thickness. */}
    {[
      [-16.975, -6.5, -13.475, 13.475],
      [-6.5, 7.275, -7.075, 13.475],
      [7.275, 16.975, BEDROOM1_FRONT_Z - .275, 13.475],
      [6.725, 7.275, BEDROOM1_FRONT_Z - .275, -7.075],
      [-6.5, -.825, -13.475, -7.075],
    ].map(([x1,x2,z1,z2], i) => <group key={i}>
      <Box position={[(x1+x2)/2, .5, (z1+z2)/2]} size={[x2-x1, 1, z2-z1]} color="#242729" />
      <Box position={[(x1+x2)/2, 1.07, (z1+z2)/2]} size={[x2-x1, .14, z2-z1]} color="#ded2bd" />
    </group>)}

    <group>
      {wall('west', -16.7, 0, .55, 26.95)}{wall('east-bedroom-1', 16.7, (BEDROOM1_FRONT_Z + 13.2) / 2, .55, 13.2 - BEDROOM1_FRONT_Z + .55)}{wall('north', 0, 13.2, 33.4, .55)}
      {wall('south-left', -11.6, -13.2, 10.2, .55)}{wall('south-prayer', -3.8, -13.2, 5.4, .55)}
      {wall('right-wing-front', 11.85, BEDROOM1_FRONT_Z, 9.7, .55)}
      {/* Exact HOME.png plan: left stack, central hall, right bedroom/services, front prayer and sit-out. */}
      {wall('left-stack', -6.5, 0, .55, 26.4)}
      {/* The Hall is open to the W/BT1/BT2 service zone; Bedroom 1 keeps its lower partition. */}
      {wall('right-stack-bedroom-1', 7, (BEDROOM1_FRONT_Z + 6.8) / 2, .55, 6.8 - BEDROOM1_FRONT_Z)}
      {wall('kitchen-bedroom-2', -11.5, 1.5, 10, .55)}
      {wall('hall-prayer', .25, -6.8, 13.5, .55)}
      {wall('bath-bedroom-1', 11.75, 6.8, 9.5, .55)}
      {wall('bath-w', 9.25, 10, .55, 6.4)}{wall('bath-bt1', 12, 10, .55, 6.4)}
      {wall('prayer-sitout-divider', -1.1, -10, .55, 6.4)}
    </group>

    <Box position={[-11.5, 1.18, 7.35]} size={[10, .08, 11.7]} color={ROOM_COLORS.kitchen} />
    <Box position={[-11.5, 1.18, -5.85]} size={[10, .08, 14.7]} color={ROOM_COLORS.bedroom} />
    <Box position={[.25, 1.18, 3.2]} size={[13.5, .08, 20]} color={ROOM_COLORS.hall} />
    <Box position={[11.75, 1.18, (BEDROOM1_FRONT_Z + 6.8) / 2]} size={[9.5, .08, 6.8 - BEDROOM1_FRONT_Z]} color={ROOM_COLORS.bedroom} />
    <Box position={[8.1, 1.18, 10]} size={[2.2, .08, 6.4]} color={ROOM_COLORS.service} />
    <Box position={[10.65, 1.18, 10]} size={[2.9, .08, 6.4]} color={ROOM_COLORS.service} />
    <Box position={[14.25, 1.18, 10]} size={[4.2, .08, 6.4]} color={ROOM_COLORS.service} />
    <Box position={[-3.8, 1.18, -10]} size={[5.4, .08, 6.4]} color={ROOM_COLORS.accent} />

    {/* Door positions taken from the supplied annotated plan. */}
    <Door position={[-6.5, 1.22, 7]} rotation={[0, Math.PI / 2, 0]} />
    <Door position={[-6.5, 1.22, -2.4]} rotation={[0, Math.PI / 2, 0]} />
    <Door position={[7, 1.22, 2.3]} rotation={[0, Math.PI / 2, 0]} />
    <Door position={[-3.8, 1.22, -6.8]} />
    <Door position={[SITOUT_ENTRANCE.doorX, 1.25, SITOUT_ENTRANCE.z]} width={SITOUT_ENTRANCE.doorWidth} hingeRight />
    <Door position={[14.25, 1.22, 13.2]} />

    {/* Only the Sit Out receives the projecting front canopy and steps. */}
    {/* One connected, supported porch slab; no dark plinth or slab in the right-hand yard. */}
    <Box position={[3.0875, .57, (-7.075 + PORCH.outerZ)/2]} size={[7.825, 1.14, -7.075 - PORCH.outerZ]} color="#a99479" />
    <Box position={[3.0875, 1.18, (PORCH.frontWallZ + PORCH.outerZ)/2]} size={[7.825, .08, PORCH.depth]} color="#796a56" />
    {/* The projecting canopy matches the thin window shade; its upper closure is set back. */}
    <Box position={[3.2375, SHADE_Y, -14.8]}
      size={[8.075, SHADE_THICKNESS, 3.2]} color="#ddd9d0" />
    <Box position={[3.2375, SHADE_UNDERSIDE_Y - .025, -14.8]} size={[8.075, .05, 3.2]} color="#77766f" />
    <Box position={[3.225, (SHADE_Y + SHADE_THICKNESS / 2 + ROOF_UNDERSIDE_Y) / 2, -13.2]}
      size={[8.1, ROOF_UNDERSIDE_Y - SHADE_Y - SHADE_THICKNESS / 2, .28]} color="#f4f0e5" />
    <TiledPillar position={[6.5, 0, -14.95]} />
    {[.915, .61, .305].map((height, i) => <Box key={i}
      position={[2.95, height/2, -16-i*.8]}
      size={[6.5+i*.35, height, .8]} color="#a99c87" />)}
    <SitOutDetails roofVisible={roofVisible} cutaway={cutaway} />

    <Window position={[-11.8, 6, -13.52]} width={5.1} height={5.25} />
    <Window position={[NARROW_FRONT_WINDOW_X, 6, -13.52]} width={1.4} height={4.75} />
    <Window position={[.25, 6, 13.52]} width={7.4} height={5.25} />
    <Window position={[11.7, 6, BEDROOM1_FRONT_Z - .32]} width={5.6} height={5.25} />
    <Window position={[16.98, 6, 2.5]} width={5} rotation={[0, Math.PI / 2, 0]} />
    <Window position={[-16.98, 6, 10]} width={4.2} rotation={[0, Math.PI / 2, 0]} />
    <Window position={[-16.98, 6, -10]} width={4.2} rotation={[0, Math.PI / 2, 0]} />
    <SplitKitchenDoor position={[-16.98, 1.22, KITCHEN_DOOR_Z]} rotation={[0, Math.PI / 2, 0]} />
    <KitchenDoorSteps position={[-16.98, 0, KITCHEN_DOOR_Z]} />

    <WindowShade cutaway={cutaway} />
    <Parapet roofVisible={roofVisible} />
    <RooftopTank roofVisible={roofVisible} />

    <RoomLabel visible={labelsVisible} position={[-11.5, 5, 7.35]}>Kitchen</RoomLabel>
    <RoomLabel visible={labelsVisible} position={[-11.5, 5, -5.85]}>Bedroom 2</RoomLabel>
    <RoomLabel visible={labelsVisible} position={[.25, 5, 3.2]}>Hall</RoomLabel>
    <RoomLabel visible={labelsVisible} position={[11.75, 5, (BEDROOM1_FRONT_Z + 6.8) / 2]}>Bedroom 1</RoomLabel>
    <RoomLabel visible={labelsVisible} position={[8.1, 5, 10]}>W</RoomLabel>
    <RoomLabel visible={labelsVisible} position={[10.65, 5, 10]}>BT1</RoomLabel>
    <RoomLabel visible={labelsVisible} position={[14.25, 5, 10]}>BT2</RoomLabel>
    <RoomLabel visible={labelsVisible} position={[-3.8, 5, -10]}>Prayer</RoomLabel>
    <RoomLabel visible={labelsVisible} position={[2.95, 5, -10]}>Sit out</RoomLabel>
  </group>
}

export default function HouseScene(props) {
  return <Canvas shadows dpr={[1, 2]} camera={{ position: [31, 22, -43], fov: 42, near: .1, far: 150 }}>
    <color attach="background" args={['#b9c9bf']} />
    <fog attach="fog" args={['#b9c9bf', 45, 92]} />
    <hemisphereLight args={['#eaf6ff', '#6b634f', 2]} />
    <directionalLight position={[-22, 35, -25]} intensity={3.2} castShadow
      shadow-mapSize={[2048, 2048]} shadow-camera-left={-38} shadow-camera-right={38}
      shadow-camera-top={38} shadow-camera-bottom={-38} shadow-camera-near={1}
      shadow-camera-far={100} shadow-bias={-.0003} shadow-normalBias={.05} />
    <Suspense fallback={null}><House {...props} /></Suspense>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[120, 120]} /><meshStandardMaterial color="#846d54" roughness={1} /></mesh>
    <OrbitControls makeDefault enableDamping target={[0, 6, -4]} maxPolarAngle={Math.PI / 2.04} minDistance={16} maxDistance={75} />
  </Canvas>
}
