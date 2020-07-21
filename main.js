import { ToyReact, BaseComponent } from "./ToyReact";

class Square extends BaseComponent {
    constructor(props) {
        super(props)
        this.state = {
            value: null
        }
    }

    render() {
        return (
            <button
                className="square"
                onClick={() => this.setState({ value: 'x' })}
            >
                {this.state.value || ''}
            </button>
        );
    }
}
// this.props.onClick()

class Board extends BaseComponent {
    render() {
        return (
            <div>
                <div className="board-row">
                    {this.renderSquare(0)}
                    {this.renderSquare(1)}
                    {this.renderSquare(2)}
                </div>
                <div className="board-row">
                    {this.renderSquare(3)}
                    {this.renderSquare(4)}
                    {this.renderSquare(5)}
                </div>
                <div className="board-row">
                    {this.renderSquare(6)}
                    {this.renderSquare(7)}
                    {this.renderSquare(8)}
                </div>
            </div>
        );
    }

    renderSquare(i) {
        return <Square value={i} />;
    }
}

const ele = <Board />

ToyReact.render(ele, document.body)

// document.body.appendChild(ele)