const CX = 200;
const CY = 200;
const R = 150;
const LATITUDES = [-60, -30, 0, 30, 60];
const MERIDIANS = [0, 1, 2, 3, 4, 5];
const PINGS = [
  [150, 150],
  [250, 125],
  [272, 232],
  [122, 252],
  [208, 288],
];

// A wireframe globe: meridians sweep, markers pulse and a satellite circles it.
export default function Globe() {
  return (
    <svg className="globe" viewBox="0 0 400 400" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="sphereFill" cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#16264d" />
          <stop offset="100%" stopColor="#060913" />
        </radialGradient>
      </defs>

      <circle className="g-sphere" cx={CX} cy={CY} r={R} />

      {LATITUDES.map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <ellipse
            key={deg}
            className="g-line"
            cx={CX}
            cy={CY + R * Math.sin(rad)}
            rx={R * Math.cos(rad)}
            ry={10 * Math.cos(rad)}
          />
        );
      })}

      {MERIDIANS.map((i) => (
        <circle
          key={i}
          className="g-line meridian"
          cx={CX}
          cy={CY}
          r={R}
          style={{ "--i": i, "--s": Math.abs(Math.cos((i * Math.PI) / 6)).toFixed(2) }}
        />
      ))}

      {PINGS.map(([x, y], i) => (
        <g key={i}>
          <circle className="ping-dot" cx={x} cy={y} r="3" />
          <circle className="ping-ring" cx={x} cy={y} r="6" style={{ "--i": i }} />
        </g>
      ))}

      <g transform="rotate(-24 200 200)">
        <ellipse className="g-orbit" cx={CX} cy={CY} rx="186" ry="58" />
        <circle className="satellite" r="5">
          <animateMotion
            dur="14s"
            repeatCount="indefinite"
            path="M 14 200 A 186 58 0 1 0 386 200 A 186 58 0 1 0 14 200"
          />
        </circle>
      </g>
    </svg>
  );
}
