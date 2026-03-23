// Auth test fixtures

export const mockUser = {
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
  password: 'hashedpassword123',
  role: 'admin',
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockToken = {
  accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwicm9sZSI6ImFkbWluIn0.test',
  refreshToken: 'refresh-token-test',
  expiresIn: 3600,
}

export const mockLoginCredentials = {
  email: 'test@example.com',
  password: 'password123',
}

export const mockRegisterData = {
  username: 'newuser',
  email: 'newuser@example.com',
  password: 'securepassword123',
}
