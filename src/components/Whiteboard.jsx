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
            width: 2,
            cursor: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAk0lEQVQ4T+3TOwoCMRAA0LcI/iqtrL2i3sNmz2hhpZU/EGQghaDZJRqw2YF0mZfJZNKoHE1lzwD+3tG+Hs4wSStOu6V1yR3dBQa2zCQe8RHtAgMLdIMt7mixS1igb9EFrjDC/iUr0DUeOPwdXGCeufIZp9IKqz9KFBDoFONUTfTwmnvh2NM3h8WTPoDFLSv6KV/pT8I/HBXoS+DqAAAAAElFTkSuQmCC'
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
            const ctx = this.canvas.current.getContext("2d");
            this.drawCircle(ctx, data);
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
        const data = {
            x: e.clientX,
            y: e.clientY,
            color: this.state.color,
            width: this.state.width,
            canvas: [this.canvas.current.toDataURL("image/png")]
        };
        const ctx = this.canvas.current.getContext("2d");
        this.drawCircle(ctx, data);
        socket.emit('onDraw', data);
    }


    drawCircle = (context, data) => {
        context.beginPath();
        context.arc(data.x, data.y, data.width, 0, Math.PI * 2, false);
        context.lineWidth = data.width*2;
        context.strokeStyle = data.color;
        context.fillStyle = data.color;
        context.fill();
        context.stroke();
    }

    getNewCursorDataURL = (width, color) => {
        const image = document.createElement("canvas");
        image.height = image.width = width * 10;
        const ctx = image.getContext("2d"); 
        ctx.beginPath();
        ctx.arc(image.width/2, image.height/2, width, 0,  360);
        ctx.lineWidth = width*2;
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.fill();
        ctx.globalAlpha = 0.1;
        ctx.stroke();
        ctx.globalAlpha = 1.0;
        return image.toDataURL("image/png");
    }

    setColor = (color) => {
        const cursor = this.getNewCursorDataURL(this.state.width, color);
        this.setState({color, cursor});
    }

    setWidth = (e) => {
        const width = e.target.value;
        const cursor = this.getNewCursorDataURL(width, this.state.color);
        this.setState({width, cursor});
    }

    clearCanvas = () => {
        ref.getContext("2d").clearRect(0, 0, ref.width, ref.height);
        socket.emit('onCanvasClear');
    }
    
    render() {
        return (
            <div className="game">
                <Fragment>
                    <canvas
                        style={{ cursor: `url(${this.state.cursor}) ${(this.state.width * 5) - 7.5} ${(this.state.width * 5) - 7.5}, auto`}}
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
                    <input type="range" min="2" max="10" value={this.state.width} onChange={(e) => this.setWidth(e)} />
                    <button onClick={() => this.clearCanvas()}>Clear</button>
                    <h2>Users:</h2> 
                    <ul>{this.state.users.map((user, index) => <li key={'user'+index}>{user}</li>)}</ul>
                </Fragment>
            </div>
        )
    }
}