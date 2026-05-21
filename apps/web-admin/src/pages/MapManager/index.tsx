import { mapManagerStyles as styles } from './MapManager.styles';
import { useMapManager } from './MapManager.hooks';
import { CitiesTab, MapsTab } from './components/TabPanels';
import { CreateMapModal, AssignMapModal } from './components/Modals';
import { TilePalette } from './components/TilePalette';
import { MapEditorCanvas } from './components/MapEditorCanvas';
import { Plus, MapPin, Map, Save, ArrowLeft, RefreshCw, Info } from 'lucide-react';

export default function MapManager() {
  const {
    // Tab
    activeTab, setActiveTab,
    // Cities
    cities, loadingCities, citiesSearch, setCitiesSearch,
    citiesPage, setCitiesPage, citiesTotalPages, citiesTotalCount,
    handleSearchSubmit,
    // Maps
    customMaps, loadingMaps,
    // Create Map Modal
    isCreateModalOpen, setIsCreateModalOpen, newMapName, setNewMapName, newMapGridSize, setNewMapGridSize,
    handleCreateMap, handleDeleteMap,
    // Assign Modal
    isAssignModalOpen, setIsAssignModalOpen, assigningDistrict, assigningMapId, setAssigningMapId,
    openAssignModal, handleSaveAssignment,
    // Editor
    editingMap, enterDesignMode, exitDesignMode,
    sortedCells, savingMap, handleSaveDesign,
    activeTool, setActiveTool, activeTileType, setActiveTileType,
    activeRotation,
    pickedUpItem, setPickedUpItem, hoveredCell, setHoveredCell,
    selectedCell, setSelectedCell,
    rotateSelectedCell, moveSelectedCell, removeSelectedCell,
    updateSelectedCellProperties,
    alertMsg,
    activeLayerFilter, setActiveLayerFilter,
    // Models
    modelAssets, modelCategories, activePaletteCategory, setActivePaletteCategory,
    // Helpers
    gridSize, tileWidth,
    getIsoCoords, checkFootprintFit,
    getBuildingParamsLocal, getBuildingPivotToRenderAt,
    handleCellClick,
  } = useMapManager();

  // ── EDITOR MODE ────────────────────────────────────────────────────────────
  if (editingMap) {
    return (
      <div style={styles.container}>
        {/* Editor header */}
        <div style={styles.editorHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={exitDesignMode} style={styles.backBtn}>
              <ArrowLeft size={16} /> Geri Dön
            </button>
            <div>
              <h2 style={styles.editorTitle}>{editingMap.name} Haritasını Tasarla</h2>
              <p style={styles.editorSubtitle}>Boyut: {gridSize}x{gridSize} izometrik koordinatlar</p>
            </div>
          </div>

          <button onClick={handleSaveDesign} disabled={savingMap} style={styles.saveBtn}>
            {savingMap
              ? <><RefreshCw className="animate-spin" size={16} style={{ marginRight: '8px' }} />Tasarım Kaydediliyor...</>
              : <><Save size={16} style={{ marginRight: '8px' }} />Tasarımı Kaydet</>
            }
          </button>
        </div>

        {/* Alert */}
        {alertMsg && (
          <div style={{
            ...styles.alert,
            backgroundColor: alertMsg.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            borderColor: alertMsg.type === 'success' ? '#10b981' : '#ef4444',
            color: alertMsg.type === 'success' ? '#10b981' : '#ef4444',
          }}>
            <Info size={16} style={{ marginRight: '8px' }} />
            <span>{alertMsg.text}</span>
          </div>
        )}

        {/* Editor body */}
        <div style={styles.editorBody}>
          <TilePalette
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            setPickedUpItem={setPickedUpItem}
            pickedUpItem={pickedUpItem}
            activeTileType={activeTileType}
            setActiveTileType={setActiveTileType}
            activePaletteCategory={activePaletteCategory}
            setActivePaletteCategory={setActivePaletteCategory}
            modelCategories={modelCategories}
            modelAssets={modelAssets}
            selectedCell={selectedCell}
            setSelectedCell={setSelectedCell}
            updateSelectedCellProperties={updateSelectedCellProperties}
          />

          <MapEditorCanvas
            gridSize={gridSize}
            tileWidth={tileWidth}
            tileHeight={tileWidth / 2}
            sortedCells={sortedCells}
            activeTool={activeTool}
            activeTileType={activeTileType}
            activeRotation={activeRotation}
            pickedUpItem={pickedUpItem}
            hoveredCell={hoveredCell}
            setHoveredCell={setHoveredCell}
            modelAssets={modelAssets}
            getIsoCoords={getIsoCoords}
            checkFootprintFit={checkFootprintFit}
            getBuildingParamsLocal={getBuildingParamsLocal}
            getBuildingPivotToRenderAt={getBuildingPivotToRenderAt}
            handleCellClick={handleCellClick}
            selectedCell={selectedCell}
            setSelectedCell={setSelectedCell}
            activeLayerFilter={activeLayerFilter}
            setActiveLayerFilter={setActiveLayerFilter}
            rotateSelectedCell={rotateSelectedCell}
            moveSelectedCell={moveSelectedCell}
            removeSelectedCell={removeSelectedCell}
          />
        </div>
      </div>
    );
  }

  // ── MAIN MODE ─────────────────────────────────────────────────────────────
  return (
    <div style={styles.container}>
      {/* Header card with tabs */}
      <div style={styles.headerCard}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={styles.mapIconCircle}>🗺️</div>
            <div>
              <h2 style={styles.title}>Harita Yönetim Paneli</h2>
              <p style={styles.subtitle}>İlçelerin coğrafi harita şablonlarını oluşturun ve atamaları yönetin.</p>
            </div>
          </div>

          {activeTab === 'maps' && (
            <button onClick={() => setIsCreateModalOpen(true)} style={styles.actionBtn}>
              <Plus size={18} style={{ marginRight: '6px' }} /> Harita Oluştur
            </button>
          )}
        </div>

        {/* Tab buttons */}
        <div style={styles.tabsContainer}>
          {[
            { key: 'cities', label: 'Şehirler (İlçeler)', icon: <MapPin size={16} style={{ marginRight: '6px' }} /> },
            { key: 'maps',   label: 'Şablon Haritalar',   icon: <Map    size={16} style={{ marginRight: '6px' }} /> },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key as 'cities' | 'maps'); setCitiesPage(1); }}
              style={{
                ...styles.tabBtn,
                borderBottomColor: activeTab === tab.key ? '#2563eb' : 'transparent',
                color: activeTab === tab.key ? '#2563eb' : '#94a3b8',
                fontWeight: activeTab === tab.key ? '700' : '500',
              }}
            >
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        {alertMsg && (
          <div style={{
            ...styles.alert,
            backgroundColor: alertMsg.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            borderColor: alertMsg.type === 'success' ? '#10b981' : '#ef4444',
            color: alertMsg.type === 'success' ? '#10b981' : '#ef4444',
          }}>
            <Info size={16} style={{ marginRight: '8px' }} />
            <span>{alertMsg.text}</span>
          </div>
        )}
      </div>

      {/* Tab content */}
      {activeTab === 'cities' && (
        <CitiesTab
          cities={cities}
          loadingCities={loadingCities}
          citiesSearch={citiesSearch}
          setCitiesSearch={setCitiesSearch}
          citiesPage={citiesPage}
          setCitiesPage={setCitiesPage}
          citiesTotalPages={citiesTotalPages}
          citiesTotalCount={citiesTotalCount}
          handleSearchSubmit={handleSearchSubmit}
          openAssignModal={openAssignModal}
        />
      )}

      {activeTab === 'maps' && (
        <MapsTab
          customMaps={customMaps}
          loadingMaps={loadingMaps}
          enterDesignMode={enterDesignMode}
          handleDeleteMap={handleDeleteMap}
        />
      )}

      {/* Modals */}
      {isCreateModalOpen && (
        <CreateMapModal
          newMapName={newMapName}
          setNewMapName={setNewMapName}
          newMapGridSize={newMapGridSize}
          setNewMapGridSize={setNewMapGridSize}
          onSubmit={handleCreateMap}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}

      {isAssignModalOpen && assigningDistrict && (
        <AssignMapModal
          district={assigningDistrict}
          customMaps={customMaps}
          assigningMapId={assigningMapId}
          setAssigningMapId={setAssigningMapId}
          onSave={handleSaveAssignment}
          onClose={() => setIsAssignModalOpen(false)}
        />
      )}
    </div>
  );
}
