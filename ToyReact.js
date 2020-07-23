let childrenSymbol = Symbol('children')

/**
 * 元素节点
 */
class ElementWrapper {
    constructor(type) {
        // this.root = document.createElement(type)
        this.type = type;
        this.props = Object.create(null)
        this[childrenSymbol] = []
        this.children = []
    }

    setAttribute(name, value) {
        // if (name.match(/^on([\s\S]+)$/)) {
        //     // 只处理第一个字符，转化为小写
        //     const eventName = RegExp.$1.replace(/^[\s\S]/, s => s.toLowerCase())
        //     this.root.addEventListener(eventName, value);
        // }
        // if (name === 'className') {
        //     name = 'class';
        // }
        // this.root.setAttribute(name, value)
        this.props[name] = value
    }

    appendChild(vChild) {
        this[childrenSymbol].push(vChild)
        this.children.push(vChild.vdom)
        // let range = document.createRange()
        // if (this.root.children.length) {
        //     range.setStartAfter(this.root.lastChild)
        //     range.setEndAfter(this.root.lastChild)
        // } else {
        //     range.setStart(this.root, 0)
        //     range.setEnd(this.root, 0)
        // }

        // vChild.mountTo(range)
    }

    // get children() {
    //     return this[childrenSymbol].map(child => child.vdom);
    // }

    get vdom() {
        return this
        // const vdomChildren = this.children.map(child => child.vdom);
        // return {
        //     type: this.type,
        //     props: this.props,
        //     children: vdomChildren
        // }
    }

    /**
     * 
     * @param {Range} range 
     */
    mountTo(range) {
        this.range = range
        let placeholder = document.createComment('placeHolder')
        let endRange = document.createRange();
        endRange.setStart(range.endContainer, range.endOffset);
        endRange.setEnd(range.endContainer, range.endOffset)
        endRange.insertNode(placeholder)
        // if (this.root.children.length) {
        //     range.setStartAfter(this.root.lastChild)
        //     range.setEndAfter(this.root.lastChild)
        // } else {
        //     range.setStart(this.root, 0)
        //     range.setEnd(this.root, 0)
        // }
        // 清空
        range.deleteContents()

        // 创建实dom
        let element = document.createElement(this.type);
        for (let name in this.props) {
            const value = this.props[name];
            if (name.match(/^on([\s\S]+)$/)) {
                // 只处理第一个字符，转化为小写
                const eventName = RegExp.$1.replace(/^[\s\S]/, s => s.toLowerCase())
                element.addEventListener(eventName, value);
            }
            if (name === 'className') {
                name = 'class';
            }
            element.setAttribute(name, value)
        }

        for (const child of this.children) {
            let range = document.createRange()
            if (element.children.length) {
                range.setStartAfter(element.lastChild)
                range.setEndAfter(element.lastChild)
            } else {
                range.setStart(element, 0)
                range.setEnd(element, 0)
            }
            child.mountTo(range)
        }

        range.insertNode(element);
    }
}

/**
 * 文本节点
 */
class TextWrapper {
    constructor(content) {
        this.root = document.createTextNode(content)
        this.type = '#text';
        this.children = []
        this.props = Object.create(null)
    }

    get vdom() {
        return this
        // return {
        //     type: '#text',
        //     props: this.props,
        //     children: []
        // }
    }

    mountTo(range) {
        this.range = range
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

    get type() {
        return this.constructor.name;
    }

    setState(state) {
        const merge = (oldState, newState) => {
            for (const p in newState) {
                if (typeof newState[p] === 'object' && newState[p] !== null) {
                    if (typeof oldState[p] !== 'object') {
                        if (newState[p] instanceof Array) {
                            oldState[p] = []
                        } else {
                            oldState[p] = {}
                        }
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
        // 渲染
        const vdom = this.vdom;
        if (this.oldVdom) {
            // 对比vdom
            const isSameNode = (node1, node2) => {
                if (node1.type !== node2.type) {
                    return false;
                }
                for (let name in node1.props) {
                    // if (typeof node1.props[name] === 'function'
                    //     && typeof node2.props[name] == 'function'
                    //     && node1.props[name].toString() === node2.props[name].toString()) {
                    //     continue
                    // }
                    if (typeof node1.props[name] === 'object'
                        && typeof node2.props[name] == 'object'
                        && JSON.stringify(node1.props[name]) === JSON.stringify(node2.props[name])) {
                        continue
                    }
                    if (node1.props[name] !== node2.props[name]) {
                        return false
                    }
                }
                if (Object.keys(node1.props).length !== Object.keys(node2.props).length) {
                    return false
                }
                return true
            }

            const isSameTree = (node1, node2) => {
                if (!isSameNode(node1, node2)) {
                    return false
                }
                if (node1.children.length !== node2.children.length) {
                    return false
                }

                for (let i = 0; i < node1.children.length; i++) {
                    if (!isSameTree(node1.children[i], node2.children[i])) {
                        return false
                    }
                }
                return true
            }

            const replace = (newTree, oldTree, depth) => {
                console.info('new dom' + depth, newTree)
                console.info('old dom' + depth, oldTree)
                if (isSameTree(newTree, oldTree)) {
                    return
                }
                if (!isSameNode(newTree, oldTree)) {
                    // 根节点不同直接replace
                    newTree.mountTo(oldTree.range);
                } else {
                    for (let i = 0; i < newTree.children.length; i++) {
                        replace(newTree.children[i], oldTree.children[i], '  ' + depth)
                    }
                }
            }

            // console.info('new dom', vdom)
            // console.info('old dom', this.vdom)

            replace(vdom, this.oldVdom, '')
        } else {
            vdom.mountTo(this.range);
        }
        // this.vdom = vdom;
        this.oldVdom = vdom;

        // placeholder.parentNode.removeChild(placeholder)
    }

    get vdom() {
        return this.render().vdom;
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
                    if (!child && child !== 0) {
                        child = ''
                    }
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