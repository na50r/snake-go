package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
	"math/rand"
	"os"
	"os/signal"
	"syscall"
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
        _, m, err := c.socket.ReadMessage()
        if err != nil {
            return
        }
		var msg Message
        if err := json.Unmarshal(m, &msg); err != nil {
			log.Println("Error unmarshalling message:", err)
            continue
        }
		if msg.Type == "positions" {
			raw := msg.Payload.([]interface{})
			positions := make([]int, len(raw))
			for i, v := range raw {
				positions[i] = int(v.(float64)) 
			}
			c.room.update <- snakeUpdate{c, positions}
		}
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

type Food struct {
	position int
	snakes map[*Client][]int
}

func (f *Food) generate(mapSize int) {
	f.position = rand.Intn(mapSize)
}

func (f *Food) check(snakes map[*Client][]int, eaten chan *Client) {
	for cli, positions := range snakes {
		for _, idx := range positions {
			if idx == f.position {
				eaten <- cli
			}
		}
	}
}


func checkDeath(snakes map[*Client][]int, death chan *Client) {
	for cli, positions := range snakes {
		head := positions[0]
		for other, positions := range snakes {
			if cli == other {
				continue
			}
			for _, idx := range positions {
				if idx == head {
					death <- cli
				}
			}
		}
	}
}

func NewFood() *Food {
	f := &Food{snakes: make(map[*Client][]int),
		}
	f.generate(32 * 32)
	return f
}

type Room struct {
	clients map[*Client]bool
	snakes map[*Client][]int // positions of snakes on map
	join    chan *Client
	leave   chan *Client
	forward chan []byte
	update chan snakeUpdate
	food *Food
	eaten chan *Client
	death chan *Client
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
		food: NewFood(),
		eaten: make(chan *Client),
		death: make(chan *Client),
	}
}

type Delta struct {
	Food int `json:"food"`
	Snakes [][]int `json:"snakes"`
}

func createDelta(snakes map[*Client][]int, food *Food) *Delta {
	snakePositions := make([][]int, len(snakes))
	i := 0
	for _, positions := range snakes {
		snakePositions[i] = positions
		i++
	}
	return &Delta{Food: food.position, Snakes: snakePositions}
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
			go r.food.check(r.snakes, r.eaten)
			go checkDeath(r.snakes, r.death)
            gameMap := createDelta(r.snakes, r.food)
            data, _ := json.Marshal(Message{Type: "map", Payload: gameMap})
			//log.Printf("Sending %d bytes", len(data))
            for cli := range r.clients {
                select {
                case cli.receive <- data:
                default:
                }
            }
		case cli := <-r.eaten:
			log.Printf("Food eaten %v", cli)
			r.food.generate(32 * 32)
			data, _ := json.Marshal(Message{Type: "grow", Payload: nil})
			select {
				case cli.receive <- data:
				default:
			}
		case cli := <-r.death:
			log.Printf("Snake died %v", cli)
			delete(r.snakes, cli)
			data, _ := json.Marshal(Message{Type: "death", Payload: nil})
			select {
				case cli.receive <- data:
				default:
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

type Server struct {
	room *Room
}

func NewServer() *Server {
	s := &Server{room: NewRoom()}
	go s.room.run()
	return s
}



func (s *Server) run() {
	PORT := os.Getenv("PORT")
	if PORT == "" {
		PORT = "8080"
	}
	http.Handle("/ws", s.room)
	log.Println("Server started on port ", PORT)
	err := http.ListenAndServe(":"+PORT, nil)
	if err != nil {
		log.Fatal("ListenAndServe:", err)
	}
}

func main() {
	s := NewServer()
	go s.run()
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)

	<-stop //Wait for stop signal
	log.Println("Shutting down server...")
}