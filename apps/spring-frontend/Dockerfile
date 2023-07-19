#### Stage 1: Build the react application
FROM public.ecr.aws/docker/library/node:erbium-alpine as build

# Configure the main working directory inside the docker image. 
# This is the base directory used in any further RUN, COPY, and ENTRYPOINT 
# commands.
WORKDIR /app

# Copy the package.json as well as the package-lock.json and install 
# the dependencies. This is a separate step so the dependencies 
# will be cached unless changes to one of those two files 
# are made.
COPY package.json package-lock.json ./
RUN npm install

# Copy the main application
COPY . ./

ENV REACT_APP_API_BASE_URL="__API_BASE_URL__"

# Build the application
RUN npm run build

#### Stage 2: Serve the React application from Nginx 
FROM public.ecr.aws/nginx/nginx:1.25-alpine

# Copy the react build from Stage 1
COPY --from=build /app/build /var/www

# Copy our custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf
COPY entrypoint.sh /entrypoint.sh

# Expose port 3000 to the Docker host, so we can access it 
# from the outside.
EXPOSE 80

ENTRYPOINT [ "/entrypoint.sh" ]
CMD ["nginx","-g","daemon off;"]
