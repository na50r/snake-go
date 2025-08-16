FROM golang:1.23.10-alpine AS builder
RUN mkdir /build
COPY go.mod go.sum *.go /build/
WORKDIR /build
RUN go build -o bin/snake-go

FROM alpine
COPY --from=builder /build/bin/snake-go /app/
WORKDIR /app
CMD ["./snake-go"]