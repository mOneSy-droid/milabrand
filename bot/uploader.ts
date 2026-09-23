import { Bot, InputFile } from 'grammy';
import path from 'path';
import fs from 'fs';
import prisma from '../lib/prisma';
import { BOT_TOKEN, ADMIN_ID_1 } from './config';

async function uploadLocalImagesToTelegram() {
  console.log('🚀 Starting Telegram image batch uploader...');

  if (!BOT_TOKEN || BOT_TOKEN === 'mock_bot_token_for_dev') {
    console.error('❌ BOT_TOKEN is missing or set to placeholder in .env.');
    console.log('Please set a valid BOT_TOKEN in .env and run this command again.');
    process.exit(1);
  }

  const targetChatId = ADMIN_ID_1;
  if (!targetChatId) {
    console.error('❌ ADMIN_ID_1 is not specified in .env. Needed to send photos to retrieve file_ids.');
    process.exit(1);
  }

  const bot = new Bot(BOT_TOKEN);

  // Find all ProductImages that have local: references
  const localImages = await prisma.productImage.findMany({
    where: { telegramFileId: { startsWith: 'local:' } },
  });

  console.log(`📦 Found ${localImages.length} images needing Telegram file_ids.`);

  let uploaded = 0;
  for (const img of localImages) {
    const filename = img.telegramFileId.replace('local:', '');
    const localPath = path.join(process.cwd(), 'public', 'products', filename);

    if (!fs.existsSync(localPath)) {
      console.warn(`⚠️ File not found locally: ${localPath}`);
      continue;
    }

    try {
      console.log(`Uploading ${filename} to Telegram chat ${targetChatId}...`);
      const sentMsg = await bot.api.sendPhoto(targetChatId, new InputFile(localPath), {
        caption: `MILA Brand Asset: ${filename}`,
      });

      if (sentMsg.photo && sentMsg.photo.length > 0) {
        const highestResPhoto = sentMsg.photo[sentMsg.photo.length - 1];
        const newFileId = highestResPhoto.file_id;

        await prisma.productImage.update({
          where: { id: img.id },
          data: { telegramFileId: newFileId },
        });

        uploaded++;
        console.log(`✅ Uploaded (${uploaded}/${localImages.length}) -> file_id: ${newFileId}`);
      }

      // Small delay to prevent hitting Telegram rate limits
      await new Promise((r) => setTimeout(r, 600));
    } catch (err) {
      console.error(`❌ Failed to upload ${filename}:`, err);
    }
  }

  console.log(`🎉 Finished! Successfully uploaded ${uploaded} images to Telegram.`);
  await prisma.$disconnect();
}

uploadLocalImagesToTelegram().catch(console.error);
