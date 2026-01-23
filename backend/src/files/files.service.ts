import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FilesService {
  private readonly uploadDir = 'uploads';

  constructor() {
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(file: Express.Multer.File): Promise<string> {
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(this.uploadDir, fileName);

    fs.writeFileSync(filePath, file.buffer);

    return `/uploads/${fileName}`;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    const fileName = fileUrl.replace('/uploads/', '');
    const filePath = path.join(this.uploadDir, fileName);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}
