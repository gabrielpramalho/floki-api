import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { StatusProject } from 'generated/prisma'
import { z } from 'zod/v4'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'

import { BadRequestError } from '../_errors/bad-request-error'

export function updateProject(app: FastifyInstance) {
  app
    .register(auth)
    .withTypeProvider<ZodTypeProvider>()
    .put(
      '/projects/:projectId',
      {
        schema: {
          tags: ['project'],
          summary: 'Update a project',
          security: [{ bearerAuth: [] }],
          params: z.object({
            projectId: z.uuid(),
          }),
          body: z.object({
            title: z.string().meta({
              example: 'Floki API',
            }),
            description: z.string(),
            githubURL: z.url().optional(),
            productionURL: z.url().optional(),
            imageURL: z.url().optional(),
            status: z.enum(StatusProject),
          }),
          response: {
            201: z.object({
              projectId: z.uuid(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { projectId } = request.params
        const {
          description,
          githubURL,
          imageURL,
          productionURL,
          status,
          title,
        } = request.body
        const userId = await request.getCurrentUserId()

        const user = await prisma.user.findUnique({
          where: {
            id: userId,
          },
        })

        if (!user) {
          throw new BadRequestError('User not found')
        }

        const project = await prisma.project.findUnique({
          where: {
            id: projectId,
          },
        })

        if (!project) {
          throw new BadRequestError('Project not found')
        }

        const updatedProject = await prisma.project.update({
          data: {
            description,
            githubURL,
            imageURL,
            productionURL,
            title,
            status,
          },
          where: { id: projectId },
        })

        return reply.send({ projectId: updatedProject.id })
      },
    )
}
