import React, { Component, Fragment } from 'react'
import AppContext from '../context/AppContext'
import io from 'socket.io-client';

const socket = io('http://localhost:8000');
    
export default class GameScreen extends Component {
    constructor(props) {
        super(props);

        socket.on('connect', function(){
            console.log('Connected');
        });
        socket.on('disconnect', function(){
            console.log('Disconnected');
        });
    }

    render() {
        return (
            <div className="game">
                <AppContext.Consumer>
                    {(context) => (
                       <Fragment>
                            
                       </Fragment>
                    )}
                </AppContext.Consumer>
            </div>
        )
    }
}


