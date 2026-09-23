interface CachedFilePath {
  filePath: string;
  expiresAt: number;
}

// In-memory cache for resolved Telegram file paths to avoid spamming getFile
const filePathCache = new Map<string, CachedFilePath>();

/**
 * Resolves a Telegram file_id to its temporary file_path on Telegram CDN
 */
export async function getTelegramFilePath(fileId: string, botToken: string): Promise<string | null> {
  const now = Date.now();
  const cached = filePathCache.get(fileId);

  if (cached && cached.expiresAt > now) {
    return cached.filePath;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
    if (!res.ok) {
      console.error(`Telegram getFile failed: ${res.status} ${res.statusText}`);
      return null;
    }

    const data = await res.json();
    if (!data.ok || !data.result?.file_path) {
      console.error('Telegram getFile invalid response:', data);
      return null;
    }

    const filePath = data.result.file_path as string;

    // Cache for 50 minutes (Telegram file links usually expire after 1 hour)
    filePathCache.set(fileId, {
      filePath,
      expiresAt: now + 50 * 60 * 1000,
    });

    return filePath;
  } catch (err) {
    console.error('Error resolving Telegram file path:', err);
    return null;
  }
}

/**
 * Fetches the binary stream of the image from Telegram CDN
 */
export async function fetchTelegramImageStream(
  filePath: string,
  botToken: string
): Promise<{ stream: ReadableStream<Uint8Array> | null; contentType: string } | null> {
  try {
    const url = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
    const res = await fetch(url);

    if (!res.ok || !res.body) {
      return null;
    }

    const contentType = res.headers.get('content-type') || 'image/jpeg';
    return {
      stream: res.body,
      contentType,
    };
  } catch (err) {
    console.error('Error streaming image from Telegram:', err);
    return null;
  }
}
