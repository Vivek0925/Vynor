import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  UseGuards,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserData } from '../auth/interfaces/current-user.interface';
import { WorkspaceService } from '../workspace/services/workspace.service';

import { StorageService } from './storage.service';
import { UploadFileDto } from './dto/upload-file.dto';
import {
  ALLOWED_WORKSPACE_FOLDERS,
  isAllowedFileType,
  MAX_UPLOAD_SIZE,
} from './storage.service';
import { memoryStorage } from 'multer';
import { PrismaService } from '../../database/prisma.service';
import { NotFoundException } from '@nestjs/common';

@Controller('storage')
@UseGuards(JwtAuthGuard)
export class StorageController {
  constructor(
    private readonly storageService: StorageService,
    private readonly workspaceService: WorkspaceService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: MAX_UPLOAD_SIZE,
        files: 1,
        fields: 3,
        parts: 6,
      },
      fileFilter: (_request, file, callback) => {
        if (!isAllowedFileType(file)) {
          return callback(
            new BadRequestException(
              'Unsupported file type. Upload an allowed image, video, or document.',
            ),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  async upload(
    @CurrentUser() user: CurrentUserData,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadFileDto,
  ) {
    if (!file) {
      throw new BadRequestException('No file was uploaded.');
    }

    if (ALLOWED_WORKSPACE_FOLDERS.has(dto.folder)) {
      if (!dto.workspaceSlug) {
        throw new BadRequestException(
          'A workspace is required for this upload.',
        );
      }

      await this.workspaceService.findAccessibleWorkspace(
        user.id,
        dto.workspaceSlug,
      );
    }

    const uploaded = await this.storageService.upload(file, dto.folder);

    if (dto.folder === 'documents' && dto.workspaceSlug) {
      const workspace = await this.workspaceService.findAccessibleWorkspace(
        user.id,
        dto.workspaceSlug,
      );
      return this.prisma.workspaceFile.create({
        data: {
          workspaceId: workspace.id,
          uploadedById: user.id,
          fileName: uploaded.fileName,
          key: uploaded.key,
          mimeType: uploaded.mimeType,
          size: uploaded.size,
        },
        include: {
          uploadedBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    }

    return uploaded;
  }

  @Get('workspaces/:slug/files')
  async listFiles(
    @Param('slug') slug: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    const workspace = await this.workspaceService.findAccessibleWorkspace(
      user.id,
      slug,
    );
    return this.prisma.workspaceFile.findMany({
      where: { workspaceId: workspace.id },
      orderBy: [{ starred: 'desc' }, { createdAt: 'desc' }],
      include: { uploadedBy: { select: { id: true, name: true } } },
    });
  }

  @Patch('workspaces/:slug/files/:fileId/star')
  async toggleStar(
    @Param('slug') slug: string,
    @Param('fileId') fileId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    const workspace = await this.workspaceService.findAccessibleWorkspace(
      user.id,
      slug,
    );
    const file = await this.prisma.workspaceFile.findFirst({
      where: { id: fileId, workspaceId: workspace.id },
    });
    if (!file) throw new NotFoundException('File not found.');
    return this.prisma.workspaceFile.update({
      where: { id: file.id },
      data: { starred: !file.starred },
    });
  }

  @Get('workspaces/:slug/files/:fileId/download')
  async download(
    @Param('slug') slug: string,
    @Param('fileId') fileId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    const workspace = await this.workspaceService.findAccessibleWorkspace(
      user.id,
      slug,
    );
    const file = await this.prisma.workspaceFile.findFirst({
      where: { id: fileId, workspaceId: workspace.id },
    });
    if (!file) throw new NotFoundException('File not found.');
    return {
      url: await this.storageService.createDownloadUrl(
        file.key,
        file.fileName,
        file.mimeType,
      ),
    };
  }

  @Delete('workspaces/:slug/files/:fileId')
  async remove(
    @Param('slug') slug: string,
    @Param('fileId') fileId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    const workspace = await this.workspaceService.findAccessibleWorkspace(
      user.id,
      slug,
    );
    const file = await this.prisma.workspaceFile.findFirst({
      where: { id: fileId, workspaceId: workspace.id },
    });
    if (
      !file ||
      (file.uploadedById !== user.id &&
        !(await this.workspaceService.isWorkspaceAdminOrOwner(
          workspace.id,
          user.id,
        )))
    ) {
      throw new NotFoundException('File not found.');
    }
    await this.storageService.delete(file.key);
    await this.prisma.workspaceFile.delete({ where: { id: file.id } });
    return { success: true };
  }
}
