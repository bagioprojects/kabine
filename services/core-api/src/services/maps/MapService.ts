import { AppDataSource } from '../../config/database';
import { CustomMap } from '../../models/maps/CustomMap';
import { DistrictMap } from '../../models/maps/DistrictMap';
import { User } from '../../models/users/User';
import { DISTRICTS, PROVINCES } from '../../utils/locationData';

export class MapService {
  /**
   * Retrieves all custom map templates
   */
  public static async getCustomMaps(): Promise<CustomMap[]> {
    const customMapRepo = AppDataSource.getRepository(CustomMap);
    return await customMapRepo.find({ order: { name: 'ASC' } });
  }

  /**
   * Creates a new custom map template with a blank grass grid
   */
  public static async createCustomMap(name: string, gridSize: number): Promise<CustomMap> {
    if (!name || name.trim() === '') {
      throw new Error('Harita adı boş olamaz.');
    }
    if (![10, 15, 20].includes(gridSize)) {
      throw new Error('Geçersiz harita boyutu. Yalnızca 10x10, 15x15 veya 20x20 seçilebilir.');
    }

    const customMapRepo = AppDataSource.getRepository(CustomMap);
    
    // Pre-initialize grid with grass tiles
    const gridCells: any[] = [];
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        gridCells.push({
          row: r,
          col: c,
          type: 'grass',
          roadDirection: null,
          buildingId: null,
          isBuildingPivot: false,
          buildingAnchor: null
        });
      }
    }

    const customMap = new CustomMap();
    customMap.name = name.trim();
    customMap.gridSize = gridSize;
    customMap.gridCells = gridCells;

    return await customMapRepo.save(customMap);
  }

  /**
   * Finds a custom map template by ID
   */
  public static async getCustomMapById(id: string): Promise<CustomMap | null> {
    const customMapRepo = AppDataSource.getRepository(CustomMap);
    return await customMapRepo.findOne({ where: { id } });
  }

  /**
   * Saves the grid cell layout for a custom map template
   */
  public static async updateCustomMap(id: string, gridCells: any[]): Promise<CustomMap> {
    const customMapRepo = AppDataSource.getRepository(CustomMap);
    const customMap = await customMapRepo.findOne({ where: { id } });
    if (!customMap) {
      throw new Error('Harita şablonu bulunamadı.');
    }

    customMap.gridCells = gridCells;
    return await customMapRepo.save(customMap);
  }

  /**
   * Deletes a custom map template and clears references from districts
   */
  public static async deleteCustomMap(id: string): Promise<void> {
    const customMapRepo = AppDataSource.getRepository(CustomMap);
    const districtMapRepo = AppDataSource.getRepository(DistrictMap);

    const customMap = await customMapRepo.findOne({ where: { id } });
    if (!customMap) {
      throw new Error('Harita şablonu bulunamadı.');
    }

    // Set customMapId to null for all districts referencing this map
    await districtMapRepo.update({ customMapId: id }, { customMapId: null });

    // Delete custom map
    await customMapRepo.remove(customMap);
  }

  /**
   * Assigns a custom map template to a district
   */
  public static async assignCustomMapToDistrict(districtId: number, customMapId: string | null): Promise<DistrictMap> {
    const districtMapRepo = AppDataSource.getRepository(DistrictMap);
    
    // If a customMapId is specified, verify it exists
    if (customMapId) {
      const customMapRepo = AppDataSource.getRepository(CustomMap);
      const exists = await customMapRepo.count({ where: { id: customMapId } });
      if (exists === 0) {
        throw new Error('Atanmak istenen harita şablonu bulunamadı.');
      }
    }

    let districtMap = await districtMapRepo.findOne({ where: { districtId } });
    if (districtMap) {
      districtMap.customMapId = customMapId;
      // When pointing to a custom map, clear local override cells
      if (customMapId) {
        districtMap.gridCells = [];
      }
    } else {
      districtMap = new DistrictMap();
      districtMap.districtId = districtId;
      districtMap.customMapId = customMapId;
      districtMap.gridCells = [];
    }

    return await districtMapRepo.save(districtMap);
  }

  /**
   * Returns a paginated list of Turkey's 923 districts enriched with:
   * - Province Name
   * - Resident member counts (group by user citizenshipDistrictId)
   * - Map Assignment Status
   */
  public static async getAdminDistricts(page: number, limit: number, search?: string) {
    const userRepo = AppDataSource.getRepository(User);
    const districtMapRepo = AppDataSource.getRepository(DistrictMap);
    const customMapRepo = AppDataSource.getRepository(CustomMap);

    // 1. Fetch user residency counts (grouped by citizenshipDistrictId)
    const residencyStats = await userRepo
      .createQueryBuilder('user')
      .select('user.citizenshipDistrictId', 'districtId')
      .addSelect('COUNT(user.id)', 'count')
      .where('user.citizenshipDistrictId IS NOT NULL')
      .groupBy('user.citizenshipDistrictId')
      .getRawMany();

    const residencyMap: Record<number, number> = {};
    for (const stat of residencyStats) {
      residencyMap[Number(stat.districtId)] = Number(stat.count);
    }

    // 2. Fetch all mapped districts
    const dbDistrictMaps = await districtMapRepo.find();
    const mappedDistrictsMap: Record<number, { customMapId: string | null; hasGridCells: boolean }> = {};
    for (const dm of dbDistrictMaps) {
      mappedDistrictsMap[dm.districtId] = {
        customMapId: dm.customMapId,
        hasGridCells: Array.isArray(dm.gridCells) && dm.gridCells.length > 0
      };
    }

    // 3. Fetch custom maps to associate UUIDs with Names
    const customMaps = await customMapRepo.find();
    const customMapNames: Record<string, string> = {};
    for (const cm of customMaps) {
      customMapNames[cm.id] = cm.name;
    }

    // 4. Construct enriched list from static location data
    let enrichedList = DISTRICTS.map(d => {
      const province = PROVINCES.find(p => p.id === d.provinceId);
      const provinceName = province ? province.republicName : 'Bilinmeyen Devlet';
      const residentCount = residencyMap[d.id] || 0;
      
      const mapInfo = mappedDistrictsMap[d.id];
      let mapStatus = 'Yok';
      let assignedMapName: string | null = null;
      let assignedMapId: string | null = null;

      if (mapInfo) {
        if (mapInfo.customMapId) {
          assignedMapId = mapInfo.customMapId;
          assignedMapName = customMapNames[mapInfo.customMapId] || 'Bilinmeyen Şablon';
          mapStatus = `Haritası Var (${assignedMapName})`;
        } else if (mapInfo.hasGridCells) {
          mapStatus = 'Özel Tasarım (Haritası Var)';
        }
      }

      return {
        id: d.id,
        name: d.name,
        provinceId: d.provinceId,
        provinceName,
        residentCount,
        mapStatus,
        assignedMapId,
        assignedMapName
      };
    });

    // 5. Apply Search filter
    if (search && search.trim() !== '') {
      const s = search.toLowerCase().trim();
      enrichedList = enrichedList.filter(d => 
        d.name.toLowerCase().includes(s) || 
        d.provinceName.toLowerCase().includes(s)
      );
    }

    // 6. Paginate
    const total = enrichedList.length;
    const totalPages = Math.ceil(total / limit);
    const startIdx = (page - 1) * limit;
    const paginatedItems = enrichedList.slice(startIdx, startIdx + limit);

    return {
      items: paginatedItems,
      total,
      page,
      totalPages
    };
  }

  /**
   * Retrieves the gridCells for a given districtId, resolving template inheritance if assigned
   */
  public static async getMapByDistrictId(districtId: number): Promise<{ gridCells: any[]; customMapId: string | null; districtId: number } | null> {
    const districtMapRepo = AppDataSource.getRepository(DistrictMap);
    const districtMap = await districtMapRepo.findOne({ where: { districtId } });

    const getDefaultMap = async () => {
      const customMapRepo = AppDataSource.getRepository(CustomMap);
      const defaultMapId = '17ee57dc-ad4d-451f-8671-791f880eb35c';
      const defaultMap = await customMapRepo.findOne({ where: { id: defaultMapId } });
      
      if (defaultMap) {
        return {
          districtId,
          customMapId: defaultMapId,
          gridCells: defaultMap.gridCells
        };
      }
      return null;
    };

    if (!districtMap) {
      return await getDefaultMap();
    }

    // Resolve custom map template if assigned
    if (districtMap.customMapId) {
      const customMapRepo = AppDataSource.getRepository(CustomMap);
      const customMap = await customMapRepo.findOne({ where: { id: districtMap.customMapId } });
      if (customMap) {
        return {
          districtId: districtMap.districtId,
          customMapId: districtMap.customMapId,
          gridCells: customMap.gridCells
        };
      }
    }

    // Fallback to the default map template if the assigned gridCells is empty/blank
    if (!districtMap.gridCells || districtMap.gridCells.length === 0) {
      return await getDefaultMap();
    }

    return {
      districtId: districtMap.districtId,
      customMapId: null,
      gridCells: districtMap.gridCells
    };
  }
}
