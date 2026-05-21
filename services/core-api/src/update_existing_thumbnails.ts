import { AppDataSource } from './config/database';
import { ModelAsset } from './models/maps/ModelAsset';

async function run() {
  console.log('Initializing database connection...');
  await AppDataSource.initialize();
  console.log('Connected!');

  const assetRepo = AppDataSource.getRepository(ModelAsset);
  
  // Find Bina
  const bina = await assetRepo.findOne({ where: { name: 'Bina' } });
  if (bina) {
    bina.thumbnailUrl = '/uploads/textures/bina_sprite.png';
    await assetRepo.save(bina);
    console.log('Updated "Bina" thumbnailUrl to /uploads/textures/bina_sprite.png');
  } else {
    console.log('Could not find model asset with name "Bina"');
  }

  // Find Bina 2
  const bina2 = await assetRepo.findOne({ where: { name: 'Bina 2' } });
  if (bina2) {
    bina2.thumbnailUrl = '/uploads/textures/bina2_sprite.png';
    await assetRepo.save(bina2);
    console.log('Updated "Bina 2" thumbnailUrl to /uploads/textures/bina2_sprite.png');
  } else {
    console.log('Could not find model asset with name "Bina 2"');
  }

  await AppDataSource.destroy();
  console.log('Done!');
}

run().catch(console.error);
