
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { FamilyMember } from '../types';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Plus, Minus, Maximize } from 'lucide-react';

interface Settings {
  showNicknames: boolean;
  highlightRoyal: boolean;
  showMaternalLinks: boolean;
  compactMode: boolean;
}

interface Props {
  data: FamilyMember[];
  onMemberClick: (member: FamilyMember) => void;
  settings: Settings;
}

// Fixed: Made children optional to resolve TypeScript errors where children were reported as missing
const KeyboardKey = ({ children }: { children?: React.ReactNode }) => (
  <span className="bg-white/20 px-1.5 py-0.5 rounded border border-white/30 text-white leading-none">{children}</span>
);

const TreeVisualizer: React.FC<Props> = ({ data, onMemberClick, settings }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomRef = useRef<any>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const width = 1400;
    const height = 900;
    const nodeRadius = 24;

    const svgSelection = d3.select(svgRef.current);
    svgSelection.selectAll("*").remove();

    const g = svgSelection
      .attr("viewBox", `0 0 ${width} ${height}`)
      .append("g")
      .attr("class", "main-group");

    // Stratify data based on primary lineage
    const stratify = d3.stratify<FamilyMember>()
      .id(d => d.id)
      .parentId(d => d.parentId);

    try {
      const root = stratify(data);
      
      const layoutWidth = width - 300;
      const layoutHeight = settings.compactMode ? height / 2 : height - 300;
      const treeLayout = d3.tree<FamilyMember>().size([layoutWidth, layoutHeight]);
      treeLayout(root);

      // Initial center transform
      g.attr("transform", `translate(150, 100)`);

      // 1. Draw parent-child links
      g.selectAll(".link")
        .data(root.links())
        .enter()
        .append("path")
        .attr("class", "link")
        .attr("d", d3.linkVertical()
          .x(d => (d as any).x)
          .y(d => (d as any).y) as any)
        .attr("fill", "none")
        .attr("stroke", "#e5e7eb")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", d => d.target.data.isRoyal ? "0" : "5,3")
        .style("opacity", 0.8);

      // 2. Nodes
      const nodes = g.selectAll(".node")
        .data(root.descendants())
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${(d as any).x},${(d as any).y})`)
        .style("cursor", "pointer")
        .on("click", (event, d) => onMemberClick(d.data));

      // Add Defs for Clipping circles
      const defs = nodes.append("defs");
      defs.append("clipPath")
        .attr("id", d => `clip-${d.id}`)
        .append("circle")
        .attr("r", nodeRadius);

      // Shadow background
      nodes.append("circle")
        .attr("r", nodeRadius + 2)
        .attr("fill", "#fff")
        .attr("filter", "drop-shadow(0px 4px 6px rgba(0,0,0,0.1))");

      // Background border based on status
      nodes.append("circle")
        .attr("r", nodeRadius + 4)
        .attr("fill", "none")
        .attr("stroke", d => {
          if (!settings.highlightRoyal) return "#d1d5db";
          return d.data.isRoyal ? "#065f46" : "#b45309";
        })
        .attr("stroke-width", 2.5);

      // Display Image
      nodes.append("image")
        .attr("xlink:href", d => d.data.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${d.id}`)
        .attr("x", -nodeRadius)
        .attr("y", -nodeRadius)
        .attr("width", nodeRadius * 2)
        .attr("height", nodeRadius * 2)
        .attr("clip-path", d => `url(#clip-${d.id})`)
        .attr("preserveAspectRatio", "xMidYMid slice");

      // Royal Crown Indicator
      nodes.filter(d => d.data.isRoyal)
        .append("circle")
        .attr("cx", nodeRadius - 5)
        .attr("cy", -nodeRadius + 5)
        .attr("r", 7)
        .attr("fill", "#f59e0b")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5);

      // Name Text
      nodes.append("text")
        .attr("dy", ".35em")
        .attr("y", d => d.children ? -nodeRadius - 20 : nodeRadius + 20)
        .attr("text-anchor", "middle")
        .text(d => d.data.name)
        .attr("font-size", "12px")
        .attr("fill", "#064e3b")
        .attr("font-weight", "700")
        .attr("font-family", "serif")
        .style("paint-order", "stroke")
        .style("stroke", "#fff")
        .style("stroke-width", "4px")
        .style("stroke-linecap", "round")
        .style("stroke-linejoin", "round");

      if (settings.showNicknames) {
        nodes.filter(d => !!d.data.nickName)
          .append("text")
          .attr("dy", ".35em")
          .attr("y", d => d.children ? -nodeRadius - 36 : nodeRadius + 36)
          .attr("text-anchor", "middle")
          .text(d => `"${d.data.nickName}"`)
          .attr("font-size", "10px")
          .attr("fill", "#92400e")
          .attr("font-style", "italic")
          .attr("font-weight", "500");
      }

    } catch (err) {
      console.warn("Hierarchy layout failed, showing grid.", err);
    }

    // Zoom setup - CRITICAL: Filter out mouse/touch events
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .filter((event) => {
        // Disable mouse pad, scroll wheel, and mouse dragging/panning
        // Only allow programmatic zoom (button clicks/keys) to pass through
        return false; 
      })
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    zoomRef.current = zoom;
    svgSelection.call(zoom as any);

    const handleKeyDown = (e: KeyboardEvent) => {
      const step = 80;
      const zoomStep = 1.2;
      const currentSelection = d3.select(svgRef.current);
      
      if (e.key === 'ArrowUp') currentSelection.transition().duration(200).call(zoom.translateBy as any, 0, step);
      if (e.key === 'ArrowDown') currentSelection.transition().duration(200).call(zoom.translateBy as any, 0, -step);
      if (e.key === 'ArrowLeft') currentSelection.transition().duration(200).call(zoom.translateBy as any, step, 0);
      if (e.key === 'ArrowRight') currentSelection.transition().duration(200).call(zoom.translateBy as any, -step, 0);
      if (e.key === '+' || e.key === '=') currentSelection.transition().duration(200).call(zoom.scaleBy as any, zoomStep);
      if (e.key === '-' || e.key === '_') currentSelection.transition().duration(200).call(zoom.scaleBy as any, 1 / zoomStep);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);

  }, [data, onMemberClick, settings]);

  const triggerZoom = (direction: 'in' | 'out') => {
    if (!svgRef.current || !zoomRef.current) return;
    const factor = direction === 'in' ? 1.3 : 1/1.3;
    d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, factor);
  };

  const triggerPan = (x: number, y: number) => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.translateBy, x, y);
  };

  const resetZoom = () => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current).transition().duration(500).call(zoomRef.current.transform, d3.zoomIdentity.translate(150, 100));
  };

  return (
    <div className="relative w-full h-full bg-[#fcfbf7] border border-stone-200 rounded-[3rem] overflow-hidden shadow-inner" tabIndex={0}>
      <svg ref={svgRef} className="w-full h-full" />
      
      {/* On-Screen Navigation Controls */}
      <div className="absolute top-6 right-6 flex flex-col gap-3">
        <div className="bg-white/90 backdrop-blur-xl p-2 rounded-2xl shadow-xl border border-stone-200 grid grid-cols-3 gap-1">
          <div />
          <button onClick={() => triggerPan(0, 80)} className="p-2 hover:bg-stone-100 rounded-lg text-stone-600 transition-all"><ChevronUp className="w-5 h-5" /></button>
          <div />
          <button onClick={() => triggerPan(80, 0)} className="p-2 hover:bg-stone-100 rounded-lg text-stone-600 transition-all"><ChevronLeft className="w-5 h-5" /></button>
          <button onClick={resetZoom} className="p-2 hover:bg-emerald-50 rounded-lg text-emerald-800 transition-all"><Maximize className="w-5 h-5" /></button>
          <button onClick={() => triggerPan(-80, 0)} className="p-2 hover:bg-stone-100 rounded-lg text-stone-600 transition-all"><ChevronRight className="w-5 h-5" /></button>
          <div />
          <button onClick={() => triggerPan(0, -80)} className="p-2 hover:bg-stone-100 rounded-lg text-stone-600 transition-all"><ChevronDown className="w-5 h-5" /></button>
          <div />
        </div>

        <div className="bg-white/90 backdrop-blur-xl p-2 rounded-2xl shadow-xl border border-stone-200 flex flex-col gap-1">
          <button onClick={() => triggerZoom('in')} className="p-2 hover:bg-emerald-50 rounded-lg text-emerald-800 transition-all"><Plus className="w-5 h-5" /></button>
          <div className="h-px bg-stone-100 mx-1" />
          <button onClick={() => triggerZoom('out')} className="p-2 hover:bg-amber-50 rounded-lg text-amber-800 transition-all"><Minus className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="absolute bottom-6 right-6 flex flex-col gap-2">
         <div className="bg-white/80 backdrop-blur px-4 py-2 rounded-2xl border border-stone-200 text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-3">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-800" /> Royal</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-700" /> Maternal</span>
         </div>
      </div>
      
      {/* Keyboard Helper Tooltip */}
      <div className="absolute bottom-6 left-6 opacity-0 hover:opacity-100 transition-opacity">
        <div className="bg-stone-900/80 backdrop-blur text-white px-4 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-4">
          <span className="flex items-center gap-1"><KeyboardKey>↑↓←→</KeyboardKey> Pan</span>
          <span className="flex items-center gap-1"><KeyboardKey>+/-</KeyboardKey> Zoom</span>
        </div>
      </div>
    </div>
  );
};

export default TreeVisualizer;
