export function SVGComponent() {
    return(
<svg
  className="w-9 rounded-lg"
  id="Layer_1"
  x="0px"
  y="0px"
  viewBox="0 0 1000 1000"
  fill="currentColor"
>
  <rect
    x={200}
    y={100}
    width={200}
    height={500}
    className="text-secondary"
  />
  <rect
    x={400}
    y={600}
    width={400}
    height={200}
    className="text-secondary"
  />
  <rect
    x={600}
    y={200}
    width={200}
    height={200}
    className="text-secondary"
  />
  <polygon
    points="400,600 200,600 400,800"
    className="text-secondary"
  />
</svg>

    
    )
  }