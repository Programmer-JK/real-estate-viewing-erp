'use client'

import { useState, useMemo } from 'react'
import { BottomTabBar, type TabId } from './bottom-tab-bar'
import { PropertyListTab } from './tabs/property-list-tab'
import { ScheduleTab } from './tabs/schedule-tab'
import { CompareTab } from './tabs/compare-tab'
import { SettingsTab } from './tabs/settings-tab'
import { PropertyDetailView } from './property-detail-view'
import { usePropertyStore } from '@/lib/store'
import { calculateScore } from '@/lib/scoring'
import type { Property, ScorePreset } from '@/lib/types'

export function RealEstateApp({ onLogout }: { onLogout?: () => void }) {
  const [activeTab, setActiveTab] = useState<TabId>('list')
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)

  const {
    properties,
    scorePreset,
    setScorePreset,
    compareIds,
    isLoaded,
    addProperty,
    updateProperty,
    deleteProperty,
    toggleCompare,
    resetData,
  } = usePropertyStore()

  // Calculate scores for all properties
  const propertiesWithScores = useMemo(() => {
    return properties.map(property => ({
      property,
      score: calculateScore(property, scorePreset)
    }))
  }, [properties, scorePreset])

  const selectedProperty = useMemo(() => {
    if (!selectedPropertyId) return null
    return properties.find(p => p.id === selectedPropertyId) || null
  }, [properties, selectedPropertyId])

  const handleOpenDetail = (propertyId: string) => {
    setSelectedPropertyId(propertyId)
  }

  const handleCloseDetail = () => {
    setSelectedPropertyId(null)
  }

  const handleSaveProperty = (updatedProperty: Property) => {
    updateProperty(updatedProperty.id, updatedProperty)
  }

  const handleToggleCompare = (propertyId: string): boolean => {
    return toggleCompare(propertyId)
  }

  const handlePresetChange = (preset: ScorePreset) => {
    setScorePreset(preset)
  }

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (selectedProperty) {
    return (
      <PropertyDetailView
        property={selectedProperty}
        scorePreset={scorePreset}
        onSave={handleSaveProperty}
        onClose={handleCloseDetail}
        onDelete={() => {
          deleteProperty(selectedProperty.id)
          handleCloseDetail()
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="mx-auto max-w-lg">
        {activeTab === 'list' && (
          <PropertyListTab
            propertiesWithScores={propertiesWithScores}
            compareIds={compareIds}
            onOpenDetail={handleOpenDetail}
            onAddProperty={addProperty}
            onDeleteProperty={deleteProperty}
            onToggleCompare={handleToggleCompare}
          />
        )}

        {activeTab === 'schedule' && (
          <ScheduleTab
            properties={properties}
            onOpenDetail={handleOpenDetail}
          />
        )}

        {activeTab === 'compare' && (
          <CompareTab
            properties={properties}
            compareIds={compareIds}
            scorePreset={scorePreset}
            onToggleCompare={handleToggleCompare}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            scorePreset={scorePreset}
            onPresetChange={handlePresetChange}
            onResetData={resetData}
            onLogout={onLogout}
          />
        )}
      </div>

      <BottomTabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        compareCount={compareIds.length}
      />
    </div>
  )
}
