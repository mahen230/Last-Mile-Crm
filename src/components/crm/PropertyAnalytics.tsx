import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Property } from '../../types/models';

interface PropertyAnalyticsProps {
  properties: Property[];
}

export default function PropertyAnalytics({ properties }: PropertyAnalyticsProps) {
  const pieRef = useRef<SVGSVGElement>(null);
  const barRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!properties.length) return;

    // 1. Pie Chart: Residential vs Commercial
    const residential = properties.filter(p => p.status !== 'Commercial').length;
    const commercial = properties.filter(p => p.status === 'Commercial').length;
    const pieData = [{ label: 'Residential', value: residential }, { label: 'Commercial', value: commercial }];

    const width = 200, height = 200, radius = Math.min(width, height) / 2;
    const svg = d3.select(pieRef.current);
    svg.selectAll("*").remove();
    const g = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 2})`);
    const color = d3.scaleOrdinal().domain(pieData.map(d => d.label)).range(["#3b82f6", "#f59e0b"]);
    const pie = d3.pie<{label: string, value: number}>().value(d => d.value);
    const arc = d3.arc<d3.PieArcDatum<{label: string, value: number}>>().innerRadius(0).outerRadius(radius);

    g.selectAll("path").data(pie(pieData)).enter().append("path")
      .attr("d", arc)
      .attr("fill", d => color(d.data.label) as string);

    // 2. Bar Chart: Vacancy rate by beat
    const beatStats = d3.rollup(properties, 
      v => ({ total: v.length, vacant: v.filter(p => p.status === 'Vacant').length }),
      d => d.beatNo || 'Unassigned'
    );
    const barData = Array.from(beatStats, ([beat, stats]) => ({ beat, rate: stats.vacant / stats.total }));

    const barSvg = d3.select(barRef.current);
    barSvg.selectAll("*").remove();
    const margin = {top: 20, right: 20, bottom: 30, left: 40};
    const bWidth = 300 - margin.left - margin.right;
    const bHeight = 200 - margin.top - margin.bottom;
    const bx = d3.scaleBand().domain(barData.map(d => d.beat)).range([0, bWidth]).padding(0.1);
    const by = d3.scaleLinear().domain([0, 1]).range([bHeight, 0]);

    const bg = barSvg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);
    bg.selectAll(".bar").data(barData).enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => bx(d.beat)!)
      .attr("y", d => by(d.rate))
      .attr("width", bx.bandwidth())
      .attr("height", d => bHeight - by(d.rate))
      .attr("fill", "#ef4444");

  }, [properties]);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="font-bold text-lg mb-4">Property Analytics</h3>
      <div className="flex gap-4">
        <div><p className="text-sm font-semibold mb-2">Distribution</p><svg ref={pieRef} width={200} height={200} /></div>
        <div><p className="text-sm font-semibold mb-2">Vacancy Rate by Beat</p><svg ref={barRef} width={300} height={200} /></div>
      </div>
    </div>
  );
}
