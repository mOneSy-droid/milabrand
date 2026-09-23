import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import prisma from '@/lib/prisma';
import { getTelegramFilePath, fetchTelegramImageStream } from '@/lib/telegram-image';
import { getInitialProducts } from '@/lib/mock-data';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let telegramFileId: string | null = null;

    // 1. Try finding ProductImage in database
    try {
      const productImage = await prisma.productImage.findUnique({
        where: { id },
      });
      if (productImage) {
        telegramFileId = productImage.telegramFileId;
      }
    } catch (dbErr) {
      console.warn('[DB] Prisma query failed in /api/images/[id], checking mock products');
    }

    // Fallback: look in initial products
    if (!telegramFileId) {
      const allProducts = getInitialProducts();
      for (const p of allProducts) {
        const foundImg = p.images.find((img) => img.id === id);
        if (foundImg) {
          telegramFileId = foundImg.telegramFileId;
          break;
        }
      }
    }

    // If still not found, check if id is a filename or fallback to default
    if (!telegramFileId) {
      telegramFileId = `local:${id}`;
    }

    // 2. Handle local file fallback (e.g. from seed or local development)
    if (telegramFileId.startsWith('local:')) {
      const filename = telegramFileId.replace('local:', '');
      let localFilePath = path.join(process.cwd(), 'public', 'products', filename);

      if (!fs.existsSync(localFilePath)) {
        // Fallback to first available product photo
        const productsDir = path.join(process.cwd(), 'public', 'products');
        if (fs.existsSync(productsDir)) {
          const files = fs.readdirSync(productsDir);
          if (files.length > 0) {
            localFilePath = path.join(productsDir, files[0]);
          }
        }
      }

      if (fs.existsSync(localFilePath)) {
        const fileBuffer = fs.readFileSync(localFilePath);
        return new NextResponse(fileBuffer, {
          headers: {
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
          },
        });
      }
    }

    // 3. Resolve Telegram file_id using Bot API
    const botToken = process.env.BOT_TOKEN;
    if (!botToken || botToken === 'mock_bot_token_for_dev') {
      // If mock token or no bot token, return local fallback
      const fallbackDir = path.join(process.cwd(), 'public', 'products');
      if (fs.existsSync(fallbackDir)) {
        const files = fs.readdirSync(fallbackDir);
        if (files.length > 0) {
          const fallbackPath = path.join(fallbackDir, files[0]);
          const fileBuffer = fs.readFileSync(fallbackPath);
          return new NextResponse(fileBuffer, {
            headers: {
              'Content-Type': 'image/jpeg',
              'Cache-Control': 'public, max-age=86400',
            },
          });
        }
      }
      return new NextResponse('Bot token not configured', { status: 500 });
    }

    // Resolve file_path from Telegram Bot API
    const filePath = await getTelegramFilePath(telegramFileId, botToken);
    if (!filePath) {
      return new NextResponse('Failed to resolve image from Telegram', { status: 502 });
    }

    // Stream image from Telegram CDN
    const imageResult = await fetchTelegramImageStream(filePath, botToken);
    if (!imageResult || !imageResult.stream) {
      return new NextResponse('Failed to stream image from Telegram', { status: 502 });
    }

    return new NextResponse(imageResult.stream, {
      headers: {
        'Content-Type': imageResult.contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error) {
    console.error('Error serving product image:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
