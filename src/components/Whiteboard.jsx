import React, { Component, Fragment } from 'react'
import AppContext from '../context/AppContext'
import io from 'socket.io-client';

const socket = io('http://localhost:8000');
    
export default class GameScreen extends Component {
    constructor(props) {
        super(props);

        this.canvas = React.createRef();

        socket.on('connect', function(){
            console.log('Connected');
        });
        socket.on('disconnect', function(){
            console.log('Disconnected');
        });
    }

    componentDidMount() {
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
    }

    draw = (e) => {
        socket.emit('onDraw', {
            x: e.clientX,
            y: e.clientY
        });

        const context = this.canvas.current.getContext("2d")
        context.beginPath();
        context.arc(e.clientX, e.clientY, 7.5, 0, Math.PI * 2, false);
        context.fill();
        context.lineWidth = 5;
        context.strokeStyle = "#00000";
        context.stroke();
    }

    clearCanvas = () => {
        socket.emit('onCanvasClear');
        const ref = this.canvas.current;
        ref.getContext("2d").clearRect(0, 0, ref.width, ref.height);
    }
    
    render() {
        return (
            <div className="game">
                <AppContext.Consumer>
                    {(context) => (
                       <Fragment>
                            <canvas onMouseMove={(e) => this.draw(e)} ref={this.canvas}></canvas>
                            <button onClick={() => this.clearCanvas()}>Clear</button>
                       </Fragment>
                    )}
                </AppContext.Consumer>
            </div>
        )
    }
}