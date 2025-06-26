import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'

import { BadRequestError } from '../_errors/bad-request-error'

export function deleteProject(app: FastifyInstance) {
  app
    .register(auth)
    .withTypeProvider<ZodTypeProvider>()
    .delete(
      '/projects/:projectId',
      {
        schema: {
          tags: ['project'],
          summary: 'Delete a project',
          security: [{ bearerAuth: [] }],
          params: z.object({
            projectId: z.uuid(),
          }),
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
          where: {
            id: projectId,
          },
        })

        if (!project) {
          throw new BadRequestError('Project not found')
        }

        await prisma.project.delete({
          where: { id: projectId },
        })

        return reply.status(204).send()
      },
    )
}
