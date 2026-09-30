# Build the React application inside Docker
FROM node:20-alpine AS builder

WORKDIR /app

COPY . .

RUN yarn install --frozen-lockfile

# Production environment MUST be set before React build
ENV REACT_APP_ENV=prod

RUN yarn build


# Production environment
FROM nginx:latest

COPY --from=builder /app/apps/build-iq-app/build /usr/share/nginx/html

COPY deploy/nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]