// tests/__mocks__/firebase.js
// This is a simplified mock of the firebase admin SDK for testing
const admin = {
    auth: () => ({
      verifyIdToken: jest.fn().mockImplementation((token) => {
        if (token === 'valid-token') {
          return Promise.resolve({ uid: 'test-user-id', email: 'test@example.com' });
        } else {
          return Promise.reject(new Error('Invalid token'));
        }
      }),
      getUser: jest.fn().mockImplementation((uid) => {
        return Promise.resolve({
          uid: uid,
          email: 'test@example.com',
          displayName: 'Test User',
          photoURL: null
        });
      })
    })
  };
  
  export default admin;