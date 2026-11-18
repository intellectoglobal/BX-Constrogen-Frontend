# Build the React application inside Docker
FROM --platform=$BUILDPLATFORM node:20-alpine AS builder

WORKDIR /app

COPY . .

RUN yarn install --frozen-lockfile --network-timeout 600000 --network-concurrency 4

# Select the application environment before building React.
ARG REACT_APP_ENV=prod
ENV REACT_APP_ENV=${REACT_APP_ENV}

RUN yarn build


# Production environment
FROM nginx:latest

COPY --from=builder /app/apps/build-iq-app/build /usr/share/nginx/html

COPY deploy/nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
