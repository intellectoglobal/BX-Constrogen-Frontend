# production environment
FROM nginx:latest

# Set the environment variable here
ARG REACT_APP_ENV
ENV REACT_APP_ENV=prod

COPY apps/build-iq-app/build /usr/share/nginx/html

# If you are using react-router, uncomment below line
COPY deploy/nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
