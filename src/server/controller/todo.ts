import { todoRepository } from '@server/repository/todo'
import { z as schema } from 'zod'
import { NextApiRequest, NextApiResponse } from 'next'
import { HttpNotFoundError } from '@server/infra/errors'

async function get(req: NextApiRequest, res: NextApiResponse) {
  const query = req.query
  const page = Number(query.page)
  const limit = Number(query.limit)

  if (query.page && isNaN(page)) {
    res.status(400).json({
      error: {
        message: '`page` must be a number',
      },
    })
  }
  if (query.limit && isNaN(limit)) {
    res.status(400).json({
      error: {
        message: '`limit` must be a number',
      },
    })
  }

  const output = await todoRepository.get({
    page,
    limit,
  })

  res.status(200).json({
    total: output.total,
    pages: output.pages,
    todos: output.todos,
  })
}

const TodoCreateBodySchema = schema.object({
  content: schema.string(),
})

async function create(req: NextApiRequest, res: NextApiResponse) {
  //Fail Fast Validations
  const body = TodoCreateBodySchema.safeParse(req.body)

  if (!body.success) {
    res.status(400).json({
      error: {
        message: 'Mandatory content for create TODO',
        description: body.error.issues,
      },
    })
    return
  }

  try {
    const createdTodo = await todoRepository.createByContent(body.data.content)

    res.status(201).json({
      todo: createdTodo,
    })
  } catch (error) {
    res.status(400).json({
      error: {
        message: 'Failed to create TODO',
      },
    })
  }
}
async function toggleDone(req: NextApiRequest, res: NextApiResponse) {
  const todoId = req.query.id

  //Fail Fast Validations
  if (!todoId || typeof todoId !== 'string') {
    res.status(400).json({
      error: {
        message: 'ID must be a string',
      },
    })
    return
  }
  try {
    const updatedTodo = await todoRepository.toggleDone(todoId)

    res.status(200).json({
      todo: updatedTodo,
    })
  } catch (err) {
    if (err instanceof Error) {
      res.status(404).json({
        error: {
          message: err.message,
        },
      })
    }
  }
}

async function deleteById(req: NextApiRequest, res: NextApiResponse) {
  const QuerySchema = schema.object({
    id: schema.string().uuid(),
  })
  // Fail Fast
  const parsedQuery = QuerySchema.safeParse(req.query)
  if (!parsedQuery.success) {
    res.status(400).json({
      error: {
        message: `You must to provide a valid id`,
      },
    })
    return
  }

  try {
    const todoId = parsedQuery.data.id
    await todoRepository.deleteById(todoId)
    res.status(204).end()
  } catch (err) {
    if (err instanceof HttpNotFoundError) {
      return res.status(err.status).json({
        error: {
          message: err.message,
        },
      })
    }

    res.status(500).json({
      error: {
        message: `Internal server error`,
      },
    })
  }
}

export const todoController = {
  get,
  create,
  toggleDone,
  deleteById,
}
