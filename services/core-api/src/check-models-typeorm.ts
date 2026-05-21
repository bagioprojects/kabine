import { AppDataSource } from './config/database';
import { ModelCategory } from './models/maps/ModelCategory';
import { ModelAsset } from './models/maps/ModelAsset';

async function check() {
  console.log('Initializing database...');
  await AppDataSource.initialize();
  console.log('Connected!');

  const cats = await AppDataSource.getRepository(ModelCategory).find();
  console.log('Categories count:', cats.length);
  console.log(cats);

  const assets = await AppDataSource.getRepository(ModelAsset).find();
  console.log('Assets count:', assets.length);
  console.log(assets);

  await AppDataSource.destroy();
}

check().catch(console.error);
