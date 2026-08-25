import React, { useState, useMemo } from 'react';
import { EntityRelationship } from '../../types';
import {
  Target,
  Search,
  Layers,
  Compass,
} from 'lucide-react';

interface EntityMapTabProps {
  entities: EntityRelationship[];
  seedTopic: string;
}

export const EntityMapTab: React.FC<EntityMapTabProps> = ({ entities = [], seedTopic }) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCoverage, setSelectedCoverage] = useState<string>('all');
  const [activeEntityId, setActiveEntityId] = useState<string | null>(entities[0]?.id || null);

  const types = useMemo(() => {
    return Array.from(new Set(entities.map((e) => e.type))).sort();
  }, [entities]);

  const filteredEntities = useMemo(() => {
    return entities.filter((e) => {
      if (searchFilter) {
        const q = searchFilter.toLowerCase();
        const match =
          e.name.toLowerCase().includes(q) ||
          e.type.toLowerCase().includes(q) ||
          e.relationshipToMainTopic.toLowerCase().includes(q) ||
          e.recommendedContentPlacement.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (selectedType !== 'all' && e.type !== selectedType) return false;
      if (selectedCoverage !== 'all' && e.targetSiteCoverage !== selectedCoverage) return false;
      return true;
    });
  }, [entities, searchFilter, selectedType, selectedCoverage]);

  const activeEntity = entities.find((e) => e.id === activeEntityId) || filteredEntities[0] || entities[0];

  // SVG Coordinates setup for visual radial graph
  const centerX = 350;
  const centerY = 240;
  const radius = 170;

  const visibleGraphEntities = entities.slice(0, 10);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-800 border border-teal-200">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Entity Knowledge Graph & Subject Relationships
              </h2>
              <p className="text-xs text-slate-500">
                Semantic entities, neighbourhood hierarchies, and audience attributes extracted from query decomposition.
              </p>
            </div>
          </div>

          <div className="text-xs font-semibold text-teal-900 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200">
            {entities.length} Key Entities Mapped
          </div>
        </div>
      </div>

      {/* Visual Interactive SVG Entity Graph & Inspector */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-6">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-600" /> Interactive Relational Graph
            </h3>
            <p className="text-xs text-slate-500">Click any node to inspect semantic relationships and content placement</p>
          </div>
          <span className="text-[11px] text-slate-400">Core Entities Hub</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Graph Canvas */}
          <div className="lg:col-span-8 flex justify-center bg-slate-900/95 rounded-2xl p-4 overflow-hidden border border-slate-800 shadow-inner">
            <svg
              viewBox="0 0 700 480"
              className="w-full max-w-[650px] h-[360px] sm:h-[420px] select-none"
            >
              {/* Radial Guide Ring */}
              <circle
                cx={centerX}
                cy={centerY}
                r={radius}
                fill="none"
                stroke="#334155"
                strokeWidth="1"
                strokeDasharray="4 4"
              />

              {/* Connecting Lines & Relationship Labels */}
              {visibleGraphEntities.map((ent, idx) => {
                const angle = (idx / (visibleGraphEntities.length || 1)) * 2 * Math.PI - Math.PI / 2;
                const nodeX = centerX + radius * Math.cos(angle);
                const nodeY = centerY + radius * Math.sin(angle);
                const isSelected = activeEntity?.id === ent.id;

                const midX = (centerX + nodeX) / 2;
                const midY = (centerY + nodeY) / 2;

                return (
                  <g key={`line-${ent.id}`}>
                    <line
                      x1={centerX}
                      y1={centerY}
                      x2={nodeX}
                      y2={nodeY}
                      stroke={isSelected ? '#2dd4bf' : '#475569'}
                      strokeWidth={isSelected ? '2.5' : '1'}
                      strokeDasharray={isSelected ? 'none' : '2 2'}
                      className="transition-all"
                    />
                    {/* Relationship tag on line */}
                    <rect
                      x={midX - 35}
                      y={midY - 8}
                      width={70}
                      height={16}
                      rx={4}
                      fill="#0f172a"
                      stroke={isSelected ? '#2dd4bf' : '#334155'}
                      strokeWidth="1"
                    />
                    <text
                      x={midX}
                      y={midY + 3}
                      fill={isSelected ? '#5eead4' : '#94a3b8'}
                      fontSize="8"
                      textAnchor="middle"
                      fontWeight="500"
                    >
                      {(ent.relationshipType || ent.relationshipToMainTopic || '').slice(0, 14)}
                    </text>
                  </g>
                );
              })}

              {/* Center Seed Node */}
              <g className="cursor-default">
                <circle cx={centerX} cy={centerY} r={46} fill="#0f172a" stroke="#2dd4bf" strokeWidth="3" />
                <circle cx={centerX} cy={centerY} r={38} fill="#1e293b" />
                <text
                  x={centerX}
                  y={centerY - 6}
                  fill="#ffffff"
                  fontSize="11"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {(seedTopic || 'Seed Topic').slice(0, 16)}
                </text>
                <text
                  x={centerX}
                  y={centerY + 10}
                  fill="#5eead4"
                  fontSize="9"
                  textAnchor="middle"
                  fontWeight="500"
                >
                  Seed Concept
                </text>
              </g>

              {/* Surrounding Entity Nodes */}
              {visibleGraphEntities.map((ent, idx) => {
                const angle = (idx / (visibleGraphEntities.length || 1)) * 2 * Math.PI - Math.PI / 2;
                const nodeX = centerX + radius * Math.cos(angle);
                const nodeY = centerY + radius * Math.sin(angle);
                const isSelected = activeEntity?.id === ent.id;

                const nodeFill =
                  ent.targetSiteCoverage === 'Comprehensive' || ent.targetSiteCoverage === 'Covered'
                    ? '#065f46'
                    : ent.targetSiteCoverage === 'Partial' || ent.targetSiteCoverage === 'Partially covered'
                    ? '#1e3a8a'
                    : '#831843';

                return (
                  <g
                    key={`node-${ent.id}`}
                    onClick={() => setActiveEntityId(ent.id)}
                    className="cursor-pointer group"
                  >
                    <circle
                      cx={nodeX}
                      cy={nodeY}
                      r={isSelected ? 26 : 22}
                      fill={nodeFill}
                      stroke={isSelected ? '#38bdf8' : '#64748b'}
                      strokeWidth={isSelected ? '3' : '1.5'}
                      className="transition-all"
                    />
                    <text
                      x={nodeX}
                      y={nodeY + 3}
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {ent.name.slice(0, 8)}
                    </text>
                    {/* Outer label */}
                    <text
                      x={nodeX}
                      y={nodeY + (nodeY > centerY ? 36 : -30)}
                      fill={isSelected ? '#38bdf8' : '#e2e8f0'}
                      fontSize="10"
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      textAnchor="middle"
                    >
                      {ent.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Node Inspector Details Panel */}
          <div className="lg:col-span-4 bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
            {activeEntity ? (
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded uppercase tracking-wider">
                      {activeEntity.type}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        activeEntity.targetSiteCoverage === 'Comprehensive' || activeEntity.targetSiteCoverage === 'Covered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : activeEntity.targetSiteCoverage === 'Partial' || activeEntity.targetSiteCoverage === 'Partially covered'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {activeEntity.targetSiteCoverage}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mt-1.5">{activeEntity.name}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {activeEntity.relationshipToMainTopic}
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px] font-semibold uppercase">
                      Recommended Placement:
                    </span>
                    <span className="font-semibold text-slate-900 block mt-0.5">
                      {activeEntity.recommendedContentPlacement}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px] font-semibold uppercase">
                      Centrality & Importance:
                    </span>
                    <span className="font-semibold text-slate-800 block mt-0.5">
                      {activeEntity.importance} Entity
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px] font-semibold uppercase">
                      Competitor Coverage:
                    </span>
                    <span className="text-slate-700 block mt-0.5">
                      {activeEntity.competitorCoverage}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px] font-semibold uppercase">
                      Citation Frequency:
                    </span>
                    <span className="font-bold text-teal-800 block mt-0.5">
                      Cited in {activeEntity.citationFrequency} searches
                    </span>
                  </div>

                  {activeEntity.missingContextualRelationships && (
                    <div>
                      <span className="text-slate-400 block text-[11px] font-semibold uppercase">
                        Missing Context / Opportunities:
                      </span>
                      <p className="text-amber-800 bg-amber-50 p-2 rounded border border-amber-200 text-[11px] mt-0.5 leading-relaxed">
                        {activeEntity.missingContextualRelationships}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs">
                Select an entity to view relationships.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Searchable Entity Catalog Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-600" /> Complete Entity & Topic Inventory ({filteredEntities.length})
            </h3>
            <p className="text-xs text-slate-500">
              Filter by entity type, target coverage status, or search names
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search entities..."
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
            />

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 outline-none"
            >
              <option value="all">All Entity Types</option>
              {types.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 min-w-[180px]">Entity Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 min-w-[220px]">Relationship to Seed / Audience</th>
                <th className="py-3 px-4 text-center">Target Coverage</th>
                <th className="py-3 px-4 text-center">Citation Freq</th>
                <th className="py-3 px-4 min-w-[200px]">Recommended Placement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredEntities.map((ent) => (
                <tr
                  key={ent.id}
                  onClick={() => setActiveEntityId(ent.id)}
                  className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                    activeEntityId === ent.id ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <td className="py-3 px-4 font-bold text-slate-900">{ent.name}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-800 border border-slate-200">
                      {ent.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 leading-relaxed">
                    {ent.relationshipToMainTopic}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        ent.targetSiteCoverage === 'Comprehensive' || ent.targetSiteCoverage === 'Covered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ent.targetSiteCoverage === 'Partial' || ent.targetSiteCoverage === 'Partially covered'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {ent.targetSiteCoverage}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-teal-800">
                    {ent.citationFrequency}
                  </td>
                  <td className="py-3 px-4 text-slate-800 font-medium">
                    {ent.recommendedContentPlacement}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
