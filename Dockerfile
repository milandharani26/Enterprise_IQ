# BUILD STAGE
FROM node:20-alpine AS builder

WORKDIR /app

# Copy the package files to install dependencies
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY enterpriseiq-frontend/package*.json ./enterpriseiq-frontend/

# Install all dependencies (we use npm i --legacy-peer-deps to avoid strict peer dependency conflicts)
RUN npm install
RUN npm install --prefix backend
RUN npm install --prefix enterpriseiq-frontend

# Copy the rest of the application code
COPY . .

# Build the Next.js frontend (static export) and NestJS backend
# (This matches the npm run build command in the root package.json)
RUN npm run build

# PRODUCTION STAGE
FROM node:20-alpine AS production

WORKDIR /app

# We only need the backend folder since it serves the static frontend
COPY --from=builder /app/backend/package*.json ./backend/
COPY --from=builder /app/package.json ./

# Install ONLY production dependencies in the backend
WORKDIR /app/backend
RUN npm install --omit=dev

# Copy the built NestJS code
COPY --from=builder /app/backend/dist ./dist

# Copy the statically exported Next.js frontend to where NestJS expects it
# NestJS is configured to serve from 'enterpriseiq-frontend/out' relative to the dist folder (which resolves to /app/enterpriseiq-frontend/out)
WORKDIR /app
COPY --from=builder /app/enterpriseiq-frontend/out ./enterpriseiq-frontend/out

# Switch back to backend to run the server
WORKDIR /app/backend

# Set production environment
ENV NODE_ENV=production
ENV PORT=4000

# Expose the unified server port
EXPOSE 4000

# Start the NestJS backend
CMD ["node", "dist/main.js"]
