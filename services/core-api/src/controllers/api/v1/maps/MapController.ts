import { Request, Response } from 'express';
import { MapService } from '../../../../services/maps/MapService';

export class MapController {
  /**
   * Belirli bir ilçenin harita tasarımını çeker (Şablon kalıtımı dahil).
   */
  static async getMapByDistrict(req: Request, res: Response) {
    try {
      const districtId = Number(req.params.districtId);
      if (isNaN(districtId)) {
        return res.status(400).json({ success: false, message: 'Geçersiz ilçe kimliği.' });
      }

      const mapData = await MapService.getMapByDistrictId(districtId);

      if (!mapData) {
        return res.status(404).json({ success: false, message: 'Bu ilçe için özel harita tasarımı bulunamadı.' });
      }

      return res.status(200).json({
        success: true,
        data: mapData
      });
    } catch (error: any) {
      console.error('getMapByDistrict hatası:', error);
      return res.status(500).json({ success: false, message: 'Harita verisi çekilirken sunucu hatası oluştu.' });
    }
  }

  /**
   * Belirli bir ilçe için harita tasarımını veritabanına kaydeder veya günceller (lokal override).
   */
  static async saveMap(req: Request, res: Response) {
    try {
      const { districtId, gridCells } = req.body;

      if (!districtId || !Array.isArray(gridCells)) {
        return res.status(400).json({ success: false, message: 'Eksik veya geçersiz harita parametreleri.' });
      }

      const districtMap = await MapService.assignCustomMapToDistrict(Number(districtId), null);
      districtMap.gridCells = gridCells;
      
      const { AppDataSource } = require('../../../../config/database');
      const { DistrictMap } = require('../../../../models/maps/DistrictMap');
      const saved = await AppDataSource.getRepository(DistrictMap).save(districtMap);

      return res.status(200).json({
        success: true,
        message: 'Harita tasarımı başarıyla kaydedildi.',
        data: saved
      });
    } catch (error: any) {
      console.error('saveMap hatası:', error);
      return res.status(500).json({ success: false, message: 'Harita kaydedilirken sunucu hatası oluştu.' });
    }
  }

  /**
   * Tüm özel harita şablonlarını listeler.
   */
  static async getCustomMaps(req: Request, res: Response) {
    try {
      const customMaps = await MapService.getCustomMaps();
      return res.status(200).json({ success: true, data: customMaps });
    } catch (error: any) {
      console.error('getCustomMaps hatası:', error);
      return res.status(500).json({ success: false, message: 'Harita şablonları listelenirken hata oluştu.' });
    }
  }

  /**
   * Yeni bir özel harita şablonu oluşturur.
   */
  static async createCustomMap(req: Request, res: Response) {
    try {
      const { name, gridSize } = req.body;
      if (!name || isNaN(Number(gridSize))) {
        return res.status(400).json({ success: false, message: 'Eksik veya geçersiz şablon parametreleri.' });
      }

      const customMap = await MapService.createCustomMap(name, Number(gridSize));
      return res.status(201).json({
        success: true,
        message: 'Harita şablonu başarıyla oluşturuldu.',
        data: customMap
      });
    } catch (error: any) {
      console.error('createCustomMap hatası:', error);
      return res.status(500).json({ success: false, message: error.message || 'Harita şablonu oluşturulamadı.' });
    }
  }

  /**
   * Belirli bir harita şablonunu detaylı olarak çeker.
   */
  static async getCustomMapById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const customMap = await MapService.getCustomMapById(id);
      if (!customMap) {
        return res.status(404).json({ success: false, message: 'Harita şablonu bulunamadı.' });
      }
      return res.status(200).json({ success: true, data: customMap });
    } catch (error: any) {
      console.error('getCustomMapById hatası:', error);
      return res.status(500).json({ success: false, message: 'Harita şablonu çekilirken hata oluştu.' });
    }
  }

  /**
   * Bir harita şablonunun çizim verilerini kaydeder/günceller.
   */
  static async updateCustomMap(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { gridCells } = req.body;
      if (!Array.isArray(gridCells)) {
        return res.status(400).json({ success: false, message: 'Geçersiz harita çizim verileri.' });
      }

      const customMap = await MapService.updateCustomMap(id, gridCells);
      return res.status(200).json({
        success: true,
        message: 'Harita şablonu başarıyla güncellendi.',
        data: customMap
      });
    } catch (error: any) {
      console.error('updateCustomMap hatası:', error);
      return res.status(500).json({ success: false, message: error.message || 'Şablon güncellenemedi.' });
    }
  }

  /**
   * Bir harita şablonunu siler.
   */
  static async deleteCustomMap(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await MapService.deleteCustomMap(id);
      return res.status(200).json({
        success: true,
        message: 'Harita şablonu başarıyla silindi.'
      });
    } catch (error: any) {
      console.error('deleteCustomMap hatası:', error);
      return res.status(500).json({ success: false, message: error.message || 'Şablon silinemedi.' });
    }
  }

  /**
   * Bir ilçeye harita şablonu atar.
   */
  static async assignMapToDistrict(req: Request, res: Response) {
    try {
      const { districtId, customMapId } = req.body;
      if (isNaN(Number(districtId))) {
        return res.status(400).json({ success: false, message: 'Geçersiz ilçe kimliği.' });
      }

      const result = await MapService.assignCustomMapToDistrict(Number(districtId), customMapId || null);
      return res.status(200).json({
        success: true,
        message: 'Harita şablonu ilçeye başarıyla atandı.',
        data: result
      });
    } catch (error: any) {
      console.error('assignMapToDistrict hatası:', error);
      return res.status(500).json({ success: false, message: error.message || 'Atama işlemi başarısız oldu.' });
    }
  }

  /**
   * Yönetici paneli için ilçeleri, ikamet edenleri ve harita durumlarını listeler.
   */
  static async getAdminDistricts(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const search = req.query.search ? String(req.query.search) : undefined;

      const result = await MapService.getAdminDistricts(page, limit, search);
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('getAdminDistricts hatası:', error);
      return res.status(500).json({ success: false, message: 'İlçe verileri listelenirken hata oluştu.' });
    }
  }
}
