import React, { Component, Fragment } from 'react'
import AppContext from '../context/AppContext'
import Chat from './Chat';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashAlt  } from '@fortawesome/free-solid-svg-icons';

let socket;

export default class Whiteboard extends Component {
    static contextType = AppContext;
    
    constructor(props, context) {
        super(props, context);

        socket = this.context.socket;
        this.canvas = React.createRef();
        this.whiteboard = React.createRef();
        this.state = {
            users: [],
            drawing: false,
            color: 'black',
            width: 2,
            cursor: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAk0lEQVQ4T+3TOwoCMRAA0LcI/iqtrL2i3sNmz2hhpZU/EGQghaDZJRqw2YF0mZfJZNKoHE1lzwD+3tG+Hs4wSStOu6V1yR3dBQa2zCQe8RHtAgMLdIMt7mixS1igb9EFrjDC/iUr0DUeOPwdXGCeufIZp9IKqz9KFBDoFONUTfTwmnvh2NM3h8WTPoDFLSv6KV/pT8I/HBXoS+DqAAAAAElFTkSuQmCC'
        }
        this.current = {};
    }

    componentDidMount() {
        const canvas = this.canvas.current;
        const prevWidth = canvas.clientWidth;
        const prevHeight = canvas.clientHeight;

        window.addEventListener('resize', (e) => {
            const data = { prevWidth, prevHeight };
            socket.emit('onClientRescale', data);
        });

        socket.on('connect', () => {
            console.log('Connected');
            socket.emit('onClientConnect', this.context.name);
        });

        socket.on('onClientConnect', ({users}) => {

            let userArr = [];
            for(let user of users) {
                userArr.push(user.name);
            }
            this.setState({users: userArr});
        });

        socket.on('initialCanvasLoad', (canvas) => {
            const currentCanvas = this.canvas.current;
            const ctx = currentCanvas.getContext("2d");

            ctx.canvas.width = currentCanvas.clientWidth;
            ctx.canvas.height = currentCanvas.clientHeight;

            let imageObj = new Image();
            imageObj.src = canvas;
            imageObj.onload = function() {
              ctx.drawImage(this, 0, 0);
            };
        });

        socket.on('onDraw', (data) => {
            const ctx = this.canvas.current.getContext("2d");
            this.drawLine(ctx, data);
        });

        socket.on('onCanvasClear', (data) => {
            const ref = this.canvas.current;
            ref.getContext("2d").clearRect(0, 0, ref.width, ref.height);
        });

        socket.on('onClientRescale', (data) => {
            const canvas = this.canvas.current;
            // const currentWidth = canvas.clientWidth;
            // const currentHeight = canvas.clientHeight;
            // const {prevWidth, prevHeight} = data;
            // const scaleX = prevWidth > currentWidth ? currentWidth/prevWidth : prevWidth/currentWidth;
            // const scaleY = prevHeight > currentHeight ? currentHeight/prevHeight : prevHeight/currentHeight;
            const ctx = canvas.getContext("2d");
            ctx.canvas.width  = canvas.clientWidth;
            ctx.canvas.height = canvas.clientHeight;
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;

            let imageObj = new Image();

            imageObj.src = data.canvas;
            imageObj.onload = function() {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(this, 0, 0);
            };
        });

        socket.on('onClientDisconnect', (users) => {
            let userArr = [];
            for(let user of users) {
                userArr.push(user.name);
            }
            this.setState({users: userArr});
        });

        socket.on('disconnect', () => {
            console.log('Disconnected');
            document.location = '/';
        });
    }

    componentWillUnmount() {
        window.removeEventListener('resize');
    }

    draw = (e, to = {}) => {
        const data = {
            x: e.clientX,
            y: e.clientY,
            color: this.state.color,
            width: this.state.width,
            toX: to.x || null,
            toY: to.y || null,
            canvas: this.canvas.current.toDataURL("image/png")
        };

        const ctx = this.canvas.current.getContext("2d");
        this.drawLine(ctx, data);

        socket.emit('onDraw', data);
    }

    // Canvas utilities

    drawLine = (context, data) => {
        context.beginPath();
        const widthGap = ((window.innerWidth - this.whiteboard.current.clientWidth) / 2);
        // const heightGap = ((window.innerHeight - this.whiteboard.current.clientHeight) / 2);
        const heightGap = 200;
        let {x, y, toX, toY, color, width} = data;
        x -= widthGap;
        y -= heightGap;

        if(toX != null && toY != null) {
            toX -= widthGap;
            toY -= heightGap;
        }

        // Set line coordinates
        context.moveTo(x, y);
        context.lineTo(toX || x, toY || y);
        // Set line shape
        context.lineJoin="round";
        context.lineCap="round";
        // Set line width and style
        context.lineWidth = width*2;
        context.strokeStyle = color;
        context.fillStyle = color;
        // Draw line
        context.fill();
        context.stroke();
        context.closePath();
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
        const ref = this.canvas.current;
        ref.getContext("2d").clearRect(0, 0, ref.width, ref.height);
        socket.emit('onCanvasClear');
    }

    render() {
        return (
            <div ref={this.whiteboard} id="whiteboard">
                <Fragment>
                    <main>
                        <canvas
                            style={{ cursor: `url(${this.state.cursor}) ${(this.state.width * 7.5)} ${(this.state.width * 7.5)}, auto`}}
                            onMouseMove={(e) => {
                                if(this.state.drawing) {
                                    this.draw(e, this.current);
                                    this.current = {x: e.clientX, y: e.clientY};
                                }
                            }}
                            onMouseDown={() =>  this.setState({drawing: true})}
                            onMouseUp={() => {
                                this.setState({drawing: false});
                                this.current = {};
                            }}
                            onMouseLeave={() => {
                                this.setState({drawing: false});
                                this.current = {};
                            }}
                            onClick={(e) => this.draw(e)}
                            onContextMenu={(e) => {
                                e.preventDefault();
                                this.draw(e);
                            }}
                            ref={this.canvas}
                        ></canvas>
                    </main>
                    <aside>
                        {/* <h2>Users:</h2> 
                        <ul>{this.state.users.map((user, index) => <li key={'user'+index}>{user}</li>)}</ul> */}
                        <Chat />
                    </aside>
                    <footer>
                        <div className="color blue" onClick={() => this.setColor('blue')}></div>
                        <div className="color red" onClick={() => this.setColor('red')}></div>
                        <div className="color green" onClick={() => this.setColor('green')}></div>
                        <div className="color gray" onClick={() => this.setColor('gray')}></div>
                        <div className="color black" onClick={() => this.setColor('black')}></div>
                        <input type="range" min="2" max="10" value={this.state.width} onChange={(e) => this.setWidth(e)} />
                        <div className="color clear" onClick={() => this.clearCanvas()}>                  <FontAwesomeIcon
                        color="gray"
                        icon={faTrashAlt}
                        ></FontAwesomeIcon></div>
                    </footer>
                </Fragment>
            </div>
        )
    }
}