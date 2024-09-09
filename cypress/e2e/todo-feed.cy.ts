const BASE_URL = 'http://localhost:3000'

describe('/ - Todos Feeds', () => {
  it('when load, renders the page', () => {
    cy.visit(BASE_URL)
  })
  it('when create a new todo, it must appears in the screen', () => {
    cy.intercept('POST', `${BASE_URL}/api/todos`, (request) => {
      request.reply({
        statusCode: 201,
        body: {
          todo: {
            id: '6daebeab-af2d-44c9-b606-7ea79da6d851',
            date: '2024-09-04T17:59:56.422Z',
            content: 'Test todo 01',
            done: false,
          },
        },
      })
    }).as('createTodo')
    cy.visit(BASE_URL)
    const inputAddTodo = 'input[name="add-todo"]'
    cy.get(inputAddTodo).should('be.visible').type('Test todo 01')
    const buttonAddTodo = '[aria-label="Adicionar novo item"]'
    cy.get(buttonAddTodo).click()

    cy.get('table > tbody').contains('Test todo 01')
  })
})
