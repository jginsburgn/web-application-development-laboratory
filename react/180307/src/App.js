import React, { Component } from 'react';
import './App.css';

class App extends Component {
  static defaultProps = {
    memeURL: "meme.jpg"
  }
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
  }
  componentWillMount() {
    this.setState({
      buttonLabel: "hide",
      visibilityClass: ""
    });
  }
  toggle() {
    console.log(arguments);
    this.setState(prevState => ({
      buttonLabel: prevState.buttonLabel === "show" ? "hide" : "show",
      visibilityClass: prevState.visibilityClass === "hidden" ? "" : "hidden"
    }))
  }
  render() {
    return (
      <div className="App">
        <button onClick={this.toggle}>{this.state.buttonLabel}</button>
        <br />
        <img src={this.props.memeURL} className={this.state.visibilityClass} alt="logo" />
      </div>
    );
  }
}

export default App;
