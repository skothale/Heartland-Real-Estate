/**
 * OpenAPI 3 specification for Swagger UI.
 * Update this file when routes or payloads change.
 */
module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'Heartland Real Estate API',
    version: '1.0.0',
    description:
      'Document management, admins, and agents. **Authorize** with a JWT from login or signup (paste the token only). First `POST /api/auth/signup` creates the organization **admin**; further accounts are created by admins via `POST /api/agents`.',
  },
  servers: [{ url: '/', description: 'This server' }],
  tags: [
    { name: 'Health', description: 'Liveness' },
    { name: 'Auth', description: 'Sign up, log in, session' },
    { name: 'Agents', description: 'Agent users under an admin (admin only)' },
    { name: 'Documents', description: 'PDF documents (authenticated)' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Message: {
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
      HealthOk: {
        type: 'object',
        properties: {
          ok: { type: 'boolean', example: true },
        },
      },
      UserPublic: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['admin', 'agent'] },
        },
      },
      AuthTokensResponse: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          user: { $ref: '#/components/schemas/UserPublic' },
        },
      },
      MeResponse: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/UserPublic' },
        },
      },
      SignupLoginBody: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: {
            type: 'string',
            format: 'password',
            minLength: 8,
            description: 'Minimum 8 characters (enforced on signup).',
          },
        },
      },
      Document: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          fileName: { type: 'string' },
          mimeType: { type: 'string', example: 'application/pdf' },
          fileSize: { type: 'integer' },
          status: {
            type: 'string',
            enum: ['draft', 'processing', 'completed', 'failed'],
          },
          metadata: { type: 'object', additionalProperties: true },
          owner: { type: 'string', description: 'User id' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      DocumentList: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/Document' },
          },
          total: { type: 'integer' },
        },
      },
      AgentSummary: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string', format: 'email' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      AgentListResponse: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/AgentSummary' },
          },
        },
      },
      CreateAgentBody: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', format: 'password', minLength: 8 },
        },
      },
      CreateAgentResponse: {
        type: 'object',
        properties: {
          agent: { $ref: '#/components/schemas/AgentSummary' },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        operationId: 'healthCheck',
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HealthOk' },
              },
            },
          },
        },
      },
    },
    '/api/auth/signup': {
      post: {
        tags: ['Auth'],
        summary: 'Register',
        operationId: 'signup',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SignupLoginBody' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthTokensResponse' },
              },
            },
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Message' },
              },
            },
          },
          '409': {
            description: 'Email already registered',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Message' },
              },
            },
          },
          '403': {
            description: 'Registration closed (an admin already exists)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Message' },
              },
            },
          },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Log in',
        operationId: 'login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SignupLoginBody' },
            },
          },
        },
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthTokensResponse' },
              },
            },
          },
          '400': {
            description: 'Bad request',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Message' },
              },
            },
          },
          '401': {
            description: 'Invalid credentials',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Message' },
              },
            },
          },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Current user',
        operationId: 'me',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MeResponse' },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Message' },
              },
            },
          },
        },
      },
    },
    '/api/agents': {
      get: {
        tags: ['Agents'],
        summary: 'List agents under this admin',
        operationId: 'listAgents',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AgentListResponse' },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Message' },
              },
            },
          },
          '403': {
            description: 'Not an admin',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Message' },
              },
            },
          },
        },
      },
      post: {
        tags: ['Agents'],
        summary: 'Create an agent account',
        operationId: 'createAgent',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateAgentBody' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateAgentResponse' },
              },
            },
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Message' },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Message' },
              },
            },
          },
          '403': {
            description: 'Not an admin',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Message' },
              },
            },
          },
          '409': {
            description: 'Email already in use',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Message' },
              },
            },
          },
        },
      },
    },
    '/api/documents': {
      get: {
        tags: ['Documents'],
        summary: 'List documents',
        description:
          '**Agents** see only their own uploads. **Admins** see all documents for their agents (and their own). Optional `agentId` (admin only) filters to one agent.',
        operationId: 'listDocuments',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
          },
          {
            name: 'skip',
            in: 'query',
            schema: { type: 'integer', minimum: 0, default: 0 },
          },
          {
            name: 'agentId',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            description:
              'Admin only: Mongo id of an agent that belongs to you. Omit to include all agents (and your own documents).',
          },
        ],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/DocumentList' },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Message' },
              },
            },
          },
          '400': {
            description: 'Invalid agentId for this admin',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Message' },
              },
            },
          },
        },
      },
      post: {
        tags: ['Documents'],
        summary: 'Upload PDF',
        description:
          'Multipart form: field **`file`** (required) is the PDF. Optional fields: `title`, `description`, `status`, `metadata` (JSON string if sent as form field).',
        operationId: 'uploadDocument',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['file'],
                properties: {
                  file: {
                    type: 'string',
                    format: 'binary',
                    description: 'PDF only, max 10 MB',
                  },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  status: {
                    type: 'string',
                    enum: ['draft', 'processing', 'completed', 'failed'],
                  },
                  metadata: {
                    type: 'string',
                    description: 'JSON string',
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Document' },
              },
            },
          },
          '400': {
            description: 'Bad request',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Message' },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Message' },
              },
            },
          },
        },
      },
    },
    '/api/documents/{id}': {
      delete: {
        tags: ['Documents'],
        summary: 'Delete document',
        operationId: 'deleteDocument',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'MongoDB document id',
          },
        ],
        responses: {
          '204': { description: 'Deleted' },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Message' },
              },
            },
          },
          '404': {
            description: 'Not found or not owned by user',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Message' },
              },
            },
          },
        },
      },
    },
    '/api/documents/{id}/file': {
      get: {
        tags: ['Documents'],
        summary: 'Download/view the stored PDF bytes',
        operationId: 'getDocumentFile',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'MongoDB document id',
          },
        ],
        responses: {
          '200': {
            description: 'PDF binary',
            content: {
              'application/pdf': {
                schema: { type: 'string', format: 'binary' },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Message' },
              },
            },
          },
          '404': {
            description: 'Not found or not owned by user/admin',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Message' },
              },
            },
          },
        },
      },
    },
  },
};
