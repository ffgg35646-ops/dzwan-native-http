import { put } from "@vercel/blob";
import fs from "node:fs/promises";
import path from "node:path";

type UploadableFile = {
  path?: string;
  filename?: string;
  originalname?: string;
  mimetype?: string;
  buffer?: Buffer;
};

function hasBlobAuth(): boolean {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN ||
    process.env.VERCEL_OIDC_TOKEN ||
    process.env.VERCEL === "1",
  );
}

function safeFilename(filename: string): string {
  const cleaned = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, "-");
  return cleaned || `file-${Date.now()}.jpg`;
}

export async function uploadImageToBlob(
  folder: string,
  file: UploadableFile,
): Promise<string> {
  const filename = safeFilename(
    file.filename || file.originalname || `image-${Date.now()}.jpg`,
  );

  const contentType =
    file.mimetype && /^image\/(jpeg|png|webp)$/i.test(file.mimetype)
      ? file.mimetype
      : "image/jpeg";

  const fileBuffer =
    file.buffer ??
    (file.path ? await fs.readFile(file.path) : null);

  if (!fileBuffer) {
    throw new Error("UPLOAD_FILE_DATA_MISSING");
  }

  try {
    if (hasBlobAuth()) {
      const blob = await put(
        `${folder}/${filename}`,
        fileBuffer,
        {
          access: "public",
          contentType,
          addRandomSuffix: false,
        },
      );

      return blob.url;
    }

    // Local development fallback only.
    const localFolder = path.join(
      process.cwd(),
      "uploads",
      folder,
    );

    await fs.mkdir(localFolder, {
      recursive: true,
    });

    const localPath = path.join(
      localFolder,
      filename,
    );

    await fs.writeFile(localPath, fileBuffer);

    return `/uploads/${folder}/${filename}`;
  } finally {
    if (file.path) {
      await fs.rm(file.path, {
        force: true,
      }).catch(() => undefined);
    }
  }
}
