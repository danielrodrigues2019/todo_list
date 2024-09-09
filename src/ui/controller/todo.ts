import { todoRepository } from '@ui/repository/todo'
import { Todo } from '@ui/schema/todo'

interface TodoControllerGetParams {
  page: number
}
async function get(params: TodoControllerGetParams) {
  // Fazer a lógica de pegar os dados
  // eslint-disable-next-line no-console

  return todoRepository.get({
    page: params.page,
    limit: 10,
  })
}

function filterTodosByContent<Todo>(
  search: string,
  todos: Array<Todo & { content: string }>,
): Array<Todo> {
  const homeTodos = todos.filter((todo) => {
    const searchNormalized = search.toLowerCase()
    const contentNormalized = todo.content.toLowerCase()
    return contentNormalized.includes(searchNormalized)
  })

  return homeTodos
}

interface TodoControllerCreateParams {
  content?: string
  onSuccess: (todo: Todo) => void
  onError: () => void
}

function create({ content, onError, onSuccess }: TodoControllerCreateParams) {
  //Fail Fast Validations
  if (!content) {
    onError()
    return
  }
  todoRepository
    .createByContent(content)
    .then((newTodo) => {
      onSuccess(newTodo)
    })
    .catch(() => {
      onError()
    })
}

interface TodoControllerToggleParams {
  id: string
  onError: () => void
  updateTodoOnScreen: () => void
}

function toggleDone({
  id,
  updateTodoOnScreen,
  onError,
}: TodoControllerToggleParams) {
  //Chamar o repository
  // Optimistic Update
  // updateTodoOnScreen()
  todoRepository
    .toggleDone(id)
    .then(() => {
      // Update Real
      updateTodoOnScreen()
    })
    .catch(() => {
      onError()
    })
}

async function deleteById(id: string): Promise<void> {
  const todoId = id
  await todoRepository.deleteById(todoId)
}

export const todoController = {
  get,
  filterTodosByContent,
  create,
  toggleDone,
  deleteById,
}
