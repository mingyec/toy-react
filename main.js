import { ToyReact, BaseComponent } from "./ToyReact";

class MyComponent extends BaseComponent {
    render() {
        return <div>
            <span>cool</span>
            <div>
                {this.children}
            </div>
        </div>
    }
}

const ele = <MyComponent name="11" id="ida" >
    <span>1111</span>
</MyComponent>

ToyReact.render(ele, document.body)

// document.body.appendChild(ele)