/**
 * 元素节点
 */
class ElementWrapper {
    constructor(type) {
        this.root = document.createElement(type)
    }

    setAttribute(name, value) {
        if (name.match(/^on([\s\S]+)$/)) {
            // 只处理第一个字符，转化为小写
            const eventName = RegExp.$1.replace(/^[\s\S]/, s => s.toLowerCase())
            this.root.addEventListener(eventName, value);
        }
        if (name === 'className') {
            name = 'class';
        }
        this.root.setAttribute(name, value)
    }

    appendChild(vChild) {
        let range = document.createRange()
        if (this.root.children.length) {
            range.setStartAfter(this.root.lastChild)
            range.setEndAfter(this.root.lastChild)
        } else {
            range.setStart(this.root, 0)
            range.setEnd(this.root, 0)
        }

        vChild.mountTo(range)
    }

    /**
     * 
     * @param {Range} range 
     */
    mountTo(range) {
        range.deleteContents()
        range.insertNode(this.root);
        // parent.appendChild(this.root)
    }
}

/**
 * 文本节点
 */
class TextWrapper {
    constructor(content) {
        this.root = document.createTextNode(content)
    }

    mountTo(range) {
        range.deleteContents()
        range.insertNode(this.root);
    }
}

/**
 * 通用组件类
 */
export class BaseComponent {
    constructor() {
        this.children = [];
        this.props = Object.create(null);
    }

    setState(state) {
        const merge = (oldState, newState) => {
            for (const p in newState) {
                if (typeof newState[p] === 'object') {
                    if (typeof oldState[p] !== 'object') {
                        oldState[p] = {}
                    }
                    merge(oldState[p], newState[p])
                } else {
                    oldState[p] = newState[p]
                }
            }
        }

        if (!this.state && state) {
            this.state = {}
        }
        merge(this.state, state);
        this.update()
    }

    /**
     * 设置属性值，如id
     * @param {string} name 
     * @param {string} value 
     */
    setAttribute(name, value) {
        this.props[name] = value
        this[name] = value;
    }

    /**
     * 挂载
     * @param {Range} range
     */
    mountTo(range) {
        this.range = range
        this.update()

        // let range = document.createRange();
        // range.setStartAfter(parent.lastChild)
        // range.setEndAfter(parent.lastChild)
    }

    update() {
        const placeholder = document.createComment('placeholder')
        let range = document.createRange();
        range.setStart(this.range.endContainer, this.range.endOffset)
        range.setEnd(this.range.endContainer, this.range.endOffset)
        range.insertNode(placeholder)
        // 清空
        this.range.deleteContents();
        // 渲染
        const vdom = this.render();
        vdom.mountTo(this.range);

        // placeholder.parentNode.removeChild(placeholder)
    }

    /**
     * 添加子组件
     * @param {VNode} vChild 
     */
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
        let range = document.createRange()
        if (element.children.length) {
            range.setStartAfter(element.lastChild)
            range.setEndAfter(element.lastChild)
        } else {
            range.setStart(element, 0)
            range.setEnd(element, 0)
        }

        vdom.mountTo(range)
    }
}