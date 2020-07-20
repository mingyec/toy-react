class ElementWrapper {
    constructor(type) {
        this.root = document.createElement(type)
    }

    setAttribute(name, value) {
        this.root.setAttribute(name, value)
    }

    appendChild(vChild) {
        vChild.mountTo(this.root)
    }

    mountTo(parent) {
        parent.appendChild(this.root)
    }
}

class TextWrapper {
    constructor(content) {
        this.root = document.createTextNode(content)
    }

    mountTo(parent) {
        parent.appendChild(this.root)
    }
}

export class BaseComponent {
    constructor() {
        this.children = [];
    }
    setAttribute(name, value) {
        this[name] = value;
    }
    mountTo(parent) {
        const vdom = this.render();
        vdom.mountTo(parent);
    }
    appendChild(vChild) {
        this.children.push(vChild)
    }
}

export const ToyReact = {
    createElement: function (type, attrs, ...children) {
        let element;
        if (typeof type === 'string') {
            element = new ElementWrapper(type)
        } else {
            element = new type
        }
        // 创建dom
        // const ele = document.createElement(type);
        // 附加属性 attribute
        for (const key in attrs) {
            element.setAttribute(key, attrs[key]);
        }
        // 附加子节点
        let insertChildren = children => {
            for (let child of children) {
                if (typeof child === 'object' && child instanceof Array) {
                    insertChildren(child)
                } else {
                    if (!(child instanceof BaseComponent)
                        && !(child instanceof ElementWrapper)
                        && !(child instanceof TextWrapper)) {
                        child = String(child);
                    }
                    // 处理文本节点
                    if (typeof child === 'string') {
                        child = new TextWrapper(child)
                    }
                    element.appendChild(child);
                }
            }
        }
        insertChildren(children)
        return element;
    },
    render(vdom, element) {
        vdom.mountTo(element)
    }
}