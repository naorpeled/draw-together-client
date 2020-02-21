import React, { Component, Fragment } from 'react'
import AppContext from '../context/AppContext'
import io from 'socket.io-client';
import '../styles/global.css';

let socket;
    
export default class Whiteboard extends Component {
    static contextType = AppContext;
    
    constructor(props) {
        super(props);

        socket = io('http://localhost:8000');
        this.canvas = React.createRef();
        this.state = {
            users: [],
            drawing: false,
            color: 'black',
            width: 1
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
            const ref = this.canvas.current;
            ref.getContext("2d").clearRect(0, 0, ref.width, ref.height);
            socket.emit('onClientDisconnect', this.context.name);
        });

        socket.on('onDraw', (data) => {
            const context = this.canvas.current.getContext("2d")
            context.beginPath();
            context.arc(data.x, data.y, 7.5, 0, Math.PI * 2, false);
            context.lineWidth = data.width || this.state.width;
            context.strokeStyle = data.color || this.state.color;
            context.fillStyle = data.color || this.state.color;
            context.fill();
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
            color: this.state.color,
            width: this.state.width,
            canvas: [this.canvas.current.toDataURL("image/png")]
        });
        const context = this.canvas.current.getContext("2d")
        context.beginPath();
        context.arc(e.clientX, e.clientY, 7.5, 0, Math.PI * 2, false);
        context.lineWidth = this.state.width;
        context.strokeStyle = this.state.color;
        context.fillStyle = this.state.color;
        context.fill();
        context.stroke();
    }

    setColor = (color) => {
        this.setState({color});
    }

    setWidth = (e) => {
        const width = e.target.value;
        this.setState({width});
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
                                this.draw(e);
                            }
                        }}
                        onMouseDown={() =>  this.setState({drawing: true})}
                        onMouseUp={() =>  this.setState({drawing: false})}
                        onMouseLeave={() => {this.setState({drawing: false})}}
                        onClick={(e) => this.draw(e)}
                        onContextMenu={(e) => {
                            e.preventDefault();
                            this.draw(e);
                        }}
                        ref={this.canvas}
                    ></canvas>
                    <div className="color blue" onClick={() => this.setColor('blue')}></div>
                    <div className="color red" onClick={() => this.setColor('red')}></div>
                    <div className="color green" onClick={() => this.setColor('green')}></div>
                    <div className="color gray" onClick={() => this.setColor('gray')}></div>
                    <div className="color black" onClick={() => this.setColor('black')}></div>
                    <input type="range" min="1" max="25" value={this.state.width} onChange={(e) => this.setWidth(e)} />
                    {this.state.width}x
                    <button onClick={() => this.clearCanvas()}>Clear</button>
                    <h2>Users:</h2> 
                    <ul>{this.state.users.map((user, index) => <li key={'user'+index}>{user}</li>)}</ul>
                </Fragment>
            </div>
        )
    }
}