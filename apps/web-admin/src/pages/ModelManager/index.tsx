import { styles } from './ModelManager.styles';
import { useModelManager } from './ModelManager.hooks';
import { AssetCard } from './components/AssetCard';
import { InfoModal } from './components/InfoModal';
import { PreviewModal } from './components/PreviewModal';
import { EditModal } from './components/EditModal';
import {
  FolderPlus, Trash2, Upload, Layers, RefreshCw, Box,
  AlertCircle, CheckCircle2, Info, Search, ChevronLeft,
  ChevronRight, Plus, ChevronsLeft, ChevronsRight, X, Package
} from 'lucide-react';

export default function ModelManager() {
  const {
    categories, assets, setAssets, loading, errorMsg, successMsg,
    // Category
    selectedCategoryId, setSelectedCategoryId,
    isCategoryModalOpen, setIsCategoryModalOpen,
    newCategoryName, setNewCategoryName, savingCategory,
    handleCreateCategory, handleDeleteCategory,
    // Upload Modal
    isUploadModalOpen, setIsUploadModalOpen,
    assetName, setAssetName,
    gridSizeX, setGridSizeX,
    gridSizeY, setGridSizeY,
    scale, setScale,
    isResizable, setIsResizable,
    thumbnailUrl, setThumbnailUrl,
    setTextureFile, uploadingAsset,
    handleUploadAsset, handleModelFileChange,
    // Edit
    editingAsset, setEditingAsset,
    editAssetName, setEditAssetName,
    editCategoryId, setEditCategoryId,
    editGridSizeX, setEditGridSizeX,
    editGridSizeY, setEditGridSizeY,
    editScale, setEditScale,
    editIsResizable, setEditIsResizable,
    editThumbnailUrl, setEditThumbnailUrl,
    setEditModelFile, setEditTextureFile,
    removeTexture, setRemoveTexture, savingEdit,
    handleOpenEditModal, handleUpdateAsset, handleDeleteAsset,
    // Info & Preview
    isInfoModalOpen, setIsInfoModalOpen,
    previewingAsset, setPreviewingAsset,
    // Search & Pagination
    searchQuery, setSearchQuery,
    currentPage, setCurrentPage,
    totalPages, paginatedAssets, filteredAssets,
  } = useModelManager();

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);

  return (
    <div style={styles.container}>

      {/* ── PAGE HEADER ─────────────────────────────────────────────── */}
      <div style={styles.header}>
        <div style={styles.titleArea}>
          <div style={styles.titleIconBox}>
            <Box size={24} color="#3b82f6" />
          </div>
          <div>
            <h2 style={styles.title}>3D Model &amp; Varlık Kütüphanesi</h2>
            <p style={styles.subtitle}>İzometrik harita editöründe kullanılacak 3D modelleri ve kategorileri yönetin.</p>
          </div>
        </div>

        {/* Header action buttons */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            style={{
              ...styles.submitBtn,
              padding: '10px 16px',
              backgroundColor: 'rgba(59, 130, 246, 0.12)',
              color: '#60a5fa',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              boxShadow: 'none',
            }}
          >
            <FolderPlus size={16} style={{ marginRight: '8px' }} />
            Kategori Ekle
          </button>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            disabled={categories.length === 0}
            style={{
              ...styles.submitBtn,
              padding: '10px 18px',
              backgroundColor: categories.length === 0 ? '#1e293b' : '#2563eb',
              cursor: categories.length === 0 ? 'not-allowed' : 'pointer',
              opacity: categories.length === 0 ? 0.5 : 1,
              boxShadow: categories.length === 0 ? 'none' : '0 4px 12px rgba(37, 99, 235, 0.35)',
            }}
          >
            <Plus size={16} style={{ marginRight: '8px' }} />
            Model Ekle
          </button>
        </div>
      </div>

      {/* ── TOAST NOTIFICATIONS ─────────────────────────────────────── */}
      {successMsg && (
        <div style={{ ...styles.alert, ...styles.alertSuccess }}>
          <CheckCircle2 size={16} /><span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div style={{ ...styles.alert, ...styles.alertError }}>
          <AlertCircle size={16} /><span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '16px' }}>
          <RefreshCw className="animate-spin" size={36} color="#3b82f6" />
          <span style={{ fontSize: '14px', color: '#94a3b8' }}>Model kütüphanesi yükleniyor...</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>

          {/* ── CATEGORY TABS (top) ────────────────────────────────────── */}
          <div style={{
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px 16px 0 0',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            overflowX: 'auto',
            borderBottom: 'none',
            backdropFilter: 'blur(8px)',
          }}>
            {categories.length === 0 ? (
              <div style={{ padding: '20px 0', fontSize: '13px', color: '#64748b' }}>
                Henüz kategori yok — sağ üstten "Kategori Ekle" diyerek başlayın.
              </div>
            ) : (
              categories.map(cat => {
                const count = assets.filter(a => a.categoryId === cat.id).length;
                const isActive = selectedCategoryId === cat.id;
                return (
                  <div
                    key={cat.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '16px 14px',
                      cursor: 'pointer',
                      borderBottom: `3px solid ${isActive ? '#3b82f6' : 'transparent'}`,
                      color: isActive ? '#ffffff' : '#64748b',
                      fontWeight: isActive ? '700' : '500',
                      fontSize: '13px',
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                    onClick={() => setSelectedCategoryId(cat.id)}
                  >
                    <Layers size={14} color={isActive ? '#3b82f6' : '#475569'} />
                    {cat.name}
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '20px',
                      backgroundColor: isActive ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.04)',
                      color: isActive ? '#60a5fa' : '#475569',
                      fontSize: '11px',
                      fontWeight: '700',
                    }}>
                      {count}
                    </span>
                    {/* Delete category button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id, cat.name); }}
                      title="Kategoriyi Sil"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: isActive ? '#ef4444' : '#475569',
                        cursor: 'pointer',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        borderRadius: '4px',
                        marginLeft: '2px',
                        opacity: 0.7,
                        transition: 'opacity 0.2s',
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* ── ASSET LIST PANEL (bottom) ──────────────────────────────── */}
          <div style={{
            backgroundColor: 'rgba(15, 23, 42, 0.35)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '0 0 16px 16px',
            padding: '24px',
            backdropFilter: 'blur(8px)',
          }}>

            {/* Toolbar: title + search */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              marginBottom: '20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Package size={18} color="#eab308" />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#ffffff' }}>
                  {selectedCategory?.name || 'Modeller'}
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  {filteredAssets.length} model
                  {filteredAssets.length !== assets.filter(a => a.categoryId === selectedCategoryId).length && ` (filtreli)`}
                </span>
              </div>

              {/* Search box */}
              <div style={styles.searchBox}>
                <Search size={14} color="#64748b" />
                <input
                  type="text"
                  placeholder="Model ismine göre ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={styles.searchInput}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0 4px', display: 'flex' }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Asset grid */}
            {categories.length === 0 ? (
              <div style={styles.noAssetsBox}>
                <FolderPlus size={40} color="#475569" style={{ marginBottom: '12px' }} />
                <span style={{ fontSize: '14px', color: '#64748b', display: 'block' }}>
                  Başlamak için önce bir kategori oluşturun.
                </span>
                <button
                  onClick={() => setIsCategoryModalOpen(true)}
                  style={{ ...styles.submitBtn, marginTop: '16px', padding: '10px 20px' }}
                >
                  <FolderPlus size={14} style={{ marginRight: '8px' }} /> Kategori Ekle
                </button>
              </div>
            ) : paginatedAssets.length === 0 ? (
              <div style={styles.noAssetsBox}>
                <Box size={40} color="#475569" style={{ marginBottom: '12px' }} />
                <span style={{ fontSize: '13px', color: '#64748b' }}>
                  {searchQuery
                    ? `"${searchQuery}" aramasına uygun model bulunamadı.`
                    : 'Bu kategoride henüz model yok. Sağ üstten "Model Ekle" ile başlayın.'}
                </span>
                {!searchQuery && (
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    style={{ ...styles.submitBtn, marginTop: '16px', padding: '10px 20px', backgroundColor: '#2563eb' }}
                  >
                    <Upload size={14} style={{ marginRight: '8px' }} /> Model Ekle
                  </button>
                )}
              </div>
            ) : (
              <>
                <div style={styles.assetsGrid}>
                  {paginatedAssets.map(a => (
                    <AssetCard
                      key={a.id}
                      asset={a}
                      onEdit={handleOpenEditModal}
                      onDelete={handleDeleteAsset}
                      onPreview={setPreviewingAsset}
                    />
                  ))}
                </div>

                {/* ── PAGINATION ─────────────────────────────────────────── */}
                {totalPages > 1 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: '28px',
                    paddingTop: '20px',
                    borderTop: '1px solid rgba(255,255,255,0.04)',
                  }}>
                    {/* First page */}
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      title="İlk Sayfa"
                      style={{
                        ...styles.pageBtn,
                        opacity: currentPage === 1 ? 0.35 : 1,
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <ChevronsLeft size={14} />
                    </button>
                    {/* Prev */}
                    <button
                      onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      style={{
                        ...styles.pageBtn,
                        opacity: currentPage === 1 ? 0.35 : 1,
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <ChevronLeft size={14} />
                    </button>

                    {/* Page numbers — sliding window */}
                    {(() => {
                      const window = 5;
                      let start = Math.max(1, currentPage - Math.floor(window / 2));
                      let end = Math.min(totalPages, start + window - 1);
                      if (end - start + 1 < window) start = Math.max(1, end - window + 1);
                      return Array.from({ length: end - start + 1 }, (_, i) => start + i).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          style={{
                            ...styles.pageBtn,
                            ...(currentPage === page ? {
                              backgroundColor: '#2563eb',
                              color: '#ffffff',
                              boxShadow: '0 0 12px rgba(37, 99, 235, 0.4)',
                              border: '1px solid #3b82f6',
                              fontWeight: '800',
                              transform: 'scale(1.05)',
                            } : {}),
                            minWidth: '36px',
                          }}
                        >
                          {page}
                        </button>
                      ));
                    })()}

                    {/* Next */}
                    <button
                      onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      style={{
                        ...styles.pageBtn,
                        opacity: currentPage === totalPages ? 0.35 : 1,
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <ChevronRight size={14} />
                    </button>
                    {/* Last page */}
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      title="Son Sayfa"
                      style={{
                        ...styles.pageBtn,
                        opacity: currentPage === totalPages ? 0.35 : 1,
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <ChevronsRight size={14} />
                    </button>

                    <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '8px' }}>
                      Sayfa {currentPage} / {totalPages}
                      &nbsp;·&nbsp; Toplam {filteredAssets.length} model
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ── ADD CATEGORY MODAL ───────────────────────────────────────── */}
      {isCategoryModalOpen && (
        <div style={styles.modalOverlay} onClick={() => setIsCategoryModalOpen(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Yeni Kategori Ekle</h3>
            </div>
            <form onSubmit={handleCreateCategory}>
              <div style={styles.modalBody}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Kategori Adı</label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Örn: Binalar, Altyapı, Ağaçlar..."
                    style={styles.input}
                    autoFocus
                    required
                  />
                </div>
              </div>
              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setIsCategoryModalOpen(false)} style={styles.modalCancelBtn}>
                  Vazgeç
                </button>
                <button type="submit" disabled={savingCategory} style={styles.modalSubmitBtn}>
                  {savingCategory ? <><RefreshCw className="animate-spin" size={13} style={{ marginRight: '6px', display: 'inline' }} />Oluşturuluyor...</> : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── UPLOAD MODEL MODAL ───────────────────────────────────────── */}
      {isUploadModalOpen && (
        <div style={styles.modalOverlay} onClick={() => !uploadingAsset && setIsUploadModalOpen(false)}>
          <div
            style={{ ...styles.modalContent, maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                <Upload size={18} style={{ marginRight: '10px', display: 'inline', color: '#10b981' }} />
                Yeni Model Yükle
              </h3>
            </div>

            <form onSubmit={handleUploadAsset}>
              <div style={{ ...styles.modalBody, display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Category select */}
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Kategori</label>
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    style={styles.select}
                    required
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Model Name */}
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Model Adı</label>
                  <input
                    type="text"
                    value={assetName}
                    onChange={(e) => setAssetName(e.target.value)}
                    placeholder="Örn: Modern Gökdelen, Sahil Parkı"
                    style={styles.input}
                    required
                  />
                </div>

                {/* Grid & Scale row */}
                <div style={styles.gridParamsRow}>
                  <div style={{ ...styles.inputGroup, flex: 1 }}>
                    <label style={styles.label}>Grid En (X)</label>
                    <input type="number" min="1" max="5" value={gridSizeX} onChange={(e) => setGridSizeX(Number(e.target.value))} style={styles.input} required />
                  </div>
                  <div style={{ ...styles.inputGroup, flex: 1 }}>
                    <label style={styles.label}>Grid Boy (Y)</label>
                    <input type="number" min="1" max="5" value={gridSizeY} onChange={(e) => setGridSizeY(Number(e.target.value))} style={styles.input} required />
                  </div>
                  <div style={{ ...styles.inputGroup, flex: 1 }}>
                    <label style={styles.label}>Ölçek (Scale)</label>
                    <input type="number" step="0.05" min="0.1" max="10.0" value={scale} onChange={(e) => setScale(Number(e.target.value))} style={styles.input} required />
                  </div>
                </div>

                <div style={{ ...styles.inputGroup, flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="isResizable"
                    checked={isResizable}
                    onChange={(e) => setIsResizable(e.target.checked)}
                    style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#10b981' }}
                  />
                  <label htmlFor="isResizable" style={{ ...styles.label, marginBottom: 0, cursor: 'pointer' }}>
                    Haritada Boyutlandırılabilir (Resizable)
                  </label>
                </div>

                {/* Thumbnail / Sprite URL */}
                <div style={styles.inputGroup}>
                  <label style={styles.label}>İzometrik Sprite URL (thumbnailUrl)</label>
                  <input
                    type="text"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    placeholder="Örn: https://example.com/sprite.png"
                    style={styles.input}
                  />
                  <div style={styles.fileHint}>Mobil uygulamada görünmesi için 2.5D İzometrik PNG resmi URL'si.</div>
                </div>

                {/* Model file */}
                <div style={styles.inputGroup}>
                  <label style={styles.label}>3D Model Dosyası (.glb, .fbx, .obj)</label>
                  <input
                    id="uploadModelFileInput"
                    type="file"
                    accept=".glb,.fbx,.obj"
                    onChange={handleModelFileChange}
                    style={styles.fileInput}
                    required
                  />
                  <div style={styles.fileHint}>En iyi performans için .glb formatı önerilir. Gömülü texture içeren .glb dosyaları daha iyi görünür.</div>
                </div>

                {/* Texture file */}
                <div style={styles.inputGroup}>
                  <div style={styles.labelRow}>
                    <label style={styles.label}>Kaplama Görseli (İsteğe Bağlı)</label>
                    <button type="button" onClick={() => setIsInfoModalOpen(true)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                      <Info size={14} />
                    </button>
                  </div>
                  <input
                    id="uploadTextureFileInput"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setTextureFile(e.target.files?.[0] || null)}
                    style={styles.fileInput}
                  />
                  <div style={styles.fileHint}>Modeliniz düz beyaz görünüyorsa doku görseli (.png, .jpg) yükleyin.</div>
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button type="button" onClick={() => !uploadingAsset && setIsUploadModalOpen(false)} style={styles.modalCancelBtn} disabled={uploadingAsset}>
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={uploadingAsset}
                  style={{
                    ...styles.modalSubmitBtn,
                    backgroundColor: uploadingAsset ? '#1e293b' : '#10b981',
                    boxShadow: uploadingAsset ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.3)',
                  }}
                >
                  {uploadingAsset
                    ? <><RefreshCw className="animate-spin" size={14} style={{ marginRight: '6px', display: 'inline' }} />Yükleniyor...</>
                    : <><Upload size={14} style={{ marginRight: '6px', display: 'inline' }} />Modeli Kaydet</>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT MODEL MODAL ─────────────────────────────────────────── */}
      <EditModal
        editingAsset={editingAsset}
        categories={categories}
        editAssetName={editAssetName}
        setEditAssetName={setEditAssetName}
        editCategoryId={editCategoryId}
        setEditCategoryId={setEditCategoryId}
        editGridSizeX={editGridSizeX}
        setEditGridSizeX={setEditGridSizeX}
        editGridSizeY={editGridSizeY}
        setEditGridSizeY={setEditGridSizeY}
        editScale={editScale}
        setEditScale={setEditScale}
        editIsResizable={editIsResizable}
        setEditIsResizable={setEditIsResizable}
        editThumbnailUrl={editThumbnailUrl}
        setEditThumbnailUrl={setEditThumbnailUrl}
        setEditModelFile={setEditModelFile}
        setEditTextureFile={setEditTextureFile}
        removeTexture={removeTexture}
        setRemoveTexture={setRemoveTexture}
        savingEdit={savingEdit}
        onClose={() => setEditingAsset(null)}
        onSubmit={handleUpdateAsset}
      />

      {/* ── TEXTURE INFO MODAL ───────────────────────────────────────── */}
      <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} />

      {/* ── 3D PREVIEW MODAL ─────────────────────────────────────────── */}
      <PreviewModal
        asset={previewingAsset}
        onClose={() => setPreviewingAsset(null)}
        onUpdateAsset={(updated) => {
          setAssets(prev => prev.map(a => a.id === updated.id ? updated : a));
          setPreviewingAsset(updated);
        }}
      />

    </div>
  );
}
