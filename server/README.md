# Server
To generate Go code with protobuf:
```
protoc --go_out=. --go_opt=paths=source_relative models/types.proto
```