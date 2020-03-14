import React, {Component} from 'react';
import "./AutoTextArea.css"

let autoExpand = function (field) {
    field.style.height = 'inherit';
    let computed = window.getComputedStyle(field);
    let btw = parseInt(computed.getPropertyValue('border-top-width'), 10)
    let pt = parseInt(computed.getPropertyValue('padding-top'), 10)
    let pb = parseInt(computed.getPropertyValue('padding-bottom'), 10)
    let bbw = parseInt(computed.getPropertyValue('border-bottom-width'), 10)
    let sh = field.scrollHeight
    console.log({btw, pt, pb, bbw, sh})
    let height = btw + sh + bbw;
    field.style.height = height + 'px';
};

class AutoTextArea extends Component {
    onChange(e) {
        if (e.target.tagName.toLowerCase() !== 'textarea') return;
        autoExpand(e.target);
        this.props.onChange && this.props.onChange(e)
    }

    render() {
        const {required, className, name, placeholder} = this.props
        return (
            <textarea rows={1} className={className} onChange={this.onChange.bind(this)} name={name}
                      placeholder={placeholder} required={required}></textarea>
        );
    }
}

export default AutoTextArea;
