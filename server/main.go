package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

type Message struct {
	Type string `json:"type"`
	Payload interface{} `json:"payload"`
}

type Client struct {
	socket  *websocket.Conn
	receive chan []byte
	room    *Room
}

func (c *Client) read() {
    defer c.socket.Close()
    for {
        _, msg, err := c.socket.ReadMessage()
        if err != nil {
            return
        }
        var positions []int
        if err := json.Unmarshal(msg, &positions); err != nil {
            continue
        }
        c.room.update <- snakeUpdate{client: c, body: positions}
    }
}

func (c *Client) write() {
	defer c.socket.Close()
	for msg := range c.receive {
		err := c.socket.WriteMessage(1, msg)
		if err != nil {
			return
		}
	}
}

type Room struct {
	clients map[*Client]bool
	snakes map[*Client][]int // positions of snakes on map
	join    chan *Client
	leave   chan *Client
	forward chan []byte
	update chan snakeUpdate
}

type snakeUpdate struct {
	client *Client
	body []int
}

func NewRoom() *Room {
	return &Room{
		clients: make(map[*Client]bool),
		join:    make(chan *Client),
		leave:   make(chan *Client),
		forward: make(chan []byte),
		snakes: make(map[*Client][]int),
		update: make(chan snakeUpdate),
	}
}

func drawMap(snakes map[*Client][]int) []int {
	gameMap := make([]int, 32 * 32)
	for _, positions := range snakes {
		for _, idx := range positions {
			if idx >= 0 && idx < len(gameMap) {
				gameMap[idx] = 1
			}
		}
	}
	log.Println(gameMap)
	return gameMap
}

func (r *Room) run() {
    for {
        select {
        case cli := <-r.join:
			log.Println("New client joined")
            r.clients[cli] = true

        case cli := <-r.leave:
			log.Println("Client left")
            delete(r.clients, cli)
            delete(r.snakes, cli)
            close(cli.receive)

        case upd := <-r.update:
            r.snakes[upd.client] = upd.body
            gameMap := drawMap(r.snakes)
            data, _ := json.Marshal(Message{Type: "map", Payload: gameMap})
            for cli := range r.clients {
                select {
                case cli.receive <- data:
                default:
                }
            }
        }
    }
}


var upgrader = &websocket.Upgrader{
	ReadBufferSize: 1024, 
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool { return true },
}

func (r *Room) ServeHTTP(w http.ResponseWriter, req *http.Request) {
	//handler that maintains the websocket connection
	socket, err := upgrader.Upgrade(w, req, nil)
	if err != nil {
		log.Fatal("ServeHTTP:", err)
		return
	}
	client := &Client{
		socket: socket, 
		receive: make(chan []byte, 1024), 
		room: r}
	r.join <- client
	defer func() { r.leave <- client }()
	go client.write()
	client.read()
}


func main() {
	r := NewRoom()
	go r.run()
	http.Handle("/ws", r)
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal("ListenAndServe:", err)
	}
}