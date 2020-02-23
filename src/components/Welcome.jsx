import React, { Component, Fragment } from 'react'
import AppContext from '../context/AppContext'

export default class Welcome extends Component {

    constructor() {
        super();

        this.state = {
            error: null
        };
    }

    render() {
        return (
            <div className="login">
                <div className="login-container">
                    <header>
                    <h1 className="app-title welcome">Welcome to</h1>
                    <h1 className="app-title draw">Draw Together</h1>
                    </header>
                    {this.state.error}
                </div>
                <AppContext.Consumer>
                    {(context) => (
                        <form>
                            <input type="text" name="name" value={context.name} onChange={(e) => context.setName(e.target.value)} placeholder="name"/>
                            <input type="text" name="roomId" value={context.roomId} onChange={(e) => context.setRoomId(e.target.value)} placeholder="Room ID"/>
                            <button type="submit" onClick={(e) => {
                            e.preventDefault();
                            if(context.name && context.roomId) {
                                context.toggleShowBoard();
                                return;
                            } 
                            this.setState({error: 'Missing name/roomId'});
                            }}>Join Session</button>
                        </form>
                    )}
                </AppContext.Consumer>
            </div>
        )
    }
}

