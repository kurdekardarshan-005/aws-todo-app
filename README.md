# AWS Full-Stack To-Do App (Node.js + Docker + RDS + ECS)

This is an end-to-end project demonstrating a full-stack Node.js application deployed in a modern, serverless cloud environment.

The application is a simple to-do list with an HTML/CSS/JS frontend and an Express.js backend. It's containerized with Docker, pushed to ECR, and deployed on **AWS ECS Fargate**. All data is stored persistently in an **AWS RDS** PostgreSQL database.

This project covers the complete cloud-native workflow, from application code to a live, publicly accessible, and scalable service.

## Core Technologies

* **Application:** Node.js, Express.js
* **Database:** AWS RDS (PostgreSQL)
* **Containerization:** Docker
* **Container Registry:** AWS ECR (Elastic Container Registry)
* **Deployment:** AWS ECS (Elastic Container Service) with Fargate

---

## How to Run This Project

There are two ways to run this application: locally with Docker (connected to your own database) or fully deployed on AWS.

### 1. Running Locally with Docker

This method is for testing on your local machine. You will need a PostgreSQL database accessible to your computer (either running locally or a cloud-based one).

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/aws-todo-app.git](https://github.com/your-username/aws-todo-app.git)
    cd aws-todo-app
    ```

2.  **Create `.gitignore`:**
    (If you haven't already, to exclude `node_modules`)
    ```bash
    echo "node_modules/" > .gitignore
    ```

3.  **Build the Docker image:**
    From the project's root directory, run:
    ```bash
    docker build -t my-todo-app .
    ```

4.  **Run the container:**
    You must provide your database credentials as environment variables (`-e`) when you run the container.
    ```bash
    docker run -d -p 3000:3000 --name todo-app \
      -e PGHOST='your-db-host.com' \
      -e PGUSER='your-db-user' \
      -e PGPASSWORD='your-db-password' \
      -e PGDATABASE='your-db-name' \
      -e PGPORT='5432' \
      my-todo-app
    ```

5.  **Access the app:**
    Open your browser and go to `http://localhost:3000`.

### 2. Full End-to-End AWS Deployment (The Project Journey)

This is a high-level summary of the steps taken to deploy this application on AWS.

1.  **Phase 1: Build & Push Docker Image to ECR**
    * Build the image: `docker build -t full-todo-app .`
    * Create a private ECR repository (e.g., `mytodoapp/myfirstrepo`).
    * Authenticate Docker to ECR: `aws ecr get-login-password...`
    * Tag the image: `docker tag full-todo-app:latest <your-aws-id>.dkr.ecr.ap-south-1.amazonaws.com/mytodoapp/myfirstrepo:latest`
    * Push the image: `docker push <your-aws-id>...`

2.  **Phase 2: Create the RDS Database**
    * Launch an AWS RDS instance using the **PostgreSQL** engine.
    * Select the **Free tier** template.
    * Set the **Master username** and **password**.
    * Set **Public access** to **No**.
    * Note the database **endpoint** (host) and its **VPC Security Group**.

3.  **Phase 3: Deploy with ECS Fargate**
    * Create an **ECS Cluster** using the **AWS Fargate** (serverless) infrastructure.
    * Create an **ECS Task Definition** (`todo-app-task`).
        * Point the container **Image URI** to your ECR image.
        * Add **Port Mappings** for container port `3000`.
        * Add all **Environment Variables** (`PGHOST`, `PGUSER`, `PGPASSWORD`, etc.) with your RDS database details.
    * Create an **ECS Service** (`todo-app-service`).
        * Select your cluster and task definition.
        * In "Networking," enable **Public IP**.
        * Create a **new Security Group** for the app (e.g., `todo-app-sg`).

4.  **Phase 4: Configure Security Groups (The "Firewalls")**
    This is the most critical step for making the app work. Two firewalls must be configured.

    * **A) Allow Browser Access (In the *ECS Task's* Security Group):**
        * Find your ECS task's security group (`todo-app-sg`).
        * Add an **Inbound Rule** to allow traffic *to* your app:
            * **Type:** `Custom TCP`
            * **Port:** `3000`
            * **Source:** `Anywhere (0.0.0.0/0)`

    * **B) Allow Database Access (In the *RDS* Security Group):**
        * Find your RDS database's security group.
        * Add an **Inbound Rule** to allow connections *from* your app:
            * **Type:** `PostgreSQL`
            * **Port:** `5432`
            * **Source:** Your **ECS Task's Security Group** (`todo-app-sg`).
