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
        socket.on('onClientConnect', (data) => {
            if(data instanceof Array) {
                this.setState({messages: data});
                return;
            }
            this.appendChatMessage(`A user named ${data} has joined!`, true);
        });

        socket.on('onChatMessage', (data) => {
            this.appendChatMessage(data);
        });
    }

    appendChatMessage(data, isAnnouncement = false) {
        let messages = this.state.messages;
        if(isAnnouncement) {
            messages.push({
                content: data
            });
        } else {
            const {author, time, content} = data;
            messages.push({
                author,
                time,
                content
            });
        }
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
                                        {msg.time && msg.author && (`[${msg.time}] ${msg.author}:`)} {msg.content}
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
