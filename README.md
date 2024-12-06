# graphql-http-prisma-typescript
create backend system using graphql-api

## Run code
```
npm run dev (Runs the application in development mode with Nodemon)
npm run start (production)
npm run lint (Runs ESLint to check code)
npm run lint:fix (Runs ESLint to fix code issues)
```

## Endpoint
```
http://localhost:4000/graphql
```

## Request And Response Api Mutation and Query

### Authentication

**- Register**
```graphql
mutation {
  register(
    name: "jhon"
    email: "jhon@gmail.com"
    password: "jhon#123#"
    role: "user"
    age: 20
    address: "Newton city"
  ) {
      message
      user {
      id
      name
      email
      role
      createdAt
      updatedAt
      isEmailVerified
      }
  }
}
```

**- Login**
```graphql
mutation {
  login(
    email: "jhon@gmail.com"
    password: "jhon#123#"
  ) {
    user {
      id
      name
      email
      role
      createdAt
      updatedAt
      isEmailVerified
    }
    tokens {
      access {
        token
        expires
      }
      refresh {
        token
        expires
      }
    }
  }
}
```

**- logout**
```graphql
mutation {
  logout(token: "{{refreshToken}}") {
    message
  }
}
```

**- RefreshToken**
```graphql
mutation {
  refreshAuthToken(token: "{{refreshToken}}") {
    message
    tokens {
        access {
        token
        expires
      }
      refresh {
        token
        expires
      }
    }
  }
}
```

**- ForgotPassowrd**
```graphql
mutation {
  forgotPassword(email: "jhon@gmail.com") {
    message
    tokens
  }
}
```

**- ResetPassword**
```graphql
mutation {
  resetPassword(token: "{{resetToken}}", password: "scezeny#123$@") {
    message
  }
}
```

**- SendverificationEmail**
```graphql
mutation {
  sendVerificationEmail(
    id: "{{Id}}"
    name: "jhon"
    email: "jhon@gmail.com"
    password: "jhon#123#"
    role: "user"
    age: 20
    address: "Newton city"
  ) {
      message
      tokens
  }
}
```

**- VerifyEmailToken**
```graphql
mutation {
  verifyEmail(token: "{{verifyEmailToken}}") {
    message
  }
}
```


### User

**- Get User By Id**
```graphql
query {
    getUserById(id: "365af0e0-ff6b-455e-8606-7084a2f3fd9e") {
    message
    user {
    id
    name
    email
    role
    createdAt
    updatedAt
    isEmailVerified
      }
    }
}
```

**- Get User By Email**
```graphql
query {
    getUserByEmail(email: "jhon@gmail.com") {
    message
    user {
    id
    name
    email
    role
    createdAt
    updatedAt
    isEmailVerified
      }
    }
}
```

**- Create User**
```graphql
mutation {
  createUser(
    name: "khan"
    email: "khan@gmail.com"
    password: "khan#313#"
    role: "user"
    age: 20
    address: "Poland city"
  ) {
      message
      user {
      id
      name
      email
      role
      createdAt
      updatedAt
      isEmailVerified
      }
  }
}
```

**- Update user By Id**
```graphql
mutation {
  updateUserById(
    id: "46dd1400-c3da-48ae-adb6-2ea9844e1057",
    user: {
      name: "doeu",
      email: "doeu@gmail.com",
    }
  ) {
    message
    user {
      id
      name
      email
      role
      age
      address
      createdAt
      updatedAt
      isEmailVerified
    }
  }
}
```

**- Get Users Pagination**
```graphql
query {
    getUsers(search: "user", page: "1", size: "3") {
    message
    currentPage
    totalData
    totalPage
    user {
    id
    name
    email
    role
    createdAt
    updatedAt
    isEmailVerified
      }
    }
}
```

**- Delete User By Id**
```graphql
mutation {
  deleteUserById(
    id: "2baa749b-3a62-421e-a0a1-b4d33358e162",
  ) {
    message
    user {
      id
      name
      email
      role
      age
      address
      createdAt
      updatedAt
      isEmailVerified
    }
  }
}
```


## Script Postman for save Bearer Token

**- Login**
```
const res = pm.response.json();
pm.environment.set("refreshToken", res.data.login.tokens.refresh.token);
pm.environment.set("authToken", res.data.login.tokens.access.token);
```

**- RefreshToken**
```
const res = pm.response.json();
pm.environment.set("refreshToken", res.data.refreshAuthToken.tokens.refresh.token);
pm.environment.set("authToken", res.data.refreshAuthToken.tokens.access.token);
```

**- ForgotPassword**
```
const res = pm.response.json();
pm.environment.set("resetToken", res.data.forgotPassword.tokens);
```

**- SendVerificationEmail**
```
const res = pm.response.json();
pm.environment.set("verifyEmailToken", res.data.sendVerificationEmail.tokens);
```