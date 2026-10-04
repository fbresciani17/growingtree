import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { useFamilyTree } from '../context/FamilyTreeContext';
import { computeFamilyTreeLayout, LayoutPersonCard } from '../utils/treeLayout';
import { PersonCard } from './PersonCard';
import { normalizeSearch } from '../utils/formatters';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Crosshair, 
  Heart, 
  Plus, 
  Sparkles,
  TreeDeciduous 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface TreeViewProps {
  onOpenAddPerson: () => void;
}

export const TreeView: React.FC<TreeViewProps> = ({ onOpenAddPerson }) => {
  const {
    people,
    relationships,
    selectedPersonId,
    setSelectedPersonId,
    searchQuery,
  } = useFamilyTree();

  const { isEditModeUnlocked, openCodeModal } = useAuth();

  const containerRef = useRef<HTMLDivElement>(null);
  
  // Canvas Transform State: scale (zoom), translateX, translateY
  const [transform, setTransform] = useState({ scale: 1, x: 100, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Touch handling state
  const touchStateRef = useRef<{
    lastX: number;
    lastY: number;
    lastDistance: number | null;
  }>({ lastX: 0, lastY: 0, lastDistance: null });

  // Calculate layout
  const layout = useMemo(() => {
    return computeFamilyTreeLayout(people, relationships);
  }, [people, relationships]);

  // Center tree on initial load or root
  const centerOnRoot = useCallback(() => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    if (layout.cards.length === 0) {
      setTransform({ scale: 1, x: containerWidth / 2 - 110, y: 100 });
      return;
    }

    // Find root nodes (Generation 0)
    const roots = layout.cards.filter((c) => c.generation === 0);
    const targetCards = roots.length > 0 ? roots : [layout.cards[0]];

    const minRootX = Math.min(...targetCards.map((c) => c.x));
    const maxRootX = Math.max(...targetCards.map((c) => c.x + c.width));
    const rootCenterX = (minRootX + maxRootX) / 2;
    const rootY = targetCards[0].y;

    const newX = containerWidth / 2 - rootCenterX;
    const newY = Math.max(60, containerHeight / 4 - rootY);

    setTransform({
      scale: 1,
      x: newX,
      y: newY,
    });
  }, [layout]);

  // Fit entire tree to screen
  const fitToScreen = useCallback(() => {
    if (!containerRef.current || layout.cards.length === 0) return;
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    const padding = 80;
    const treeWidth = layout.bounds.width + padding * 2;
    const treeHeight = layout.bounds.height + padding * 2;

    const scaleX = containerWidth / treeWidth;
    const scaleY = containerHeight / treeHeight;
    const newScale = Math.min(Math.max(Math.min(scaleX, scaleY), 0.35), 1.2);

    const treeCenterX = layout.bounds.minX + layout.bounds.width / 2;
    const treeCenterY = layout.bounds.minY + layout.bounds.height / 2;

    const newX = containerWidth / 2 - treeCenterX * newScale;
    const newY = containerHeight / 2 - treeCenterY * newScale;

    setTransform({
      scale: newScale,
      x: newX,
      y: newY,
    });
  }, [layout]);

  // Center on initial load
  useEffect(() => {
    if (layout.cards.length > 0) {
      centerOnRoot();
    }
  }, [layout.cards.length === 0]);

  // Pan to selected person if changed
  useEffect(() => {
    if (!selectedPersonId || !containerRef.current) return;
    const card = layout.cards.find((c) => c.person.id === selectedPersonId);
    if (card) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;

      const cardCenterX = card.x + card.width / 2;
      const cardCenterY = card.y + card.height / 2;

      setTransform((prev) => ({
        scale: prev.scale < 0.8 ? 0.8 : prev.scale,
        x: containerWidth / 2 - cardCenterX * (prev.scale < 0.8 ? 0.8 : prev.scale),
        y: containerHeight / 2 - cardCenterY * (prev.scale < 0.8 ? 0.8 : prev.scale),
      }));
    }
  }, [selectedPersonId, layout.cards]);

  // Mouse pan event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTransform((prev) => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Wheel zoom handler centered on mouse
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newScale = Math.min(Math.max(transform.scale * zoomFactor, 0.25), 2.5);

    // Zoom towards mouse position
    const newX = mouseX - (mouseX - transform.x) * (newScale / transform.scale);
    const newY = mouseY - (mouseY - transform.y) * (newScale / transform.scale);

    setTransform({
      scale: newScale,
      x: newX,
      y: newY,
    });
  };

  // Touch event handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStateRef.current = {
        lastX: e.touches[0].clientX,
        lastY: e.touches[0].clientY,
        lastDistance: null,
      };
      setIsDragging(true);
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      touchStateRef.current.lastDistance = distance;
      setIsDragging(false);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStateRef.current.lastX;
      const deltaY = touch.clientY - touchStateRef.current.lastY;

      touchStateRef.current.lastX = touch.clientX;
      touchStateRef.current.lastY = touch.clientY;

      setTransform((prev) => ({
        ...prev,
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }));
    } else if (e.touches.length === 2 && touchStateRef.current.lastDistance !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDistance = Math.sqrt(dx * dx + dy * dy);

      const ratio = currentDistance / touchStateRef.current.lastDistance;
      const newScale = Math.min(Math.max(transform.scale * ratio, 0.25), 2.5);

      touchStateRef.current.lastDistance = currentDistance;

      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;

        const newX = midX - (midX - transform.x) * (newScale / transform.scale);
        const newY = midY - (midY - transform.y) * (newScale / transform.scale);

        setTransform({
          scale: newScale,
          x: newX,
          y: newY,
        });
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchStateRef.current.lastDistance = null;
  };

  // Zoom button controls
  const handleZoomIn = () => {
    if (!containerRef.current) return;
    const cx = containerRef.current.clientWidth / 2;
    const cy = containerRef.current.clientHeight / 2;
    const newScale = Math.min(transform.scale * 1.25, 2.5);
    setTransform((prev) => ({
      scale: newScale,
      x: cx - (cx - prev.x) * (newScale / prev.scale),
      y: cy - (cy - prev.y) * (newScale / prev.scale),
    }));
  };

  const handleZoomOut = () => {
    if (!containerRef.current) return;
    const cx = containerRef.current.clientWidth / 2;
    const cy = containerRef.current.clientHeight / 2;
    const newScale = Math.max(transform.scale * 0.8, 0.25);
    setTransform((prev) => ({
      scale: newScale,
      x: cx - (cx - prev.x) * (newScale / prev.scale),
      y: cy - (cy - prev.y) * (newScale / prev.scale),
    }));
  };

  const normalizedQuery = normalizeSearch(searchQuery);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`
        relative flex-1 w-full h-full overflow-hidden tree-canvas-bg select-none
        ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
      `}
    >
      {/* Empty State Banner if no people exist */}
      {people.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
          <div className="w-20 h-20 rounded-3xl bg-family-100 flex items-center justify-center text-family-700 shadow-soft mb-4">
            <TreeDeciduous className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">
            L'albero genealogico è vuoto
          </h2>
          <p className="text-slate-600 max-w-md mb-6">
            Inizia ad aggiungere i primi membri della famiglia, partendo dai capostipiti o dai tuoi genitori.
          </p>
          <button
            onClick={() => {
              if (!isEditModeUnlocked) {
                openCodeModal(onOpenAddPerson);
              } else {
                onOpenAddPerson();
              }
            }}
            className="flex items-center gap-2 bg-family-700 hover:bg-family-800 text-white font-medium px-6 py-3 rounded-xl shadow-md transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Aggiungi prima persona
          </button>
        </div>
      )}

      {/* Main Canvas Layer */}
      <div
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: '0 0',
          transition: isDragging ? 'none' : 'transform 0.15s ease-out',
        }}
        className="absolute top-0 left-0 pointer-events-auto"
      >
        {/* SVG Connectors Layer */}
        <svg
          className="absolute top-0 left-0 overflow-visible pointer-events-none"
          style={{ width: 1, height: 1 }}
        >
          <defs>
            <linearGradient id="branchGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#528757" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#77a67b" stopOpacity="0.8" />
            </linearGradient>
            <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000" floodOpacity="0.08" />
            </filter>
          </defs>

          {/* Parent-Child Tree Branches */}
          {layout.branchConnections.map((branch) => (
            <path
              key={branch.id}
              d={branch.path}
              fill="none"
              stroke="#528757"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-300"
            />
          ))}

          {/* Partner Horizontal Connectors */}
          {layout.partnerConnections.map((partner) => (
            <g key={partner.id}>
              <line
                x1={partner.x1}
                y1={partner.y1}
                x2={partner.x2}
                y2={partner.y2}
                stroke="#e11d48"
                strokeWidth="2"
                strokeDasharray="4 3"
                className="opacity-70"
              />
              {/* Partner icon circle in midpoint */}
              <circle
                cx={partner.midX}
                cy={partner.midY}
                r="10"
                fill="#ffffff"
                stroke="#f43f5e"
                strokeWidth="1.5"
              />
              <path
                d={`M ${partner.midX - 4} ${partner.midY - 1} 
                    A 2.5 2.5 0 0 1 ${partner.midX} ${partner.midY - 3} 
                    A 2.5 2.5 0 0 1 ${partner.midX + 4} ${partner.midY - 1} 
                    Q ${partner.midX} ${partner.midY + 4} ${partner.midX} ${partner.midY + 4} 
                    Q ${partner.midX} ${partner.midY + 4} ${partner.midX - 4} ${partner.midY - 1} Z`}
                fill="#e11d48"
              />
            </g>
          ))}
        </svg>

        {/* DOM Cards Layer */}
        {layout.cards.map((card) => {
          const isSelected = selectedPersonId === card.person.id;
          const fullName = `${card.person.first_name} ${card.person.last_name}`;
          const isSearchMatch =
            Boolean(normalizedQuery) &&
            normalizeSearch(fullName).includes(normalizedQuery);

          return (
            <div
              key={card.person.id}
              style={{
                position: 'absolute',
                left: `${card.x}px`,
                top: `${card.y}px`,
              }}
            >
              <PersonCard
                person={card.person}
                partnerCount={card.partnerIds.length}
                childrenCount={card.childrenIds.length}
                isSelected={isSelected}
                isSearchMatch={isSearchMatch}
                onClick={() => setSelectedPersonId(card.person.id)}
              />
            </div>
          );
        })}
      </div>

      {/* Floating Canvas Controls */}
      <div className="absolute bottom-5 right-5 flex flex-col gap-2 z-20">
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl p-1.5 shadow-soft flex flex-col gap-1 text-slate-700">
          <button
            onClick={handleZoomIn}
            title="Ingrandisci"
            className="p-2.5 hover:bg-family-50 hover:text-family-700 rounded-xl transition-colors active:scale-90"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Riduci"
            className="p-2.5 hover:bg-family-50 hover:text-family-700 rounded-xl transition-colors active:scale-90"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <div className="h-[1px] bg-slate-200 my-0.5" />
          <button
            onClick={() => setTransform((prev) => ({ ...prev, scale: 1 }))}
            title="Scala 100%"
            className="p-2 text-xs font-semibold hover:bg-family-50 hover:text-family-700 rounded-xl transition-colors"
          >
            {Math.round(transform.scale * 100)}%
          </button>
          <button
            onClick={centerOnRoot}
            title="Centra sui capostipiti"
            className="p-2.5 hover:bg-family-50 hover:text-family-700 rounded-xl transition-colors active:scale-90"
          >
            <Crosshair className="w-5 h-5" />
          </button>
          <button
            onClick={fitToScreen}
            title="Adatta allo schermo"
            className="p-2.5 hover:bg-family-50 hover:text-family-700 rounded-xl transition-colors active:scale-90"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Roots Watermark & Legend Indicator */}
      <div className="absolute top-4 left-4 pointer-events-none z-10 hidden md:flex items-center gap-2 bg-white/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200/80 text-xs font-medium text-slate-600 shadow-sm">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>Navigazione: trascina per muoverti, usa la rotellina per lo zoom</span>
      </div>
    </div>
  );
};
