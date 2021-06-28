# Our first stage, that is the Builder
FROM node:14-alpine AS builder
WORKDIR /app
COPY . .
RUN yarn install
RUN yarn db:generate
RUN yarn run build

# Our Second stage, that creates an image for production
FROM node:14-alpine
WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY package* ./
#workaround for GitHub actions
RUN true
COPY yarn.lock ./
RUN yarn install --production
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/.bin ./node_modules/.bin
EXPOSE 3000
CMD yarn start