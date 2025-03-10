describe('Main Layout Component', () => {
  beforeEach(() => {
    // Visit the home page
    cy.visit('/')
  })

  it('should load the navigation bar with the correct items', () => {
    // define expected navigation items
    const navItems = [
      'Collection',
      'Chicago Art Institute',
      'Harvard Art Museums',
      'About',
      'Sign In'
    ]

    // This gets the nav element and checks that it is visible (i.e has rendered)
    cy.get('nav').should('be.visible')

    // Check that each navigation item exists in the navigation bar
    navItems.forEach((item) => {
      cy.get('nav').contains(item).should('exist')
    })
  })

  it('should perform a search with default selection (Harvard)', () => {
    // Type in the search box
    cy.get('input[name="search"]').type('Impressionism')

    // Ensure the search form exists and submit
    cy.get('form').submit()

    // Verify that the URL includes the correct search term and default selection
    cy.url().should('include', 'harvard').and('include', 'searchTerm=Impressionism')
  })

  it('should change API selection and search with Chicago', () => {
    // Select Chicago from the dropdown
    cy.get('select[name="api"]').select('Chicago').trigger('change')

    // Type in the search box
    cy.get('input[name="search"]').type('Modernism')

    // Submit the form
    cy.get('form').submit()

    // Verify that the URL includes the correct selection and search term
    cy.url().should('include', 'chicago').and('include', 'searchTerm=Modernism')
  })

  it('should change API selection and search with Harvard', () => {
    // Select Chicago from the dropdown
    cy.get('select[name="api"]').select('Harvard').trigger('change')

    // Type in the search box
    cy.get('input[name="search"]').type('Modernism')

    // Submit the form
    cy.get('form').submit()

    // Verify that the URL includes the correct selection and search term
    cy.url().should('include', 'harvard').and('include', 'searchTerm=Modernism')
  })

  // it('should allow navigation to login page', () => {
  //   // Click on the Sign In link
  //   cy.contains('Sign In').click()

  //   // Verify that the URL is correct for the login page
  //   cy.url().should('include', '/login')
  // })
})
