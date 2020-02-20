import React, { Component, Fragment } from 'react'
import AppContext from '../context/AppContext'
import io from 'socket.io-client';

let socket;
    
export default class Whiteboard extends Component {
    static contextType = AppContext;
    
    constructor(props) {
        super(props);

        socket = io('http://localhost:8000');
        this.canvas = React.createRef();
        this.state = {
            users: [],
            drawing: false
        }
    }

    componentDidMount() {
        socket.on('connect', () => {
            console.log('Connected');
            socket.emit('onClientConnect', this.context.name);
        });

        socket.on('initialCanvasLoad', (canvas) => {
            if(canvas == null) return;
            const ctx = this.canvas.current.getContext("2d");
            let imageObj = new Image();
            
            imageObj.src = canvas;
            imageObj.onload = function() {
              ctx.drawImage(this, 0, 0);
            };
        });

        socket.on('disconnect', () => {
            console.log('Disconnected');
            socket.emit('onClientDisconnect', this.context.name);
        });

        socket.on('onDraw', (data) => {
            const context = this.canvas.current.getContext("2d")
            context.beginPath();
            context.arc(data.x, data.y, 7.5, 0, Math.PI * 2, false);
            context.fill();
            context.lineWidth = 5;
            context.strokeStyle = "#00000";
            context.stroke();
        });

        socket.on('onCanvasClear', (data) => {
            const ref = this.canvas.current;
            ref.getContext("2d").clearRect(0, 0, ref.width, ref.height);
        });

        socket.on('onClientConnect', (users) => {
            this.setState({users: [...users]})
        });

        socket.on('onClientDisconnect', (users) => {
            this.setState({users: [...users]})
        });
    }

    draw = (e) => {
        socket.emit('onDraw', {
            x: e.clientX,
            y: e.clientY,
            canvas: [this.canvas.current.toDataURL("image/png")]
        });
    }

    clearCanvas = () => {
        socket.emit('onCanvasClear');
    }
    
    render() {
        return (
            <div className="game">
                <Fragment>
                    <canvas
                        onMouseMove={(e) => {
                            if(this.state.drawing) {
                                this.draw(e)
                            }
                        }}
                        onMouseDown={() =>  this.setState({drawing: true})}
                        onMouseUp={() =>  this.setState({drawing: false})}
                        onClick={(e) => this.draw(e)}
                        onContextMenu={(e) => e.preventDefault()}
                        ref={this.canvas}
                        
                        ></canvas>
                    
                    <button onClick={() => this.clearCanvas()}>Clear</button>
                    <h2>Users:</h2> 
                    <ul>{this.state.users.map((user, index) => <li key={'user'+index}>{user}</li>)}</ul>
                </Fragment>
            </div>
        )
    }
}