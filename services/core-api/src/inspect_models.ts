import { AppDataSource } from './config/database';
import { ModelAsset } from './models/maps/ModelAsset';

async function check() {
  await AppDataSource.initialize();
  const assets = await AppDataSource.getRepository(ModelAsset).find();
  console.log('--- DATABASE ASSETS ---');
  assets.forEach(asset => {
    console.log(`ID: ${asset.id}, Name: ${asset.name}, FileUrl: ${asset.fileUrl}, ThumbnailUrl: ${asset.thumbnailUrl}, Scale: ${asset.scale}`);
  });
  await AppDataSource.destroy();
}
check().catch(console.error);
