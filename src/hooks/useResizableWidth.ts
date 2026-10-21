import type { KeyboardEvent, PointerEvent } from "react";
import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "fleetops:listWidth";

type Options = {
  initial?: number;
  min?: number;
  max?: number;
  // Largura mínima que o painel ao lado (detalhe) deve manter.
  reservedRight?: number;
};

export function useResizableWidth({
  initial = 320,
  min = 240,
  max = 640,
  reservedRight = 360,
}: Options = {}) {
  const [width, setWidth] = useState<number>(() => {
    try {
      const saved = Number(localStorage.getItem(STORAGE_KEY));
      if (saved >= min && saved <= max) return saved;
    } catch {
      // localStorage indisponível: usa o valor padrão
    }
    return initial;
  });
  const [resizing, setResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (resizing) return;
    try {
      localStorage.setItem(STORAGE_KEY, String(width));
    } catch {
      // ignora
    }
  }, [width, resizing]);

  function clamp(value: number) {
    const total = containerRef.current?.getBoundingClientRect().width ?? Infinity;
    const limit = Math.max(min, Math.min(max, total - reservedRight));
    return Math.round(Math.min(limit, Math.max(min, value)));
  }

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    setResizing(true);
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!resizing || !containerRef.current) return;
    const left = containerRef.current.getBoundingClientRect().left;
    setWidth(clamp(e.clientX - left));
  }

  function onPointerUp(e: PointerEvent<HTMLDivElement>) {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setResizing(false);
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setWidth(w => clamp(w - 16));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setWidth(w => clamp(w + 16));
    }
  }

  function reset() {
    setWidth(clamp(initial));
  }

  return {
    width,
    resizing,
    containerRef,
    handleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
      onKeyDown,
      onDoubleClick: reset,
    },
  };
}