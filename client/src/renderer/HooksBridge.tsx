import { useFrame } from "@react-three/fiber";
import { useGame } from "@/lib/stores/useGame";

export default function HooksBridge() {
  const { setFps } = useGame();
  useFrame((_, delta) => {
    setFps(1 / Math.max(delta, 1e-6));
  });
  return null;
}
