
// 401 UNAUTHORIZED
export class Unauthorized extends Error {
  constructor(message) {
    super();
    this.message = message || 'You must login to perform this action';
    this.status = 401;
  }
}

// 405 METHOD NOT ALLOWED
export class NotAllowed extends Error {
  constructor(message, allowed) {
    super();
    this.message = message || 'Method Not Allowed';
    this.allowed = allowed;
    this.status = 405;
  }
}

// 405 METHOD NOT ALLOWED
export class ServiceUnavailable extends Error {
  constructor(message) {
    super();
    this.message = message || 'The API is down';
    this.status = 503;
  }
}

// 405 METHOD NOT ALLOWED
export class NotFound extends Error {
  constructor(message) {
    super();
    this.message = message || 'Requested resource was not found';
    this.status = 404;
  }
}
