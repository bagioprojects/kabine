import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';

export interface ModelCategory {
  id: string;
  name: string;
  createdAt: string;
}

export interface ModelAsset {
  id: string;
  name: string;
  modelType: string;
  fileUrl: string;
  textureUrl: string | null;
  thumbnailUrl?: string | null;
  gridSizeX: number;
  gridSizeY: number;
  scale: number;
  isResizable: boolean;
  categoryId: string;
  category: ModelCategory;
  createdAt: string;
}

const API_BASE = 'http://localhost:3000/api/v1/admin';
const ITEMS_PER_PAGE = 10;

function getHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('adminToken')}` };
}

export function useModelManager() {
  // ── Data ──────────────────────────────────────────────────────────────────
  const [categories, setCategories] = useState<ModelCategory[]>([]);
  const [assets, setAssets]         = useState<ModelAsset[]>([]);
  const [loading, setLoading]       = useState(true);

  // ── Toast ─────────────────────────────────────────────────────────────────
  const [errorMsg, setErrorMsg]     = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // ── Category CRUD ─────────────────────────────────────────────────────────
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName]         = useState('');
  const [savingCategory, setSavingCategory]           = useState(false);

  // ── Asset Upload Modal ────────────────────────────────────────────────────
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [assetName, setAssetName]     = useState('');
  const [modelType, setModelType]     = useState('glb');
  const [gridSizeX, setGridSizeX]     = useState(1);
  const [gridSizeY, setGridSizeY]     = useState(1);
  const [scale, setScale]             = useState(1.0);
  const [isResizable, setIsResizable] = useState(true);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [modelFile, setModelFile]     = useState<File | null>(null);
  const [textureFile, setTextureFile] = useState<File | null>(null);
  const [uploadingAsset, setUploadingAsset] = useState(false);

  // ── Asset Edit Modal ──────────────────────────────────────────────────────
  const [editingAsset, setEditingAsset]         = useState<ModelAsset | null>(null);
  const [editAssetName, setEditAssetName]       = useState('');
  const [editCategoryId, setEditCategoryId]     = useState('');
  const [editGridSizeX, setEditGridSizeX]       = useState(1);
  const [editGridSizeY, setEditGridSizeY]       = useState(1);
  const [editScale, setEditScale]               = useState(1.0);
  const [editIsResizable, setEditIsResizable]   = useState(true);
  const [editThumbnailUrl, setEditThumbnailUrl] = useState('');
  const [editModelFile, setEditModelFile]       = useState<File | null>(null);
  const [editTextureFile, setEditTextureFile]   = useState<File | null>(null);
  const [removeTexture, setRemoveTexture]       = useState(false);
  const [savingEdit, setSavingEdit]             = useState(false);

  // ── Info & Preview Modals ─────────────────────────────────────────────────
  const [isInfoModalOpen, setIsInfoModalOpen]   = useState(false);
  const [previewingAsset, setPreviewingAsset]   = useState<ModelAsset | null>(null);

  // ── Search & Pagination ───────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [catRes, assetRes] = await Promise.all([
        axios.get(`${API_BASE}/model-categories`, { headers: getHeaders() }),
        axios.get(`${API_BASE}/model-assets`,      { headers: getHeaders() }),
      ]);
      if (catRes.data.success) {
        setCategories(catRes.data.data);
        if (catRes.data.data.length > 0 && !selectedCategoryId) {
          setSelectedCategoryId(catRes.data.data[0].id);
        }
      }
      if (assetRes.data.success) {
        setAssets(assetRes.data.data);
      }
    } catch (err: any) {
      console.error(err);
      showToast('Veriler sunucudan çekilirken hata oluştu.', 'error');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setCurrentPage(1); }, [selectedCategoryId, searchQuery]);

  // ── Toast helper ──────────────────────────────────────────────────────────
  const showToast = useCallback((text: string, type: 'success' | 'error') => {
    if (type === 'success') {
      setSuccessMsg(text);
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setErrorMsg(text);
      setTimeout(() => setErrorMsg(null), 5000);
    }
  }, []);

  // ── Category handlers ─────────────────────────────────────────────────────
  const handleCreateCategory = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setSavingCategory(true);
    try {
      const res = await axios.post(`${API_BASE}/model-categories`,
        { name: newCategoryName.trim() },
        { headers: getHeaders() }
      );
      if (res.data.success) {
        showToast('Kategori başarıyla oluşturuldu.', 'success');
        const newCat: ModelCategory = res.data.data;
        setCategories(prev => [...prev, newCat]);
        setSelectedCategoryId(newCat.id);
        setNewCategoryName('');
        setIsCategoryModalOpen(false);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Kategori oluşturulurken hata.', 'error');
    } finally {
      setSavingCategory(false);
    }
  }, [newCategoryName, showToast]);

  const handleDeleteCategory = useCallback(async (id: string, name: string) => {
    if (!window.confirm(`"${name}" kategorisini silmek istediğinize emin misiniz?\nBu kategori altındaki tüm modeller kalıcı silinecektir!`)) return;
    try {
      const res = await axios.delete(`${API_BASE}/model-categories/${id}`, { headers: getHeaders() });
      if (res.data.success) {
        showToast('Kategori silindi.', 'success');
        setAssets(prev => prev.filter(a => a.categoryId !== id));
        setCategories(prev => {
          const remaining = prev.filter(c => c.id !== id);
          if (selectedCategoryId === id) {
            setSelectedCategoryId(remaining.length > 0 ? remaining[0].id : '');
          }
          return remaining;
        });
      }
    } catch {
      showToast('Kategori silinirken hata oluştu.', 'error');
    }
  }, [selectedCategoryId, showToast]);

  // ── Asset upload ──────────────────────────────────────────────────────────
  const resetUploadForm = useCallback(() => {
    setAssetName('');
    setModelFile(null);
    setTextureFile(null);
    setThumbnailUrl('');
    setGridSizeX(1);
    setGridSizeY(1);
    setScale(1.0);
    setModelType('glb');
    // Clear file inputs via DOM
    (['uploadModelFileInput', 'uploadTextureFileInput'] as const).forEach(id => {
      const el = document.getElementById(id) as HTMLInputElement | null;
      if (el) el.value = '';
    });
  }, []);

  const handleUploadAsset = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetName.trim()) { showToast('Model adı girmelisiniz.', 'error'); return; }
    if (!selectedCategoryId) { showToast('Lütfen bir kategori seçin.', 'error'); return; }
    if (!modelFile) { showToast('Lütfen bir model dosyası (.glb, .fbx, .obj) seçin.', 'error'); return; }

    setUploadingAsset(true);
    const formData = new FormData();
    formData.append('name', assetName.trim());
    formData.append('categoryId', selectedCategoryId);
    formData.append('modelType', modelType);
    formData.append('gridSizeX', String(gridSizeX));
    formData.append('gridSizeY', gridSizeY.toString());
    formData.append('scale', scale.toString());
    formData.append('isResizable', isResizable.toString());
    formData.append('thumbnailUrl', thumbnailUrl.trim());
    formData.append('modelFile', modelFile);
    if (textureFile) formData.append('textureFile', textureFile);

    try {
      const res = await axios.post(`${API_BASE}/model-assets`, formData, {
        headers: { ...getHeaders(), 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        showToast('Model başarıyla yüklendi.', 'success');
        setAssets(prev => [...prev, res.data.data]);
        resetUploadForm();
        setIsUploadModalOpen(false);
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Model yüklenirken sunucu hatası oluştu.', 'error');
    } finally {
      setUploadingAsset(false);
    }
  }, [assetName, selectedCategoryId, modelType, gridSizeX, gridSizeY, scale, modelFile, textureFile, showToast, resetUploadForm]);

  const handleModelFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setModelFile(file);
    const lower = file.name.toLowerCase();
    if (lower.endsWith('.glb'))      setModelType('glb');
    else if (lower.endsWith('.fbx')) setModelType('fbx');
    else if (lower.endsWith('.obj')) setModelType('obj');
    setAssetName(prev => {
      if (!prev.trim()) {
        const dot = file.name.lastIndexOf('.');
        const base = dot !== -1 ? file.name.substring(0, dot) : file.name;
        return base.replace(/[_-]/g, ' ');
      }
      return prev;
    });
  }, []);

  // ── Asset edit ────────────────────────────────────────────────────────────
  const handleOpenEditModal = useCallback((asset: ModelAsset) => {
    setEditingAsset(asset);
    setEditAssetName(asset.name);
    setEditCategoryId(asset.categoryId);
    setEditGridSizeX(asset.gridSizeX);
    setEditGridSizeY(asset.gridSizeY);
    setEditScale(asset.scale);
    setEditIsResizable(asset.isResizable !== undefined ? asset.isResizable : true);
    setEditThumbnailUrl(asset.thumbnailUrl || '');
    setEditModelFile(null);
    setEditTextureFile(null);
    setRemoveTexture(false);
  }, []);

  const handleUpdateAsset = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAsset) return;
    if (!editAssetName.trim()) { showToast('Model adı boş olamaz.', 'error'); return; }
    setSavingEdit(true);

    const formData = new FormData();
    formData.append('name', editAssetName.trim());
    formData.append('categoryId', editCategoryId);
    formData.append('gridSizeX', String(editGridSizeX));
    formData.append('gridSizeY', editGridSizeY.toString());
    formData.append('scale', editScale.toString());
    formData.append('isResizable', editIsResizable.toString());
    formData.append('thumbnailUrl', editThumbnailUrl.trim());
    if (editModelFile)   formData.append('modelFile', editModelFile);
    if (editTextureFile) formData.append('textureFile', editTextureFile);
    if (removeTexture)   formData.append('removeTexture', 'true');

    try {
      const res = await axios.put(`${API_BASE}/model-assets/${editingAsset.id}`, formData, {
        headers: { ...getHeaders(), 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        showToast('Model başarıyla güncellendi.', 'success');
        setAssets(prev => prev.map(a => a.id === editingAsset.id ? res.data.data : a));
        setEditingAsset(null);
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Model güncellenirken hata oluştu.', 'error');
    } finally {
      setSavingEdit(false);
    }
  }, [editingAsset, editAssetName, editCategoryId, editGridSizeX, editGridSizeY, editScale, editModelFile, editTextureFile, removeTexture, showToast]);

  const handleDeleteAsset = useCallback(async (id: string, name: string) => {
    if (!window.confirm(`"${name}" modelini silmek istediğinize emin misiniz?`)) return;
    try {
      const res = await axios.delete(`${API_BASE}/model-assets/${id}`, { headers: getHeaders() });
      if (res.data.success) {
        showToast('Model silindi.', 'success');
        setAssets(prev => prev.filter(a => a.id !== id));
      }
    } catch {
      showToast('Model silinirken hata oluştu.', 'error');
    }
  }, [showToast]);

  // ── Derived / Memoized ────────────────────────────────────────────────────
  const filteredAssets = useMemo(() =>
    assets.filter(a =>
      a.categoryId === selectedCategoryId &&
      a.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  [assets, selectedCategoryId, searchQuery]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredAssets.length / ITEMS_PER_PAGE)), [filteredAssets]);

  const paginatedAssets = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAssets.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAssets, currentPage]);

  // ── Return ────────────────────────────────────────────────────────────────
  return {
    // Data
    categories, assets, setAssets, fetchData, loading,
    errorMsg, successMsg,
    // Category
    selectedCategoryId, setSelectedCategoryId,
    isCategoryModalOpen, setIsCategoryModalOpen,
    newCategoryName, setNewCategoryName,
    savingCategory,
    handleCreateCategory, handleDeleteCategory,
    // Upload Modal
    isUploadModalOpen, setIsUploadModalOpen,
    assetName, setAssetName,
    modelType, setModelType,
    gridSizeX, setGridSizeX,
    gridSizeY, setGridSizeY,
    scale, setScale,
    isResizable, setIsResizable,
    thumbnailUrl, setThumbnailUrl,
    modelFile, setModelFile,
    textureFile, setTextureFile,
    uploadingAsset,
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
    editModelFile, setEditModelFile,
    editTextureFile, setEditTextureFile,
    removeTexture, setRemoveTexture,
    savingEdit,
    handleOpenEditModal, handleUpdateAsset, handleDeleteAsset,
    // Info & Preview
    isInfoModalOpen, setIsInfoModalOpen,
    previewingAsset, setPreviewingAsset,
    // Search & Pagination
    searchQuery, setSearchQuery,
    currentPage, setCurrentPage,
    totalPages, paginatedAssets,
    filteredAssets,
    ITEMS_PER_PAGE,
  };
}
