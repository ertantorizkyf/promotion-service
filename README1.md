# Promotion Service

## Description
This is an Express.js project that serves as a backend application for handling a promotion redemption case of a online food order app. It provides RESTful API endpoints to view or manage menus, orders, and promotions.

## Features Highlight
- **Promotion**: This feature relates to the management of promotion data as well as applying it to user's order
- **Order**: This feature relates to menu viewing and order creation

## Project Structure
The project is organized as follows:
```
├── configs/ # Contains configuration files (i.e. database configurations)
├── constants/ # Stores constant values to prevent duplication and typos
├── controllers/ # Contains controller that handles incoming request and return responses
├── helpers/ # Includes utility functions and helper methods that can be reusable across the project
├── middlewares/ # Houses middleware functions
├── models/ # Defines the project's data models
├── repositories/ # Contains query related logic
├── routers/ # Manages route definitions
├── tests/ # Contains unit tests
│ └── mocks/ # Stores mock data used by the unit tests
├── .dockerignore # Docker exclusion list 
├── .env # environment variables file
├── .gitignore # Git exclusion list
├── Dockerfile # Docker image specifications
├── erd.puml # ERD visualization using PlantUML
├── index.js # Project entry point
├── jest.config.js # Jest configuration file
├── package.json # Project metadata and dependencies 
└── README.md # Project documentation 
```

## Prerequisites
Before running this project, you need to have the following installed:
- **Node.js**
- **npm**: Node.js package manager
- **MySQL**: Database dialect used in this project
- **PlantUML VSCode Extension (Optional)**: To view erd.puml file defined in this project
- **Docker (Optional)**: To run this project via the docker file

## How to Run the Project
1. **Clone the repository**:
  ```
  git clone https://github.com/ertantorizkyf/promotion-service.git
  ```
2. **Navigate into the project folder**:
  ```
  cd promotion-service
  ```
3. **Install dependencies**:
  ```
  npm install
  ```
4. **Adjust environment variables**:
  - Copy .env.example to .env and modify the values accordingly.
  - Env(s) to keep an eye on:
    - PORT (use port 3000 when if you're running on docker)
    - DB_NAME
    - DB_USER
    - DB_PASS
    - DB_HOST
    - DB_PORT
    - DB_DIALECT (this project is using mysql)
    - JWT_SECRET_KEY
5. **Run the application**:
  - Using npm:
  ```
  npm start
  ```
  - Using docker:
  ```
  docker build -t promotion-service . && docker run --name promotion-service-container -p 3000:3000 -d promotion-service
  ```
6. **The application should now be running (at port 3000 by default)** 

## API Documentation
API Documentation can be viewed under the postman collection file

## License
This project is licensed under the MIT License.

