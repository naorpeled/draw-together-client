import React from 'react';
import AppContext from '../context/AppContext';
import io from 'socket.io-client';

class AppProvider extends React.Component {
    state = {
        name: "Guest",
        roomId: '',
        showBoard: false,
        socket: null
    };

    render() {
        return (
            <AppContext.Provider
                value={{
                    name: this.state.name,
                    roomId: this.state.roomId,
                    showBoard: this.state.showBoard,
                    socket: this.state.socket,
                    setName: (name) => {
                        this.setState({name});
                    },
                    setRoomId: (roomId) => {
                        this.setState({roomId});
                    },
                    toggleShowBoard: () => {
                        const socket = io(`http://localhost:8000?roomId=${this.state.roomId}`);
                        this.setState({
                            showBoard: [!this.state.showBoard],
                            socket
                        });
                    }
                }}
            >
                {this.props.children}
            </AppContext.Provider>
        );
    }
}

export default AppProvider;