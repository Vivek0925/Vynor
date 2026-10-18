import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { CurrentUserData } from '../../auth/interfaces/current-user.interface';

import { ProjectService } from '../services/project.service';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';

@Controller('workspaces/:slug/projects')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  create(
    @CurrentUser() user: CurrentUserData,
    @Param('slug') slug: string,
    @Body() dto: CreateProjectDto,
  ) {
    return this.projectService.create(user.id, slug, dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: CurrentUserData,
    @Param('slug') slug: string,
  ) {
    return this.projectService.findAll(user.id, slug);
  }

  @Get(':projectId')
  findOne(
    @CurrentUser() user: CurrentUserData,
    @Param('slug') slug: string,
    @Param('projectId') projectId: string,
  ) {
    return this.projectService.findOne(user.id, slug, projectId);
  }

  @Patch(':projectId')
  update(
    @CurrentUser() user: CurrentUserData,
    @Param('slug') slug: string,
    @Param('projectId') projectId: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectService.update(user.id, slug, projectId, dto);
  }

  @Delete(':projectId')
  delete(
    @CurrentUser() user: CurrentUserData,
    @Param('slug') slug: string,
    @Param('projectId') projectId: string,
  ) {
    return this.projectService.delete(user.id, slug, projectId);
  }
}