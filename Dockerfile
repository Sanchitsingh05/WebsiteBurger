# Use official Nginx image as base
FROM nginx:alpine
 
# Remove default Nginx static files
RUN rm -rf /usr/share/nginx/html/*
 
# Copy your website files into Nginx html folder
COPY . /usr/share/nginx/html
 
# Expose port 80 to access website
EXPOSE 80
 
# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
