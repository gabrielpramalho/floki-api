import { faker } from '@faker-js/faker'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { StatusProject } from 'generated/prisma'
import { z } from 'zod/v4'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'

import { BadRequestError } from '../_errors/bad-request-error'

export async function createProject(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/projects',
      {
        schema: {
          tags: ['project'],
          summary: 'Create a project',
          security: [{ bearerAuth: [] }],
          body: z.object({
            title: z.string().meta({
              example: 'Floki API',
            }),
            description: z.string(),
          }),
          response: {
            201: z.object({
              projectId: z.uuid(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { description, title } = request.body
        const userId = await request.getCurrentUserId()

        const user = await prisma.user.findUnique({
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
          where: {
            id: userId,
          },
        })

        if (!user) {
          throw new BadRequestError('User not found')
        }

        const imageURL = faker.image.urlLoremFlickr()

        const project = await prisma.project.create({
          data: {
            title,
            description,
            imageURL,
            status: StatusProject.BACKLOG,
            ownerId: userId,
          },
        })

        return reply.send({ projectId: project.id })
      },
    )
}
