# Use the official Bun image as a parent image
FROM oven/bun:1

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and bun.lockb (if you have one)
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install --production

# Copy the rest of your app's source code
COPY server ./

# Expose the port your app runs on
EXPOSE 3000

# Run your app
CMD ["bun", "run", "index.ts"]
