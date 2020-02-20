import React, { Component, Fragment } from 'react'
import AppContext from '../context/AppContext'

export default class Welcome extends Component {

    render() {
        return (
            <div className="login">
                <div className="login-container">
                    <header>
                    <h1 className="app-title welcome">Welcome to</h1>
                    <h1 className="app-title draw">Draw Together</h1>
                    </header>
                </div>
                <AppContext.Consumer>
                    {(context) => (
                        <form>
                            <input type="text" name="name" value={context.name} onChange={(e) => context.setName(e.target.value)} placeholder="name"/>
                            <button type="submit" onClick={context.toggleShowBoard}>Join Session</button>
                        </form>
                    )}
                </AppContext.Consumer>
            </div>
        )
    }
}

