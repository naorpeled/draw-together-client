import React, { Component, Fragment } from 'react'
import AppContext from '../context/AppContext'

let socket;

export default class Chat extends Component {
    static contextType = AppContext;

    constructor(props, context) {
        super(props, context);
        socket = context.socket;
        this.state = {
            messages: [],
            currentMessage: ''
        }
    }

    componentDidMount() {
        socket.on('onClientConnect', ({messages}) => {
            if(!messages) return;
            this.setState({messages});
        });

        socket.on('onChatMessage', (data) => {
            this.appendChatMessage(data);
        });
    }

    appendChatMessage(data) {
        let messages = this.state.messages;
        const {author, time, content} = data;

        messages.push({
            author,
            time,
            content
        });
        this.setState({messages});
    }

    sendChatMessage = () => {
        let timestamp = new Date();
        const data = {
            author: this.context.name,
            time: `${timestamp.getHours()}:${timestamp.getMinutes()}`,
            content: this.state.currentMessage
        }
        this.appendChatMessage(data);
        this.setState({currentMessage: ''});
        if(socket.connected) {
            socket.emit('onChatMessage', data);
        }
    }

    render() {
        return (
            <div id="chat">
                <div>
                    {this.state.messages.map((msg, index) => {
                        return (<Fragment key={'message_' + index}>
                                    <p className="chatMessage">
                                        [{msg.time}] {msg.author}: {msg.content}
                                    </p>
                                </Fragment>);
                    })}
                </div>
            <form onSubmit={(e) => {
                e.preventDefault();
                if(this.state.currentMessage) {
                    this.sendChatMessage();
                }
            }}>
                <input 
                type="text"
                onChange={(e) => this.setState({currentMessage: e.target.value})}
                value={this.state.currentMessage}
                placeholder="Enter text here"></input>
            </form>
        </div>
        )
    }
}
