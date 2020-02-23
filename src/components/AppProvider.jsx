import React from 'react';
import AppContext from '../context/AppContext';

class AppProvider extends React.Component {
    state = {
        name: "Guest",
        roomId: '',
        showBoard: false
    };

    render() {
        return (
            <AppContext.Provider
                value={{
                    name: this.state.name,
                    roomId: this.state.roomId,
                    showBoard: this.state.showBoard,
                    setName: (name) => {
                        this.setState({name});
                    },
                    setRoomId: (roomId) => {
                        this.setState({roomId});
                    },
                    toggleShowBoard: () => {
                        this.setState({
                            showBoard: [!this.state.showBoard]
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