# Containerize a static HTML/CSS site with Nginx
FROM nginx:alpine
# Copy all site files into the default Nginx web root
COPY . /usr/share/nginx/html
# Nginx listens on 80 by default
