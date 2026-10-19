import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ProjectRepository } from '../repositories/project.repository';
import { WorkspaceService } from '../../workspace/services/workspace.service';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';

@Injectable()
export class ProjectService {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly workspaceService: WorkspaceService,
  ) {}

  async create(userId: string, workspaceSlug: string, dto: CreateProjectDto) {
    const workspace = await this.workspaceService.findAccessibleWorkspace(
      userId,
      workspaceSlug,
    );

    this.validateDates(dto.startDate, dto.deadline);

    return this.projectRepository.create({
      name: dto.name,
      description: dto.description,
      clientName: dto.clientName,
      status: dto.status,
      priority: dto.priority,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      deadline: dto.deadline ? new Date(dto.deadline) : undefined,
      workspaceId: workspace.id,
      createdById: userId,
    });
  }

  async findAll(userId: string, workspaceSlug: string) {
    const workspace = await this.workspaceService.findAccessibleWorkspace(
      userId,
      workspaceSlug,
    );

    const projects = await this.projectRepository.findAllByWorkspace(
      workspace.id,
    );

    return Promise.all(
      projects.map(async (project) => {
        const completedTasks = await this.projectRepository.countCompletedTasks(
          project.id,
        );

        const totalTasks = project._count.tasks;

        return {
          ...project,
          completedTasks,
          totalTasks,
          progress:
            totalTasks === 0
              ? 0
              : Math.round((completedTasks / totalTasks) * 100),
        };
      }),
    );
  }

  async findOne(userId: string, workspaceSlug: string, projectId: string) {
    const project = await this.getAccessibleProject(
      userId,
      workspaceSlug,
      projectId,
    );

    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter(
      (task) => task.isCompleted,
    ).length;

    return {
      ...project,
      completedTasks,
      totalTasks,
      progress:
        totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100),
    };
  }
  
  async update(
    userId: string,
    workspaceSlug: string,
    projectId: string,
    dto: UpdateProjectDto,
  ) {
    const project = await this.getAccessibleProject(
      userId,
      workspaceSlug,
      projectId,
    );

    const startDate =
      dto.startDate === undefined
        ? project.startDate
        : dto.startDate
          ? new Date(dto.startDate)
          : null;

    const deadline =
      dto.deadline === undefined
        ? project.deadline
        : dto.deadline
          ? new Date(dto.deadline)
          : null;

    if (startDate && deadline && deadline < startDate) {
      throw new BadRequestException(
        'Project deadline cannot be before its start date.',
      );
    }

    return this.projectRepository.update(projectId, {
      ...dto,
      startDate:
        dto.startDate === undefined
          ? undefined
          : dto.startDate
            ? new Date(dto.startDate)
            : null,
      deadline:
        dto.deadline === undefined
          ? undefined
          : dto.deadline
            ? new Date(dto.deadline)
            : null,
    });
  }

  async delete(userId: string, workspaceSlug: string, projectId: string) {
    await this.getAccessibleProject(userId, workspaceSlug, projectId);

    return this.projectRepository.delete(projectId);
  }

  private async getAccessibleProject(
    userId: string,
    workspaceSlug: string,
    projectId: string,
  ) {
    const workspace = await this.workspaceService.findAccessibleWorkspace(
      userId,
      workspaceSlug,
    );

    const project = await this.projectRepository.findById(projectId);

    if (!project || project.workspaceId !== workspace.id) {
      throw new NotFoundException('Project not found.');
    }

    return project;
  }

  private validateDates(startDate?: string, deadline?: string) {
    if (startDate && deadline && new Date(deadline) < new Date(startDate)) {
      throw new BadRequestException(
        'Project deadline cannot be before its start date.',
      );
    }
  }
}
