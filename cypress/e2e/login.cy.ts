describe('Login Page with Token Validation', () => {
  beforeEach(() => {
    // Mock the token validation endpoint to return a valid response
    cy.intercept('GET', '**/auth/is-token-expired', {
      statusCode: 200,
      body: false // Return false to indicate that the token is not expired
    }).as('tokenValidation')

    // Visit the login page
    cy.visit('/login')
  })

  it('should log in and keep the user logged in with a valid token', () => {
    // Intercept the login API request and mock a successful response
    cy.intercept('POST', '**/auth/login', {
      statusCode: 200,
      body: {
        access_token: 'fake_token',
        user: {
          id: 1,
          name: 'John Doe',
          email: 'john.doe@example.com',
          age: 30,
          color: '#ff0000'
        }
      }
    }).as('loginRequest')

    // Intercept the request to fetch the user's collection data before navigating
    cy.intercept('GET', '**/artworks/user/*', (req) => {
      // Check that header token matches one from login
      expect(req.headers.authorization).to.eq('Bearer fake_token')

      // Mock response for artwork data
      req.reply({
        statusCode: 200,
        body: [
          {
            id: 101,
            museum_id: 1,
            artwork_id: 5001,
            title: 'Starry Night',
            artist: 'Vincent van Gogh',
            date: '1889',
            artwork_type: 'Painting',
            classification: {
              period: 'Post-Impressionism',
              division: 'Fine Arts',
              type: 'Oil on Canvas'
            },
            medium: 'Oil on canvas',
            colors: {
              hex: [
                {
                  color: '#2E4B7D',
                  spectrum: 'Blue',
                  hue: 'Cool',
                  percent: 30,
                  css3: '#2E4B7D'
                },
                {
                  color: '#E6B62F',
                  spectrum: 'Yellow',
                  hue: 'Warm',
                  percent: 20,
                  css3: '#E6B62F'
                }
              ],
              hsl: null
            },
            culture: 'Dutch',
            styles: ['Post-Impressionism'],
            image: {
              id: 1,
              artwork_id: 5001,
              imageUrl:
                'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1200px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg',
              imageAlt: 'Starry Night by Vincent van Gogh',
              imageWidth: 800,
              imageHeight: 600
            }
          },
          {
            id: 102,
            museum_id: 2,
            artwork_id: 5002,
            title: 'Mona Lisa',
            artist: 'Leonardo da Vinci',
            date: '1503',
            artwork_type: 'Painting',
            classification: {
              period: 'Renaissance',
              division: 'Fine Arts',
              type: 'Oil on Poplar'
            },
            medium: 'Oil on poplar panel',
            colors: {
              hex: [
                {
                  color: '#6D3B1F',
                  spectrum: 'Brown',
                  hue: 'Warm',
                  percent: 40,
                  css3: '#6D3B1F'
                },
                {
                  color: '#C6A670',
                  spectrum: 'Yellow',
                  hue: 'Warm',
                  percent: 15,
                  css3: '#C6A670'
                }
              ],
              hsl: null
            },
            culture: 'Italian',
            styles: ['High Renaissance'],
            image: {
              id: 2,
              artwork_id: 5002,
              imageUrl:
                'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/1200px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg',
              imageAlt: 'Mona Lisa by Leonardo da Vinci',
              imageWidth: 800,
              imageHeight: 600
            }
          }
        ]
      })
    }).as('fetchCollection')

    // Fill in the email and password fields
    cy.get('input[name="email"]').type('john.doe@example.com')
    cy.get('input[name="password"]').type('password123')

    // Submit the form
    cy.get('form.login-form').submit()

    // Wait for the login request to complete
    cy.wait('@loginRequest')

    // Check that localStorage values are set correctly
    cy.window().then((window) => {
      expect(window.localStorage.getItem('token')).to.eq('fake_token')
      const user = JSON.parse(window.localStorage.getItem('user') || '')
      expect(user.email).to.eq('john.doe@example.com')
      expect(window.localStorage.getItem('loggedIn')).to.eq('true')
    })

    // Wait for the token validation to occur and mock the token as valid
    cy.wait('@tokenValidation')

    // Verify redirection after login
    cy.url().should('include', '/collection/display')

    // Wait for the collection data request to complete
    cy.wait('@fetchCollection')

    // Verify that the collection data is displayed on the page
    cy.get('.artwork-item').should('have.length', 2)
    cy.get('.artwork-image').should('have.length', 2).and('be.visible')
  })
})
