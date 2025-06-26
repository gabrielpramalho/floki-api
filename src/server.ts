import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import { fastify } from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod'

import { env } from './env'
import { errorHandler } from './error-handler'
import { authenticateWithPassword } from './http/routes/auth/authenticate-with-password'
import { createAccount } from './http/routes/auth/create-account'
import { getProfile } from './http/routes/auth/get-profile'
import { requestPasswordRecover } from './http/routes/auth/request-password-recover'
import { resetPassword } from './http/routes/auth/reset-password'
import { createProject } from './http/routes/project/create-project'
import { deleteProject } from './http/routes/project/delete-project'
import { getProject } from './http/routes/project/get-project'
import { updateProject } from './http/routes/project/update-project'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.setErrorHandler(errorHandler)

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Floki',
      description: 'Organize your projects',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
})

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})

app.register(fastifyCors)

app.register(createAccount)
app.register(authenticateWithPassword)
app.register(getProfile)
app.register(requestPasswordRecover)
app.register(resetPassword)

app.register(createProject)
app.register(deleteProject)
app.register(updateProject)
app.register(getProject)

app.listen({ port: env.PORT }).then(() => {
  console.log(`HTTP running 🔥 at http://localhost:${env.PORT}`)
})
