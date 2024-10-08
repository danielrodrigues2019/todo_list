import { Todo, TodoSchema } from '@ui/schema/todo'
import { z as schema } from 'zod'

interface TodoRepositoryGetParams {
  page: number
  limit: number
}
interface TodoRepositoryGetOutput {
  todos: Todo[]
  total: number
  pages: number
}
function get({
  page,
  limit,
}: TodoRepositoryGetParams): Promise<TodoRepositoryGetOutput> {
  return fetch(`/api/todos?page=${page}&limit=${limit}`).then(
    async (respostaDoServidor) => {
      const todosString = await respostaDoServidor.text()
      // Como garantir a tipagem de tipos desconhecidos?
      const responseParsed = parseTodosFromServer(JSON.parse(todosString))

      return {
        total: responseParsed.total,
        todos: responseParsed.todos,
        pages: responseParsed.pages,
      }
    },
  )
}

export async function createByContent(content: string): Promise<Todo> {
  const response = await fetch('/api/todos', {
    method: 'POST',
    headers: {
      //MIME Type
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content,
    }),
  })

  if (response.ok) {
    const serverResponse = await response.json()
    const ServerResponseSchema = schema.object({
      todo: TodoSchema,
    })
    const serverResponseSchemaParsed =
      ServerResponseSchema.safeParse(serverResponse)
    if (!serverResponseSchemaParsed.success) {
      throw new Error('Failed to create TODO')
    }
    const todo = serverResponseSchemaParsed.data.todo
    return todo
  }

  throw new Error('Failed to create TODO:')
}

export async function toggleDone(todoId: string): Promise<Todo> {
  const response = await fetch(`/api/todos/${todoId}/toggle-done`, {
    method: 'PUT',
  })

  if (response.ok) {
    const serverResponse = await response.json()
    const ServerResponseSchema = schema.object({
      todo: TodoSchema,
    })
    const serverResponseSchemaParsed =
      ServerResponseSchema.safeParse(serverResponse)

    if (!serverResponseSchemaParsed.success) {
      throw new Error('Failed to Update TODO')
    }

    const updatedTodo = serverResponseSchemaParsed.data.todo
    return updatedTodo
  }

  throw new Error('Server Error')
}

export async function deleteById(id: string) {
  const response = await fetch(`/api/todos/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Failed to delete')
  }
}

export const todoRepository = {
  get,
  createByContent,
  toggleDone,
  deleteById,
}

function parseTodosFromServer(responseBody: unknown): {
  total: number
  pages: number
  todos: Array<Todo>
} {
  if (
    responseBody !== null &&
    typeof responseBody === 'object' &&
    'todos' in responseBody &&
    'total' in responseBody &&
    'pages' in responseBody &&
    Array.isArray(responseBody.todos)
  ) {
    return {
      total: Number(responseBody.total),
      pages: Number(responseBody.pages),
      todos: responseBody.todos.map((todo: unknown) => {
        if (todo === null && typeof todo !== 'object') {
          throw new Error('Invalid todo from API')
        }

        const { id, content, done, date } = todo as {
          id: string
          content: string
          date: string
          done: string
        }

        return {
          id,
          content,
          done: String(done).toLowerCase() === 'true',
          date: date,
        }
      }),
    }
  }

  return {
    pages: 1,
    total: 0,
    todos: [],
  }
}
