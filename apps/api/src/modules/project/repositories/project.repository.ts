import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { ProjectStatus, TaskPriority } from '@prisma/client';

@Injectable()
export class ProjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    name: string;
    description?: string;
    clientName?: string;
    status?: ProjectStatus;
    priority?: TaskPriority;
    startDate?: Date;
    deadline?: Date;
    workspaceId: string;
    createdById: string;
  }) {
    return this.prisma.project.create({
      data,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });
  }

  async findAllByWorkspace(workspaceId: string) {
    return this.prisma.project.findMany({
      where: { workspaceId },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async findById(id: string) {
    return this.prisma.project.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        tasks: {
          orderBy: {
            updatedAt: 'desc',
          },
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      description?: string;
      clientName?: string;
      status?: ProjectStatus;
      priority?: TaskPriority;
      startDate?: Date | null;
      deadline?: Date | null;
    },
  ) {
    return this.prisma.project.update({
      where: { id },
      data,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });
  }

  async delete(id: string) {
    return this.prisma.project.delete({
      where: { id },
    });
  }
}