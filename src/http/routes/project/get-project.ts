import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'

import { BadRequestError } from '../_errors/bad-request-error'

export function getProject(app: FastifyInstance) {
  app
    .register(auth)
    .withTypeProvider<ZodTypeProvider>()
    .get(
      '/projects/:projectId',
      {
        schema: {
          tags: ['project'],
          summary: 'Get a project',
          security: [{ bearerAuth: [] }],
          params: z.object({
            projectId: z.uuid(),
          }),
          response: {
            200: z.object({
              project: z.object({
                id: z.uuid(),
                title: z.string(),
                description: z.string(),
              }),
            }),
          },
        },
      },
      async (request, reply) => {
        const { projectId } = request.params
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
          select: {
            id: true,
            title: true,
            description: true,
          },
          where: {
            id: projectId,
          },
        })

        if (!project) {
          throw new BadRequestError('Project not found')
        }

        return reply.send({ project })
      },
    )
}
