# Our first stage, that is the Builder
FROM node:14-alpine AS builder
WORKDIR /app
COPY . .
RUN yarn install
RUN yarn run build

# Our Second stage, that creates an image for production
FROM node:14-alpine
WORKDIR /app
COPY --from=builder ./app/dist ./dist
COPY package* ./
RUN yarn install --production
EXPOSE 3000
CMD yarn start