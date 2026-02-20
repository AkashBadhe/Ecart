
# Ecart

## Introduction
Ecart is an e-commerce website designed to support multiple stores. It's built with Node.js and enables easy setup and deployment of a multi-store e-commerce platform.

## Prerequisites
Before you begin, ensure you have met the following requirements:
- Node.js version 16.13.0
- pnpm package manager

## Installation
Follow these steps to get your development environment running:

1. **Clone the Project**
   ```bash
   git clone https://github.com/AkashBadhe/Ecart.git
   ```
   
2. **Environment Setup**
   Navigate to the following paths and rename the environment files:
   - Rename `admin\rest\.env.template` to `admin\rest\.env`
   - Rename `api\rest\.env.example` to `api\rest\.env`
   - Rename `shop\.env.template` to `shop\.env`

3. **Install Dependencies**
    Install the necessary modules for each part of the project using pnpm:
   - For the `admin` module:
     ```bash
     cd admin
       pnpm install
     ```
   - For the `api` module:
     ```bash
     cd api
       pnpm install
     ```
   - For the `shop` module:
     ```bash
     cd shop
       pnpm install
     ```

## Running the Application
To start the application, follow these steps for each part of the project:

1. **API Module**
   Navigate to the `/api/rest` directory and execute the following commands:
   ```bash
   # In api/rest directory
   pnpm install
   pnpm start:dev

   # Access the Swagger UI at:
   http://localhost:5050/docs
   ```

2. **Shop Module**
   In the `/shop` folder, run:
   ```bash
  pnpm dev:rest
   ```
