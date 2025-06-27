import { useRef, useEffect } from "react";
import CanvasAnimation from "./CanvasAnimation";

function DynamicBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // alert("Canvas Animation Initialized");

    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasAnimation = new CanvasAnimation(canvasRef.current!);
    console.log(canvas.style.width);

    canvasAnimation.setup();
  }, []);

  return (
    <div className="w-full h-screen ">
      <canvas
        className="w-full h-screen"
        ref={canvasRef}
        id="DynamicBgCanvas"
      />
    </div>
  );
}

export default DynamicBg;
